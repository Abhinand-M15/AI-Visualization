-- ===========================================================================
-- 004_lead_character_prompts.sql: one fixed lead character in every chapter
-- image of the Showcase template; domain outfits; customer logo placement.
-- ===========================================================================
--
-- HOW TO RUN
--   Supabase project -> SQL Editor -> New query -> paste -> Run.
--   Idempotent: the column uses "if not exists", the domain statements are
--   plain UPDATEs, and the prompts are upserts that bump version each run.
--
-- WARNING: this migration OVERWRITES outfit_description for the 8 seeded
-- domains and the 4 lead_* prompt bodies. Run it again only if you want to
-- reset them to these defaults. Edits made later in the Table Editor are
-- kept as long as you do not re-run this file.
--
-- Requires 003_domains_images.sql first.
--
-- Prompt keys written here (read server-side only, RLS on, no policies):
--   lead_character_rules  : identity lock + style guide ({{character_rules}})
--   scene_director        : text model, chapter -> JSON scene brief
--   lead_scene_image      : final image prompt
--   lead_logo_instruction : fills {{logo_instruction}} when a logo exists
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- domains: logo placement column + outfits for all 8 seeded domains
-- ---------------------------------------------------------------------------
alter table public.domains add column if not exists logo_placement text;

update public.domains set
  outfit_description = 'a white industrial hard hat worn on the head, with the company logo on the front of the helmet, clear safety glasses, a navy work shirt under a high-visibility orange safety vest with silver reflective stripes, durable work gloves, khaki work trousers and sturdy safety boots; a small tablet or clipboard in hand when it suits the scene. The hard hat is worn whenever he is on the factory floor, and his brown hair and full face stay visible below the brim',
  logo_placement = 'centred on the front of the white hard hat, flat and upright on the helmet shell above the brim, where it is clearly visible'
where slug = 'manufacturing';

update public.domains set
  outfit_description = 'a clean white doctor coat worn open over teal scrubs, a stethoscope around the neck, a hospital ID badge clipped to the coat pocket (the badge shows only the logo, no text), comfortable white clinic shoes; a tablet or patient chart folder in hand when it suits the scene',
  logo_placement = 'on the chest pocket of the white doctor coat, and also on the ID badge clipped beside it'
where slug = 'healthcare';

update public.domains set
  outfit_description = 'a complete tailored business suit in dark navy with a crisp white shirt and a slim tie, polished dark shoes, a lanyard with an ID card around the neck, and a slim laptop or tablet in hand or on the desk; the polished look of an IT manager',
  logo_placement = 'on the ID card hanging from the lanyard, on a small lapel badge on the suit jacket, and on the lid of the laptop when it is visible'
where slug = 'it-technology';

update public.domains set
  outfit_description = 'a tailored charcoal business suit with a light blue shirt and a dark tie, polished leather shoes, a lanyard with an ID card, and a slim leather portfolio or tablet in hand; the calm, trustworthy look of a relationship manager',
  logo_placement = 'on a small lapel pin on the suit jacket and on the ID card on the lanyard, and on the cover of the portfolio when it is visible'
where slug = 'banking-finance';

update public.domains set
  outfit_description = 'a friendly store uniform: a bright red polo shirt under a dark apron, a blank name-tag clip on the chest (no text), comfortable dark trousers and clean sneakers; a tablet or handheld scanner in hand when it suits the scene',
  logo_placement = 'on the chest of the apron, and also on the name-tag clip, flat and facing forward'
where slug = 'retail';

update public.domains set
  outfit_description = 'a grey work jacket with reflective stripes over a work shirt, a baseball cap, durable work gloves, dark work trousers and sturdy boots; a handheld scanner or tablet in hand when it suits the scene. His brown hair and full face stay visible under the cap',
  logo_placement = 'on the front of the cap, and on the left chest of the work jacket'
where slug = 'logistics';

update public.domains set
  outfit_description = 'a smart deep-green blazer over a plain white shirt, neat dark trousers and clean leather shoes, a lanyard carrying a set of property keys with a key tag, and a clipboard or tablet with floor plans in hand; the polished look of a property consultant',
  logo_placement = 'on the key tag hanging from the lanyard, on a small lapel badge on the blazer, and on the cover of the clipboard when it is visible'
where slug = 'real-estate';

update public.domains set
  outfit_description = 'a smart-casual warm brown blazer over a light shirt, neat trousers and clean shoes, a lanyard with an ID card (the card shows only the logo, no text), and a notebook or tablet in hand; the approachable look of a school or college coordinator',
  logo_placement = 'on the ID card hanging from the lanyard and on the cover of the notebook when it is visible'
where slug = 'education';


-- ---------------------------------------------------------------------------
-- prompt_templates: the four lead-character prompts
-- ---------------------------------------------------------------------------
insert into public.prompt_templates (key, body, version) values

-- ---------------------------------------------------------------------------
-- lead_character_rules: inserted into lead_scene_image as {{character_rules}}
-- ---------------------------------------------------------------------------
('lead_character_rules',
'IDENTITY LOCK (highest priority, never change):
- The lead is the one young man shown in reference image 1. Keep exactly his face shape, eyes, eyebrows, nose, warm friendly smile, skin tone, brown quiffed hair, slim athletic build, body proportions and age in every image.
- Keep his Pixar-style 3D animated look exactly as in the reference: same stylised proportions, same skin and hair rendering, same eye style.
- Only his clothing and props change, and only as described in the outfit instruction. His face, hair colour, hair style and skin tone never change. If headwear is part of the outfit, his hair and face remain visible below it.
- Do not age him, change his ethnicity, add facial hair, glasses on his face (unless the outfit says safety glasses), tattoos or scars.

ANIMATION STYLE (identical in every image of the story):
- High-quality Pixar-style 3D animated film frame: soft rounded forms, subtle subsurface skin shading, detailed fabric and material textures, expressive eyes.
- Soft cinematic lighting with a gentle key light, warm rim light and natural bounce light; shallow depth of field with a softly blurred background.
- Rich but not oversaturated colour. Keep one consistent colour grade across the whole story: warm natural tones with clean, slightly teal shadows. Time of day and mood may shift, the grade and style do not.

FRAMING:
- Wide cinematic 16:9 landscape frame.
- The lead is clearly visible and is the main subject, placed on a rule-of-thirds line, with his face visible and in focus, never cropped at the head, never turned fully away. Show him at least from the knees up, or full body in wide shots.
- Leave space around him so the setting tells the story. Keep the composition clean and uncluttered with a clear foreground, midground and background.

CONTINUITY:
- Treat the image as one frame of a single animated film. The lead wears the same outfit in every frame of the story, with the same logo placement.
- Keep the same world, colour grade, lighting quality and animation style as the other frames. Change only the situation, setting, supporting characters, camera angle and emotion.
- Other people may appear as background or supporting characters. They must look clearly different from the lead (different faces, hair and builds) and be rendered in the same animation style.

ANATOMY AND DETAIL:
- Natural human anatomy: two arms, two hands, five fingers on each hand, correct proportions, natural poses, no merged or extra limbs or fingers.
- Hands holding objects must look natural and relaxed. Props are simple and physically plausible.

HARD NEGATIVES (never do these):
- No text of any kind: no letters, numbers, words, captions, subtitles, speech bubbles, signs with readable writing, UI text, charts with labels or watermarks. Screens, papers, signs and badges show blank areas or abstract shapes only.
- No realistic photographic style, no live-action look, no flat 2D cartoon or anime style, no sketch or painting look.
- No clones or look-alikes of the lead. No extra copies of the logo and no logo anywhere except where the logo instruction places it.
- No distorted, redrawn, recoloured or invented logos.
- No violence, gore, nudity or frightening imagery; keep the mood suitable for a business audience.',
1),

-- ---------------------------------------------------------------------------
-- scene_director: TEXT model, chapter -> JSON scene brief
-- ---------------------------------------------------------------------------
('scene_director',
'You are the storyboard director of a short animated film that tells a business case study as a visual story. One recurring lead character (a young man) appears in every scene. You write the visual brief for ONE chapter at a time.

STORY: {{story_title}}
INDUSTRY: {{domain_name}}
CHAPTER {{chapter_index}} OF {{chapter_total}}: {{chapter_title}}

CHAPTER TEXT:
{{chapter_text}}

PREVIOUS SCENE (empty for the first chapter):
{{previous_scene}}

LEAD CHARACTER OUTFIT (fixed, for your reference; do not redescribe the outfit):
{{outfit_description}}

YOUR TASK
Write one scene brief: a single filmable moment that shows the idea of this chapter visually.

Rules, in order of priority:
1. Faithfulness: use only what the chapter text says or clearly implies. Never invent facts, numbers, names, company names, products or results that are not in the chapter text. Do not put any text, numbers, charts with labels, signs or captions in the scene; show ideas through people, objects, places and actions.
2. Place in the story: use CHAPTER {{chapter_index}} OF {{chapter_total}} to set the role of this chapter in the arc. The first chapter opens and sets up the world and the lead. Early and middle chapters show the problem or tension. A turning point shows discovery or decision. Solution chapters show the lead working with the new way of doing things. The last chapter shows impact and a calm, confident, optimistic close. For stories with few chapters, compress the arc proportionally.
3. Continuity: if a previous scene is given, continue the same film. Keep the same world, the same supporting people and recurring props, and a logical change of place, time or mood. Do not repeat the same setting, camera angle or pose as the previous scene; vary the shot (wide establishing, medium, over-the-shoulder, low or high angle, close-up of hands and objects with the lead still in frame).
4. The lead is the active protagonist: he is doing something meaningful in the moment (inspecting, discussing, deciding, presenting, walking through, using a tool), with his face visible. He is never just posing.
5. Show the idea literally or as a simple visual metaphor that fits the {{domain_name}} industry (for example scattered paperwork turning into one clear view, a tangled set of cables becoming ordered, a blocked route opening). Keep it concrete and easy to draw.
6. Describe: setting and industry details, what the lead is doing, other people and key objects, mood and lighting, time of day, and camera angle. Mention the lead only as "the lead". Do not describe his face, hair or clothes, and do not mention logos.
7. Keep a professional, positive tone suitable for a business audience; no violence, injury or distress shown graphically. Problems are shown through tension, clutter, delay or worry on faces, never through harm.

OUTPUT
Return ONLY compact JSON on a single line, with no markdown, no code fences and no commentary, exactly in this shape:
{"scene":"<2-4 sentences describing a single filmable moment: setting, what the lead is doing, other people and objects, mood, time of day, camera angle>","emotion":"<one word>"}',
1),

-- ---------------------------------------------------------------------------
-- lead_scene_image: the final prompt sent with the reference images
-- ---------------------------------------------------------------------------
('lead_scene_image',
'Create one frame of a Pixar-style 3D animated film, in a wide 16:9 landscape format.

REFERENCE IMAGES
- Image 1 is the CHARACTER REFERENCE. It shows the lead of the story. Copy his face, hair, skin tone, build, proportions and animation style exactly. Do NOT copy his clothes, pose or the background from image 1; his outfit for this frame is given below.
- If a second reference image is attached, it is the customer company logo, a flat brand mark. It is used only as described in the LOGO section below. If no logo section is given, there is no logo reference: show no logo or brand mark anywhere.

CHARACTER AND STYLE RULES
{{character_rules}}

OUTFIT (the lead wears exactly this, in this frame and in every frame of the story)
Industry: {{domain_name}}.
Outfit: {{outfit_description}}.
Draw the outfit as described, keeping the lead himself identical to image 1.

LOGO
{{logo_instruction}}

SCENE (frame {{chapter_index}} of {{chapter_total}})
{{scene_brief}}

Render this scene as a single cinematic moment with the lead as the clear main subject, his face visible, following the framing and continuity rules above. The scene has no text, letters, numbers, captions, speech bubbles, UI text or watermarks anywhere; screens, papers, signs and badges are blank or abstract shapes. The only mark allowed in the image is the logo, and only where the LOGO section places it.',
1),

-- ---------------------------------------------------------------------------
-- lead_logo_instruction: fills {{logo_instruction}} when a logo exists
-- ---------------------------------------------------------------------------
('lead_logo_instruction',
'The second reference image is the customer company logo. Treat it as a flat brand mark, not as a scene. Place it {{logo_placement}}. Reproduce it faithfully: the same shapes, colours, proportions and layout as in the reference, neither redrawn, restyled, simplified, mirrored nor recoloured. Show it with correct perspective, curvature and lighting for the surface it sits on, large enough to be recognised, and fully visible whenever that part of the outfit is in view. If the logo already contains lettering, copy it exactly as it is; never add any other text, and never invent extra copies or variations of the logo elsewhere in the image.',
1)

on conflict (key) do update set
  body       = excluded.body,
  version    = prompt_templates.version + 1,
  updated_at = now();
