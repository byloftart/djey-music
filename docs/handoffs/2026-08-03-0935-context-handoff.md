# Context Handoff

- Created: 2026-08-03 09:35 +04
- Project root: `/Users/iram/Documents/DJey Audio`

## Current Dialog Notes

# DJey Music owner-admin waiting checkpoint

## Purpose of this handoff

This is a deliberate waiting checkpoint for a new dialog devoted to the owner admin interface and its functionality. The new dialog must restore only this checkpoint and wait for the user's concrete instruction. It must not start work automatically.

## Saved state

- Project path: `/Users/iram/Documents/DJey Audio`.
- Repository: `https://github.com/byloftart/djey-music.git`.
- Working branch: `main`.
- Backend/admin-contract commit at handoff creation: `8f480ee` (`Add Supabase backend foundation and admin contract`).
- The approved player remains unchanged at `design/prototypes/djey-music-mobile-player.html`.
- No push, cloud Supabase project, Vercel project, deployment, DNS change, or billable resource was created in this work.

## What is implemented

- Minimal Next.js 16.2.12 app with TypeScript and App Router.
- Supabase client/server helpers and server-side owner allowlist helper.
- Versioned migration `supabase/migrations/20260803044004_create_backend_foundation.sql`.
- `public.tracks` with draft/published metadata and ordering fields.
- Private `track-audio` and `track-covers` buckets.
- RLS/storage policies for published-only anonymous reading and allowlisted authenticated owner writes.
- Local database policy tests and owner-email unit tests.
- Backend operating contract in `docs/backend-foundation.md`.
- Owner-admin product, visual, functional, validation, and capacity contract in `docs/admin-panel.md`.

## Verification already completed before this checkpoint

Do not repeat these checks merely to enter the next dialog. The backend checkpoint already passed:

- unit tests: 3/3;
- ESLint;
- TypeScript check;
- production build;
- clean local Supabase reset;
- pgTAP policies: 24/24;
- database lint;
- Supabase security and performance advisors;
- migration-list verification;
- canonical prototype SHA-256 remained `6ea60813f8ab95462efe598f57c7911e3ac3f9d39ceed483630d482cead057de`.

Known non-blocking dependency note: the latest selected Next.js line still reports three high transitive npm advisories through `postcss`/`sharp`; no forced downgrade was applied.

## Settled admin direction

- The admin must look like the same product as the approved player: the same light-neomorphic DJey Music design system, material language, typography, radii, glow behavior, and token-based palettes.
- Green Receiver is the default. White Neon and Dark Amber remain selectable shared palettes.
- The admin is not a geometric copy of the player. It needs a functional catalog/upload/edit/publishing composition.
- A generic SaaS dashboard or Supabase Studio-like interface is rejected.
- The exact admin composition is not yet approved. Before implementing UI, show the user a concrete composition/candidate and wait for approval.
- Public listening remains unauthenticated. Only the allowlisted owner may manage tracks.
- Draft metadata, draft audio, and draft covers remain private.

## Admin work still not implemented

- No owner Auth user/invite exists locally or in a cloud project.
- No sign-in, auth callback, session middleware/proxy, or protected admin route exists.
- No admin catalog screen or upload/edit form exists.
- No upload lifecycle, progress/cancel handling, draft preview, publish/unpublish, reorder, or permanent-delete flow exists.
- No cloud resources or deployment exist.

## Exact startup rule for the next dialog

At dialog start:

1. Run only `git status --short --branch`.
2. Read this latest handoff and `docs/admin-panel.md`.
3. Report in no more than four short points: the saved checkpoint, what is settled, what admin work remains, and that you are waiting for the user's instruction.
4. Stop and wait.

Do not run installs, servers, builds, test suites, Supabase reset, browser checks, audits, deployment checks, implementation, or design generation during startup. Do not reread the whole repository or historical handoffs at startup.

Only after a concrete user instruction, read `AGENTS.md`, `README.md`, `DESIGN.md`, `TASKS.md`, and the files relevant to that instruction. Then perform only proportionate verification.

## Next decision point

The first expected user-guided task is to refine and approve the concrete admin-panel composition, then implement its protected functionality against the saved Supabase contracts. Do not assume that instruction has already been given.

## Guardrails

- Do not change the canonical player prototype without an explicit request.
- Do not revisit settled/rejected player design decisions.
- Do not create paid or cloud resources, deploy, change DNS, push, or publish without separate explicit permission.
- Do not expose a service-role key in browser code.
- Do not treat a hidden admin URL as access control.
- Preserve permanent-delete confirmation and associated storage cleanup requirements.

## Git State

### Branch

```
main
```

### Status

```
## main...origin/main [ahead 1]
```

### Recent Commits

```
8f480ee Add Supabase backend foundation and admin contract
e63f34a Add backend phase handoff
b3d24b4 Save approved mobile player design
```

### Diff Stat

```
(no output)
```

## Key Project Files

### `AGENTS.md`

```md
# DJey Music Agent Instructions

## Low-overhead next-dialog entry

At the saved admin-panel waiting checkpoint, first run only `git status --short --branch`, then read the latest file in `docs/handoffs/` and `docs/admin-panel.md`. Briefly acknowledge the exact checkpoint and wait for the user's concrete instruction. Do not start servers, installs, builds, test suites, Supabase reset, browser sweeps, audits, design generation, or implementation at dialog startup.

After the user gives a concrete instruction and before editing, read `README.md`, `DESIGN.md`, `TASKS.md`, the relevant files under `docs/`, and the latest direct user correction. Do not reread historical handoffs unless the latest handoff explicitly points to one.

## Current stage

The mobile player design is approved and the Next.js/Supabase backend foundation is implemented locally. The next stage is the owner admin interface and functionality, but it must begin only after a concrete user instruction in the next dialog. Do not restart player exploration, redesign the player, or scaffold unrelated features.

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
- The owner admin uses the same light-neomorphic DJey Music design system and Green Receiver/White Neon/Dark Amber tokens as the player, with task-appropriate admin layouts rather than copied player geometry.
- Do not implement a generic SaaS dashboard. The exact admin composition still requires explicit user approval.

## Backend guardrails

- Use versioned Supabase migrations and Row Level Security.
- Public database queries may return o

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

## Completed backend foundation

1. [x] Scaffold the Next.js TypeScript App Router project without replacing the approved prototype.
2. [ ] Connect a Supabase project using the variable names in `.env.example`.
3. [x] Create versioned SQL migrations for `tracks` and required indexes.
4. [x] Configure private audio and cover buckets plus public/published delivery strategy.
5. [x] Add Row Level Security: public reads only published tracks; owner-only writes.
6. [ ] Add allowlisted owner authentication with no public signup UI.
7. [ ] Implement upload validation, progress, metadata draft, preview, publish, update, reorder, unpublish, and confirmed delete with storage cleanup.
8. [ ] Test unauthenticated metadata/storage access and owner-only mutations.
9. [x] Update README with exact Supabase setup, migration, storage-policy, local-development, and verification steps.

## Next phase: owner admin interface and functionality

1. [ ] At the new-dialog checkpoint, acknowledge the saved state and wait for the user's concrete admin-panel instruction; do not run startup tests or begin implementation.
2. [ ] Present a concrete admin composition using the settled DJey Music neomorphic design system and wait for explicit visual approval.
3. [ ] Bootstrap the local owner Auth user and `private.owner_allowlist` mapping.
4. [ ] Add the Next.js Auth callback/session proxy and a protected owner route using `requireOwner`.
5. [ ] Implement the approved catalog shell and add/edit track form.
6. [ ] Connect validated audio/cover upload with progress, cancellation, and error recovery.
7. [ ] Connect draft, preview, publish, unpublish, reorder, update, and confirmed idempotent delete.
8. [ ] Verify allowed-owner and rejected-non-owner sess

...(truncated)
```

### `docs/admin-panel.md`

```md
# DJey Music Owner Admin Contract

Status: planning checkpoint for the next dialog. No owner-facing admin interface has been implemented yet.

## Settled visual relationship

The owner admin is part of the same DJey Music product and must use the same visual system as the approved player.

- Use the same light neomorphism: raised shells, inset working surfaces, soft paired shadows, tactile controls, readable illuminated states, and comfortable touch targets.
- Green Receiver is the default palette. White Neon and Dark Amber remain alternate token sets rather than separate implementations.
- Reuse the same typography character, glow logic, radii, spacing rhythm, and hardware-inspired feeling.
- The admin must not look like a generic SaaS dashboard, default Supabase Studio, or an unrelated table template.
- Sharing a design system does not mean copying the player geometry. The catalog, upload form, validation, progress, and destructive confirmations need task-appropriate layouts.
- Do not add spectrum displays or playback decorations where they do not serve an admin task.
- Exact admin composition has not been approved. The next concrete visual candidate must be shown to the user before production UI implementation.

The canonical player prototype remains `design/prototypes/djey-music-mobile-player.html` and must not be modified while designing the admin.

## Intended owner workflow

The protected owner area will eventually provide:

1. Owner-only sign-in with no public signup.
2. A media catalog showing cover, title, draft/published status, manual order, and available actions.
3. Add/edit fields for title, slug, description, genre, tags, duration, download permission, rights notice, display order, audio, and cover.
4. Audio and cover validation before upload, including the configured byte limit, accepted type, normalized path, progress, cancellation, and visible error recovery.
5. Draft save, authorized preview, explicit publish, unpublish, reorder, and metadata update.
6. Permanent delete only after explicit confirmation, with idempotent database and storage cleanup.
7. Clear empty, loading, uploading, success, validation-error, and partial-failure states.

## E

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
Продолжаем проект: `/Users/iram/Documents/DJey Audio`

Начни только с минимального восстановления checkpoint:

1. Выполни только `git status --short --branch`.
2. Прочитай `docs/handoffs/2026-08-03-0935-context-handoff.md` и `docs/admin-panel.md`.

Не запускай `npm install`, dev-серверы, build, test suites, Supabase reset, браузерные проверки, visual audit и deployment inspection. Не начинай реализацию и не генерируй новый дизайн на старте диалога.

После чтения кратко сообщи максимум четырьмя пунктами:

1. где остановился проект;
2. что уже утверждено и сохранено;
3. что еще не реализовано в owner admin;
4. что ты ждешь мою конкретную инструкцию по следующему шагу.

После этого остановись и жди моей команды. Не предпринимай никаких действий самостоятельно.

Контекст следующего этапа: интерфейс admin-панели должен использовать тот же light-neomorphic дизайн DJey Music, Green Receiver по умолчанию и White Neon/Dark Amber как общие token-based палитры. Это та же дизайн-система, но с функциональной компоновкой каталога, upload/edit формы, статусов и управления публикацией, а не копия геометрии плеера. Generic SaaS dashboard запрещен. Точная композиция admin-панели еще не утверждена и должна быть показана мне до реализации.

После моей конкретной инструкции прочитай `AGENTS.md`, `README.md`, `DESIGN.md`, `TASKS.md` и только релевантные документы/файлы. Не изменяй канонический прототип `design/prototypes/djey-music-mobile-player.html`. Не создавай cloud-ресурсы, не выполняй deployment и не push без отдельного явного разрешения.
```
