# DJey Music Tasks

## Current checkpoint

- [x] Define product scope and scale: up to about 50 tracks and a few listeners.
- [x] Approve the mobile player hierarchy and mobile proportions.
- [x] Approve exact brand name `DJey Music`.
- [x] Supersede the earlier three-skin choice: White Neon is now the player default, Dark Amber is the sole alternate, and Green Receiver is removed.
- [x] Preserve the approved interactive prototype in the repository.
- [x] Defer desktop adaptation and secondary control semantics.

## Completed backend foundation

1. [x] Scaffold the Next.js TypeScript App Router project without replacing the approved prototype.
2. [x] Connect production Supabase project `offfzskzypzkkdikbsap` using the variable names in `.env.example`.
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

Current implementation point: the owner Auth/session boundary, protected `/admin` shell, approved catalog composition, refined audio-only Add/Edit workflow, upload lifecycle, publish/unpublish, reorder, and confirmed delete are deployed. Production owner sign-in and the three-track catalog were verified at `https://djey-music.vercel.app/admin`.

## Next phase: production player integration

1. [x] Convert the approved `design/prototypes/djey-music-mobile-player.html` composition into production React/CSS without redesigning its hierarchy or skins.
2. [x] Query only published tracks through public RLS, ordered by persisted `display_order`, and render real title/genre/duration metadata.
3. [x] Add a public, track-bound audio delivery boundary that never exposes drafts and supports HTTP range seeking.
4. [x] Connect real play/pause, previous/next, seek, elapsed/total time, ended-state advance, and recoverable playback errors.
5. [x] Drive the approved spectrum visualization from real playback through Web Audio while respecting reduced motion and page visibility.
6. [x] Verify the current published catalog displays in persisted order, starts real playback, advances time, and supports range seeking through the deployed track-bound routes.
7. [ ] Run focused mobile verification on the same-Wi-Fi iPhone, then complete the relevant local gate.

Current player checkpoint: `https://djey-music.vercel.app` renders the production React player with the three real published tracks in persisted order. The public route rechecks published status, redirects only that track to a short-lived private Storage URL, and all three production MP3 endpoints return verified `206` byte-range responses. A user-reported dead-controls bug on `127.0.0.1` was traced to missing loopback entries in `allowedDevOrigins`; the fix is covered by `tests/next-config.test.ts`. Owner sign-in and the production catalog are also verified. Audible playback, real seek movement, and live spectrum response still require one normal headed/mobile-browser check before completing item 6.

Exact next step is now the annotated player design round below. Focused real-device audible playback/seek/spectrum verification remains pending and resumes after the approved annotated design is implemented.

## Immediate next design round: 2026-08-04 player annotations

The active Personal project is `DJey Music Public Player — Annotated Candidate` (`91f62f99-ad72-4130-9ac0-ab1cdb5a7f0b`); the final implementation reference is `DJey Music - Glass Playlist & Full Spectrum` (`606bee6e-3e73-481f-8ab0-32c31b5532ef`). The earlier rejected Personal project remains deleted and must not be recreated. The prior `LOFT Art` project is a read-only fallback; do not spend further credits there.

1. [x] Replace the unused top-right Favorite heart with one direct moon/sun day-night control. White Neon is default, Dark Amber is the only alternate, and Green Receiver plus every palette popup/swatch is removed.
2. [x] Make the transport wider and the previous/play/next controls larger, deeper, tactile, centered, and exactly symmetrical with fixed closer gaps.
3. [x] Remove the top-left Queue control. Make the active title marquee the playlist trigger with published tracks, per-track Play/Pause, repeat, and listener-local shuffle.
4. [x] Render 38 columns as stacked rectangular LEDs with a fixed smooth dark-green-to-light-orange horizontal transition driven by smoothed real Web Audio.
5. [x] Keep `LOADING` during track change/buffering and show `PLAYING` after actual playback starts.
6. [x] Render the active title as a masked authored-case marquee with a stationary reduced-motion fallback.
7. [x] Simplify the metadata LCD to the approved four-row format and remove the obsolete artist/source rows.
8. [x] Increase timeline breathing room and show elapsed plus negative remaining time.
9. [x] Expand the metadata LCD into a translucent neomorphic scrollable playlist above the transport; remove the internal X and close by outside tap or Escape.
10. [x] Remove the inactive LED-cell grid and let active spectrum segments use the full useful visualizer height.

Release checkpoint: local typecheck, zero-warning lint, all 32 Node tests, production build, and `git diff --check` pass on `codex/djey-player-redesign`. Commit `e7e49dd` is pushed and draft PR `#1` is open. Vercel deployment `dpl_6MYwGgodR4rjP7YXi9eqwcuNnkQx` is READY on `https://djey-music.vercel.app`. Live verification confirmed White Neon/Dark Amber, the seven-track scrollable playlist and outside dismissal, actual `PLAYING` with advancing time, full-height rhythm-driven spectrum without inactive background cells, guest `/admin` protection, seven successful `206 audio/mpeg` range responses, and `404` for an unknown track.

### Direct spectrum and marquee correction: 2026-08-05

- [x] Remove the forced two-row spectrum minimum so silence and paused playback draw no static LEDs.
- [x] Replace the over-amplified response with a calibrated noise floor, three-bin sampling, wider analyser range, lower glow, and faster smoothing so ordinary music does not stay at the ceiling while real peaks can still use the full display height.
- [x] Restore the active authored-case title marquee without changing its title-triggered playlist behavior; preserve the stationary reduced-motion fallback.
- [x] Run the focused regression tests and the complete local typecheck, zero-warning lint, 33-test suite, production build, and `git diff --check` gate.
- [ ] After explicit authorization, deploy this correction and verify its real-audio rhythm response in the production player. The currently deployed release remains `dpl_6MYwGgodR4rjP7YXi9eqwcuNnkQx` until then.

Known dependency follow-up: `npm audit --omit=dev` currently reports three high-severity transitive advisories through the latest stable Next.js dependency tree (`postcss` and `sharp`). Do not run the suggested forced downgrade to Next.js 9; upgrade to the first compatible patched Next.js release and re-run the full gate.

## Later phases and hardening

- [ ] Implement the public mobile library and dedicated track URLs after the core player is live.
- [ ] Return to real-iPhone admin long-press reorder/cancel and lifecycle failure/retry hardening after the player vertical slice.
- [ ] Add Web Share fallback, Media Session API, PWA/offline states, SEO, sitemap, and Open Graph metadata. Public download remains deferred and disabled; favorites and recommendations remain out of scope.
- [ ] Complete real-device mobile testing on representative iPhone and Android sizes.
- [ ] Design and validate the desktop adaptation.
- [x] Deploy to Vercel and verify published metadata plus byte-range seeking against deployed private object storage.

## Explicitly out of scope for v1

- Native iOS, Android, Windows, or macOS applications.
- Listener accounts or public registration.
- Public uploads, social features, comments, follows, messaging, payments, ads, or recommendation feeds.
