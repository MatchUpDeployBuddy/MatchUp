-- Cleanup-Skript

-- Drop Row Level Security Policies
alter table event_participants disable row level security;
alter table events disable row level security;
alter table users disable row level security;

-- Drop Tables
drop table if exists event_participants cascade;
drop table if exists events cascade;
drop table if exists users cascade;

-- Drop Trigger
drop trigger if exists on_auth_user_created on auth.users;

-- Drop Function
drop function if exists public.handle_new_user cascade;

-- Remove PostGIS extension
drop extension if exists postgis cascade;
