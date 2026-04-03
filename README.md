# shelfmate

> A private book club for people who love to read and share.

Built with Next.js 15, Supabase, Tailwind CSS, and Recharts. Open source. Self-hostable. Invite-only.

---

## Features

- **Shelf** - Track every book: Want to Read, Reading, Finished, Abandoned
- **Search** - Powered by Google Books API. No copyright issues, ever.
- **Reviews & Notes** - Write reviews, save quotes, set visibility per item
- **Stats** - Charts of your reading history, genre breakdown, reading pace
- **Friend Feed** - See what friends are reading in real time
- **Invite System** - Closed community, you control who joins
- **Public Profiles** - Share your reading life at `/profile/yourname`
- **Reading Lists** - Curated collections you can make public or private

---

## Stack

| Layer | Tech |
|---|---|
| Frontend + API | Next.js 15 (App Router, TypeScript) |
| Database + Auth | Supabase (PostgreSQL + RLS) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/yourname/shelfmate
cd shelfmate
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Copy your project URL and anon key

### 3. Configure environment

```bash
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key
```

### 4. Create your first invite code

In Supabase SQL Editor, after creating your first user via the app's login flow:

```sql
-- Create an invite code for a friend
insert into public.invite_codes (created_by)
values ('your-user-uuid-here');

-- See the generated code to share
select code from public.invite_codes order by created_at desc limit 1;
```

### 5. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## Deployment

Deploy to Vercel - add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables.

---

## Project Structure

```
folio/
├── app/
│   ├── (auth)/          # Login, signup pages
│   ├── (app)/           # Protected app pages
│   │   ├── dashboard/   # Home feed + friend activity
│   │   ├── shelf/       # Your book collection (tabbed by status)
│   │   ├── search/      # Find new books via Google Books
│   │   ├── stats/       # Reading analytics & charts
│   │   └── profile/     # Public profile page /profile/[username]
│   └── api/
│       └── books/       # Search + add-to-shelf endpoints
├── components/          # BookCard, BookSearch, Nav, ReadingStats
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
