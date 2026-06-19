import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"


export async function GET(
    _req: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: collectionId } = await params

        const { data: tabs, error } = await supabase
            .from('tabs')
            .select('*')
            .eq('user_id', user.id)
            .eq('collection_id', collectionId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ tabs })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ tabs: [], error: "Something went wrong", }, { status: 500 })
    }
}