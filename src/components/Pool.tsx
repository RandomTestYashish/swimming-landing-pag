import { useEffect, useRef } from 'react';
import { WaterRenderer } from '../webgl/WaterRenderer';
import './Pool.css';

type Props = {
  /** 0 = camera at the surface, 1 = deep; set by the chapter in view */
  depth: number;
  reduced: boolean;
};

/**
 * The pool. A WebGL pass draws the water; the element keeps a layered CSS
 * gradient underneath it so the composition survives intact if the context
 * is unavailable or lost.
 */
export function Pool({ depth, reduced }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<WaterRenderer | null>(null);

  useEffect(() => {
    if (!canvas.current || !wrap.current) return;
    const r = new WaterRenderer(canvas.current, { surface: 0.94, quality: reduced ? 0 : 1 });
    renderer.current = r;
    if (!r.supported) { canvas.current.style.display = 'none'; return; }

    r.play();

    const io = new IntersectionObserver(
      ([e]) => r.setVisible(e.isIntersecting),
      { rootMargin: '120px' }
    );
    io.observe(wrap.current);

    const onResize = () => r.resize();
    const onVis = () => (document.hidden ? r.pause() : r.play());
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      io.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      r.destroy();
      renderer.current = null;
    };
  }, [reduced]);

  useEffect(() => { renderer.current?.setDepth(depth); }, [depth]);

  return (
    <div className="pool" ref={wrap} aria-hidden="true">
      <canvas className="pool__gl" ref={canvas} />
      <div className="pool__edge" />
    </div>
  );
}
