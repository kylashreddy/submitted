-- SUBMITTED. — run once in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.requests (
  id             uuid primary key default gen_random_uuid(),
  ref            bigint generated always as identity (start with 248) unique,
  created_at     timestamptz not null default now(),

  -- from the public form
  name           text not null check (char_length(name) between 2 and 80),
  email          text not null check (char_length(email) <= 120),
  phone          text not null default '' check (char_length(phone) <= 20), -- no longer collected
  college        text not null default 'Jain University',
  year           smallint not null check (year between 1 and 4),
  branch         text not null,
  domain         text not null,
  title          text not null default '',
  no_idea        boolean not null default false,
  deadline       date not null,
  help           text[] not null default '{}',
  notes          text not null default '',

  -- crew-side
  status         text not null default 'NEW'
                 check (status in ('NEW','CONTACTED','PAID','IN_PROGRESS','DELIVERED','CLOSED')),
  assignee       text,
  admin_notes    text not null default '',
  delivery_links text[] not null default '{}',
  delivered_at   timestamptz
);

create index if not exists requests_status_idx   on public.requests (status);
create index if not exists requests_deadline_idx on public.requests (deadline);
create index if not exists requests_created_idx  on public.requests (created_at desc);

-- RLS on with NO policies: anon/authenticated keys can't touch this table.
-- All reads/writes go through the server using the service-role key.
alter table public.requests enable row level security;
