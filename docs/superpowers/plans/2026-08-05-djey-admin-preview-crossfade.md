# DJey Music Admin Preview and Crossfade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add owner-only catalog preview for published and draft tracks, then replace the public player's ended-event source swap with preloaded dual-channel three-second equal-power crossfades.

**Architecture:** The admin reuses its existing authenticated preview route and owns one hidden preview element. The public player delegates audio lifecycle to a focused two-channel hook; pure helpers resolve queue behavior, transition thresholds, and equal-power curves so the critical rules are testable without browser media mocks.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Web Audio API, HTMLMediaElement, Supabase Auth/Storage, Node test runner.

## Global Constraints

- Public metadata and `/api/tracks/[trackId]/audio` remain published-only.
- Draft media stays in the private `track-audio` bucket and is exposed only through the authenticated owner preview route.
- White Neon/Dark Amber geometry, playlist trigger, spectrum, admin reorder, Add/Edit workflow, RLS, and persisted `display_order` remain unchanged.
- Crossfade duration is `3` seconds and uses equal-power sine/cosine curves.
- Do not add a database migration, dependency, preview seek UI, public crossfade setting, or background audio feature.
- Do not deploy until the full local gate and focused browser checks pass.

---

### Task 1: Pure continuous-playback rules

**Files:**
- Create: `lib/tracks/continuous-playback.ts`
- Create: `tests/continuous-playback.test.ts`

**Interfaces:**
- Produces: `CROSSFADE_SECONDS`, `getEqualPowerGains(progress)`, `shouldStartCrossfade(currentTime, duration, hasNext, transitioning)`, and `resolveQueuedTrackIndex(options)`.
- `resolveQueuedTrackIndex` consumes `{ currentIndex, trackCount, intent, repeatMode, shuffleEnabled, shuffledIndex }`, where `intent` is `"automatic" | "next" | "previous"` and `repeatMode` is `"off" | "all" | "one"`.
- It returns a valid track index or `null` when Repeat Off reaches the final track.

- [ ] **Step 1: Write failing queue and gain tests**

```ts
test("equal-power gains preserve full endpoints and balanced midpoint", () => {
  assert.deepEqual(getEqualPowerGains(0), { outgoing: 1, incoming: 0 });
  const midpoint = getEqualPowerGains(0.5);
  assert.ok(Math.abs(midpoint.outgoing - Math.SQRT1_2) < 0.000001);
  assert.ok(Math.abs(midpoint.incoming - Math.SQRT1_2) < 0.000001);
  assert.deepEqual(getEqualPowerGains(1), { outgoing: 0, incoming: 1 });
});

test("automatic queue resolution preserves repeat and shuffle contracts", () => {
  assert.equal(resolveQueuedTrackIndex({ currentIndex: 2, trackCount: 3, intent: "automatic", repeatMode: "off", shuffleEnabled: false }), null);
  assert.equal(resolveQueuedTrackIndex({ currentIndex: 2, trackCount: 3, intent: "automatic", repeatMode: "all", shuffleEnabled: false }), 0);
  assert.equal(resolveQueuedTrackIndex({ currentIndex: 1, trackCount: 3, intent: "automatic", repeatMode: "one", shuffleEnabled: false }), 1);
  assert.equal(resolveQueuedTrackIndex({ currentIndex: 1, trackCount: 3, intent: "next", repeatMode: "off", shuffleEnabled: true, shuffledIndex: 2 }), 2);
});
```

- [ ] **Step 2: Run `npm test -- tests/continuous-playback.test.ts` and observe missing-module failure**
- [ ] **Step 3: Implement clamped gain math, exact three-second threshold, and queue rules without mutating inputs**
- [ ] **Step 4: Run the focused test and confirm every new case passes**
- [ ] **Step 5: Run `npm test` to catch regression in existing navigation helpers**

### Task 2: Owner catalog preview

**Files:**
- Modify: `components/admin/admin-catalog.tsx`
- Modify: `components/admin/admin-icon.tsx`
- Modify: `app/admin/admin.css`
- Modify: `app/api/admin/tracks/[trackId]/preview/route.ts`
- Modify: `docs/superpowers/specs/2026-08-03-djey-music-owner-admin-design.md`

**Interfaces:**
- The preview route keeps `GET` and returns `{ url: string }` only after `requireOwner()` and an authenticated lookup of any track status.
- The catalog owns `previewAudioRef`, `previewTrackId`, `previewLoadingId`, `previewPlaying`, and a per-page signed URL cache.
- `togglePreview(trackId)` pauses the previous track, fetches `/api/admin/tracks/${trackId}/preview` when needed, assigns the URL, and calls `play()`.

- [ ] **Step 1: Confirm the existing route signs both statuses only after `requireOwner()` and add `Cache-Control: private, no-store` to its success response**
- [ ] **Step 2: Add local `play` and `pause` paths to `AdminIcon`**
- [ ] **Step 3: Add one hidden `<audio preload="metadata">` plus Play/Pause state and cleanup to `AdminCatalog`**
- [ ] **Step 4: Insert a `44px` circular preview button between track copy and Edit, with `data-no-reorder` and track-specific aria labels**
- [ ] **Step 5: Update the catalog grid/CSS so four compact cards remain visible and both theme states use restrained tactile styling**
- [ ] **Step 6: Make filter changes preserve playback, track switches stop the prior element, failures show `Preview unavailable`, and unmount clears the source**
- [ ] **Step 7: Amend the owner-admin design contract so Play/Pause is the only newly approved per-card action**
- [ ] **Step 8: Run typecheck, lint, and the full Node test suite**

### Task 3: Two-channel public audio controller

**Files:**
- Create: `components/player/use-continuous-player.ts`
- Modify: `components/player/public-player.tsx`
- Test: `tests/continuous-playback.test.ts`

**Interfaces:**
- `useContinuousPlayer({ tracks, repeatMode, shuffleEnabled })` returns `audioRefs`, `currentIndex`, `isPlaying`, `playerState`, `currentTime`, `duration`, `analyser`, `togglePlayback()`, `changeBy(direction)`, `selectTrack(index, play)`, and `seekTo(seconds)`.
- Two audio slots alternate active/standby roles. Each `MediaElementAudioSourceNode` feeds its own `GainNode`; both gains feed one shared `AnalyserNode`, then the destination.
- The hook owns preload resolution, cancellation, automatic threshold checks, fallback `ended`, and teardown.

- [ ] **Step 1: Extend focused tests for the three-second threshold, no-next final track, short tracks, previous behavior, and stable shuffled index**
- [ ] **Step 2: Observe the new tests fail against the incomplete helpers/controller contract**
- [ ] **Step 3: Create two audio refs, slot-to-index refs, current state, transition cancellation, and media event registration**
- [ ] **Step 4: Initialize AudioContext/source/gain/analyser nodes on the first user playback gesture and make cleanup idempotent**
- [ ] **Step 5: Preload the resolved standby URL with `preload="auto"` without exposing Storage paths**
- [ ] **Step 6: Schedule sampled equal-power gain curves for exactly three seconds; after completion pause/reset outgoing, swap roles, and preload the following target**
- [ ] **Step 7: Route automatic advance, Next, Previous, and playing playlist selection through the same crossfade; paused selection switches directly**
- [ ] **Step 8: Implement repeat off/all/one, stable shuffle preselection, seek cancellation, late-standby fallback, and second-transition cancellation**
- [ ] **Step 9: Keep UI state synchronized to the incoming channel and report `PLAYBACK ERROR` only when no playable active channel remains**
- [ ] **Step 10: Render both hidden audio elements from `PublicPlayer`, consume the hook, and retain existing visual canvas/playlist/theme markup**
- [ ] **Step 11: Run focused tests, full tests, typecheck, and zero-warning lint**

### Task 4: Local browser verification

**Files:**
- Modify if required by evidence: only files from Tasks 1–3

**Interfaces:**
- Public story: Play → next route preloads → final three seconds overlap → incoming metadata/timeline/spectrum takes ownership.
- Owner story: signed-in catalog → Play draft/published → owner route signs private object → only one hidden audio element plays.

- [ ] **Step 1: Run `npm run build` and `git diff --check`**
- [ ] **Step 2: Start the local app without resetting Supabase and verify the public player has two audio elements, one active output, synchronized controls, and no console errors**
- [ ] **Step 3: Verify automatic and manual transitions with real audio when local catalog access is available; otherwise record the local data limitation and defer the real-audio gate to production**
- [ ] **Step 4: Verify owner catalog row geometry and Play/Pause interaction in White Neon and Dark Amber using an existing owner session**
- [ ] **Step 5: Verify draft preview remains unavailable through the public audio route**

### Task 5: Documentation, GitHub, production deployment, and end-to-end proof

**Files:**
- Modify: `DESIGN.md`
- Modify: `TASKS.md`
- Create: `docs/handoffs/2026-08-05-admin-preview-crossfade-release.md`

**Interfaces:**
- Release commit contains implementation, tests, contracts, plan completion, and handoff; no env files or temporary browser artifacts.

- [ ] **Step 1: Update design/tasks with the approved owner preview and crossfade contracts plus actual verification status**
- [ ] **Step 2: Rerun `npm run typecheck`, `npm run lint -- --max-warnings=0`, `npm test`, `npm run build`, and `git diff --check`**
- [ ] **Step 3: Inspect the complete diff, stage only scoped files, commit, and push `codex/djey-player-redesign`**
- [ ] **Step 4: Deploy the linked Vercel project to production and wait for `READY`**
- [ ] **Step 5: Verify canonical and secondary aliases return `200`, guest `/admin` redirects, and published range delivery returns `206 audio/mpeg`**
- [ ] **Step 6: In a real browser, verify published and draft owner preview, automatic/manual three-second overlap, repeat/shuffle rules, state/timeline/spectrum synchronization, and zero public draft access**
- [ ] **Step 7: Record the final commit, deployment ID, links, evidence, and any remaining real-device limitation in the handoff; push the documentation checkpoint**

## Plan self-review

- Spec coverage: admin preview, private delivery, dual-channel crossfade, queue modes, fallback behavior, testing, GitHub, and deployment all map to explicit tasks.
- Placeholder scan: no deferred implementation language or undefined task references remain.
- Type consistency: queue intents, repeat modes, controller outputs, and route response names are consistent across tasks.
