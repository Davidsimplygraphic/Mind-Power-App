import { getMindPowerWeekNote } from "@/lib/week-notes";

type WeekNotesPanelProps = {
  weekNumber: number;
  weekTitle: string;
};

export function WeekNotesPanel({ weekNumber, weekTitle }: WeekNotesPanelProps) {
  const note = getMindPowerWeekNote(weekNumber);

  if (!note) {
    return (
      <div className="surface-muted space-y-2 p-5 text-sm text-[var(--muted)]">
        <p>No PDF notes are mapped for this week yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--muted)]">
        Read {weekTitle}&apos;s notes in-app, or open/download if your browser&apos;s PDF
        embed is limited.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          className="secondary-button min-h-0 px-4 py-2 text-sm"
          href={note.publicPath}
          rel="noreferrer"
          target="_blank"
        >
          Open PDF
        </a>
        <a
          className="secondary-button min-h-0 px-4 py-2 text-sm"
          download
          href={note.publicPath}
          rel="noreferrer"
          target="_blank"
        >
          Download PDF
        </a>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
        <iframe
          className="h-[64vh] min-h-[420px] w-full"
          src={`${note.publicPath}#view=FitH`}
          title={`${weekTitle} notes`}
        />
      </div>
      <p className="text-xs text-[var(--muted)]">Source file: {note.sourceFilename}</p>
    </div>
  );
}
