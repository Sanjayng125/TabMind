import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { error: profileError } = await adminSupabase
            .from('profiles')
            .delete()
            .eq('id', user.id)

        if (profileError) {
            return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
        }

        const { error: authError } = await adminSupabase.auth.admin.deleteUser(
            user.id
        )

        if (authError) {
            return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
        }

        await supabase.auth.signOut()

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", }, { status: 500 })
    }
}