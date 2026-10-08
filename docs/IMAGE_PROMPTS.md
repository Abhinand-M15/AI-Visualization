# Image prompts: the fixed lead character (Showcase template)

Every chapter of a Showcase story gets an AI scene image. One fixed character (the Pixar-style young man in `public/characters/lead.webp`) leads every frame, wears an outfit that depends on the industry domain, and carries the customer's logo where it naturally belongs. Together the images should read like frames of one animated film.

The prompts live in the Supabase table `public.prompt_templates` and are read server-side only. They are created by `db/migrations/004_lead_character_prompts.sql`.

## 1. Prompt keys and placeholders

Placeholders are written `{{like_this}}`. The app replaces them with `fillPrompt` (unknown placeholders become empty).

| Key | Used by | Placeholders | Filled by |
|---|---|---|---|
| `lead_character_rules` | inserted into `lead_scene_image` | none | static text |
| `scene_director` | text model, one call per chapter | `{{story_title}}` | project title |
| | | `{{domain_name}}` | `domains.name` |
| | | `{{chapter_index}}`, `{{chapter_total}}` | 1-based position, number of chapters |
| | | `{{chapter_title}}`, `{{chapter_text}}` | the chapter (narrative text) |
| | | `{{previous_scene}}` | the `scene` of the previous chapter's brief; empty for chapter 1 |
| | | `{{outfit_description}}` | `domains.outfit_description` |
| `lead_scene_image` | image model, one call per chapter | `{{character_rules}}` | body of `lead_character_rules` |
| | | `{{domain_name}}`, `{{outfit_description}}` | `domains` row |
| | | `{{logo_instruction}}` | filled `lead_logo_instruction` when a logo exists, else empty string |
| | | `{{scene_brief}}` | the `scene` text returned by `scene_director` |
| | | `{{chapter_index}}`, `{{chapter_total}}` | as above |
| `lead_logo_instruction` | builds `{{logo_instruction}}` | `{{logo_placement}}` | `domains.logo_placement` |

Domain columns used: `outfit_description` and the new `logo_placement` (added by migration 004).

## 2. The two-step flow

1. **Scene brief (text model).** For each chapter, strictly in order (chapter 1, 2, 3 ...), fill `scene_director` and call the text model. It returns only JSON: `{"scene":"...","emotion":"..."}`. Pass the previous chapter's `scene` as `{{previous_scene}}` so the story keeps the same world, supporting people and props, and varies camera angle. Parse the JSON defensively (strip code fences; if parsing fails, retry once, then fall back to the chapter title and text). Store the brief if useful for debugging.
2. **Image (image model).** Fill `lead_logo_instruction` (only if the project has a logo) into `{{logo_instruction}}`, fill `lead_character_rules` into `{{character_rules}}`, then fill `lead_scene_image` with the scene text. Send the filled prompt together with the reference images, always in this order: **image 1 = `public/characters/lead.webp`**, **image 2 = the company logo** (omit when there is no logo). The filled prompt is what goes into `chapter_images.prompt_used`.

The step order matters: because each brief depends on the previous one, briefs cannot be generated in parallel. Images can be generated in parallel after all briefs exist.

Output must be 16:9 landscape. Request the aspect ratio through the provider's own parameter as well; the prompt alone is not reliable.

## 3. Tuning the prompts safely

1. Open the Supabase Table Editor, table `prompt_templates`.
2. Edit the `body` of one row. Keep every placeholder exactly as written; renaming or deleting one silently produces an empty value.
3. **Bump `version` by 1** and set `updated_at` so the change is traceable.
4. Test with one story (see the checklist below) before relying on it.
5. Do not re-run migration 004 afterwards unless you want to reset the prompts and outfits to the defaults: it overwrites them.

Tips: change one thing at a time; put the most important rule first in a section (models weight early text); keep rules concrete ("five fingers on each hand") rather than vague; avoid frightening or violent wording because image safety filters reject it.

Outfits and logo placements are edited the same way in the `domains` table (`outfit_description`, `logo_placement`). Write `logo_placement` as a phrase that completes "Place it ..." (for example "on the front of the white hard hat").

## 4. Outfit table (all 8 domains)

| Domain (slug) | Outfit | Logo placement |
|---|---|---|
| Manufacturing (`manufacturing`) | White hard hat worn on the head, safety glasses, navy work shirt, hi-vis orange vest with reflective stripes, work gloves, khaki work trousers, safety boots; tablet or clipboard | Front of the hard hat (centred, above the brim) |
| Healthcare (`healthcare`) | White doctor coat over teal scrubs, stethoscope around the neck, ID badge (logo only, no text), white clinic shoes | Coat chest pocket and the ID badge |
| IT and Technology (`it-technology`) | Complete tailored navy business suit, white shirt, slim tie, polished shoes, lanyard with ID card, laptop | ID card on the lanyard, lapel badge, laptop lid |
| Banking and Finance (`banking-finance`) | Charcoal business suit, light blue shirt, dark tie, lanyard, leather portfolio | Lapel pin, lanyard ID card, portfolio cover |
| Retail (`retail`) | Bright red polo, dark apron, blank name-tag clip, sneakers; tablet or scanner | Apron chest and name-tag clip |
| Logistics (`logistics`) | Grey reflective-stripe work jacket, cap, work gloves, work trousers, boots; handheld scanner | Front of the cap and jacket left chest |
| Real Estate (`real-estate`) | Deep-green blazer, white shirt, dark trousers, lanyard with property keys and key tag, clipboard with floor plans | Key tag, lapel badge, clipboard cover |
| Education (`education`) | Warm brown smart-casual blazer, light shirt, lanyard ID card (logo only), notebook or tablet | ID card on the lanyard, notebook cover |

Rules: the outfit is the same in every chapter of a story. Headwear (hard hat, cap) must never hide his face or hair colour. With no logo uploaded, `{{logo_instruction}}` is empty and the scene prompt tells the model to show no logo or brand mark anywhere.

## 5. Logo placement rules

- The logo is a flat brand mark. It goes where a real company would put it for that domain: on the helmet for manufacturing, on the coat pocket or badge for healthcare, on the badge, lanyard or laptop for IT.
- It must be reproduced exactly (shapes, colours, proportions), with correct perspective and lighting, and never with extra text or extra copies.
- Prefer transparent-background PNG or a clean image on a plain background; very small, low-contrast or text-heavy logos are the most likely to distort. Recommend at least 512 px on the long side.
- If a placement is not visible in a given shot (for example the hat is out of frame), the model may omit that placement; the prompt asks for it to be visible whenever that part of the outfit is in view.

## 6. Failure modes and fixes

| Problem | Likely cause | Fix |
|---|---|---|
| Face drift (the lead looks different between chapters) | Reference image not sent first, or low weight; scene brief describes his face/hair; close-ups | Confirm image 1 is `lead.webp`. Check the brief does not describe his looks (the director prompt forbids it). Strengthen the IDENTITY LOCK section in `lead_character_rules`. Avoid extreme close-ups. Regenerate the one bad frame. |
| Logo distorted, recoloured or redrawn | Logo too small or low-contrast; placement too vague; several placements asked at once | Upload a larger, cleaner logo. Shorten `logo_placement` to one or two surfaces. Make sure the logo is sent as image 2 and `{{logo_instruction}}` is not empty. |
| Text, captions or fake lettering appear | Scene brief mentions signs, screens, charts or numbers; model habit | Check the brief for readable-text objects. Keep the "no text" lines in all three prompts. Make the director rule 1 stricter. Regenerate. |
| Outfit mismatch (wrong clothes, hard hat missing) | Wrong domain on the project; outfit text too long or vague; scene indoors suggests no hat | Check `projects.domain_id`. Shorten `outfit_description` to the key items. Add an explicit "hard hat is always worn" to the outfit text. |
| Wrong aspect ratio (square or portrait) | Aspect ratio only requested in the prompt | Set the aspect ratio in the provider call (Gemini image config / OpenAI size), keep "wide 16:9" in the prompt. |
| Looks photo-realistic or 2D cartoon | Style lines diluted by long scene text | Keep the first line of `lead_scene_image` and the ANIMATION STYLE section intact; shorten the scene brief. |
| Look-alike of the lead among the extras | Supporting characters described vaguely | Add distinct descriptions for extras in the director prompt (different hair, build, age). |
| Scenes feel repetitive | `{{previous_scene}}` empty or not passed | Run the briefs sequentially and pass the previous brief. |
| Image blocked by the safety filter | Alarming wording in the chapter (injury, crash, panic) | The director softens problems into tension and clutter; make that rule stricter or reword the chapter. |
| Image model returns no image | Provider refusal or quota | Retry once, then mark the chapter failed (`chapter_images.error`) and carry on. |

## Appendix: Test checklist

Run these once images generate. For each case, generate a full story (at least 5 chapters) and judge all frames together.

| # | Domain | Logo | What to check |
|---|---|---|---|
| 1 | Manufacturing | Yes | Hard hat on every factory frame with the logo on the helmet front, hi-vis vest and gloves; face and brown hair visible under the hat; logo shapes and colours match the upload; same face in all frames. |
| 2 | Healthcare | Yes | White coat over scrubs, stethoscope; logo on the coat pocket or ID badge; badge shows no readable text; calm hospital or clinic settings; same face in all frames. |
| 3 | IT and Technology | Yes | Full tailored suit with shirt and tie, lanyard; logo on the ID card, lapel badge or laptop lid; no on-screen text; same suit in every chapter. |
| 4 | Manufacturing | No | Same outfit with a plain hard hat and no logo or brand mark anywhere; no invented logos on vests, walls or screens. |
| 5 | Healthcare | No | Same coat and stethoscope; badge and pocket blank; no brand marks; story arc visible from opening to impact frame. |
| 6 | Banking and Finance (or any of retail, logistics, real estate, education) | Yes | Outfit matches the table above; logo on the lapel pin, lanyard card or portfolio; consistent colour grade and style across chapters; frames are 16:9 with no text or watermark. |

For every case also confirm: aspect ratio 16:9 on all frames; no text, captions or speech bubbles; the lead is the main subject with his face visible; the first frame reads as an opening and the last as a positive close; chapters do not repeat the same shot.
