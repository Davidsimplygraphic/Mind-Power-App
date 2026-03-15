type NoticeBannerProps = {
  message: string;
  tone?: "info" | "error";
};

export function NoticeBanner({ message, tone = "info" }: NoticeBannerProps) {
  return (
    <div
      className={`rounded-3xl border px-4 py-3 text-sm ${
        tone === "error"
          ? "border-[rgba(159,90,51,0.22)] bg-[rgba(159,90,51,0.08)] text-[var(--warning)]"
          : "border-[var(--line)] bg-white/70 text-[var(--muted)]"
      }`}
      role={tone === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  );
}
