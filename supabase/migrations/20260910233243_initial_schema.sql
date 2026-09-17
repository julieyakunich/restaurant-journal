-- ============================================================================
-- Restaurant Journal — initial schema
-- Mirrors the frontend domain models in src/data/types.ts. Nested value objects
-- (review checklist, mcas presets, profile triggers) are stored as jsonb with
-- the SAME camelCase keys the app uses, so the mapper layer is a thin pass-through.
--
-- NOTE: the access model here was a wide-open prototype (anonymous read/write).
-- It is replaced by 20260910234337_auth_and_ownership.sql.
-- ============================================================================

create table public.restaurants (
  id                          text primary key,
  name                        text not null,
  city                        text not null,
  country                     text not null,
  neighborhood                text not null default '',
  cuisine                     text[] not null default '{}',
  price_level                 smallint not null default 2 check (price_level between 1 and 4),
  distance_km                 numeric(6,2) not null default 0,
  lat                         double precision not null default 0,
  lng                         double precision not null default 0,
  confidence                  text not null default 'no-data'
                                check (confidence in ('verified-safe','some-reports','no-data')),
  last_verified_at            date,
  safe_for_allergens          text[] not null default '{}',
  caution_allergens           text[] not null default '{}',
  accommodates_mcas           boolean not null default false,
  low_histamine_options       boolean not null default false,
  cooks_to_order              boolean not null default false,
  has_dedicated_allergen_menu boolean not null default false,
  has_separate_fryer          boolean not null default false,
  summary                     text not null default '',
  safe_snacks                 text[] not null default '{}',
  open_now                    boolean not null default false,
  hours                       text not null default '',
  phone                       text,
  created_at                  timestamptz not null default now()
);

create table public.reviews (
  id                 text primary key,
  restaurant_id      text not null references public.restaurants(id) on delete cascade,
  author_name        text not null,
  visited_at         date not null,
  reviewer_allergens text[] not null default '{}',
  reviewer_has_mcas  boolean not null default false,
  trust_rating       smallint not null check (trust_rating between 1 and 5),
  checklist          jsonb not null default '{}'::jsonb,
  reaction_occurred  boolean not null default false,
  reaction_severity  text check (reaction_severity in ('mild','moderate','severe','anaphylaxis')),
  would_return       boolean not null default true,
  comment            text not null default '',
  created_at         timestamptz not null default now()
);
create index reviews_restaurant_id_idx on public.reviews (restaurant_id);
create index reviews_visited_at_idx    on public.reviews (visited_at desc);

create table public.profiles (
  id                      text primary key,
  display_name            text not null default '',
  mcas_mode               boolean not null default false,
  mcas_presets            jsonb not null default '{}'::jsonb,
  triggers                jsonb not null default '[]'::jsonb,
  additional_notes        text not null default '',
  preferred_card_language text not null default 'en',
  updated_at              timestamptz not null default now()
);

create table public.trips (
  id                   text primary key,
  destination          text not null,
  country              text not null,
  start_date           date not null,
  end_date             date not null,
  status               text not null default 'planning'
                         check (status in ('planning','active','past')),
  saved_restaurant_ids text[] not null default '{}',
  notes                text not null default '',
  created_at           timestamptz not null default now()
);
create index trips_created_at_idx on public.trips (created_at desc);

create table public.destinations (
  id               text primary key,
  city             text not null,
  country          text not null,
  restaurant_count integer not null default 0,
  blurb            text not null default '',
  sort_order       integer not null default 0
);

alter table public.restaurants  enable row level security;
alter table public.reviews      enable row level security;
alter table public.profiles     enable row level security;
alter table public.trips        enable row level security;
alter table public.destinations enable row level security;

grant usage on schema public to anon, authenticated;
grant select                         on public.restaurants  to anon, authenticated;
grant select                         on public.destinations to anon, authenticated;
grant select, insert                 on public.reviews      to anon, authenticated;
grant select, insert, update         on public.profiles     to anon, authenticated;
grant select, insert, update, delete on public.trips        to anon, authenticated;

create policy "anon read restaurants"
  on public.restaurants for select to anon, authenticated using (true);
create policy "anon read destinations"
  on public.destinations for select to anon, authenticated using (true);
create policy "anon read reviews"
  on public.reviews for select to anon, authenticated using (true);
create policy "anon insert reviews"
  on public.reviews for insert to anon, authenticated with check (true);
create policy "anon read profiles"
  on public.profiles for select to anon, authenticated using (true);
create policy "anon insert profiles"
  on public.profiles for insert to anon, authenticated with check (true);
create policy "anon update profiles"
  on public.profiles for update to anon, authenticated using (true) with check (true);
create policy "anon read trips"
  on public.trips for select to anon, authenticated using (true);
create policy "anon insert trips"
  on public.trips for insert to anon, authenticated with check (true);
create policy "anon update trips"
  on public.trips for update to anon, authenticated using (true) with check (true);
create policy "anon delete trips"
  on public.trips for delete to anon, authenticated using (true);
