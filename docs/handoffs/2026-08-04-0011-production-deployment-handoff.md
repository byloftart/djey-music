# DJey Music production deployment handoff

- Created: 2026-08-04 00:11 +04
- Project root: `/Users/iram/Documents/DJey Audio`
- Branch: `main` tracking `origin/main`
- Production frontend: `https://djey-music.vercel.app`
- Production management: `https://djey-music.vercel.app/admin`
- Vercel project: `bylof/djey-music`
- Vercel deployment: `dpl_ApUTGyL3ovBjBtm6yvq1wev9ttCw`
- Supabase project: `offfzskzypzkkdikbsap` (`DJey Music`, `ap-northeast-1`)
- Current implementation and deployment are local uncommitted work; no commit or push occurred.

## Deployed checkpoint

The approved owner-admin and public-player vertical slice are live. Production Supabase has both versioned migrations, private `track-audio`/`track-covers` buckets, one confirmed allowlisted owner, and exactly three published tracks in persisted order: `Kisses your back`, `Attention`, and `Equals`. Their production audio objects match the local byte sizes and SHA-256 checks.

Vercel production has the required public Supabase variables and server-only owner/login variables. No service-role credential is present in browser code or required by the current runtime. Draft metadata remains protected by RLS and media buckets remain private.

## Live verification completed

- `npm test`: 29/29 passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed locally and on Vercel.
- `git diff --check`: passed before the documentation update.
- `https://djey-music.vercel.app`: HTTP 200 and all three published titles rendered.
- Guest `https://djey-music.vercel.app/admin`: HTTP 307 to `/admin/sign-in`.
- Real owner sign-in: HTTP 200; authenticated `/admin` rendered all three catalog titles.
- All three `/api/tracks/<id>/audio` routes: signed private redirect followed by HTTP 206, 32 requested bytes, `audio/mpeg`.
- Production tables: RLS enabled on `public.tracks` and `private.owner_allowlist`.
- Live headed-browser smoke: Next changed `Kisses your back` to `Attention`, White Neon became selected, Play changed to Pause, media reached `readyState = 4`, `currentTime` advanced with no media error, and Pause restored the Play control. No console errors were recorded.

Supabase security advisor reports two warnings: the intentionally `security definer` reorder RPC is executable by `authenticated`, but it begins with `private.is_allowlisted_owner()` and rejects every non-owner; leaked-password protection is disabled at the project level. Performance advisor reports only newly unused indexes, expected immediately after deployment.

## Remaining focused verification

Open the production frontend on a real iPhone and verify audible output, touch seek movement, ended-state advance, and live spectrum response. Metadata navigation, theme switching, browser media playback/pause, owner access, private signed delivery, and byte-range support are already verified. Do not redesign the approved shell or weaken draft privacy while correcting any real-device issue.

Do not commit, push, or redeploy further changes without explicit authorization.
