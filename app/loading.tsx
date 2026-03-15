export default function RootLoading() {
  return (
    <div className="page-wrap flex min-h-screen items-center px-4 py-8">
      <section className="surface mx-auto w-full max-w-3xl space-y-4 p-6 md:p-8">
        <p className="eyebrow">Loading</p>
        <div className="h-10 w-2/3 rounded-full bg-white/60" />
        <div className="h-5 w-full rounded-full bg-white/50" />
        <div className="h-5 w-4/5 rounded-full bg-white/50" />
      </section>
    </div>
  );
}
