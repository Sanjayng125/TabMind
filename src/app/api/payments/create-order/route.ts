import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import Cashfree from '@/lib/cashfree'
import { NextResponse } from 'next/server'

const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (profile?.plan === 'pro') {
            return NextResponse.json(
                { error: 'You are already on the Pro plan' },
                { status: 400 }
            )
        }

        const orderId = `tabmind_${user.id}_${Date.now()}`

        const orderData = {
            order_id: orderId,
            order_amount: 299,
            order_currency: 'INR',
            customer_details: {
                customer_id: user.id,
                customer_email: user.email!,
                customer_phone: '9999999999', // Cashfree requires this — placeholder is fine. you should implement it in production
                customer_name: user.user_metadata?.full_name ?? 'TabMind User',
            },
            order_meta: {
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
                notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
            },
            order_note: 'TabMind Pro — Lifetime Access',
        }

        const response = await Cashfree.PGCreateOrder(orderData)

        if (response.status !== 200) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })

        const order = response.data

        const { error: orderError } = await adminSupabase.from('orders').insert({
            user_id: user.id,
            cashfree_order_id: orderId,
            amount: 299,
            status: 'pending',
        })

        if (orderError) {
            console.error('Failed to create order on supabase:', orderError)
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
        }

        const { error: profileError } = await adminSupabase
            .from('profiles')
            .update({ is_ordered: true })
            .eq('id', user.id)

        if (profileError) {
            await supabase.from('orders').delete().eq('id', orderId)
            return NextResponse.json({ error: 'Order Failed because of profile update error. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({
            orderId: order.order_id,
            paymentSessionId: order.payment_session_id,
        })
    } catch (err) {
        console.error('Create order error:', err)
        return NextResponse.json(
            { error: 'Something went wrong while creating your order' },
            { status: 500 }
        )
    }
}