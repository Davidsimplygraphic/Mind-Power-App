"use client";

import { useEffect, useSyncExternalStore } from "react";

import type { ExerciseItem } from "@/lib/exercises";

type ExerciseChecklistProps = {
  items: ExerciseItem[];
  storageKey: string;
};

function createEmptyState(length: number) {
  return Array.from({ length }, () => false);
}

const checklistEventName = "mind-power-exercise-checklist";
const checklistSnapshotCache = new Map<string, boolean[]>();
const checklistServerSnapshotCache = new Map<number, boolean[]>();

function isSameChecklistState(a: boolean[], b: boolean[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function readChecklistState(storageKey: string, length: number) {
  const emptyState = createEmptyState(length);

  if (typeof window === "undefined") {
    return emptyState;
  }

  const savedState = window.localStorage.getItem(storageKey);

  if (!savedState) {
    return emptyState;
  }

  try {
    const parsedState = JSON.parse(savedState) as unknown;

    if (!Array.isArray(parsedState)) {
      return emptyState;
    }

    return emptyState.map((_, index) => Boolean(parsedState[index]));
  } catch {
    window.localStorage.removeItem(storageKey);
    return emptyState;
  }
}

function getCachedChecklistSnapshot(storageKey: string, length: number) {
  const nextSnapshot = readChecklistState(storageKey, length);
  const cacheKey = `${storageKey}:${length}`;
  const cachedSnapshot = checklistSnapshotCache.get(cacheKey);

  if (cachedSnapshot && isSameChecklistState(cachedSnapshot, nextSnapshot)) {
    return cachedSnapshot;
  }

  checklistSnapshotCache.set(cacheKey, nextSnapshot);
  return nextSnapshot;
}

function getServerChecklistSnapshot(length: number) {
  const cachedSnapshot = checklistServerSnapshotCache.get(length);

  if (cachedSnapshot) {
    return cachedSnapshot;
  }

  const nextSnapshot = createEmptyState(length);
  checklistServerSnapshotCache.set(length, nextSnapshot);
  return nextSnapshot;
}

function notifyChecklistChange(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(checklistEventName, {
      detail: { storageKey },
    }),
  );
}

function subscribeToChecklist(storageKey: string, callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === storageKey) {
      callback();
    }
  };

  const handleChecklistChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ storageKey?: string }>;

    if (!customEvent.detail?.storageKey || customEvent.detail.storageKey === storageKey) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(checklistEventName, handleChecklistChange as EventListener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(checklistEventName, handleChecklistChange as EventListener);
  };
}

function writeChecklistState(storageKey: string, state: boolean[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(state));
  notifyChecklistChange(storageKey);
}

export function ExerciseChecklist({
  items,
  storageKey,
}: ExerciseChecklistProps) {
  const completedItems = useSyncExternalStore<boolean[]>(
    (callback) => subscribeToChecklist(storageKey, callback),
    () => getCachedChecklistSnapshot(storageKey, items.length),
    () => getServerChecklistSnapshot(items.length),
  );

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(completedItems));
  }, [completedItems, storageKey]);

  const completedCount = completedItems.filter(Boolean).length;

  function toggleItem(index: number) {
    writeChecklistState(
      storageKey,
      completedItems.map((isCompleted, currentIndex) =>
        currentIndex === index ? !isCompleted : isCompleted,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-[var(--muted)]">
          Mark each exercise as you work through it. This progress is saved in
          this browser for today&apos;s session.
        </p>
        <p className="text-sm font-semibold text-[var(--foreground)]">
          {completedCount} of {items.length} exercises marked complete
        </p>
      </div>

      <ol className="space-y-3">
        {items.map((item, index) => (
          <li
            className="surface-muted p-4"
            key={`${item.number}-${item.text}`}
          >
            <label className="flex items-start gap-3">
              <input
                checked={completedItems[index] ?? false}
                className="mt-1 h-4 w-4 rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
                onChange={() => toggleItem(index)}
                type="checkbox"
              />
              <span className="space-y-2">
                <span className="block text-base leading-7 text-[var(--foreground)]">
                  <span className="font-semibold">{item.number}.</span> {item.text}
                </span>
                {item.bullets.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted)]">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </span>
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}
