alter table public.users
  add column if not exists "phoneNumber" text;

alter table public.users
  alter column email drop not null;

alter table public.users
  drop constraint if exists users_authMethod_check;

alter table public.users
  add constraint users_authMethod_check
  check ("authMethod" in ('google', 'email', 'phone'));

create index if not exists idx_users_phone_number on public.users ("phoneNumber");

alter table public.withdrawals
  alter column email drop not null;

alter table public.withdrawals
  add column if not exists "phoneNumber" text,
  add column if not exists "destinationAccount" text,
  add column if not exists "providerRequestId" text,
  add column if not exists "providerStatus" text,
  add column if not exists "providerTransactionId" text,
  add column if not exists "providerUpdatedAt" timestamptz,
  add column if not exists "providerMetadata" jsonb,
  add column if not exists "statusReason" text;

create unique index if not exists idx_withdrawals_provider_request_id
  on public.withdrawals ("providerRequestId")
  where "providerRequestId" is not null;

create index if not exists idx_withdrawals_phone_number on public.withdrawals ("phoneNumber");

drop policy if exists "notifications select own" on public.notifications;
create policy "notifications select own"
on public.notifications
for select
to authenticated
using (
  "userId" = auth.uid()::text
  or exists (
    select 1
    from public.users
    where id = auth.uid()::text
      and role = 'admin'
  )
);

drop policy if exists "bookings select own" on public.bookings;
create policy "bookings select own"
on public.bookings
for select
to authenticated
using (
  "clientId" = auth.uid()::text
  or "dentistId" = auth.uid()::text
  or exists (
    select 1
    from public.users
    where id = auth.uid()::text
      and role = 'admin'
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bookings'
  ) then
    execute 'alter publication supabase_realtime add table public.bookings';
  end if;
end;
$$;
