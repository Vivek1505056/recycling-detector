import type { APIResponse } from '../types/api';

type DetectionResultCardProps = {
  result: APIResponse['result'];
  onRetry: () => void;
  hideRetry?: boolean;
};

export function DetectionResultCard({
  result,
  onRetry,
  hideRetry = false,
}: DetectionResultCardProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-stone-500">
            Detection Result
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-brand-ink">
            {result.label}
          </h2>
        </div>
        <div
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            result.is_recyclable
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {result.is_recyclable ? 'Recyclable' : 'Not recyclable'}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
            Confidence
          </p>
          <p className="mt-2 text-lg font-semibold text-brand-ink">
            {(result.confidence * 100).toFixed(1)}%
          </p>
        </div>
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
            Explanation
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {result.explanation}
          </p>
        </div>
      </div>

      {!hideRetry ? (
        <button
          className="mt-6 rounded-full border border-brand-ink px-5 py-3 text-sm font-medium text-brand-ink transition hover:bg-brand-cream"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      ) : null}
    </section>
  );
}

