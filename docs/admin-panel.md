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

## Existing backend boundary

- `public.tracks`, private buckets, RLS, and allowlisted owner policies already exist locally through the first migration.
- `requireOwner` already performs the trusted server-side email allowlist check.
- Local public signup is disabled.
- Cloud Supabase is not linked and no owner user has been created.
- The next functional implementation will need the Auth callback/session proxy and a protected owner route before upload actions are connected.

## Media limits and portability

- The initial catalog target remains about 50 tracks.
- Supabase Free currently permits up to 1 GB of file storage and 50 MB per uploaded file; application limits stay configurable through `MAX_AUDIO_UPLOAD_BYTES` and `MAX_COVER_UPLOAD_BYTES`.
- Prefer web-ready MP3/AAC for the first release; large/high-resolution WAV masters may exceed the Free per-file limit.
- The Next.js public app and owner admin remain portable to an AWS Node.js/Docker server. Runtime database, Auth records, Storage objects, and secrets are not stored in GitHub and require separate migration or backup.

## Approval and implementation sequence

After the user gives a concrete instruction in the next dialog:

1. Read `DESIGN.md`, this contract, and the latest explicit user correction.
2. Inspect only the relevant current owner/backend files.
3. Present one concrete admin composition or a small number of meaningful alternatives.
4. Wait for explicit approval before implementing the visible admin interface.
5. Implement owner authentication and the approved admin shell without weakening RLS or changing the player prototype.
6. Add focused verification for the functionality changed in that step; broad project gates belong at a meaningful completion checkpoint, not at dialog startup.

## Low-overhead next-dialog entry

The next dialog is a waiting checkpoint, not authorization to begin work immediately.

- First run only `git status --short --branch`.
- Read the latest handoff and this file.
- Briefly acknowledge the exact saved state, the settled admin visual relationship, and the pending admin work.
- Then stop and wait for the user's concrete instruction.
- Do not run installs, servers, builds, test suites, Supabase reset, browser sweeps, visual audits, deployment checks, or implementation at startup.
