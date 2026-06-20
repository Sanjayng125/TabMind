import { createClient } from '@/lib/supabase/server'
import { geminiModel } from '@/lib/gemini'
import { scrapeUrl } from '@/lib/scraper'
import { NextResponse } from 'next/server'
import { Profile } from '@/types/database'
import { summariseRateLimit } from '@/lib/rate-limit'

const TRACKING_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign',
    'utm_term', 'utm_content', 'utm_id',
    'fbclid', 'gclid', 'ref', 'mc_cid',
    'mc_eid', 'igshid', 'msclkid', '_ga',
]

function cleanUrl(rawUrl: string): string {
    try {
        const url = new URL(rawUrl)

        TRACKING_PARAMS.forEach((param) => url.searchParams.delete(param))

        url.pathname = url.pathname.replace(/\/+$/, "") || "/";

        const cleaned = url.toString()

        return cleaned
    } catch {
        return rawUrl
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Rate limit — keyed per user
        const { success, limit, remaining, reset, } = await summariseRateLimit.limit(
            user.id
        )

        if (!success) {
            const resetIn = Math.ceil((reset - Date.now()) / 1000)
            return NextResponse.json(
                {
                    error: `Too many requests. You can save ${limit} tabs per minute. Try again in ${resetIn}s.`,
                    retryAfter: resetIn,
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': remaining.toString(),
                        'X-RateLimit-Reset': reset.toString(),
                        'Retry-After': resetIn.toString(),
                    },
                }
            )
        }

        const { url } = await req.json()
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        // Validate URL
        try { new URL(url) } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
        }

        const cleanedUrl = cleanUrl(url)

        const { count } = await supabase
            .from('tabs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        const { data: profile }: { data: Profile | null } = await supabase
            .from('profiles')
            .select('plan, tabs_limit')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if ((count ?? 0) >= profile?.tabs_limit) {
            return NextResponse.json(
                { error: `Limit reached. ${profile.plan === 'free' ? 'Upgrade to Pro for 1000 tabs.' : 'Remove some tabs to continue.'}` },
                { status: 403 }
            )
        }

        // Check for duplicates
        const { data: existingTab } = await supabase
            .from('tabs')
            .select('*')
            .eq('user_id', user.id)
            .eq('url', cleanedUrl)
            .single()

        if (existingTab) {
            return NextResponse.json({ error: 'Tab already exists', duplicate: true }, { status: 409 })
        }

        // Scrape the page
        const { title, text, favicon } = await scrapeUrl(url)

        const { data: collections } = await supabase
            .from('collections')
            .select('id, name')
            .eq('user_id', user.id)

        // Build AI prompt
        const prompt =
            `You are a smart tab organiser. Analyse this webpage and respond ONLY with valid JSON — no markdown, no backticks, no explanation.

            URL: ${url}
            Title: ${title}
            Content: ${text}

            Available collections: ${collections && collections.length > 0
                ? collections.map((c: { name: string }) => c.name).join(', ')
                : 'no collections available yet'
            }

            Respond with exactly this JSON shape:
            {
            "summary": "One clear sentence (max 120 chars) describing what this page is about",
            "tags": ["tag1", "tag2", "tag3"],
            "collection": "collection name from the list above, or null if none fit"
            }

            Rules for tags:
            - 2 to 4 tags maximum
            - Lowercase, single words or short phrases
            - Be specific, not generic (avoid "website" or "page")

            Rules for collection:
            - Only pick from the available collections list
            - Return null if no collection fits or if list is empty
            - Return the exact name string, not an id`

        // Call Gemini
        const result = await geminiModel.generateContent(prompt)
        const raw = result.response.text().trim()

        // Parse JSON safely
        let parsed: { summary: string; tags: string[], collection: string | null }
        try {
            // Strip any accidental markdown fences
            const clean = raw.replace(/```json|```/g, '').trim()
            parsed = JSON.parse(clean)
        } catch {
            // Fallback if AI returns bad JSON
            parsed = {
                summary: title,
                tags: ['untagged'],
                collection: null,
            }
        }

        const suggestedCollection = collections?.find(
            (c: { id: string; name: string }) =>
                c.name.toLowerCase() === parsed.collection?.toLowerCase()
        )

        // Save to Supabase
        const { data: tab, error } = await supabase
            .from('tabs')
            .insert({
                user_id: user.id,
                url,
                title,
                summary: parsed.summary,
                tags: parsed.tags,
                favicon_url: favicon,
                collection_id: suggestedCollection?.id ?? null,
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ tab }, { status: 201 })

    } catch (err) {
        console.error('Summarise error:', err)

        if (err instanceof Error && err.message.includes('503')) {
            return NextResponse.json(
                { error: 'AI service is currently unavailable. Please try again later.' },
                { status: 503 }
            )
        }

        if (err instanceof Error && err.message.includes('403')) {
            return NextResponse.json(
                { error: 'AI quota exceeded. Please try again later.' },
                { status: 429 }
            )
        }

        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        )
    }
}