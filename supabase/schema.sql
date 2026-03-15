create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  motivation_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  duration_days int not null default 28,
  created_at timestamptz not null default now()
);

create table if not exists public.program_weeks (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  week_number int not null check (week_number between 1 and 4),
  title text,
  audio_path text,
  exercise_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  started_at date not null,
  completed_at date,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  day_number int not null check (day_number between 1 and 28),
  week_number int not null check (week_number between 1 and 4),
  session_date date not null,
  exercise_completed boolean not null default false,
  reflection_text text,
  promise_kept boolean,
  created_at timestamptz not null default now()
);

create unique index if not exists programs_title_key on public.programs (title);
create unique index if not exists program_weeks_program_id_week_number_key
  on public.program_weeks (program_id, week_number);
create unique index if not exists user_programs_user_id_program_id_key
  on public.user_programs (user_id, program_id);
create unique index if not exists daily_sessions_user_program_day_key
  on public.daily_sessions (user_id, program_id, day_number);

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.program_weeks enable row level security;
alter table public.user_programs enable row level security;
alter table public.daily_sessions enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Authenticated users can read programs" on public.programs;
create policy "Authenticated users can read programs"
  on public.programs
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read program weeks" on public.program_weeks;
create policy "Authenticated users can read program weeks"
  on public.program_weeks
  for select
  to authenticated
  using (true);

drop policy if exists "Users can view their own user programs" on public.user_programs;
create policy "Users can view their own user programs"
  on public.user_programs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own user programs" on public.user_programs;
create policy "Users can create their own user programs"
  on public.user_programs
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own user programs" on public.user_programs;
create policy "Users can update their own user programs"
  on public.user_programs
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own sessions" on public.daily_sessions;
create policy "Users can view their own sessions"
  on public.daily_sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own sessions" on public.daily_sessions;
create policy "Users can create their own sessions"
  on public.daily_sessions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own sessions" on public.daily_sessions;
create policy "Users can update their own sessions"
  on public.daily_sessions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('mind-power-audio', 'mind-power-audio', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can read audio bucket metadata" on storage.buckets;
create policy "Authenticated users can read audio bucket metadata"
  on storage.buckets
  for select
  to authenticated
  using (id = 'mind-power-audio');

drop policy if exists "Authenticated users can read audio objects" on storage.objects;
create policy "Authenticated users can read audio objects"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'mind-power-audio');
