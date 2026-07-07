-- 003_matches.sql
-- Mutual match between two users (created automatically by trigger in 002)

create table if not exists public.matches (
  id         bigserial primary key,
  user_one   uuid not null references public.profiles(id) on delete cascade,
  user_two   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Canonical ordering: user_one < user_two prevents duplicate pairs
  unique (user_one, user_two),
  check (user_one < user_two)
);

-- Row-Level Security
alter table public.matches enable row level security;

create policy "Users can view their own matches"
  on public.matches for select
  using (auth.uid() = user_one or auth.uid() = user_two);
