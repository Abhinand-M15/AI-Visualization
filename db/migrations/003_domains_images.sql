-- ===========================================================================
-- 003_domains_images.sql: industry domains, generated avatars and chapter
-- scene images, company logos, image provider choice
-- ===========================================================================
--
-- HOW TO RUN
--   1. Open your Supabase project -> SQL Editor -> New query.
--   2. Paste this whole file and click "Run". It is idempotent (every statement
--      uses "if not exists" / "on conflict ..."), so running it twice is
--      harmless. Re-running does NOT overwrite domains or prompts you have
--      edited in the dashboard (seed rows use "on conflict do nothing").
--   3. Until it has run, the app hides the domain dropdown and generates no
--      images; nothing else changes.
--
-- Requires db/schema.sql and db/migrations/002_accounts.sql first.
--
-- NOTE on types: projects.id is TEXT in db/schema.sql (not uuid), so every
-- column that points at a project (chapter_images.project_id) is TEXT too.
--
-- WHO CAN READ WHAT
--   domains, domain_avatars : readable by everyone (RLS select policy).
--   prompt_templates        : RLS on, NO policies, so only the service role
--                             (the app's API routes) can read the prompts.
--   chapter_images          : RLS on, no policies; server only.
--   All writes happen through the service role; there are no write policies.
--
-- EDITING DOMAINS AND PROMPTS
--   Use the Supabase Table Editor. Bump prompt_templates.version when you
--   change a body. Placeholders are written {{like_this}}; the app replaces
--   them at run time and leaves unknown ones empty.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- domains: the industries shown in the dropdown on the upload page.
-- ---------------------------------------------------------------------------
create table if not exists public.domains (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  name               text not null,
  outfit_description text not null,
  story_guidance     text not null,
  sort_order         int  not null default 0,
  active             boolean not null default true,
  created_at         timestamptz not null default now()
);

create index if not exists domains_active_sort_idx on public.domains (active, sort_order);

alter table public.domains enable row level security;

drop policy if exists "domains are public-readable" on public.domains;
create policy "domains are public-readable" on public.domains
  for select using (true);


-- ---------------------------------------------------------------------------
-- domain_avatars: the two reusable avatars per domain (male, female). The
-- image is generated once, by whoever first uses the domain, then reused.
-- image_path is the object path inside the public 'scene-images' bucket.
-- ---------------------------------------------------------------------------
create table if not exists public.domain_avatars (
  id           uuid primary key default gen_random_uuid(),
  domain_id    uuid not null references public.domains (id) on delete cascade,
  gender       text not null check (gender in ('male', 'female')),
  image_path   text,
  status       text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
  drive_status text,
  created_at   timestamptz not null default now(),
  unique (domain_id, gender)
);

alter table public.domain_avatars enable row level security;

drop policy if exists "domain avatars are public-readable" on public.domain_avatars;
create policy "domain avatars are public-readable" on public.domain_avatars
  for select using (true);


-- ---------------------------------------------------------------------------
-- prompt_templates: the image / story prompts. Server only (no policies).
-- ---------------------------------------------------------------------------
create table if not exists public.prompt_templates (
  key        text primary key,
  body       text not null,
  version    int  not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.prompt_templates enable row level security;


-- ---------------------------------------------------------------------------
-- chapter_images: one scene image per chapter (chunk) of a project.
-- chunk_id is the chunk id inside projects.payload (no foreign key possible).
-- ---------------------------------------------------------------------------
create table if not exists public.chapter_images (
  project_id   text not null references public.projects (id) on delete cascade,
  chunk_id     text not null,
  image_path   text,
  status       text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
  prompt_used  text,
  provider     text,
  drive_status text,
  error        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (project_id, chunk_id)
);

create index if not exists chapter_images_project_idx on public.chapter_images (project_id);

alter table public.chapter_images enable row level security;


-- ---------------------------------------------------------------------------
-- projects: chosen domain, chosen domain avatar, company logo
-- ---------------------------------------------------------------------------
alter table public.projects add column if not exists domain_id        uuid references public.domains (id) on delete set null;
alter table public.projects add column if not exists domain_avatar_id uuid references public.domain_avatars (id) on delete set null;
alter table public.projects add column if not exists logo_path        text;


-- ---------------------------------------------------------------------------
-- profiles: which image provider the user generates pictures with
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists image_provider text not null default 'gemini';

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'profiles_image_provider_check'
       and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_image_provider_check check (image_provider in ('gemini', 'openai'));
  end if;
end;
$$;


-- ---------------------------------------------------------------------------
-- Public storage buckets (like 'chunk-audio'): published sites load these
-- images directly, so public read is intended. Writes go through the server
-- (scene-images) or short-lived signed upload URLs (company-logos).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('scene-images', 'scene-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- Seed: starter domains. Edit or add more in the Table Editor.
-- ---------------------------------------------------------------------------
insert into public.domains (slug, name, outfit_description, story_guidance, sort_order) values
  ('manufacturing', 'Manufacturing',
   'a navy work shirt under a high-visibility orange safety vest, a white hard hat and safety glasses, with a small tablet in hand',
   'Use manufacturing language: shop floor, production lines, plants, work orders, bills of materials, suppliers, quality checks, downtime, yield, dispatch and on-time delivery. Prefer concrete operational examples such as scheduling a production run or tracing a defective batch.',
   10),
  ('healthcare', 'Healthcare',
   'a clean white doctor''s coat over teal scrubs with a stethoscope around the neck and a name-badge clip (no readable text)',
   'Use healthcare language: patients, care teams, appointments, clinics and hospitals, records, referrals, billing and claims, compliance and patient privacy. Keep a caring, precise tone and prefer examples such as reducing wait times or giving clinicians a single view of a patient. Never give medical advice.',
   20),
  ('education', 'Education',
   'a smart-casual blazer in warm brown over a light shirt, holding a notebook, with a lanyard (no readable text)',
   'Use education language: students, teachers, admissions, enrolment, courses, timetables, assessments, fees, parents and alumni. Prefer examples such as simplifying admissions or helping teachers track student progress.',
   30),
  ('it-technology', 'IT and Technology',
   'a casual dark hoodie over a t-shirt with a lanyard, holding a laptop, with over-ear headphones around the neck',
   'Use technology-company language: customers, subscriptions, product releases, support tickets, SLAs, integrations, onboarding, renewals and usage. Prefer examples such as shortening ticket resolution time or giving sales and support one customer view.',
   40),
  ('banking-finance', 'Banking and Finance',
   'a tailored charcoal business suit with a light blue shirt and a tie, holding a slim portfolio',
   'Use banking and finance language: customers, accounts, loans, applications, approvals, risk, compliance, audits, relationship managers and branches. Keep a trustworthy, precise tone and prefer examples such as faster loan approvals or a clear customer relationship view. Never give investment advice.',
   50),
  ('retail', 'Retail',
   'a friendly store uniform: a bright polo shirt with an apron and a name-tag clip (no readable text), holding a tablet',
   'Use retail language: stores, shoppers, catalogue, stock levels, promotions, loyalty, orders, returns and omnichannel. Prefer examples such as keeping shelves stocked or giving shoppers one loyalty view across stores and online.',
   60),
  ('logistics', 'Logistics',
   'a grey work jacket with reflective stripes, a cap, and gloves, holding a handheld scanner',
   'Use logistics language: shipments, consignments, fleets, drivers, warehouses, routes, tracking, delivery windows, proof of delivery and freight. Prefer examples such as live shipment tracking or fewer missed delivery windows.',
   70),
  ('real-estate', 'Real Estate',
   'a smart blazer over a plain shirt in deep green, with a property-keys lanyard, holding a clipboard with floor plans',
   'Use real-estate language: properties, projects, units, buyers and tenants, site visits, bookings, agreements, payments, brokers and handover. Prefer examples such as managing leads through to booking or giving buyers a clear view of their payment schedule.',
   80)
on conflict (slug) do nothing;


-- ---------------------------------------------------------------------------
-- Seed: prompts. {{placeholders}} are filled in by the app.
--   avatar_character      : {{gender}}, {{domain_name}}, {{outfit_description}}
--   chapter_scene         : {{domain_name}}, {{outfit_description}}, {{avatar_description}},
--                           {{chapter_title}}, {{chapter_text}}, {{story_title}}
--   story_domain_guidance : {{domain_name}}, {{story_guidance}}
-- ---------------------------------------------------------------------------
insert into public.prompt_templates (key, body, version) values
  ('avatar_character',
   'Create a character portrait in an animated comic / cartoon style: flat bold colours, clean confident outlines, simple soft shading, friendly expressive face. The character is a friendly {{gender}} professional working in the {{domain_name}} industry, shown from the knees up, facing the viewer with a warm, welcoming expression, standing against a plain light background with no props other than what they wear or hold. Outfit: {{outfit_description}}. Keep the design simple and distinctive so the same character can be redrawn consistently in many scenes. Do NOT include any text, letters, numbers, logos, brand marks or watermarks anywhere in the image. Square composition.',
   1),
  ('chapter_scene',
   'Draw one scene for a chapter of a business story, in an animated comic / cartoon style: flat bold colours, clean confident outlines, simple soft shading, a clear uncluttered composition in a wide 16:9 frame. The scene is set in the {{domain_name}} industry. The main character is the SAME character as in the reference image: keep exactly the same face, hair, skin tone, proportions and outfit ({{outfit_description}}) as in the reference. {{avatar_description}} Chapter title: "{{chapter_title}}". Chapter content: {{chapter_text}} Show what this chapter is about as a single visual moment, with the character taking part in it, using settings, objects and people typical of the {{domain_name}} industry. Do NOT include any text, letters, numbers, captions, speech bubbles, logos, brand marks or watermarks anywhere in the image; show screens, papers and signs as blank or as abstract shapes.',
   1),
  ('story_domain_guidance',
   'DOMAIN: {{domain_name}}. Write this story for a {{domain_name}} audience. {{story_guidance}} Keep every fact faithful to the source document; use the domain only to choose wording, terminology and examples, and never invent figures, names or outcomes that are not in the source.',
   1)
on conflict (key) do nothing;
