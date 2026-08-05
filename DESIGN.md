# DJey Music Design Contract

Status: approved mobile player direction, 2026-08-03.

This file is the visual authority for implementation. Direct future user corrections may amend it. Do not reopen settled choices or replace the approved player with a generic streaming-service layout.

## Product character

DJey Music is a personal audio portfolio, not a Spotify clone, social network, or commercial streaming service. The player should feel like a modern interpretation of a dedicated hardware music player: tactile, friendly, legible, and lightly nostalgic.

## Canonical prototype

The approved interactive reference is:

`design/prototypes/djey-music-mobile-player.html`

It defines the current mobile geometry, visual hierarchy, synthesized test playback, and spectrum response. Direct corrections from 2026-08-04 supersede its three-skin selector: the redesign keeps only White Neon and Dark Amber. It is a design prototype, not production application code.

## Settled mobile hierarchy

From top to bottom:

1. Raised brand plaque with the exact name **DJey Music**.
2. Large inset spectrum display. It replaces the dominant album-cover position.
3. Evenly distributed frequency labels: `20`, `60`, `250`, `1K`, `4K`, `16K`.
4. Illuminated metadata display with state, queue position, title, authors, format, genre, year, sample rate, and source/master label.
5. Seek progress and elapsed/total time.
6. Tactile previous, play/pause, and next controls.
7. One direct day/night control in the top plaque; there are no theme swatches inside the transport block.

The player fills the mobile viewport using dynamic viewport units and iPhone safe-area insets. On narrow screens, external page headings disappear and the player becomes the full screen.

Direct playlist interaction correction approved for design exploration on 2026-08-04:

- There is no playlist or Queue button in the top plaque; the left side stays clean while the brand remains optically centered.
- The active title marquee inside the metadata LCD is the playlist trigger.
- Tapping the title visually expands that same LCD into a large translucent glass/display surface below the plaque and above the transport, overlaying the spectrum and timeline without reflowing the player.
- The expanded display contains a scrollable published-track list with authored-case title, duration, and a Play/Pause control for each row. Closing it restores the normal metadata LCD and marquee.
- The expanded playlist is a bright neutral translucent LCD-glass surface in both themes with raised outer depth, an inset list well, and clearly separated full-width rows. It has no internal X button; tapping outside the surface or pressing Escape closes it.

## Visual rules

- Light neomorphism is the base style: raised shells, inset displays, soft paired shadows, comfortable spacing, and large touch targets.
- The spectrum bars keep approximately one-bar horizontal clearance from the display edges.
- The spectrum contains no `SPECTRUM / LIVE` label.
- Frequency labels must be readable on a real phone and distributed across the available width.
- Metadata text must remain readable at phone size; do not return to tiny decorative labels.
- The metadata display has a restrained inner/outer glow matching the active skin.
- Motion and live visualization must respect `prefers-reduced-motion` and stop unnecessary animation when paused or hidden in production.
- The segmented spectrum draws only active rectangular LEDs. There is no faint inactive-cell grid behind it. Active columns can use the full useful height between an equal top inset and the baseline above the frequency labels.
- The transport is one centered tactile group: slightly larger previous/play/next buttons use fixed symmetric gaps rather than spreading to the panel edges.

## Themes

- **White Neon** is the default public-player theme: cool light shell with a restrained blue metadata glow.
- **Dark Amber** is the only alternate: graphite/brown-black shell with orange/amber metadata illumination.
- **Green Receiver** is removed from the public player and must not remain as a visible, hidden, persisted, or fallback option.

The two themes are one component system driven by design tokens, not independent implementations. A single moon/sun control switches them directly. Store the listener's choice locally on the device; no account or database field is needed.

## Artwork

Album artwork is not part of the approved owner-admin catalog or Add/Edit Track workflow. The first owner release uploads audio only and does not show a cover picker, preview, or placeholder. Any future track-detail/share/Open Graph treatment must be designed separately and must not silently restore cover UI to the approved admin surfaces.

## Deferred decisions

- Exact actions and final placement for share, download, and overflow controls. The playlist and day/night controls are no longer deferred.
- Desktop composition and density.
- Final typeface and production icon set.
- Exact visualization performance budget after implementation profiling.

## Owner admin relationship

The protected owner admin belongs to the same DJey Music material system as the approved player: light neomorphism, tactile controls, inset work surfaces, illuminated displays, and palette values driven by shared semantic tokens.

This does not require copying the player layout. Catalog rows, upload fields, progress, validation, publish controls, and confirmations should use functional admin-specific composition while remaining visibly part of the same product. A generic SaaS dashboard or raw Supabase Studio look is rejected.

Direct owner-admin corrections approved on 2026-08-03 amend the theme relationship for the admin only:

- White Neon is the default owner-admin theme.
- Dark Amber is its only alternate theme through one light/dark control.
- Green Receiver is removed from both the current public-player redesign and the owner admin.
- Every owner-admin label and message is English.
- The admin remains a centered mobile composition even on wide laptop browsers; desktop adaptation remains deferred.

The owner-admin catalog and full-screen Add/Edit Track compositions are approved. Their exact contract is in `docs/superpowers/specs/2026-08-03-djey-music-owner-admin-design.md`. Production implementation must preserve the sparse audio-only editor without reopening catalog exploration.

These items may be designed later without changing the approved mobile hierarchy.

## Rejected directions

- A large circular album/vinyl cover above a small visualizer.
- Spectrum visualization confined to the lower metadata panel.
- Artificially stretching the desktop metadata and button panels to fill viewport height.
- A large empty desktop control deck.
- The labels `SKIN`, `SPECTRUM / LIVE`, and `NEO CONSOLE · MODEL 01` in the final player.
- Brand variants `J Music`, `DJey Audio`, or generic placeholder naming. The approved name is `DJey Music`.
- Copying Spotify, Apple Music, Yandex Music, Winamp, or another product's visual identity.
