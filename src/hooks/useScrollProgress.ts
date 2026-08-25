import { useEffect, useState } from 'react';

/**
 * Reports overall document progress (0..1) on a rAF-throttled scroll listener.
 * One listener for the whole page rather than one per section.
 */
export function useScrollProgress(): number {
  const [p, setP] = useState(0);

  useEffect(() => {
    let ticking = false;
    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return p;
}
