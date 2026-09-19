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
  first_name text,
  last_name text,
  gender text check (gender in ('femme', 'homme', 'autre', 'non_precise')),
  birth_date date,
  stripe_customer_id text,
  -- Which test's slug brought this person to sign up (from ?next= on the
  -- signup form), for lead follow-up. Null when they signed up generically.
  interested_test_slug text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists interested_test_slug text;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles drop constraint if exists profiles_gender_check;
alter table public.profiles add constraint profiles_gender_check
  check (gender in ('femme', 'homme', 'autre', 'non_precise'));

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
      'bipolar_pairs',
      'disc_quad',
      'pcm_likert',
      'logic_mcq',
      'career_balance',
      'sosie_v2',
      'orientation_riasec'
    )),
  language text not null default 'fr',
  created_at timestamptz not null default now()
);

alter table public.tests drop constraint if exists tests_format_check;
alter table public.tests add constraint tests_format_check check (format in (
  'single_choice', 'forced_choice_pair', 'forced_choice_quad', 'situational_judgment',
  'likert_scale', 'bipolar_pairs', 'disc_quad', 'pcm_likert', 'logic_mcq', 'career_balance', 'sosie_v2',
  'orientation_riasec'
));

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
  -- Nullable: a free test can be completed by a guest who only leaves an
  -- email (see `guest_email` and `marketing_leads` below), never creating
  -- an account. Every paid test still requires a real user_id.
  user_id uuid references auth.users (id) on delete cascade,
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
  -- Set only for guest (user_id is null) attempts on a free test, so the
  -- result page has something to greet the visitor with.
  guest_email text,
  -- True for every normal attempt (access was already paid/granted before
  -- the quiz started). Guest attempts on the free test are inserted with
  -- this false, and the result page shows a blurred teaser instead of the
  -- full report until the micro-payment webhook flips it to true.
  unlocked boolean not null default true,
  completed_at timestamptz not null default now()
);

alter table public.attempts add column if not exists unlocked boolean not null default true;

-- Postgres doesn't auto-index foreign key columns (only primary/unique
-- keys). These cover the lookups that get hotter as the user base grows:
-- "my past attempts" (account page) and has_test_access()'s subscription
-- check on every piece of gated content.
create index if not exists attempts_user_id_idx on public.attempts (user_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists questions_test_id_idx on public.questions (test_id);
create index if not exists question_options_question_id_idx on public.question_options (question_id);
create index if not exists result_profiles_test_id_idx on public.result_profiles (test_id);
-- Admin leads page and lead follow-up look these up by email; created after
-- the tables they reference are defined further down this file.
create index if not exists attempts_guest_email_idx on public.attempts (guest_email) where guest_email is not null;

alter table public.attempts enable row level security;

drop policy if exists "Attempts are viewable by owner" on public.attempts;
create policy "Attempts are viewable by owner" on public.attempts
  for select using (auth.uid() = user_id);

drop policy if exists "Attempts are insertable by owner" on public.attempts;
create policy "Attempts are insertable by owner" on public.attempts
  for insert with check (auth.uid() = user_id);

-- Deliberately NO public/anon select policy for guest (user_id is null)
-- attempts: `using (user_id is null)` would let ANY anon client list every
-- guest attempt (email, answers, result) via the public anon key, not just
-- the one whose id it already knows — RLS can't express "only if you
-- already have this specific id". Guest attempts are instead read
-- server-side only, via the admin client scoped to one exact id from the
-- URL (see src/app/tests/[slug]/result/[attemptId]/page.tsx), which never
-- exposes a listing endpoint.
drop policy if exists "Guest attempts are viewable by anyone with the link" on public.attempts;

-- ---------------------------------------------------------------------------
-- Marketing leads: the email a guest leaves to see their free test result,
-- plus whether they opted in to receive marketing communications. Written
-- only by the submitFreeAttempt server action (service role) — never
-- readable or writable by anon/authenticated clients directly.
-- ---------------------------------------------------------------------------
create table if not exists public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  test_slug text,
  consent boolean not null default false,
  attempt_id uuid references public.attempts (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists marketing_leads_email_idx on public.marketing_leads (email);

alter table public.marketing_leads enable row level security;
-- No policies: only the service-role key (used by the server action and by
-- the admin leads page) can read or write this table.

-- ---------------------------------------------------------------------------
-- Page views: home-grown visit counter for the daily ops report email.
-- Written only by app/api/track-view (service role) — no client access.
-- ---------------------------------------------------------------------------
create table if not exists public.page_views (
  id bigserial primary key,
  path text,
  viewed_at timestamptz not null default now()
);

create index if not exists page_views_viewed_at_idx on public.page_views (viewed_at);

alter table public.page_views enable row level security;
-- No policies: only the service-role key can read or write this table.

-- ---------------------------------------------------------------------------
-- Articles: SEO blog content. Drafted by the seo-daily-article scheduled
-- task (status='draft', see scripts/add-draft-article.mjs), reviewed via
-- /blog/preview/[id]?token=..., and published by a human clicking "Publier"
-- (src/app/actions/articles.ts) — never auto-published. Public pages
-- (/blog, /blog/[slug]) always read via the service-role client, filtered
-- to status='published' in the query itself (no public RLS policy exists).
-- ---------------------------------------------------------------------------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  title text not null,
  meta_description text not null,
  intro text not null,
  sections jsonb not null,
  related_slugs text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  publish_token text not null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  -- Set by the reader on the preview page (requestRevision) to ask for a
  -- rewrite; cleared once the next scheduled-task run applies it (see
  -- scripts/apply-revision.mjs). Only meaningful while status='draft'.
  pending_revision text
);

create index if not exists articles_status_idx on public.articles (status);

alter table public.articles enable row level security;
-- No policies: only the service-role key can read or write this table.
