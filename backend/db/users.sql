create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  username text not null unique,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "Users can read all rows" on public.users;
create policy "Users can read all rows"
  on public.users
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users can update their own row" on public.users;
create policy "Users can update their own row"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
