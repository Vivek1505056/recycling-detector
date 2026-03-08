type NavbarProps = {
  currentPage: 'home' | 'detector';
  onNavigate: (page: 'home' | 'detector') => void;
};

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const linkClassName = (page: 'home' | 'detector') =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      currentPage === page
        ? 'bg-brand-ink text-white shadow-sm'
        : 'text-brand-ink hover:bg-brand-cream'
    }`;

  return (
    <header className="rounded-3xl border border-stone-200 bg-white/85 px-5 py-4 shadow-sm backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="flex items-center gap-3 text-left"
          onClick={() => onNavigate('home')}
          type="button"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-moss/15 text-brand-moss">
            <svg
              aria-hidden="true"
              className="h-8 w-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="8.5"
                stroke="currentColor"
                strokeOpacity="0.22"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M11.6 4.8a.8.8 0 0 1 1.4 0l1.4 2.4h1.5a.7.7 0 0 1 .6 1l-1.8 3.2a.7.7 0 0 1-1.2-.7l1.1-2h-1.4a.8.8 0 0 1-.7-.4l-1.6-2.7a.8.8 0 0 1 .3-1.1Z"
              />
              <path
                d="M17.4 10a.8.8 0 0 1 .7.4l1.5 2.6a.8.8 0 0 1 0 .8l-1.5 2.7.8 1.2a.7.7 0 0 1-.6 1h-3.9a.7.7 0 0 1-.6-1 .7.7 0 0 1 .6-.4H17l1-1.8-1.6-2.8a.8.8 0 0 1 .3-1.1.8.8 0 0 1 .7-.1Z"
              />
              <path
                d="M8.8 18.7H5.7a.8.8 0 0 1-.7-.4l-1.5-2.6a.8.8 0 0 1 0-.8l1.5-2.7-.8-1.2a.7.7 0 0 1 .6-1h3.8a.7.7 0 0 1 .6 1 .7.7 0 0 1-.6.4H6.1l-1 1.8 1.6 2.8a.8.8 0 0 1-.3 1.1.8.8 0 0 1-.3.1h1.6l1.1 1.9Z"
              />
            </svg>
          </div>
          <p className="text-xl font-semibold tracking-tight text-brand-moss">
            Recycle Right
          </p>
        </button>

        <nav className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50/90 p-1">
          <button
            className={linkClassName('home')}
            onClick={() => onNavigate('home')}
            type="button"
          >
            Home
          </button>
          <button
            className={linkClassName('detector')}
            onClick={() => onNavigate('detector')}
            type="button"
          >
            Recycle Detector
          </button>
        </nav>
      </div>
    </header>
  );
}
