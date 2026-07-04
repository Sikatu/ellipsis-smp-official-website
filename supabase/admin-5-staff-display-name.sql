-- Admin 5.0 staff display name safety migration

alter table public.admin_profiles
add column if not exists display_name text;

update public.admin_profiles
set display_name = split_part(email, '@', 1)
where display_name is null
   or trim(display_name) = ''
   or display_name like '%@%';
