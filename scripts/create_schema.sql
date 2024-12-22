-- install extension for postgis
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

REVOKE UPDATE ON TABLE users FROM public;
GRANT UPDATE (name) ON TABLE users TO public;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Check whether the name exists and set a default value
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

REVOKE INSERT (id, created_at, updated_at) ON TABLE events FROM public;
REVOKE UPDATE (id, created_at) ON TABLE events FROM public;



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




create type request_status as enum ('pending', 'accepted', 'rejected');

create table event_requests (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references events(id) on delete cascade,
    requester_id uuid references users(id) on delete cascade,
    status request_status not null default 'pending', 
    created_at timestamp default now(),
    unique (event_id, requester_id) 
);

alter table event_requests enable row level security;

create policy "users can request to join events" on event_requests
for insert
with check ((select auth.uid()) = requester_id);

create policy "event creators can view requests for their events" on event_requests
for select
using ((select auth.uid()) in (select creator_id from events where events.id = event_id));

create policy "event creators can manage requests" on event_requests
for update
using ((select auth.uid()) in (select creator_id from events where events.id = event_id));

REVOKE INSERT (id, status, created_at) ON TABLE event_requests FROM public;
REVOKE UPDATE ON TABLE event_requests FROM public;
GRANT UPDATE (status) ON TABLE event_requests TO public;

create or replace function handle_request_accepted()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.status = 'accepted' then
    insert into event_participants (event_id, joined_user_id)
    values (new.event_id, new.requester_id);
  end if;
  return new;
end;
$$;

create trigger after_request_accepted
after update on event_requests
for each row
when (new.status = 'accepted')
execute function handle_request_accepted();
