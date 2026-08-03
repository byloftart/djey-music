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
6. [x] Add allowlisted owner authentication with no public signup UI.
7. [x] Implement audio-upload validation/progress, metadata draft, publish, update, reorder, unpublish, and confirmed delete with storage cleanup.
8. [x] Test unauthenticated metadata/storage access and owner-only mutations locally.
9. [x] Update README with exact Supabase setup, migration, storage-policy, local-development, and verification steps.

## Completed owner admin interface and functionality

1. [x] At the new-dialog checkpoint, acknowledge the saved state and wait for the user's concrete admin-panel instruction; do not run startup tests or begin implementation.
2. [x] Approve the mobile owner-admin catalog composition and preserve it at `design/prototypes/djey-music-owner-admin-catalog.html` plus the owner-admin design spec.
3. [x] Bootstrap the local owner Auth user and `private.owner_allowlist` mapping.
4. [x] Add the Next.js Auth callback/session proxy and a protected owner route using `requireOwner`.
5. [x] Implement the approved catalog shell and refined sparse Add/Edit Track form.
6. [x] Connect validated audio upload with automatic title/slug, detected `mm:ss` duration, progress, cancellation, and error recovery; remove visible cover/media helper UI.
7. [x] Connect draft, publish, unpublish, reorder, update, and confirmed idempotent delete; remove Preview and force public download off.
8. [x] Verify allowed-owner and rejected-non-owner sessions plus focused media lifecycle behavior locally.

Current implementation point: the local owner Auth/session boundary, protected `/admin` shell, approved catalog composition, refined audio-only Add/Edit workflow, upload lifecycle, publish/unpublish, reorder, and confirmed delete are implemented. Focused QA created, edited, published, and removed only a temporary local track; the pre-existing catalog was preserved. Cloud Supabase and Vercel remain intentionally unconnected.

## Next phase: production player integration

1. [ ] Convert the approved `design/prototypes/djey-music-mobile-player.html` composition into production React/CSS without redesigning its hierarchy or skins.
2. [ ] Query only published tracks through public RLS, ordered by persisted `display_order`, and render real title/genre/duration metadata.
3. [ ] Add a public, track-bound audio delivery boundary that never exposes drafts and supports HTTP range seeking.
4. [ ] Connect real play/pause, previous/next, seek, elapsed/total time, ended-state advance, and recoverable playback errors.
5. [ ] Drive the approved spectrum visualization from real playback through Web Audio while respecting reduced motion and page visibility.
6. [ ] Verify the currently published tracks (`Kisses your back`, `Attention`, and `Equals`) display and play in order; confirm range seeking and metadata behavior.
7. [ ] Run focused mobile verification on the same-Wi-Fi iPhone, then complete the relevant local gate.

Current player checkpoint: `/` still renders an under-construction placeholder. The approved standalone prototype is static and synthesizes demo audio. Public RLS currently returns three published tracks, and signed reads for all three MP3 objects returned `206 Partial Content`; the backend is ready for production player integration.

Exact next step: implement the smallest production vertical slice from published query to a real `<audio>` element inside the approved player shell, then verify one published track displays, plays, pauses, and seeks before connecting next/previous and the spectrum.

Known dependency follow-up: `npm audit --omit=dev` currently reports three high-severity transitive advisories through the latest stable Next.js dependency tree (`postcss` and `sharp`). Do not run the suggested forced downgrade to Next.js 9; upgrade to the first compatible patched Next.js release and re-run the full gate.

## Later phases and hardening

- [ ] Implement the public mobile library and dedicated track URLs after the core player is live.
- [ ] Return to real-iPhone admin long-press reorder/cancel and lifecycle failure/retry hardening after the player vertical slice.
- [ ] Add local favorites, Web Share fallback, queue, Media Session API, PWA/offline states, SEO, sitemap, and Open Graph metadata. Public download remains deferred and disabled.
- [ ] Complete real-device mobile testing on representative iPhone and Android sizes.
- [ ] Design and validate the desktop adaptation.
- [ ] Deploy to Vercel and verify playback/seeking against deployed object storage.

## Explicitly out of scope for v1

- Native iOS, Android, Windows, or macOS applications.
- Listener accounts or public registration.
- Public uploads, social features, comments, follows, messaging, payments, ads, or recommendation feeds.
