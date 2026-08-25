/** Deterministic PRNG so the greenery is identical on every render and build. */
function mulberry(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Leaf = { x: number; y: number; s: number; a: number; tone: number };

/**
 * Builds a mass of planting hanging into the frame from one top corner.
 *
 * Leaves are laid along arcing boughs rather than scattered, and clustered
 * hard at the corner so the mass is dense where it enters and open where it
 * reaches into the light — which is what stops it reading as confetti.
 */
export function foliage(seed: number, count: number, side: 1 | -1): Leaf[] {
  const rnd = mulberry(seed);
  const leaves: Leaf[] = [];
  const boughs = 9;

  for (let b = 0; b < boughs; b++) {
    const t0 = b / boughs;
    // boughs fan out from the top corner, downward and inward
    const angle = (-8 + t0 * 96 + rnd() * 14) * (Math.PI / 180);
    const len = 30 + rnd() * 44 + (1 - t0) * 22;
    const ox = rnd() * 6;
    const oy = -4 + rnd() * 10;
    const per = Math.round(count / boughs);

    for (let i = 0; i < per; i++) {
      const t = Math.pow(i / per, 0.82);          // denser at the corner
      const droop = t * t * 26;                    // boughs sag as they reach
      const jitter = 3 + t * 11;
      leaves.push({
        x: side * (ox + Math.cos(angle) * t * len + (rnd() - 0.5) * jitter),
        y: oy + Math.sin(angle) * t * len + droop + (rnd() - 0.5) * jitter,
        s: (1.15 - t * 0.45) * (0.62 + rnd() * 0.72),
        a: rnd() * 360,
        tone: rnd(),
      });
    }
  }
  return leaves;
}
