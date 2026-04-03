# shelfmate

> A private, invite-only book club for people who love to read and share.

Built with Next.js, Supabase, Tailwind CSS, and Recharts. Open source. Self-hostable.

---

## Features

- **Shelf** - Track every book: Want to Read, Reading, Finished, Abandoned
- **Search** - Powered by Google Books API. No copyright issues, ever.
- **Reviews & Notes** - Write reviews, save quotes, set visibility per item
- **Stats** - Charts of your reading history, genre breakdown, reading pace
- **Friend Feed** - See what friends are reading in real time
- **Invite System** - Closed community with a built-in invite management page
- **Public Profiles** - Share your reading life at `/profile/yourname`
- **Reading Lists** - Curated collections you can make public or private
- **Dark Mode** - System-aware, toggleable

---

## Stack

| Layer | Tech |
|---|---|
| Frontend + API | Next.js (App Router, TypeScript) |
| Database + Auth | Supabase (PostgreSQL + RLS) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel (recommended) |

---

## Setup Guide

### 1. Clone and install

```bash
git clone https://github.com/fransfela/shelfmate
cd shelfmate
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a **New Project** (note your project password somewhere safe)
3. Once it's ready, go to **Project Settings > API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public key** (long JWT string)

### 3. Run the database schema

1. In your Supabase project, go to **SQL Editor**
2. Open `supabase/schema.sql` from this repo, copy the entire contents
3. Paste it into the SQL Editor and click **Run**
4. You should see "Success. No rows returned."

### 4. Generate your first invite code

Still in the Supabase SQL Editor, run:

```sql
insert into public.invite_codes (created_by) values (null);
select code from public.invite_codes order by created_at desc limit 1;
```

Copy the 8-character code (e.g. `A3BF92D1`) — you'll need it to sign up.

### 5. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: get a free key at https://console.cloud.google.com
# Without it, book search still works (1000 req/day limit)
GOOGLE_BOOKS_API_KEY=
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Get started**, and use the invite code from step 4 to create your account.

### 7. Invite others

Once you're logged in, go to **Invites** in the nav bar. Click **New invite** to generate a code, then copy and share it with the person. Codes are single-use.

---

## Deployment (Vercel)

1. Push your fork to GitHub
2. Go to [vercel.com](https://vercel.com), import your repo
3. Add these environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_BOOKS_API_KEY` (optional)
4. Deploy

> **Note:** Your `.env.local` file is gitignored and never pushed. Each person who self-hosts needs their own Supabase project and their own API keys.

---

## Project Structure

```
shelfmate/
├── app/
│   ├── (auth)/          # Login, signup pages
│   ├── (app)/           # Protected app pages
│   │   ├── dashboard/   # Home feed + friend activity
│   │   ├── shelf/       # Your book collection (tabbed by status)
│   │   ├── search/      # Find new books via Google Books
│   │   ├── stats/       # Reading analytics & charts
│   │   ├── invites/     # Generate and manage invite codes
│   │   └── profile/     # Public profile page /profile/[username]
│   └── api/
│       └── books/       # Search + add-to-shelf endpoints
│       └── invites/     # Invite code generation endpoint
├── components/          # BookCard, BookSearch, Nav, ReadingStats, ThemeToggle
├── lib/
│   ├── supabase/        # Supabase client (browser + server)
│   ├── google-books.ts  # Google Books API integration
│   ├── types.ts         # Shared TypeScript types
│   └── utils.ts         # Helpers, status labels/colors
└── supabase/
    └── schema.sql       # Full DB schema with Row Level Security
```

---

## License

MIT - free to use, self-host, and modify.

