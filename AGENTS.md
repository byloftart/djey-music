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
