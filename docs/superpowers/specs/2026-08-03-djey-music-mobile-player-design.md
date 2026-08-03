# DJey Music Mobile Player Design

Status: approved by the user on 2026-08-03.

## Goal

Create a distinctive mobile-first full-screen player for a small public portfolio of original music. It must feel like modern dedicated audio hardware rather than a generic streaming card.

## Approved reference

`design/prototypes/djey-music-mobile-player.html`

The reference is interactive: the play button generates a copyright-safe synthetic loop, the spectrum responds through Web Audio, and the three skin selectors update the shared component tokens.

## Layout

- Full dynamic mobile viewport with iPhone safe-area padding.
- Raised `DJey Music` brand plaque.
- Large inset spectrum screen without an album cover or decorative status label.
- Readable frequency scale spread across the screen width.
- Compact illuminated metadata screen.
- Seek line and readable elapsed/total time.
- Tactile previous/play-next controls with temporary centered skin swatches.

## Theme system

Implement one component tree with token sets for Green Receiver, White Neon, and Dark Amber. Green Receiver is the default. Persist the selection locally per device.

## Accessibility and performance

- Minimum comfortable mobile tap targets.
- Semantic button labels and visible focus styles in production.
- Sufficient text contrast in every theme.
- Respect `prefers-reduced-motion`.
- Pause analyser rendering when audio is paused or the document is hidden.
- Do not autoplay audible media.

## Content behavior

The metadata display shows real track data. Artwork is used in the library, track page, and share metadata rather than displacing the spectrum in the full player. Long title/author text must truncate or scroll accessibly without breaking geometry.

## Error and empty behavior

Production components must define states for no selected track, missing/unavailable audio, loading metadata, buffering, offline content, and general playback failure. The approved visual hierarchy remains stable across these states.

## Testing expectations

- Validate representative iPhone Plus/Pro Max and large Android viewports.
- Validate play/pause, seek, previous/next, skin persistence, reduced motion, page visibility, and Media Session behavior.
- Test real deployed range requests and Safari/Chrome/Firefox compatibility before claiming production readiness.

## Deferred work

Desktop composition, secondary icon semantics, final production typography, and final iconography are deliberately deferred. Backend and upload work is the next phase.

