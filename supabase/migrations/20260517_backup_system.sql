-- Migration: 20260517_backup_system.sql
-- Create backup settings table
create table if not exists public.backup_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Insert default configurations
insert into public.backup_settings (key, value)
values 
  ('backup_frequency', 'daily'), 
  ('auto_backup_on_booking', 'true')
on conflict (key) do update set value = excluded.value;

-- Create backups table
create table if not exists public.backups (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  backup_type text not null check (backup_type in ('auto', 'daily', 'weekly', 'manual')),
  data jsonb not null,
  record_counts jsonb not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.backup_settings enable row level security;
alter table public.backups enable row level security;

-- Policies: Admin only
drop policy if exists "Admin read backup_settings" on public.backup_settings;
create policy "Admin read backup_settings" on public.backup_settings
for select to authenticated using (public.is_admin());

drop policy if exists "Admin manage backup_settings" on public.backup_settings;
create policy "Admin manage backup_settings" on public.backup_settings
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin read backups" on public.backups;
create policy "Admin read backups" on public.backups
for select to authenticated using (public.is_admin());

drop policy if exists "Admin manage backups" on public.backups;
create policy "Admin manage backups" on public.backups
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Create automatic backup trigger function
create or replace function public.trigger_auto_backup()
returns trigger
language plpgsql
security definer
as $$
declare
  bookings_json json;
  rooms_json json;
  discounts_json json;
  amenities_json json;
  counts_json json;
  full_data json;
  is_enabled text;
begin
  -- Check if auto backup on booking is enabled
  select value into is_enabled from public.backup_settings where key = 'auto_backup_on_booking';
  if is_enabled is null or is_enabled != 'true' then
    return new;
  end if;

  -- Build snapshots of all tables
  select coalesce(json_agg(t), '[]'::json) into bookings_json from (select * from public.bookings) t;
  select coalesce(json_agg(t), '[]'::json) into rooms_json from (select * from public.rooms) t;
  select coalesce(json_agg(t), '[]'::json) into discounts_json from (select * from public.discounts) t;
  select coalesce(json_agg(t), '[]'::json) into amenities_json from (select * from public.amenities) t;

  -- Get sizes
  counts_json := json_build_object(
    'bookings', json_array_length(bookings_json),
    'rooms', json_array_length(rooms_json),
    'discounts', json_array_length(discounts_json),
    'amenities', json_array_length(amenities_json)
  );

  -- Package database state
  full_data := json_build_object(
    'bookings', bookings_json,
    'rooms', rooms_json,
    'discounts', discounts_json,
    'amenities', amenities_json
  );

  -- Insert backup entry
  insert into public.backups (filename, backup_type, data, record_counts)
  values (
    'auto_backup_' || to_char(now(), 'YYYYMMDD_HH24MISS') || '.json',
    'auto',
    full_data,
    counts_json
  );

  return new;
end;
$$;

-- Create the trigger on bookings
drop trigger if exists on_booking_received_backup on public.bookings;
create trigger on_booking_received_backup
after insert on public.bookings
for each row execute procedure public.trigger_auto_backup();
