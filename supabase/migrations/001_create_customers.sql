create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company_name text,
  email text not null,
  phone text,
  street text,
  house_number text,
  postal_code text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_user_id_idx on public.customers (user_id);
create index if not exists customers_user_id_lower_name_idx on public.customers (user_id, lower(name));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

alter table public.customers enable row level security;

drop policy if exists "Customers can select their own records" on public.customers;
create policy "Customers can select their own records" on public.customers for select using (auth.uid() = user_id);
drop policy if exists "Customers can insert their own records" on public.customers;
create policy "Customers can insert their own records" on public.customers for insert with check (auth.uid() = user_id);
drop policy if exists "Customers can update their own records" on public.customers;
create policy "Customers can update their own records" on public.customers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Customers can delete their own records" on public.customers;
create policy "Customers can delete their own records" on public.customers for delete using (auth.uid() = user_id);
