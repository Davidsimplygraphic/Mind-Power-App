export type ExerciseItem = {
  number: number;
  text: string;
  bullets: string[];
};

export function parseExerciseText(exerciseText: string | null | undefined) {
  const normalizedText = exerciseText?.replace(/\r/g, "").trim() ?? "";

  if (!normalizedText) {
    return [] as ExerciseItem[];
  }

  const lines = normalizedText.split("\n");
  const items: ExerciseItem[] = [];
  let currentItem: ExerciseItem | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);

    if (numberedMatch) {
      currentItem = {
        number: Number(numberedMatch[1]),
        text: numberedMatch[2].trim(),
        bullets: [],
      };
      items.push(currentItem);
      continue;
    }

    if (!currentItem) {
      continue;
    }

    if (line.startsWith("- ")) {
      currentItem.bullets.push(line.slice(2).trim());
      continue;
    }

    currentItem.text = `${currentItem.text} ${line}`.trim();
  }

  return items;
}
