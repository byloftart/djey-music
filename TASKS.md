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

