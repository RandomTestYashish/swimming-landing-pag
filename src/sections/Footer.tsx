import { Arrow } from '../components/shared/Arrow';
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
            <Arrow back />
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
