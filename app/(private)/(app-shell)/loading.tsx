export default function AppShellLoading() {
  return (
    <div className="space-y-6">
      <section className="surface space-y-4 p-6">
        <p className="eyebrow">Loading</p>
        <div className="h-10 w-1/2 rounded-full bg-white/60" />
        <div className="h-5 w-full rounded-full bg-white/50" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface-muted h-36" />
        <div className="surface-muted h-36" />
        <div className="surface-muted h-36" />
      </section>
    </div>
  );
}
