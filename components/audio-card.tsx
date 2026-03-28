"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { isWmaAudioPath, normalizeAudioPath } from "@/lib/audio";

type AudioTrack = {
  path: string;
  title: string;
  audioUrl: string | null;
  isCanonical: boolean;
};

type AudioCardProps = {
  title: string;
  tracks: AudioTrack[];
};

export function AudioCard({ title, tracks }: AudioCardProps) {
  const playableTracks = tracks.filter((t) => t.audioUrl);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = playableTracks[currentIndex] ?? null;
  const isWmaTrack = isWmaAudioPath(normalizeAudioPath(currentTrack?.path ?? null));

  const goToTrack = useCallback(
    (index: number) => {
      setHasError(false);
      setCurrentIndex(Math.max(0, Math.min(index, playableTracks.length - 1)));
    },
    [playableTracks.length],
  );

  // When current track changes, load and autoplay it (if audio was already playing)
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack?.audioUrl) {
      return;
    }

    const wasPlaying = !audio.paused;

    audio.src = currentTrack.audioUrl;
    audio.load();

    if (wasPlaying) {
      audio.play().catch(() => undefined);
    }
  }, [currentIndex, currentTrack?.audioUrl]);

  function handleEnded() {
    if (currentIndex < playableTracks.length - 1) {
      const nextIndex = currentIndex + 1;
      setHasError(false);
      setCurrentIndex(nextIndex);

      // Small delay to let the src swap settle, then play
      setTimeout(() => {
        const audio = audioRef.current;

        if (audio && playableTracks[nextIndex]?.audioUrl) {
          audio.src = playableTracks[nextIndex].audioUrl!;
          audio.load();
          audio.play().catch(() => undefined);
        }
      }, 50);
    }
  }

  if (playableTracks.length === 0) {
    return (
      <div className="surface-muted space-y-3 p-4 text-sm text-[var(--muted)]">
        <p>Audio is unavailable right now because no audio files are configured for this week.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="eyebrow">Week Audio</p>
        <h2 className="text-2xl">{title}</h2>
      </div>

      {/* Current track player */}
      <div className="surface-muted space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {currentTrack?.title}
            </p>
            <p className="text-xs text-[var(--muted)]">
              Track {currentIndex + 1} of {playableTracks.length}
            </p>
          </div>
          {currentTrack?.isCanonical ? (
            <div className="secondary-button min-h-0 px-3 py-1 text-xs">Canonical</div>
          ) : null}
        </div>

        {hasError ? (
          <div className="space-y-2 text-sm text-[var(--muted)]">
            <p>
              {isWmaTrack
                ? "This file is stored as WMA — browser playback may not be supported."
                : "This file could not be played in this browser."}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                className="secondary-button min-h-0 px-4 py-2 text-sm"
                href={currentTrack?.audioUrl ?? "#"}
                rel="noreferrer"
                target="_blank"
              >
                Open File
              </a>
              <a
                className="secondary-button min-h-0 px-4 py-2 text-sm"
                download
                href={currentTrack?.audioUrl ?? "#"}
                rel="noreferrer"
                target="_blank"
              >
                Download
              </a>
            </div>
          </div>
        ) : (
          <audio
            className="w-full"
            controls
            onEnded={handleEnded}
            onError={() => setHasError(true)}
            preload="none"
            ref={audioRef}
            src={currentTrack?.audioUrl ?? ""}
          >
            Your browser does not support audio playback.
          </audio>
        )}

        {isWmaTrack && !hasError ? (
          <p className="text-xs text-[var(--muted)]">
            WMA format — playback depends on browser support.
          </p>
        ) : null}
      </div>

      {/* Track list */}
      {playableTracks.length > 1 ? (
        <div className="space-y-2">
          <p className="eyebrow px-1">All Tracks</p>
          <div className="space-y-1">
            {playableTracks.map((track, idx) => (
              <button
                className={`w-full rounded-2xl px-4 py-3 text-left transition-colors ${
                  idx === currentIndex
                    ? "bg-[var(--accent)] text-white"
                    : "surface-muted hover:bg-[rgba(0,0,0,0.04)]"
                }`}
                key={track.path}
                onClick={() => goToTrack(idx)}
                type="button"
              >
                <span className="text-sm font-semibold">{track.title}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
