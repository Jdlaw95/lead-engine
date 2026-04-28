-- ============================================================
-- Lead Engine System — Database Schema
-- Run this once in Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

create table public.businesses (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  owner_email text not null,
  branding    jsonb not null default '{}',
  settings    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- Links auth.users → businesses (standard Supabase pattern)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  role        text not null default 'owner',
  created_at  timestamptz not null default now()
);

create table public.services (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name        text not null,
  description text,
  is_active   boolean not null default true,
  sort_order  int not null default 0
);

create table public.leads (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id  uuid references public.services(id),
  name        text not null,
  email       text not null,
  phone       text,
  message     text,
  status      text not null default 'new'
                check (status in ('new', 'contacted', 'quoted', 'closed', 'lost')),
  metadata    jsonb not null default '{}',
  file_urls   text[] not null default '{}',
  source      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.messages (
  id          uuid primary key default uuid_generate_v4(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  type        text not null
                check (type in ('email_sent', 'note', 'follow_up', 'status_change')),
  content     text not null,
  sent_by     uuid references auth.users(id),
  resend_id   text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at on leads
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on public.leads
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile when a new auth user is created
-- business_id must be passed in user metadata during sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  if new.raw_user_meta_data->>'business_id' is not null then
    insert into public.profiles (id, business_id, role)
    values (
      new.id,
      (new.raw_user_meta_data->>'business_id')::uuid,
      coalesce(new.raw_user_meta_data->>'role', 'owner')
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.businesses enable row level security;
alter table public.profiles   enable row level security;
alter table public.services   enable row level security;
alter table public.leads      enable row level security;
alter table public.messages   enable row level security;

-- businesses: owner can read/update their own row
create policy "businesses_owner_select" on public.businesses
  for select using (
    id in (select business_id from public.profiles where id = auth.uid())
  );

create policy "businesses_owner_update" on public.businesses
  for update using (
    id in (select business_id from public.profiles where id = auth.uid())
  );

-- profiles: users can read their own profile
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

-- services: public read (needed for lead forms), owner full control
create policy "services_public_select" on public.services
  for select using (is_active = true);

create policy "services_owner_all" on public.services
  for all using (
    business_id in (select business_id from public.profiles where id = auth.uid())
  );

-- leads: owner can read/update their own leads
-- inserts are handled server-side with service role key (bypasses RLS)
create policy "leads_owner_select" on public.leads
  for select using (
    business_id in (select business_id from public.profiles where id = auth.uid())
  );

create policy "leads_owner_update" on public.leads
  for update using (
    business_id in (select business_id from public.profiles where id = auth.uid())
  );

-- messages: owner can read their own
create policy "messages_owner_select" on public.messages
  for select using (
    business_id in (select business_id from public.profiles where id = auth.uid())
  );

-- ============================================================
-- STORAGE
-- ============================================================

insert into storage.buckets (id, name, public)
values ('lead-files', 'lead-files', false);

-- Service role can upload (used by the API route)
create policy "lead_files_service_upload" on storage.objects
  for insert with check (bucket_id = 'lead-files');

-- Business owners can read their own files only
create policy "lead_files_owner_read" on storage.objects
  for select using (
    bucket_id = 'lead-files'
    and (storage.foldername(name))[1] in (
      select business_id::text from public.profiles where id = auth.uid()
    )
  );
