create table if not exists public.company_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_name text not null,
  owner_name text,
  email text,
  phone text,
  website text,
  street text,
  house_number text,
  postal_code text,
  city text,
  country text not null default 'Nederland',
  chamber_of_commerce text,
  vat_number text,
  iban text,
  default_validity_days integer not null default 14 check (default_validity_days > 0),
  default_payment_term_days integer not null default 14 check (default_payment_term_days > 0),
  default_vat_percentage integer not null default 21 check (default_vat_percentage in (0, 9, 21)),
  default_closing_text text,
  terms text,
  logo_data_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists company_settings_set_updated_at on public.company_settings;
create trigger company_settings_set_updated_at
before update on public.company_settings
for each row execute function public.set_updated_at();

alter table public.company_settings enable row level security;

drop policy if exists "Company settings can select own record" on public.company_settings;
create policy "Company settings can select own record"
on public.company_settings for select
using ((select auth.uid()) = user_id);

drop policy if exists "Company settings can insert own record" on public.company_settings;
create policy "Company settings can insert own record"
on public.company_settings for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "Company settings can update own record" on public.company_settings;
create policy "Company settings can update own record"
on public.company_settings for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Company settings can delete own record" on public.company_settings;
create policy "Company settings can delete own record"
on public.company_settings for delete
using ((select auth.uid()) = user_id);
