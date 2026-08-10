# Customization

## Brand

No component edits are needed for a new artist. Set:

```dotenv
NEXT_PUBLIC_SITE_NAME="John Doe Music"
NEXT_PUBLIC_ARTIST_NAME="John Doe"
NEXT_PUBLIC_SITE_DESCRIPTION="Original music by John Doe."
```

The final word of `NEXT_PUBLIC_SITE_NAME` receives the accent treatment in the header. A one-word name still renders correctly.

## Theme and player

The public design lives in `components/player/public-player.tsx` and `components/player/public-player.module.css`. The two supported themes are White Neon and Dark Amber. Player logic, continuous playback, equal-power curves, and the Web Audio routing graph live beside the UI and under `lib/tracks/`.

Keep these behavioral invariants when changing appearance:

- the progress bar and elapsed/remaining time remain unobstructed;
- every EQ slider stays centered and touch-accessible;
- Flat/all-off is the unprocessed dry path;
- drafts never become public through a UI-only change.

## Content

Tracks are managed at `/admin`. Upload audio, edit metadata, set display order, and publish only when ready. No source-code edits or repository commits are needed to update the catalog.

## Domain and install metadata

Set `NEXT_PUBLIC_APP_URL` to the final domain. The app name and description flow into Next.js metadata and the PWA manifest from the site configuration.
