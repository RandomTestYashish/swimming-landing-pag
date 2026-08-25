import { useEffect, useRef } from 'react';
import { foliage } from '../utils/foliage';
import './Greenery.css';

type Props = { side: 'left' | 'right'; seed: number; reduced: boolean };

/**
 * The planting that frames the shot.
 *
 * Each depth layer is drawn once into its own bitmap — blur, colour and
 * edge fade baked in — because a blurred layer of a thousand live vector
 * leaves has to be re-rasterised on every frame it moves, which costs more
 * than everything else on the page combined. Once baked, the only per-frame
 * work is a transform on three static images.
 */
const LAYERS = [
  { count: 420, blur: 8, alpha: 0.6, light: 1.24, sat: 0.6 },
  { count: 340, blur: 3.5, alpha: 0.85, light: 1.06, sat: 0.95 },
  { count: 250, blur: 0.6, alpha: 0.95, light: 1.0, sat: 1.05 },
];

const TONES = ['#7ba24f', '#5d8340', '#3f5c2c', '#8fb35c'];

export function Greenery({ side, seed, reduced }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = host.current;
    const cv = ref.current;
    if (!el || !cv) return;

    const paint = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      // the mass is blurred and backlit, so it gains nothing from device pixels
      const dpr = 1;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const anchorX = side === 'left' ? 0 : w;

      // all three depths go into one bitmap, far to near
      LAYERS.forEach((layer, li) => {
        ctx.filter = `blur(${layer.blur}px) saturate(${layer.sat}) brightness(${layer.light})`;
        ctx.globalAlpha = layer.alpha;

        for (const lf of foliage(seed + li * 101, layer.count, side === 'left' ? 1 : -1)) {
          const x = anchorX + (lf.x / 100) * w;
          const y = (lf.y / 100) * h;
          const r = lf.s * (w * 0.021);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((lf.a * Math.PI) / 180);
          ctx.fillStyle = TONES[Math.min(TONES.length - 1, Math.floor(lf.tone * TONES.length))];
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 1.5, r * 0.62, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // the mass fades into the daylight rather than ending on an edge
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-out';
      const g = ctx.createRadialGradient(anchorX, 0, Math.min(w, h) * 0.2, anchorX, 0, Math.max(w, h) * 1.05);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.55, 'rgba(0,0,0,0.35)');
      g.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    };

    paint();
    let t = 0;
    const onResize = () => { window.clearTimeout(t); t = window.setTimeout(paint, 220); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); window.clearTimeout(t); };
  }, [seed, side]);

  return (
    <div className={`gr gr--${side}${reduced ? ' gr--still' : ''}`} ref={host} aria-hidden="true">
      <canvas ref={ref} className="gr__l" />
    </div>
  );
}
