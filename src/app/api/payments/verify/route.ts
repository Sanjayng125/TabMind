import { createClient as createAdminClient } from '@supabase/supabase-js'
import Cashfree from '@/lib/cashfree'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data } = await supabase.from('orders').select('*').eq('user_id', user.id).eq('status', 'pending').single()

        if (!data || !data.cashfree_order_id) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        const orderId = data.cashfree_order_id

        // Verify with Cashfree
        const response = await Cashfree.PGFetchOrder(orderId)

        if (response.status !== 200) return NextResponse.json({ error: 'Failed to verify order' }, { status: 500 })

        const order = response.data

        if (order?.order_status === 'ACTIVE') {
            return NextResponse.json({ success: true, isPending: true })
        }

        const { data: dbOrder } = await adminSupabase
            .from('orders')
            .select('user_id, status')
            .eq('cashfree_order_id', orderId)
            .single()

        if (!dbOrder || dbOrder?.status !== "pending") {
            return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
        }

        if (order?.order_status === 'PAID') {
            await adminSupabase
                .from('profiles')
                .update({ plan: 'pro', tabs_limit: 1000, collections_limit: 100, is_ordered: false })
                .eq('id', dbOrder.user_id)

            await adminSupabase
                .from('orders')
                .update({ status: 'paid' })
                .eq('cashfree_order_id', orderId)

            return NextResponse.json({ success: true })
        }

        // Payment failed, timed out or terminated
        await adminSupabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('cashfree_order_id', orderId)

        await adminSupabase
            .from('profiles')
            .update({ is_ordered: false })
            .eq('id', user.id)

        return NextResponse.json({ success: false, error: 'Payment failed. Please try again.' })
    } catch (err) {
        console.error('Verify error:', err)
        return NextResponse.json(
            { error: 'Something went wrong while verifying payment' },
            { status: 500 }
        )
    }
}