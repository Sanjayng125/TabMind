import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
    const supabase = await createClient()

    if (!supabase.auth.getUser()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await supabase.auth.signOut()
    return NextResponse.json({ success: true })
}
