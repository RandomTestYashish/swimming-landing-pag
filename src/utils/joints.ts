import { JOINT_KEYS, type Joints } from '../components/SwimmerFigure';

const written = new WeakMap<Element, Joints>();

/**
 * Writes a whole pose onto one element as CSS custom properties.
 *
 * Skips the write entirely once the body has settled: the submerged half is
 * filtered, and an unchanged subtree lets the browser reuse the cached
 * filter result instead of recomputing it every frame.
 */
export function applyJoints(el: HTMLElement | SVGElement | null, j: Joints) {
  if (!el) return;
  const prev = written.get(el);
  if (prev) {
    let moved = false;
    for (const k of JOINT_KEYS) {
      if (Math.abs(prev[k] - j[k]) > 0.06) { moved = true; break; }
    }
    if (!moved) return;
  }
  for (const k of JOINT_KEYS) {
    (el as HTMLElement).style.setProperty(`--j-${k}`, `${j[k].toFixed(2)}deg`);
  }
  written.set(el, { ...j });
}

/** Frame-rate independent approach toward a target pose. */
export function approach(cur: Joints, target: Joints, k: number): void {
  for (const key of JOINT_KEYS) cur[key] += (target[key] - cur[key]) * k;
}

export function clonePose(j: Joints): Joints {
  return { ...j };
}
