import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { WebGLFallback, hasWebGL } from '../shared/WebGLFallback';
import { HeroOverlay } from './HeroOverlay';
import type { Quality } from '../../three/Stage';
import './SwimmingHero.css';

const HeroScene = lazy(() =>
  import('./HeroScene').then((m) => ({ default: m.HeroScene }))
);

/** Coarse device tiering; the scene reads its own budget from this. */
export function detectQuality(): Quality {
  if (typeof navigator === 'undefined') return 'medium';
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const small = window.matchMedia('(max-width: 767px)').matches;
  if (small || cores <= 4 || mem <= 4) return 'medium';
  if (cores >= 8 && mem >= 8) return 'high';
  return 'medium';
}

export function SwimmingHero({ reduced, onStart }: { reduced: boolean; onStart: () => void }) {
  const [ready, setReady] = useState(false);
  const [gl, setGl] = useState<boolean | null>(null);
  const [quality] = useState<Quality>(() => detectQuality());
  const pointer = useRef({ x: 0, y: 0 });
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGl(hasWebGL());
    // let the overlay paint first; the scene is not needed for first meaning
    const id = window.setTimeout(() => setReady(true), 120);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = host.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    el.addEventListener('pointermove', onMove, { passive: true });
    return () => el.removeEventListener('pointermove', onMove);
  }, [reduced]);

  return (
    <section className="hero" id="top" ref={host}>
      <div className="hero__scene">
        {gl === false && <WebGLFallback />}
        {gl && ready && (
          <Suspense fallback={<WebGLFallback />}>
            <HeroScene quality={quality} reduced={reduced} pointer={pointer} />
          </Suspense>
        )}
        {gl && !ready && <WebGLFallback />}
      </div>
      <HeroOverlay onStart={onStart} />
    </section>
  );
}
