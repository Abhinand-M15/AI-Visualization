-- ===========================================================================
-- 002_accounts.sql: accounts, bring-your-own-key, uploads, publishing, audit
-- ===========================================================================
--
-- HOW TO RUN
--   1. Open your Supabase project -> SQL Editor -> New query.
--   2. Paste this whole file and click "Run". It is idempotent (every statement
--      uses "if not exists" / "on conflict do nothing"), so running it twice is
--      harmless.
--   3. Only after it has run successfully, set AUTH_ENABLED=1 for the app. While
--      AUTH_ENABLED is unset the app never touches anything created here.
--
-- Requires db/schema.sql to have been applied first (projects, profiles).
--
-- NOTE on types: projects.id is TEXT in db/schema.sql (not uuid), so every
-- column that points at a project (documents.project_id, publications.project_id,
-- activity_log.project_id) is TEXT as well, so the foreign keys line up.
--
-- EXISTING PROJECTS
--   Projects created before accounts existed have owner_id = null, and with
--   AUTH_ENABLED=1 they are hidden from everyone (the app filters by owner_id).
--   To hand them to an account, look up that user's id under
--   Authentication -> Users and run, for example:
--
--   update public.projects
--      set owner_id   = '00000000-0000-0000-0000-000000000000',
--          created_by = coalesce(created_by, '00000000-0000-0000-0000-000000000000')
--    where owner_id is null;
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- profiles: display name (schema.sql already has it; kept for older databases)
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists display_name text;


-- ---------------------------------------------------------------------------
-- projects: who created / last changed / published it, and its subdomain
-- (owner_id already exists from schema.sql)
-- ---------------------------------------------------------------------------
alter table public.projects add column if not exists created_by   uuid references auth.users (id) on delete set null;
alter table public.projects add column if not exists updated_by   uuid references auth.users (id) on delete set null;
alter table public.projects add column if not exists subdomain    text;
alter table public.projects add column if not exists published_at timestamptz;
alter table public.projects add column if not exists published_by uuid references auth.users (id) on delete set null;

-- Subdomains are unique and always stored lowercase.
create unique index if not exists projects_subdomain_key on public.projects (subdomain);

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'projects_subdomain_lowercase'
       and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_subdomain_lowercase check (subdomain is null or subdomain = lower(subdomain));
  end if;
end;
$$;

create index if not exists projects_owner_created_idx on public.projects (owner_id, created_at desc);


-- ---------------------------------------------------------------------------
-- user_api_keys: one encrypted key per (user, provider). The app encrypts with
-- AES-256-GCM (KEY_ENCRYPTION_SECRET) before storing; only a short hint
-- ("...abcd") is ever shown back. RLS on with NO policies: only the service
-- role (the app's API routes) can read or write it.
-- ---------------------------------------------------------------------------
create table if not exists public.user_api_keys (
  user_id       uuid not null references auth.users (id) on delete cascade,
  provider      text not null,
  encrypted_key text not null,
  key_hint      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, provider)
);

alter table public.user_api_keys enable row level security;


-- ---------------------------------------------------------------------------
-- documents: every uploaded source file (stored in the private 'documents'
-- bucket at <user_id>/<uuid>-<filename>).
-- ---------------------------------------------------------------------------
create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references auth.users (id) on delete cascade,
  project_id   text references public.projects (id) on delete set null,
  file_name    text not null,
  mime_type    text,
  size_bytes   bigint,
  storage_path text not null,
  uploaded_at  timestamptz not null default now()
);

create index if not exists documents_owner_idx   on public.documents (owner_id, uploaded_at desc);
create index if not exists documents_project_idx on public.documents (project_id);

alter table public.documents enable row level security;

drop policy if exists "documents are owner-readable" on public.documents;
create policy "documents are owner-readable" on public.documents
  for select using (auth.uid() = owner_id);


-- ---------------------------------------------------------------------------
-- publications: history of every publish of a project.
-- ---------------------------------------------------------------------------
create table if not exists public.publications (
  id            uuid primary key default gen_random_uuid(),
  project_id    text not null references public.projects (id) on delete cascade,
  subdomain     text,
  url           text,
  deployment_id text,
  template_id   text,
  published_by  uuid references auth.users (id) on delete set null,
  published_at  timestamptz not null default now()
);

create index if not exists publications_project_idx on public.publications (project_id, published_at desc);

alter table public.publications enable row level security;

drop policy if exists "publications are owner-readable" on public.publications;
create policy "publications are owner-readable" on public.publications
  for select using (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );


-- ---------------------------------------------------------------------------
-- activity_log: who did what, and when (project.created, chunks.generated,
-- story.revised, audio.generated, project.published, keys.updated, ...).
-- No foreign key on project_id so the trail survives a project's deletion.
-- ---------------------------------------------------------------------------
create table if not exists public.activity_log (
  id         bigserial primary key,
  user_id    uuid references auth.users (id) on delete set null,
  project_id text,
  action     text not null,
  details    jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_user_idx    on public.activity_log (user_id, created_at desc);
create index if not exists activity_log_project_idx on public.activity_log (project_id, created_at desc);

alter table public.activity_log enable row level security;

drop policy if exists "activity is self-readable" on public.activity_log;
create policy "activity is self-readable" on public.activity_log
  for select using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- Private storage bucket for uploaded source documents. The browser uploads
-- straight into it through a short-lived signed upload URL issued by
-- /api/uploads (so large files bypass Vercel's ~4.5 MB request limit); the
-- server reads it back with the service role. No public access.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
