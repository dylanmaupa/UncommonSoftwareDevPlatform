-- Add gender and avatar_url to profiles
alter table public.profiles
  add column if not exists gender text check (gender in ('female','male')),
  add column if not exists avatar_url text;

-- Update handle_new_user to include gender/avatar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, hub_location, gender, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'hub_location',
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;
