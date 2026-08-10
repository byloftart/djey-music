"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  EQUALIZER_BANDS,
  EQUALIZER_PRESETS,
  EQUALIZER_PRESET_NAMES,
  type EqualizerPresetName,
  type SoundModes,
} from "@/lib/tracks/equalizer";

import {
  formatPlayerTime,
  getSpectrumColumnColor,
  getSpectrumIntensity,
  getSpectrumSegmentCount,
  type PublicPlayerTrack,
} from "@/lib/tracks/public-player";
import { SITE_CONFIG } from "@/lib/site-config";

import styles from "./public-player.module.css";
import { useContinuousPlayer } from "./use-continuous-player";

type PlayerTheme = "white" | "amber";
type RepeatMode = "off" | "all" | "one";
type ActivePreset = EqualizerPresetName | "Custom";

type PublicPlayerProps = {
  initialTracks: PublicPlayerTrack[];
  loadError: boolean;
};

const THEME_STORAGE_KEY = "open-music-player-theme-v2";
const SPECTRUM_COLUMNS = 38;
const SPECTRUM_SEGMENTS = 25;

const INITIAL_SOUND_MODES: SoundModes = {
  bassBoost: false,
  normalize: false,
  spatial: false,
  stereoWidth: false,
};

const SOUND_CONTROLS: ReadonlyArray<{
  mode: keyof SoundModes;
  label: string;
}> = [
  { mode: "bassBoost", label: "Bass Boost" },
  { mode: "spatial", label: "Spatial" },
  { mode: "normalize", label: "Normalize" },
  { mode: "stereoWidth", label: "Width" },
];

function formatBandLabel(frequency: number) {
  return frequency >= 1000 ? `${frequency / 1000}K` : String(frequency);
}

function SoundControlIcon({ mode }: { mode: keyof SoundModes }) {
  if (mode === "bassBoost") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8z" /></svg>;
  }
  if (mode === "spatial") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" /></svg>;
  }
  if (mode === "normalize") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 21h5v-5M3 8l6-6M21 16l-6 6" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h6v14H4zM14 5h6v14h-6z" /></svg>;
}

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const playlistRef = useRef<HTMLDivElement>(null);
  const titleTriggerRef = useRef<HTMLButtonElement>(null);
  const presetMenuRef = useRef<HTMLDivElement>(null);
  const presetTriggerRef = useRef<HTMLButtonElement>(null);
  const [theme, setTheme] = useState<PlayerTheme>("white");
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [activeBand, setActiveBand] = useState<number | null>(null);
  const [activePreset, setActivePreset] = useState<ActivePreset>("Flat");
  const [equalizerGains, setEqualizerGains] = useState<number[]>(
    () => [...EQUALIZER_PRESETS.Flat],
  );
  const [soundModes, setSoundModes] = useState<SoundModes>(
    INITIAL_SOUND_MODES,
  );
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const {
    analyserRef,
    audioARef,
    audioBRef,
    audioEvents,
    changeBy,
    currentIndex,
    currentTime,
    duration,
    isPlaying,
    playerState,
    seekTo,
    selectTrack,
    togglePlayback,
  } = useContinuousPlayer({
    tracks: initialTracks,
    repeatMode,
    shuffleEnabled,
    loadError,
    equalizerGains,
    soundModes,
  });
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
    if (!isPresetOpen) return;

    const closePresetOnPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        presetMenuRef.current?.contains(target) ||
        presetTriggerRef.current?.contains(target)
      ) {
        return;
      }
      setIsPresetOpen(false);
    };
    const closePresetOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsPresetOpen(false);
      window.requestAnimationFrame(() => presetTriggerRef.current?.focus());
    };
    window.addEventListener("pointerdown", closePresetOnPointer);
    window.addEventListener("keydown", closePresetOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closePresetOnPointer);
      window.removeEventListener("keydown", closePresetOnEscape);
    };
  }, [isPresetOpen]);

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
        const previousValue = frequencyData[Math.max(0, frequencyIndex - 1)];
        const centerValue = frequencyData[frequencyIndex];
        const nextValue = frequencyData[Math.min(frequencyData.length - 1, frequencyIndex + 1)];
        const rawIntensity =
          (previousValue * 0.2 + centerValue * 0.6 + nextValue * 0.2) / 255;
        const intensity = isPlaying && analyser
          ? getSpectrumIntensity(rawIntensity)
          : 0;
        const activeSegments = getSpectrumSegmentCount(
          intensity,
          SPECTRUM_SEGMENTS,
        );
        const x = sideInset + index * (columnWidth + columnGap);
        const color = getSpectrumColumnColor(index, SPECTRUM_COLUMNS);

        for (let segment = 0; segment < activeSegments; segment += 1) {
          const y = baseline - (segment + 1) * segmentHeight - segment * segmentGap;
          context.globalAlpha = theme === "amber" ? 0.84 : 0.76;
          context.fillStyle = color;
          context.shadowColor = color;
          context.shadowBlur = 0.9 * pixelRatio;
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
  }, [analyserRef, isPlaying, theme]);

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

  function selectPlaylistTrack(index: number) {
    void selectTrack(index, true);
  }

  function cycleRepeatMode() {
    setRepeatMode((current) =>
      current === "off" ? "all" : current === "all" ? "one" : "off",
    );
  }

  function selectEqualizerPreset(preset: EqualizerPresetName) {
    setEqualizerGains([...EQUALIZER_PRESETS[preset]]);
    setActivePreset(preset);
    setIsPresetOpen(false);
    window.requestAnimationFrame(() => presetTriggerRef.current?.focus());
  }

  function updateEqualizerBand(index: number, value: number) {
    setEqualizerGains((current) =>
      current.map((gain, gainIndex) => gainIndex === index ? value : gain),
    );
    setActivePreset("Custom");
  }

  function resetEqualizer() {
    setEqualizerGains([...EQUALIZER_PRESETS.Flat]);
    setActivePreset("Flat");
    setSoundModes(INITIAL_SOUND_MODES);
    setIsPresetOpen(false);
  }

  function toggleSoundMode(mode: keyof SoundModes) {
    setSoundModes((current) => ({ ...current, [mode]: !current[mode] }));
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
        aria-label={`${SITE_CONFIG.name} player`}
      >
        <div className={styles.plaque}>
          <span className={styles.plaqueBalance} aria-hidden="true" />
          <div className={styles.brand}>
            <b>
              {SITE_CONFIG.brandLead ? `${SITE_CONFIG.brandLead} ` : null}
              <i>{SITE_CONFIG.brandAccent}</i>
            </b>
          </div>
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
            <button
              className={`${styles.spectrumTrigger} ${isEqualizerOpen ? styles.spectrumBehindEqualizer : ""}`}
              type="button"
              aria-label="Open equalizer"
              aria-expanded={isEqualizerOpen}
              disabled={isEqualizerOpen}
              onClick={() => setIsEqualizerOpen(true)}
            >
              <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
              <span className={styles.freqScale} aria-hidden="true">
                <span>20</span><span>60</span><span>250</span><span>1K</span><span>4K</span><span>16K</span>
              </span>
            </button>

            {isEqualizerOpen ? (
              <div className={styles.equalizer} role="region" aria-label="Ten band equalizer">
                <div className={styles.equalizerHeader}>
                  <span>Equalizer</span>
                  <button
                    className={styles.equalizerClose}
                    type="button"
                    aria-label="Close equalizer"
                    onClick={() => {
                      setIsPresetOpen(false);
                      setIsEqualizerOpen(false);
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
                  </button>
                </div>

                <div className={styles.equalizerGraph}>
                  <div className={styles.decibelScale} aria-hidden="true">
                    <span>+12</span><span>0</span><span>-12</span>
                  </div>
                  <div className={styles.equalizerBands}>
                    {EQUALIZER_BANDS.map((frequency, index) => {
                      const gain = equalizerGains[index] ?? 0;
                      const thumbPosition = ((12 - gain) / 24) * 100;
                      const fillTop = Math.min(50, thumbPosition);
                      const fillHeight = Math.abs(50 - thumbPosition);
                      const railStyle = {
                        "--eq-fill-top": `${fillTop}%`,
                        "--eq-fill-height": `${fillHeight}%`,
                        "--eq-thumb-top": `${thumbPosition}%`,
                        "--eq-glow-strength": String((gain + 12) / 24),
                      } as CSSProperties;
                      return (
                        <label className={styles.equalizerBand} key={frequency}>
                          <span className={styles.equalizerRail} style={railStyle}>
                            <i aria-hidden="true" />
                            {activeBand === index ? (
                              <output>{gain > 0 ? "+" : ""}{gain} dB</output>
                            ) : null}
                            <input
                              type="range"
                              min="-12"
                              max="12"
                              step="1"
                              value={gain}
                              aria-label={`${frequency} hertz`}
                              aria-valuetext={`${gain > 0 ? "+" : ""}${gain} decibels`}
                              onBlur={() => setActiveBand(null)}
                              onChange={(event) => updateEqualizerBand(index, Number(event.currentTarget.value))}
                              onFocus={() => setActiveBand(index)}
                              onPointerCancel={() => setActiveBand(null)}
                              onPointerDown={() => setActiveBand(index)}
                              onPointerUp={() => setActiveBand(index)}
                            />
                          </span>
                          <b>{formatBandLabel(frequency)}</b>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.equalizerConsole}>
                  <div className={styles.presetRow}>
                    <button
                      ref={presetTriggerRef}
                      className={styles.presetTrigger}
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={isPresetOpen}
                      aria-controls="equalizer-presets"
                      onClick={() => setIsPresetOpen((open) => !open)}
                    >
                      <span>{activePreset}</span>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
                    </button>
                    <button className={styles.equalizerReset} type="button" onClick={resetEqualizer}>Reset</button>
                  </div>

                  <div className={styles.soundControls}>
                    {SOUND_CONTROLS.map(({ mode, label }) => (
                      <button
                        className={styles.soundControl}
                        type="button"
                        role="switch"
                        aria-checked={soundModes[mode]}
                        key={mode}
                        onClick={() => toggleSoundMode(mode)}
                      >
                        <span><SoundControlIcon mode={mode} /><b>{label}</b></span>
                        <i aria-hidden="true"><em /></i>
                      </button>
                    ))}
                  </div>
                </div>

                {isPresetOpen ? (
                  <div
                    ref={presetMenuRef}
                    id="equalizer-presets"
                    className={styles.presetMenu}
                    role="listbox"
                    aria-label="Equalizer presets"
                  >
                    {EQUALIZER_PRESET_NAMES.map((preset) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={activePreset === preset}
                        key={preset}
                        onClick={() => selectEqualizerPreset(preset)}
                      >{preset}</button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
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
            <span className={styles.titleMask}>
              <span
                className={`${styles.titleText} ${track ? styles.marquee : ""}`}
              >
                {track?.title ?? SITE_CONFIG.name}
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
              onClick={() => void changeBy(-1)}
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
              onClick={() => void changeBy(1)}
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

        <audio
          className={styles.audio}
          crossOrigin="anonymous"
          onCanPlay={(event) => audioEvents.onCanPlay(0, event)}
          onEnded={() => audioEvents.onEnded(0)}
          onError={() => audioEvents.onError(0)}
          onLoadedMetadata={(event) => audioEvents.onLoadedMetadata(0, event)}
          onPause={(event) => audioEvents.onPause(0, event)}
          onPlay={() => audioEvents.onPlay(0)}
          onTimeUpdate={(event) => audioEvents.onTimeUpdate(0, event.currentTarget)}
          onWaiting={() => audioEvents.onWaiting(0)}
          preload="auto"
          ref={audioARef}
        />
        <audio
          className={styles.audio}
          crossOrigin="anonymous"
          onCanPlay={(event) => audioEvents.onCanPlay(1, event)}
          onEnded={() => audioEvents.onEnded(1)}
          onError={() => audioEvents.onError(1)}
          onLoadedMetadata={(event) => audioEvents.onLoadedMetadata(1, event)}
          onPause={(event) => audioEvents.onPause(1, event)}
          onPlay={() => audioEvents.onPlay(1)}
          onTimeUpdate={(event) => audioEvents.onTimeUpdate(1, event.currentTarget)}
          onWaiting={() => audioEvents.onWaiting(1)}
          preload="auto"
          ref={audioBRef}
        />
      </section>
    </main>
  );
}
