-- 002_likes.sql
-- Directional like/swipe between two users

create table if not exists public.likes (
  id         bigserial primary key,
  sender     uuid not null references public.profiles(id) on delete cascade,
  receiver   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (sender, receiver)
);

-- Row-Level Security
alter table public.likes enable row level security;

create policy "Users can see their own sent likes"
  on public.likes for select
  using (auth.uid() = sender);

create policy "Users can insert their own likes"
  on public.likes for insert
  with check (auth.uid() = sender);

create policy "Users can delete their own likes"
  on public.likes for delete
  using (auth.uid() = sender);

-- Auto-create a match when both users have liked each other
create or replace function public.create_match_on_mutual_like()
returns trigger language plpgsql security definer as $$
begin
  if exists (
    select 1 from public.likes
    where sender = new.receiver
      and receiver = new.sender
  ) then
    insert into public.matches (user_one, user_two)
    values (least(new.sender, new.receiver),
            greatest(new.sender, new.receiver))
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create or replace trigger likes_mutual_match
  after insert on public.likes
  for each row execute procedure public.create_match_on_mutual_like();
