"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

type ExerciseTimerProps = {
  storageKey: string;
};

type TimerStatus = "idle" | "running" | "paused" | "complete";

type StoredTimerState = {
  selectedSeconds: number;
  remainingSeconds: number;
  status: TimerStatus;
  endAtMs: number | null;
};

const presetOptions = [60, 180, 300, 600, 900, 1200];
const defaultSeconds = 300;
const timerEventName = "mind-power-exercise-timer";

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function createDefaultState(selectedSeconds = defaultSeconds): StoredTimerState {
  return {
    selectedSeconds,
    remainingSeconds: selectedSeconds,
    status: "idle",
    endAtMs: null,
  };
}

const defaultTimerState = createDefaultState();
const timerSnapshotCache = new Map<string, StoredTimerState>();

function parseStoredState(value: string | null): StoredTimerState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<StoredTimerState>;
    const selectedSeconds = Number(parsed.selectedSeconds);
    const remainingSeconds = Number(parsed.remainingSeconds);
    const status = parsed.status;
    const endAtMs =
      typeof parsed.endAtMs === "number" && Number.isFinite(parsed.endAtMs)
        ? parsed.endAtMs
        : null;

    if (!presetOptions.includes(selectedSeconds)) {
      return null;
    }

    if (!Number.isFinite(remainingSeconds) || remainingSeconds < 0) {
      return null;
    }

    if (
      status !== "idle" &&
      status !== "running" &&
      status !== "paused" &&
      status !== "complete"
    ) {
      return null;
    }

    return {
      selectedSeconds,
      remainingSeconds: Math.min(Math.round(remainingSeconds), selectedSeconds),
      status,
      endAtMs,
    };
  } catch {
    return null;
  }
}

function readTimerState(storageKey: string): StoredTimerState {
  if (typeof window === "undefined") {
    return defaultTimerState;
  }

  const restoredState = parseStoredState(window.localStorage.getItem(storageKey));

  if (!restoredState) {
    return defaultTimerState;
  }

  if (restoredState.status === "running" && restoredState.endAtMs) {
    const remainingSeconds = Math.max(
      0,
      Math.ceil((restoredState.endAtMs - Date.now()) / 1000),
    );

    return {
      ...restoredState,
      remainingSeconds,
      status: remainingSeconds === 0 ? "complete" : "running",
      endAtMs: remainingSeconds === 0 ? null : restoredState.endAtMs,
    };
  }

  return restoredState;
}

function isSameTimerState(a: StoredTimerState, b: StoredTimerState) {
  return (
    a.selectedSeconds === b.selectedSeconds &&
    a.remainingSeconds === b.remainingSeconds &&
    a.status === b.status &&
    a.endAtMs === b.endAtMs
  );
}

function getCachedTimerSnapshot(storageKey: string): StoredTimerState {
  const nextSnapshot = readTimerState(storageKey);
  const cachedSnapshot = timerSnapshotCache.get(storageKey);

  if (cachedSnapshot && isSameTimerState(cachedSnapshot, nextSnapshot)) {
    return cachedSnapshot;
  }

  timerSnapshotCache.set(storageKey, nextSnapshot);
  return nextSnapshot;
}

function notifyTimerChange(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(timerEventName, {
      detail: { storageKey },
    }),
  );
}

function subscribeToTimer(storageKey: string, callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === storageKey) {
      callback();
    }
  };

  const handleTimerChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ storageKey?: string }>;

    if (!customEvent.detail?.storageKey || customEvent.detail.storageKey === storageKey) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(timerEventName, handleTimerChange as EventListener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(timerEventName, handleTimerChange as EventListener);
  };
}

function writeTimerState(storageKey: string, timerState: StoredTimerState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(timerState));
  notifyTimerChange(storageKey);
}

export function ExerciseTimer({ storageKey }: ExerciseTimerProps) {
  const timerState = useSyncExternalStore<StoredTimerState>(
    (callback) => subscribeToTimer(storageKey, callback),
    () => getCachedTimerSnapshot(storageKey),
    () => defaultTimerState,
  );

  useEffect(() => {
    if (timerState.status !== "running" || !timerState.endAtMs) {
      return;
    }

    const interval = window.setInterval(() => notifyTimerChange(storageKey), 1000);

    return () => window.clearInterval(interval);
  }, [storageKey, timerState.endAtMs, timerState.status]);

  useEffect(() => {
    const storedState = parseStoredState(
      typeof window === "undefined" ? null : window.localStorage.getItem(storageKey),
    );

    if (storedState?.status === "running" && timerState.status === "complete") {
      writeTimerState(storageKey, timerState);
    }
  }, [storageKey, timerState]);

  const completionLabel = useMemo(() => {
    if (timerState.status === "complete") {
      return "Time complete";
    }

    if (timerState.status === "running") {
      return "Timer running";
    }

    if (timerState.status === "paused") {
      return "Paused";
    }

    return "Ready when you are";
  }, [timerState.status]);

  function handlePresetSelect(nextSeconds: number) {
    writeTimerState(storageKey, createDefaultState(nextSeconds));
  }

  function handleStart() {
    const remainingSeconds =
      timerState.remainingSeconds > 0
        ? timerState.remainingSeconds
        : timerState.selectedSeconds;

    writeTimerState(storageKey, {
      ...timerState,
      remainingSeconds,
      status: "running",
      endAtMs: Date.now() + remainingSeconds * 1000,
    });
  }

  function handlePause() {
    if (timerState.status !== "running" || !timerState.endAtMs) {
      return;
    }

    const remainingSeconds = Math.max(
      0,
      Math.ceil((timerState.endAtMs - Date.now()) / 1000),
    );

    writeTimerState(storageKey, {
      ...timerState,
      remainingSeconds,
      status: remainingSeconds === 0 ? "complete" : "paused",
      endAtMs: null,
    });
  }

  function handleResume() {
    writeTimerState(storageKey, {
      ...timerState,
      status: "running",
      endAtMs: Date.now() + timerState.remainingSeconds * 1000,
    });
  }

  function handleReset() {
    writeTimerState(storageKey, createDefaultState(timerState.selectedSeconds));
  }

  const canStart = timerState.status === "idle" || timerState.status === "complete";
  const canPause = timerState.status === "running";
  const canResume = timerState.status === "paused";
  const canReset = timerState.status !== "running";

  return (
    <section className="surface space-y-5 p-6">
      <div className="space-y-1">
        <p className="eyebrow">Exercise Timer</p>
        <h2 className="text-2xl">Give the practice a clear container.</h2>
        <p className="text-sm text-[var(--muted)]">
          This timer stays with this day in this browser, even if you refresh.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {presetOptions.map((seconds) => {
          const isActive = timerState.selectedSeconds === seconds;

          return (
            <button
              className={
                isActive
                  ? "primary-button min-h-0 px-4 py-2 text-sm"
                  : "secondary-button min-h-0 px-4 py-2 text-sm"
              }
              disabled={timerState.status === "running"}
              key={seconds}
              onClick={() => handlePresetSelect(seconds)}
              type="button"
            >
              {seconds / 60} min
            </button>
          );
        })}
      </div>

      <div className="surface-muted space-y-3 p-5 text-center">
        <p className="font-serif text-5xl tracking-[-0.06em] text-[var(--foreground)]">
          {formatSeconds(timerState.remainingSeconds)}
        </p>
        <p
          aria-live="polite"
          className="text-sm text-[var(--muted)]"
        >
          {completionLabel}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {canStart ? (
          <button
            className="primary-button min-h-0 px-5 py-3"
            onClick={handleStart}
            type="button"
          >
            Start
          </button>
        ) : null}
        {canPause ? (
          <button
            className="secondary-button min-h-0 px-5 py-3"
            onClick={handlePause}
            type="button"
          >
            Pause
          </button>
        ) : null}
        {canResume ? (
          <button
            className="primary-button min-h-0 px-5 py-3"
            onClick={handleResume}
            type="button"
          >
            Resume
          </button>
        ) : null}
        <button
          className="secondary-button min-h-0 px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canReset}
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
