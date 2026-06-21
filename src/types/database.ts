export type Profile = {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    plan: 'free' | 'pro'
    tabs_limit: number
    collections_limit: number
    is_ordered: boolean
    created_at: string
}

export type Tab = {
    id: string
    user_id: string
    collection_id: string | null
    url: string
    title: string | null
    summary: string | null
    tags: string[]
    favicon_url: string | null
    created_at: string
}

export type Collection = {
    id: string
    user_id: string
    name: string
    color: string
    created_at: string
}

export type Order = {
    id: string
    cashfree_order_id: string
    amount: number
    currency: string
    status: 'pending' | 'paid' | 'failed'
    created_at: string
}