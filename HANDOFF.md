# Life Crisis Tycoon — handoff for the next session

> **Single source of truth (since 10 Nov 2026): this repository → https://life-crisis-tycoon.github.io/.**
> The old Claude artifact link (claude.ai/artifact/8YRXCTKeta6fUcU8MhPFFo) is frozen: never develop there again.
> Every session: `git pull` first, commit and push to main when done, so parallel conversations never diverge.


## LIVE (done 2026-11-06)
- Game: https://life-crisis-tycoon.github.io/ — repo github.com/life-crisis-tycoon/life-crisis-tycoon.github.io (GitHub org; old gnaine/Life-crisis-tycoon is obsolete). Before a Google Play release, move to a custom domain (Play app is bound to its domain; local saves are per web address) (GitHub Pages, main branch, root, `.nojekyll`). A push redeploys in ~4 min.
- Supabase project `life-crisis-tycoon` (ref pvihszrcjosdyxmkcklu, eu-west-3, org "gnaine's Org"). Tables: `saves` (RLS own rows), `profiles` (user_id, username unique case-insensitive 3–16 `[A-Za-z0-9_.-]`, public read, own write).
- Auth: Site URL + redirect `https://life-crisis-tycoon.github.io/**`; email OTP length 6; custom SMTP = Brevo (smtp-relay.brevo.com:587, login c1c5ea001@smtp-brevo.com, sender ena.naine@gmail.com "Life Crisis Tycoon"; key entered by the user). Templates "Magic link" + "Confirm sign up" contain `{{ .Token }}` + link (FR/EN).
- account.js: account REQUIRED (config.js `REQUIRE_ACCOUNT`), never blocks offline or if a login was ever stored; 2-step panel (email → code, auto-submit at 6 digits); first sign-in asks a public username (`window.MLT_ACCOUNT.username`) — rankings must show usernames, never emails. Apple/Google hidden until set up: add to `PROVIDERS` in config.js.
- Still to do: end-to-end restore test with a real account; Google sign-in (Google Cloud OAuth client); leaderboard/stats (build from `saves` + `profiles`, expose username + score only, e.g. a SQL view or RPC).

Read this first. The user (French or English; answer in the language she writes in) wants to move the game off the Claude artifact into a standalone installable web app with real accounts and permanent saves.

## Immediate task (what she asked for)
1. **Supabase** (connector): create a project (or use the one she names). Run `supabase.sql` (table `saves` + row-level security). Put the Project URL + anon public key in `config.js` (never the service_role key).
   - Auth → URL configuration: Site URL + Redirect URLs = the hosted address (GitHub Pages URL).
   - Auth → Email templates → Magic link: include `{{ .Token }}` (players type the 6-digit code inside the installed iPhone app — a PWA does not share storage with Safari, so links alone don't sign it in).
   - Providers: Email on. Google = Google Cloud OAuth client (guide her). Apple = needs Apple Developer account (99 $/yr) → later, button already in the app.
2. **GitHub** (connector): create repo `life-crisis-tycoon`, push this folder (no build step), enable GitHub Pages (main branch, root). Large files are fine (biggest ~4 MB).
3. **Verify end to end**: sign in by email code, play, wipe local storage, reload → progress restored; install to home screen; import old progress with the 💾 Export / 📥 Import code ("MLT1:…").
4. Send her the live link and the Supabase/Google steps she must do herself.

## Session 2026-11-06 (gameplay polish) — what changed
- Placement rules: `deskValid` checks the whole counter footprint (+chair, +first queue places) vs lobby walls, lobby sofa (`SOFA_BOX`), plants (`LOBBY_PLANTS`), decor; `fixDesk()` relocates invalid desks on load / after lengthening. `decorValid` checks the rotated footprint (`DECOR_HALF`) vs floor, rooms, desks, plants, decor and every desk's queue line.
- Reception: default desk {4.6, 2.8, r 0} (faces the entrance); old untouched default migrates (`S.deskV`). Chair+monitor parts of the desk GLB are moved to station(s) by `dressDesk` (double counter = 2 sets); host sits on the chair (`deskSpot`, `ST_X`, `ST_BACK`).
- Sitting: `settle()` raycasts the real seat surface (`seatTop`) for GLB sitters (hips at seat + `HIP_PAD`).
- Time: after the tutorial, Build menus/placement run in real time (`liveBuild`, `buildSheet`, `resumeForBuild`); pause is refused while placing.
- UI: ⚙️ Settings (`openAudio`) separate from Goals; ✕ on every sheet; graphics change reloads straight back into the city (`sessionStorage.ahq_resume`).
- Café is staffed by a Community Host (`ROOMS.cafe.role = 'host'`); café perks need `cafeOpen()`. Old saves with a café get a host once (`S.baristaV`).
- Staff never leave mid-session (breaks, life events wait for `patientOf`); a client left alone returns to waiting.
- Crowds: `OVERFLOW` rows on the plaza; full house → visitor leaves with a crowd complaint; queue capped at `QMAX = 11`.
- Mess markers (`updateMessIcons`), broom icon while cleaning; toilets: need builds up from arrival, 🚻 head icon.
- Waiting sofa decor (`DECOR.sofa`, 2 seats via `syncDecorSeats`). Cut walls at 0.42 height, door frames stay full height.
- City intro: one screen, `assets/brief_london.jpg` header (rendered from a staged full HQ). Tutorial step 3 = tap a visitor.
- Test harness (container): playwright + swiftshader, three.js from npm, service workers blocked; `node --check` must be run on a `.mjs` copy (plain .js check misses module syntax errors).

## How saves work
- The game keeps everything in localStorage keys starting `ahq_` (`ahq_<city>_v2` per city, `ahq_profile`, `ahq_mgr`, `ahq_lang`, …). Never rename these: **updates must never reset saves**.
- `game.js` → "online save" block: `Storage.prototype.setItem` is wrapped to timestamp `ahq_` writes (`ahq_sync_at`) and push changed keys (debounced, on pagehide/visibilitychange). Backend adapter `{uid, list(), put(k, v, at)}`:
  - standalone app: `window.MLT_APP = true` (index.html) + `account.js` → `window.MLT_ACCOUNT.api()` (Supabase table `saves`).
  - Claude artifact: `window.claude.use('db')` (`data/users/<uid>/<key>`). The artifact is public, so the platform refused to declare `db`; it falls back to "use Export".
- Merge on start: local key missing/never timestamped → cloud wins; key written before sync finished this session → the **more advanced** save wins (stars, then day) so a fresh start never erases progress; otherwise newest wins. `ahq_profile` stars are merged by max.
- `window.mltCloudStart()` re-syncs after sign-in; `mltCloudStop()` on sign-out.

## Files
- `index.html` (PWA tags, 👤 Account button `#bAccount`, `#cloudInfo` line, service worker registration), `account.js` (Supabase auth UI in 7 languages: Apple, Google, email code, play without account), `config.js` (placeholders), `manifest.webmanifest`, `sw.js` (code network-first, models/assets cache-first, never caches supabase.co), `icons/`, `supabase.sql`.
- Game: `game.js` (main), `city.js` (city decor + landmarks), `chars.js`, `cases*.js` (special cases), `i18n.js` + `i18n_mgr.js` (strings; new strings go in `EXTRA20`), `audio.js`, `batch.js`, `toon.js`, `models/` (GLBs as base64 JS modules; `models/props/` = art pilot props).
- The Claude artifact copy lives at https://claude.ai/artifact/8YRXCTKeta6fUcU8MhPFFo (slug 3d13238d-50d7-4ebb-9c97-3d0ae5e9ae02, public: publishing needs shared_live "public" + artifact_title "Life Crisis Tycoon: Fix the Chaos").

## Standing rules from the user
- Never call any skin tone "neutral". No stereotyped appearance→problem mapping.
- Next-step/goal highlights never green (green = completed). The Build nav button is not coloured differently.
- Updates must never reset saves.
- London stays the simple tutorial city; new behaviours start from city 2 (Lagos). Natural disasters → future hard mode.
- Don't tune difficulty from the bot (bot only spots breakages; tuning comes from human playtests). Avoid goals that are just waiting. Daily goals and special cases come once per in-game week.
- Check art quality against her reference sheets before publishing (side-by-side). She dislikes worn/"old" looking textures.
- Playtest shortcut: tap the star counter on the world map 5× → all cities open (`ahq_unlock`).

## Art pipeline (tools/)
- `tools/gltfx/`: `geo.mjs` (shape-only simplify), `bake.py` (re-bake the Meshy texture onto the light mesh with xatlas — use this, NOT texture-seam-collapsing simplification), `props.mjs` (scale/centre/WebP/quantize). Needs `npm i @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer sharp` and `pip install trimesh xatlas scipy rtree`.
- `tools/blender/`: `make3.py` (reception desk, plane tree, toilet cubicle), `simple.py` (plants s/m/l, side table, planter, bus stop, kitchenette, radiator, air-con). Run with `pip install bpy` (Blender 5.2 headless): `python3 simple.py -- out all`.
- In game: `glbSwap(group, name, {h|len, rot, y, keep})` replaces a primitive-built group with `models/props/<name>.js` once loaded (`?props=0` disables). Groups marked `userData.swap` are excluded from mesh batching.
- Remaining art pilot step: sheet C building kit (walls, doors, windows, facades, floor materials), then rendering upgrades (soft shadows, AO, grading) within a mobile budget. Meshy balance ~589 credits; reference sheets are in `tools/art_src/`. The raw 20-58 MB Meshy GLBs are not included (too big); re-download from Meshy if a re-bake is needed.
