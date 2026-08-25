import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scrolling for the cinematic passage between chapters.
 * Disabled outright under reduced motion — there the page scrolls natively.
 */
export function useSmoothScroll(enabled: boolean) {
  const ref = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      // native #hash links must keep working: Lenis owns the scroll position,
      // so anything it does not know about gets snapped back
      anchors: { offset: 0, duration: 1.4 },
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });
    ref.current = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      ref.current = null;
    };
  }, [enabled]);

  return ref;
}
