-- ===========================================================================
-- 005_lead_sheet_prompts.sql: contact-sheet generation for the lead character.
-- ONE generated image holds FOUR scenes (2x2 grid); the server crops it into
-- four chapter images. See docs/IMAGE_PROMPTS.md, section 3.
-- ===========================================================================
--
-- HOW TO RUN
--   Supabase project -> SQL Editor -> New query -> paste -> Run.
--   Idempotent: the column uses "if not exists"; the domain statements are
--   plain UPDATEs; the prompts are upserts that bump version each run.
--
-- WARNING: re-running OVERWRITES the 4 lead_sheet_* prompt bodies and the 8
-- domains.outfit_sheet values with the defaults below. Edits made later in
-- the Table Editor are kept as long as you do not re-run this file.
--
-- Requires 003 and 004 first. Without this migration the app still works: it
-- draws one image per chapter exactly as before.
--
-- LENGTH BUDGET: FLUX.2 klein reads only about 500 tokens (roughly 1,800-2,000
-- characters) of the prompt. The FILLED sheet prompt (layout + rules + outfit
-- + logo line + four panels) is therefore kept under about 1,900 characters;
-- the app shortens the four panel scenes when needed and logs a warning.
--
-- Keys written here (read server-side only):
--   lead_sheet_rules    : compact identity/style block ({{sheet_rules}})
--   lead_sheet_image    : the sheet image prompt (layout first)
--   lead_sheet_logo     : short logo line ({{logo_instruction}}), only with a logo
--   lead_sheet_director : text model, four chapters in, JSON scenes out
-- Column written here:
--   domains.outfit_sheet: short outfit (about 150 characters) used inside the
--                         sheet prompt instead of the long outfit_description.
-- ===========================================================================

alter table public.domains add column if not exists outfit_sheet text;

update public.domains set outfit_sheet = 'white hard hat (face and brown hair stay visible below the brim), safety glasses, navy shirt, orange hi-vis vest with silver stripes, work gloves, khaki trousers, safety boots' where slug = 'manufacturing';
update public.domains set outfit_sheet = 'white doctor coat open over teal scrubs, stethoscope around the neck, blank ID badge, white clinic shoes' where slug = 'healthcare';
update public.domains set outfit_sheet = 'tailored dark navy suit, white shirt, slim tie, polished shoes, lanyard with ID card, slim laptop' where slug = 'it-technology';
update public.domains set outfit_sheet = 'charcoal suit, light blue shirt, dark tie, polished shoes, lanyard with ID card, leather portfolio' where slug = 'banking-finance';
update public.domains set outfit_sheet = 'bright red polo under a dark apron, blank name-tag clip, dark trousers, sneakers, handheld scanner' where slug = 'retail';
update public.domains set outfit_sheet = 'grey work jacket with reflective stripes, cap (face and brown hair stay visible), work gloves, dark trousers, boots, handheld scanner' where slug = 'logistics';
update public.domains set outfit_sheet = 'deep-green blazer over a white shirt, dark trousers, leather shoes, lanyard with property keys and key tag, clipboard with floor plans' where slug = 'real-estate';
update public.domains set outfit_sheet = 'warm brown blazer over a light shirt, neat trousers, lanyard with a logo-only ID card, notebook' where slug = 'education';


insert into public.prompt_templates (key, body, version) values

-- ---------------------------------------------------------------------------
-- lead_sheet_rules: about 450 characters, most important facts first
-- ---------------------------------------------------------------------------
('lead_sheet_rules',
'The lead is the young man of reference image 1: keep his exact face, warm smile, skin tone, brown quiffed hair, slim build and proportions, in the same Pixar-style 3D animation. Same lead and same outfit in every panel, face fully visible, five fingers per hand. One consistent warm cinematic colour grade and soft lighting in all panels. Other people look clearly different from him. No text, letters, numbers, signs, watermarks or logos except the logo line. Safe for business.',
1),

-- ---------------------------------------------------------------------------
-- lead_sheet_image: layout instruction FIRST (the part the model must not ignore)
-- ---------------------------------------------------------------------------
('lead_sheet_image',
'A 2x2 contact sheet: ONE image with exactly four equal 16:9 panels (two rows, two columns), separated by straight solid pure-white (#FFFFFF) gutters about 2% wide. No outer border or margin, no panel numbers, no text. Each panel is a different full-frame cinematic scene. Order: top-left, top-right, bottom-left, bottom-right.

{{sheet_rules}}

Outfit in every panel ({{domain_name}}): {{outfit_description}}.
{{logo_instruction}}

Panel 1 (top-left): {{panel_1}}
Panel 2 (top-right): {{panel_2}}
Panel 3 (bottom-left): {{panel_3}}
Panel 4 (bottom-right): {{panel_4}}',
1),

-- ---------------------------------------------------------------------------
-- lead_sheet_logo: short logo line, placed where the outfit says
-- ---------------------------------------------------------------------------
('lead_sheet_logo',
'Image 2 is the company logo, a flat brand mark: show it {{logo_placement}}, copied exactly, never redrawn or repeated.',
1),

-- ---------------------------------------------------------------------------
-- lead_sheet_director: TEXT model, four chapters in, JSON scenes out
-- ---------------------------------------------------------------------------
('lead_sheet_director',
'You are the storyboard director of a short animated film that tells a business case study as a visual story. One recurring lead character (a young man) is in every scene. Write FOUR scene briefs, one for each of the four consecutive chapters below. They are drawn together as the four panels of one picture, then used as four separate chapter images.

STORY: {{story_title}}
INDUSTRY: {{domain_name}}
LEAD OUTFIT (fixed, for your reference; never redescribe it): {{outfit_description}}
SCENE BEFORE THESE FOUR (empty at the start of the story): {{previous_scene}}
STORY LENGTH: {{chapter_total}} chapters in total.

CHAPTER {{chapter_1_index}}: {{chapter_1_title}}
{{chapter_1_text}}

CHAPTER {{chapter_2_index}}: {{chapter_2_title}}
{{chapter_2_text}}

CHAPTER {{chapter_3_index}}: {{chapter_3_title}}
{{chapter_3_text}}

CHAPTER {{chapter_4_index}}: {{chapter_4_title}}
{{chapter_4_text}}

RULES, in order of priority:
1. Length: each scene is at most 25 words (about 150 characters), one or two short sentences. Longer scenes are cut off by the image model, so put the most important things first: setting, what the lead is doing, the key object or other person, mood. Camera angle last, in two or three words.
2. Faithfulness: use only what the chapter text says or clearly implies. Never invent facts, numbers, names, company names, products or results. Show ideas through people, objects, places and actions. Never put text, numbers, charts with labels, signs or captions in a scene.
3. Place in the story: use each chapter number out of {{chapter_total}} to set its role. The first chapter opens the story and sets up the world and the lead. Early and middle chapters show the problem or tension. A turning point shows discovery or decision. Solution chapters show the lead working with the new way of doing things. The last chapter shows impact and a calm, confident, optimistic close. With few chapters, compress the arc proportionally.
4. Continuity: the four scenes and the scene before them belong to one film. Keep the same world, the same supporting people and recurring props, and a logical change of place, time or mood from one scene to the next. Do not repeat the same setting, camera angle or pose within the four; vary the shot (wide, medium, over-the-shoulder, low or high angle, close-up of hands and objects with the lead still in frame).
5. The lead is the active protagonist, doing something meaningful (inspecting, discussing, deciding, presenting, walking through, using a tool), face visible, never just posing. Mention him only as "the lead". Do not describe his face, hair or clothes and do not mention logos.
6. Each scene must make sense on its own: the image model sees the four scenes side by side but will not see the chapters. Name the concrete place and objects.
7. Keep a professional, positive tone for a business audience. No violence, injury or distress; show problems through tension, clutter, delay or worry on faces.

OUTPUT
Return ONLY compact JSON on a single line, with no markdown, no code fences and no commentary, with exactly four scenes in chapter order:
{"scenes":[{"scene":"<scene for chapter {{chapter_1_index}}>","emotion":"<one word>"},{"scene":"<scene for chapter {{chapter_2_index}}>","emotion":"<one word>"},{"scene":"<scene for chapter {{chapter_3_index}}>","emotion":"<one word>"},{"scene":"<scene for chapter {{chapter_4_index}}>","emotion":"<one word>"}]}',
1)

on conflict (key) do update set
  body       = excluded.body,
  version    = prompt_templates.version + 1,
  updated_at = now();
