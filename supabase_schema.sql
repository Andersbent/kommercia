--
-- Supabase schema for Kommercia
--

-- Create leads table
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  company text,
  status text not null default 'new',
  last_contact_date timestamp,
  next_task_date timestamp,
  warm_category text,
  email text,
  phone text,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create lead_sources table
create table if not exists public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text
);

-- Create interactions table
create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads on delete cascade,
  type text not null,
  interaction_date timestamp not null default now(),
  notes text,
  created_at timestamp default now()
);

-- Optional users table to mirror NextAuth users (auth.users cannot be updated via PostgREST). This table stores basic profile info for your app.
create table if not exists public.users (
  id uuid primary key,
  name text,
  email text,
  created_at timestamp default now()
);

-- Enable row level security for leads and restrict access to owner
alter table public.leads enable row level security;
create policy "Leads are owned" on public.leads
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
