import { forwardRef, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { MOVEMENTS } from './movementData';
import { MovementControls } from './MovementControls';
import { WebGLFallback, hasWebGL } from '../shared/WebGLFallback';
import { detectQuality } from '../SwimmingHero/SwimmingHero';
import type { Movement } from '../../three/SwimmerModel';
import type { Quality } from '../../three/Stage';
import './MovementLab.css';

const MovementScene = lazy(() =>
  import('./MovementScene').then((m) => ({ default: m.MovementScene }))
);

type Note = { x: number; y: number; visible: boolean };

/**
 * The Movement Lab: the same body as the hero, used to explain the stroke.
 *
 * Choosing a movement moves the camera to the angle that actually shows it
 * and pins one or two notes to the relevant part of the body. It is a
 * teaching view, not a model viewer — the reader never has to drag anything.
 */
export const MovementLab = forwardRef<HTMLElement, { reduced: boolean }>(
  function MovementLab({ reduced }, ref) {
    const [current, setCurrent] = useState<Movement>('body');
    const [playing, setPlaying] = useState(!reduced);
    const [speed, setSpeed] = useState(1);
    const [resetKey, setResetKey] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [gl, setGl] = useState<boolean | null>(null);
    const [quality] = useState<Quality>(() => detectQuality());
    const [notes, setNotes] = useState<Note[]>([]);
    const host = useRef<HTMLDivElement>(null);

    const spec = MOVEMENTS.find((m) => m.id === current) ?? MOVEMENTS[0];

    useEffect(() => { setGl(hasWebGL()); }, []);

    /* the scene is only built once the section is close to being read */
    useEffect(() => {
      const el = host.current;
      if (!el) return;
      const io = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { setMounted(true); io.disconnect(); } },
        { rootMargin: '400px' }
      );
      io.observe(el);
      return () => io.disconnect();
    }, []);

    const onProject = useCallback((pts: Note[]) => {
      setNotes((prev) => {
        if (prev.length === pts.length && prev.every((p, i) =>
          Math.abs(p.x - pts[i].x) < 1.5 && Math.abs(p.y - pts[i].y) < 1.5)) return prev;
        return pts;
      });
    }, []);

    return (
      <section className="lab" id="movement-lab" ref={ref} aria-labelledby="lab-title">
        <div className="lab__sticky">
          <div className="lab__stage" ref={host}>
            {gl === false && <WebGLFallback />}
            {gl && mounted && (
              <Suspense fallback={<WebGLFallback />}>
                <MovementScene
                  movement={current}
                  playing={playing && !reduced}
                  speed={speed}
                  reduced={reduced}
                  quality={quality}
                  resetKey={resetKey}
                  onProject={onProject}
                />
              </Suspense>
            )}

            {/* notes pinned to the body */}
            {gl && spec.notes.map((n, i) => {
              const p = notes[i];
              if (!p || !p.visible) return null;
              return (
                <span
                  className={`lab__note lab__note--${n.side ?? 'right'}`}
                  key={n.text}
                  style={{ left: p.x, top: p.y }}
                >
                  <i aria-hidden="true" />
                  {n.text}
                </span>
              );
            })}
          </div>

          <div className="lab__ui" id="lab-panel" role="tabpanel" aria-labelledby={`lab-tab-${current}`}>
            <div className="lab__copy">
              <p className="lab__count">
                <b>{spec.n}</b> <i>/</i> {String(MOVEMENTS.length).padStart(2, '0')}
              </p>
              <h2 className="lab__title" id="lab-title">{spec.title}</h2>
              <p className="lab__body">{spec.body}</p>
            </div>

            <MovementControls
              items={MOVEMENTS}
              current={current}
              onSelect={setCurrent}
              playing={playing}
              onPlay={() => setPlaying((v) => !v)}
              speed={speed}
              onSpeed={setSpeed}
              onReset={() => setResetKey((k) => k + 1)}
            />
          </div>
        </div>
      </section>
    );
  }
);
