import type { Joints } from '../components/SwimmerFigure';

const J = (o: Partial<Joints>): Joints => ({
  trunk: 0, head: 0,
  armN: 0, elbowN: 0, wristN: 0,
  armF: 0, elbowF: 0, wristF: 0,
  legN: 0, kneeN: 0, ankleN: 0,
  legF: 0, kneeF: 0, ankleF: 0,
  ...o,
});

/**
 * Named positions the chapters move between. Every value is a joint angle,
 * so a change of chapter is the body rotating into the next position rather
 * than one picture being swapped for another.
 */
export const POSES: Record<string, Joints> = {
  /* the hero: mid-freestyle, taking a breath */
  hero: J({
    trunk: -6, head: -46,
    armN: -116, elbowN: -72, wristN: -16,
    armF: 17, elbowF: 9, wristF: 5,
    legN: -8, kneeN: 13, ankleN: -14,
    legF: 12, kneeF: -11, ankleF: -16,
  }),
  standing: J({
    trunk: -84, head: 78,
    armN: 128, elbowN: 22, wristN: 6,
    armF: 150, elbowF: 16, wristF: 4,
    legN: 82, kneeN: -4, ankleN: -8,
    legF: 96, kneeF: 4, ankleF: -6,
  }),
  bubbles: J({
    trunk: -26, head: 22,
    armN: 22, elbowN: 16, wristN: 4,
    armF: 30, elbowF: 12, wristF: 4,
    legN: 62, kneeN: -18, ankleN: -10,
    legF: 74, kneeF: -8, ankleF: -8,
  }),
  streamline: J({
    trunk: 0, head: 0,
    armN: -3, elbowN: 0, wristN: -6,
    armF: 3, elbowF: 0, wristF: -6,
    legN: 0, kneeN: 0, ankleN: -14,
    legF: 0, kneeF: 0, ankleF: -14,
  }),
  float: J({
    trunk: 2, head: -6,
    armN: -26, elbowN: -14, wristN: -4,
    armF: 24, elbowF: 12, wristF: -4,
    legN: -13, kneeN: 6, ankleN: -10,
    legF: 15, kneeF: -6, ankleF: -10,
  }),
  freestyle: J({
    trunk: -6, head: -8,
    armN: -128, elbowN: -62, wristN: -14,
    armF: 34, elbowF: 22, wristF: 8,
    legN: -16, kneeN: 16, ankleN: -18,
    legF: 18, kneeF: -14, ankleF: -18,
  }),
  kick: J({
    trunk: 0, head: 0,
    armN: -4, elbowN: 0, wristN: -6,
    armF: 4, elbowF: 0, wristF: -6,
    legN: -22, kneeN: 20, ankleN: -22,
    legF: 24, kneeF: -18, ankleF: -22,
  }),
  armcycle: J({
    trunk: -8, head: -4,
    armN: 96, elbowN: 40, wristN: 10,
    armF: -46, elbowF: -28, wristF: -8,
    legN: -10, kneeN: 10, ankleN: -16,
    legF: 12, kneeF: -8, ankleF: -16,
  }),
  breathe: J({
    trunk: -12, head: -30,
    armN: -168, elbowN: -48, wristN: -10,
    armF: 60, elbowF: 34, wristF: 10,
    legN: -12, kneeN: 12, ankleN: -16,
    legF: 14, kneeF: -10, ankleF: -16,
  }),
  glide: J({
    trunk: 0, head: -2,
    armN: -6, elbowN: -2, wristN: -8,
    armF: 6, elbowF: 2, wristF: -8,
    legN: -4, kneeN: 2, ankleN: -14,
    legF: 5, kneeF: -2, ankleF: -14,
  }),
};

const KEYS = Object.keys(POSES.hero) as (keyof Joints)[];

export function lerpPose(a: Joints, b: Joints, t: number): Joints {
  const out = {} as Joints;
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

/**
 * One continuous freestyle cycle, phase 0..1.
 *
 * The near arm sweeps a full turn: 0-180 is the pull, under the body;
 * 180-360 is the recovery, over the water. The far arm runs half a cycle
 * behind it. Legs beat six times per arm cycle and the head turns to
 * breathe only while the near arm is recovering.
 */
export function freestyle(phase: number): Joints {
  const p = ((phase % 1) + 1) % 1;
  const deg = p * 360;
  const far = ((p + 0.5) % 1) * 360;
  const TAU = Math.PI * 2;

  // elbow bends through the pull and again over the top of the recovery
  const bend = (a: number) => {
    const r = (a * Math.PI) / 180;
    const pull = Math.max(0, Math.sin(r)) * 46;        // high elbow catch
    const recover = Math.max(0, -Math.sin(r)) * -58;   // relaxed swing forward
    return pull + recover;
  };

  const kick = Math.sin(TAU * 3 * p);
  const roll = Math.sin(TAU * p) * 9;
  // the breath opens as the near arm passes overhead, then closes again
  const breathWindow = Math.max(0, Math.sin((p - 0.58) * TAU * 0.5 / 0.22));
  const breath = p > 0.58 && p < 0.80 ? breathWindow : 0;

  return {
    trunk: -roll * 0.7,
    head: -6 - breath * 24,
    armN: deg - 152,
    elbowN: bend(deg - 152),
    wristN: -10,
    armF: far - 152,
    elbowF: bend(far - 152),
    wristF: -10,
    legN: -16 * kick,
    kneeN: 14 * Math.max(0, kick),
    ankleN: -16,
    legF: 16 * kick,
    kneeF: 14 * Math.max(0, -kick),
    ankleF: -16,
  };
}
