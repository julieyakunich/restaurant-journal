-- ============================================================================
-- Move from the wide-open prototype access model to real per-user auth.
--   * profiles are keyed by auth.users.id (one row per user)
--   * trips are owned via user_id
--   * reviews carry an optional user_id
--   * restaurants + destinations stay world-readable to signed-in users
--   * a trigger seeds a profile row on signup
-- ============================================================================

-- 1. tear down the anonymous prototype policies + grants
drop policy if exists "anon read restaurants"  on public.restaurants;
drop policy if exists "anon read destinations" on public.destinations;
drop policy if exists "anon read reviews"      on public.reviews;
drop policy if exists "anon insert reviews"    on public.reviews;
drop policy if exists "anon read profiles"     on public.profiles;
drop policy if exists "anon insert profiles"   on public.profiles;
drop policy if exists "anon update profiles"   on public.profiles;
drop policy if exists "anon read trips"        on public.trips;
drop policy if exists "anon insert trips"      on public.trips;
drop policy if exists "anon update trips"      on public.trips;
drop policy if exists "anon delete trips"      on public.trips;

revoke all on public.restaurants  from anon;
revoke all on public.destinations from anon;
revoke all on public.reviews      from anon;
revoke all on public.profiles     from anon;
revoke all on public.trips        from anon;

-- 2. re-key profiles to auth.users
delete from public.profiles;                 -- drop the shared 'user-sample' row
alter table public.profiles
  alter column id type uuid using (id::text::uuid);
alter table public.profiles
  add constraint profiles_id_fkey foreign key (id)
  references auth.users (id) on delete cascade;

-- 3. give trips an owner
delete from public.trips;                     -- drop the demo trip (no owner)
alter table public.trips
  add column user_id uuid not null references auth.users (id) on delete cascade;
create index trips_user_id_idx on public.trips (user_id);

-- 4. optional review author
alter table public.reviews
  add column user_id uuid references auth.users (id) on delete set null;
create index reviews_user_id_idx on public.reviews (user_id);

-- 5. grants for signed-in users
grant select                         on public.restaurants  to authenticated;
grant select                         on public.destinations to authenticated;
grant select, insert                 on public.reviews      to authenticated;
grant select, insert, update         on public.profiles     to authenticated;
grant select, insert, update, delete on public.trips        to authenticated;

-- 6. ownership-scoped RLS
create policy "auth read restaurants"
  on public.restaurants for select to authenticated using (true);
create policy "auth read destinations"
  on public.destinations for select to authenticated using (true);

create policy "auth read reviews"
  on public.reviews for select to authenticated using (true);
create policy "auth insert own reviews"
  on public.reviews for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "own profile select"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "own profile insert"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "own profile update"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "own trips select"
  on public.trips for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "own trips insert"
  on public.trips for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "own trips update"
  on public.trips for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "own trips delete"
  on public.trips for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 7. seed a profile row whenever a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id, display_name, mcas_mode, mcas_presets, triggers,
    additional_notes, preferred_card_language, updated_at
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1)),
    false,
    '{"avoidFermented":false,"avoidAged":false,"avoidLeftovers":false,"avoidHighHistamine":false,"avoidAlcohol":false,"preferFreshlyCooked":false}'::jsonb,
    '[]'::jsonb,
    '',
    'en',
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
