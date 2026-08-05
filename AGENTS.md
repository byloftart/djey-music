# DJey Music Agent Instructions

## Low-overhead next-dialog entry

At the saved annotated-player release checkpoint, first run `git status --short --branch`, then read the latest file in `docs/handoffs/`, `DESIGN.md`, and `TASKS.md`. Briefly acknowledge the exact checkpoint and continue only the latest handoff's focused verification or direct user correction. Do not spend further credits in `LOFT Art`. Do not start installs, broad test suites, Supabase reset, browser sweeps, audits, deployment inspection, or unrelated design exploration merely to enter the dialog.

Before player follow-up work, read `README.md`, the canonical player prototype, and only the current public-player component/CSS files needed for the correction. Do not reread historical handoffs unless the latest handoff explicitly points to one. Do not restart player or catalog exploration; the annotated two-theme player is now the baseline. Do not change the owner-admin flow or deploy again without direct authorization.

## Current stage

The mobile player and owner-admin catalog/Add/Edit baseline designs are approved. The owner flow and public player are deployed at `https://djey-music.vercel.app`; management is at `/admin`. Production Supabase project `offfzskzypzkkdikbsap` contains the versioned schema, private media buckets, one allowlisted owner, and the three published tracks. Live anonymous metadata, protected owner sign-in/catalog access, and `206 Partial Content` delivery for all three MP3 files are verified. The active annotated-player project is `DJey Music Public Player — Annotated Candidate` (`91f62f99-ad72-4130-9ac0-ab1cdb5a7f0b`) in workspace `Personal`; the final implementation reference is `DJey Music - Glass Playlist & Full Spectrum` (`606bee6e-3e73-481f-8ab0-32c31b5532ef`). The React/CSS release candidate is implemented on `codex/djey-player-redesign` and preserves the owner UI. Do not recreate the earlier rejected/deleted Personal direction or scaffold unrelated features.

Repository: `https://github.com/byloftart/djey-music.git`; default working branch: `main`.

## Binding decisions

- Exact product/brand name: `DJey Music`.
- Canonical mobile reference: `design/prototypes/djey-music-mobile-player.html`.
- Mobile-first; desktop adaptation is deferred.
- White Neon is the default public-player theme and Dark Amber is its sole alternate through one direct day/night control. Green Receiver is removed completely from the redesign.
- The top plaque has no playlist/Queue button. The active title marquee is the playlist trigger and expands the metadata LCD into a large translucent scrollable display above the transport.
- Public listening never requires authentication.
- The production player reads only published tracks in persisted `display_order`; drafts must never enter public UI or audio delivery.
- Replace the prototype's synthesized demo with real audio while preserving its approved geometry, two-theme token system, and responsive behavior.
- Only the allowlisted owner may upload or manage tracks.
- Keep the first release a PWA. Do not add native apps.
- No public uploads, comments, follows, messaging, payments, ads, or recommendation feed.
- Keep unpublished metadata and media private.
- The owner admin uses the same light-neomorphic DJey Music material system with task-appropriate layouts rather than copied player geometry.
- Owner-admin UI is English-only. White Neon is its default theme; Dark Amber is its only alternate. The public player remains a separate UI contract but now uses the same two-theme relationship.
- Canonical owner-admin catalog reference: `design/prototypes/djey-music-owner-admin-catalog.html` and `docs/superpowers/specs/2026-08-03-djey-music-owner-admin-design.md`.
- The owner admin remains a centered mobile composition on wide browsers. Desktop adaptation is deferred.
- Do not implement a generic SaaS dashboard. The catalog composition is approved; the full-screen Add/Edit surface must follow the approved contract and direct user corrections.

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
- Keep `TASKS.md`, README setup instructions, migrations, and the latest handoff current at meaningful checkpoints.
