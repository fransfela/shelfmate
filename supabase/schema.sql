-- =============================================================================
-- Shelfmate - Book Sharing Library
-- Supabase / PostgreSQL Schema
-- Run this in your Supabase SQL Editor (safe to run on a fresh project)
-- =============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

do $$ begin
  create type reading_status as enum ('want_to_read', 'reading', 'finished', 'abandoned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type visibility as enum ('public', 'friends', 'private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type friendship_status as enum ('pending', 'accepted');
exception when duplicate_object then null; end $$;


-- =============================================================================
-- PROFILES
-- =============================================================================

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  full_name       text,
  bio             text,
  avatar_url      text,
  profile_public  boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable" on public.profiles;
create policy "Public profiles are viewable"
  on public.profiles for select
  using (profile_public = true or auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =============================================================================
-- BOOKS
-- =============================================================================

create table if not exists public.books (
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

drop policy if exists "Books are publicly readable" on public.books;
create policy "Books are publicly readable" on public.books for select using (true);

drop policy if exists "Authenticated users can insert books" on public.books;
create policy "Authenticated users can insert books" on public.books for insert with check (auth.role() = 'authenticated');


-- =============================================================================
-- USER BOOKS (SHELF)
-- =============================================================================

create table if not exists public.user_books (
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

drop policy if exists "Users see own books always" on public.user_books;
create policy "Users see own books always"
  on public.user_books for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own books" on public.user_books;
create policy "Users insert own books" on public.user_books for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own books" on public.user_books;
create policy "Users update own books" on public.user_books for update using (auth.uid() = user_id);

drop policy if exists "Users delete own books" on public.user_books;
create policy "Users delete own books" on public.user_books for delete using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists user_books_updated_at on public.user_books;
create trigger user_books_updated_at before update on public.user_books
  for each row execute procedure public.set_updated_at();


-- =============================================================================
-- NOTES / QUOTES
-- =============================================================================

create table if not exists public.notes (
  id            uuid primary key default gen_random_uuid(),
  user_book_id  uuid not null references public.user_books(id) on delete cascade,
  content       text not null,
  is_quote      boolean not null default false,
  page          integer,
  visibility    visibility not null default 'private',
  created_at    timestamptz not null default now()
);

alter table public.notes enable row level security;

drop policy if exists "Notes visible to owner or public" on public.notes;
create policy "Notes visible to owner or public"
  on public.notes for select
  using (
    visibility = 'public'
    or exists (select 1 from public.user_books ub where ub.id = user_book_id and ub.user_id = auth.uid())
  );

drop policy if exists "Notes insert by owner" on public.notes;
create policy "Notes insert by owner" on public.notes for insert
  with check (exists (select 1 from public.user_books ub where ub.id = user_book_id and ub.user_id = auth.uid()));

drop policy if exists "Notes update by owner" on public.notes;
create policy "Notes update by owner" on public.notes for update
  using (exists (select 1 from public.user_books ub where ub.id = user_book_id and ub.user_id = auth.uid()));

drop policy if exists "Notes delete by owner" on public.notes;
create policy "Notes delete by owner" on public.notes for delete
  using (exists (select 1 from public.user_books ub where ub.id = user_book_id and ub.user_id = auth.uid()));


-- =============================================================================
-- READING LISTS
-- =============================================================================

create table if not exists public.reading_lists (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  description  text,
  visibility   visibility not null default 'public',
  created_at   timestamptz not null default now()
);

create table if not exists public.list_books (
  list_id     uuid not null references public.reading_lists(id) on delete cascade,
  book_id     uuid not null references public.books(id) on delete cascade,
  sort_order  integer not null default 0,
  added_at    timestamptz not null default now(),
  primary key (list_id, book_id)
);

alter table public.reading_lists enable row level security;
alter table public.list_books enable row level security;

drop policy if exists "Lists readable if public or owner" on public.reading_lists;
create policy "Lists readable if public or owner"
  on public.reading_lists for select
  using (visibility = 'public' or auth.uid() = user_id);

drop policy if exists "Lists insert by owner" on public.reading_lists;
create policy "Lists insert by owner" on public.reading_lists for insert with check (auth.uid() = user_id);

drop policy if exists "Lists update by owner" on public.reading_lists;
create policy "Lists update by owner" on public.reading_lists for update using (auth.uid() = user_id);

drop policy if exists "Lists delete by owner" on public.reading_lists;
create policy "Lists delete by owner" on public.reading_lists for delete using (auth.uid() = user_id);

drop policy if exists "List books readable" on public.list_books;
create policy "List books readable" on public.list_books for select using (
  exists (select 1 from public.reading_lists rl where rl.id = list_id and (rl.visibility = 'public' or rl.user_id = auth.uid()))
);

drop policy if exists "List books insert by list owner" on public.list_books;
create policy "List books insert by list owner" on public.list_books for insert
  with check (exists (select 1 from public.reading_lists rl where rl.id = list_id and rl.user_id = auth.uid()));

drop policy if exists "List books delete by list owner" on public.list_books;
create policy "List books delete by list owner" on public.list_books for delete
  using (exists (select 1 from public.reading_lists rl where rl.id = list_id and rl.user_id = auth.uid()));


-- =============================================================================
-- DISCUSSIONS
-- =============================================================================

create table if not exists public.discussions (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references public.books(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  parent_id   uuid references public.discussions(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.discussions enable row level security;

drop policy if exists "Discussions publicly readable" on public.discussions;
create policy "Discussions publicly readable" on public.discussions for select using (true);

drop policy if exists "Discussions insert by authenticated" on public.discussions;
create policy "Discussions insert by authenticated" on public.discussions for insert with check (auth.uid() = author_id);

drop policy if exists "Discussions update by author" on public.discussions;
create policy "Discussions update by author" on public.discussions for update using (auth.uid() = author_id);

drop policy if exists "Discussions delete by author" on public.discussions;
create policy "Discussions delete by author" on public.discussions for delete using (auth.uid() = author_id);

drop trigger if exists discussions_updated_at on public.discussions;
create trigger discussions_updated_at before update on public.discussions
  for each row execute procedure public.set_updated_at();


-- =============================================================================
-- FRIENDSHIPS
-- =============================================================================

create table if not exists public.friendships (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  friend_id   uuid not null references public.profiles(id) on delete cascade,
  status      friendship_status not null default 'pending',
  created_at  timestamptz not null default now(),
  unique (user_id, friend_id),
  check (user_id <> friend_id)
);

alter table public.friendships enable row level security;

drop policy if exists "Friendships visible to participants" on public.friendships;
create policy "Friendships visible to participants"
  on public.friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "Friendships insert" on public.friendships;
create policy "Friendships insert" on public.friendships for insert with check (auth.uid() = user_id);

drop policy if exists "Friendships update by friend" on public.friendships;
create policy "Friendships update by friend" on public.friendships for update using (auth.uid() = friend_id);

drop policy if exists "Friendships delete by participants" on public.friendships;
create policy "Friendships delete by participants" on public.friendships for delete
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- Now safe to create: references friendships which exists above
drop policy if exists "Friends see friend books" on public.user_books;
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


-- =============================================================================
-- INVITE CODES
-- =============================================================================

create table if not exists public.invite_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_by  uuid references public.profiles(id) on delete cascade,
  used_by     uuid references public.profiles(id),
  used_at     timestamptz,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

alter table public.invite_codes enable row level security;

-- Allow anyone to read codes (needed so signup form can validate codes before auth session exists)
drop policy if exists "Invite codes viewable by creator" on public.invite_codes;
drop policy if exists "Invite codes readable" on public.invite_codes;
create policy "Invite codes readable" on public.invite_codes for select using (true);

drop policy if exists "Invite codes insertable by authenticated" on public.invite_codes;
create policy "Invite codes insertable by authenticated" on public.invite_codes for insert
  with check (auth.uid() = created_by);

drop policy if exists "Invite codes updatable (claim)" on public.invite_codes;
create policy "Invite codes updatable (claim)" on public.invite_codes for update using (true);

drop policy if exists "Invite codes deletable by creator" on public.invite_codes;
create policy "Invite codes deletable by creator" on public.invite_codes for delete
  using (auth.uid() = created_by);


-- =============================================================================
-- BOOK CLUB HELPER FUNCTIONS (security definer to avoid RLS recursion)
-- =============================================================================

-- Returns club_ids the current user belongs to (bypasses RLS to prevent recursion)
create or replace function public.get_my_club_ids()
returns setof uuid language sql security definer stable set search_path = public as $$
  select club_id from public.book_club_members where user_id = auth.uid();
$$;

-- Returns club_ids the current user owns (bypasses RLS to prevent recursion)
create or replace function public.get_my_owned_club_ids()
returns setof uuid language sql security definer stable set search_path = public as $$
  select club_id from public.book_club_members where user_id = auth.uid() and role = 'owner';
$$;


-- =============================================================================
-- BOOK CLUBS
-- =============================================================================

create table if not exists public.book_clubs (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  emoji        text not null default '📚',
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

alter table public.book_clubs enable row level security;

drop policy if exists "Club members can view clubs" on public.book_clubs;
create policy "Club members can view clubs"
  on public.book_clubs for select
  using (id in (select public.get_my_club_ids()));

drop policy if exists "Authenticated users can create clubs" on public.book_clubs;
create policy "Authenticated users can create clubs"
  on public.book_clubs for insert
  with check (auth.uid() = created_by);

drop policy if exists "Club owners can update clubs" on public.book_clubs;
create policy "Club owners can update clubs"
  on public.book_clubs for update
  using (id in (select public.get_my_owned_club_ids()));

drop policy if exists "Club owners can delete clubs" on public.book_clubs;
create policy "Club owners can delete clubs"
  on public.book_clubs for delete
  using (id in (select public.get_my_owned_club_ids()));


-- =============================================================================
-- BOOK CLUB MEMBERS
-- =============================================================================

create table if not exists public.book_club_members (
  id         uuid primary key default gen_random_uuid(),
  club_id    uuid not null references public.book_clubs(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null default 'member' check (role in ('owner', 'member')),
  joined_at  timestamptz not null default now(),
  unique (club_id, user_id)
);

alter table public.book_club_members enable row level security;

drop policy if exists "Club members can view membership" on public.book_club_members;
create policy "Club members can view membership"
  on public.book_club_members for select
  using (club_id in (select public.get_my_club_ids()));

drop policy if exists "Users can join clubs" on public.book_club_members;
create policy "Users can join clubs"
  on public.book_club_members for insert
  with check (user_id = auth.uid());

drop policy if exists "Club owners can remove members or self-leave" on public.book_club_members;
create policy "Club owners can remove members or self-leave"
  on public.book_club_members for delete
  using (
    user_id = auth.uid()
    or club_id in (select public.get_my_owned_club_ids())
  );


-- =============================================================================
-- BOOK CLUB INVITES
-- =============================================================================

create table if not exists public.book_club_invites (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.book_clubs(id) on delete cascade,
  code        text unique not null default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_by  uuid references public.profiles(id) on delete set null,
  used_by     uuid references public.profiles(id) on delete set null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

alter table public.book_club_invites enable row level security;

-- Anyone can read invite codes (needed to validate/preview before joining)
drop policy if exists "Club invites publicly readable" on public.book_club_invites;
create policy "Club invites publicly readable"
  on public.book_club_invites for select using (true);

drop policy if exists "Club members can create invites" on public.book_club_invites;
create policy "Club members can create invites"
  on public.book_club_invites for insert
  with check (
    auth.uid() = created_by
    and club_id in (select public.get_my_club_ids())
  );

drop policy if exists "Club invites claimable" on public.book_club_invites;
create policy "Club invites claimable"
  on public.book_club_invites for update using (true);


-- =============================================================================
-- CLUB-BASED VISIBILITY FOR USER BOOKS
-- =============================================================================

-- Club members can see each other's public/friends-visibility books
drop policy if exists "Club members see each other books" on public.user_books;
create policy "Club members see each other books"
  on public.user_books for select
  using (
    visibility in ('public', 'friends')
    and user_id in (
      select bcm2.user_id
      from public.book_club_members bcm1
      join public.book_club_members bcm2 on bcm1.club_id = bcm2.club_id
      where bcm1.user_id = auth.uid() and bcm2.user_id != auth.uid()
    )
  );

-- Club members can see each other's profiles (even if profile_public = false)
drop policy if exists "Club members see each other profiles" on public.profiles;
create policy "Club members see each other profiles"
  on public.profiles for select
  using (
    id in (
      select bcm2.user_id
      from public.book_club_members bcm1
      join public.book_club_members bcm2 on bcm1.club_id = bcm2.club_id
      where bcm1.user_id = auth.uid()
    )
  );


-- =============================================================================
-- VIEWS
-- =============================================================================

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


-- =============================================================================
-- BOOTSTRAP: generate your first invite code
-- Uncomment and run AFTER the schema is applied:
-- =============================================================================
-- insert into public.invite_codes (created_by) values (null);
-- select code from public.invite_codes order by created_at desc limit 1;
