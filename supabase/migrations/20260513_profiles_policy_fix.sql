-- Fix recursive RLS evaluation on public.profiles policies.
-- Previous admin policies queried public.profiles inside USING/WITH CHECK,
-- which can trigger "infinite recursion detected in policy" on select/update.

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
