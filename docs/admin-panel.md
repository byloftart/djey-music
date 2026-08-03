# DJey Music Owner Admin Contract

Status: owner-admin catalog design approved on 2026-08-03 and implemented locally in production React/CSS with the protected owner lifecycle. Cloud connection and deployment remain separate future steps.

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

## Implemented local owner workflow

The protected owner area now provides:

1. Owner-only sign-in with no public signup.
2. A compact media catalog showing title, draft/published status, manual order, and one Edit action without cover artwork.
3. A sparse Add/Edit surface with one audio upload control and visible Title, Genre, Tags, read-only `mm:ss` Duration, and two-line Description fields.
4. Audio validation before upload, including the configured byte limit, accepted type, normalized path, progress, cancellation, and visible error recovery. Format and size helper copy stays hidden at rest.
5. Automatic title/slug derivation, draft save, explicit publish/unpublish, reorder, and metadata update. Public download remains disabled.
6. Permanent delete only after explicit confirmation, with idempotent database and storage cleanup.
7. Clear empty, loading, uploading, success, validation-error, and partial-failure states.

## Approved catalog behavior

- Header: centered `DJey Music / Admin Panel`, left account control revealing `Sign Out`, and one White Neon/Dark Amber switch on the right.
- Equal illuminated readouts: `48 TRACKS TOTAL` and the `All Tracks / Published / Drafts` filter.
- Compact catalog cards show no cover, no numeric order, no text status badge, and no overflow menu.
- Green status indicator means Published; red means Draft. It sits in a narrow left column centered between the title and genre lines.
- Each card has one `Edit` action. Publish/Unpublish and Delete belong in the full-screen editor; Preview is intentionally absent from the approved editor.
- Long-press reorder must preserve native scrolling, suppress iOS text selection, show a lifted card and insertion placeholder, persist `display_order`, and confirm `Order updated`.
- The full-width `Add Track` dock remains above iOS browser controls through dynamic viewport sizing, normal flex flow, and safe-area padding.

## Existing backend boundary

- `public.tracks`, private buckets, RLS, and allowlisted owner policies already exist locally through the first migration.
- `requireOwner` already performs the trusted server-side email allowlist check.
- Local public self-registration is disabled while the email/password provider remains available to the pre-created owner.
- The local owner Auth user and `private.owner_allowlist` mapping exist; continuity credentials remain only in ignored `.env.local` variables.
- The Auth callback, session proxy, protected owner layout, and trusted mutation routes are implemented. Each sensitive route repeats the owner boundary before issuing upload tickets, returning preview URLs, or changing catalog data.
- Cloud Supabase is not linked.

## Media limits and portability

- The initial catalog target remains about 50 tracks.
- Supabase Free currently permits up to 1 GB of file storage and 50 MB per uploaded file; application limits stay configurable through `MAX_AUDIO_UPLOAD_BYTES` and `MAX_COVER_UPLOAD_BYTES`.
- Prefer web-ready MP3/AAC for the first release; large/high-resolution WAV masters may exceed the Free per-file limit.
- The Next.js public app and owner admin remain portable to an AWS Node.js/Docker server. Runtime database, Auth records, Storage objects, and secrets are not stored in GitHub and require separate migration or backup.

## Completed implementation sequence

The approved catalog was implemented without restarting design exploration:

1. Read the latest handoff, this contract, and the approved owner-admin design spec.
2. Inspect the existing auth/Supabase helpers and minimal App Router files.
3. Owner authentication, callback/session protection, and the approved mobile admin shell were implemented without weakening RLS or changing either canonical prototype.
4. The full-screen Add/Edit workflow handles validated signed audio upload, filename-derived title/slug, detected `mm:ss` duration, progress/cancel, draft save, publish/unpublish, persisted reorder, update, and confirmed idempotent delete. Cover and public-download controls are not part of the approved surface.
5. Focused Node tests, the 24 pgTAP policy suite, lint, type-check, production build, database lint/advisors, and a 430x932 browser lifecycle pass form the local verification checkpoint.
6. The next exact step is real-iPhone long-press reorder/cancel confirmation and focused failure/retry hardening. Deployment and cloud-resource creation remain separate explicit operations.

## Low-overhead next-dialog entry

- First run `git status --short --branch`.
- Read the latest handoff, this file, and `docs/superpowers/specs/2026-08-03-djey-music-owner-admin-design.md`.
- Briefly acknowledge the completed local owner-flow checkpoint and begin with the exact next hardening step recorded in the handoff.
- Do not run installs, servers, builds, broad test suites, Supabase reset, browser sweeps, visual audits, or deployment checks merely to enter the dialog.
