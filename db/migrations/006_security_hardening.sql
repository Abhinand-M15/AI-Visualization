-- ===========================================================================
-- 006_security_hardening.sql: row-level security on every table, owner-only
-- projects, storage bucket limits, per-user quotas, permanent site names.
-- Written 04 Nov 2026 from the security and architecture audits
-- (docs/audit/04-security-audit.md SEC-01, SEC-02, SEC-09, SEC-11, SEC-12;
--  docs/audit/03-architecture-audit.md AR-02, AR-03).
-- ===========================================================================
--
-- HOW TO RUN (only when the owner says so)
--   Supabase project -> SQL Editor -> New query -> paste this whole file -> Run.
--   It is idempotent: every statement uses "if not exists", "drop ... if
--   exists" before "create", "on conflict do nothing", or "create or replace".
--   Running it twice is harmless.
--
-- Requires db/schema.sql and migrations 002 and 003. 004 and 005 are not needed.
--
-- WHAT IT CHANGES, AND WHY THE APP KEEPS WORKING
--   The app's API routes use the service-role key, which bypasses row-level
--   security, so none of the policy changes below affect the app. They only
--   close the public REST API (PostgREST), which anyone can call with the anon
--   key that is shipped in the browser bundle.
--
--   1. system_prompts, agents, skills: RLS on, no policies (service role only).
--      Before this, anyone could insert an active system prompt that changed
--      story generation for every user (SEC-01).
--   2. projects: owner-only policies for signed-in users. The old policies also
--      gave rows with owner_id = null (the 3 legacy projects, and every project
--      created by a local auth-off dev server) to anonymous callers (SEC-02).
--   3. Every other table: RLS re-asserted, read policies limited to
--      signed-in users ("to authenticated"), no write policies anywhere.
--   4. anon loses write grants on every public table, and every grant on the
--      server-only tables (defence in depth: the app never uses anon for data).
--   5. Storage buckets get size and type limits (SEC-12).
--   6. usage_counters + consume_quota(): per-user daily quotas and rate limits
--      (SEC-11, AR-03). Until this runs the app allows everything (fail open).
--   7. site_names: every published site address, kept forever, so a released
--      address can never be taken over by another user (SEC-09).
--
-- AFTER RUNNING
--   * Assign the legacy ownerless projects to the owner (they stay hidden in
--     the app until then). Find the owner's id under Authentication -> Users:
--
--       update public.projects
--          set owner_id   = '00000000-0000-0000-0000-000000000000',
--              created_by = coalesce(created_by, '00000000-0000-0000-0000-000000000000')
--        where owner_id is null;
--
--   * Optional, once no laptop writes to this database with AUTH_ENABLED unset:
--
--       alter table public.projects alter column owner_id set not null;
--
--   * Open Advisors -> Security in the dashboard: there must be no
--     "RLS disabled in public" item left.
--   * Run the checks at the end of this file and compare with the comments.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Server-only registries: system_prompts, agents, skills (SEC-01)
-- ---------------------------------------------------------------------------
alter table public.system_prompts enable row level security;
alter table public.agents         enable row level security;
alter table public.skills         enable row level security;

revoke all on table public.system_prompts from anon, authenticated;
revoke all on table public.agents         from anon, authenticated;
revoke all on table public.skills         from anon, authenticated;


-- ---------------------------------------------------------------------------
-- 2. projects: owner-only, signed-in users only (SEC-02, AR-02)
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;

drop policy if exists "projects are owner-readable" on public.projects;
create policy "projects are owner-readable" on public.projects
  for select to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "projects are owner-writable" on public.projects;
create policy "projects are owner-writable" on public.projects
  for all to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

revoke insert, update, delete, truncate, references, trigger on table public.projects from anon;
revoke select on table public.projects from anon;


-- ---------------------------------------------------------------------------
-- 3. Every other table
-- ---------------------------------------------------------------------------

-- profiles: a user reads and updates only their own row.
alter table public.profiles enable row level security;

drop policy if exists "profiles are self-readable" on public.profiles;
create policy "profiles are self-readable" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles are self-updatable" on public.profiles;
create policy "profiles are self-updatable" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke all on table public.profiles from anon;

-- user_api_keys (encrypted keys): server only.
alter table public.user_api_keys enable row level security;
revoke all on table public.user_api_keys from anon, authenticated;

-- documents: the owner may read their own rows; no writes.
alter table public.documents enable row level security;
drop policy if exists "documents are owner-readable" on public.documents;
create policy "documents are owner-readable" on public.documents
  for select to authenticated
  using (auth.uid() = owner_id);
revoke all on table public.documents from anon;

-- publications: readable by the project's owner; no writes.
alter table public.publications enable row level security;
drop policy if exists "publications are owner-readable" on public.publications;
create policy "publications are owner-readable" on public.publications
  for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));
revoke all on table public.publications from anon;

-- activity_log: a user reads their own entries; no writes.
alter table public.activity_log enable row level security;
drop policy if exists "activity is self-readable" on public.activity_log;
create policy "activity is self-readable" on public.activity_log
  for select to authenticated
  using (auth.uid() = user_id);
revoke all on table public.activity_log from anon;

-- domains and domain_avatars: public catalogue, read-only.
alter table public.domains enable row level security;
drop policy if exists "domains are public-readable" on public.domains;
create policy "domains are public-readable" on public.domains
  for select to anon, authenticated
  using (true);
revoke insert, update, delete, truncate, references, trigger on table public.domains from anon, authenticated;

alter table public.domain_avatars enable row level security;
drop policy if exists "domain avatars are public-readable" on public.domain_avatars;
create policy "domain avatars are public-readable" on public.domain_avatars
  for select to anon, authenticated
  using (true);
revoke insert, update, delete, truncate, references, trigger on table public.domain_avatars from anon, authenticated;

-- prompt_templates and chapter_images: server only.
alter table public.prompt_templates enable row level security;
revoke all on table public.prompt_templates from anon, authenticated;

alter table public.chapter_images enable row level security;
revoke all on table public.chapter_images from anon, authenticated;

-- Defence in depth: anon never writes to any table in public, whatever is added later by hand.
do $$
declare
  t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('revoke insert, update, delete, truncate on table public.%I from anon', t.tablename);
  end loop;
end;
$$;


-- ---------------------------------------------------------------------------
-- 4. Storage bucket limits (SEC-12). The free plan's global cap is 50 MB.
--    Public buckets stay public (published sites and the editor read them);
--    there are no storage.objects policies, so nobody but the server writes.
-- ---------------------------------------------------------------------------
update storage.buckets
   set file_size_limit = 26214400 -- 25 MB, same as MAX_UPLOAD_BYTES
 where id = 'documents';

update storage.buckets
   set file_size_limit = 2097152, -- 2 MB, same as MAX_LOGO_BYTES
       allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
 where id = 'company-logos';

update storage.buckets
   set file_size_limit = 52428800,
       allowed_mime_types = array['audio/mpeg']
 where id = 'chunk-audio';

update storage.buckets
   set file_size_limit = 52428800,
       allowed_mime_types = array['video/mp4']
 where id = 'chunk-video';

update storage.buckets
   set file_size_limit = 20971520,
       allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
 where id = 'scene-images';


-- ---------------------------------------------------------------------------
-- 5. Per-user quotas and rate limits (SEC-11, AR-03)
--    One row per (user, kind, window). The app calls consume_quota() before
--    publishing, generating images or narration, story generation, voice
--    previews and key tests; limits come from the app's env (QUOTA_*).
-- ---------------------------------------------------------------------------
create table if not exists public.usage_counters (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  kind         text        not null,
  window_start timestamptz not null,
  used         bigint      not null default 0,
  primary key (user_id, kind, window_start)
);

create index if not exists usage_counters_window_idx on public.usage_counters (window_start);

alter table public.usage_counters enable row level security;
revoke all on table public.usage_counters from anon, authenticated;

-- Atomically adds p_amount to the caller's counter for the current window when
-- the total stays within p_limit. Returns allowed=false (and changes nothing)
-- when it would go over.
create or replace function public.consume_quota(
  p_user uuid,
  p_kind text,
  p_window_seconds integer,
  p_amount integer,
  p_limit bigint
)
returns table (allowed boolean, used bigint)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  w timestamptz;
  new_used bigint;
begin
  if p_window_seconds is null or p_window_seconds < 1 or p_amount is null or p_amount < 0 then
    raise exception 'invalid quota arguments';
  end if;
  w := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  if p_amount > p_limit then
    select u.used into new_used from public.usage_counters u
     where u.user_id = p_user and u.kind = p_kind and u.window_start = w;
    return query select false, coalesce(new_used, 0::bigint);
    return;
  end if;

  insert into public.usage_counters as u (user_id, kind, window_start, used)
  values (p_user, p_kind, w, p_amount)
  on conflict (user_id, kind, window_start)
    do update set used = u.used + excluded.used
    where u.used + excluded.used <= p_limit
  returning u.used into new_used;

  if new_used is null then
    -- The row exists and the update was refused: over the limit.
    select u.used into new_used from public.usage_counters u
     where u.user_id = p_user and u.kind = p_kind and u.window_start = w;
    return query select false, coalesce(new_used, 0::bigint);
    return;
  end if;

  -- Housekeeping: now and then drop counters older than 35 days.
  if random() < 0.01 then
    delete from public.usage_counters where window_start < now() - interval '35 days';
  end if;

  return query select true, new_used;
end;
$$;

-- Callable by the server (service role) only, never through the public API.
revoke all on function public.consume_quota(uuid, text, integer, integer, bigint) from public, anon, authenticated;
grant execute on function public.consume_quota(uuid, text, integer, integer, bigint) to service_role;


-- ---------------------------------------------------------------------------
-- 6. site_names: every published address, kept forever (SEC-09)
--    name is the part the user typed (projects.subdomain). A row is never
--    deleted, also not when its project is deleted, so a released address can
--    only be published again by the project (and owner) that first used it.
--    No foreign key on project_id for that reason.
-- ---------------------------------------------------------------------------
create table if not exists public.site_names (
  name              text primary key check (name = lower(name)),
  project_id        text,
  owner_id          uuid references auth.users (id) on delete set null,
  vercel_project    text,
  created_at        timestamptz not null default now(),
  last_published_at timestamptz
);

create index if not exists site_names_project_idx on public.site_names (project_id);

alter table public.site_names enable row level security;
revoke all on table public.site_names from anon, authenticated;

-- Backfill from the publish history and from current projects (first publisher wins).
insert into public.site_names (name, project_id, owner_id, created_at, last_published_at)
select distinct on (p.subdomain) p.subdomain, p.project_id, p.published_by, p.published_at, p.published_at
  from public.publications p
 where p.subdomain is not null
 order by p.subdomain, p.published_at asc
on conflict (name) do nothing;

insert into public.site_names (name, project_id, owner_id, created_at, last_published_at)
select pr.subdomain, pr.id, pr.owner_id, coalesce(pr.published_at, pr.updated_at, now()), pr.published_at
  from public.projects pr
 where pr.subdomain is not null
on conflict (name) do nothing;

create index if not exists publications_subdomain_idx on public.publications (subdomain);


-- ---------------------------------------------------------------------------
-- CHECKS (read-only; run them after the migration and compare)
-- ---------------------------------------------------------------------------
-- Every table in public has RLS on (expect no rows):
--   select tablename from pg_tables where schemaname = 'public' and not rowsecurity;
--
-- Policies that apply to anon (expect only the two public-readable catalogue policies):
--   select tablename, policyname, roles, cmd from pg_policies
--    where schemaname = 'public' and ('anon' = any(roles) or 'public' = any(roles));
--
-- No storage.objects policies exist (expect no rows, unless you added some on purpose):
--   select policyname, roles, cmd from pg_policies where schemaname = 'storage' and tablename = 'objects';
--
-- Bucket settings:
--   select id, public, file_size_limit, allowed_mime_types from storage.buckets order by id;
--
-- Unexpected system prompts (look for rows nobody on the team created):
--   select key, version, is_active, created_at, left(content, 120) from public.system_prompts order by created_at desc;
-- ===========================================================================
