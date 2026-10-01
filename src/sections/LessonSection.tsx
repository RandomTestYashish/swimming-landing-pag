import { forwardRef } from 'react';
import type { Lesson } from '../data/lessons';
import './LessonSection.css';

type Props = { lesson: Lesson; index: number };

/**
 * One chapter. Deliberately mostly empty: the stage behind it is doing the
 * explaining, and the panel only says what the swimmer is working on.
 */
export const LessonSection = forwardRef<HTMLElement, Props>(function LessonSection(
  { lesson, index },
  ref
) {
  const side = index % 2 === 0 ? 'left' : 'right';

  return (
    <section
      className={`lesson lesson--${side}`}
      id={`chapter-${lesson.id}`}
      ref={ref}
      aria-labelledby={`chapter-${lesson.id}-title`}
    >
      <div className="lesson__panel">
        <p className="lesson__meta">
          <span className="lesson__num">{lesson.id}</span>
        </p>

        <div className="lesson__body">
          <h2 className="lesson__title" id={`chapter-${lesson.id}-title`}>{lesson.title}</h2>
          <p className="lesson__statement">{lesson.statement}</p>
        </div>

        <dl className="lesson__notes">
          {lesson.notes.map((n) => (
            <div key={n.k}>
              <dt>{n.k}</dt>
              <dd>{n.v}</dd>
            </div>
          ))}
        </dl>

      </div>
    </section>
  );
});
