-- install extension for postgis
create extension if not exists postgis;
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other', 'prefer-not-to-say');

create table users (
    id uuid not null references auth.users on delete cascade,
    name varchar(100) not null unique,
    updated_at timestamp default now(),
    username VARCHAR(50),
    birthday DATE,
    gender gender_enum,
    sport_interests TEXT[] NOT NULL DEFAULT '{}',
    city VARCHAR(100),
    profile_picture_url TEXT,
    is_profile_complete boolean,
    primary key (id)
);



alter table users enable row level security;

create policy "Public users are viewable by everyone." on users 
for select 
using (true);

CREATE POLICY "Users can update own profile."
  ON users 
  FOR UPDATE 
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
    creator_id uuid references users(id) on delete cascade not null,
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

CREATE POLICY "event creators can delete participants from their events" 
ON public.event_participants
FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM public.events e 
    WHERE e.id = event_participants.event_id 
    AND e.creator_id = auth.uid()
  )
);


CREATE OR REPLACE FUNCTION update_event_request_status_on_participant_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the status to 'rejected' for the specific user and event
  UPDATE public.event_requests
  SET status = 'rejected'
  WHERE requester_id = OLD.joined_user_id AND event_id = OLD.event_id;

  RETURN NULL; -- No need to return anything
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER participant_delete_trigger
AFTER DELETE ON public.event_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_event_request_status_on_participant_delete();




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

CREATE OR REPLACE FUNCTION handle_request_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM event_participants
      WHERE event_id = NEW.event_id AND joined_user_id = NEW.requester_id
    ) THEN
      INSERT INTO event_participants (event_id, joined_user_id)
      VALUES (NEW.event_id, NEW.requester_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


create trigger after_request_accepted
after update on event_requests
for each row
when (new.status = 'accepted')
execute function handle_request_accepted();



CREATE OR REPLACE FUNCTION delete_participant_on_reject()
RETURNS TRIGGER 
security definer
AS $$
BEGIN
  -- Check if the status is updated to 'rejected'
  IF NEW.status = 'rejected' THEN
    -- Delete the participant entry if it exists
    DELETE FROM public.event_participants
    WHERE event_id = NEW.event_id AND joined_user_id = NEW.requester_id;
  END IF;

  RETURN NEW; -- Return the new record
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reject_status_trigger
AFTER UPDATE OF status ON public.event_requests
FOR EACH ROW
when (new.status = 'rejected')
EXECUTE FUNCTION delete_participant_on_reject();



create table messages (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references events(id) on delete cascade,
    sender_id uuid references users(id) on delete cascade,
    content text not null,
    created_at timestamp default now()
);

alter table messages enable row level security;

create policy "Only participants can read messages in their events" 
on messages
for select
using (
  (select auth.uid()) in (
    select joined_user_id 
    from event_participants 
    where event_id = messages.event_id
  )
);

create policy "Only participants can insert messages in their events"
on messages
for insert
with check (
  (select auth.uid()) in (
    select joined_user_id 
    from event_participants 
    where event_id = messages.event_id
  )
);
