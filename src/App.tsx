import { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { ProgressNavigation } from './components/ProgressNavigation';
import { SwimmingHero } from './components/SwimmingHero/SwimmingHero';
import { MovementLab } from './components/MovementLab/MovementLab';
import { LessonSection } from './sections/LessonSection';
import { Footer } from './sections/Footer';
import { LESSONS, GROUPS } from './data/lessons';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useTheme } from './hooks/useTheme';
import './App.css';

export default function App() {
  const reduced = useReducedMotion();
  const [theme, toggleTheme] = useTheme();
  const lenis = useSmoothScroll(!reduced);

  const [active, setActive] = useState(0);
  const chapters = useRef<(HTMLElement | null)[]>([]);
  const lab = useRef<HTMLElement>(null);
  const activeRef = useRef(0);

  const scrollTo = useCallback(
    (target: number | HTMLElement) => {
      const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY;
      if (lenis.current) lenis.current.scrollTo(y, { duration: 1.5 });
      else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    },
    [lenis, reduced]
  );

  const jumpTo = useCallback((i: number) => {
    const el = chapters.current[i];
    if (el) scrollTo(el);
  }, [scrollTo]);

  const jumpHref = useCallback((href: string) => {
    if (href === '#top') return scrollTo(0);
    const el = document.querySelector<HTMLElement>(href);
    if (el) scrollTo(el);
  }, [scrollTo]);

  /* reveal each panel once it arrives */
  useEffect(() => {
    const els = chapters.current.filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-in')),
      { threshold: 0.15, rootMargin: '0px 0px -14% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Which chapter is open is decided by a centre-line observer rather than
     a scroll handler: the band is one pixel tall at the middle of the
     viewport, so exactly one chapter can be crossing it. */
  useEffect(() => {
    const els = chapters.current.filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = els.indexOf(e.target as HTMLElement);
          if (i >= 0 && i !== activeRef.current) {
            activeRef.current = i;
            setActive(i);
          }
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <a className="skip-link" href="#chapter-01">Skip to the lessons</a>

      <Header onJump={jumpHref} theme={theme} onToggleTheme={toggleTheme} />
      <ProgressNavigation lessons={LESSONS} active={active} onJump={jumpTo} />

      <SwimmingHero reduced={reduced} theme={theme} onStart={() => lab.current && scrollTo(lab.current)} />

      <MovementLab reduced={reduced} theme={theme} ref={lab} />

      <main className="chapters">
        <div className="chapters__intro shell">
          <p className="eyebrow">The method</p>
          <h2 className="chapters__title">Nine movements, in the order they are learned.</h2>
          <p className="chapters__lede">
            Each one is a single idea you can practise in water you can stand up in. Comfort comes
            first; speed comes much later, and only if you want it.
          </p>
        </div>

        {GROUPS.map((group, gi) => (
          <section className="phase" key={group.title} aria-labelledby={`phase-${gi}`}>
            <div className="phase__head shell">
              <h3 className="phase__title" id={`phase-${gi}`}>{group.title}</h3>
              <p className="phase__blurb">{group.blurb}</p>
            </div>

            <div className="phase__rows">
              {LESSONS.slice(group.from, group.to).map((l, li) => {
                const i = group.from + li;
                return (
                  <LessonSection
                    key={l.id}
                    lesson={l}
                    index={i}
                    ref={(el) => { chapters.current[i] = el; }}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <Footer onRestart={() => scrollTo(0)} />
    </>
  );
}
