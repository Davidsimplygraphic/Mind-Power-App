"use client";

import { useState } from "react";

import { isWmaAudioPath, normalizeAudioPath } from "@/lib/audio";

type PrivateAudioPlayerProps = {
  src: string;
  className?: string;
  sourcePath?: string | null;
};

export function PrivateAudioPlayer({
  src,
  className = "w-full",
  sourcePath = null,
}: PrivateAudioPlayerProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasPlaybackError = failedSrc === src;
  const normalizedSourcePath = normalizeAudioPath(sourcePath);
  const isWmaSource = isWmaAudioPath(normalizedSourcePath);

  if (!src.trim()) {
    return (
      <div className="surface-muted space-y-2 p-4 text-sm text-[var(--muted)]">
        <p>This audio link is unavailable right now.</p>
        {normalizedSourcePath ? (
          <p>
            Current path:{" "}
            <span className="break-all font-mono text-xs">{normalizedSourcePath}</span>
          </p>
        ) : null}
      </div>
    );
  }

  if (hasPlaybackError) {
    return (
      <div className="surface-muted space-y-2 p-4 text-sm text-[var(--muted)]">
        <p>
          {isWmaSource
            ? "This audio file is a WMA file, and browser playback may be limited for this format."
            : "This audio file could not be played in this browser."}
        </p>
        {normalizedSourcePath ? (
          <p>
            Current path:{" "}
            <span className="break-all font-mono text-xs">{normalizedSourcePath}</span>
          </p>
        ) : null}
        <p>
          {isWmaSource
            ? "You can still open or download the file directly below."
            : "The public bucket object may be missing, or this browser may be blocking playback."}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            className="secondary-button min-h-0 px-4 py-2 text-sm"
            href={src}
            rel="noreferrer"
            target="_blank"
          >
            Open Audio File
          </a>
          <a
            className="secondary-button min-h-0 px-4 py-2 text-sm"
            download
            href={src}
            rel="noreferrer"
            target="_blank"
          >
            Download Audio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <audio
        className={className}
        controls
        onError={() => setFailedSrc(src)}
        preload="none"
        src={src}
      >
        Your browser does not support audio playback.
      </audio>
      {isWmaSource ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--muted)]">
            This week&apos;s audio is stored as a WMA file. Public playback may work in
            some browsers and fail in others.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              className="secondary-button min-h-0 px-4 py-2 text-sm"
              href={src}
              rel="noreferrer"
              target="_blank"
            >
              Open Audio File
            </a>
            <a
              className="secondary-button min-h-0 px-4 py-2 text-sm"
              download
              href={src}
              rel="noreferrer"
              target="_blank"
            >
              Download Audio
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
