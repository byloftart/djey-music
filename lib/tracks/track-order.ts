type OrderedTrack = {
  id: string;
};

export function reorderVisibleTracks<TTrack extends OrderedTrack>(
  allTracks: readonly TTrack[],
  visibleTracks: readonly TTrack[],
  movedId: string,
  overId: string,
): readonly TTrack[] {
  const fromIndex = visibleTracks.findIndex((track) => track.id === movedId);
  const toIndex = visibleTracks.findIndex((track) => track.id === overId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return allTracks;
  }

  const reorderedVisible = [...visibleTracks];
  const [movedTrack] = reorderedVisible.splice(fromIndex, 1);
  reorderedVisible.splice(toIndex, 0, movedTrack);

  const visibleIds = new Set(visibleTracks.map((track) => track.id));
  let visibleIndex = 0;

  return allTracks.map((track) =>
    visibleIds.has(track.id) ? reorderedVisible[visibleIndex++] : track,
  );
}
