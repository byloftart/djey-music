create function public.reorder_tracks(ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  catalog_count integer;
  distinct_count integer;
begin
  if not private.is_allowlisted_owner() then
    raise exception 'An allowlisted owner session is required.'
      using errcode = '42501';
  end if;

  if ordered_ids is null or cardinality(ordered_ids) = 0 then
    raise exception 'The complete ordered track id list is required.'
      using errcode = '22023';
  end if;

  select count(*) into catalog_count from public.tracks;
  select count(distinct requested.track_id)
    into distinct_count
    from unnest(ordered_ids) as requested(track_id);

  if cardinality(ordered_ids) <> catalog_count
    or distinct_count <> catalog_count
    or exists (
      select 1
      from unnest(ordered_ids) as requested(track_id)
      left join public.tracks as track on track.id = requested.track_id
      where track.id is null
    )
  then
    raise exception 'The ordered track id list must match the complete catalog.'
      using errcode = '22023';
  end if;

  update public.tracks as track
  set display_order = (requested.position - 1)::integer
  from unnest(ordered_ids) with ordinality as requested(track_id, position)
  where track.id = requested.track_id;
end;
$$;

revoke all on function public.reorder_tracks(uuid[]) from public, anon;
grant execute on function public.reorder_tracks(uuid[]) to authenticated;
