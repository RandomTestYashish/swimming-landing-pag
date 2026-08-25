import type { MovementSpec } from './movementData';
import type { Movement } from '../../three/SwimmerModel';

type Props = {
  items: MovementSpec[];
  current: Movement;
  onSelect: (id: Movement) => void;
  playing: boolean;
  onPlay: () => void;
  speed: number;
  onSpeed: (s: number) => void;
  onReset: () => void;
};

const SPEEDS = [0.5, 1, 1.5];

export function MovementControls({
  items, current, onSelect, playing, onPlay, speed, onSpeed, onReset,
}: Props) {
  const idx = items.findIndex((m) => m.id === current);

  return (
    <div className="lab__controls">
      <div className="lab__tabs" role="tablist" aria-label="Swimming movements">
        {items.map((m) => (
          <button
            key={m.id}
            role="tab"
            id={`lab-tab-${m.id}`}
            aria-selected={m.id === current}
            aria-controls="lab-panel"
            tabIndex={m.id === current ? 0 : -1}
            className={`lab__tab${m.id === current ? ' is-on' : ''}`}
            onClick={() => onSelect(m.id)}
            onKeyDown={(e) => {
              const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
              if (!d) return;
              e.preventDefault();
              const next = items[(idx + d + items.length) % items.length];
              onSelect(next.id);
              document.getElementById(`lab-tab-${next.id}`)?.focus();
            }}
          >
            <span className="lab__tab-n">{m.n}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      <div className="lab__transport">
        <button className="lab__btn" onClick={onPlay} aria-pressed={playing}>
          {playing ? 'Pause' : 'Play'}
        </button>

        <div className="lab__speed" role="group" aria-label="Playback speed">
          {SPEEDS.map((s) => (
            <button
              key={s}
              className={`lab__sp${s === speed ? ' is-on' : ''}`}
              aria-pressed={s === speed}
              onClick={() => onSpeed(s)}
            >
              {s}&times;
            </button>
          ))}
        </div>

        <button className="lab__btn lab__btn--ghost" onClick={onReset}>Reset view</button>
      </div>
    </div>
  );
}
