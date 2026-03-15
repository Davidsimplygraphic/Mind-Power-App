import { PrivateAudioPlayer } from "@/components/private-audio-player";
import { getAudioTitleFromPath, isWmaAudioPath, normalizeAudioPath } from "@/lib/audio";

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

export function AudioCard({
  title,
  tracks,
}: AudioCardProps) {
  const canonicalTrack = tracks.find((track) => track.isCanonical) ?? tracks[0] ?? null;
  const canonicalAudioPath = normalizeAudioPath(canonicalTrack?.path ?? null);
  const isCanonicalWma = isWmaAudioPath(canonicalAudioPath);
  const canonicalLabel = getAudioTitleFromPath(canonicalAudioPath);

  return (
    <section className="surface space-y-4 p-5">
      <div className="space-y-1">
        <p className="eyebrow">Week Audio</p>
        <h2 className="text-2xl">{canonicalLabel ?? title}</h2>
        {canonicalLabel ? (
          <p className="text-sm text-[var(--muted)]">{title}</p>
        ) : null}
      </div>

      {tracks.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            All of this week&apos;s audio is listed below in order. The canonical
            weekly track is marked clearly.
            {isCanonicalWma
              ? " The canonical track is still stored as WMA, so playback may depend on browser support."
              : null}
          </p>

          <div className="space-y-4">
            {tracks.map((track) => {
              const normalizedTrackPath = normalizeAudioPath(track.path);
              const isWmaTrack = isWmaAudioPath(normalizedTrackPath);

              return (
                <div
                  className="surface-muted space-y-3 p-4"
                  key={track.path}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-[var(--foreground)]">
                        {track.title}
                      </p>
                      <p className="break-all font-mono text-xs text-[var(--muted)]">
                        {normalizedTrackPath}
                      </p>
                    </div>
                    {track.isCanonical ? (
                      <div className="secondary-button min-h-0 px-3 py-1 text-xs">
                        Canonical
                      </div>
                    ) : null}
                  </div>

                  {track.audioUrl ? (
                    <PrivateAudioPlayer
                      sourcePath={normalizedTrackPath}
                      src={track.audioUrl}
                    />
                  ) : (
                    <div className="text-sm text-[var(--muted)]">
                      No public audio URL could be created for this path.
                    </div>
                  )}

                  {isWmaTrack ? (
                    <p className="text-sm text-[var(--muted)]">
                      This track is stored as WMA, so browser playback may be limited.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="surface-muted space-y-3 p-4 text-sm text-[var(--muted)]">
          <p>
            Audio is unavailable right now because no week audio files are configured
            for this week.
          </p>
          <p>Add the exact storage object paths for this week.</p>
        </div>
      )}
    </section>
  );
}
