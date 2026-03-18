import { NoticeBanner } from "@/components/notice-banner";
import { PrivateAudioPlayer } from "@/components/private-audio-player";
import { WeekNotesPanel } from "@/components/week-notes-panel";
import {
  getAudioTitleFromPath,
  isWmaAudioPath,
  normalizeAudioPath,
} from "@/lib/audio";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getPublicAudioUrl, getUserProgramSnapshot } from "@/lib/data";
import { getMindPowerWeekAudioTracks } from "@/lib/mind-power-audio-catalog";

export default async function LibraryPage() {
  const user = await requireAuthenticatedUser();
  const snapshot = await getUserProgramSnapshot(user.id);

  if (!snapshot.program) {
    return (
      <NoticeBanner
        message="Mind Power content is missing from the database. Verify that the program and week content were seeded successfully."
        tone="error"
      />
    );
  }

  const weeksWithAudio = snapshot.weeks.map((week) => {
    const canonicalAudioPath = normalizeAudioPath(week.audio_path);
    const canonicalAudioUrl = getPublicAudioUrl(canonicalAudioPath);
    const allAudioTracks = getMindPowerWeekAudioTracks(week.week_number).map((track) => ({
      ...track,
      audioUrl: getPublicAudioUrl(track.path),
      isCanonical: canonicalAudioPath === track.path,
    }));

    return {
      ...week,
      canonicalAudioPath,
      canonicalAudioTitle: getAudioTitleFromPath(canonicalAudioPath),
      canonicalAudioUrl,
      allAudioTracks,
    };
  });

  return (
    <div className="space-y-6">
      <section className="surface space-y-3 p-6">
        <div className="space-y-3">
          <p className="eyebrow">Library</p>
          <h2 className="text-4xl">All four weeks, in one calm place.</h2>
          <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
            Each week includes canonical audio, full audio uploads, PDF notes, and
            exercise text in one focused view.
          </p>
        </div>
      </section>

      {snapshot.weeks.length < 4 ? (
        <NoticeBanner
          message={`Only ${snapshot.weeks.length} of 4 program weeks are loaded. Add the missing weeks to complete the library.`}
          tone="error"
        />
      ) : null}

      {weeksWithAudio.length === 0 ? (
        <section className="surface space-y-4 p-6">
          <p className="eyebrow">No Week Content</p>
          <h3 className="text-3xl">The library is empty right now.</h3>
          <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
            Add the four `program_weeks` rows for Mind Power before using the
            library.
          </p>
        </section>
      ) : null}

      <div className="grid gap-6">
        {weeksWithAudio.map((week) => {
          const isCurrentWeek = snapshot.metrics?.currentWeek === week.week_number;
          const isWmaSource = isWmaAudioPath(week.canonicalAudioPath);

          return (
            <section
              className="surface space-y-5 p-6"
              key={week.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="eyebrow">Week {week.week_number}</p>
                  <h3 className="text-3xl">{week.title ?? `Week ${week.week_number}`}</h3>
                </div>
                {isCurrentWeek ? (
                  <div className="secondary-button whitespace-nowrap px-4">Current week</div>
                ) : null}
              </div>

              <div className="space-y-3">
                <p className="eyebrow">Canonical Weekly Audio</p>
                <div className="surface-muted space-y-3 p-5">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {week.canonicalAudioTitle ?? "No canonical audio path set"}
                    </p>
                    {week.canonicalAudioPath ? (
                      <p className="break-all font-mono text-xs text-[var(--muted)]">
                        {week.canonicalAudioPath}
                      </p>
                    ) : null}
                  </div>
                  {week.canonicalAudioUrl ? (
                    <PrivateAudioPlayer
                      sourcePath={week.canonicalAudioPath}
                      src={week.canonicalAudioUrl}
                    />
                  ) : (
                    <div className="space-y-2 text-sm text-[var(--muted)]">
                      <p>
                        No canonical `audio_path` is set for this week yet, so the
                        session page cannot surface a week-start track.
                      </p>
                    </div>
                  )}
                  {isWmaSource ? (
                    <p className="text-sm text-[var(--muted)]">
                      This canonical track is stored as WMA, so browser playback may
                      still be limited.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <details className="surface-muted p-5">
                  <summary className="cursor-pointer list-none text-base font-semibold text-[var(--foreground)]">
                    Full audio list ({week.allAudioTracks.length} tracks)
                  </summary>
                  <div className="mt-4 space-y-4">
                    {week.allAudioTracks.length > 0 ? (
                      week.allAudioTracks.map((track) => (
                        <div
                          className="space-y-3 border-t border-[var(--line)] pt-4 first:border-t-0 first:pt-0"
                          key={track.path}
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                              <p className="text-base font-semibold text-[var(--foreground)]">
                                {track.title}
                              </p>
                              <p className="break-all font-mono text-xs text-[var(--muted)]">
                                {track.path}
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
                              sourcePath={track.path}
                              src={track.audioUrl}
                            />
                          ) : (
                            <div className="text-sm text-[var(--muted)]">
                              No public audio URL could be created for this path.
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--muted)]">
                        No uploaded audio files were detected for this week in the
                        verified catalog.
                      </p>
                    )}
                  </div>
                </details>
              </div>

              <div className="space-y-3">
                <p className="eyebrow">PDF Notes</p>
                <details className="surface-muted p-5">
                  <summary className="cursor-pointer list-none text-base font-semibold text-[var(--foreground)]">
                    Open Week {week.week_number} Notes
                  </summary>
                  <div className="mt-4">
                    <WeekNotesPanel
                      weekNumber={week.week_number}
                      weekTitle={week.title ?? `Week ${week.week_number}`}
                    />
                  </div>
                </details>
              </div>

              <div className="space-y-3">
                <p className="eyebrow">Exercises</p>
                <div className="surface-muted p-5">
                  <p className="whitespace-pre-wrap text-base leading-8">
                    {week.exercise_text?.trim() ||
                      "Exercise text is missing for this week. Update the matching program_weeks row to add it."}
                  </p>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
