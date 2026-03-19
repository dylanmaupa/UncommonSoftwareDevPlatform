-- Modify the existing profiles table to add specialization
alter table public.profiles
add column if not exists specialization text check (specialization in ('Digital Marketing', 'Product Design', 'Software Engineering'));

-- Update the handle_new_user function to also insert specialization
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, hub_location, specialization)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'hub_location',
    new.raw_user_meta_data->>'specialization'
  );
  return new;
end;
$$;
