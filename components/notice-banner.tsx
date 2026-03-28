type NoticeBannerProps = {
  message: string;
  tone?: "info" | "error";
};

export function NoticeBanner({ message, tone = "info" }: NoticeBannerProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        tone === "error"
          ? "notice-banner-error"
          : "notice-banner-info"
      }`}
      role={tone === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  );
}
