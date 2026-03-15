import { restartProgramAction } from "@/app/actions/program";
import { SubmitButton } from "@/components/submit-button";

type RestartProgramFormProps = {
  className?: string;
  formClassName?: string;
  pendingLabel?: string;
  children?: React.ReactNode;
};

export function RestartProgramForm({
  className = "primary-button w-full sm:w-auto",
  formClassName = "w-full sm:w-auto",
  pendingLabel = "Restarting the program...",
  children = "Start the Program Again",
}: RestartProgramFormProps) {
  return (
    <form
      action={restartProgramAction}
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
