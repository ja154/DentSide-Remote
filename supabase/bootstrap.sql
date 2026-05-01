-- DentSide Remote Supabase bootstrap
-- Replace the bucket name below if you plan to use a different SUPABASE_STORAGE_BUCKET value.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id text primary key,
  "uid" text not null unique,
  email text not null,
  "displayName" text,
  "photoURL" text,
  "authMethod" text check ("authMethod" in ('google', 'email')),
  role text not null check (role in ('dentist', 'client', 'admin')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz,
  "onboardingComplete" boolean not null default false,
  experience text,
  licenses text[],
  availability text,
  interests text[],
  "verificationStatus" text check ("verificationStatus" in ('unverified', 'pending', 'approved', 'rejected'))
);

create table if not exists public.gigs (
  id text primary key,
  title text not null,
  company text not null,
  type text not null,
  "rateLabel" text not null,
  description text,
  tags text[] not null default '{}',
  "remoteOnly" boolean not null default true,
  status text not null check (status in ('draft', 'open', 'closed')),
  "createdBy" text not null,
  "createdByRole" text not null check ("createdByRole" in ('dentist', 'client', 'admin')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.verifications (
  id text primary key,
  "userId" text not null,
  "legalName" text not null,
  email text not null,
  clinic text not null,
  "issuingState" text not null,
  "licenseNumber" text not null,
  "documentName" text not null,
  "documentPath" text,
  "documentContentType" text,
  "documentSizeBytes" bigint,
  status text not null check (status in ('unverified', 'pending', 'approved', 'rejected')),
  "storageMode" text not null check ("storageMode" in ('bucket', 'metadata_only')),
  "reviewNote" text,
  "submittedAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.bookings (
  id text primary key,
  "clientId" text not null,
  "clientName" text not null,
  "dentistId" text,
  "dentistName" text,
  reason text not null,
  "scheduledFor" timestamptz,
  status text not null check (status in ('requested', 'confirmed', 'completed', 'cancelled')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.withdrawals (
  id text primary key,
  "userId" text not null,
  email text not null,
  amount numeric(12, 2) not null,
  currency text not null,
  provider text not null check (provider in ('stripe', 'mpesa')),
  "destinationLabel" text not null,
  status text not null check (status in ('pending_provider_setup', 'queued', 'paid', 'failed')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  "userId" text not null,
  type text not null check (
    type in (
      'verification_approved',
      'verification_rejected',
      'appointment_confirmed',
      'appointment_cancelled',
      'appointment_completed',
      'new_appointment_request',
      'gig_posted',
      'withdrawal_paid',
      'withdrawal_failed',
      'system'
    )
  ),
  title text not null,
  body text not null,
  read boolean not null default false,
  "relatedId" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists idx_users_role on public.users (role);
create index if not exists idx_users_verification_status on public.users ("verificationStatus");
create index if not exists idx_gigs_created_by on public.gigs ("createdBy");
create index if not exists idx_gigs_updated_at on public.gigs ("updatedAt" desc);
create index if not exists idx_verifications_user_id on public.verifications ("userId");
create index if not exists idx_bookings_client_id on public.bookings ("clientId");
create index if not exists idx_bookings_dentist_id on public.bookings ("dentistId");
create index if not exists idx_bookings_updated_at on public.bookings ("updatedAt" desc);
create index if not exists idx_withdrawals_user_id on public.withdrawals ("userId");
create index if not exists idx_withdrawals_updated_at on public.withdrawals ("updatedAt" desc);
create index if not exists idx_notifications_user_id on public.notifications ("userId");
create index if not exists idx_notifications_created_at on public.notifications ("createdAt" desc);

alter table public.users enable row level security;
alter table public.gigs enable row level security;
alter table public.verifications enable row level security;
alter table public.bookings enable row level security;
alter table public.withdrawals enable row level security;
alter table public.notifications enable row level security;

insert into storage.buckets (id, name, public)
values ('verification-documents', 'verification-documents', false)
on conflict (id) do nothing;

drop policy if exists "verification uploads insert own folder" on storage.objects;
create policy "verification uploads insert own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'verification-documents'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "verification uploads read own folder" on storage.objects;
create policy "verification uploads read own folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'verification-documents'
  and (storage.foldername(name))[2] = auth.uid()::text
);
