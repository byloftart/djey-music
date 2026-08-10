# Architecture

Open Music Player is one Next.js application with a public player, trusted server routes, and a protected owner catalog.

## Request boundaries

- `/` reads only published `public.tracks` rows in `display_order`.
- `/api/tracks/[trackId]/audio` rechecks published status before issuing a short-lived redirect to private Storage.
- `/admin` and `/api/admin/*` require a valid Supabase user plus the database owner mapping and server-side email allowlist.
- Uploads use validated type, extension, size, and track-scoped object paths.

## Playback graph

Two preloaded media elements feed independent channel gain nodes. Their mix supports exact three-second equal-power crossfades and then splits into dry and staged wet branches:

```text
media A/B → channel gains → mix
                         ├─ dry gain ───────────────────────────────┐
                         └─ EQ → normalize → spatial/stereo → wet ─┤
                                                                  └→ analyser → output
```

Flat EQ with every sound control disabled sets dry to 1 and wet to 0. A band change or Bass enables the EQ stage; Normalize enables compression; Spatial/Stereo enables the mid-side/delay stage. This prevents inactive processing from reducing uploaded audio.

## Data and privacy

Supabase Postgres is the metadata source of truth. Storage stores object paths rather than permanent public URLs. Row Level Security and Storage policies enforce the same published/owner boundary as the server routes. The browser-safe anon key is expected in client code; privileged keys are not.

## Portability

The app uses standard Next.js server output and Supabase APIs. It can run on Vercel, another Next.js-compatible host, or the included standalone Docker image. Branding is environment-driven and catalog content is database-driven.
