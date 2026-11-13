-- SUBMITTED. — admin activity log. Run once in the Supabase SQL editor (after schema.sql).

create table if not exists public.admin_logs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  actor       text not null,                -- admin email (or the email tried, for failed logins)
  action      text not null
              check (action in ('LOGIN','LOGIN_FAILED','LOGOUT','STATUS','ASSIGN','NOTES','DELIVERY')),
  request_id  uuid references public.requests (id) on delete set null,
  request_ref bigint,
  detail      text not null default '',
  ip          text
);

create index if not exists admin_logs_created_idx on public.admin_logs (created_at desc);
create index if not exists admin_logs_actor_idx   on public.admin_logs (actor);

-- Same lock-down as requests: RLS on, no policies, server-only access via the service role.
alter table public.admin_logs enable row level security;
