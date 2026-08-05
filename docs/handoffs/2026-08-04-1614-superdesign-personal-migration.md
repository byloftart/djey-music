# SuperDesign Personal Migration Handoff

- Created: 2026-08-04 16:14 +04
- Project root: `/Users/iram/Documents/DJey Audio`

## Active SuperDesign workspace

- Workspace: `Personal`
- Team ID: `b78915d4-c6ae-4386-abe5-4ce3b196b496`
- Active project: `DJey Music Public Player — Annotated Candidate`
- Project ID: `91f62f99-ad72-4130-9ac0-ab1cdb5a7f0b`
- Canvas: `https://superdesign.dev/teams/b78915d4-c6ae-4386-abe5-4ce3b196b496/projects/91f62f99-ad72-4130-9ac0-ab1cdb5a7f0b`
- Imported base draft: `529dac18-78e6-4a50-8659-6a49c77e995b`
- Current corrected review draft: `fdf4acd2-c510-4294-b437-1e8d66da7f32`
- Current preview: `https://p.superdesign.dev/draft/fdf4acd2-c510-4294-b437-1e8d66da7f32`
- Reference asset: `https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/projects/91f62f99-ad72-4130-9ac0-ab1cdb5a7f0b/external-assets/a544f4d2-f8ed-456c-9b38-172a0b44ff61-MMJB_Visualization.JPG`

The CLI is authenticated as team `Personal`. Continue all future player design generations there.

## Previous LOFT Art fallback

- Project ID: `442d6bbf-29d0-4bc8-91a6-02679973795f`
- Last draft ID: `3dde5988-f7bb-46d7-a6d7-4ce5df593156`

This prior project remains only as a recoverable fallback. Do not spend further `LOFT Art` credits and do not iterate it.

## Migration method

SuperDesign CLI v0.9.0 has no direct cross-workspace move command. The current LOFT draft was saved to ignored `.superdesign/tmp/djey-music-personal-template.html`, the CLI was reauthenticated to `Personal`, and a new Personal project was created from that exact HTML template. The MMJB reference was uploaded again into the new project.

## Binding review corrections

1. Spectrum: retain the current frame and labels, but use 38 vertical columns built from stacked small rectangular LED segments. Each column shades dark-to-light vertically; neighboring columns transition continuously from deep blue through cyan/green/orange to red without abrupt rainbow bands. The peak cap is white in Green Receiver/White Neon and orange/amber in Dark Amber.
2. Metadata: remove the artist row, `RANGE STREAM`, and `ORIGINAL MASTER`. Use four symmetric rows: status/count; full-width title; FORMAT/GENRE/YEAR labels; `MP3 · 320 KBPS`/genre/year values. Short titles stay stationary; only overflowing long titles marquee.
3. Timeline: increase the gap from progress bar to time values and from time values to transport. Show elapsed time on the left and remaining time on the right. Move transport slightly lower while preserving the mobile viewport and safe area.
4. Keep the player mobile-only even on desktop: a centered 375px mobile composition, never a full-width desktop adaptation.

## Guardrails

- Do not implement React/CSS or deploy until the user explicitly approves the SuperDesign candidate.
- Do not change owner-admin production flow, draft privacy, public RLS, or real-audio delivery.
- Do not restart player/catalog exploration or recreate the earlier rejected Personal project direction.
