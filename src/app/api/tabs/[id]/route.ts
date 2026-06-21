import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH — update a tab (assign collection, mark read etc)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { id } = await params

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json()

        const allowed = ['collection_id', 'title']
        const updates: Record<string, unknown> = {}
        allowed.forEach((key) => {
            if (key in body) updates[key] = body[key]
        })

        const { data: tab, error } = await supabase
            .from('tabs')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ tab })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", }, { status: 500 })
    }
}