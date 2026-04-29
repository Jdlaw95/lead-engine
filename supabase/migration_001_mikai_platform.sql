-- ============================================================
-- Mikai Platform — Migration 001
-- Extends the base schema into a full multi-tenant SaaS platform
-- Run in Supabase SQL Editor after the initial schema.sql
-- ============================================================

-- ── Extend businesses table ──────────────────────────────────

alter table public.businesses
  add column if not exists modules text[] not null default '{lead_capture}',
  add column if not exists plan    text not null default 'starter';

-- ── clients ─────────────────────────────────────────────────
-- Repeat customers (distinct from one-time leads)

create table public.clients (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name        text not null,
  email       text not null,
  phone       text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ── availability ─────────────────────────────────────────────
-- Weekly schedule + specific date blocks per business

create table public.availability (
  id            uuid primary key default uuid_generate_v4(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  day_of_week   int check (day_of_week between 0 and 6),  -- 0=Sun, 6=Sat
  specific_date date,                                       -- overrides day_of_week if set
  start_time    time not null,
  end_time      time not null,
  is_blocked    boolean not null default false,             -- true = unavailable (holiday, break)
  constraint availability_day_or_date check (
    (day_of_week is not null and specific_date is null) or
    (day_of_week is null and specific_date is not null)
  )
);

-- ── bookings ─────────────────────────────────────────────────

create table public.bookings (
  id             uuid primary key default uuid_generate_v4(),
  business_id    uuid not null references public.businesses(id) on delete cascade,
  client_id      uuid references public.clients(id),
  service_id     uuid references public.services(id),
  -- Snapshot service details at booking time so history survives edits
  service_name   text,
  service_price  numeric,
  service_duration_minutes int,
  date           date not null,
  start_time     time not null,
  end_time       time not null,
  status         text not null default 'pending'
                   check (status in ('pending','confirmed','cancelled','completed','no_show')),
  deposit_paid   boolean not null default false,
  deposit_amount numeric,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.handle_updated_at();

-- ── payments ─────────────────────────────────────────────────

create table public.payments (
  id                  uuid primary key default uuid_generate_v4(),
  business_id         uuid not null references public.businesses(id) on delete cascade,
  booking_id          uuid references public.bookings(id),
  amount              numeric not null,
  currency            text not null default 'ZAR',
  provider            text not null check (provider in ('payfast', 'stripe')),
  provider_payment_id text,
  status              text not null default 'pending'
                        check (status in ('pending','completed','failed','refunded')),
  metadata            jsonb not null default '{}',
  created_at          timestamptz not null default now()
);

-- ── website_content ───────────────────────────────────────────
-- Editable per-business public website sections

create table public.website_content (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  section     text not null
                check (section in ('hero','services','gallery','testimonials','about','contact','faq')),
  content     jsonb not null default '{}',
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  unique (business_id, section)
);

-- ── superadmin ───────────────────────────────────────────────
-- Identifies which auth users are platform admins (Jason)

create table public.superadmins (
  id         uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ── RLS ──────────────────────────────────────────────────────

alter table public.clients          enable row level security;
alter table public.availability     enable row level security;
alter table public.bookings         enable row level security;
alter table public.payments         enable row level security;
alter table public.website_content  enable row level security;
alter table public.superadmins      enable row level security;

-- Helper: is the current user a superadmin?
create or replace function public.is_superadmin()
returns boolean as $$
  select exists (
    select 1 from public.superadmins where id = auth.uid()
  );
$$ language sql security definer;

-- Helper: what business does the current user belong to?
create or replace function public.my_business_id()
returns uuid as $$
  select business_id from public.profiles where id = auth.uid();
$$ language sql security definer;

-- clients
create policy "clients_owner_all" on public.clients
  for all using (business_id = public.my_business_id());

create policy "clients_superadmin_all" on public.clients
  for all using (public.is_superadmin());

-- availability: public read (for booking form), owner full control
create policy "availability_public_select" on public.availability
  for select using (true);

create policy "availability_owner_all" on public.availability
  for all using (business_id = public.my_business_id());

create policy "availability_superadmin_all" on public.availability
  for all using (public.is_superadmin());

-- bookings: public can insert (booking form), owner manages
create policy "bookings_public_insert" on public.bookings
  for insert with check (true);

create policy "bookings_owner_all" on public.bookings
  for all using (business_id = public.my_business_id());

create policy "bookings_superadmin_all" on public.bookings
  for all using (public.is_superadmin());

-- payments: owner read, service role handles inserts
create policy "payments_owner_select" on public.payments
  for select using (business_id = public.my_business_id());

create policy "payments_superadmin_all" on public.payments
  for all using (public.is_superadmin());

-- website_content: public read (for public sites), owner manages
create policy "website_content_public_select" on public.website_content
  for select using (is_active = true);

create policy "website_content_owner_all" on public.website_content
  for all using (business_id = public.my_business_id());

create policy "website_content_superadmin_all" on public.website_content
  for all using (public.is_superadmin());

-- superadmins: only superadmins can read the table
create policy "superadmins_self_select" on public.superadmins
  for select using (id = auth.uid());

-- ── Indexes ──────────────────────────────────────────────────
-- Speed up the most common queries

create index on public.bookings (business_id, date);
create index on public.bookings (client_id);
create index on public.availability (business_id, day_of_week);
create index on public.clients (business_id);
create index on public.payments (booking_id);
create index on public.website_content (business_id, section);
