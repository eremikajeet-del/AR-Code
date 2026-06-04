-- Run this in Supabase SQL Editor

-- Create whitelist table
create table if not exists public.allowed_users (
  email text primary key,
  added_at timestamptz default now()
);

-- Enable RLS
alter table public.allowed_users enable row level security;

-- Allow anyone to check if their email is allowed (needed for the access check)
create policy "Public can check allowed emails"
  on public.allowed_users
  for select
  using (true);

-- Add your invited emails below (replace with real emails)
insert into public.allowed_users (email) values
  ('owner@youremail.com'),
  ('staff@youremail.com')
on conflict (email) do nothing;
