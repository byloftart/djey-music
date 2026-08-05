# DJey Music spectrum and marquee correction handoff

- Created: 2026-08-05 14:50 +04
- Project root: `/Users/iram/Documents/DJey Audio`
- Branch: `codex/djey-player-redesign` tracking `origin/codex/djey-player-redesign`
- Released implementation commit: `e7e49dd`
- Draft pull request: `https://github.com/byloftart/djey-music/pull/1`
- Production player: `https://djey-music.vercel.app`
- Production deployment still live: `dpl_6MYwGgodR4rjP7YXi9eqwcuNnkQx`

## Direct user correction

The user rejected the over-brightened, near-ceiling spectrum response and the two permanently illuminated lower LED rows. They also required restoration of the active track-title running marquee, which had disappeared even though no request removed it.

The local correction is intentionally narrow:

- silence, paused playback, and values below the noise floor now draw zero LED segments;
- ordinary analyser values are no longer power-boosted toward the ceiling;
- each visual column uses a weighted three-bin sample, a wider analyser decibel range, faster smoothing, and restrained glow so it follows musical transients while reserving the full height for genuine peaks;
- the existing 38-column rectangular geometry, dark-emerald-to-light-orange transition, clean background, equal top/bottom useful insets, White Neon/Dark Amber system, and mobile shell remain unchanged;
- every real active title uses the existing masked authored-case marquee again, with a brief readable pause and a stationary reduced-motion fallback;
- the title remains the playlist trigger and the playlist behavior is unchanged.

## Verification

- The focused tests were first observed failing for the old forced minimum and missing response helper, then passed after the correction.
- `npm run typecheck`: passed.
- `npm run lint -- --max-warnings=0`: passed.
- `npm test`: 33/33 passed.
- `npm run build`: passed.
- `git diff --check`: passed before this documentation checkpoint and must be rerun after it.
- A local browser check with no playing track showed a completely clean spectrum area with no fixed bottom LED rows. The local catalog source returned no tracks, so live real-audio rhythm in this corrected build has not yet been browser-verified.

## Scope and release state

Only `components/player/public-player.tsx`, `components/player/public-player.module.css`, `lib/tracks/public-player.ts`, their focused test, and checkpoint documentation are modified locally. Owner-admin, database queries, RLS, private media delivery, draft privacy, and deployment configuration are untouched.

The correction is not committed, pushed, or deployed. Production still serves the prior released implementation. Do not deploy or merge without the user's explicit authorization.

## Exact next action

Wait for direct authorization to deploy. When authorized, rerun the full local gate, commit and push only the scoped correction, deploy to Vercel, then verify with real production audio that silence has zero rows, normal passages move rhythmically below the ceiling, genuine peaks can rise higher, and the title marquee is visible and still opens the playlist.
