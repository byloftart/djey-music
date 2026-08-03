# Context Handoff

- Created: 2026-08-03 08:23 +04
- Project root: `/Users/iram/Documents/DJey Audio`

## Current Dialog Notes

# Current-dialog notes for context handoff

## Checkpoint identity

- Project root: `/Users/iram/Documents/DJey Audio`.
- GitHub: `https://github.com/byloftart/djey-music` (PRIVATE).
- Git remote uses HTTPS because the first SSH push failed with `Permission denied (publickey)`; `gh auth setup-git` and the HTTPS remote fixed it.
- Branch: `main`, tracking `origin/main`.
- Published functional checkpoint before handoff: `b3d24b466ad59a557cef0e7f58f05b0b314ae07a` (`Save approved mobile player design`).

## Settled product and visual decisions

- Exact brand name is `DJey Music`.
- Mobile player is approved. Canonical artifact: `design/prototypes/djey-music-mobile-player.html`.
- Mobile is primary; desktop adaptation is explicitly deferred.
- Full player hierarchy: DJey Music plaque, large live spectrum in place of dominant artwork, evenly distributed frequency values, illuminated metadata display, seek/time, tactile transport controls.
- Default skin: Green Receiver. Optional local-only skins: White Neon and Dark Amber.
- Current three color swatches are centered inside the control block; their final production placement can be revisited later.
- Secondary button meanings/iconography are deferred.
- Album art belongs in library cards, track pages, and share metadata, not as the full player's dominant module.
- Rejected UI choices are recorded in `DESIGN.md`; do not reintroduce them.

## Cleanup and saved state

- The approved prototype was copied out of the temporary visual session and its SHA-256 matched the approved source before cleanup.
- Nine superseded prototype HTML files and visual-session key/state files were removed from the workspace by moving `.superpowers` to `/Users/iram/.Trash/DJey-Audio-superpowers-approved-cleanup`. This is recoverable from Trash but must not be restored into the repository.
- Temporary localhost/LAN preview servers were stopped. There is no live production URL.

## Verification performed

- Prototype served successfully through `python3 -m http.server 4173 --directory design/prototypes` and returned HTTP 200.
- Extracted inline JavaScript passed `node --check`.
- Checks confirmed exact `DJey Music` branding, White/Green/Amber theme controls, and absence of `SPECTRUM / LIVE`, `NEO CONSOLE · MODEL 01`, and visible `SKIN` labels.
- `git diff --check` passed before the checkpoint commit.
- GitHub `main` and local checkpoint matched at commit `b3d24b4` before generating this handoff.

## Backend/deployment state

- No Next.js app has been scaffolded yet; there is no `package.json` and no installed dependency tree.
- No Supabase project, schema, migrations, buckets, RLS policies, Auth configuration, or owner allowlist has been created or linked.
- No Vercel project or production deployment exists.
- Required variable names are documented in `.env.example`; no real secret values are stored.

## Exact next step

Read `docs/backend-foundation.md`, then scaffold the Next.js TypeScript App Router project and create the first local Supabase migration/policy foundation for the `tracks` table, audio/cover storage boundaries, published-only anonymous reads, and allowlisted owner writes. Preserve the approved prototype and do not restart visual design. Do not create billable resources or deploy without a separate explicit authorization.

## Git State

### Branch

```
main
```

### Status

```
## main...origin/main
```

### Recent Commits

```
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

## Read first

Before editing, read `README.md`, `DESIGN.md`, `TASKS.md`, `docs/`, the latest file in `docs/handoffs/`, and `git status --short --branch`.

## Current stage

The mobile player design is approved. The next stage is backend foundation and owner upload management. Do not restart visual exploration, redesign the player, or scaffold unrelated features.

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
- Keep `TASKS.md`, README setup instructions, migrations, and the latest handoff current at meaning

...(truncated)
```

### `README.md`

```md
# DJey Music

DJey Music is a mobile-first public music portfolio for original tracks created by the owner and a collaborator. Listeners will be able to browse and play published music without registration. A separate protected owner area will handle uploads and catalog management.

GitHub repository: https://github.com/byloftart/djey-music (private at the current checkpoint).

## Current status

The mobile player design was approved on 2026-08-03. The repository currently contains the approved interactive prototype and durable product/architecture documentation. The Next.js application, Supabase backend, and deployment have not been implemented yet.

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

- Next.js with TypeScript and App Router.
- Supabase Postgres for track metadata.
- Supabase Storage for audio and cover files.
- Supabase Auth for one allowlisted ow

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

1. [ ] Scaffold the Next.js TypeScript App Router project without replacing the approved prototype.
2. [ ] Connect a Supabase project using the variable names in `.env.example`.
3. [ ] Create versioned SQL migrations for `tracks` and required indexes.
4. [ ] Configure private audio and cover buckets plus public/published delivery strategy.
5. [ ] Add Row Level Security: public reads only published tracks; owner-only writes.
6. [ ] Add allowlisted owner authentication with no public signup UI.
7. [ ] Implement upload validation, progress, metadata draft, preview, publish, update, reorder, unpublish, and confirmed delete with storage cleanup.
8. [ ] Test unauthenticated metadata/storage access and owner-only mutations.
9. [ ] Update README with exact Supabase setup, migration, storage-policy, local-development, and verification steps.

## Later phases

- [ ] Implement the public mobile library and dedicated track URLs.
- [ ] Convert the approved player prototype into production components and Web Audio visualization.
- [ ] Add local favorites, Web Share fallback, optional download, queue, Media Session API, PWA/offline states, SEO, sitemap, and Open Graph metadata.
- [ ] Complete real-device mobile testing on representative iPhone and Android sizes.
- [ ] Design and validate the desktop adaptation.
- [ ] Deploy to Vercel and verify playback/seeking against deployed object storage.

## Explicitly out of scope for v1

- Native iOS, Android, Windows, or macOS applications.
- Listener accounts or public registration.
- Public uploads, social features, comments, follows, messaging, payments, ads, or recommendation feeds.
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
- `created_at` and `updated_at`: timestamps.

Add indexes for unique slug lookup, status/published ordering, display order, and any chosen tag-search strategy. Public reads must be constrained to published rows by policy, not merely by frontend filters.

## Storage

Use separate audio and cover buckets or equally clear path/policy boundaries. Draft/unpublished objects must not have anonymous public access. Published delivery must support HTTP range requests so deployed seeking works. Store paths in the database and generate delivery URLs at the appropriate boundary.

Accepted initial audio formats:

- MP3.
- M4A/AAC when browser-compatible MIME validation succeeds.
- WAV with a clear size warning.

Define maximum byte sizes through environment/configuration rather than hard-coding them throughout the UI.

## Owner authorization

- No public signup UI.
- Authenticate only the owner using a simple Supabase flow.
- Compare the authenticated email against `OWNER_EMAIL_ALLOWLIST` at the appropriate trusted boundary.
- RLS/storage policies remain the final enforcement layer.
- Never place `SUPABASE_SERVICE_ROLE_KEY` in client-side code or any `NEXT_PUBLIC_*` variable.

## Upload lifecycle

1. Select audio and validate type/size.
2. Read duration and essential metadata client-side for feedback; revalidate trusted fields at the server/storage boundary.
3. Upload audio and optional co

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
- /Users/iram/Documents/DJey Audio/docs/handoffs/2026-08-03-0823-context-handoff.md
- git status --short --branch

Не начинай проект заново и не пересматривай уже принятые решения, если в хендофе они отмечены как settled/rejected.

После этого кратко скажи:
1. где мы остановились;
2. какие изменения уже сделаны;
3. какой следующий шаг;
и затем продолжай работу с указанного next step из хендофа.
```
