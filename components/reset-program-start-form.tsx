import { resetProgramStartAction } from "@/app/actions/program";
import { SubmitButton } from "@/components/submit-button";

type ResetProgramStartFormProps = {
  className?: string;
  formClassName?: string;
  pendingLabel?: string;
  children?: React.ReactNode;
};

export function ResetProgramStartForm({
  className = "secondary-button w-full sm:w-auto",
  formClassName = "w-full sm:w-auto",
  pendingLabel = "Clearing today's start...",
  children = "Start Tomorrow Instead",
}: ResetProgramStartFormProps) {
  return (
    <form
      action={resetProgramStartAction}
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
