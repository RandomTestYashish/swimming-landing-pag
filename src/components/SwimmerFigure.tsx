import type { CSSProperties } from 'react';

/**
 * The figure, drawn once and rendered twice by <Swimmer/> — once clipped
 * above the waterline and once below it, so the surface cuts across the
 * body the way it does in a real pool photograph.
 *
 * Neutral orientation: the swimmer travels to the right. Arms extend from
 * the shoulder along +x, legs trail from the hip along -x, so every joint
 * is a plain rotation about its own pivot.
 *
 * Angles arrive as CSS custom properties rather than props: the animation
 * loop writes fifteen variables onto one element per frame instead of
 * re-rendering this subtree sixty times a second.
 */

export type Joints = {
  trunk: number; head: number;
  armN: number; elbowN: number; wristN: number;
  armF: number; elbowF: number; wristF: number;
  legN: number; kneeN: number; ankleN: number;
  legF: number; kneeF: number; ankleF: number;
};

export const JOINT_KEYS: (keyof Joints)[] = [
  'trunk', 'head',
  'armN', 'elbowN', 'wristN',
  'armF', 'elbowF', 'wristF',
  'legN', 'kneeN', 'ankleN',
  'legF', 'kneeF', 'ankleF',
];

const j = (name: keyof Joints, ox: number, oy: number): CSSProperties => ({
  transform: `rotate(var(--j-${name}, 0deg))`,
  transformOrigin: `${ox}px ${oy}px`,
});

/** a muscled taper: proximal cap, belly, distal cap */
function limb(x1: number, x2: number, y: number, h1: number, hb: number, h2: number) {
  const d = x2 - x1;
  const bx = x1 + d * 0.42;
  return [
    `M${x1},${y - h1}`,
    `C${x1 + d * 0.16},${y - h1 * 1.02} ${bx - d * 0.1},${y - hb} ${bx},${y - hb}`,
    `C${bx + d * 0.24},${y - hb} ${x2 - d * 0.14},${y - h2 * 1.04} ${x2},${y - h2}`,
    `A${h2},${h2} 0 0 1 ${x2},${y + h2}`,
    `C${x2 - d * 0.14},${y + h2 * 1.04} ${bx + d * 0.24},${y + hb * 0.94} ${bx},${y + hb * 0.94}`,
    `C${bx - d * 0.1},${y + hb * 0.94} ${x1 + d * 0.16},${y + h1 * 1.02} ${x1},${y + h1}`,
    `A${h1},${h1} 0 0 1 ${x1},${y - h1}`,
    'Z',
  ].join(' ');
}

function Arm({ far }: { far?: boolean }) {
  const y = far ? 314 : 286;
  const s = far ? 'F' : 'N';
  return (
    <g className={far ? 'sw-far' : 'sw-near'} style={j(`arm${s}` as keyof Joints, 620, y)}>
      <path className="sw-skin" d={limb(620, 722, y, 27, 24, 18)} />
      <g style={j(`elbow${s}` as keyof Joints, 720, y)}>
        <path className="sw-skin" d={limb(720, 808, y, 19, 20, 12)} />
        <g style={j(`wrist${s}` as keyof Joints, 806, y)}>
          <path className="sw-skin" d={limb(804, 866, y, 13, 15, 9)} />
        </g>
      </g>
    </g>
  );
}

function Leg({ far }: { far?: boolean }) {
  const y = far ? 309 : 291;
  const s = far ? 'F' : 'N';
  return (
    <g className={far ? 'sw-far' : 'sw-near'} style={j(`leg${s}` as keyof Joints, 400, y)}>
      <path className="sw-skin" d={limb(404, 272, y, 36, 33, 22)} />
      <g style={j(`knee${s}` as keyof Joints, 275, y)}>
        <path className="sw-skin" d={limb(276, 158, y, 22, 25, 11)} />
        <g style={j(`ankle${s}` as keyof Joints, 160, y)}>
          <path className="sw-skin" d={limb(160, 100, y, 12, 10, 5)} />
        </g>
      </g>
    </g>
  );
}

export function SwimmerFigure() {
  return (
    <g className="sw-figure">
      {/* far side, sitting back in the water */}
      <Leg far />
      <Arm far />

      <g style={j('trunk', 400, 300)}>
        {/* torso: lat flare at the shoulders, narrow waist, hip block */}
        <path
          className="sw-skin"
          d="M636,262 C602,250 522,252 468,260 C432,266 410,270 396,274
             C378,281 376,319 396,328 C412,334 434,338 470,342
             C524,348 602,350 636,338 C658,327 660,273 636,262 Z"
        />
        <path className="sw-shade" d="M612,278 C566,268 500,270 452,278 C486,284 556,286 612,278 Z" />
        <path className="sw-sheen" d="M620,286 C566,276 496,278 448,288 C494,296 566,296 620,286 Z" />

        <path
          className="sw-suit"
          d="M394,274 C378,281 376,319 396,328 C412,334 434,338 470,342
             C486,344 498,344 508,343 C500,320 500,292 508,268
             C492,268 470,270 452,272 C430,274 410,272 394,274 Z"
        />
        <path className="sw-suit-hi" d="M400,282 C412,278 440,278 470,280 C466,288 464,296 464,304 C436,300 412,298 398,300 Z" />

        <Leg />

        <g style={j('head', 630, 296)}>
          {/* neck */}
          <path className="sw-skin" d="M622,272 C646,266 666,268 676,276 C680,290 678,306 672,316 C658,322 636,322 622,316 Z" />
          {/* skull under the cap */}
          <ellipse className="sw-cap" cx="700" cy="288" rx="46" ry="39" transform="rotate(-9 700 288)" />
          {/* face in three-quarter: brow, cheek, jaw */}
          <path
            className="sw-skin"
            d="M706,254 C726,256 742,268 746,286 C750,304 742,318 726,324
               C712,329 698,326 690,318 C700,300 704,276 706,254 Z"
          />
          <path className="sw-shade" d="M700,316 C710,322 722,324 732,320 C724,326 708,326 700,316 Z" />
          <path className="sw-goggle" d="M708,268 C726,268 742,276 748,288 C744,296 736,300 726,299 C716,298 708,292 706,282 Z" />
          <path className="sw-goggle-lens" d="M716,275 C728,275 738,281 742,289 C734,292 722,290 716,283 Z" />
          <path className="sw-strap" d="M706,272 C686,268 668,272 658,280" />
          <path className="sw-skin" d="M690,296 C696,294 700,298 699,304 C698,309 693,311 689,308 Z" />
          <path className="sw-mouth" d="M726,314 C733,312 739,314 741,318 C737,322 729,322 725,319 Z" />
        </g>

        {/* the near arm sweeps across everything, so it is drawn last */}
        <Arm />
      </g>
    </g>
  );
}
