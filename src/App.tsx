import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { ProgressNavigation } from './components/ProgressNavigation';
import { Environment } from './components/Environment';
import { Pool } from './components/Pool';
import { Swimmer } from './components/Swimmer';
import { Hero } from './sections/Hero';
import { LessonSection } from './sections/LessonSection';
import { Footer } from './sections/Footer';
import { LESSONS } from './data/lessons';
import { POSES, lerpPose, freestyle } from './utils/poses';
import { applyJoints, approach, clonePose } from './utils/joints';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import './App.css';

/** chapters whose body keeps swimming rather than holding a position */
const LIVE = new Set(['freestyle', 'armcycle', 'kick']);

export default function App() {
  const reduced = useReducedMotion();
  const lenis = useSmoothScroll(!reduced);

  const [active, setActive] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const swimmer = useRef<SVGSVGElement>(null);
  const chapters = useRef<(HTMLElement | null)[]>([]);

  // pose state lives outside React: the loop mutates it sixty times a second
  const pose = useRef(clonePose(POSES.hero));
  const depth = useRef(0);
  const activeRef = useRef(0);
  const bounds = useRef<{ top: number; mid: number }[]>([]);
  const [poolDepth, setPoolDepth] = useState(0);

  /* chapter offsets, measured once and on resize rather than every frame */
  useEffect(() => {
    const measure = () => {
      bounds.current = (chapters.current.filter(Boolean) as HTMLElement[]).map((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        return { top, mid: top + el.offsetHeight / 2 };
      });
    };
    measure();
    window.addEventListener('resize', measure);
    const id = window.setTimeout(measure, 600); // after fonts settle
    return () => { window.removeEventListener('resize', measure); window.clearTimeout(id); };
  }, []);

  const scrollTo = useCallback(
    (target: number | HTMLElement) => {
      const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY;
      if (lenis.current) lenis.current.scrollTo(y, { duration: 1.5 });
      else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    },
    [lenis, reduced]
  );

  const jumpTo = useCallback(
    (i: number) => {
      const el = chapters.current[i];
      if (el) scrollTo(el);
    },
    [scrollTo]
  );

  const jumpHref = useCallback(
    (href: string) => {
      if (href === '#top') return scrollTo(0);
      const el = document.querySelector<HTMLElement>(href);
      if (el) scrollTo(el);
    },
    [scrollTo]
  );

  /* ---- reveal each panel once it has arrived ---------------------------- */
  useEffect(() => {
    const els = chapters.current.filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-in')),
      { threshold: 0.2, rootMargin: '0px 0px -18% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ---- the one animation loop ------------------------------------------ */
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let last = performance.now();
    let phase = 0;
    let heroP = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const vh = window.innerHeight;
      heroP = Math.min(1, Math.max(0, window.scrollY / Math.max(vh, 1)));

      /* whichever chapter's middle is nearest the middle of the screen is
         the one being read — decided here so nothing can race */
      const eye = window.scrollY + vh * 0.5;
      let idx = 0;
      let best = Infinity;
      for (let i = 0; i < bounds.current.length; i++) {
        const dist = Math.abs(bounds.current[i].mid - eye);
        if (dist < best) { best = dist; idx = i; }
      }
      if (idx !== activeRef.current) { activeRef.current = idx; setActive(idx); }

      /* the camera sinks as the course goes on, and surfaces again at the end */
      const lesson = LESSONS[Math.min(idx, LESSONS.length - 1)];
      const targetDepth = window.scrollY < vh * 0.5 ? 0.02 : lesson.depth;
      depth.current += (targetDepth - depth.current) * Math.min(1, dt * 2.4);
      const d = depth.current;

      root.style.setProperty('--pool-h', `${(34 + d * 74).toFixed(2)}%`);
      root.style.setProperty('--submersion', d.toFixed(3));

      /* the stroke advances with time and with the reader's own scrolling */
      if (!reduced) phase += dt * 0.14 + Math.abs(window.scrollY - lastY) * 0.00016;
      lastY = window.scrollY;

      let target;
      if (window.scrollY < vh * 0.9) {
        // hold the opening position, then ease into a live stroke
        const blend = Math.min(1, heroP * 2.4);
        target = reduced ? POSES.hero : lerpPose(POSES.hero, freestyle(phase), blend);
      } else if (!reduced && LIVE.has(lesson.pose)) {
        target = lerpPose(freestyle(phase), POSES[lesson.pose], 0.35);
      } else {
        target = POSES[lesson.pose] ?? POSES.hero;
      }

      approach(pose.current, target, reduced ? 1 : Math.min(1, dt * 3.4));
      applyJoints(swimmer.current, pose.current);

      if (stage.current) {
        // the swimmer drifts forward and the camera closes in very slightly
        const drift = heroP * -5 + d * 4;
        stage.current.style.setProperty('--sw-x', `${drift.toFixed(2)}%`);
        stage.current.style.setProperty('--sw-scale', (1 + d * 0.1).toFixed(3));
        // as the camera descends the body sinks fully beneath the surface
        stage.current.style.setProperty('--sw-dive', (d * 0.42).toFixed(3));
      }

      raf = requestAnimationFrame(tick);
    };

    let lastY = window.scrollY;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  /* the pool renderer only needs depth when it meaningfully changes */
  useEffect(() => {
    const id = window.setInterval(() => setPoolDepth(Number(depth.current.toFixed(2))), 220);
    return () => window.clearInterval(id);
  }, []);

  const rail = useMemo(() => LESSONS, []);

  return (
    <>
      <a className="skip-link" href="#chapter-01">Skip to the lessons</a>

      {/* one continuous scene, held behind everything that scrolls */}
      <div className="stage" ref={stage} aria-hidden="true">
        <Environment reduced={reduced} />
        <Pool depth={poolDepth} reduced={reduced} />
        <div className="stage__swimmer">
          <Swimmer ref={swimmer} waterline={300} submersion={poolDepth} />
        </div>
        <div className="stage__vignette" />
      </div>

      <Header onJump={jumpHref} />
      <ProgressNavigation lessons={rail} active={active} onJump={jumpTo} />

      <main>
        <Hero onStart={() => jumpTo(0)} />

        {LESSONS.map((l, i) => (
          <LessonSection
            key={l.id}
            lesson={l}
            index={i}
            deep={l.depth > 0.5}
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
