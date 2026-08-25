import { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { ProgressNavigation } from './components/ProgressNavigation';
import { SwimmingHero } from './components/SwimmingHero/SwimmingHero';
import { MovementLab } from './components/MovementLab/MovementLab';
import { LessonSection } from './sections/LessonSection';
import { Footer } from './sections/Footer';
import { LESSONS } from './data/lessons';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import './App.css';

export default function App() {
  const reduced = useReducedMotion();
  const lenis = useSmoothScroll(!reduced);

  const [active, setActive] = useState(0);
  const chapters = useRef<(HTMLElement | null)[]>([]);
  const lab = useRef<HTMLElement>(null);
  const activeRef = useRef(0);
  const bounds = useRef<{ mid: number }[]>([]);

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

  /* chapter offsets, measured on layout rather than on every frame */
  useEffect(() => {
    const measure = () => {
      bounds.current = (chapters.current.filter(Boolean) as HTMLElement[]).map((el) => ({
        mid: el.getBoundingClientRect().top + window.scrollY + el.offsetHeight / 2,
      }));
    };
    measure();
    window.addEventListener('resize', measure);
    const id = window.setTimeout(measure, 700);
    return () => { window.removeEventListener('resize', measure); window.clearTimeout(id); };
  }, []);

  /* whichever chapter's middle is nearest the middle of the screen is open */
  useEffect(() => {
    let ticking = false;
    const read = () => {
      ticking = false;
      const eye = window.scrollY + window.innerHeight * 0.5;
      let idx = 0;
      let best = Infinity;
      bounds.current.forEach((b, i) => {
        const d = Math.abs(b.mid - eye);
        if (d < best) { best = d; idx = i; }
      });
      if (idx !== activeRef.current) { activeRef.current = idx; setActive(idx); }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(read); } };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <a className="skip-link" href="#chapter-01">Skip to the lessons</a>

      <Header onJump={jumpHref} />
      <ProgressNavigation lessons={LESSONS} active={active} onJump={jumpTo} />

      <SwimmingHero reduced={reduced} onStart={() => lab.current && scrollTo(lab.current)} />

      <MovementLab reduced={reduced} ref={lab} />

      <main className="chapters">
        <div className="chapters__intro shell">
          <p className="eyebrow">The method</p>
          <h2 className="chapters__title">Nine movements, in the order they are learned.</h2>
          <p className="chapters__lede">
            Each one is a single idea you can practise in water you can stand up in. Comfort comes
            first; speed comes much later, and only if you want it.
          </p>
        </div>

        {LESSONS.map((l, i) => (
          <LessonSection
            key={l.id}
            lesson={l}
            index={i}
            isLast={i === LESSONS.length - 1}
            onNext={() => jumpTo(Math.min(i + 1, LESSONS.length - 1))}
            ref={(el) => { chapters.current[i] = el; }}
          />
        ))}
      </main>

      <Footer onRestart={() => scrollTo(0)} />
    </>
  );
}
