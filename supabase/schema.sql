-- Schema for the personality tests site.
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Safe to re-run from a partial or previous state: every object is created
-- with IF NOT EXISTS / OR REPLACE, and every policy is dropped-then-recreated.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Tests catalog
-- ---------------------------------------------------------------------------
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  cover_image_url text,
  price_cents integer not null default 0, -- 0 = free test
  currency text not null default 'eur',
  stripe_price_id text, -- Stripe one-time Price id, required if price_cents > 0
  is_active boolean not null default true,
  included_in_subscription boolean not null default true,
  -- 'single_choice' is the simple built-in engine (one question, several
  -- options, highest trait wins). The others are the richer FlyUp assessment
  -- formats — see src/lib/assessments/scoring.ts for what each one does.
  format text not null default 'single_choice'
    check (format in (
      'single_choice',
      'forced_choice_pair',
      'forced_choice_quad',
      'situational_judgment',
      'likert_scale',
      'bipolar_pairs'
    )),
  language text not null default 'fr',
  created_at timestamptz not null default now()
);

alter table public.tests enable row level security;

drop policy if exists "Active tests metadata is public" on public.tests;
create policy "Active tests metadata is public" on public.tests
  for select using (is_active = true);

-- ---------------------------------------------------------------------------
-- Purchases (one-off unlocks) — created before has_test_access() below,
-- since that function's body references this table.
-- ---------------------------------------------------------------------------
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  test_id uuid not null references public.tests (id) on delete cascade,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_cents integer,
  currency text,
  status text not null default 'pending', -- pending | paid | refunded
  created_at timestamptz not null default now(),
  unique (user_id, test_id)
);

alter table public.purchases enable row level security;

drop policy if exists "Purchases are viewable by owner" on public.purchases;
create policy "Purchases are viewable by owner" on public.purchases
  for select using (auth.uid() = user_id);

-- No insert/update policy for regular users: only the Stripe webhook
-- (using the service role key, which bypasses RLS) writes to this table.

-- ---------------------------------------------------------------------------
-- Subscriptions (unlimited access plan) — also needed by has_test_access().
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text unique not null,
  status text not null, -- active | trialing | past_due | canceled | ...
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Subscriptions are viewable by owner" on public.subscriptions;
create policy "Subscriptions are viewable by owner" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Questions & options (the actual paid content, 'single_choice' format)
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests (id) on delete cascade,
  position integer not null,
  text text not null
);

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  position integer not null,
  text text not null,
  -- trait key -> points, e.g. {"explorateur": 2, "gardien": 0}
  scores jsonb not null default '{}'::jsonb
);

create table if not exists public.result_profiles (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests (id) on delete cascade,
  trait_key text not null,
  title text not null,
  description text not null,
  image_url text
);

alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.result_profiles enable row level security;

-- ---------------------------------------------------------------------------
-- Test content for the richer assessment formats (forced_choice_pair,
-- forced_choice_quad, situational_judgment, likert_scale, bipolar_pairs).
-- One JSON blob per test: dimensions, items, scoring config, report text
-- banks, profiles... i.e. the FlyUp *_fr.json / *_en.json files almost
-- verbatim. Kept as JSON (rather than fully normalized tables) because the
-- generator scripts that produce these files are the real source of truth —
-- see content/flyup/README.md.
-- ---------------------------------------------------------------------------
create table if not exists public.test_content (
  test_id uuid primary key references public.tests (id) on delete cascade,
  definition jsonb not null
);

alter table public.test_content enable row level security;

-- Helper: does the current user have access to a given test's content?
-- Defined after tests/purchases/subscriptions so its body resolves.
create or replace function public.has_test_access(p_test_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    exists (select 1 from public.tests t where t.id = p_test_id and t.price_cents = 0)
    or exists (
      select 1 from public.purchases p
      where p.user_id = auth.uid() and p.test_id = p_test_id and p.status = 'paid'
    )
    or exists (
      select 1 from public.subscriptions s
      where s.user_id = auth.uid() and s.status in ('active', 'trialing')
    )
    and exists (
      select 1 from public.tests t
      where t.id = p_test_id and t.included_in_subscription = true
    );
$$;

drop policy if exists "Questions are readable with access" on public.questions;
create policy "Questions are readable with access" on public.questions
  for select using (public.has_test_access(test_id));

drop policy if exists "Options are readable with access" on public.question_options;
create policy "Options are readable with access" on public.question_options
  for select using (
    public.has_test_access(
      (select q.test_id from public.questions q where q.id = question_id)
    )
  );

drop policy if exists "Result profiles are readable with access" on public.result_profiles;
create policy "Result profiles are readable with access" on public.result_profiles
  for select using (public.has_test_access(test_id));

drop policy if exists "Test content is readable with access" on public.test_content;
create policy "Test content is readable with access" on public.test_content
  for select using (public.has_test_access(test_id));

-- ---------------------------------------------------------------------------
-- Attempts (a user's answers + computed result for a test)
-- ---------------------------------------------------------------------------
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  test_id uuid not null references public.tests (id) on delete cascade,
  answers jsonb not null,
  -- Legacy fields used only by the 'single_choice' format.
  scores jsonb not null default '{}'::jsonb,
  result_profile_id uuid references public.result_profiles (id),
  -- Full computed result (dimension scores, narrative report, consistency /
  -- quality-control flags...) for every other format. Computed once at
  -- submission time and stored, so edits to test_content later don't change
  -- past results. See src/lib/assessments/scoring.ts for the shape.
  result jsonb,
  completed_at timestamptz not null default now()
);

alter table public.attempts enable row level security;

drop policy if exists "Attempts are viewable by owner" on public.attempts;
create policy "Attempts are viewable by owner" on public.attempts
  for select using (auth.uid() = user_id);

drop policy if exists "Attempts are insertable by owner" on public.attempts;
create policy "Attempts are insertable by owner" on public.attempts
  for insert with check (auth.uid() = user_id);
