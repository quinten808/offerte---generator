create table if not exists public.quote_status_history (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  old_status text,
  new_status text not null check (new_status in ('Concept', 'Verzonden', 'Geaccepteerd', 'Afgewezen')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists quote_status_history_quote_created_idx on public.quote_status_history (quote_id, created_at desc);
alter table public.quote_status_history enable row level security;

revoke all on table public.quote_status_history from public, anon, authenticated;
grant select on table public.quote_status_history to authenticated;

drop policy if exists "quote_status_history_select_own" on public.quote_status_history;
create policy "quote_status_history_select_own" on public.quote_status_history for select
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.quotes q
    where q.id = quote_id and q.user_id = (select auth.uid())
  )
);

insert into public.quote_status_history (quote_id, user_id, old_status, new_status, note, created_at)
select q.id, q.user_id, null, q.status, null, q.created_at
from public.quotes q
where not exists (
  select 1 from public.quote_status_history h where h.quote_id = q.id
);

create or replace function public.write_quote_status_history()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.quote_status_history (quote_id, user_id, old_status, new_status)
    values (new.id, new.user_id, null, new.status);
  elsif new.status is distinct from old.status then
    insert into public.quote_status_history (quote_id, user_id, old_status, new_status, note)
    values (new.id, new.user_id, old.status, new.status, nullif(current_setting('app.quote_status_note', true), ''));
  end if;
  return new;
end;
$$;

revoke all on function public.write_quote_status_history() from public, anon, authenticated;

drop trigger if exists quotes_write_status_history on public.quotes;
create trigger quotes_write_status_history after insert or update of status on public.quotes
for each row execute function public.write_quote_status_history();

create or replace function public.change_quote_status(p_quote_id uuid, p_new_status text, p_note text default null)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  uid uuid := auth.uid();
  current_status text;
begin
  if uid is null then raise exception 'Niet ingelogd'; end if;
  if p_new_status not in ('Concept', 'Verzonden', 'Geaccepteerd', 'Afgewezen') then raise exception 'Ongeldige offertestatus'; end if;
  select q.status into current_status from public.quotes q where q.id = p_quote_id and q.user_id = uid;
  if not found then raise exception 'Offerte niet gevonden of toegang geweigerd'; end if;
  if current_status = p_new_status then return; end if;
  perform set_config('app.quote_status_note', coalesce(nullif(trim(p_note), ''), ''), true);
  update public.quotes set status = p_new_status where id = p_quote_id and user_id = uid;
end;
$$;

revoke all on function public.change_quote_status(uuid, text, text) from public, anon, authenticated;
grant execute on function public.change_quote_status(uuid, text, text) to authenticated;
