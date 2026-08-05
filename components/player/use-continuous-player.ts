"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";

import {
  CROSSFADE_SECONDS,
  createEqualPowerCurve,
  resolveQueuedTrackIndex,
  shouldStartCrossfade,
  type PlaybackRepeatMode,
} from "@/lib/tracks/continuous-playback";
import type { PublicPlayerTrack } from "@/lib/tracks/public-player";

type AudioSlot = 0 | 1;

type Transition = {
  outgoing: AudioSlot;
  incoming: AudioSlot;
  timeoutId: number;
};

type ContinuousPlayerOptions = {
  tracks: PublicPlayerTrack[];
  repeatMode: PlaybackRepeatMode;
  shuffleEnabled: boolean;
  loadError: boolean;
};

const OUTGOING_CURVE = createEqualPowerCurve("outgoing");
const INCOMING_CURVE = createEqualPowerCurve("incoming");

function otherSlot(slot: AudioSlot): AudioSlot {
  return slot === 0 ? 1 : 0;
}

export function useContinuousPlayer({
  tracks,
  repeatMode,
  shuffleEnabled,
  loadError,
}: ContinuousPlayerOptions) {
  const audioARef = useRef<HTMLAudioElement>(null);
  const audioBRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodesRef = useRef<Array<MediaElementAudioSourceNode | null>>([
    null,
    null,
  ]);
  const gainNodesRef = useRef<Array<GainNode | null>>([null, null]);
  const activeSlotRef = useRef<AudioSlot>(0);
  const slotTrackIndexesRef = useRef<Array<number | null>>([null, null]);
  const preparedAutomaticIndexRef = useRef<number | null>(null);
  const transitionRef = useRef<Transition | null>(null);
  const transitionStartingRef = useRef(false);
  const mountedRef = useRef(true);
  const tracksRef = useRef(tracks);
  const repeatModeRef = useRef(repeatMode);
  const shuffleEnabledRef = useRef(shuffleEnabled);
  const currentIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const prepareStandbyRef = useRef<() => void>(() => undefined);
  const startTransitionRef = useRef<(index: number) => Promise<void>>(
    async () => undefined,
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerState, setPlayerState] = useState(
    loadError ? "ERROR" : tracks.length > 0 ? "READY" : "NO TRACKS",
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(tracks[0]?.durationSeconds ?? 0);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    shuffleEnabledRef.current = shuffleEnabled;
  }, [shuffleEnabled]);

  const getAudio = useCallback((slot: AudioSlot) => {
    return slot === 0 ? audioARef.current : audioBRef.current;
  }, []);

  const commitCurrentIndex = useCallback((index: number) => {
    currentIndexRef.current = index;
    if (mountedRef.current) setCurrentIndex(index);
  }, []);

  const commitPlaying = useCallback((playing: boolean) => {
    isPlayingRef.current = playing;
    if (mountedRef.current) setIsPlaying(playing);
  }, []);

  const assignSlot = useCallback((slot: AudioSlot, trackIndex: number | null) => {
    const audio = getAudio(slot);
    if (!audio) return false;

    if (trackIndex === null || !tracksRef.current[trackIndex]) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      slotTrackIndexesRef.current[slot] = null;
      return false;
    }

    const nextSource = tracksRef.current[trackIndex].audioUrl;
    if (
      slotTrackIndexesRef.current[slot] === trackIndex &&
      audio.getAttribute("src") === nextSource
    ) {
      return true;
    }

    audio.pause();
    audio.src = nextSource;
    audio.load();
    slotTrackIndexesRef.current[slot] = trackIndex;
    return true;
  }, [getAudio]);

  const getRandomIndex = useCallback((current: number) => {
    const trackCount = tracksRef.current.length;
    if (trackCount < 2) return current;
    const randomValues = new Uint32Array(1);
    window.crypto.getRandomValues(randomValues);
    const offset = 1 + (randomValues[0] % (trackCount - 1));
    return (current + offset) % trackCount;
  }, []);

  const prepareStandby = useCallback(() => {
    if (transitionRef.current || transitionStartingRef.current) return;
    const current = currentIndexRef.current;
    const trackCount = tracksRef.current.length;
    const shuffledIndex = shuffleEnabledRef.current
      ? getRandomIndex(current)
      : undefined;
    const nextIndex = resolveQueuedTrackIndex({
      currentIndex: current,
      trackCount,
      intent: "automatic",
      repeatMode: repeatModeRef.current,
      shuffleEnabled: shuffleEnabledRef.current,
      shuffledIndex,
    });
    const standbySlot = otherSlot(activeSlotRef.current);
    preparedAutomaticIndexRef.current = nextIndex;
    assignSlot(standbySlot, nextIndex);
  }, [assignSlot, getRandomIndex]);

  useEffect(() => {
    prepareStandbyRef.current = prepareStandby;
  }, [prepareStandby]);

  const ensureAudioGraph = useCallback(async () => {
    let audioContext = audioContextRef.current;
    if (!audioContext) {
      const audioA = audioARef.current;
      const audioB = audioBRef.current;
      if (!audioA || !audioB) throw new Error("Audio channels are unavailable.");

      audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -8;
      analyser.smoothingTimeConstant = 0.76;

      ([audioA, audioB] as const).forEach((audio, index) => {
        const source = audioContext!.createMediaElementSource(audio);
        const gain = audioContext!.createGain();
        gain.gain.value = index === activeSlotRef.current ? 1 : 0;
        source.connect(gain);
        gain.connect(analyser);
        sourceNodesRef.current[index] = source;
        gainNodesRef.current[index] = gain;
      });
      analyser.connect(audioContext.destination);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
    }

    if (audioContext.state === "suspended") await audioContext.resume();
    return audioContext;
  }, []);

  const setSlotGain = useCallback((slot: AudioSlot, value: number) => {
    const gain = gainNodesRef.current[slot];
    const context = audioContextRef.current;
    if (!gain || !context) return;
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setValueAtTime(value, context.currentTime);
  }, []);

  const finishTransition = useCallback((prepareNext = true) => {
    const transition = transitionRef.current;
    if (!transition) return;
    window.clearTimeout(transition.timeoutId);

    const outgoingAudio = getAudio(transition.outgoing);
    const incomingAudio = getAudio(transition.incoming);
    setSlotGain(transition.outgoing, 0);
    setSlotGain(transition.incoming, 1);
    outgoingAudio?.pause();
    if (outgoingAudio) outgoingAudio.currentTime = 0;
    activeSlotRef.current = transition.incoming;
    transitionRef.current = null;
    transitionStartingRef.current = false;

    if (incomingAudio && !incomingAudio.paused) {
      commitPlaying(true);
      if (mountedRef.current) setPlayerState("PLAYING");
    }
    if (prepareNext) prepareStandbyRef.current();
  }, [commitPlaying, getAudio, setSlotGain]);

  const switchDirectly = useCallback(async (trackIndex: number, play: boolean) => {
    const track = tracksRef.current[trackIndex];
    if (!track) return;
    if (transitionRef.current) finishTransition(false);

    const slot = activeSlotRef.current;
    const audio = getAudio(slot);
    if (!audio || !assignSlot(slot, trackIndex)) return;
    commitCurrentIndex(trackIndex);
    setCurrentTime(0);
    setDuration(track.durationSeconds);
    preparedAutomaticIndexRef.current = null;
    setSlotGain(slot, 1);
    setSlotGain(otherSlot(slot), 0);

    if (!play) {
      commitPlaying(false);
      setPlayerState("READY");
      prepareStandbyRef.current();
      return;
    }

    setPlayerState("LOADING");
    try {
      await ensureAudioGraph();
      await audio.play();
      commitPlaying(true);
      setPlayerState("PLAYING");
      prepareStandbyRef.current();
    } catch {
      commitPlaying(false);
      setPlayerState("PLAYBACK ERROR");
    }
  }, [assignSlot, commitCurrentIndex, commitPlaying, ensureAudioGraph, finishTransition, getAudio, setSlotGain]);

  const startTransition = useCallback(async (targetIndex: number) => {
    if (!tracksRef.current[targetIndex] || transitionStartingRef.current) return;
    transitionStartingRef.current = true;
    if (transitionRef.current) finishTransition(false);

    const outgoing = activeSlotRef.current;
    const incoming = otherSlot(outgoing);
    const outgoingAudio = getAudio(outgoing);
    const incomingAudio = getAudio(incoming);
    if (!outgoingAudio || !incomingAudio) {
      transitionStartingRef.current = false;
      return;
    }

    if (slotTrackIndexesRef.current[incoming] !== targetIndex) {
      assignSlot(incoming, targetIndex);
    }
    incomingAudio.currentTime = 0;

    if (incomingAudio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      setPlayerState("LOADING");
    }

    try {
      const context = await ensureAudioGraph();
      setSlotGain(incoming, 0);
      await incomingAudio.play();

      activeSlotRef.current = incoming;
      commitCurrentIndex(targetIndex);
      setCurrentTime(incomingAudio.currentTime);
      setDuration(
        Number.isFinite(incomingAudio.duration) && incomingAudio.duration > 0
          ? incomingAudio.duration
          : tracksRef.current[targetIndex].durationSeconds,
      );
      commitPlaying(true);
      setPlayerState("PLAYING");

      if (outgoingAudio.paused || outgoingAudio.ended) {
        setSlotGain(outgoing, 0);
        setSlotGain(incoming, 1);
        transitionStartingRef.current = false;
        prepareStandbyRef.current();
        return;
      }

      const startTime = context.currentTime;
      const outgoingGain = gainNodesRef.current[outgoing];
      const incomingGain = gainNodesRef.current[incoming];
      if (!outgoingGain || !incomingGain) throw new Error("Audio gains are unavailable.");

      outgoingGain.gain.cancelScheduledValues(startTime);
      incomingGain.gain.cancelScheduledValues(startTime);
      outgoingGain.gain.setValueAtTime(Math.max(0, outgoingGain.gain.value), startTime);
      incomingGain.gain.setValueAtTime(0, startTime);
      outgoingGain.gain.setValueCurveAtTime(OUTGOING_CURVE, startTime, CROSSFADE_SECONDS);
      incomingGain.gain.setValueCurveAtTime(INCOMING_CURVE, startTime, CROSSFADE_SECONDS);

      const timeoutId = window.setTimeout(
        () => finishTransition(true),
        CROSSFADE_SECONDS * 1000,
      );
      transitionRef.current = { outgoing, incoming, timeoutId };
      transitionStartingRef.current = false;
    } catch {
      incomingAudio.pause();
      setSlotGain(incoming, 0);
      transitionStartingRef.current = false;
      if (!outgoingAudio.paused && !outgoingAudio.ended) {
        activeSlotRef.current = outgoing;
        commitPlaying(true);
        setPlayerState("PLAYING");
      } else {
        commitPlaying(false);
        setPlayerState("PLAYBACK ERROR");
      }
    }
  }, [assignSlot, commitCurrentIndex, commitPlaying, ensureAudioGraph, finishTransition, getAudio, setSlotGain]);

  useEffect(() => {
    startTransitionRef.current = startTransition;
  }, [startTransition]);

  const togglePlayback = useCallback(async () => {
    if (tracksRef.current.length === 0) return;
    if (transitionRef.current) finishTransition(false);
    const activeSlot = activeSlotRef.current;
    const audio = getAudio(activeSlot);
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      commitPlaying(false);
      setPlayerState("PAUSED");
      return;
    }

    if (slotTrackIndexesRef.current[activeSlot] !== currentIndexRef.current) {
      assignSlot(activeSlot, currentIndexRef.current);
    }
    setPlayerState("LOADING");
    try {
      await ensureAudioGraph();
      setSlotGain(activeSlot, 1);
      setSlotGain(otherSlot(activeSlot), 0);
      await audio.play();
      commitPlaying(true);
      setPlayerState("PLAYING");
      prepareStandbyRef.current();
    } catch {
      commitPlaying(false);
      setPlayerState("PLAYBACK ERROR");
    }
  }, [assignSlot, commitPlaying, ensureAudioGraph, finishTransition, getAudio, setSlotGain]);

  const selectTrack = useCallback(async (trackIndex: number, play = true) => {
    if (!tracksRef.current[trackIndex]) return;
    if (trackIndex === currentIndexRef.current) {
      if (play) await togglePlayback();
      return;
    }

    if (isPlayingRef.current && play) {
      await startTransitionRef.current(trackIndex);
    } else {
      await switchDirectly(trackIndex, play);
    }
  }, [switchDirectly, togglePlayback]);

  const changeBy = useCallback(async (direction: -1 | 1) => {
    const current = currentIndexRef.current;
    const shuffledIndex = direction === 1 && shuffleEnabledRef.current
      ? getRandomIndex(current)
      : undefined;
    const target = resolveQueuedTrackIndex({
      currentIndex: current,
      trackCount: tracksRef.current.length,
      intent: direction === 1 ? "next" : "previous",
      repeatMode: repeatModeRef.current,
      shuffleEnabled: shuffleEnabledRef.current,
      shuffledIndex,
    });
    if (target === null || target === current) return;
    await selectTrack(target, isPlayingRef.current);
  }, [getRandomIndex, selectTrack]);

  const seekTo = useCallback((value: number) => {
    if (!Number.isFinite(value)) return;
    if (transitionRef.current) finishTransition(false);
    const audio = getAudio(activeSlotRef.current);
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
    prepareStandbyRef.current();
  }, [finishTransition, getAudio]);

  const handleTimeUpdate = useCallback((slot: AudioSlot, audio: HTMLAudioElement) => {
    if (slot !== activeSlotRef.current) return;
    setCurrentTime(audio.currentTime);
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }

    const nextIndex = preparedAutomaticIndexRef.current;
    const standby = otherSlot(slot);
    const standbyAudio = getAudio(standby);
    if (
      shouldStartCrossfade(
        audio.currentTime,
        audio.duration,
        nextIndex !== null,
        Boolean(transitionRef.current) || transitionStartingRef.current,
      ) &&
      nextIndex !== null &&
      slotTrackIndexesRef.current[standby] === nextIndex &&
      standbyAudio &&
      standbyAudio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
    ) {
      void startTransitionRef.current(nextIndex);
    }
  }, [getAudio]);

  const handleEnded = useCallback((slot: AudioSlot) => {
    if (transitionRef.current?.outgoing === slot) return;
    if (slot !== activeSlotRef.current) return;
    const nextIndex = preparedAutomaticIndexRef.current;
    if (nextIndex === null) {
      const audio = getAudio(slot);
      if (audio) audio.currentTime = 0;
      setCurrentTime(0);
      commitPlaying(false);
      setPlayerState("READY");
      return;
    }
    void startTransitionRef.current(nextIndex);
  }, [commitPlaying, getAudio]);

  const handleCanPlayEvent = useCallback((
    slot: AudioSlot,
    event: SyntheticEvent<HTMLAudioElement>,
  ) => {
    const audio = event.currentTarget;
    if (slot === activeSlotRef.current) {
      if (!audio.paused) setPlayerState("PLAYING");
      return;
    }
    const activeSlot = activeSlotRef.current;
    const activeAudio = getAudio(activeSlot);
    if (activeAudio) handleTimeUpdate(activeSlot, activeAudio);
  }, [getAudio, handleTimeUpdate]);

  const handleErrorEvent = useCallback((slot: AudioSlot) => {
    if (slot !== activeSlotRef.current) return;
    commitPlaying(false);
    setPlayerState("PLAYBACK ERROR");
  }, [commitPlaying]);

  const handleLoadedMetadataEvent = useCallback((
    slot: AudioSlot,
    event: SyntheticEvent<HTMLAudioElement>,
  ) => {
    if (slot !== activeSlotRef.current) return;
    const nextDuration = event.currentTarget.duration;
    if (Number.isFinite(nextDuration)) setDuration(nextDuration);
  }, []);

  const handlePauseEvent = useCallback((
    slot: AudioSlot,
    event: SyntheticEvent<HTMLAudioElement>,
  ) => {
    if (
      slot === activeSlotRef.current &&
      !event.currentTarget.ended &&
      !transitionRef.current &&
      !transitionStartingRef.current
    ) {
      commitPlaying(false);
      setPlayerState("PAUSED");
    }
  }, [commitPlaying]);

  const handlePlayEvent = useCallback((slot: AudioSlot) => {
    if (slot !== activeSlotRef.current) return;
    commitPlaying(true);
    setPlayerState("PLAYING");
  }, [commitPlaying]);

  const handleWaitingEvent = useCallback((slot: AudioSlot) => {
    if (slot === activeSlotRef.current) setPlayerState("LOADING");
  }, []);

  const disconnectAudioGraph = useCallback(() => {
    sourceNodesRef.current.forEach((source) => source?.disconnect());
    gainNodesRef.current.forEach((gain) => gain?.disconnect());
    analyserRef.current?.disconnect();
    if (audioContextRef.current) void audioContextRef.current.close();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (tracksRef.current[0]) {
      assignSlot(0, 0);
      commitCurrentIndex(0);
      prepareStandbyRef.current();
    }

    const audioA = audioARef.current;
    const audioB = audioBRef.current;
    return () => {
      mountedRef.current = false;
      if (transitionRef.current) {
        window.clearTimeout(transitionRef.current.timeoutId);
        transitionRef.current = null;
      }
      [audioA, audioB].forEach((audio) => {
        if (!audio) return;
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      });
      disconnectAudioGraph();
    };
  }, [assignSlot, commitCurrentIndex, disconnectAudioGraph]);

  useEffect(() => {
    prepareStandby();
  }, [currentIndex, prepareStandby, repeatMode, shuffleEnabled]);

  return {
    analyserRef,
    audioARef,
    audioBRef,
    audioEvents: {
      onCanPlay: handleCanPlayEvent,
      onEnded: handleEnded,
      onError: handleErrorEvent,
      onLoadedMetadata: handleLoadedMetadataEvent,
      onPause: handlePauseEvent,
      onPlay: handlePlayEvent,
      onTimeUpdate: handleTimeUpdate,
      onWaiting: handleWaitingEvent,
    },
    changeBy,
    currentIndex,
    currentTime,
    duration,
    isPlaying,
    playerState,
    seekTo,
    selectTrack,
    togglePlayback,
  };
}
