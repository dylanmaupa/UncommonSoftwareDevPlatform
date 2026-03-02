-- Create a table for user profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('student', 'instructor')),
  hub_location text
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies so users can manage their own profile and instructors can view students
create policy "Profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a function to handle new user signups
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
    new.raw_user_meta_data->>'hub_location'
  );
  return new;
end;
$$;

-- Create a trigger that calls the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

