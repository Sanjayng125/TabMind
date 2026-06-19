import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Get all uncategorised tabs for the authenticated user
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: tabs, error } = await supabase
            .from('tabs')
            .select('*')
            .eq('user_id', user.id)
            .is('collection_id', null)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ tabs })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", }, { status: 500 })
    }
}