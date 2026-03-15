"use client";

import { useSyncExternalStore } from "react";

import { submitSessionAction } from "@/app/actions/program";
import { SubmitButton } from "@/components/submit-button";

type SessionFormProps = {
  draftKey: string;
};

type SessionDraft = {
  exerciseCompleted: boolean;
  reflectionText: string;
  promiseKept: "" | "yes" | "no";
};

const emptyDraft: SessionDraft = {
  exerciseCompleted: false,
  reflectionText: "",
  promiseKept: "",
};

const draftEventName = "mind-power-session-draft";

function readDraft(draftKey: string): SessionDraft {
  if (typeof window === "undefined") {
    return emptyDraft;
  }

  const savedDraft = window.localStorage.getItem(draftKey);

  if (!savedDraft) {
    return emptyDraft;
  }

  try {
    const parsedDraft = JSON.parse(savedDraft) as Partial<SessionDraft>;

    return {
      exerciseCompleted: Boolean(parsedDraft.exerciseCompleted),
      reflectionText:
        typeof parsedDraft.reflectionText === "string" ? parsedDraft.reflectionText : "",
      promiseKept:
        parsedDraft.promiseKept === "yes" || parsedDraft.promiseKept === "no"
          ? parsedDraft.promiseKept
          : "",
    };
  } catch {
    window.localStorage.removeItem(draftKey);
    return emptyDraft;
  }
}

function subscribeToDraft(draftKey: string, callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === draftKey) {
      callback();
    }
  };

  const handleDraftChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ draftKey?: string }>;

    if (!customEvent.detail?.draftKey || customEvent.detail.draftKey === draftKey) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(draftEventName, handleDraftChange as EventListener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(draftEventName, handleDraftChange as EventListener);
  };
}

function isEmptyDraft(draft: SessionDraft) {
  return (
    draft.exerciseCompleted === emptyDraft.exerciseCompleted &&
    draft.reflectionText === emptyDraft.reflectionText &&
    draft.promiseKept === emptyDraft.promiseKept
  );
}

function writeDraft(draftKey: string, draft: SessionDraft) {
  if (typeof window === "undefined") {
    return;
  }

  if (isEmptyDraft(draft)) {
    window.localStorage.removeItem(draftKey);
  } else {
    window.localStorage.setItem(draftKey, JSON.stringify(draft));
  }

  window.dispatchEvent(
    new CustomEvent(draftEventName, {
      detail: { draftKey },
    }),
  );
}

export function SessionForm({ draftKey }: SessionFormProps) {
  const draft = useSyncExternalStore(
    (callback) => subscribeToDraft(draftKey, callback),
    () => readDraft(draftKey),
    () => emptyDraft,
  );

  return (
    <form
      action={submitSessionAction}
      className="space-y-5"
    >
      <label className="surface-muted flex items-start gap-3 p-4">
        <input
          checked={draft.exerciseCompleted}
          className="mt-1 h-4 w-4 rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
          name="exercise_completed"
          onChange={(event) =>
            writeDraft(draftKey, {
              ...draft,
              exerciseCompleted: event.target.checked,
            })
          }
          type="checkbox"
        />
        <span className="space-y-1">
          <span className="block text-sm font-semibold text-[var(--foreground)]">
            I completed today&apos;s exercise set.
          </span>
          <span className="block text-sm text-[var(--muted)]">
            A single check-in keeps the daily flow simple.
          </span>
        </span>
      </label>

      <div className="space-y-2">
        <label
          className="field-label"
          htmlFor="reflection_text"
        >
          Daily reflection
        </label>
        <textarea
          className="field min-h-36 resize-none"
          id="reflection_text"
          name="reflection_text"
          onChange={(event) =>
            writeDraft(draftKey, {
              ...draft,
              reflectionText: event.target.value,
            })
          }
          placeholder="What did you notice today?"
          value={draft.reflectionText}
        />
        <p className="text-sm text-[var(--muted)]">Optional. Keep it brief if that helps.</p>
      </div>

      <fieldset className="space-y-3">
        <legend className="field-label">Did you keep your word today?</legend>
        <label className="surface-muted flex items-center gap-3 p-4">
          <input
            checked={draft.promiseKept === "yes"}
            name="promise_kept"
            onChange={() =>
              writeDraft(draftKey, {
                ...draft,
                promiseKept: "yes",
              })
            }
            type="radio"
            value="yes"
          />
          <span>Yes, I kept it.</span>
        </label>
        <label className="surface-muted flex items-center gap-3 p-4">
          <input
            checked={draft.promiseKept === "no"}
            name="promise_kept"
            onChange={() =>
              writeDraft(draftKey, {
                ...draft,
                promiseKept: "no",
              })
            }
            type="radio"
            value="no"
          />
          <span>No, I did not.</span>
        </label>
        <button
          className="text-sm text-[var(--muted)] underline decoration-[rgba(53,83,67,0.25)] underline-offset-4"
          onClick={() =>
            writeDraft(draftKey, {
              ...draft,
              promiseKept: "",
            })
          }
          type="button"
        >
          Leave unanswered for today
        </button>
      </fieldset>

      <SubmitButton
        className="primary-button w-full"
        pendingLabel="Saving today's session..."
      >
        Submit Today&apos;s Session
      </SubmitButton>
    </form>
  );
}
