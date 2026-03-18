export type MindPowerWeekNote = {
  weekNumber: number;
  title: string;
  sourceFilename: string;
  publicPath: string;
};

const weekNotes: Record<number, MindPowerWeekNote> = {
  1: {
    weekNumber: 1,
    title: "Week 1 Print and Follow",
    sourceFilename: "Week 1- Print and Follow.pdf",
    publicPath: "/week-notes/week-1-print-and-follow.pdf",
  },
  2: {
    weekNumber: 2,
    title: "Week 2 Print and Follow",
    sourceFilename: "Week 2 - Print and Follow.pdf",
    publicPath: "/week-notes/week-2-print-and-follow.pdf",
  },
  3: {
    weekNumber: 3,
    title: "Week 3 Print and Follow",
    sourceFilename: "Week 3 - Print and Follow.pdf",
    publicPath: "/week-notes/week-3-print-and-follow.pdf",
  },
  4: {
    weekNumber: 4,
    title: "Week 4 Lecture Notes",
    sourceFilename: "Lecture 4 Notes New.pdf",
    publicPath: "/week-notes/week-4-lecture-notes.pdf",
  },
};

export function getMindPowerWeekNote(weekNumber: number) {
  return weekNotes[weekNumber] ?? null;
}
