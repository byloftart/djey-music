# DJey Music Admin Preview and Continuous Crossfade Design

Status: approved interaction direction, 2026-08-05.

## Goal

Add owner-only playback for every catalog track, including drafts, and make public playlist playback continuous through a three-second smooth crossfade instead of the current ended-event pause and source reload.

## Global constraints

- Preserve the centered mobile-only public player and owner-admin compositions on wide browsers.
- Preserve White Neon as default and Dark Amber as the sole alternate theme.
- Preserve published-only public metadata and audio delivery.
- Draft metadata and media remain private and owner-only.
- Do not expose Storage paths, service-role credentials, or long-lived signed URLs to public clients.
- Shuffle remains listener-local and never changes persisted `display_order`.
- Do not modify the approved Add/Edit Track surface, upload lifecycle, owner allowlist, RLS policies, or Storage bucket visibility for this feature.
- The feature is a PWA/web implementation; no native audio service or background-play expansion is included.

## Owner catalog preview

### Card composition

Each compact catalog card gains one circular tactile Play/Pause control between the title/genre block and the existing Edit control. It belongs to the existing light-neomorphic material system and remains visually secondary to Edit.

- The button has a `44px` effective touch target and a restrained raised treatment in both themes.
- Play and Pause are icon-only but have track-specific English accessible labels.
- The card remains compact enough to show at least four complete rows on the initial iPhone 15 Plus viewport.
- The Play/Pause and Edit controls both opt out of long-press reorder handling.
- No waveform, spectrum, seek bar, mini-player dock, duration row, cover, or status text badge is added.

### Playback behavior

- Any published or draft track returned by the protected owner catalog can be previewed.
- Only one admin preview plays at a time.
- Pressing the active track button toggles Play/Pause without requesting a new signed URL unless the existing URL has failed.
- Pressing another track stops the previous preview, requests the new owner preview URL, and starts the new preview.
- Changing the All/Published/Drafts filter does not stop the active preview, even if its row becomes hidden. Returning to a filter containing that track restores its Pause state.
- Leaving the catalog unmounts the preview audio element and stops playback.
- A failed authorization, signed URL request, media load, or playback start returns the button to Play and shows a short `Preview unavailable` toast.

### Security and data flow

The existing `GET /api/admin/tracks/[trackId]/preview` route remains the only source of admin preview URLs.

1. The client requests the route only after the owner presses Play.
2. The route calls `requireOwner()` before reading track metadata.
3. The authenticated owner query may select both `draft` and `published` rows.
4. The server creates a short-lived signed URL for the private `track-audio` object and returns a `307` redirect with `Cache-Control: private, no-store`.
5. The catalog assigns only the authenticated application preview route to its hidden `<audio>` element, allowing the browser to retain the original playback gesture while following the private redirect.

The public `/api/tracks/[trackId]/audio` route is unchanged and continues to require `status = published`. No public policy or bucket visibility changes are required.

## Public continuous playback

### Transition contract

- Crossfade duration is exactly three seconds.
- Automatic playlist advance begins the incoming track three seconds before the current track's effective end.
- The outgoing track follows an equal-power cosine fade and the incoming track follows an equal-power sine fade. This avoids the perceived volume dip of a linear midpoint.
- During active playback, Next, Previous, and selecting another playlist track use the same three-second crossfade immediately.
- When playback is paused, selecting another track switches directly without a fade. The new track remains paused unless the playlist row action explicitly starts it.
- Play from a stopped or paused state starts normally at full gain; it does not add an artificial fade-in.
- The metadata, title, progress, and active playlist row switch to the incoming track when its playback successfully starts.
- The spectrum visualizes the mixed output during the overlap and then the incoming track alone.

### Queue rules

- Repeat Off: tracks advance in persisted order; the final track plays to its natural end and stops without wrapping.
- Repeat All: the final track crossfades into the first track.
- Repeat One: the track crossfades from its ending into a second prepared instance of its own beginning.
- Shuffle: the next random index is selected once during preload and retained for the transition; it is not recalculated at fade start and does not mutate stored order.
- Previous during playback crossfades to the previous persisted-order track. Shuffle affects forward automatic/Next selection only, matching the existing player behavior.
- A manual seek inside the final three seconds cancels a prepared automatic transition and recalculates it from the new playhead.

### Dual-channel architecture

The current single media element cannot overlap outgoing and incoming audio. Replace it with a two-channel controller while keeping the visible player geometry unchanged.

- Two hidden `<audio preload="auto">` elements alternate between active and standby roles.
- Both elements use the existing published-only track-bound application URLs; raw Storage URLs never enter the player state.
- On the first user playback gesture, one `AudioContext` creates a `MediaElementAudioSourceNode` and `GainNode` for each channel.
- Both gain nodes feed the existing shared analyser, which feeds the destination.
- The active channel runs at gain `1`; the standby channel is preloaded at gain `0`.
- The controller preloads the resolved next track as soon as the active track begins and refreshes the standby channel when repeat/shuffle/current selection changes.
- Crossfade scheduling uses the audio context clock and cancels prior gain automation before every new transition.
- At fade completion, the outgoing element is paused and reset, channel roles swap, and the new standby track is prepared.

The controller must be isolated from presentation state so queue resolution, gain curves, transition eligibility, cancellation, and channel swapping can be tested without rendering the full player.

## Loading and fallback behavior

- `LOADING` remains visible while the requested incoming channel is not yet playable.
- If standby is ready at the automatic threshold, crossfade starts without silence.
- If standby is not ready, the current track is allowed to finish normally. The incoming track starts as soon as it can play; the player does not fake a transition or expose an error merely because preloading was late.
- If the incoming track fails, the outgoing track continues when possible and the UI reports `PLAYBACK ERROR` only when there is no playable active channel.
- A second manual transition cancels the first scheduled transition and starts from the currently dominant channel, preventing three overlapping tracks.
- Page visibility changes may reduce spectrum animation but must not cancel audio playback or scheduled gain automation.
- Component unmount pauses both elements, clears timers and gain automation, disconnects nodes, and closes the audio context.

## Component and file boundaries

- `components/admin/admin-catalog.tsx`: catalog preview state, one hidden audio element, owner preview request, Play/Pause controls, and preview error toast.
- `components/admin/admin-icon.tsx`: local Play and Pause icons.
- `app/admin/admin.css`: compact control geometry for the added catalog action.
- `app/api/admin/tracks/[trackId]/preview/route.ts`: retain owner authorization and add explicit private no-store response headers.
- `lib/tracks/continuous-playback.ts`: pure queue and transition helpers, including next-index resolution and equal-power gain values.
- `components/player/use-continuous-player.ts`: two-channel media/Web Audio lifecycle and crossfade orchestration.
- `components/player/public-player.tsx`: consume the controller while preserving current UI, playlist, timeline, themes, and spectrum canvas.

## Verification

### Automated

- Owner preview route rejects unauthenticated and non-owner requests before track lookup.
- Owner preview route can sign either a draft or published track and emits `private, no-store`.
- Public audio route still returns `404` for a draft.
- Queue helpers cover repeat off/all/one, shuffle preselection, previous behavior, last-track stop, and persisted-order immutability.
- Gain helpers cover exact endpoints and the equal-power midpoint.
- Transition helpers cover the three-second threshold, short tracks, seek cancellation, and standby-not-ready fallback.
- Admin catalog tests cover one active preview, toggle pause, switching tracks, filtering without stopping, request failure, and unmount cleanup.
- Existing track order, player formatting, spectrum, owner authorization, lint, typecheck, and build gates remain green.

### Browser and production

- An allowlisted owner can play both one published track and one draft from `/admin`; a signed-out visitor cannot access either preview route.
- Starting a second admin preview stops the first, and navigating to Edit stops preview playback.
- Public playback starts with a user gesture, advances time, and prepares the next track.
- Automatic transition overlaps both channels for three seconds without a silent interval.
- Next, Previous, and playlist selection crossfade while playing and switch directly while paused.
- Repeat All wraps smoothly; Repeat One restarts smoothly; Shuffle does not change database ordering.
- Timeline, title, active playlist row, Play/Pause state, and spectrum remain synchronized with the incoming track.
- Published audio keeps byte-range support, draft public audio remains unavailable, and owner-admin production behavior outside preview is unchanged.

## Out of scope

- User-configurable crossfade duration.
- Beat matching, tempo detection, DJ sync, loudness normalization, or automatic mastering.
- Crossfade controls in the public UI.
- Background playback or Media Session expansion beyond the existing PWA behavior.
- Preview seek controls, waveform display, or admin playlist playback.
- Changes to public catalog ordering, database schema, RLS, bucket visibility, uploads, publishing, or delete behavior.
