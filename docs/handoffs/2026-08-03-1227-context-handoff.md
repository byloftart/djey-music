# Context Handoff

- Created: 2026-08-03 12:27 +04
- Project root: `/Users/iram/Documents/DJey Audio`

## Current Dialog Notes

# DJey Music approved owner-admin checkpoint

## Completed in this dialog

- Restored the backend waiting checkpoint without running startup builds, tests, servers, Supabase reset, or deployment inspection.
- Designed and polished the mobile owner-admin catalog through Superdesign with direct user review on MacBook and iPhone 15 Plus.
- Preserved the final approved catalog as `design/prototypes/djey-music-owner-admin-catalog.html`.
- Wrote the binding design/interaction contract at `docs/superpowers/specs/2026-08-03-djey-music-owner-admin-design.md`.
- Updated `AGENTS.md`, `README.md`, `DESIGN.md`, `TASKS.md`, and `docs/admin-panel.md` to replace the old waiting checkpoint with the approved implementation checkpoint.
- Removed the untracked `.superdesign/` init/design-system files after moving approved decisions into tracked artifacts. The remote Superdesign project/drafts remain available.

## Approved owner-admin design

- Canonical catalog prototype: `design/prototypes/djey-music-owner-admin-catalog.html`.
- Superdesign project: `cae57f2a-0bf1-414a-a950-6fee44f440fe`.
- Final draft: `b3a7732f-f4cc-467e-aae8-d85a657bb9f0`.
- Final preview: `https://p.superdesign.dev/draft/b3a7732f-f4cc-467e-aae8-d85a657bb9f0`.
- Entire admin is English-only.
- White Neon is the default admin theme; Dark Amber is the only alternate through one light/dark toggle. Green Receiver remains part of the separate player and is not used in admin.
- Mobile-only: on MacBook/wide browsers the same interface stays centered at no more than about 430px. Desktop design remains deferred.
- Header: centered `DJey Music / Admin Panel`, left account control revealing only `Sign Out`, right theme toggle.
- Equal illuminated displays: `48 TRACKS TOTAL` and filter `All Tracks / Published / Drafts`.
- Track cards: no cover, no number, no text status badge, no overflow menu. Green dot means Published; red means Draft. The dot sits in its own narrow left column centered between title and genre. One Edit button only; visible height about 38px with at least 44px touch target.
- Compact row density allows at least four complete cards on the initial iPhone 15 Plus visible viewport.
- Long-press reorder preserves native scrolling, suppresses iOS selection/callout, shows lifted/ghost states, and confirms `Order updated`. The prototype uses SortableJS from CDN only as a design reference; production must use a local dependency or robust equivalent and persist `display_order`.
- Full-width Add Track dock is in normal flex flow with dynamic viewport height and bottom safe-area padding. The user confirmed on iPhone 15 Plus that the scroll and browser-toolbar clipping fix works.
- The latest reorder implementation was corrected after an iPhone screenshot showed blue text selection and lag. It is preserved in the prototype but still needs a fresh real-device confirmation in production.

## Rejected or removed

- Generic SaaS dashboard, analytics, sidebar, desktop table, and desktop expansion.
- Mixed Russian/English copy.
- Green Receiver in admin.
- Cover placeholders in catalog rows.
- Visible track numbers.
- Published/Draft text badges.
- Per-track overflow menu.
- Separate bottom Filter and Reorder buttons.
- Permanent drag helper text.
- Absolute bottom dock and fixed `100vh` mobile sizing.

## Current implementation state

- The minimal Next.js 16 App Router scaffold and local Supabase backend foundation exist.
- `public.tracks`, private audio/cover buckets, RLS/storage policies, and trusted `requireOwner` helper exist locally.
- No owner Auth user, callback, session proxy/middleware, protected admin route, production catalog UI, Add/Edit form, upload lifecycle, preview, publish/unpublish, reorder persistence, or delete cleanup is implemented.
- No cloud Supabase project, Vercel project, deployment, DNS change, or billable resource exists.
- Public listening remains unauthenticated; only the allowlisted owner may manage tracks; draft metadata/media remain private.

## Exact next step

Begin production implementation without restarting design exploration:

1. Inspect `lib/auth/require-owner.ts`, `lib/supabase/server.ts`, `lib/supabase/client.ts`, `app/layout.tsx`, `app/page.tsx`, and the backend migration.
2. Implement the owner Auth callback/session boundary and protected `/admin` route using the existing `requireOwner` contract.
3. Convert the approved catalog prototype into local tokenized React/CSS components without CDN Tailwind, Google Fonts, Iconify, or SortableJS.
4. Implement full-screen Add Track and Edit Track routes using the approved spec, then connect upload/draft/preview/publish/unpublish/reorder/delete in focused slices.
5. Run focused tests/checks after each slice. Do not run broad tests, builds, servers, Supabase reset, browser sweeps, or deployment inspection merely to enter the new dialog.
6. Deployment and cloud-resource creation come only after the local owner flow is ready and must preserve the documented environment variable names and trusted boundaries.

Required environment variables remain `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OWNER_EMAIL_ALLOWLIST`, `MAX_AUDIO_UPLOAD_BYTES`, and `MAX_COVER_UPLOAD_BYTES`. Never store raw secret values in tracked files.

## Verification in this checkpoint

- No npm install, dev server, build, test suite, Supabase reset, browser sweep, or deployment inspection was run.
- Inline JavaScript syntax passed for both canonical prototypes through `node --check` extraction.
- The new design spec passed a placeholder scan, and `git diff --check` passed.
- Design/docs commit: `7f75f14` (`Approve owner admin catalog design`).
- This handoff and `NEXT_DIALOG_PROMPT.md` are the final follow-up commit scope. The full `main` checkpoint is authorized for push to `origin`; expected final state is a clean `main` synchronized with `origin/main`.

## Git State

### Branch

```
main
```

### Status

```
## main...origin/main [ahead 3]
```

### Recent Commits

```
7f75f14 Approve owner admin catalog design
4be5fcc Add owner admin continuation handoff
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

At the saved approved-admin checkpoint, first run `git status --short --branch`, then read the latest file in `docs/handoffs/`, `docs/admin-panel.md`, and `docs/superpowers/specs/2026-08-03-djey-music-owner-admin-design.md`. Briefly acknowledge the exact checkpoint and begin the handoff's stated next implementation step. Do not start servers, installs, builds, broad test suites, Supabase reset, browser sweeps, audits, design generation, or deployment inspection merely to enter the dialog.

Before editing, read `README.md`, `DESIGN.md`, `TASKS.md`, and only the owner/auth/backend files relevant to the next step. Do not reread historical handoffs unless the latest handoff explicitly points to one. Do not restart catalog exploration; the owner-admin catalog is approved.

## Current stage

The mobile player and mobile owner-admin catalog designs are approved, and the Next.js/Supabase backend foundation is implemented locally. The next stage is production owner authentication, the protected admin shell, and the Add/Edit track workflow. Do not restart player or catalog exploration, redesign either approved prototype, or scaffold unrelated features.

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
- The owner admin uses the same light-neomorphic DJey Music material system with task-appropriate layouts rather than copied player geometry.
- Owner-admin UI is English-only. White Neon is its default theme; Dark Amber is its only alternate. Green Receiver remains part of the separate player contrac

...(truncated)
```

### `README.md`

```md
# DJey Music

DJey Music is a mobile-first public music portfolio for original tracks created by the owner and a collaborator. Listeners will be able to browse and play published music without registration. A separate protected owner area will handle uploads and catalog management.

GitHub repository: https://github.com/byloftart/djey-music (private at the current checkpoint).

## Current status

The mobile player and mobile owner-admin catalog designs were approved on 2026-08-03. A minimal Next.js 16 TypeScript/App Router application and the first local Supabase backend foundation exist. The foundation includes a versioned `tracks` migration, private audio/cover buckets, RLS for published-only public reads, an owner allowlist boundary, and pgTAP policy tests. No production admin UI, cloud Supabase project, or Vercel deployment exists yet.

Approved prototype: [`design/prototypes/djey-music-mobile-player.html`](design/prototypes/djey-music-mobile-player.html)

Approved owner-admin catalog prototype: [`design/prototypes/djey-music-owner-admin-catalog.html`](design/prototypes/djey-music-owner-admin-catalog.html)

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
- Cover artwork remains useful

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

1. [x] At the new-dialog checkpoint, acknowledge the saved state and wait for the user's concrete admin-panel instruction; do not run startup tests or begin implementation.
2. [x] Approve the mobile owner-admin catalog composition and preserve it at `design/prototypes/djey-music-owner-admin-catalog.html` plus the owner-admin design spec.
3. [ ] Bootstrap the local owner Auth user and `private.owner_allowlist` mapping.
4. [ ] Add the Next.js Auth callback/session proxy and a protected owner route using `requireOwner`.
5. [ ] Implement the approved catalog shell and add/edit track form.
6. [ ] Connect validated audio/cover upload with progress, cancellation, and error recovery.
7. [ ] Connect draft, preview, publish, unpublish, reorder, update, and confirmed idempotent delete.
8. [ ] Verify allowed-own

...(truncated)
```

### `docs/admin-panel.md`

```md
# DJey Music Owner Admin Contract

Status: owner-admin catalog design approved on 2026-08-03. No production owner-facing admin interface has been implemented yet.

## Settled visual relationship

The owner admin is part of the same DJey Music product and must use the same visual system as the approved player.

- Use the same light neomorphism: raised shells, inset working surfaces, soft paired shadows, tactile controls, readable illuminated states, and comfortable touch targets.
- White Neon is the default owner-admin palette. Dark Amber is its only alternate through one light/dark toggle. Green Receiver is not used in the admin and remains limited to the separate player contract.
- Reuse the same typography character, glow logic, radii, spacing rhythm, and hardware-inspired feeling.
- The admin must not look like a generic SaaS dashboard, default Supabase Studio, or an unrelated table template.
- Sharing a design system does not mean copying the player geometry. The catalog, upload form, validation, progress, and destructive confirmations need task-appropriate layouts.
- Do not add spectrum displays or playback decorations where they do not serve an admin task.
- The catalog composition is approved at `design/prototypes/djey-music-owner-admin-catalog.html`; its exact contract is `docs/superpowers/specs/2026-08-03-djey-music-owner-admin-design.md`.
- Every owner-admin label, field, status, action, error, and confirmation is English.
- Wide browsers continue to show the centered mobile composition; desktop adaptation remains deferred.

The canonical player prototype remains `design/prototypes/djey-music-mobile-player.html` and must not be modified while designing the admin.

## Intended owner workflow

The protected owner area will eventually provide:

1. Owner-only sign-in with no public signup.
2. A media catalog showing cover, title, draft/published status, manual order, and available actions.
3. Add/edit fields for title, slug, description, genre, tags, duration, download permission, rights notice, display order, audio, and cover.
4. Audio and cover validation before upload, including the configured byte limit, accepted type, normalized path, progress, cancel

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
- /Users/iram/Documents/DJey Audio/docs/handoffs/2026-08-03-1227-context-handoff.md
- git status --short --branch

Не начинай проект заново и не пересматривай уже принятые решения, если в хендофе они отмечены как settled/rejected.

После этого кратко скажи:
1. где мы остановились;
2. какие изменения уже сделаны;
3. какой следующий шаг;
и затем продолжай работу с указанного next step из хендофа.
```
