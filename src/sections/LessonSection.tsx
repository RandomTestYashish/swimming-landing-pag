import { forwardRef } from 'react';
import type { Lesson } from '../data/lessons';
import './LessonSection.css';

type Props = { lesson: Lesson; index: number; onNext: () => void; isLast: boolean; deep: boolean };

/**
 * One chapter. Deliberately mostly empty: the stage behind it is doing the
 * explaining, and the panel only says what the swimmer is working on.
 */
export const LessonSection = forwardRef<HTMLElement, Props>(function LessonSection(
  { lesson, index, onNext, isLast, deep },
  ref
) {
  const side = index % 2 === 0 ? 'left' : 'right';

  return (
    <section
      className={`lesson lesson--${side}${deep ? ' is-deep' : ''}`}
      id={`chapter-${lesson.id}`}
      ref={ref}
      aria-labelledby={`chapter-${lesson.id}-title`}
    >
      <div className="lesson__panel">
        <p className="lesson__meta">
          <span className="lesson__num">{lesson.id}</span>
          <span className="lesson__rule" aria-hidden="true" />
          <span className="eyebrow">{lesson.label}</span>
        </p>

        <h2 className="lesson__title" id={`chapter-${lesson.id}-title`}>{lesson.title}</h2>
        <p className="lesson__statement">{lesson.statement}</p>

        <dl className="lesson__notes">
          {lesson.notes.map((n) => (
            <div key={n.k}>
              <dt>{n.k}</dt>
              <dd>{n.v}</dd>
            </div>
          ))}
        </dl>

        {!isLast && (
          <button className="lesson__next" onClick={onNext}>
            <span>Next movement</span>
            <svg viewBox="0 0 24 8" aria-hidden="true" focusable="false">
              <path d="M0 4h21M17.5 0.8 21 4l-3.5 3.2" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
});
