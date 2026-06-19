import { generateRandomHexColor } from '@/lib'
import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types/database'
import { NextRequest, NextResponse } from 'next/server'

// GET all collections for the user
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const searchParams = request.nextUrl.searchParams
        const limitParam = searchParams.get('limit')
        const sortParam = searchParams.get('sort')

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        if (limitParam !== null && Number.isNaN(Number(limitParam))) {
            return NextResponse.json({ error: 'Invalid limit' }, { status: 400 })
        }

        let query = supabase
            .from('collections')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: sortParam === "desc" ? false : true })

        if (limitParam !== null) {
            query = query.limit(Number(limitParam))
        }

        const { data: collections, error } = await query

        if (error) throw error

        return NextResponse.json({ collections })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", }, { status: 500 })

    }
}

// POST create a collection
export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { name, color } = await req.json()
        const normalizedName = name?.trim()

        if (!normalizedName) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const { count } = await supabase
            .from('collections')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)

        const { data: profile }: { data: Profile | null } = await supabase
            .from('profiles')
            .select('plan, collections_limit')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if ((count ?? 0) >= profile?.collections_limit) {
            return NextResponse.json(
                { error: `Limit reached. ${profile.plan === 'free' ? 'Upgrade to Pro for 100 collections.' : 'Remove some collections to continue.'}` },
                { status: 403 }
            )
        }

        // Check duplicate name (case-insensitive)
        const { data: existing } = await supabase
            .from('collections')
            .select('id')
            .eq('user_id', user.id)
            .ilike('name', normalizedName)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'Collection name already exists' },
                { status: 409 }
            )
        }

        const { data: collection, error } = await supabase
            .from('collections')
            .insert({
                user_id: user.id,
                name: normalizedName,
                color: color ?? generateRandomHexColor(),
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ collection }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", }, { status: 500 })
    }
}

// PATCH — update a collection (rename)
export async function PATCH(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id, name } = await req.json()
        const normalizedName = name?.trim()

        if (!normalizedName) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        // Check duplicate name (case-insensitive)
        const { data: existing } = await supabase
            .from('collections')
            .select('id')
            .eq('user_id', user.id)
            .ilike('name', normalizedName)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'Collection name already exists' },
                { status: 409 }
            )
        }

        const { data: collection, error } = await supabase
            .from('collections')
            .update({ name: normalizedName })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ collection })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", }, { status: 500 })
    }
}

// DELETE a collection
export async function DELETE(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await req.json()

        if (!id) {
            return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 })
        }

        await supabase
            .from('tabs')
            .update({ collection_id: null })
            .eq('collection_id', id)
            .eq('user_id', user.id)

        const { error } = await supabase
            .from('collections')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) return NextResponse.json({ error: "Something went wrong while deleting the collection", }, { status: 500 });

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", }, { status: 500 })
    }
}