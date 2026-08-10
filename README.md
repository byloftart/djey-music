# Open Music Player

A production-ready, mobile-first music player and private owner catalog. It ships with a ten-band Web Audio equalizer, presets, sound controls, continuous playback with three-second equal-power crossfades, private Supabase media storage, and a protected upload/admin flow.

The included identity is **DJey Music**, but the app is designed to become **John Doe Music** (or any other artist site) through environment variables—without editing components.

- Live demo: https://djey-music.vercel.app
- License: [MIT](LICENSE)
- Stack: Next.js 16, React 19, TypeScript, Supabase, Web Audio API

## Quick start

Requirements: Node.js 22+, npm, and a Supabase project.

```bash
git clone https://github.com/byloftart/djey-music.git
cd djey-music
npm ci
cp .env.example .env.local
```

Fill in `.env.local`, then apply the database migrations:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npm run dev
```

Open http://localhost:3000. Create the first owner account and allowlist it by following [docs/SETUP.md](docs/SETUP.md).

## Rebrand without touching code

Set these values in `.env.local` and in your hosting provider:

```dotenv
NEXT_PUBLIC_SITE_NAME="John Doe Music"
NEXT_PUBLIC_ARTIST_NAME="John Doe"
NEXT_PUBLIC_SITE_DESCRIPTION="Original music by John Doe."
```

The player header, page metadata, sign-in screen, and admin catalog update together. See [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md) for the small number of optional code-level customizations.

## Deploy

### Vercel

1. Fork this repository.
2. Import the fork at https://vercel.com/new.
3. Add every variable from `.env.example` in **Project Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_APP_URL` to the final `https://...` domain and deploy.

### Any Docker host

```bash
docker build -t open-music-player .
docker run --env-file .env.local -p 3000:3000 open-music-player
```

The same image works on Railway, Render, Fly.io, Cloud Run, and other container platforms. The app also works on Next.js-compatible hosts such as Netlify.

## What is included

- Anonymous playback of published tracks; drafts never enter the public catalog.
- Private Supabase Storage with track-bound public delivery routes.
- White Neon and Dark Amber themes.
- Ten real EQ bands, ten presets, Reset, Bass, Spatial, Normalize, and Stereo controls.
- A true dry path: `Flat` with all sound controls off preserves the uploaded file level.
- Two-channel preload and exact three-second equal-power crossfades.
- Protected owner sign-in, upload, edit, publish/unpublish, reorder, preview, and delete flows.
- Responsive PWA metadata and installable web-app manifest.

## Project map

- `app/` — pages, auth, public and owner API routes.
- `components/player/` — approved player UI and Web Audio engine.
- `components/admin/` — private catalog and track editor.
- `lib/` — authorization, validation, player math, and site configuration.
- `supabase/migrations/` — complete schema, RLS, Storage policies, and ordering.
- `tests/` — Node tests; `supabase/tests/` contains pgTAP policy tests.
- `docs/` — setup, customization, and architecture only.

## Quality gate

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

For local database policy checks, install Docker and the Supabase CLI, then run:

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:test
```

Never commit `.env.local`, service-role keys, passwords, or private media. See [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a change.
