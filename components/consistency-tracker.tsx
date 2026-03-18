import {
  createConsistencyItemAction,
  setConsistencyItemStatusAction,
  setConsistencyTodayCompletionAction,
} from "@/app/actions/program";
import { SubmitButton } from "@/components/submit-button";
import type { ConsistencyItem, ConsistencyLog } from "@/lib/types";

type ConsistencyTrackerProps = {
  items: ConsistencyItem[];
  logsForToday: ConsistencyLog[];
  todayDate: string;
};

export function ConsistencyTracker({
  items,
  logsForToday,
  todayDate,
}: ConsistencyTrackerProps) {
  const activeItems = items.filter((item) => item.is_active);
  const inactiveItems = items.filter((item) => !item.is_active);
  const completionMap = new Map(
    logsForToday.map((log) => [log.consistency_item_id, log.completed]),
  );

  return (
    <section className="surface space-y-5 p-6">
      <div className="space-y-2">
        <p className="eyebrow">Consistency Tracker</p>
        <h2 className="text-3xl">What I am becoming consistent with</h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Keep this list personal and practical. Mark what you completed today (
          {todayDate}).
        </p>
      </div>

      <form
        action={createConsistencyItemAction}
        className="surface-muted space-y-3 p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="field-label"
              htmlFor="consistency_title"
            >
              New consistency point
            </label>
            <input
              className="field"
              id="consistency_title"
              maxLength={80}
              name="title"
              placeholder="Meditation"
              required
              type="text"
            />
          </div>
          <div className="space-y-2">
            <label
              className="field-label"
              htmlFor="consistency_description"
            >
              Short description (optional)
            </label>
            <input
              className="field"
              id="consistency_description"
              maxLength={140}
              name="description"
              placeholder="10 minutes after waking"
              type="text"
            />
          </div>
        </div>
        <SubmitButton
          className="secondary-button w-full sm:w-auto"
          pendingLabel="Adding item..."
        >
          Add Consistency Point
        </SubmitButton>
      </form>

      {activeItems.length === 0 ? (
        <div className="surface-muted space-y-2 p-5 text-sm text-[var(--muted)]">
          <p>No active consistency points yet.</p>
          <p>
            Add one above to start tracking your personal daily consistency alongside
            the Mind Power flow.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeItems.map((item) => {
            const isCompleted = completionMap.get(item.id) === true;

            return (
              <div
                className="surface-muted flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={item.id}
              >
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className="text-sm leading-6 text-[var(--muted)]">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <form action={setConsistencyTodayCompletionAction}>
                    <input
                      name="consistency_item_id"
                      type="hidden"
                      value={item.id}
                    />
                    <input
                      name="completed"
                      type="hidden"
                      value={isCompleted ? "false" : "true"}
                    />
                    <SubmitButton
                      className={
                        isCompleted
                          ? "secondary-button min-h-0 px-4 py-2 text-sm"
                          : "primary-button min-h-0 px-4 py-2 text-sm"
                      }
                      pendingLabel={isCompleted ? "Updating..." : "Saving..."}
                    >
                      {isCompleted ? "Completed Today" : "Mark Complete"}
                    </SubmitButton>
                  </form>
                  <form action={setConsistencyItemStatusAction}>
                    <input
                      name="consistency_item_id"
                      type="hidden"
                      value={item.id}
                    />
                    <input
                      name="is_active"
                      type="hidden"
                      value="false"
                    />
                    <SubmitButton
                      className="text-sm text-[var(--muted)] underline decoration-[rgba(53,83,67,0.25)] underline-offset-4"
                      pendingLabel="Updating..."
                    >
                      Set Inactive
                    </SubmitButton>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {inactiveItems.length > 0 ? (
        <details className="surface-muted p-5">
          <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--foreground)]">
            Inactive items ({inactiveItems.length})
          </summary>
          <div className="mt-4 space-y-3">
            {inactiveItems.map((item) => (
              <div
                className="flex flex-col gap-2 border-t border-[var(--line)] pt-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                key={item.id}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-[var(--foreground)]">{item.title}</p>
                  {item.description ? (
                    <p className="text-sm text-[var(--muted)]">{item.description}</p>
                  ) : null}
                </div>
                <form action={setConsistencyItemStatusAction}>
                  <input
                    name="consistency_item_id"
                    type="hidden"
                    value={item.id}
                  />
                  <input
                    name="is_active"
                    type="hidden"
                    value="true"
                  />
                  <SubmitButton
                    className="secondary-button min-h-0 px-4 py-2 text-sm"
                    pendingLabel="Updating..."
                  >
                    Reactivate
                  </SubmitButton>
                </form>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
