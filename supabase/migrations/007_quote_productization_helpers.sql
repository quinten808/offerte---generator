drop function if exists public.duplicate_quote(uuid, integer);

create or replace function public.duplicate_quote(p_quote_id uuid)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  uid uuid := auth.uid();
  source_quote public.quotes%rowtype;
  new_quote_id uuid;
  new_number text;
  validity_days integer;
begin
  if uid is null then raise exception 'Niet ingelogd'; end if;
  select * into source_quote from public.quotes q where q.id = p_quote_id and q.user_id = uid;
  if not found then raise exception 'Offerte niet gevonden of toegang geweigerd'; end if;
  if not exists (select 1 from public.customers c where c.id = source_quote.customer_id and c.user_id = uid) then
    raise exception 'Klant niet gevonden of toegang geweigerd';
  end if;
  if not exists (select 1 from public.quote_items qi where qi.quote_id = p_quote_id) then
    raise exception 'Bronofferte bevat geen offertregels';
  end if;
  validity_days := source_quote.valid_until - source_quote.quote_date;
  if validity_days <= 0 then validity_days := 1; end if;
  new_number := public.next_quote_number();
  insert into public.quotes (user_id, customer_id, quote_number, title, quote_date, valid_until, description, status, remarks, payment_term_days, terms)
  values (uid, source_quote.customer_id, new_number, 'Kopie van ' || source_quote.title, current_date, current_date + validity_days, source_quote.description, 'Concept', source_quote.remarks, source_quote.payment_term_days, source_quote.terms)
  returning id into new_quote_id;
  insert into public.quote_items (quote_id, position, description, quantity, unit, unit_price, vat_percentage)
  select new_quote_id, qi.position, qi.description, qi.quantity, qi.unit, qi.unit_price, qi.vat_percentage
  from public.quote_items qi where qi.quote_id = p_quote_id order by qi.position;
  if not exists (select 1 from public.quote_items qi where qi.quote_id = new_quote_id) then
    raise exception 'Dupliceren van offertregels is mislukt';
  end if;
  return new_quote_id;
end;
$$;

revoke all on function public.duplicate_quote(uuid) from public, anon, authenticated;
grant execute on function public.duplicate_quote(uuid) to authenticated;
