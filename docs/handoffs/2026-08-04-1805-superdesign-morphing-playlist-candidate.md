# SuperDesign Morphing Playlist Candidate Handoff

- Created: 2026-08-04 18:05 +04
- Project root: `/Users/iram/Documents/DJey Audio`

## Active review candidate

- Workspace: `Personal`
- Team ID: `b78915d4-c6ae-4386-abe5-4ce3b196b496`
- Project: `DJey Music Public Player — Annotated Candidate`
- Project ID: `91f62f99-ad72-4130-9ac0-ab1cdb5a7f0b`
- Canvas: `https://superdesign.dev/teams/b78915d4-c6ae-4386-abe5-4ce3b196b496/projects/91f62f99-ad72-4130-9ac0-ab1cdb5a7f0b`
- Current draft title: `DJey Music - Morphing LCD Playlist`
- Current draft ID: `f76e43e6-71da-4eff-8ecd-7534f465e167`
- Preview: `https://p.superdesign.dev/draft/f76e43e6-71da-4eff-8ecd-7534f465e167`

The bare SuperDesign preflight confirmed workspace `Personal`. The first iteration attempt returned one transient internal server error; the single permitted retry succeeded and used 7 credits. Do not generate another branch until the user reviews this candidate and chooses a concrete next direction.

## Candidate interaction

1. The top-left playlist button and circular surface are absent. A non-interactive 37px spacer keeps `DJey Music` optically centered against the day/night control on the right.
2. The authored-case title marquee remains inside the normal 132px metadata LCD and is now the semantic playlist trigger with focus and `aria-expanded` states.
3. Tapping the title reveals a large 65%-tinted transparent LCD/glass surface that fills the player content area below the plaque and ends above the transport. It uses backdrop blur, active-theme border/glow, and a scale transition whose origin is near the metadata display; reduced motion removes the transition.
4. The expanded display keeps the plaque and transport stationary. It shows `PLAYLIST`, `03 TRACKS`, repeat/shuffle, close, and an independently scrollable list with title, duration, and circular Play/Pause controls for `Kisses your back`, `Attention`, and `Equals`.
5. White Neon/Dark Amber, the bright fixed green-to-orange segmented spectrum, metadata, timeline, transport, track order, and all owner/backend boundaries remain unchanged.

## Approval boundary

- This is a SuperDesign interaction candidate, not production React/CSS.
- Visually assess whether the LCD growth feels sufficiently connected to the original metadata display and whether the glass remains transparent enough in both themes.
- Do not implement or deploy until the user explicitly approves a candidate.
- Do not change owner-admin behavior, draft privacy, public RLS, or real-audio delivery.
