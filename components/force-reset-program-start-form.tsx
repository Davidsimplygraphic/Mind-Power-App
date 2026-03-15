import { forceResetProgramStartAction } from "@/app/actions/program";
import { SubmitButton } from "@/components/submit-button";

type ForceResetProgramStartFormProps = {
  className?: string;
  formClassName?: string;
  pendingLabel?: string;
  children?: React.ReactNode;
};

export function ForceResetProgramStartForm({
  className = "w-full sm:w-auto rounded-full border border-[rgba(159,90,51,0.22)] bg-[rgba(159,90,51,0.08)] px-5 py-3 font-semibold text-[var(--warning)] transition hover:bg-[rgba(159,90,51,0.14)]",
  formClassName = "w-full sm:w-auto",
  pendingLabel = "Clearing Day 1...",
  children = "Force Reset Day 1",
}: ForceResetProgramStartFormProps) {
  return (
    <form
      action={forceResetProgramStartAction}
      className={formClassName}
    >
      <SubmitButton
        className={className}
        pendingLabel={pendingLabel}
      >
        {children}
      </SubmitButton>
    </form>
  );
}
