/**
 * Shared caustic field.
 *
 * An iterative domain warp: the interference it produces reads as light
 * refracted through a moving surface, which noise alone never does.
 */
export const CAUSTIC_GLSL = /* glsl */ `
float causticField(vec2 p, float t) {
  vec2 i = p;
  float c = 1.0;
  const float inten = 0.0045;
  for (int n = 0; n < 4; n++) {
    float ti = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(ti - i.x) + sin(ti + i.y), sin(ti - i.y) + cos(ti + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + ti) / inten), p.y / (cos(i.y + ti) / inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return clamp(pow(abs(c), 8.0), 0.0, 1.0);
}
`;
