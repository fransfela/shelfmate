-- ─────────────────────────────────────────────────────────────────────────────
-- Shelfmate — Book Sharing Library
-- Supabase / PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";


-- ─── Profiles ─────────────────────────────────────────────────────────────────
-- Mirrors auth.users with public-facing profile fields

create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  full_name       text,
  bio             text,
  avatar_url      text,
  profile_public  boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone can see public profiles
create policy "Public profiles are viewable"
  on public.profiles for select
  using (profile_public = true or auth.uid() = id);

-- Users can update their own profile
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── Books ────────────────────────────────────────────────────────────────────
-- Canonical book records (sourced from Google Books API)

create table public.books (
  id               uuid primary key default gen_random_uuid(),
  google_books_id  text unique not null,
  title            text not null,
  author           text not null,
  cover_url        text,
  description      text,
  isbn             text,
  published_date   text,
  page_count       integer,
  categories       text[] default '{}',
  created_at       timestamptz not null default now()
);

alter table public.books enable row level security;
create policy "Books are publicly readable" on public.books for select using (true);
create policy "Authenticated users can insert books" on public.books for insert with check (auth.role() = 'authenticated');


-- ─── User Books (Shelf) ───────────────────────────────────────────────────────

create type reading_status as enum ('want_to_read', 'reading', 'finished', 'abandoned');
create type visibility as enum ('public', 'friends', 'private');

create table public.user_books (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  book_id      uuid not null references public.books(id) on delete cascade,
  status       reading_status not null default 'want_to_read',
  rating       smallint check (rating between 1 and 5),
  review       text,
  started_at   timestamptz,
  finished_at  timestamptz,
  visibility   visibility not null default 'public',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, book_id)
);

alter table public.user_books enable row level security;

create policy "Users see own books always"
  on public.user_books for select
  using (auth.uid() = user_id);

create policy "Friends see friend books"
  on public.user_books for select
  using (
    visibility = 'public'
    or (visibility = 'friends' and exists (
      select 1 from public.friendships
      where status = 'accepted'
        and ((user_id = auth.uid() and friend_id = user_books.user_id)
          or (friend_id = auth.uid() and user_id = user_books.user_id))
    ))
  );

create policy "Users insert own books" on public.user_books for insert with check (auth.uid() = user_id);
create policy "Users update own books" on public.user_books for update using (auth.uid() = user_id);
create policy "Users delete own books" on public.user_books for delete using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger user_books_updated_at before update on public.user_books
  for each row execute procedure public.set_updated_at();


-- ─── Notes / Quotes ───────────────────────────────────────────────────────────

create table public.notes (
  id            uuid primary key default gen_random_uuid(),
  user_book_id  uuid not null references public.user_books(id) on delete cascade,
  content       text not null,
  is_quote      boolean not null default false,
  page          integer,
  visibility    visibility not null default 'private',
  created_at    timestamptz not null default now()
);

alter table public.notes enable row level security;
create policy "Notes visible to owner or public"
  on public.notes for select
  using (
    visibility = 'public'
    or exists (select 1 from public.user_books ub where ub.id = user_book_id and ub.user_id = auth.uid())
  );
create policy "Notes insert by owner" on public.notes for insert
  with check (exists (select 1 from public.user_books ub where ub.id = user_book_id and ub.user_id = auth.uid()));
create policy "Notes update by owner" on public.notes for update
  using (exists (select 1 from public.user_books ub where ub.id = user_book_id and ub.user_id = auth.uid()));
create policy "Notes delete by owner" on public.notes for delete
  using (exists (select 1 from public.user_books ub where ub.id = user_book_id and ub.user_id = auth.uid()));


-- ─── Reading Lists ────────────────────────────────────────────────────────────

create table public.reading_lists (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  description  text,
  visibility   visibility not null default 'public',
  created_at   timestamptz not null default now()
);

create table public.list_books (
  list_id     uuid not null references public.reading_lists(id) on delete cascade,
  book_id     uuid not null references public.books(id) on delete cascade,
  sort_order  integer not null default 0,
  added_at    timestamptz not null default now(),
  primary key (list_id, book_id)
);

alter table public.reading_lists enable row level security;
alter table public.list_books enable row level security;

create policy "Lists readable if public or owner"
  on public.reading_lists for select
  using (visibility = 'public' or auth.uid() = user_id);
create policy "Lists insert by owner" on public.reading_lists for insert with check (auth.uid() = user_id);
create policy "Lists update by owner" on public.reading_lists for update using (auth.uid() = user_id);
create policy "Lists delete by owner" on public.reading_lists for delete using (auth.uid() = user_id);

create policy "List books readable" on public.list_books for select using (
  exists (select 1 from public.reading_lists rl where rl.id = list_id and (rl.visibility = 'public' or rl.user_id = auth.uid()))
);
create policy "List books insert by list owner" on public.list_books for insert
  with check (exists (select 1 from public.reading_lists rl where rl.id = list_id and rl.user_id = auth.uid()));
create policy "List books delete by list owner" on public.list_books for delete
  using (exists (select 1 from public.reading_lists rl where rl.id = list_id and rl.user_id = auth.uid()));


-- ─── Discussions ──────────────────────────────────────────────────────────────

create table public.discussions (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references public.books(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  parent_id   uuid references public.discussions(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.discussions enable row level security;
create policy "Discussions publicly readable" on public.discussions for select using (true);
create policy "Discussions insert by authenticated" on public.discussions for insert with check (auth.uid() = author_id);
create policy "Discussions update by author" on public.discussions for update using (auth.uid() = author_id);
create policy "Discussions delete by author" on public.discussions for delete using (auth.uid() = author_id);
create trigger discussions_updated_at before update on public.discussions
  for each row execute procedure public.set_updated_at();


-- ─── Friendships ──────────────────────────────────────────────────────────────

create type friendship_status as enum ('pending', 'accepted');

create table public.friendships (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  friend_id   uuid not null references public.profiles(id) on delete cascade,
  status      friendship_status not null default 'pending',
  created_at  timestamptz not null default now(),
  unique (user_id, friend_id),
  check (user_id <> friend_id)
);

alter table public.friendships enable row level security;
create policy "Friendships visible to participants"
  on public.friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "Friendships insert" on public.friendships for insert with check (auth.uid() = user_id);
create policy "Friendships update by friend" on public.friendships for update using (auth.uid() = friend_id);
create policy "Friendships delete by participants" on public.friendships for delete
  using (auth.uid() = user_id or auth.uid() = friend_id);


-- ─── Invite Codes ─────────────────────────────────────────────────────────────

create table public.invite_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_by  uuid references public.profiles(id) on delete cascade,
  used_by     uuid references public.profiles(id),
  used_at     timestamptz,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

alter table public.invite_codes enable row level security;
create policy "Invite codes viewable by creator" on public.invite_codes for select using (auth.uid() = created_by or created_by is null);
create policy "Invite codes insertable by authenticated" on public.invite_codes for insert with check (auth.uid() = created_by);
create policy "Invite codes updatable (claim)" on public.invite_codes for update using (true);


-- ─── Useful View: Friend Feed ─────────────────────────────────────────────────

create or replace view public.friend_feed as
  select
    ub.id,
    ub.user_id,
    ub.book_id,
    ub.status,
    ub.rating,
    ub.updated_at as activity_at,
    p.username,
    p.avatar_url,
    b.title,
    b.author,
    b.cover_url
  from public.user_books ub
  join public.profiles p on p.id = ub.user_id
  join public.books b on b.id = ub.book_id
  where ub.visibility in ('public', 'friends')
  order by ub.updated_at desc;
