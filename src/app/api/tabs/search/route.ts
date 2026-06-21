import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Search tabs by title, summary, URL, or tag (You can restrict this feature to pro users only, If you want to.)
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
            return NextResponse.json({ tabs: [] })
        }

        const { data: tabs, error } = await supabase
            .from('tabs')
            .select('*')
            .eq('user_id', user.id)
            .or(
                `title.ilike.%${q}%,summary.ilike.%${q}%,url.ilike.%${q}%`
            )
            .order('created_at', { ascending: false })
            .limit(30)

        if (error) throw error

        const { data: tagTabs } = await supabase
            .from('tabs')
            .select('*')
            .eq('user_id', user.id)
            .contains('tags', [q.toLowerCase()])
            .limit(10)

        const all = [...(tabs ?? []), ...(tagTabs ?? [])]
        const seen = new Set<string>()
        const merged = all.filter((t) => {
            if (seen.has(t.id)) return false
            seen.add(t.id)
            return true
        })

        return NextResponse.json({ tabs: merged })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", }, { status: 500 })
    }
}