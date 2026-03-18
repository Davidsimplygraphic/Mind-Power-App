create extension if not exists pgcrypto;

create table if not exists public.consistency_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0 and char_length(title) <= 80),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.consistency_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consistency_item_id uuid not null references public.consistency_items(id) on delete cascade,
  log_date date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists consistency_logs_user_item_day_key
  on public.consistency_logs (user_id, consistency_item_id, log_date);

alter table public.consistency_items enable row level security;
alter table public.consistency_logs enable row level security;

drop policy if exists "Users can view their own consistency items" on public.consistency_items;
create policy "Users can view their own consistency items"
  on public.consistency_items
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own consistency items" on public.consistency_items;
create policy "Users can create their own consistency items"
  on public.consistency_items
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own consistency items" on public.consistency_items;
create policy "Users can update their own consistency items"
  on public.consistency_items
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own consistency items" on public.consistency_items;
create policy "Users can delete their own consistency items"
  on public.consistency_items
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own consistency logs" on public.consistency_logs;
create policy "Users can view their own consistency logs"
  on public.consistency_logs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own consistency logs" on public.consistency_logs;
create policy "Users can create their own consistency logs"
  on public.consistency_logs
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own consistency logs" on public.consistency_logs;
create policy "Users can update their own consistency logs"
  on public.consistency_logs
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own consistency logs" on public.consistency_logs;
create policy "Users can delete their own consistency logs"
  on public.consistency_logs
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
