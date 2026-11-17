-- CV Studio v0.7: server-enforced per-user request quota (UTC day).
-- Run AFTER supabase/schema.sql in Supabase SQL Editor.
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  request_count integer not null default 0 check (request_count between 0 and 5),
  primary key(user_id,usage_day)
);
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from public, anon, authenticated;
-- No direct client access to ai_usage. Only this SECURITY DEFINER RPC may write it.
create or replace function public.consume_ai_quota()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  updated_count integer;
begin
  if caller is null then return false; end if;
  insert into public.ai_usage(user_id,usage_day,request_count)
  values(caller,(now() at time zone 'utc')::date,1)
  on conflict (user_id,usage_day) do update
    set request_count = public.ai_usage.request_count + 1
    where public.ai_usage.request_count < 5
  returning request_count into updated_count;
  return updated_count is not null;
end;
$$;
revoke all on function public.consume_ai_quota() from public, anon, authenticated;
grant execute on function public.consume_ai_quota() to authenticated;
