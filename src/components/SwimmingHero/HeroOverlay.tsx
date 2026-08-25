export function HeroOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="hero__overlay">
      <div className="hero__copy">
        <p className="hero__label">Swimming, simplified</p>
        <h1 className="hero__title">Learn to move through water with confidence.</h1>
        <p className="hero__sub">
          A calm, structured method for adults starting from the beginning — one movement at a time.
        </p>
        <button className="hero__cta" onClick={onStart}>
          <span>Explore the method</span>
          <svg viewBox="0 0 26 8" aria-hidden="true" focusable="false">
            <path d="M0 4h22M18.4 0.7 22 4l-3.6 3.3" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
      <p className="hero__cue" aria-hidden="true"><i />Scroll</p>
    </div>
  );
}
