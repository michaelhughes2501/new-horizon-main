-- 006_blocks_reports.sql
-- User blocking and abuse reporting

create table if not exists public.blocks (
  id         bigserial primary key,
  blocker    uuid not null references public.profiles(id) on delete cascade,
  blocked    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker, blocked),
  check (blocker <> blocked)
);

alter table public.blocks enable row level security;

create policy "Users can view their own blocks"
  on public.blocks for select
  using (auth.uid() = blocker);

create policy "Users can block others"
  on public.blocks for insert
  with check (auth.uid() = blocker);

create policy "Users can unblock"
  on public.blocks for delete
  using (auth.uid() = blocker);

-- ----------------------------------------------------------------
create type public.report_reason as enum (
  'spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other'
);

create table if not exists public.reports (
  id          bigserial primary key,
  reporter    uuid not null references public.profiles(id) on delete cascade,
  reported    uuid not null references public.profiles(id) on delete cascade,
  reason      public.report_reason not null,
  detail      text,
  created_at  timestamptz not null default now(),
  check (reporter <> reported)
);

alter table public.reports enable row level security;

create policy "Users can submit reports"
  on public.reports for insert
  with check (auth.uid() = reporter);
