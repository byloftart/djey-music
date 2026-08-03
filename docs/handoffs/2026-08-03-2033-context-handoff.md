# DJey Music production player integration handoff

- Created: 2026-08-03 20:33 +04
- Project root: `/Users/iram/Documents/DJey Audio`
- Branch: `main`
- Remote: `origin` -> `https://github.com/byloftart/djey-music.git`
- Published owner-admin commit: `be08d34` (`Implement protected owner admin workflow`)

## Exact checkpoint

The approved owner-admin production flow is implemented, verified, committed, and pushed to `origin/main`. It includes the owner Auth/session boundary, protected `/admin`, approved catalog and Add/Edit surfaces, signed audio upload, draft/publish lifecycle, persisted reorder, and confirmed delete.

The next stage is not more admin redesign. It is production integration of the already-approved player with real published tracks.

No cloud Supabase project is linked. No cloud migration push, Vercel deployment, DNS change, or billable action occurred.

## Cleanup and repository scope

- Temporary `.superdesign` init/tmp files and superseded untracked intermediate handoffs were removed.
- Ignored `.env.local`, raw credentials, QA audio, screenshots, and generated build output were not committed.
- Owner login tests use neutral fixture emails; the real local Auth email/password remain only in ignored `.env.local`.
- Private preview/cover backend primitives remain as previously verified lifecycle compatibility, but the approved Add/Edit UI exposes neither control.

## Player/backend verification

- Production `/` is still the placeholder in `app/page.tsx`; it is not connected to Supabase or real playback.
- Canonical player reference: `design/prototypes/djey-music-mobile-player.html`.
- The prototype is static and synthesizes demo audio. Do not carry that synthetic source into production.
- Anonymous public RLS returned the currently published tracks in persisted order:
  1. `Kisses your back`
  2. `Attention`
  3. `Equals`
- Signed byte-range reads for all three MP3 objects returned `206 Partial Content`, `audio/mpeg`, and the requested 1024 bytes for `Range: bytes=0-1023`.
- The public metadata/privacy/storage foundation is therefore ready for player integration.
- Public listening requires no Auth. Draft metadata and draft audio must remain private.

## Settled player contract

- Exact brand: `DJey Music`.
- Preserve the approved mobile hierarchy and proportions; do not restart design exploration.
- Green Receiver is default. White Neon and Dark Amber remain alternatives.
- The spectrum visualizer remains the dominant upper surface; do not restore album artwork.
- The mobile composition stays centered at its mobile width on wide browsers. Desktop redesign is deferred.
- Production uses real published audio and metadata, not the prototype's synthesized demo.
- Only rows with `status = published`, ordered by persisted `display_order`, may reach public UI/audio delivery.

## Exact next implementation step

Implement the smallest production vertical slice from the published-tracks query to a real `<audio>` element inside the approved player shell:

1. Render the first published track's real metadata inside the approved player composition.
2. Obtain an audio URL only for that published track through the existing privacy boundary.
3. Connect play, pause, and seek with elapsed/total time.
4. Verify that one real MP3 plays and range seeking works.
5. Only then connect previous/next, ended-state advance, playback errors, and the Web Audio spectrum visualization.

Do not begin with a generic library page, redesign, PWA extras, desktop layout, favorites, deployment, or cloud setup.

## Verification evidence

- `npm test`: 25/25 passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run supabase:test`: 24/24 passed on the populated local catalog.
- `git diff --check`: passed.
- pgTAP fixture queries are scoped to their fixed UUID/path fixtures, so tests no longer require a destructive Supabase reset merely because real tracks exist.

## Local access and environment continuity

- App: `http://localhost:3000`
- Same-Wi-Fi iPhone: `http://192.168.1.2:3000`
- Admin: `http://192.168.1.2:3000/admin`
- Local Supabase API: `http://192.168.1.2:54321`
- Supabase Studio: `http://127.0.0.1:54323`
- Next.js remains bound to `0.0.0.0`; Colima, local Supabase, and the dev server were running at handoff time.
- If DHCP changes the Mac address, update ignored `.env.local` values `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SUPABASE_URL`, then restart with `npm run dev -- --hostname 0.0.0.0`.
- Other required env names are documented in `.env.example` and README: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OWNER_EMAIL_ALLOWLIST`, `OWNER_LOGIN`, `OWNER_LOGIN_EMAIL`, and upload limits. Never place raw values in tracked files.

## Low-overhead next-dialog entry

At entry, run only `git status --short --branch`, then read:

- `AGENTS.md`
- `README.md`
- `DESIGN.md`
- `TASKS.md`
- `design/prototypes/djey-music-mobile-player.html`
- this handoff

Do not run installs, restart servers, build, broad tests, Supabase reset, browser sweeps, audits, design generation, or deployment inspection merely to enter the dialog. Acknowledge the checkpoint and immediately implement the player vertical slice. Run focused checks only after the slice exists.

## Copy-paste starter prompt

```text
Продолжаем проект: /Users/iram/Documents/DJey Audio

Сначала выполни git status --short --branch и прочитай:
- AGENTS.md
- README.md
- DESIGN.md
- TASKS.md
- design/prototypes/djey-music-mobile-player.html
- docs/handoffs/2026-08-03-2033-context-handoff.md

Не начинай проект заново и не пересматривай утверждённые player/catalog/Add-Edit designs. Owner-admin production flow уже реализован, проверен и сохранён на GitHub. На старте не запускай install, серверы, build, broad tests, Supabase reset, browser sweep, design generation или deployment inspection.

Кратко подтверди checkpoint и сразу реализуй минимальный production vertical slice от публичного published-tracks query до реального <audio> внутри утверждённого player shell. Сначала добейся отображения реальных metadata, play, pause и seek для одного опубликованного трека; затем подключай next/previous и spectrum visualization. Не используй synthetic demo audio и не ослабляй draft privacy.
```
