"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";

import { AdminIcon } from "@/components/admin/admin-icon";
import { reorderVisibleTracks } from "@/lib/tracks/track-order";

export type AdminTrack = {
  id: string;
  title: string;
  slug: string;
  genre: string | null;
  status: "draft" | "published";
  display_order: number;
};

type CatalogFilter = "all" | "published" | "draft";

type AdminCatalogProps = {
  initialTracks: AdminTrack[];
  loadError?: string;
};

const FILTER_LABELS: Record<CatalogFilter, string> = {
  all: "All Tracks",
  published: "Published",
  draft: "Drafts",
};

export function AdminCatalog({ initialTracks, loadError }: AdminCatalogProps) {
  const router = useRouter();
  const [tracks, setTracks] = useState(initialTracks);
  const [filter, setFilter] = useState<CatalogFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string>();
  const [overId, setOverId] = useState<string>();
  const [toast, setToast] = useState("");
  const longPressTimer = useRef<number | undefined>(undefined);
  const startPoint = useRef({ x: 0, y: 0 });
  const activePointer = useRef<number | undefined>(undefined);
  const draggingRef = useRef<string | undefined>(undefined);

  const visibleTracks = useMemo(
    () => tracks.filter((track) => filter === "all" || track.status === filter),
    [filter, tracks],
  );

  function clearLongPress() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
  }

  function resetDrag() {
    clearLongPress();
    draggingRef.current = undefined;
    activePointer.current = undefined;
    setDraggingId(undefined);
    setOverId(undefined);
    document.body.classList.remove("admin-sorting-active");
  }

  async function persistOrder(nextTracks: readonly AdminTrack[], previousTracks: AdminTrack[]) {
    setTracks([...nextTracks]);
    try {
      const response = await fetch("/api/admin/tracks/reorder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderedIds: nextTracks.map((track) => track.id) }),
      });
      if (!response.ok) throw new Error("Order update failed");
      setToast("Order updated");
    } catch {
      setTracks(previousTracks);
      setToast("Order update failed");
    } finally {
      window.setTimeout(() => setToast(""), 1600);
    }
  }

  function commitMove(movedId: string, destinationId: string) {
    const previous = tracks;
    const next = reorderVisibleTracks(tracks, visibleTracks, movedId, destinationId);
    if (next !== tracks) void persistOrder(next, previous);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>, trackId: string) {
    if (
      event.button !== 0 ||
      (event.target as Element).closest("[data-no-reorder]")
    ) {
      return;
    }

    clearLongPress();
    startPoint.current = { x: event.clientX, y: event.clientY };
    activePointer.current = event.pointerId;
    const row = event.currentTarget;

    longPressTimer.current = window.setTimeout(() => {
      draggingRef.current = trackId;
      setDraggingId(trackId);
      setOverId(trackId);
      document.body.classList.add("admin-sorting-active");
      row.setPointerCapture(event.pointerId);
      if (navigator.vibrate) navigator.vibrate(20);
    }, 350);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (activePointer.current !== event.pointerId) return;

    if (!draggingRef.current) {
      const distance = Math.hypot(
        event.clientX - startPoint.current.x,
        event.clientY - startPoint.current.y,
      );
      if (distance > 5) clearLongPress();
      return;
    }

    event.preventDefault();
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const row = target?.closest<HTMLElement>("[data-track-id]");
    if (row?.dataset.trackId) setOverId(row.dataset.trackId);
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLElement>) {
    const movedId = draggingRef.current;
    const destinationId = overId;
    if (movedId && destinationId) commitMove(movedId, destinationId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resetDrag();
  }

  function onKeyboardMove(trackId: string, direction: -1 | 1) {
    const index = visibleTracks.findIndex((track) => track.id === trackId);
    const target = visibleTracks[index + direction];
    if (target) commitMove(trackId, target.id);
  }

  return (
    <main className="admin-main">
      <section className="catalog-panel admin-inset" aria-label="Track catalog">
        <div className="catalog-toolbar">
          <div className="admin-readout">
            <AdminIcon name="list-music" size={15} />
            <span>{tracks.length} TRACKS TOTAL</span>
          </div>
          <div className="catalog-filter">
            <button
              aria-expanded={filterOpen}
              aria-haspopup="listbox"
              className="admin-readout"
              onClick={() => setFilterOpen((open) => !open)}
              type="button"
            >
              <AdminIcon name="filter" size={15} />
              <span>{FILTER_LABELS[filter]}</span>
              <AdminIcon name="chevron-down" size={15} />
            </button>
            {filterOpen ? (
              <div className="admin-popover filter-popover" role="listbox" aria-label="Track status filter">
                {(Object.keys(FILTER_LABELS) as CatalogFilter[]).map((value) => (
                  <button
                    aria-selected={filter === value}
                    key={value}
                    onClick={() => {
                      setFilter(value);
                      setFilterOpen(false);
                    }}
                    role="option"
                    type="button"
                  >
                    {FILTER_LABELS[value]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="catalog-well admin-inset">
          <div className="track-list" aria-live="polite">
            {loadError ? (
              <div className="catalog-state">
                <p>Catalog could not be loaded.</p>
                <button onClick={() => router.refresh()} type="button">Retry</button>
              </div>
            ) : visibleTracks.length === 0 ? (
              <div className="catalog-state">
                <p>{tracks.length === 0 ? "No tracks yet." : `No ${FILTER_LABELS[filter].toLowerCase()}.`}</p>
              </div>
            ) : (
              visibleTracks.map((track) => (
                <article
                  aria-label={`${track.title}. ${track.status}. Hold and drag to reorder, or use Alt and arrow keys.`}
                  className={`track-card admin-raised${draggingId === track.id ? " is-dragging" : ""}${overId === track.id && draggingId !== track.id ? " is-destination" : ""}`}
                  data-track-id={track.id}
                  key={track.id}
                  onContextMenu={(event) => event.preventDefault()}
                  onKeyDown={(event) => {
                    if (!event.altKey) return;
                    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                      event.preventDefault();
                      onKeyboardMove(track.id, event.key === "ArrowUp" ? -1 : 1);
                    }
                  }}
                  onPointerCancel={onPointerEnd}
                  onPointerDown={(event) => onPointerDown(event, track.id)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerEnd}
                  tabIndex={0}
                >
                  <span
                    aria-label={track.status === "published" ? "Published" : "Draft"}
                    className={`track-status track-status-${track.status}`}
                    role="img"
                  />
                  <div className="track-copy">
                    <h2>{track.title}</h2>
                    <p>{track.genre || "Uncategorized"} · DJey</p>
                  </div>
                  <div className="track-edit-target" data-no-reorder>
                    <Link href={`/admin/tracks/${track.id}/edit`}>Edit</Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
      <div className={`admin-toast${toast ? " is-visible" : ""}`} role="status">
        {toast}
      </div>
    </main>
  );
}
