# Agent guide

This repository is the clean, final open-source implementation of Open Music Player. Do not recreate design explorations, prototypes, handoff logs, or rejected visual variants.

## Start here

1. Run `git status --short --branch`.
2. Read `README.md`, `docs/SETUP.md`, `docs/CUSTOMIZATION.md`, and `docs/ARCHITECTURE.md`.
3. Inspect only the files needed for the requested change.

## Product contracts

- Preserve the current mobile-first player geometry and both White Neon/Dark Amber themes unless a user explicitly asks for a redesign.
- Rebrand through `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_ARTIST_NAME`, and `NEXT_PUBLIC_SITE_DESCRIPTION`; do not fork the UI just to rename it.
- Anonymous users may read and play published tracks only. Draft metadata and media stay private.
- Owner authorization must be enforced by Supabase RLS and trusted server boundaries, never only by hidden UI.
- Flat EQ with Bass, Spatial, Normalize, and Stereo disabled must use the dry path so uploaded audio retains its original level.
- Automatic advance and playing track changes use the existing three-second equal-power crossfade.
- Never expose service-role keys, passwords, or private object paths in browser code or tracked files.

## Before completion

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

For database or policy changes also run the local Supabase reset and pgTAP suite described in `docs/SETUP.md`. Preserve user changes, review the diff before staging, and do not push or deploy without direct authorization.
