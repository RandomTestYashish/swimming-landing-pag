import { Arrow } from '../shared/Arrow';

export function HeroOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="hero__overlay">
      <div className="hero__copy">
        <p className="hero__label">Swimming, simplified</p>
        <h1 className="hero__title">Learn to move through water with confidence.</h1>
        <p className="hero__sub">
          A calm, structured method for adults starting from the beginning. One movement at a time.
        </p>
        <button className="hero__cta" onClick={onStart}>
          <span>Explore the method</span>
          <Arrow />
        </button>
      </div>
    </div>
  );
}
