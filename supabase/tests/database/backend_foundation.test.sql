begin;

select plan(24);

select has_schema('private', 'private schema exists');
select has_table('private', 'owner_allowlist', 'owner allowlist exists');
select has_table('public', 'tracks', 'tracks table exists');
select has_column('public', 'tracks', 'status', 'tracks has status');
select has_column('public', 'tracks', 'audio_path', 'tracks has audio path');
select has_column('public', 'tracks', 'cover_path', 'tracks has cover path');
select col_is_pk('public', 'tracks', 'id', 'tracks id is the primary key');

select is(
  (select relrowsecurity from pg_class where oid = 'public.tracks'::regclass),
  true,
  'tracks has RLS enabled'
);

select policies_are(
  'public',
  'tracks',
  array[
    'authenticated listeners read published and owner reads all',
    'owner can delete tracks',
    'owner can insert tracks',
    'owner can update tracks',
    'published tracks are public'
  ],
  'tracks has the expected policies'
);

select results_eq(
  $$select public from storage.buckets where id = 'track-audio'$$,
  array[false],
  'audio bucket is private'
);

select results_eq(
  $$select public from storage.buckets where id = 'track-covers'$$,
  array[false],
  'cover bucket is private'
);

select policies_are(
  'storage',
  'objects',
  array[
    'authenticated published objects or owner all',
    'owner can delete track objects',
    'owner can update track objects',
    'owner can upload audio objects',
    'owner can upload cover objects',
    'published track objects are public'
  ],
  'storage has the expected track policies'
);

insert into private.owner_allowlist (user_id, email)
values ('11111111-1111-4111-8111-111111111111', 'owner@example.test');

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select ok(
  (select private.is_allowlisted_owner()),
  'allowlisted owner is recognized'
);

set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

select isnt(
  (select private.is_allowlisted_owner()),
  true,
  'non-owner is rejected'
);

reset role;

insert into public.tracks (
  id,
  title,
  slug,
  audio_path,
  cover_path,
  duration_seconds,
  status,
  published_at
)
values
  (
    '33333333-3333-4333-8333-333333333333',
    'Published Track',
    'published-track',
    'tracks/33333333-3333-4333-8333-333333333333/audio/master.mp3',
    'tracks/33333333-3333-4333-8333-333333333333/cover/cover.jpg',
    180,
    'published',
    now()
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Draft Track',
    'draft-track',
    'tracks/44444444-4444-4444-8444-444444444444/audio/master.mp3',
    'tracks/44444444-4444-4444-8444-444444444444/cover/cover.jpg',
    180,
    'draft',
    null
  );

insert into storage.objects (bucket_id, name)
values
  (
    'track-audio',
    'tracks/33333333-3333-4333-8333-333333333333/audio/master.mp3'
  ),
  (
    'track-covers',
    'tracks/33333333-3333-4333-8333-333333333333/cover/cover.jpg'
  ),
  (
    'track-audio',
    'tracks/44444444-4444-4444-8444-444444444444/audio/master.mp3'
  ),
  (
    'track-covers',
    'tracks/44444444-4444-4444-8444-444444444444/cover/cover.jpg'
  );

set local role anon;
set local request.jwt.claims = '{"role":"anon"}';

select results_eq(
  $$select slug from public.tracks order by slug$$,
  array['published-track'::text],
  'anonymous users can read only published tracks'
);

select results_eq(
  $$select name from storage.objects order by name$$,
  array[
    'tracks/33333333-3333-4333-8333-333333333333/audio/master.mp3'::text,
    'tracks/33333333-3333-4333-8333-333333333333/cover/cover.jpg'::text
  ],
  'anonymous users can read only published track objects'
);

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

select results_eq(
  $$select slug from public.tracks order by slug$$,
  array['published-track'::text],
  'authenticated non-owners can read only published tracks'
);

select results_eq(
  $$select name from storage.objects order by name$$,
  array[
    'tracks/33333333-3333-4333-8333-333333333333/audio/master.mp3'::text,
    'tracks/33333333-3333-4333-8333-333333333333/cover/cover.jpg'::text
  ],
  'authenticated non-owners can read only published track objects'
);

select throws_ok(
  $$
    insert into public.tracks (
      id,
      title,
      slug,
      audio_path,
      duration_seconds
    ) values (
      '55555555-5555-4555-8555-555555555555',
      'Blocked Track',
      'blocked-track',
      'tracks/55555555-5555-4555-8555-555555555555/audio/master.mp3',
      120
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "tracks"',
  'non-owner inserts fail'
);

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name)
    values (
      'track-audio',
      'tracks/55555555-5555-4555-8555-555555555555/audio/master.mp3'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "objects"',
  'non-owner object uploads fail'
);

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select results_eq(
  $$select slug from public.tracks order by slug$$,
  array['draft-track'::text, 'published-track'::text],
  'owner can read draft and published tracks'
);

select results_eq(
  $$select name from storage.objects order by name$$,
  array[
    'tracks/33333333-3333-4333-8333-333333333333/audio/master.mp3'::text,
    'tracks/33333333-3333-4333-8333-333333333333/cover/cover.jpg'::text,
    'tracks/44444444-4444-4444-8444-444444444444/audio/master.mp3'::text,
    'tracks/44444444-4444-4444-8444-444444444444/cover/cover.jpg'::text
  ],
  'owner can read draft and published track objects'
);

select lives_ok(
  $$
    insert into public.tracks (
      id,
      title,
      slug,
      audio_path,
      duration_seconds
    ) values (
      '66666666-6666-4666-8666-666666666666',
      'Owner Draft',
      'owner-draft',
      'tracks/66666666-6666-4666-8666-666666666666/audio/master.mp3',
      120
    )
  $$,
  'owner can create a draft'
);

select lives_ok(
  $$
    insert into storage.objects (bucket_id, name)
    values (
      'track-audio',
      'tracks/66666666-6666-4666-8666-666666666666/audio/master.mp3'
    )
  $$,
  'owner can upload a valid audio object'
);

select * from finish();

rollback;
