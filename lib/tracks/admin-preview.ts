export type AdminPreviewButtonState = "play" | "pause" | "loading";

type AdminPreviewState = {
  activeTrackId?: string;
  loadingTrackId?: string;
  playing: boolean;
};

export function getAdminPreviewUrl(trackId: string) {
  return `/api/admin/tracks/${encodeURIComponent(trackId)}/preview`;
}

export function getAdminPreviewButtonState(
  trackId: string,
  state: AdminPreviewState,
): AdminPreviewButtonState {
  if (state.activeTrackId !== trackId) return "play";
  if (state.loadingTrackId === trackId) return "loading";
  return state.playing ? "pause" : "play";
}
