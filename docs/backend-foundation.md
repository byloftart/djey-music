# Backend Foundation Contract

This is the exact starting scope for the next dialog. It describes the backend and owner-upload foundation; it does not authorize redesigning the approved player.

## Proposed `tracks` model

- `id`: UUID primary key.
- `title`: required display title.
- `slug`: required unique stable URL slug.
- `description`: optional plain text.
- `audio_path`: private/internal storage object path.
- `cover_path`: optional storage object path.
- `duration_seconds`: validated numeric duration.
- `genre`: optional normalized genre.
- `tags`: text array with a practical small limit.
- `status`: draft or published.
- `published_at`: nullable timestamp.
- `download_enabled`: boolean, default false.
- `display_order`: integer for manual ordering.
- `rights_notice`: optional text.
- `created_at` and `updated_at`: timestamps.

Add indexes for unique slug lookup, status/published ordering, display order, and any chosen tag-search strategy. Public reads must be constrained to published rows by policy, not merely by frontend filters.

## Storage

Use separate audio and cover buckets or equally clear path/policy boundaries. Draft/unpublished objects must not have anonymous public access. Published delivery must support HTTP range requests so deployed seeking works. Store paths in the database and generate delivery URLs at the appropriate boundary.

Accepted initial audio formats:

- MP3.
- M4A/AAC when browser-compatible MIME validation succeeds.
- WAV with a clear size warning.

Define maximum byte sizes through environment/configuration rather than hard-coding them throughout the UI.

## Owner authorization

- No public signup UI.
- Authenticate only the owner using a simple Supabase flow.
- Compare the authenticated email against `OWNER_EMAIL_ALLOWLIST` at the appropriate trusted boundary.
- RLS/storage policies remain the final enforcement layer.
- Never place `SUPABASE_SERVICE_ROLE_KEY` in client-side code or any `NEXT_PUBLIC_*` variable.

## Upload lifecycle

1. Select audio and validate type/size.
2. Read duration and essential metadata client-side for feedback; revalidate trusted fields at the server/storage boundary.
3. Upload audio and optional cover with progress and cancellation/error states.
4. Create or update a draft metadata row.
5. Preview through an authorized draft URL.
6. Publish explicitly.
7. Allow edit, unpublish, reorder, and confirmed permanent delete.
8. Make deletion cleanup idempotent so partial storage/database failures can be retried safely.

## Required validation

- Migration apply/rollback strategy documented.
- Anonymous published-list and slug lookup succeeds.
- Anonymous draft metadata lookup fails.
- Anonymous draft audio/cover retrieval fails.
- Non-owner writes fail.
- Owner create/update/publish/unpublish/reorder/delete succeeds.
- Deleting a track removes its associated objects.
- Privileged keys are absent from browser bundles and committed files.
- Deployed audio supports play, pause, and seeking/range requests.

