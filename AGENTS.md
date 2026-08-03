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
- Owner-admin UI is English-only. White Neon is its default theme; Dark Amber is its only alternate. Green Receiver remains part of the separate player contract and is not used in the admin.
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
