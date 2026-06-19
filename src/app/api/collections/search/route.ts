import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const q = searchParams.get('q')?.trim()

        if (!q) {
            return NextResponse.json({ collections: [] })
        }

        const { data: collections, error } = await supabase
            .from('collections')
            .select('*, tabs(count)')
            .eq('user_id', user.id)
            .ilike('name', `%${q}%`)
            .order('created_at', { ascending: true })

        if (error) throw error

        return NextResponse.json({ collections: collections ?? [] })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", }, { status: 500 })
    }
}