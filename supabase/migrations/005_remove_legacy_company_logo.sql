do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'company_settings'
      and column_name = 'logo_path'
  ) then
    raise exception 'Kolom public.company_settings.logo_path ontbreekt. Voer migratie 004 eerst uit.';
  end if;
end;
$$;

alter table public.company_settings
  drop column if exists logo_data_url;
