type HomeHeroProps = {
  onOpenDetector: () => void;
};

export function HomeHero({ onOpenDetector }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85 p-8 shadow-sm sm:p-10">
      <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-brand-clay/30 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-brand-moss/10 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-moss/20 bg-brand-moss/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-brand-moss">
            Recycle smarter
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-brand-ink sm:text-5xl lg:text-6xl">
            Sort waste with a cleaner, faster recycling detector.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
            Recycle Right helps you quickly identify what belongs in recycling
            and what does not. Use the detector for live camera checks, quick
            snapshots, or uploaded images.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              className="rounded-full bg-brand-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              onClick={onOpenDetector}
              type="button"
            >
              Open Recycle Detector
            </button>
            <button
              className="rounded-full border border-brand-ink px-6 py-3 text-sm font-medium text-brand-ink transition hover:bg-brand-cream"
              onClick={onOpenDetector}
              type="button"
            >
              Try Live Camera
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-stone-200 bg-brand-cream/70 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-moss">
              What it does
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-brand-ink">
              Detect items and guide disposal decisions.
            </p>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              The detector is built for quick everyday checks when you are not
              sure whether something should go in recycling or landfill.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-stone-200 bg-white/90 p-5 shadow-sm">
              <p className="text-3xl font-semibold text-brand-ink">3 ways</p>
              <p className="mt-2 text-sm text-stone-600">
                Live stream, snapshot camera, and image upload.
              </p>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white/90 p-5 shadow-sm">
              <p className="text-3xl font-semibold text-brand-ink">1 goal</p>
              <p className="mt-2 text-sm text-stone-600">
                Make the right disposal choice with less guesswork.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
