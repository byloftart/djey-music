# DJey Music

DJey Music is a mobile-first public music portfolio for original tracks created by the owner and a collaborator. Listeners will be able to browse and play published music without registration. A separate protected owner area will handle uploads and catalog management.

GitHub repository: https://github.com/byloftart/djey-music (private at the current checkpoint).

## Current status

The mobile player, owner-admin catalog, and refined Add/Edit Track surfaces were approved on 2026-08-03. The Next.js 16 production application includes the complete owner flow plus the public player at `/`. The annotated player release keeps a mobile-only centered shell even on desktop, uses White Neon/Dark Amber, opens the published playlist by tapping the authored-case title marquee, and renders a clean full-height segmented spectrum without an inactive-cell background. The player queries only published tracks in persisted order, uses track-bound signed audio routes, and mixes two preloaded audio channels through the shared analyser for exact three-second equal-power crossfades. The owner catalog adds one protected Play/Pause preview action per row for Published and Draft media without changing Add/Edit. Production metadata, protected owner access, real continuous playback, and `206 Partial Content` delivery for the seven published MP3 files are verified.

Production URLs:

- Public player: `https://djey-music.vercel.app`
- Owner management: `https://djey-music.vercel.app/admin`

Owner-preview and continuous-playback release `dpl_DyjMcKbdTxF38RPkjvNCyqsnJk43` is READY. Live verification confirmed the centered mobile shell, two hidden public audio channels, real `PLAYING` progression, manual three-second overlap, natural automatic advance, owner Play/Pause and one-at-a-time preview switching, guest admin protection, and `206 audio/mpeg` range delivery. The current production catalog contains seven Published tracks and no Draft track; live Draft-row preview remains the only feature-specific verification deferred until a draft exists.

Approved prototype: [`design/prototypes/djey-music-mobile-player.html`](design/prototypes/djey-music-mobile-player.html)

Approved owner-admin catalog prototype: [`design/prototypes/djey-music-owner-admin-catalog.html`](design/prototypes/djey-music-owner-admin-catalog.html)

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
- The approved redesign target uses **White Neon** by default and **Dark Amber** as the sole alternate. Green Receiver is removed from the public player.
- A direct day/night control switches the two themes; the choice is device-local and does not require backend persistence.
- Cover artwork is not part of the approved owner-admin catalog or Add/Edit workflow; future share/metadata artwork requires a separate decision.

See [`DESIGN.md`](DESIGN.md) for the canonical visual contract and rejected alternatives.

## Recommended architecture

- Next.js with TypeScript and App Router.
- Supabase Postgres for track metadata.
- Supabase Storage for private audio files; the existing private cover bucket remains dormant foundation compatibility and has no approved owner UI.
- Supabase Auth for one allowlisted owner; no public registration.
- Vercel for frontend and server-route deployment.
- PWA manifest and service worker for installability and useful offline states.

This is appropriate for the small catalog because it keeps the application, database, storage, authentication, and deployment workflow simple. Netlify is a viable frontend alternative, but offers no material advantage for the selected Next.js-first architecture. If audio bandwidth later grows substantially, move public audio delivery to an S3-compatible object store/CDN while retaining Supabase for metadata and owner authentication.

## Owner admin and backend

The local Supabase foundation described in [`docs/backend-foundation.md`](docs/backend-foundation.md) is implemented. The protected production owner admin follows [`docs/admin-panel.md`](docs/admin-panel.md) and [`docs/superpowers/specs/2026-08-03-djey-music-owner-admin-design.md`](docs/superpowers/specs/2026-08-03-djey-music-owner-admin-design.md); both canonical prototypes remain unchanged.

The owner admin is English-only, uses White Neon by default with Dark Amber as the sole alternate, and stays a centered mobile composition on wide browsers. The public-player redesign now uses the same two-theme relationship while retaining its separate player geometry and behavior.

Local routes:

- `/admin/sign-in`: owner-only login/password sign-in with no signup UI. The internal Supabase Auth email is resolved only on the server.
- `/admin`: protected catalog with All Tracks, Published, and Drafts filters.
- `/admin/tracks/new`: sparse audio-only Add Track workflow with Save Draft and Publish.
- `/admin/tracks/<track-id>/edit`: the same compact metadata surface with Save Changes, Publish/Unpublish, and confirmed Delete.

The root `proxy.ts` refreshes the Supabase session for `/admin` and `/auth`, while the protected owner layout performs a fresh server-side user and allowlist check. Trusted `/api/admin/*` handlers repeat that authorization boundary before mutations.

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
- `OWNER_LOGIN`: server-only short login accepted by the admin sign-in route.
- `OWNER_LOGIN_EMAIL`: server-only Supabase Auth email mapped to that login. It must also be allowlisted and mapped in `private.owner_allowlist`.
- `MAX_AUDIO_UPLOAD_BYTES`: trusted audio-upload limit. `MAX_COVER_UPLOAD_BYTES` remains only for the dormant compatibility boundary; the approved owner UI does not upload covers.

The scaffold exposes a local health endpoint at `http://localhost:3000/api/health`.

### iPhone access on the same Wi-Fi

Bind Next.js to all interfaces and set the browser-facing app/Supabase URLs in ignored `.env.local` to the Mac's current LAN address:

```bash
ipconfig getifaddr en0
npm run dev -- --hostname 0.0.0.0
```

For the current workstation lease, the owner admin is available at `http://192.168.1.2:3000/admin` and local Supabase at `http://192.168.1.2:54321`. The iPhone must be connected to the same Wi-Fi. `next.config.ts` allows `localhost`, `127.0.0.1`, and the host derived from `NEXT_PUBLIC_APP_URL` so both Mac-local and same-Wi-Fi browsers can hydrate development scripts. If DHCP changes the Mac address, update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`, restart Next.js, and use the new address. Do not commit the machine-specific `.env.local` values.

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

Public self-registration remains disabled by the global Auth setting in [`supabase/config.toml`](supabase/config.toml). The email/password provider itself stays enabled so an owner created through trusted admin controls can sign in. To bootstrap the owner locally:

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

At the saved local checkpoint, the owner continuity values are recorded only in ignored `.env.local` as `LOCAL_OWNER_EMAIL`, `LOCAL_OWNER_LOGIN`, and `LOCAL_OWNER_PASSWORD`. These continuity values must never be committed. The browser submits the short login to `/auth/sign-in`; the trusted route maps it to `OWNER_LOGIN_EMAIL` before calling Supabase Auth. The local owner is already mapped in `private.owner_allowlist`.

The migration creates two private buckets:

- `track-audio` with paths shaped like `tracks/<track-uuid>/audio/<normalized-file>`.
- `track-covers` with paths shaped like `tracks/<track-uuid>/cover/<normalized-file>`.

`track-covers` is retained as dormant backend compatibility. The approved catalog and Add/Edit Track UI do not expose cover artwork or cover operations.

Anonymous and ordinary authenticated requests can select only objects referenced by published `tracks` rows. The allowlisted owner can read and mutate draft objects. The buckets intentionally inherit the Supabase project file-size ceiling; future upload endpoints must enforce `MAX_AUDIO_UPLOAD_BYTES` and `MAX_COVER_UPLOAD_BYTES` at the trusted boundary as well.

A protected preview route serves the compact Play/Pause action in owner catalog rows while the approved Add/Edit surface intentionally has no Preview button. The route calls the owner boundary before selecting either Published or Draft metadata and returns a private no-store redirect to a short-lived signed object. Public audio resolves separately through `/api/tracks/<track-id>/audio`: that route repeats the `status = published` constraint before returning a one-hour signed redirect for the exact object. The bucket remains private, drafts do not receive public signed URLs, and byte-range seeking is preserved.

### Verified public-player backend checkpoint

Production Supabase project `offfzskzypzkkdikbsap` contains the published tracks `Kisses your back`, `Attention`, and `Equals` in persisted order. On 2026-08-04 the live `/` rendered all three titles, owner authentication returned the protected three-track catalog, and every track-bound audio route returned `307` to private Storage followed by `206 Partial Content`, `audio/mpeg`, and the requested byte range. A prior Chrome DevTools smoke exposed and fixed a development-only hydration failure on `127.0.0.1`: local loopback origins were missing from `allowedDevOrigins`. Theme switching and previous/next metadata changes work without hydration errors. Audible playback still requires a normal headed/mobile-browser check because headless Chrome did not advance its media pipeline.

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

The current migrations and 24 pgTAP checks pass locally. The 41 Node tests cover owner identity authorization, safe auth redirects, admin preview boundary/state, filename-derived editor metadata, `mm:ss` duration, forced-disabled public download, upload validation, reorder behavior, public-player privacy mapping, player time, queue resolution, and equal-power curves. Production browser checks verify real playback, manual overlap, natural automatic advance, owner preview switching, and published range delivery. Representative physical iPhone/Android checks and live preview of a future Draft row remain pending in `TASKS.md`.

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

The prototype remains a preserved design artifact; production code lives separately under `components/player/`.
