type HomeIntroProps = {
  onSelectMode: (mode: 'camera' | 'upload') => void;
};

export function HomeIntro({ onSelectMode }: HomeIntroProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white/85 p-8 shadow-sm">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-moss">
          AI Smart Recycler
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-brand-ink sm:text-5xl">
          Recycle Right
        </h1>
        <p className="mt-4 text-base leading-7 text-stone-600">
          Upload an image or use your camera to check whether an item is recyclable, compostable, or landfill. 
          Let's make recycling smarter and easier together!
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-full bg-brand-ink px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            onClick={() => onSelectMode('camera')}
            type="button"
          >
            Use Camera
          </button>
          <button
            className="rounded-full border border-brand-ink px-5 py-3 text-sm font-medium text-brand-ink transition hover:bg-brand-cream"
            onClick={() => onSelectMode('upload')}
            type="button"
          >
            Upload Image
          </button>
        </div>
      </div>
    </section>
  );
}

