import type { Lesson } from '../data/lessons';
import './ProgressNavigation.css';

type Props = {
  lessons: Lesson[];
  active: number;
  onJump: (index: number) => void;
};

/**
 * The lesson rail. It is the page's only persistent wayfinding, so it
 * answers both questions at once: which chapter is open, and how far
 * through the course that is.
 */
export function ProgressNavigation({ lessons, active, onJump }: Props) {
  const current = lessons[Math.min(active, lessons.length - 1)];

  return (
    <div className="prog">
      <div className="prog__in">
        <span className="prog__count">
          <b>{current.id}</b>
          <i>/</i>
          <span>{String(lessons.length).padStart(2, '0')}</span>
        </span>
        <span className="prog__label" aria-live="polite">{current.label}</span>

        <ol className="prog__rail">
          {lessons.map((l, i) => (
            <li key={l.id} className={`prog__step${i === active ? ' is-active' : ''}${i < active ? ' is-done' : ''}`}>
              <button onClick={() => onJump(i)} aria-current={i === active ? 'step' : undefined}>
                <span className="visually-hidden">{`Chapter ${l.id}, ${l.label}`}</span>
                <span className="prog__dot" aria-hidden="true" />
                <span className="prog__tip" aria-hidden="true">{l.label}</span>
              </button>
              {i < lessons.length - 1 && <span className="prog__link" aria-hidden="true" />}
            </li>
          ))}
        </ol>

        <span className="prog__rule" aria-hidden="true">
          <i style={{ transform: `scaleX(${(active + 1) / lessons.length})` }} />
        </span>
      </div>
    </div>
  );
}
