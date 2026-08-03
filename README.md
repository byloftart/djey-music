# DJey Music

DJey Music is a mobile-first public music portfolio for original tracks created by the owner and a collaborator. Listeners will be able to browse and play published music without registration. A separate protected owner area will handle uploads and catalog management.

GitHub repository: https://github.com/byloftart/djey-music (private at the current checkpoint).

## Current status

The mobile player design was approved on 2026-08-03. A minimal Next.js 16 TypeScript/App Router application and the first local Supabase backend foundation now exist. The foundation includes a versioned `tracks` migration, private audio/cover buckets, RLS for published-only public reads, an owner allowlist boundary, and pgTAP policy tests. No cloud Supabase project is linked and no Vercel deployment exists.

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

The local Supabase foundation described in [`docs/backend-foundation.md`](docs/backend-foundation.md) is implemented. The next project phase is the protected owner admin described in [`docs/admin-panel.md`](docs/admin-panel.md): first approve its concrete composition, then create/invite the owner, add the session boundary, and implement the validated media lifecycle. The admin uses the same DJey Music light-neomorphic visual system and three palette tokens as the player without copying the player geometry.

Environment variable names are documented in [`.env.example`](.env.example). Real values must stay in local/Vercel environment configuration and must never be committed.

## Local development

Requirements:

- Node.js 22 or newer.
- npm 11 or newer.
- A running Docker-compatible runtime. This workstation can use Colima with `colima start`.

Install pinned dependencies and start the application:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with local or cloud values. Keep the existing variable names:

- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000` for local development.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase API URL from `supabase status` or the project Connect dialog.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the local anon key or cloud publishable/legacy anon key; it is intentionally a browser-safe key and remains protected by RLS.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key for future trusted lifecycle operations. Never prefix it with `NEXT_PUBLIC_` or import it into a Client Component.
- `OWNER_EMAIL_ALLOWLIST`: comma-separated normalized owner email addresses, evaluated only at the trusted server boundary.
- `MAX_AUDIO_UPLOAD_BYTES` and `MAX_COVER_UPLOAD_BYTES`: trusted upload limits. Configure matching or stricter bucket/project limits in Supabase.

The scaffold exposes a local health endpoint at `http://localhost:3000/api/health`.

## Local Supabase

Start the local stack and apply all migrations from a clean database:

```bash
colima start
npm run supabase:start
npm run supabase:reset
```

Open Supabase Studio at `http://127.0.0.1:54323`. The local API is `http://127.0.0.1:54321`. Obtain local keys without storing them in tracked files:

```bash
npx supabase status
```

Public signup is disabled in [`supabase/config.toml`](supabase/config.toml). To bootstrap the owner locally:

1. Open Supabase Studio.
2. Click **Authentication** in the left sidebar, open **Users**, and create or invite the owner through the admin controls.
3. Open **SQL Editor**, replace the example email below with the same normalized email stored in `OWNER_EMAIL_ALLOWLIST`, and run:

```sql
insert into private.owner_allowlist (user_id, email)
select id, lower(email)
from auth.users
where lower(email) = lower('owner@example.com')
on conflict (user_id) do update
set email = excluded.email;
```

The allowlist maps a stable Auth user UUID to the approved email. Browser code cannot read or change this table. Changing `OWNER_EMAIL_ALLOWLIST` alone does not grant database access; the trusted mapping is also required.

The migration creates two private buckets:

- `track-audio` with paths shaped like `tracks/<track-uuid>/audio/<normalized-file>`.
- `track-covers` with paths shaped like `tracks/<track-uuid>/cover/<normalized-file>`.

Anonymous and ordinary authenticated requests can select only objects referenced by published `tracks` rows. The allowlisted owner can read and mutate draft objects. The buckets intentionally inherit the Supabase project file-size ceiling; future upload endpoints must enforce `MAX_AUDIO_UPLOAD_BYTES` and `MAX_COVER_UPLOAD_BYTES` at the trusted boundary as well.

The planned production delivery boundary is a server route that first resolves a `published` track through RLS, then creates a short-lived signed URL for that exact private object using the server-only key. This preserves draft privacy while giving the media element a normal URL that can be tested for HTTP range seeking. That route is not implemented in this foundation checkpoint; do not expose a direct public bucket or return signed draft URLs as a shortcut.

## Verification

Run the full current local gate:

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run supabase:reset
npm run supabase:test
npx supabase db lint --local --schema public,private --level warning --fail-on error
npx supabase db advisors --local --type security --level info --fail-on warn
npx supabase db advisors --local --type performance --level warn --fail-on error
npx supabase migration list --local
git diff --check
```

`supabase:reset` destroys only the local Supabase database and rebuilds it from migrations and `supabase/seed.sql`. For a linked cloud project, do not rewrite an applied migration: create a new corrective migration, review a backup/rollback plan, and run `supabase db push` only after explicit authorization.

The first migration and 24 pgTAP checks pass locally. Deployed range-request seeking remains unverified until a real storage project and deployment are explicitly authorized.

## Project continuity

Before changing the project, read in this order:

1. [`AGENTS.md`](AGENTS.md)
2. [`DESIGN.md`](DESIGN.md)
3. [`TASKS.md`](TASKS.md)
4. [`docs/architecture.md`](docs/architecture.md)
5. [`docs/backend-foundation.md`](docs/backend-foundation.md)
6. [`docs/admin-panel.md`](docs/admin-panel.md)
7. The latest file under [`docs/handoffs/`](docs/handoffs/)
8. [`NEXT_DIALOG_PROMPT.md`](NEXT_DIALOG_PROMPT.md) when starting the owner-admin dialog

## Prototype verification

The standalone approved prototype can still be checked without installing project dependencies:

```bash
perl -0777 -ne 'if (/<script>(.*?)<\/script>/s) { print $1 }' design/prototypes/djey-music-mobile-player.html | node --check
git diff --check
```

The prototype remains a preserved design artifact; the production player conversion is a later phase.
