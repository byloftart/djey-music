# Context Handoff

- Created: 2026-08-03 09:00 +04
- Project root: `/Users/iram/Documents/DJey Audio`

## Current Dialog Notes

# Current-dialog notes

## Checkpoint identity

- Project root: `/Users/iram/Documents/DJey Audio`.
- GitHub: `https://github.com/byloftart/djey-music` (PRIVATE), branch `main`, remote over HTTPS.
- Starting HEAD remains `e63f34a` (`Add backend phase handoff`), matching `origin/main` before this work.
- All backend-foundation changes are intentionally uncommitted and unstaged because the user did not authorize commit or push.

## Completed in this dialog

- Created a minimal Next.js 16.2.12 TypeScript/App Router app in the existing repository without converting or editing the approved player.
- Added pinned npm dependencies and `package-lock.json`, unit-tested owner-email allowlist parsing, browser/server Supabase client factories, trusted `requireOwner`, and `/api/health`.
- Initialized Supabase CLI 2.111.0 locally and created `supabase/migrations/20260803044004_create_backend_foundation.sql` through `supabase migration new`.
- Migration creates validated `public.tracks`, required indexes, automatic `updated_at`, explicit Data API grants, RLS, `private.owner_allowlist`, private `track-audio` and `track-covers` buckets, and owner/public storage policies.
- Public/ordinary authenticated reads return only published metadata and exact published object paths. Non-owner writes fail. Allowlisted owner policies cover track and object reads/writes.
- Public playback strategy is a future trusted server route: resolve a published track through RLS, then issue a short-lived signed private-object URL and verify Range seeking after deployment.
- Local Auth signup is disabled. The owner must be created/invited through the Admin boundary and mapped to `private.owner_allowlist`; README contains the exact SQL shape.
- Updated `AGENTS.md`, `README.md`, `TASKS.md`, `docs/backend-foundation.md`, and `NEXT_DIALOG_PROMPT.md` with setup, env names, migration/rollback, owner bootstrap, storage strategy, verification, and the exact continuation prompt.

## Preserved design contract

- Canonical prototype remains `design/prototypes/djey-music-mobile-player.html`.
- SHA-256 remains `6ea60813f8ab95462efe598f57c7911e3ac3f9d39ceed483630d482cead057de`.
- No visual decisions, settled/rejected directions, desktop composition, or prototype code were changed.

## Verification completed

- `npm test`: 3/3 pass.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm run build`: pass; `/` static and `/api/health` dynamic.
- `npm run supabase:reset`: clean migration apply passes.
- `npm run supabase:test`: 24/24 pgTAP checks pass.
- `supabase db lint`: no schema errors.
- Supabase security advisor: no issues.
- Supabase performance advisor at WARN+: no issues.
- `supabase migration list --local`: `20260803044004` applied.
- Prototype inline JavaScript `node --check`: pass.
- `git diff --check` and trailing-whitespace scan: pass.
- `curl http://localhost:3000/api/health`: `{"service":"djey-music","status":"ok"}`.

## Current local services

- Colima Docker runtime is running.
- Local Supabase stack is running: API `http://127.0.0.1:54321`, Studio `http://127.0.0.1:54323`.
- Next dev server is running at `http://localhost:3000` (session state may not survive a new dialog; restart with `npm run dev` if needed).
- No cloud Supabase project is linked, no billable resource was created, and no Vercel project/deployment exists.

## Environment variables

- Browser-safe: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `OWNER_EMAIL_ALLOWLIST`.
- Upload policy: `MAX_AUDIO_UPLOAD_BYTES`, `MAX_COVER_UPLOAD_BYTES`.
- No raw secrets or owner email values were written to tracked files.

## Known dependency follow-up

- `npm audit --omit=dev` reports three high-severity transitive advisories in the latest stable Next.js 16.2.12 tree through `postcss@8.4.31` and `sharp@0.34.5`.
- npm's proposed `audit fix --force` would downgrade to Next.js 9.3.3 and must not be used. Upgrade to the first compatible patched stable Next.js release, then rerun the gate.

## Exact next step

Bootstrap one local owner Auth user through Supabase Admin, add the matching `private.owner_allowlist` row, then implement the Next.js owner sign-in callback/session `proxy.ts` and a protected owner route that calls `requireOwner`. Verify allowed-owner and rejected-non-owner sessions before beginning validated audio/cover uploads. Do not create or link cloud resources and do not deploy without explicit authorization.

## Git State

### Branch

```
main
```

### Status

```
## main...origin/main
 M .gitignore
 M AGENTS.md
 M NEXT_DIALOG_PROMPT.md
 M README.md
 M TASKS.md
 M docs/backend-foundation.md
?? app/
?? eslint.config.mjs
?? lib/
?? next-env.d.ts
?? next.config.ts
?? package-lock.json
?? package.json
?? supabase/
?? tests/
?? tsconfig.json
```

### Recent Commits

```
e63f34a Add backend phase handoff
b3d24b4 Save approved mobile player design
```

### Diff Stat

```
.gitignore                 |   2 +-
 AGENTS.md                  |   2 +-
 NEXT_DIALOG_PROMPT.md      |   6 +--
 README.md                  | 101 ++++++++++++++++++++++++++++++++++++++++++---
 TASKS.md                   |  15 ++++---
 docs/backend-foundation.md |  15 ++++++-
 6 files changed, 124 insertions(+), 17 deletions(-)
```

## Key Project Files

### `AGENTS.md`

```md
# DJey Music Agent Instructions

## Read first

Before editing, read `README.md`, `DESIGN.md`, `TASKS.md`, `docs/`, the latest file in `docs/handoffs/`, and `git status --short --branch`.

## Current stage

The mobile player design is approved. The Next.js/Supabase backend foundation is implemented locally. The next stage is owner authentication bootstrap and upload management. Do not restart visual exploration, redesign the player, or scaffold unrelated features.

Repository: `https://github.com/byloftart/djey-music.git`; default working branch: `main`.

## Binding decisions

- Exact product/brand name: `DJey Music`.
- Canonical mobile reference: `design/prototypes/djey-music-mobile-player.html`.
- Mobile-first; desktop adaptation is deferred.
- Green Receiver is the default skin; White Neon and Dark Amber remain selectable.
- Public listening never requires authentication.
- Only the allowlisted owner may upload or manage tracks.
- Keep the first release a PWA. Do not add native apps.
- No public uploads, comments, follows, messaging, payments, ads, or recommendation feed.
- Keep unpublished metadata and media private.

## Backend guardrails

- Use versioned Supabase migrations and Row Level Security.
- Public database queries may return only published tracks.
- Draft audio and cover objects must not be publicly readable.
- Never expose the Supabase service-role key or other privileged credentials in browser code.
- Enforce the owner email allowlist at an authenticated server/policy boundary; hiding the admin URL is not security.
- Validate upload type, size, path, and metadata at both user-facing and trusted boundaries.
- Permanently deleting a track must clean up associated storage objects after explicit confirmation.

## Working conventions

- Preserve user changes and inspect the diff before staging.
- Do not commit `.env` files, credentials, generated temporary design sessions, or third-party media.
- Run relevant lint, type-check, tests, build, migration-policy checks, and `git diff --check` before claiming completion.
- Do not push, deploy, change DNS, or create billable resources without explicit authorization for that action.
- Keep `TASKS.md`, README

...(truncated)
```

### `README.md`

```md
# DJey Music

DJey Music is a mobile-first public music portfolio for original tracks created by the owner and a collaborator. Listeners will be able to browse and play published music without registration. A separate protected owner area will handle uploads and catalog management.

GitHub repository: https://github.com/byloftart/djey-music (private at the current checkpoint).

## Current status

The mobile player design was approved on 2026-08-03. A minimal Next.js 16 TypeScript/App Router application and the first local Supabase backend foundation now exist. The foundation includes a versioned `tracks` migration, private audio/cover buckets, RLS for published-only public reads, an owner allowlist boundary, and pgTAP policy tests. No cloud Supabase project is linked and no Vercel deployment exists.

Approved prototype: [`design/prototypes/djey-music-mobile-player.html`](design/prototypes/djey-music-mobile-player.html)

To preview it locally:

```bash
python3 -m http.server 4173 --directory design/prototypes
```

Then open `http://localhost:4173/djey-music-mobile-player.html` and use a mobile viewport. The demo music is synthesized locally in the browser and contains no third-party audio.

## Settled product direction

- Public listening requires no account, registration, or personal data.
- The catalog is intentionally small: no more than about 50 tracks and only a few regular listeners.
- The first release is a responsive installable PWA, not separate native applications.
- Mobile is the primary experience. Desktop adaptation is deferred until the mobile product is implemented.
- The full player does not use album artwork as its dominant element. The upper module is a live spectrum visualizer; the lower illuminated display presents track metadata.
- Exact brand name: **DJey Music**.
- Default skin: **Green Receiver**. Optional skins: **White Neon** and **Dark Amber**.
- Skin choice is device-local and does not require backend persistence.
- Cover artwork remains useful in the catalog, share previews, and track-detail metadata.

See [`DESIGN.md`](DESIGN.md) for the canonical visual contract and rejected alternatives.

## Recommended architecture

- Next.js with

...(truncated)
```

### `TASKS.md`

```md
# DJey Music Tasks

## Current checkpoint

- [x] Define product scope and scale: up to about 50 tracks and a few listeners.
- [x] Approve the mobile player hierarchy and mobile proportions.
- [x] Approve exact brand name `DJey Music`.
- [x] Approve Green Receiver as default with White Neon and Dark Amber alternatives.
- [x] Preserve the approved interactive prototype in the repository.
- [x] Defer desktop adaptation and secondary control semantics.

## Next phase: backend and owner uploads

1. [x] Scaffold the Next.js TypeScript App Router project without replacing the approved prototype.
2. [ ] Connect a Supabase project using the variable names in `.env.example`.
3. [x] Create versioned SQL migrations for `tracks` and required indexes.
4. [x] Configure private audio and cover buckets plus public/published delivery strategy.
5. [x] Add Row Level Security: public reads only published tracks; owner-only writes.
6. [ ] Add allowlisted owner authentication with no public signup UI.
7. [ ] Implement upload validation, progress, metadata draft, preview, publish, update, reorder, unpublish, and confirmed delete with storage cleanup.
8. [ ] Test unauthenticated metadata/storage access and owner-only mutations.
9. [x] Update README with exact Supabase setup, migration, storage-policy, local-development, and verification steps.

Current exact next step: bootstrap the owner Auth user and `private.owner_allowlist` mapping locally, then add the Next.js auth callback/proxy and protected owner route before implementing uploads.

Known dependency follow-up: `npm audit --omit=dev` currently reports three high-severity transitive advisories through the latest stable Next.js dependency tree (`postcss` and `sharp`). Do not run the suggested forced downgrade to Next.js 9; upgrade to the first compatible patched Next.js release and re-run the full gate.

## Later phases

- [ ] Implement the public mobile library and dedicated track URLs.
- [ ] Convert the approved player prototype into production components and Web Audio visualization.
- [ ] Add local favorites, Web Share fallback, optional download, queue, Media Session API, PWA/offline states, SEO, sitemap, and Open Graph metadata

...(truncated)
```

### `docs/architecture.md`

```md
# Architecture Decision

## Decision

Use Next.js with TypeScript and App Router, Supabase Postgres/Storage/Auth, and Vercel. Deliver the listener experience as an installable PWA.

## Context

DJey Music is deliberately small: up to about 50 tracks, two creators, and only a few regular listeners. Operational simplicity matters more than designing for streaming-service scale.

## Component boundaries

- **Public web application:** published library, search/filter, deep-linked track pages, persistent player, local favorites, share/download controls, and PWA shell.
- **Player engine:** one global audio element/state controller, queue, seek/volume, Media Session integration, and Web Audio analyser. Visual components consume analyser data but do not own playback state.
- **Owner administration:** authenticated upload/editor experience. It calls trusted application/storage boundaries and is invisible to ordinary listeners.
- **Metadata:** Supabase `tracks` records are the catalog source of truth.
- **Binary media:** Supabase Storage holds audio and artwork. Database records store stable object paths, not privileged URLs.
- **Authorization:** Supabase Auth identifies the owner; RLS and storage policies enforce access. The client UI is not an authorization boundary.

## Data flow

1. Owner signs in using the restricted auth flow.
2. Upload validation checks MIME type, extension, configured size limits, and normalized storage paths.
3. Audio and optional artwork are uploaded to draft/private paths.
4. Metadata is saved as an unpublished `tracks` row.
5. Owner previews, edits, and publishes the track.
6. Public catalog queries return published rows only.
7. Public playback obtains only the delivery URL/path intended for published audio.
8. Permanent delete confirms intent, removes associated objects, and then removes the database record through an idempotent trusted operation.

## Why not a static-only site

A static catalog would make uploads, drafts, ordering, metadata changes, and secure unpublished assets cumbersome. Supabase provides the small amount of state and owner authorization the product genuinely needs.

## Why Vercel over Netlify

The planned app uses Next.

...(truncated)
```

### `docs/backend-foundation.md`

```md
# Backend Foundation Contract

This is the exact starting scope for the next dialog. It describes the backend and owner-upload foundation; it does not authorize redesigning the approved player.

## Implemented local checkpoint

The first local foundation was implemented on 2026-08-03 in `supabase/migrations/20260803044004_create_backend_foundation.sql`.

- `public.tracks` includes the proposed fields, validation constraints, indexes, automatic `updated_at`, explicit Data API grants, and RLS.
- `private.owner_allowlist` maps an authenticated user UUID to a normalized approved email. The server also evaluates `OWNER_EMAIL_ALLOWLIST`; both boundaries must agree.
- `track-audio` and `track-covers` are private buckets. Published objects are readable only when their exact path is referenced by a published track.
- Production playback will use a trusted route that resolves only published metadata and issues a short-lived signed URL for the exact private audio object. The deployed URL must pass HTTP range/seek verification before release.
- Storage mutation paths and accepted extensions are constrained by policy; bucket MIME allowlists provide another boundary.
- `supabase/tests/database/backend_foundation.test.sql` contains 24 pgTAP checks for schema, policies, published/draft visibility, non-owner denial, and owner reads/inserts.
- Clean local reset, pgTAP, schema lint, and Supabase security/performance advisors pass.

No cloud Supabase project or storage delivery has been created. HTTP range behavior must be verified against the eventual deployed object delivery path.

## Proposed `tracks` model

- `id`: UUID primary key.
- `title`: required display title.
- `slug`: required unique stable URL slug.
- `description`: optional plain text.
- `audio_path`: private/internal storage object path.
- `cover_path`: optional storage object path.
- `duration_seconds`: validated numeric duration.
- `genre`: optional normalized genre.
- `tags`: text array with a practical small limit.
- `status`: draft or published.
- `published_at`: nullable timestamp.
- `download_enabled`: boolean, default false.
- `display_order`: integer for manual ordering.
- `rights_notice`: optional text.
-

...(truncated)
```

## Starter Prompt For Next Dialog

```text
Продолжаем проект: /Users/iram/Documents/DJey Audio

Сначала изучи:
- AGENTS.md
- README.md
- TASKS.md
- docs/
- /Users/iram/Documents/DJey Audio/docs/handoffs/2026-08-03-0900-context-handoff.md
- git status --short --branch

Не начинай проект заново и не пересматривай уже принятые решения, если в хендофе они отмечены как settled/rejected.

После этого кратко скажи:
1. где мы остановились;
2. какие изменения уже сделаны;
3. какой следующий шаг;
и затем продолжай работу с указанного next step из хендофа.
```
