# DJey Music Design Contract

Status: approved mobile player direction, 2026-08-03.

This file is the visual authority for implementation. Direct future user corrections may amend it. Do not reopen settled choices or replace the approved player with a generic streaming-service layout.

## Product character

DJey Music is a personal audio portfolio, not a Spotify clone, social network, or commercial streaming service. The player should feel like a modern interpretation of a dedicated hardware music player: tactile, friendly, legible, and lightly nostalgic.

## Canonical prototype

The approved interactive reference is:

`design/prototypes/djey-music-mobile-player.html`

It defines the current mobile geometry, visual hierarchy, three color skins, synthesized test playback, and spectrum response. It is a design prototype, not production application code.

## Settled mobile hierarchy

From top to bottom:

1. Raised brand plaque with the exact name **DJey Music**.
2. Large inset spectrum display. It replaces the dominant album-cover position.
3. Evenly distributed frequency labels: `20`, `60`, `250`, `1K`, `4K`, `16K`.
4. Illuminated metadata display with state, queue position, title, authors, format, genre, year, sample rate, and source/master label.
5. Seek progress and elapsed/total time.
6. Tactile previous, play/pause, and next controls.
7. Three centered temporary skin selectors inside the control block. Their final product location may change later.

The player fills the mobile viewport using dynamic viewport units and iPhone safe-area insets. On narrow screens, external page headings disappear and the player becomes the full screen.

## Visual rules

- Light neomorphism is the base style: raised shells, inset displays, soft paired shadows, comfortable spacing, and large touch targets.
- The spectrum bars keep approximately one-bar horizontal clearance from the display edges.
- The spectrum contains no `SPECTRUM / LIVE` label.
- Frequency labels must be readable on a real phone and distributed across the available width.
- Metadata text must remain readable at phone size; do not return to tiny decorative labels.
- The metadata display has a restrained inner/outer glow matching the active skin.
- Motion and live visualization must respect `prefers-reduced-motion` and stop unnecessary animation when paused or hidden in production.

## Skins

- **Green Receiver** is the default: warm light shell, dark green spectrum surface, fluorescent green spectrum, green metadata glow.
- **White Neon** is optional: cool light shell, cyan/blue spectrum, subtle blue metadata glow.
- **Dark Amber** is optional: graphite/brown-black shell, orange/amber spectrum and metadata illumination.

Skins are one component system driven by design tokens, not three independent implementations. Store the listener's choice locally on the device. No account or database field is needed.

## Artwork

Album artwork is not the dominant element of the full player. Uploaded artwork remains available in the library cards, track detail/share metadata, Open Graph image, and owner preview. If no cover is uploaded, production should generate a branded deterministic placeholder from the track title/slug and skin-safe colors.

## Deferred decisions

- Exact actions and final placement for menu, favorite, share, download, queue, and overflow controls.
- Desktop composition and density.
- Final typeface and production icon set.
- Exact visualization performance budget after implementation profiling.

## Owner admin relationship

The protected owner admin belongs to the same DJey Music material system as the approved player: light neomorphism, tactile controls, inset work surfaces, illuminated displays, and palette values driven by shared semantic tokens.

This does not require copying the player layout. Catalog rows, upload fields, progress, validation, publish controls, and confirmations should use functional admin-specific composition while remaining visibly part of the same product. A generic SaaS dashboard or raw Supabase Studio look is rejected.

Direct owner-admin corrections approved on 2026-08-03 amend the theme relationship for the admin only:

- White Neon is the default owner-admin theme.
- Dark Amber is its only alternate theme through one light/dark control.
- Green Receiver remains part of the player contract but is removed from the owner admin.
- Every owner-admin label and message is English.
- The admin remains a centered mobile composition even on wide laptop browsers; desktop adaptation remains deferred.

The owner-admin catalog composition is approved. Its canonical reference is `design/prototypes/djey-music-owner-admin-catalog.html`, with the exact contract in `docs/superpowers/specs/2026-08-03-djey-music-owner-admin-design.md`. Production implementation may now begin without another catalog exploration round. The full-screen Add/Edit track surface is the next design and implementation surface.

These items may be designed later without changing the approved mobile hierarchy.

## Rejected directions

- A large circular album/vinyl cover above a small visualizer.
- Spectrum visualization confined to the lower metadata panel.
- Artificially stretching the desktop metadata and button panels to fill viewport height.
- A large empty desktop control deck.
- The labels `SKIN`, `SPECTRUM / LIVE`, and `NEO CONSOLE · MODEL 01` in the final player.
- Brand variants `J Music`, `DJey Audio`, or generic placeholder naming. The approved name is `DJey Music`.
- Copying Spotify, Apple Music, Yandex Music, Winamp, or another product's visual identity.
