import './Footer.css';

export function Footer({ onRestart }: { onRestart: () => void }) {
  return (
    <footer className="ft">
      <div className="ft__in">
        <div className="ft__lead">
          <p className="eyebrow">Ready to get in?</p>
          <h2 className="ft__title">Start with one movement.<br />Then build from there.</h2>
          <button className="ft__cta" onClick={onRestart}>
            <span>Back to the surface</span>
            <svg viewBox="0 0 24 8" aria-hidden="true" focusable="false">
              <path d="M24 4H3M6.5 0.8 3 4l3.5 3.2" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>

        <div className="ft__meta">
          <p className="ft__note">
            This guide explains movement. It is not a substitute for lessons with a qualified
            instructor. Practise in supervised water you can stand up in.
          </p>
          <p className="ft__mark">
            <span>First</span><span>Float</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
