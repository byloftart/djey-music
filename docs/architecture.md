# Architecture Decision

## Decision

Use Next.js with TypeScript and App Router, Supabase Postgres/Storage/Auth, and Vercel. Deliver the listener experience as an installable PWA.

## Context

DJey Music is deliberately small: up to about 50 tracks, two creators, and only a few regular listeners. Operational simplicity matters more than designing for streaming-service scale.

## Component boundaries

- **Public web application:** published library, search/filter, deep-linked track pages, persistent player, local favorites, share/download controls, and PWA shell.
- **Player engine:** one global audio element/state controller, queue, seek/volume, Media Session integration, and Web Audio analyser. Visual components consume analyser data but do not own playback state.
- **Owner administration:** authenticated upload/editor experience. It calls trusted application/storage boundaries and is invisible to ordinary listeners.
- **Metadata:** Supabase `tracks` records are the catalog source of truth.
- **Binary media:** Supabase Storage holds audio and artwork. Database records store stable object paths, not privileged URLs.
- **Authorization:** Supabase Auth identifies the owner; RLS and storage policies enforce access. The client UI is not an authorization boundary.

## Data flow

1. Owner signs in using the restricted auth flow.
2. Upload validation checks MIME type, extension, configured size limits, and normalized storage paths.
3. Audio and optional artwork are uploaded to draft/private paths.
4. Metadata is saved as an unpublished `tracks` row.
5. Owner previews, edits, and publishes the track.
6. Public catalog queries return published rows only.
7. Public playback obtains only the delivery URL/path intended for published audio.
8. Permanent delete confirms intent, removes associated objects, and then removes the database record through an idempotent trusted operation.

## Why not a static-only site

A static catalog would make uploads, drafts, ordering, metadata changes, and secure unpublished assets cumbersome. Supabase provides the small amount of state and owner authorization the product genuinely needs.

## Why Vercel over Netlify

The planned app uses Next.js App Router and server boundaries, making Vercel the lowest-friction deployment target. Netlify remains viable if hosting preferences change, but it does not simplify the selected backend or audio-storage model.

## Growth trigger

Supabase Storage is appropriate for the initial small catalog. Reconsider audio delivery when storage egress, geographic latency, or listener volume becomes material. At that point, an S3-compatible object store plus CDN can serve published audio while Supabase continues to handle metadata and owner authentication.

## Native-app trigger

The PWA is sufficient while the product is primarily a private/public listening portfolio. Consider native applications only if background playback limitations, offline download management, platform media integrations, or app-store distribution become essential and cannot be met reliably on the web.

