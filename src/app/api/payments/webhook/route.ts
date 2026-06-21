import { createClient as createAdminClient } from '@supabase/supabase-js'
import Cashfree from '@/lib/cashfree'
import { NextResponse } from 'next/server'

const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const rawBody = await req.text()
        const signature = req.headers.get('x-webhook-signature') ?? ''
        const timestamp = req.headers.get('x-webhook-timestamp') ?? ''

        // Verify webhook signature
        const isValid = Cashfree.PGVerifyWebhookSignature(
            signature,
            rawBody,
            timestamp
        )

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const payload = JSON.parse(rawBody)
        const { type, data } = payload

        if (!data?.order?.order_id?.startsWith('tabmind_')) {
            return NextResponse.json({ received: true })
        }

        if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
            const orderId = data.order.order_id

            const { data: dbOrder } = await adminSupabase
                .from('orders')
                .select('user_id, status')
                .eq('cashfree_order_id', orderId)
                .single()

            if (dbOrder && dbOrder.status === 'pending') {
                await adminSupabase
                    .from('profiles')
                    .update({ plan: 'pro', tabs_limit: 1000, collections_limit: 100, is_ordered: false })
                    .eq('id', dbOrder.user_id)

                await adminSupabase
                    .from('orders')
                    .update({ status: 'paid' })
                    .eq('cashfree_order_id', orderId)
            }
        }
        else if (type === 'PAYMENT_FAILED_WEBHOOK' || type === 'PAYMENT_USER_DROPPED_WEBHOOK') {
            const orderId = data.order.order_id

            const { data: dbOrder } = await adminSupabase
                .from('orders')
                .select('user_id, status')
                .eq('cashfree_order_id', orderId)
                .single()

            if (dbOrder && dbOrder.status === 'pending') {
                await adminSupabase
                    .from('profiles')
                    .update({ is_ordered: false })
                    .eq('id', dbOrder.user_id)

                await adminSupabase
                    .from('orders')
                    .update({ status: 'failed' })
                    .eq('cashfree_order_id', orderId)
            }
        }

        return NextResponse.json({ received: true })
    } catch (err) {
        console.error('Webhook error:', err)
        return NextResponse.json(
            { error: 'Webhook failed' },
            { status: 500 }
        )
    }
}