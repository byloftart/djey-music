"use client";

import { useEffect, useRef, useState } from "react";

import {
  formatPlayerTime,
  getAdjacentTrackIndex,
  getSpectrumColumnColor,
  getSpectrumSegmentCount,
  type PublicPlayerTrack,
} from "@/lib/tracks/public-player";

import styles from "./public-player.module.css";

type PlayerTheme = "white" | "amber";
type RepeatMode = "off" | "all" | "one";

type PublicPlayerProps = {
  initialTracks: PublicPlayerTrack[];
  loadError: boolean;
};

const THEME_STORAGE_KEY = "djey-music-player-theme-v2";
const SPECTRUM_COLUMNS = 38;
const SPECTRUM_SEGMENTS = 25;

function PlayIcon({ paused }: { paused: boolean }) {
  return paused ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 5h4v14H7zM14 5h4v14h-4z" />
    </svg>
  );
}

function SkipIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={direction === "previous" ? styles.flipped : undefined}
    >
      <path d="M6 5h2v14H6zM10 5v14l9-7z" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 2l4 4-4 4V7H7a4 4 0 0 0-4 4H1a6 6 0 0 1 6-6h10V2zm0 15a4 4 0 0 0 4-4h2a6 6 0 0 1-6 6H7v3l-4-4 4-4v3h10z" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 3h5v5l-2-2-4.6 4.6-1.4-1.4L17.6 5 16 3zM3 6h3.6l10.8 12H21v2h-4.4L5.8 8H3V6zm0 12h3.6l3.2-3.6 1.3 1.5L7.4 20H3v-2zm14-7.2 1.4 1.4L21 9.6V15h-2v-2.6l-2 2-1.3-1.5 1.3-2.1z" />
    </svg>
  );
}

export function PublicPlayer({ initialTracks, loadError }: PublicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const resumeAfterTrackChangeRef = useRef(false);
  const playlistRef = useRef<HTMLDivElement>(null);
  const titleTriggerRef = useRef<HTMLButtonElement>(null);
  const titleFrameRef = useRef<HTMLSpanElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);
  const [theme, setTheme] = useState<PlayerTheme>("white");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [playerState, setPlayerState] = useState(
    loadError ? "ERROR" : initialTracks.length > 0 ? "READY" : "NO TRACKS",
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialTracks[0]?.durationSeconds ?? 0);
  const track = initialTracks[currentIndex];

  useEffect(() => {
    let frameId: number | null = null;
    try {
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "amber") {
        frameId = window.requestAnimationFrame(() => setTheme("amber"));
      }
    } catch {
      // Device-local theme persistence is optional.
    }
    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const frame = titleFrameRef.current;
    const text = titleTextRef.current;
    if (!frame || !text) return;

    const measure = () => {
      setIsTitleOverflowing(text.scrollWidth > frame.clientWidth + 2);
    };
    const frameId = window.requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(frame);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [track?.title]);

  useEffect(() => {
    if (!isPlaylistOpen) return;
    playlistRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPlaylistOpen(false);
        window.requestAnimationFrame(() => titleTriggerRef.current?.focus());
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isPlaylistOpen]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    audio.load();
    if (resumeAfterTrackChangeRef.current) {
      resumeAfterTrackChangeRef.current = false;
      void audio.play().catch(() => {
        setIsPlaying(false);
        setPlayerState("PLAYBACK ERROR");
      });
    }
  }, [track]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const frequencyData = new Uint8Array(256);
    let lastReducedMotionFrame = 0;

    function draw() {
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const analyser = analyserRef.current;
      if (isPlaying && analyser) analyser.getByteFrequencyData(frequencyData);

      const sideInset = 20 * pixelRatio;
      const topInset = 18 * pixelRatio;
      const labelZone = 22 * pixelRatio;
      const lowerInset = 18 * pixelRatio;
      const baseline = height - labelZone - lowerInset;
      const spectrumHeight = Math.max(1, baseline - topInset);
      const availableWidth = width - sideInset * 2;
      const columnGap = Math.max(1.25 * pixelRatio, availableWidth * 0.0037);
      const columnWidth =
        (availableWidth - columnGap * (SPECTRUM_COLUMNS - 1)) /
        SPECTRUM_COLUMNS;
      const segmentGap = Math.max(1.35 * pixelRatio, spectrumHeight * 0.006);
      const segmentHeight = Math.max(
        1.25 * pixelRatio,
        (spectrumHeight - segmentGap * (SPECTRUM_SEGMENTS - 1)) /
          SPECTRUM_SEGMENTS,
      );

      context.clearRect(0, 0, width, height);

      for (let index = 0; index < SPECTRUM_COLUMNS; index += 1) {
        const frequencyIndex = Math.floor(
          2 + Math.pow(index / SPECTRUM_COLUMNS, 0.72) * 145,
        );
        const idleIntensity = 0.08 + ((index * 17) % 13) / 100;
        const intensity = isPlaying && analyser
          ? Math.min(1, Math.pow(frequencyData[frequencyIndex] / 255, 0.72) * 1.24)
          : idleIntensity;
        const activeSegments = getSpectrumSegmentCount(
          intensity,
          SPECTRUM_SEGMENTS,
        );
        const x = sideInset + index * (columnWidth + columnGap);
        const color = getSpectrumColumnColor(index, SPECTRUM_COLUMNS);

        for (let segment = 0; segment < activeSegments; segment += 1) {
          const y = baseline - (segment + 1) * segmentHeight - segment * segmentGap;
          context.globalAlpha = 1;
          context.fillStyle = color;
          context.shadowColor = color;
          context.shadowBlur = 3.6 * pixelRatio;
          context.fillRect(x, y, columnWidth, segmentHeight);
        }
      }

      context.globalAlpha = 1;
      context.shadowBlur = 0;
    }

    function animate(timestamp: number) {
      if (document.hidden || !isPlaying) return;
      if (!motionQuery.matches || timestamp - lastReducedMotionFrame >= 100) {
        draw();
        lastReducedMotionFrame = timestamp;
      }
      animationFrameRef.current = window.requestAnimationFrame(animate);
    }

    function startOrStopVisualization() {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      draw();
      if (isPlaying && !document.hidden) {
        animationFrameRef.current = window.requestAnimationFrame(animate);
      }
    }

    startOrStopVisualization();
    document.addEventListener("visibilitychange", startOrStopVisualization);
    window.addEventListener("resize", startOrStopVisualization);
    motionQuery.addEventListener("change", startOrStopVisualization);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      document.removeEventListener("visibilitychange", startOrStopVisualization);
      window.removeEventListener("resize", startOrStopVisualization);
      motionQuery.removeEventListener("change", startOrStopVisualization);
    };
  }, [isPlaying, theme]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) void audioContextRef.current.close();
    };
  }, []);

  function toggleTheme() {
    const nextTheme: PlayerTheme = theme === "white" ? "amber" : "white";
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Keep the selected theme for this session when storage is unavailable.
    }
  }

  function closePlaylist(restoreFocus = false) {
    setIsPlaylistOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => titleTriggerRef.current?.focus());
    }
  }

  async function prepareVisualization(audio: HTMLAudioElement) {
    let audioContext = audioContextRef.current;
    if (!audioContext) {
      audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.88;
      const mediaSource = audioContext.createMediaElementSource(audio);
      mediaSource.connect(analyser);
      analyser.connect(audioContext.destination);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      mediaSourceRef.current = mediaSource;
    }

    if (audioContext.state === "suspended") await audioContext.resume();
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !track) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    setPlayerState("LOADING");
    try {
      if (audio.error) audio.load();
      await prepareVisualization(audio);
      await audio.play();
    } catch {
      setIsPlaying(false);
      setPlayerState("PLAYBACK ERROR");
    }
  }

  function getShuffledIndex() {
    if (initialTracks.length < 2) return currentIndex;
    const randomValues = new Uint32Array(1);
    window.crypto.getRandomValues(randomValues);
    const offset = 1 + (randomValues[0] % (initialTracks.length - 1));
    return (currentIndex + offset) % initialTracks.length;
  }

  function changeToTrack(nextIndex: number, resumePlayback: boolean) {
    if (!initialTracks[nextIndex] || nextIndex === currentIndex) return;
    const audio = audioRef.current;
    resumeAfterTrackChangeRef.current = resumePlayback;
    audio?.pause();
    setCurrentTime(0);
    setDuration(initialTracks[nextIndex].durationSeconds);
    setPlayerState("LOADING");
    setCurrentIndex(nextIndex);
  }

  function changeTrack(direction: -1 | 1, resumePlayback = false) {
    if (initialTracks.length < 2) return;
    const nextIndex = shuffleEnabled && direction === 1
      ? getShuffledIndex()
      : getAdjacentTrackIndex(currentIndex, initialTracks.length, direction);
    changeToTrack(
      nextIndex,
      resumePlayback || Boolean(audioRef.current && !audioRef.current.paused),
    );
  }

  function selectPlaylistTrack(index: number) {
    if (index === currentIndex) {
      void togglePlayback();
      return;
    }
    changeToTrack(index, true);
  }

  function cycleRepeatMode() {
    setRepeatMode((current) =>
      current === "off" ? "all" : current === "all" ? "one" : "off",
    );
  }

  function seekTo(value: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(value)) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }

  const safeDuration = Number.isFinite(duration) && duration > 0
    ? duration
    : track?.durationSeconds ?? 0;
  const progress = safeDuration > 0
    ? Math.min(100, (currentTime / safeDuration) * 100)
    : 0;
  const remainingTime = Math.max(0, safeDuration - currentTime);

  return (
    <main className={styles.page}>
      <section
        className={`${styles.player} ${theme === "amber" ? styles.amber : ""} ${isPlaying ? styles.playing : ""}`}
        aria-label="DJey Music player"
      >
        <div className={styles.plaque}>
          <span className={styles.plaqueBalance} aria-hidden="true" />
          <div className={styles.brand}><b>DJey <i>Music</i></b></div>
          <button
            className={styles.themeToggle}
            type="button"
            aria-label={theme === "white" ? "Switch to Dark Amber" : "Switch to White Neon"}
            aria-pressed={theme === "amber"}
            onClick={toggleTheme}
          >
            {theme === "white" ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.1 15.4A8.5 8.5 0 0 1 8.6 3.9 8.5 8.5 0 1 0 20.1 15.4z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            )}
          </button>
        </div>

        <div className={styles.visualShell}>
          <div className={styles.visual}>
            <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
            <div className={styles.freqScale} aria-hidden="true">
              <span>20</span><span>60</span><span>250</span><span>1K</span><span>4K</span><span>16K</span>
            </div>
          </div>
        </div>

        <div className={`${styles.display} ${isPlaylistOpen ? styles.displayHidden : ""}`} aria-live="polite">
          <div className={styles.displayHead}>
            <span className={styles.status}><i /><span>{playerState}</span></span>
            <span>TRACK {track ? String(currentIndex + 1).padStart(2, "0") : "00"} / {String(initialTracks.length).padStart(2, "0")}</span>
          </div>
          <button
            ref={titleTriggerRef}
            className={styles.titleTrigger}
            type="button"
            aria-label="Open playlist"
            aria-expanded={isPlaylistOpen}
            aria-controls="public-player-playlist"
            disabled={!track}
            onClick={() => setIsPlaylistOpen(true)}
          >
            <span ref={titleFrameRef} className={styles.titleMask}>
              <span
                ref={titleTextRef}
                className={`${styles.titleText} ${isTitleOverflowing ? styles.marquee : ""}`}
              >
                {track?.title ?? "DJey Music"}
              </span>
            </span>
          </button>
          <div className={styles.detailLabels} aria-hidden="true">
            <span>FORMAT</span><span>GENRE</span><span>YEAR</span>
          </div>
          <div className={styles.detailValues}>
            <b>{track ? `${track.format} · 320 KBPS` : "—"}</b>
            <b>{track?.genre ?? "—"}</b>
            <b>{track?.year ?? "—"}</b>
          </div>
        </div>

        <div className={styles.timeline}>
          <label className={styles.seekLabel}>
            <span className={styles.srOnly}>Seek through {track?.title ?? "track"}</span>
            <span className={styles.bar} aria-hidden="true"><i style={{ width: `${progress}%` }} /></span>
            <input
              className={styles.seek}
              type="range"
              min="0"
              max={Math.max(safeDuration, 0)}
              step="0.1"
              value={Math.min(currentTime, safeDuration)}
              disabled={!track || safeDuration <= 0}
              onChange={(event) => seekTo(Number(event.currentTarget.value))}
            />
          </label>
          <div className={styles.times}>
            <span>{formatPlayerTime(currentTime)}</span>
            <span>-{formatPlayerTime(remainingTime)}</span>
          </div>
        </div>

        <div className={styles.controlsWrap}>
          <div className={styles.controlsPanel}>
            <button
              className={styles.key}
              type="button"
              aria-label="Previous track"
              disabled={initialTracks.length < 2}
              onClick={() => changeTrack(-1)}
            ><SkipIcon direction="previous" /></button>
            <button
              className={`${styles.key} ${styles.play}`}
              type="button"
              aria-label={isPlaying ? "Pause" : "Play"}
              disabled={!track}
              onClick={() => void togglePlayback()}
            ><PlayIcon paused={!isPlaying} /></button>
            <button
              className={styles.key}
              type="button"
              aria-label="Next track"
              disabled={initialTracks.length < 2}
              onClick={() => changeTrack(1)}
            ><SkipIcon direction="next" /></button>
          </div>
        </div>

        {isPlaylistOpen ? (
          <>
            <button
              className={styles.playlistDismiss}
              type="button"
              aria-label="Close playlist"
              onClick={() => closePlaylist(true)}
            />
            <div
              ref={playlistRef}
              id="public-player-playlist"
              className={styles.playlist}
              role="dialog"
              aria-modal="true"
              aria-label="Published tracks playlist"
              tabIndex={-1}
            >
              <div className={styles.playlistHeader}>
                <div><b>PLAYLIST</b><span>{String(initialTracks.length).padStart(2, "0")} TRACKS</span></div>
                <div className={styles.playlistModes}>
                  <button
                    type="button"
                    aria-label={`Repeat ${repeatMode}`}
                    aria-pressed={repeatMode !== "off"}
                    data-active={repeatMode !== "off"}
                    onClick={cycleRepeatMode}
                  ><RepeatIcon />{repeatMode === "one" ? <small>1</small> : null}</button>
                  <button
                    type="button"
                    aria-label="Shuffle"
                    aria-pressed={shuffleEnabled}
                    data-active={shuffleEnabled}
                    onClick={() => setShuffleEnabled((enabled) => !enabled)}
                  ><ShuffleIcon /></button>
                </div>
              </div>
              <div className={styles.playlistWell}>
                {initialTracks.map((item, index) => {
                  const active = index === currentIndex;
                  return (
                    <div
                      key={item.id}
                      className={`${styles.playlistRow} ${active ? styles.activeTrack : ""}`}
                    >
                      <span>{item.title}</span>
                      <time>{formatPlayerTime(item.durationSeconds)}</time>
                      <button
                        type="button"
                        aria-label={active && isPlaying ? `Pause ${item.title}` : `Play ${item.title}`}
                        onClick={() => selectPlaylistTrack(index)}
                      ><PlayIcon paused={!active || !isPlaying} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}

        {track ? (
          <audio
            ref={audioRef}
            className={styles.audio}
            src={track.audioUrl}
            preload="metadata"
            crossOrigin="anonymous"
            onLoadedMetadata={(event) => {
              const nextDuration = event.currentTarget.duration;
              if (Number.isFinite(nextDuration)) setDuration(nextDuration);
            }}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onPlay={() => {
              setIsPlaying(true);
              setPlayerState("PLAYING");
            }}
            onPause={(event) => {
              setIsPlaying(false);
              if (!event.currentTarget.ended && playerState !== "LOADING") {
                setPlayerState("PAUSED");
              }
            }}
            onWaiting={() => setPlayerState("LOADING")}
            onEnded={() => {
              if (repeatMode === "one") {
                const audio = audioRef.current;
                if (audio) {
                  audio.currentTime = 0;
                  void audio.play();
                }
              } else if (shuffleEnabled && initialTracks.length > 1) {
                changeToTrack(getShuffledIndex(), true);
              } else if (currentIndex < initialTracks.length - 1) {
                changeToTrack(currentIndex + 1, true);
              } else if (repeatMode === "all" && initialTracks.length > 0) {
                if (currentIndex === 0) {
                  const audio = audioRef.current;
                  if (audio) {
                    audio.currentTime = 0;
                    void audio.play();
                  }
                } else {
                  changeToTrack(0, true);
                }
              } else {
                setIsPlaying(false);
                setCurrentTime(0);
                setPlayerState("READY");
              }
            }}
            onCanPlay={() => {
              if (audioRef.current?.paused && playerState === "LOADING") {
                setPlayerState("READY");
              }
            }}
            onError={() => {
              setIsPlaying(false);
              setPlayerState("PLAYBACK ERROR");
            }}
          />
        ) : null}
      </section>
    </main>
  );
}
