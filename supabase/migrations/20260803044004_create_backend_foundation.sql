create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create table private.owner_allowlist (
  user_id uuid primary key,
  email text not null unique,
  created_at timestamptz not null default now(),
  constraint owner_allowlist_email_is_canonical check (
    email = lower(btrim(email))
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);

alter table private.owner_allowlist enable row level security;
revoke all on table private.owner_allowlist from public, anon, authenticated;

create policy "owner allowlist is never directly accessible"
on private.owner_allowlist
for all
to authenticated
using (false)
with check (false);

create function private.is_allowlisted_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from private.owner_allowlist as owner
      where owner.user_id = (select auth.uid())
    );
$$;

revoke all on function private.is_allowlisted_owner() from public;
grant execute on function private.is_allowlisted_owner() to authenticated;

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  audio_path text not null unique,
  cover_path text unique,
  duration_seconds numeric(10, 3) not null,
  genre text,
  tags text[] not null default '{}'::text[],
  status text not null default 'draft',
  published_at timestamptz,
  download_enabled boolean not null default false,
  display_order integer not null default 0,
  rights_notice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tracks_title_length check (
    char_length(btrim(title)) between 1 and 160
  ),
  constraint tracks_slug_format check (
    char_length(slug) between 1 and 120
    and slug = lower(slug)
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint tracks_description_length check (
    description is null or char_length(description) <= 5000
  ),
  constraint tracks_duration_range check (
    duration_seconds > 0 and duration_seconds <= 86400
  ),
  constraint tracks_genre_length check (
    genre is null or char_length(btrim(genre)) between 1 and 80
  ),
  constraint tracks_tags_limit check (
    cardinality(tags) <= 20 and array_position(tags, null) is null
  ),
  constraint tracks_status_value check (status in ('draft', 'published')),
  constraint tracks_publication_state check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
  ),
  constraint tracks_display_order_nonnegative check (display_order >= 0),
  constraint tracks_rights_notice_length check (
    rights_notice is null or char_length(rights_notice) <= 500
  ),
  constraint tracks_audio_path_format check (
    audio_path = lower(audio_path)
    and audio_path ~ '^tracks/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/audio/[a-z0-9][a-z0-9._-]{0,127}\.(mp3|m4a|aac|wav)$'
    and split_part(audio_path, '/', 2) = id::text
  ),
  constraint tracks_cover_path_format check (
    cover_path is null
    or (
      cover_path = lower(cover_path)
      and cover_path ~ '^tracks/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/cover/[a-z0-9][a-z0-9._-]{0,127}\.(jpg|jpeg|png|webp|avif)$'
      and split_part(cover_path, '/', 2) = id::text
    )
  )
);

create index tracks_published_order_idx
  on public.tracks (status, display_order, published_at desc);
create index tracks_display_order_idx
  on public.tracks (display_order, id);
create index tracks_tags_idx
  on public.tracks using gin (tags);

create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public;

create trigger tracks_set_updated_at
before update on public.tracks
for each row execute function private.set_updated_at();

alter table public.tracks enable row level security;

revoke all on table public.tracks from anon, authenticated;
grant select on table public.tracks to anon, authenticated;
grant insert, update, delete on table public.tracks to authenticated;

create policy "published tracks are public"
on public.tracks
for select
to anon
using (status = 'published');

create policy "authenticated listeners read published and owner reads all"
on public.tracks
for select
to authenticated
using (
  status = 'published'
  or (select private.is_allowlisted_owner())
);

create policy "owner can insert tracks"
on public.tracks
for insert
to authenticated
with check ((select private.is_allowlisted_owner()));

create policy "owner can update tracks"
on public.tracks
for update
to authenticated
using ((select private.is_allowlisted_owner()))
with check ((select private.is_allowlisted_owner()));

create policy "owner can delete tracks"
on public.tracks
for delete
to authenticated
using ((select private.is_allowlisted_owner()));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'track-audio',
    'track-audio',
    false,
    null,
    array[
      'audio/mpeg',
      'audio/mp4',
      'audio/aac',
      'audio/x-m4a',
      'audio/wav',
      'audio/x-wav'
    ]
  ),
  (
    'track-covers',
    'track-covers',
    false,
    null,
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif'
    ]
  )
on conflict (id) do update
set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "published track objects are public"
on storage.objects
for select
to anon
using (
  (
    bucket_id = 'track-audio'
    and exists (
      select 1
      from public.tracks as track
      where track.status = 'published'
        and track.audio_path = name
    )
  )
  or (
    bucket_id = 'track-covers'
    and exists (
      select 1
      from public.tracks as track
      where track.status = 'published'
        and track.cover_path = name
    )
  )
);

create policy "authenticated published objects or owner all"
on storage.objects
for select
to authenticated
using (
  (
    (select private.is_allowlisted_owner())
    and bucket_id in ('track-audio', 'track-covers')
  )
  or (
    bucket_id = 'track-audio'
    and exists (
      select 1
      from public.tracks as track
      where track.status = 'published'
        and track.audio_path = name
    )
  )
  or (
    bucket_id = 'track-covers'
    and exists (
      select 1
      from public.tracks as track
      where track.status = 'published'
        and track.cover_path = name
    )
  )
);

create policy "owner can upload audio objects"
on storage.objects
for insert
to authenticated
with check (
  (select private.is_allowlisted_owner())
  and bucket_id = 'track-audio'
  and name = lower(name)
  and name ~ '^tracks/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/audio/[a-z0-9][a-z0-9._-]{0,127}\.(mp3|m4a|aac|wav)$'
);

create policy "owner can upload cover objects"
on storage.objects
for insert
to authenticated
with check (
  (select private.is_allowlisted_owner())
  and bucket_id = 'track-covers'
  and name = lower(name)
  and name ~ '^tracks/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/cover/[a-z0-9][a-z0-9._-]{0,127}\.(jpg|jpeg|png|webp|avif)$'
);

create policy "owner can update track objects"
on storage.objects
for update
to authenticated
using (
  (select private.is_allowlisted_owner())
  and bucket_id in ('track-audio', 'track-covers')
)
with check (
  (select private.is_allowlisted_owner())
  and (
    (
      bucket_id = 'track-audio'
      and name = lower(name)
      and name ~ '^tracks/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/audio/[a-z0-9][a-z0-9._-]{0,127}\.(mp3|m4a|aac|wav)$'
    )
    or (
      bucket_id = 'track-covers'
      and name = lower(name)
      and name ~ '^tracks/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/cover/[a-z0-9][a-z0-9._-]{0,127}\.(jpg|jpeg|png|webp|avif)$'
    )
  )
);

create policy "owner can delete track objects"
on storage.objects
for delete
to authenticated
using (
  (select private.is_allowlisted_owner())
  and bucket_id in ('track-audio', 'track-covers')
);
