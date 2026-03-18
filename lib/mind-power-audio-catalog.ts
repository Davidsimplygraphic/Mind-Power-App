import { getAudioTitleFromPath } from "@/lib/audio";

export type MindPowerAudioTrack = {
  weekNumber: number;
  path: string;
  title: string;
};

const mindPowerWeekAudioPaths: Record<number, string[]> = {
  1: [
    "Week 1/01 Introduction to Mind Power.mp3",
    "Week 1/02 Conditions for Mind Power.mp3",
    "Week 1/03 The Six Laws Explained.mp3",
    "Week 1/04 All is law.mp3",
    "Week 1/05 The Six Laws.mp3",
    "Week 1/06 The Conscious Mind.mp3",
    "Week 1/07 Negatives.mp3",
    "Week 1/08 Concentration and Contemplation.mp3",
    "Week 1/09 Inner and Outer Worlds.mp3",
    "Week 1/10 Exercises for the Week.mp3",
  ],
  2: [
    "Week 2/01 Know Thyself.mp3",
    "Week 2/02 Doing the Exercises.mp3",
    "Week 2/03 The Mind as a Garden.mp3",
    "Week 2/04 Cultivating the Conscious Mind.mp3",
    "Week 2/05 Seeding.mp3",
    "Week 2/06 Visualization.mp3",
    "Week 2/07 Exercises for the Week.mp3",
  ],
  3: [
    "Week 3/01 Understanding the System.mp3",
    "Week 3/02 Decision, Action, Persistence.mp3",
    "Week 3/03 Thoughts and Health.mp3",
    "Week 3/04 Affirmations.mp3",
    "Week 3/05 Acknowledging.mp3",
    "Week 3/06 Setting up a Creating Period.mp3",
    "Week 3/07 Exercises for the Week.mp3",
  ],
  4: [
    "Week 4/01 Developing Mind Power Habits.mp3",
    "Week 4/02 Goals.mp3",
    "Week 4/03 Contacting the Subconscious Mind.mp3",
    "Week 4/04 The Six Laws Expanded.mp3",
    "Week 4/05 Self Image.mp3",
    "Week 4/06 You are Unique.mp3",
  ],
};

export function getMindPowerCanonicalAudioPath(weekNumber: number) {
  const weekAudioPaths = mindPowerWeekAudioPaths[weekNumber] ?? [];
  const weeklyExercisesPath = weekAudioPaths.find((path) =>
    getAudioTitleFromPath(path)?.toLowerCase().includes("exercises for the week"),
  );

  if (weeklyExercisesPath) {
    return weeklyExercisesPath;
  }

  if (weekNumber === 4) {
    return "Week 4/03 Contacting the Subconscious Mind.mp3";
  }

  return null;
}

export function getMindPowerWeekAudioTracks(weekNumber: number): MindPowerAudioTrack[] {
  const weekAudioPaths = mindPowerWeekAudioPaths[weekNumber] ?? [];

  return weekAudioPaths.map((path) => ({
    weekNumber,
    path,
    title: getAudioTitleFromPath(path) ?? path,
  }));
}
