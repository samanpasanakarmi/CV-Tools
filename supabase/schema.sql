-- CV Studio cloud schema. Run this once in the Supabase SQL Editor.
-- Only the authenticated owner may read or change their own records.
-- This migration does not create public profiles or public CVs.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  company text not null default '',
  target_role text not null default '',
  document jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cvs_owner_idx on public.cvs(user_id);

alter table public.profiles enable row level security;
alter table public.cvs enable row level security;

-- SQL GRANTs and RLS are separate layers. Deny anonymous API access.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.cvs from anon, authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.cvs to authenticated;

drop policy if exists "profile_owner_read" on public.profiles;
drop policy if exists "profile_owner_insert" on public.profiles;
drop policy if exists "profile_owner_update" on public.profiles;
drop policy if exists "profile_owner_delete" on public.profiles;
create policy "profile_owner_read" on public.profiles for select to authenticated
 using ((select auth.uid()) = user_id);
create policy "profile_owner_insert" on public.profiles for insert to authenticated
 with check ((select auth.uid()) = user_id);
create policy "profile_owner_update" on public.profiles for update to authenticated
 using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "profile_owner_delete" on public.profiles for delete to authenticated
 using ((select auth.uid()) = user_id);

drop policy if exists "cv_owner_read" on public.cvs;
drop policy if exists "cv_owner_insert" on public.cvs;
drop policy if exists "cv_owner_update" on public.cvs;
drop policy if exists "cv_owner_delete" on public.cvs;
create policy "cv_owner_read" on public.cvs for select to authenticated
 using ((select auth.uid()) = user_id);
create policy "cv_owner_insert" on public.cvs for insert to authenticated
 with check ((select auth.uid()) = user_id);
create policy "cv_owner_update" on public.cvs for update to authenticated
 using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "cv_owner_delete" on public.cvs for delete to authenticated
 using ((select auth.uid()) = user_id);

-- Avoid granting privileges to PUBLIC. No service_role/secret keys in frontend.
-- The customer must approve data retention, privacy notice and account deletion.

-- v0.5: atomic self-service removal of CV content only (NOT Auth account).
-- SECURITY INVOKER is deliberate: the caller's table grants and RLS still apply.
create or replace function public.clear_my_cv_data()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  delete from public.cvs where user_id = (select auth.uid());
  delete from public.profiles where user_id = (select auth.uid());
end;
$$;
revoke all on function public.clear_my_cv_data() from public, anon, authenticated;
grant execute on function public.clear_my_cv_data() to authenticated;

-- Keep an accurate updated_at for audit/debug and dashboard sort.
create or replace function public.cvstudio_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists cvstudio_profiles_updated on public.profiles;
create trigger cvstudio_profiles_updated before update on public.profiles
for each row execute function public.cvstudio_set_updated_at();
drop trigger if exists cvstudio_cvs_updated on public.cvs;
create trigger cvstudio_cvs_updated before update on public.cvs
for each row execute function public.cvstudio_set_updated_at();
