import { forwardRef } from 'react';
import { SwimmerFigure } from './SwimmerFigure';
import './Swimmer.css';

type Props = {
  /** waterline position in the SVG's own coordinates */
  waterline?: number;
  /** 0 = at the surface, 1 = fully submerged; drives absorption and splash */
  submersion?: number;
  className?: string;
};

const VB = { x: 0, y: 0, w: 1000, h: 620 };

/**
 * Composites the figure into the water.
 *
 * The same body is drawn twice — once clipped above the waterline and once
 * below it. The lower copy is refracted, blurred and colour-absorbed, and
 * offset very slightly, because that mismatch across the surface is the
 * cue that reads as "two different media" rather than "a cutout on blue".
 */
export const Swimmer = forwardRef<SVGSVGElement, Props>(function Swimmer(
  { waterline = 300, submersion = 0, className },
  ref
) {
  const wl = waterline;

  return (
    <svg
      ref={ref}
      className={`sw${className ? ` ${className}` : ''}`}
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="A swimmer mid-freestyle, the waterline crossing at the shoulder"
      style={{ ['--sub' as string]: submersion }}
    >
      <defs>
        <linearGradient id="sw-skin" x1="0" y1="0" x2="0.18" y2="1">
          <stop offset="0" stopColor="#f7e2d2" />
          <stop offset="0.34" stopColor="#e6bd9b" />
          <stop offset="0.72" stopColor="#c58f6a" />
          <stop offset="1" stopColor="#96674b" />
        </linearGradient>
        <linearGradient id="sw-suit" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#2b4a78" />
          <stop offset="0.55" stopColor="#152a4a" />
          <stop offset="1" stopColor="#0b1526" />
        </linearGradient>
        <linearGradient id="sw-cap" x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#2a3446" />
          <stop offset="0.6" stopColor="#131923" />
          <stop offset="1" stopColor="#080b10" />
        </linearGradient>
        <linearGradient id="sw-lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bfe9f5" stopOpacity="0.85" />
          <stop offset="1" stopColor="#3f7f9c" stopOpacity="0.5" />
        </linearGradient>

        <clipPath id="sw-above"><rect x={VB.x} y={VB.y} width={VB.w} height={wl - VB.y} /></clipPath>
        <clipPath id="sw-below"><rect x={VB.x} y={wl} width={VB.w} height={VB.h - wl} /></clipPath>

        {/* Refraction + absorption, in one pass so the two never fight. */}
        <filter id="sw-underwater" x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
          {/* The noise field is static. Animating it would force the whole
              filter to be regenerated every frame; the sense of moving water
              comes from the caustics sliding over the body instead. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.010 0.026" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={6} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="0.6" result="b" />
          {/* water absorbs red first, so skin cools and darkens with depth */}
          <feColorMatrix
            in="b"
            type="matrix"
            values="0.84 0.03 0.01 0 0
                    0.04 0.90 0.05 0 0
                    0.03 0.09 1.00 0 0
                    0    0    0    1 0"
          />
        </filter>

        {/* the surface itself distorts what is directly beneath it */}
        <filter id="sw-meniscus" x="-6%" y="-40%" width="112%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves={1} seed={3} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" />
        </filter>

        <radialGradient id="sw-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#04425c" stopOpacity="0.5" />
          <stop offset="1" stopColor="#04425c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sw-splash" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* the body's shadow, thrown down onto the pool floor */}
      <ellipse className="sw-cast" cx="500" cy={wl + 300} rx="300" ry="34" fill="url(#sw-shadow)" />

      {/* ---------- below the waterline ---------- */}
      <g clipPath="url(#sw-below)">
        <g className="sw-under" filter="url(#sw-underwater)">
          <SwimmerFigure />
        </g>
        {/* caustic light sliding over the submerged body */}
        <g className="sw-bodycaustic" aria-hidden="true">
          <ellipse cx="470" cy={wl + 44} rx="86" ry="13" />
          <ellipse cx="268" cy={wl + 30} rx="64" ry="10" />
          <ellipse cx="646" cy={wl + 58} rx="72" ry="11" />
          <ellipse cx="820" cy={wl + 86} rx="58" ry="9" />
        </g>
        {/* exhaled air, and the bubbles torn off the hands */}
        <g className="sw-bubbles" aria-hidden="true">
          <circle cx="748" cy={wl + 30} r="4" />
          <circle cx="774" cy={wl + 14} r="2.6" />
          <circle cx="722" cy={wl + 52} r="3.2" />
          <circle cx="762" cy={wl + 70} r="2.2" />
          <circle cx="336" cy={wl + 36} r="3.4" />
          <circle cx="292" cy={wl + 58} r="2.4" />
          <circle cx="378" cy={wl + 74} r="1.9" />
          <circle cx="884" cy={wl + 96} r="2.8" />
        </g>
      </g>

      {/* water piling up where the body crosses the surface */}
      <g className="sw-surface" aria-hidden="true" filter="url(#sw-meniscus)">
        <ellipse className="sw-wake" cx="646" cy={wl + 26} rx="118" ry="9" />
        <ellipse className="sw-wake sw-wake--2" cx="452" cy={wl + 28} rx="86" ry="7" />
        <ellipse className="sw-wake sw-wake--2" cx="806" cy={wl + 24} rx="62" ry="6" />
      </g>

      {/* ---------- above the waterline ---------- */}
      <g clipPath="url(#sw-above)" className="sw-over">
        <SwimmerFigure />
      </g>

      {/* splash thrown up by the recovering arm */}
      <g className="sw-splash" aria-hidden="true">
        <ellipse cx="470" cy={wl + 6} rx="40" ry="15" fill="url(#sw-splash)" />
        <circle cx="452" cy={wl - 16} r="3.4" />
        <circle cx="486" cy={wl - 24} r="2.6" />
        <circle cx="436" cy={wl - 4} r="3" />
        <circle cx="502" cy={wl - 8} r="2.2" />
      </g>
    </svg>
  );
});
