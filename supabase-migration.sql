-- Run this in Supabase SQL Editor

-- Add new profile fields
alter table profiles
  add column if not exists sport text default 'none',
  add column if not exists sport_frequency text,
  add column if not exists injuries text default 'none',
  add column if not exists wake_time text default '6:00 AM',
  add column if not exists sleep_time text default '10:30 PM',
  add column if not exists gym_access text default 'full_gym',
  add column if not exists diet_type text default 'non_vegetarian';

-- New table to store AI generated plans
create table if not exists ai_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  plan jsonb not null,
  generated_at timestamp default now(),
  updated_at timestamp default now()
);

alter table ai_plans enable row level security;

create policy "Own plan only" on ai_plans
  for all using (auth.uid() = user_id);
