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

1. [ ] At the new-dialog checkpoint, acknowledge the saved state and wait for the user's concrete admin-panel instruction; do not run startup tests or begin implementation.
2. [ ] Present a concrete admin composition using the settled DJey Music neomorphic design system and wait for explicit visual approval.
3. [ ] Bootstrap the local owner Auth user and `private.owner_allowlist` mapping.
4. [ ] Add the Next.js Auth callback/session proxy and a protected owner route using `requireOwner`.
5. [ ] Implement the approved catalog shell and add/edit track form.
6. [ ] Connect validated audio/cover upload with progress, cancellation, and error recovery.
7. [ ] Connect draft, preview, publish, unpublish, reorder, update, and confirmed idempotent delete.
8. [ ] Verify allowed-owner and rejected-non-owner sessions plus focused media lifecycle behavior.

Current waiting point: backend foundation is complete and the admin visual relationship is settled, but no admin UI or owner Auth flow has been implemented. The next dialog must stop after acknowledging this checkpoint and wait for the user's instruction.

Known dependency follow-up: `npm audit --omit=dev` currently reports three high-severity transitive advisories through the latest stable Next.js dependency tree (`postcss` and `sharp`). Do not run the suggested forced downgrade to Next.js 9; upgrade to the first compatible patched Next.js release and re-run the full gate.

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
