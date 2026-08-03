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
- Keep `TASKS.md`, README setup instructions, migrations, and the latest handoff current at meaningful checkpoints.
