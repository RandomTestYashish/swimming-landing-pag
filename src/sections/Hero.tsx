import './Hero.css';

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="hero" id="top">
      <div className="hero__copy">
        <h1 className="hero__title">
          <span>A beginner&rsquo;s guide to the water</span>
          <span>One movement at a time</span>
        </h1>
        <button className="hero__cta" onClick={onStart}>
          <span>Start learning</span>
          <svg viewBox="0 0 24 8" aria-hidden="true" focusable="false">
            <path d="M0 4h21M17.5 0.8 21 4l-3.5 3.2" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>

      <p className="hero__scroll" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </p>
    </section>
  );
}
