-- Erweiterung für PostGIS installieren
create extension if not exists postgis;

create table users (
    id uuid not null references auth.users on delete cascade,
    name varchar(100) not null unique,
    updated_at timestamp default now(),
    primary key (id)
);

alter table users enable row level security;

create policy "Public users are viewable by everyone." on users 
for select 
using (true);

create policy "Users can update own profile." on users 
for update 
to authenticated
using ( (select auth.uid()) = id)
with check ( (select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Überprüfen, ob der Name vorhanden ist, und einen Standardwert setzen
  insert into public.users (id, name)
  values (NEW.id, NEW.raw_user_meta_data ->> 'name');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert ON auth.users
for each row
execute function public.handle_new_user();


create table events (
    id uuid primary key default gen_random_uuid(),
    creator_id uuid references users(id) on delete cascade,
    sport varchar(50) not null,
    participants_needed int not null check (participants_needed > 0),
    skill_level varchar(50) not null,
    event_time timestamp not null,
    description text,
    location geography(point, 4326), -- geospalte für standort
    created_at timestamp default now(),
    updated_at timestamp default now()
);

create index idx_events_location on events using gist (location);

alter table events enable row level security;

create policy "public events are viewable by everyone." on events
for select
using (true);

create policy "users can insert events." on events
for insert
with check ( (select auth.uid()) = creator_id);

create policy "users can update their own events." on events
for update
using ( (select auth.uid()) = creator_id)
with check ( (select auth.uid()) = creator_id);

create policy "users can delete their own events." on events
for delete
using ( (select auth.uid()) = creator_id);



create table event_participants (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references events(id) on delete cascade,
    joined_user_id uuid references users(id) on delete cascade,
    joined_at timestamp default now(),
    unique (event_id, joined_user_id) 
);

alter table event_participants enable row level security;

create policy "event participants are viewable by everyone." on event_participants
for select
using (true);
