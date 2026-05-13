create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  has_profiles_table boolean;
  result boolean;
begin
  select to_regclass('public.profiles') is not null into has_profiles_table;

  if not has_profiles_table then
    return false;
  end if;

  execute $q$
    select exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  $q$
  into result;

  return coalesce(result, false);
end;
$$;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default '',
  description text not null default '',
  features text not null default '',
  price text not null default '',
  "ctaLabel" text not null default 'View Details',
  image text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  amount numeric not null check (amount >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  villa_id text,
  guest_name text not null,
  email text not null,
  phone text,
  check_in date not null,
  check_out date not null,
  guests integer not null default 1 check (guests > 0),
  total_price numeric not null check (total_price >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  paid_amount numeric check (paid_amount is null or paid_amount >= 0),
  platform_fee numeric check (platform_fee is null or platform_fee >= 0),
  net_amount numeric check (net_amount is null or net_amount >= 0),
  payment_intent_id text,
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_date_range_check check (check_out > check_in)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  amount numeric not null check (amount >= 0),
  platform_fee numeric check (platform_fee is null or platform_fee >= 0),
  net_amount numeric check (net_amount is null or net_amount >= 0),
  payment_method text,
  payment_intent_id text,
  gateway text not null default 'paymongo',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  transaction_ref text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.villa_availability (
  id uuid primary key default gen_random_uuid(),
  villa_id text not null,
  date date not null,
  is_available boolean not null default true,
  booking_id uuid references public.bookings(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (villa_id, date)
);

create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_check_in_out on public.bookings(check_in, check_out);
create index if not exists idx_bookings_villa_id on public.bookings(villa_id);
create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_payments_payment_intent_id on public.payments(payment_intent_id);
create index if not exists idx_villa_availability_villa_date on public.villa_availability(villa_id, date);
create index if not exists idx_discounts_code on public.discounts(code);

drop trigger if exists on_rooms_updated on public.rooms;
create trigger on_rooms_updated
before update on public.rooms
for each row execute procedure public.set_updated_at();

drop trigger if exists on_amenities_updated on public.amenities;
create trigger on_amenities_updated
before update on public.amenities
for each row execute procedure public.set_updated_at();

drop trigger if exists on_discounts_updated on public.discounts;
create trigger on_discounts_updated
before update on public.discounts
for each row execute procedure public.set_updated_at();

drop trigger if exists on_bookings_updated on public.bookings;
create trigger on_bookings_updated
before update on public.bookings
for each row execute procedure public.set_updated_at();

drop trigger if exists on_payments_updated on public.payments;
create trigger on_payments_updated
before update on public.payments
for each row execute procedure public.set_updated_at();

drop trigger if exists on_villa_availability_updated on public.villa_availability;
create trigger on_villa_availability_updated
before update on public.villa_availability
for each row execute procedure public.set_updated_at();

alter table public.rooms enable row level security;
alter table public.amenities enable row level security;
alter table public.discounts enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.villa_availability enable row level security;

drop policy if exists "Public can create bookings" on public.bookings;
create policy "Public can create bookings"
on public.bookings
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can read active booking windows" on public.bookings;
create policy "Public can read active booking windows"
on public.bookings
for select
to anon, authenticated
using (status in ('pending', 'confirmed'));

drop policy if exists "Admin manage bookings" on public.bookings;
create policy "Admin manage bookings"
on public.bookings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin manage rooms" on public.rooms;
create policy "Admin manage rooms"
on public.rooms
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin manage amenities" on public.amenities;
create policy "Admin manage amenities"
on public.amenities
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin manage discounts" on public.discounts;
create policy "Admin manage discounts"
on public.discounts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read active discounts" on public.discounts;
create policy "Public can read active discounts"
on public.discounts
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admin and service read payments" on public.payments;
create policy "Admin and service read payments"
on public.payments
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admin and service manage payments" on public.payments;
create policy "Admin and service manage payments"
on public.payments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public read villa availability" on public.villa_availability;
create policy "Public read villa availability"
on public.villa_availability
for select
to anon, authenticated
using (true);

drop policy if exists "Admin manage villa availability" on public.villa_availability;
create policy "Admin manage villa availability"
on public.villa_availability
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
