/**
 * Fragment shader for the pool.
 *
 * The pool is rendered as a cross-section: a tiled far wall running down to
 * a floor, seen through moving water. Depth is built from four stacked
 * cues rather than a single blue fill — an absorption gradient, a tile grid
 * that loses contrast with distance, caustic light that pools on the wall
 * and floor, and volumetric shafts falling from the surface.
 */
export const VERT = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uRes;
uniform float uDepth;      // 0 = camera at the surface, 1 = deep
uniform float uSurface;    // y of the waterline in uv space
uniform vec3  uSurfaceCol;
uniform vec3  uMidCol;
uniform vec3  uDeepCol;
uniform float uQuality;    // 1 = full, 0 = reduced motion / low power

/* ---- caustics ---------------------------------------------------------
   Iterative domain warp. Cheap, and the interference pattern it produces
   reads as light refracted through a moving surface rather than as noise. */
float caustic(vec2 p, float t) {
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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

/* soft tile grid that fades as the wall recedes */
float tiles(vec2 uv, float size, float soft) {
  vec2 g = abs(fract(uv / size) - 0.5);
  float line = min(g.x, g.y);
  /* grout is a soft valley, not a hard stroke */
  return smoothstep(0.0, soft, line) * 0.75 + 0.25;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);

  /* The canvas begins at the waterline, so depth is just distance from its
     top edge. uSurface nudges where the meniscus sits within that. */
  float d = clamp((1.0 - uv.y) + (1.0 - uSurface), 0.0, 1.0);

  /* ---- absorption: three stops, not one flat blue ---- */
  vec3 col = mix(uSurfaceCol, uMidCol, smoothstep(0.0, 0.34, d));
  col = mix(col, uDeepCol, smoothstep(0.34, 0.94, d));
  col = mix(col, uDeepCol * 0.78, smoothstep(0.88, 1.0, d));

  /* ---- tiled far wall, with a floor plane at the bottom ---- */
  float floorLine = 0.80;
  float onFloor = smoothstep(floorLine - 0.02, floorLine + 0.02, d);

  /* wall tiles keep a constant size; floor tiles stretch with perspective */
  vec2 wallUv = vec2(uv.x * aspect, d);
  float persp = 1.0 / max(1.0 - (d - floorLine) * 2.4, 0.25);
  vec2 floorUv = vec2((uv.x - 0.5) * aspect * persp + 0.5, (d - floorLine) * persp * 1.6);

  float grid = mix(tiles(wallUv, 0.062, 0.028), tiles(floorUv, 0.10, 0.05), onFloor);
  /* the grid loses contrast with distance — atmospheric perspective */
  float gridStrength = mix(0.17, 0.045, smoothstep(0.05, 0.85, d));
  col *= 1.0 - (1.0 - grid) * gridStrength;

  /* ---- caustics on the wall and pooling on the floor ---- */
  float t = uTime * 0.28;
  vec2 cp = vec2(uv.x * aspect, d * 1.35) * 10.5;
  float ca = caustic(cp, t);
  float cb = caustic(cp * 1.9 + 4.0, t * 0.7);
  float caus = ca * 0.8 + cb * 0.5;

  /* light reaching the wall falls off with depth; the floor catches more */
  float reach = mix(1.0, 0.12, smoothstep(0.0, 0.7, d)) + onFloor * 0.75;
  col += caus * reach * 0.26 * uQuality;

  /* ---- volumetric shafts from the surface ---- */
  float shaft = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float x = 0.14 + fi * 0.24 + sin(uTime * 0.07 + fi * 2.1) * 0.035;
    float w = 0.018 + fi * 0.005;
    /* shafts lean as they descend, the way refracted light does */
    float band = smoothstep(w, 0.0, abs(uv.x - x - d * 0.11));
    shaft += band * (1.0 - smoothstep(0.05, 0.75, d));
  }
  col += shaft * 0.05 * uQuality;

  /* ---- suspended particles ---- */
  vec2 pgrid = floor(vec2(uv.x * aspect, uv.y) * 90.0);
  float pr = hash(pgrid);
  float drift = fract(pr * 7.3 + uTime * 0.012 * (0.4 + pr));
  float spark = step(0.9965, pr) * smoothstep(0.5, 1.0, 1.0 - abs(drift - 0.5) * 2.0);
  col += spark * 0.5 * uQuality;

  /* ---- the surface, seen from just underneath ---- */
  float sBand = smoothstep(0.055, 0.0, d);
  float ripple = sin((uv.x * aspect) * 46.0 + uTime * 1.1) * 0.5
               + sin((uv.x * aspect) * 23.0 - uTime * 0.75) * 0.5;
  col += sBand * (0.06 + ripple * 0.03) * vec3(0.9, 0.99, 1.0);

  /* a bright meniscus exactly on the line */
  float line = smoothstep(0.010, 0.0, abs(d - 0.004 - ripple * 0.0016));
  col = mix(col, vec3(1.0), line * 0.5);

  /* ---- depth fog: contrast drops as the camera descends ---- */
  col = mix(col, uDeepCol * 0.82, smoothstep(0.55, 1.0, d) * (0.28 + uDepth * 0.24));

  /* edge falloff so the pool sits inside the frame rather than tiling out */
  float edge = smoothstep(0.0, 0.10, uv.x) * smoothstep(1.0, 0.90, uv.x);
  col *= mix(0.93, 1.0, edge);

  /* the whole column loses light as the camera descends */
  col *= mix(1.0, 0.84, uDepth);

  gl_FragColor = vec4(col, 1.0);
}
`;
