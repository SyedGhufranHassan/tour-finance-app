create extension if not exists pgcrypto;

create type public.payment_method as enum ('Cash', 'Bank Transfer', 'Easypaisa', 'JazzCash', 'Other Online');
create type public.expense_category as enum ('Vehicle', 'Fuel', 'Accommodation', 'Food', 'Toll / Tax', 'Other');

create table public.tours (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  origin text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table public.tour_members (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  name text not null,
  phone text,
  expected_contribution numeric(12,2) not null default 0 check (expected_contribution >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.income_transactions (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  member_id uuid not null references public.tour_members(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  payment_method public.payment_method not null,
  received_by_person_id uuid not null references public.people(id) on delete restrict,
  transaction_date date not null,
  transaction_time time not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expense_transactions (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  category public.expense_category not null,
  amount numeric(12,2) not null check (amount > 0),
  description text not null,
  paid_by_person_id uuid not null references public.people(id) on delete restrict,
  payment_method public.payment_method not null,
  location text not null,
  expense_date date not null,
  expense_time time not null,
  notes text,
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

create index income_tour_date_idx on public.income_transactions(tour_id, transaction_date);
create index expenses_tour_date_idx on public.expense_transactions(tour_id, expense_date);
create index expenses_category_idx on public.expense_transactions(tour_id, category);

create or replace function public.is_tour_owner(tour uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.tours where id = tour and owner_id = auth.uid()) $$;

alter table public.tours enable row level security;
alter table public.tour_members enable row level security;
alter table public.people enable row level security;
alter table public.income_transactions enable row level security;
alter table public.expense_transactions enable row level security;
alter table public.audit_logs enable row level security;

create policy "owners manage tours" on public.tours for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners manage tour members" on public.tour_members for all using (public.is_tour_owner(tour_id)) with check (public.is_tour_owner(tour_id));
create policy "owners manage people" on public.people for all using (public.is_tour_owner(tour_id)) with check (public.is_tour_owner(tour_id));
create policy "owners manage income" on public.income_transactions for all using (public.is_tour_owner(tour_id)) with check (public.is_tour_owner(tour_id));
create policy "owners manage expenses" on public.expense_transactions for all using (public.is_tour_owner(tour_id)) with check (public.is_tour_owner(tour_id));
create policy "owners read audit logs" on public.audit_logs for select using (public.is_tour_owner(tour_id));

insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false) on conflict (id) do nothing;
create policy "owners manage receipts" on storage.objects for all using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]) with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
