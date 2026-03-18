create extension if not exists pgcrypto;

create table if not exists public.exercise_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  user_program_id uuid not null references public.user_programs(id) on delete cascade,
  week_number int not null check (week_number between 1 and 4),
  day_number int not null check (day_number between 1 and 28),
  section_id text not null check (char_length(trim(section_id)) > 0 and char_length(section_id) <= 120),
  response_text text,
  response_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists exercise_responses_user_program_day_section_key
  on public.exercise_responses (user_program_id, day_number, section_id);

create index if not exists exercise_responses_user_run_day_idx
  on public.exercise_responses (user_id, user_program_id, day_number);

alter table public.exercise_responses enable row level security;

drop policy if exists "Users can view their own exercise responses" on public.exercise_responses;
create policy "Users can view their own exercise responses"
  on public.exercise_responses
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own exercise responses" on public.exercise_responses;
create policy "Users can create their own exercise responses"
  on public.exercise_responses
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own exercise responses" on public.exercise_responses;
create policy "Users can update their own exercise responses"
  on public.exercise_responses
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own exercise responses" on public.exercise_responses;
create policy "Users can delete their own exercise responses"
  on public.exercise_responses
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
