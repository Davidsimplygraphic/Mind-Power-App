"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { upsertExerciseResponseAction } from "@/app/actions/exercises";
import type {
  ChecklistSection,
  ExerciseContent,
  ExerciseSection,
  PromptSection,
} from "@/lib/exercise-content";
import type { ExerciseResponse } from "@/lib/types";

type ExerciseWorkbookProps = {
  content: ExerciseContent;
  dayNumber: number;
  programId: string;
  timerStorageKey: string;
  userProgramId: string;
  weekNumber: number;
  initialResponses: ExerciseResponse[];
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

type ChecklistSelectionMap = Record<string, boolean>;

type SavePayload = {
  responseText: string | null;
  responseJson: unknown | null;
};

const saveDebounceMs = 700;
const saveStatusResetMs = 1400;
const timerEventName = "mind-power-exercise-timer";
const timerPresetSeconds = [60, 180, 300, 600, 900, 1200];
const saveTimeoutRegistry = new Map<string, number>();
const saveStatusTimeoutRegistry = new Map<string, number>();

function toResponseMap(initialResponses: ExerciseResponse[]) {
  return new Map(initialResponses.map((response) => [response.section_id, response]));
}

function getCheckedIdsFromResponseJson(
  responseJson: ExerciseResponse["response_json"],
): string[] {
  if (!responseJson || typeof responseJson !== "object") {
    return [];
  }

  const checkedItemIds = (responseJson as { checkedItemIds?: unknown }).checkedItemIds;

  if (!Array.isArray(checkedItemIds)) {
    return [];
  }

  return checkedItemIds.filter((value): value is string => typeof value === "string");
}

function getInitialPromptValues(
  sections: ExerciseSection[],
  responseMap: Map<string, ExerciseResponse>,
) {
  const nextValues: Record<string, string> = {};

  for (const section of sections) {
    if (section.type !== "prompt") {
      continue;
    }

    nextValues[section.id] = responseMap.get(section.id)?.response_text ?? "";
  }

  return nextValues;
}

function getInitialChecklistValues(
  sections: ExerciseSection[],
  responseMap: Map<string, ExerciseResponse>,
) {
  const nextValues: Record<string, ChecklistSelectionMap> = {};

  for (const section of sections) {
    if (section.type !== "checklist") {
      continue;
    }

    const checkedIds = new Set(
      getCheckedIdsFromResponseJson(responseMap.get(section.id)?.response_json ?? null),
    );

    nextValues[section.id] = section.items.reduce<ChecklistSelectionMap>((map, item) => {
      map[item.id] = checkedIds.has(item.id);
      return map;
    }, {});
  }

  return nextValues;
}

function saveStatusLabel(status: SaveStatus) {
  if (status === "saving") {
    return "Saving...";
  }

  if (status === "saved") {
    return "Saved";
  }

  if (status === "error") {
    return "Save failed";
  }

  return "Autosave on";
}

function getCheckedItemIds(selectionMap: ChecklistSelectionMap | undefined) {
  if (!selectionMap) {
    return [] as string[];
  }

  return Object.entries(selectionMap)
    .filter(([, isChecked]) => isChecked)
    .map(([itemId]) => itemId);
}

function renderPromptField(
  section: PromptSection,
  value: string,
  onChange: (nextValue: string) => void,
) {
  if (section.multiline ?? true) {
    return (
      <textarea
        className="field min-h-36 resize-y"
        id={section.id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={section.placeholder ?? "Write your response here."}
        value={value}
      />
    );
  }

  return (
    <input
      className="field"
      id={section.id}
      onChange={(event) => onChange(event.target.value)}
      placeholder={section.placeholder ?? "Write your response here."}
      type="text"
      value={value}
    />
  );
}

export function ExerciseWorkbook({
  content,
  dayNumber,
  programId,
  timerStorageKey,
  userProgramId,
  weekNumber,
  initialResponses,
}: ExerciseWorkbookProps) {
  const responseMap = useMemo(() => toResponseMap(initialResponses), [initialResponses]);
  const [promptValues, setPromptValues] = useState<Record<string, string>>(() =>
    getInitialPromptValues(content.sections, responseMap),
  );
  const [checklistValues, setChecklistValues] = useState<
    Record<string, ChecklistSelectionMap>
  >(() => getInitialChecklistValues(content.sections, responseMap));
  const [saveStatusBySection, setSaveStatusBySection] = useState<Record<string, SaveStatus>>(
    {},
  );
  const instanceId = useId();
  const timeoutKeyPrefix = `${instanceId}:`;

  useEffect(() => {
    return () => {
      for (const [timeoutKey, timeoutId] of saveTimeoutRegistry.entries()) {
        if (!timeoutKey.startsWith(timeoutKeyPrefix)) {
          continue;
        }

        window.clearTimeout(timeoutId);
        saveTimeoutRegistry.delete(timeoutKey);
      }

      for (const [timeoutKey, timeoutId] of saveStatusTimeoutRegistry.entries()) {
        if (!timeoutKey.startsWith(timeoutKeyPrefix)) {
          continue;
        }

        window.clearTimeout(timeoutId);
        saveStatusTimeoutRegistry.delete(timeoutKey);
      }
    };
  }, [timeoutKeyPrefix]);

  async function persistSection(sectionId: string, payload: SavePayload) {
    const result = await upsertExerciseResponseAction({
      dayNumber,
      programId,
      responseJson: payload.responseJson,
      responseText: payload.responseText,
      sectionId,
      userProgramId,
      weekNumber,
    });

    return result.ok;
  }

  function getTimeoutKey(sectionId: string) {
    return `${timeoutKeyPrefix}${sectionId}`;
  }

  function scheduleSectionSave(sectionId: string, payload: SavePayload) {
    const timeoutKey = getTimeoutKey(sectionId);
    const existingSaveTimeoutId = saveTimeoutRegistry.get(timeoutKey);

    if (existingSaveTimeoutId) {
      window.clearTimeout(existingSaveTimeoutId);
    }

    setSaveStatusBySection((currentState) => ({
      ...currentState,
      [sectionId]: "saving",
    }));

    const saveTimeoutId = window.setTimeout(async () => {
      const wasSuccessful = await persistSection(sectionId, payload);
      saveTimeoutRegistry.delete(timeoutKey);

      setSaveStatusBySection((currentState) => ({
        ...currentState,
        [sectionId]: wasSuccessful ? "saved" : "error",
      }));

      if (!wasSuccessful) {
        return;
      }

      const existingStatusTimeoutId = saveStatusTimeoutRegistry.get(timeoutKey);

      if (existingStatusTimeoutId) {
        window.clearTimeout(existingStatusTimeoutId);
      }

      const statusTimeoutId = window.setTimeout(() => {
        saveStatusTimeoutRegistry.delete(timeoutKey);
        setSaveStatusBySection((currentState) => ({
          ...currentState,
          [sectionId]: "idle",
        }));
      }, saveStatusResetMs);

      saveStatusTimeoutRegistry.set(timeoutKey, statusTimeoutId);
    }, saveDebounceMs);

    saveTimeoutRegistry.set(timeoutKey, saveTimeoutId);
  }

  function handlePromptChange(sectionId: string, nextValue: string) {
    setPromptValues((currentState) => ({
      ...currentState,
      [sectionId]: nextValue,
    }));

    scheduleSectionSave(sectionId, {
      responseJson: null,
      responseText: nextValue,
    });
  }

  function handleChecklistToggle(section: ChecklistSection, itemId: string) {
    const currentSectionValues = checklistValues[section.id] ?? {};
    const nextSectionValues: ChecklistSelectionMap = {
      ...currentSectionValues,
      [itemId]: !currentSectionValues[itemId],
    };
    const checkedItemIds = getCheckedItemIds(nextSectionValues).filter((checkedId) =>
      section.items.some((item) => item.id === checkedId),
    );

    setChecklistValues((currentState) => ({
      ...currentState,
      [section.id]: nextSectionValues,
    }));

    scheduleSectionSave(section.id, {
      responseJson:
        checkedItemIds.length > 0
          ? {
              checkedItemIds,
            }
          : null,
      responseText: null,
    });
  }

  function loadSuggestedTimer(minutes: number | undefined) {
    if (!minutes || minutes <= 0) {
      return;
    }

    const suggestedSeconds = Math.round(minutes * 60);
    const selectedSeconds = timerPresetSeconds.includes(suggestedSeconds)
      ? suggestedSeconds
      : 300;
    const timerState = {
      selectedSeconds,
      remainingSeconds: selectedSeconds,
      status: "idle",
      endAtMs: null,
    };

    window.localStorage.setItem(timerStorageKey, JSON.stringify(timerState));
    window.dispatchEvent(
      new CustomEvent(timerEventName, {
        detail: { storageKey: timerStorageKey },
      }),
    );
  }

  return (
    <div className="space-y-4">
      <div className="surface-muted space-y-3 p-5">
        <p className="eyebrow">Week {content.weekNumber} Workbook</p>
        <h3 className="text-2xl">{content.title}</h3>
        {content.intro ? (
          <p className="text-base leading-7 text-[var(--muted)]">{content.intro}</p>
        ) : null}
        <p className="text-sm text-[var(--muted)]">
          Responses save automatically for this day (Day {dayNumber}).
        </p>
      </div>

      {content.sections.map((section) => {
        if (section.type === "text") {
          return (
            <article
              className="surface-muted space-y-2 p-5"
              key={section.id}
            >
              {section.title ? <h4 className="text-xl">{section.title}</h4> : null}
              <p className="whitespace-pre-wrap text-base leading-8 text-[var(--foreground)]">
                {section.content}
              </p>
            </article>
          );
        }

        if (section.type === "prompt") {
          const sectionStatus = saveStatusBySection[section.id] ?? "idle";

          return (
            <article
              className="surface-muted space-y-3 p-5"
              key={section.id}
            >
              <div className="space-y-1">
                <h4 className="text-xl">{section.title ?? "Prompt"}</h4>
                <p className="text-sm leading-6 text-[var(--muted)]">{section.prompt}</p>
              </div>

              <div className="space-y-2">
                <label
                  className="field-label"
                  htmlFor={section.id}
                >
                  Your response
                </label>
                {renderPromptField(
                  section,
                  promptValues[section.id] ?? "",
                  (nextValue) => handlePromptChange(section.id, nextValue),
                )}
                <p className="text-xs text-[var(--muted)]">{saveStatusLabel(sectionStatus)}</p>
              </div>
            </article>
          );
        }

        if (section.type === "checklist") {
          const checkedItemIds = getCheckedItemIds(checklistValues[section.id]);
          const sectionStatus = saveStatusBySection[section.id] ?? "idle";

          return (
            <article
              className="surface-muted space-y-4 p-5"
              key={section.id}
            >
              <div className="space-y-1">
                <h4 className="text-xl">{section.title ?? "Checklist"}</h4>
                <p className="text-sm text-[var(--muted)]">
                  {checkedItemIds.length} of {section.items.length} marked complete
                </p>
              </div>

              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li
                    className="rounded-2xl border border-[rgba(34,48,40,0.08)] bg-white/70 p-4"
                    key={item.id}
                  >
                    <label className="flex items-start gap-3">
                      <input
                        checked={Boolean(checklistValues[section.id]?.[item.id])}
                        className="mt-1 h-4 w-4 rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        onChange={() => handleChecklistToggle(section, item.id)}
                        type="checkbox"
                      />
                      <span className="text-base leading-7 text-[var(--foreground)]">
                        {item.label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-[var(--muted)]">{saveStatusLabel(sectionStatus)}</p>
            </article>
          );
        }

        return (
          <article
            className="surface-muted space-y-3 p-5"
            key={section.id}
          >
            <div className="space-y-1">
              <h4 className="text-xl">{section.title ?? "Practice Timer"}</h4>
              <p className="text-sm leading-6 text-[var(--muted)]">{section.label}</p>
            </div>
            {section.suggestedMinutes ? (
              <button
                className="secondary-button min-h-0 px-4 py-2 text-sm"
                onClick={() => loadSuggestedTimer(section.suggestedMinutes)}
                type="button"
              >
                Load {section.suggestedMinutes}-minute timer
              </button>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
