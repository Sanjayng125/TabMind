# 🔗 TabMind

> Save tabs. AI tags them. Find anything instantly.

TabMind is an AI-powered tab manager — a Chrome extension + web app that automatically summarises and tags every browser tab you save, so you can find anything weeks later without remembering the URL.

<img width="1898" height="869" alt="TabMind" src="https://github.com/user-attachments/assets/0457bf3b-8da7-4a3b-9854-93fa5c01379d" />

---

## ✨ Features

- **One-click save** — click the extension to save all open tabs instantly
- **AI summarisation** — every tab gets a one-sentence summary automatically
- **Auto-tagging** — Gemini AI tags each tab by topic, type, and domain
- **Smart collections** — AI suggests which collection each tab belongs to
- **Full-text search** — find any tab by title, summary, URL, or tag
- **Responsive dashboard** — manage your tabs from any device
- **Google OAuth** — sign in with one click, no passwords
- **Cashfree payments** — upgrade to Pro with a single click

---

## 🛠️ Tech Stack

| Layer           | Tech                         |
| --------------- | ---------------------------- |
| Framework       | Next.js (App Router)         |
| Language        | TypeScript                   |
| Styling         | Tailwind CSS + shadcn/ui     |
| Database        | Supabase (Postgres + RLS)    |
| Auth            | Supabase Auth (Google OAuth) |
| Payment Gateway | Cashfree                     |
| AI              | Google Gemini 2.0 Flash      |
| Extension       | Chrome Manifest V3           |
| Deployment      | Vercel                       |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A [Supabase](https://supabase.com) account
- A [Google AI Studio](https://aistudio.google.com) API key (free)

### 1. Clone the repo

```bash
git clone https://github.com/sanjayng125/tab-mind.git
cd tab-mind
pnpm install
```

### 2. Set up environment variables

```bash
cp sample.env .env.local
```

Fill in your `.env.local`:

```env
NEXT_PUBLIC_APP_URL=your_app_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=your_cashfree_env # (production or sandbox)
```

### 3. Set up Supabase

Run the SQL in `schema.sql` in your Supabase SQL editor to create the tables, indexes, RLS policies, and auto-profile trigger.

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Load the Chrome extension

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder

---

## 🗄️ Database Schema

```sql
profiles      -- auto-created on signup, stores plan (free/pro)
tabs          -- saved tabs with AI summary, tags, favicon
collections   -- user-created folders for organising tabs
```

All tables have **Row Level Security (RLS)** — users can only access their own data.

---

## 🤖 How the AI Works

```
User clicks "Save tabs" in extension
  → extension sends each tab URL to /api/ai/summarise
  → server scrapes the webpage with cheerio
  → cleaned text is sent to Gemini 2.0 Flash
  → Gemini returns a summary, 2-4 tags, and a suggested collection
  → saved to Supabase and shown in the dashboard
```

Duplicate URLs and tracking params (`utm_*`, `fbclid` etc.) are stripped automatically.

---

## 🔐 Auth Flow

```
/ (landing page)
  └── /login → Google OAuth → /auth/callback → /dashboard

Extension:
  → calls /api/extension/me with session cookie
  → if valid session → logged in
  → if not → shows "Open TabMind" to sign in on web
```

---

## 🚢 Deployment

The web app is deployed on **Vercel**. To deploy your own:

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add environment variables
4. Update Supabase redirect URLs to your prod domain
5. Update `APP_URL` in `extension/popup.js` to your prod URL

---

## 🧑‍💻 Built By

Built by **[Sanjay](https://github.com/sanjayng125)**.
