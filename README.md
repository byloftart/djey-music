# DJey Music

DJey Music is a mobile-first public music portfolio for original tracks created by the owner and a collaborator. Listeners will be able to browse and play published music without registration. A separate protected owner area will handle uploads and catalog management.

GitHub repository: https://github.com/byloftart/djey-music (private at the current checkpoint).

## Current status

The mobile player design was approved on 2026-08-03. The repository currently contains the approved interactive prototype and durable product/architecture documentation. The Next.js application, Supabase backend, and deployment have not been implemented yet.

Approved prototype: [`design/prototypes/djey-music-mobile-player.html`](design/prototypes/djey-music-mobile-player.html)

To preview it locally:

```bash
python3 -m http.server 4173 --directory design/prototypes
```

Then open `http://localhost:4173/djey-music-mobile-player.html` and use a mobile viewport. The demo music is synthesized locally in the browser and contains no third-party audio.

## Settled product direction

- Public listening requires no account, registration, or personal data.
- The catalog is intentionally small: no more than about 50 tracks and only a few regular listeners.
- The first release is a responsive installable PWA, not separate native applications.
- Mobile is the primary experience. Desktop adaptation is deferred until the mobile product is implemented.
- The full player does not use album artwork as its dominant element. The upper module is a live spectrum visualizer; the lower illuminated display presents track metadata.
- Exact brand name: **DJey Music**.
- Default skin: **Green Receiver**. Optional skins: **White Neon** and **Dark Amber**.
- Skin choice is device-local and does not require backend persistence.
- Cover artwork remains useful in the catalog, share previews, and track-detail metadata.

See [`DESIGN.md`](DESIGN.md) for the canonical visual contract and rejected alternatives.

## Recommended architecture

- Next.js with TypeScript and App Router.
- Supabase Postgres for track metadata.
- Supabase Storage for audio and cover files.
- Supabase Auth for one allowlisted owner; no public registration.
- Vercel for frontend and server-route deployment.
- PWA manifest and service worker for installability and useful offline states.

This is appropriate for the small catalog because it keeps the application, database, storage, authentication, and deployment workflow simple. Netlify is a viable frontend alternative, but offers no material advantage for the selected Next.js-first architecture. If audio bandwidth later grows substantially, move public audio delivery to an S3-compatible object store/CDN while retaining Supabase for metadata and owner authentication.

## Backend phase

The next phase starts with the Supabase foundation described in [`docs/backend-foundation.md`](docs/backend-foundation.md): schema, migrations, buckets, Row Level Security, owner allowlist authentication, and the upload lifecycle. Do not restart visual design or scaffold unrelated social features.

Environment variable names are documented in [`.env.example`](.env.example). Real values must stay in local/Vercel environment configuration and must never be committed.

## Project continuity

Before changing the project, read in this order:

1. [`AGENTS.md`](AGENTS.md)
2. [`DESIGN.md`](DESIGN.md)
3. [`TASKS.md`](TASKS.md)
4. [`docs/architecture.md`](docs/architecture.md)
5. [`docs/backend-foundation.md`](docs/backend-foundation.md)
6. The latest file under [`docs/handoffs/`](docs/handoffs/)

## Current verification

The standalone prototype can be checked without installing project dependencies:

```bash
perl -0777 -ne 'if (/<script>(.*?)<\/script>/s) { print $1 }' design/prototypes/djey-music-mobile-player.html | node --check
git diff --check
```

No production deployment or Supabase security verification has been completed yet.
