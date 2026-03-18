"use client";

import { useState } from "react";

import { resetChallengeAction } from "@/app/actions/program";
import { SubmitButton } from "@/components/submit-button";

type ResetChallengeFormProps = {
  className?: string;
  formClassName?: string;
};

export function ResetChallengeForm({
  className = "w-full sm:w-auto rounded-full border border-[rgba(159,90,51,0.22)] bg-[rgba(159,90,51,0.08)] px-5 py-3 font-semibold text-[var(--warning)] transition hover:bg-[rgba(159,90,51,0.14)]",
  formClassName = "w-full sm:w-auto",
}: ResetChallengeFormProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <button
        className={className}
        onClick={() => setIsConfirming(true)}
        type="button"
      >
        Reset Challenge
      </button>
    );
  }

  return (
    <div className="surface-muted space-y-3 p-4">
      <p className="text-sm text-[var(--warning)]">
        This clears your current 28-day run and returns you to Day 1.
      </p>
      <form
        action={resetChallengeAction}
        className={`flex flex-col gap-3 sm:flex-row ${formClassName}`}
      >
        <input
          name="confirm_reset"
          type="hidden"
          value="yes"
        />
        <button
          className="secondary-button w-full sm:w-auto"
          onClick={() => setIsConfirming(false)}
          type="button"
        >
          Cancel
        </button>
        <SubmitButton
          className={className}
          pendingLabel="Resetting challenge..."
        >
          Confirm Reset
        </SubmitButton>
      </form>
    </div>
  );
}
