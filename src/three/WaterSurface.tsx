import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { POOL } from './PoolSurfaces';

const VERT = /* glsl */ `
varying vec3 vWorld;
varying vec4 vScreen;
void main() {
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vScreen = projectionMatrix * mv;
  gl_Position = vScreen;
}
`;

const FRAG = /* glsl */ `
precision highp float;

varying vec3 vWorld;
varying vec4 vScreen;

uniform sampler2D uScene;
uniform sampler2D uDepth;
uniform vec2  uRes;
uniform float uTime;
uniform float uNear;
uniform float uFar;
uniform vec3  uEye;
uniform vec3  uSun;
uniform float uQuality;

/* three broad, slow swells rather than a field of small noise */
vec3 waveNormal(vec2 p, float t) {
  float h = 0.0;
  vec2 g = vec2(0.0);
  const int N = 4;
  vec2 dirs[4];  dirs[0] = vec2(1.0, 0.21); dirs[1] = vec2(-0.37, 1.0);
                 dirs[2] = vec2(0.82, -0.55); dirs[3] = vec2(-0.9, -0.34);
  float amps[4]; amps[0] = 0.010; amps[1] = 0.007; amps[2] = 0.004; amps[3] = 0.0022;
  float lens[4]; lens[0] = 4.6;   lens[1] = 2.7;   lens[2] = 1.35;  lens[3] = 0.62;
  float spds[4]; spds[0] = 0.42;  spds[1] = 0.61;  spds[2] = 0.88;  spds[3] = 1.35;

  for (int i = 0; i < N; i++) {
    vec2 d = normalize(dirs[i]);
    float k = 6.2831853 / lens[i];
    float ph = dot(d, p) * k + t * spds[i];
    h += sin(ph) * amps[i];
    g += d * cos(ph) * amps[i] * k;
  }
  return normalize(vec3(-g.x, 1.0, -g.y));
}

float linearDepth(float z) {
  float ndc = z * 2.0 - 1.0;
  return (2.0 * uNear * uFar) / (uFar + uNear - ndc * (uFar - uNear));
}

/* the same procedural sky the environment map is built from */
vec3 sky(vec3 dir) {
  float y = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 horizon = vec3(0.87, 0.90, 0.90);
  vec3 zenith  = vec3(0.58, 0.72, 0.84);
  vec3 c = mix(horizon, zenith, smoothstep(0.5, 1.0, y));
  c = mix(vec3(0.94, 0.92, 0.87), c, smoothstep(0.42, 0.62, y));
  return c;
}

void main() {
  vec2 uv = (vScreen.xy / vScreen.w) * 0.5 + 0.5;

  vec3 view = normalize(uEye - vWorld);
  float dist = length(uEye - vWorld);
  float near = 1.0 - smoothstep(6.0, 34.0, dist);
  vec3 n = waveNormal(vWorld.xz, uTime);
  n = normalize(mix(vec3(0.0, 1.0, 0.0), n, 0.25 + near * 0.75));

  /* how much water sits between the surface and whatever is under it */
  float sceneZ = linearDepth(texture2D(uDepth, uv).x);
  float surfZ  = linearDepth(gl_FragCoord.z);
  float thickness = clamp((sceneZ - surfZ) * 0.34, 0.0, 1.0);

  /* refraction: bend the lookup by the surface slope, and never let a
     shallow edge smear something that is actually in front of the water */
  vec2 offset = n.xz * (0.045 * uQuality) * (0.25 + thickness * 0.75) * (0.3 + near * 0.7);
  vec2 ruv = clamp(uv + offset, vec2(0.001), vec2(0.999));
  float rz = linearDepth(texture2D(uDepth, ruv).x);
  if (rz < surfZ) ruv = uv;

  vec3 refracted = texture2D(uScene, ruv).rgb;

  /* absorption: red goes first, so depth turns everything teal */
  vec3 deep = vec3(0.020, 0.208, 0.294);
  vec3 shallow = vec3(0.133, 0.510, 0.627);
  vec3 tint = mix(shallow, deep, thickness);
  refracted = mix(refracted, tint, clamp(pow(thickness, 0.7) * 1.35, 0.0, 0.96));

  /* reflection: sky by fresnel, plus one restrained sun glint */
  vec3 refl = reflect(-view, n);
  vec3 reflected = sky(refl);
  float fres = pow(1.0 - clamp(dot(view, n), 0.0, 1.0), 4.6);
  fres = mix(0.015, 0.42 + (1.0 - near) * 0.24, fres);

  vec3 col = mix(refracted, reflected, fres);

  vec3 h = normalize(uSun + view);
  float ndh = max(dot(n, h), 0.0);
  /* one tight glint plus a very soft sheen — anything broader reads as stripes */
  col += vec3(1.0, 0.985, 0.94) * (pow(ndh, 900.0) * 1.1 + pow(ndh, 90.0) * 0.035);

  /* the meniscus: a thin bright band wherever something breaks the surface */
  col += smoothstep(0.06, 0.0, thickness) * 0.16;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/**
 * The water surface.
 *
 * Renders the scene beneath it into an off-screen target each frame, then
 * samples that target with an offset driven by the wave normal — so the
 * submerged half of the swimmer is genuinely refracted, and the depth
 * buffer tells the shader how much water it is being seen through.
 */
export function WaterSurface({ quality }: { quality: 'high' | 'medium' | 'low' }) {
  const mesh = useRef<THREE.Mesh>(null);
  const { size, camera, gl, scene, viewport } = useThree();

  const fbo = useMemo(() => {
    const dpr = Math.min(viewport.dpr, quality === 'high' ? 1.5 : 1);
    const w = Math.max(2, Math.floor(size.width * dpr * (quality === 'low' ? 0.5 : 0.75)));
    const h = Math.max(2, Math.floor(size.height * dpr * (quality === 'low' ? 0.5 : 0.75)));
    const target = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      type: THREE.UnsignedByteType,
    });
    target.depthTexture = new THREE.DepthTexture(w, h);
    target.depthTexture.type = THREE.UnsignedShortType;
    return target;
  }, [size.width, size.height, viewport.dpr, quality]);

  const uniforms = useMemo(
    () => ({
      uScene: { value: fbo.texture },
      uDepth: { value: fbo.depthTexture },
      uRes: { value: new THREE.Vector2(size.width, size.height) },
      uTime: { value: 0 },
      uNear: { value: (camera as THREE.PerspectiveCamera).near },
      uFar: { value: (camera as THREE.PerspectiveCamera).far },
      uEye: { value: new THREE.Vector3() },
      uSun: { value: new THREE.Vector3(-0.55, 0.62, 0.56).normalize() },
      uQuality: { value: quality === 'low' ? 0.35 : 1 },
    }),
    [fbo, camera, quality, size.width, size.height]
  );

  // Taking priority here disables the automatic render, so the refraction
  // pass and the beauty pass stay in the right order.
  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    uniforms.uTime.value += dt;
    uniforms.uEye.value.copy(state.camera.position);
    uniforms.uRes.value.set(state.size.width, state.size.height);

    m.visible = false;
    gl.setRenderTarget(fbo);
    gl.render(scene, state.camera);
    gl.setRenderTarget(null);
    m.visible = true;

    gl.render(scene, state.camera);
  }, 1);

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} renderOrder={2}>
      <planeGeometry args={[POOL.width, POOL.length, 1, 1]} />
      <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} transparent={false} />
    </mesh>
  );
}
