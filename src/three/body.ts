import * as THREE from 'three';

/**
 * A limb segment as a volume of revolution.
 *
 * Real limbs are not capsules: they have a belly and they taper. Passing a
 * profile gives each segment its own silhouette — a calf that swells high
 * and narrows into the achilles, a forearm thickest near the elbow — which
 * is most of what makes a body read as anatomical at a distance.
 */
export function limbGeometry(
  length: number,
  r0: number,
  rMid: number,
  r1: number,
  segments = 18
): THREE.BufferGeometry {
  const prof: THREE.Vector2[] = [
    new THREE.Vector2(0.0001, 0),
    new THREE.Vector2(r0 * 0.62, length * 0.02),
    new THREE.Vector2(r0, length * 0.09),
    new THREE.Vector2(rMid, length * 0.42),
    new THREE.Vector2(r1 * 1.06, length * 0.82),
    new THREE.Vector2(r1, length * 0.93),
    new THREE.Vector2(r1 * 0.5, length * 0.985),
    new THREE.Vector2(0.0001, length),
  ];
  const geo = new THREE.LatheGeometry(prof, segments);
  // the lathe runs along +Y; the body is built along +X
  geo.rotateZ(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

/** Torso: same idea, then flattened front-to-back and widened side-to-side. */
export function torsoGeometry(): THREE.BufferGeometry {
  const L = 0.56;
  const prof: THREE.Vector2[] = [
    new THREE.Vector2(0.0001, 0),
    new THREE.Vector2(0.104, L * 0.03),
    new THREE.Vector2(0.132, L * 0.12),   // hips
    new THREE.Vector2(0.121, L * 0.34),   // waist
    new THREE.Vector2(0.146, L * 0.62),   // ribs
    new THREE.Vector2(0.158, L * 0.84),   // chest
    new THREE.Vector2(0.128, L * 0.96),   // shoulder girdle
    new THREE.Vector2(0.0001, L),
  ];
  const geo = new THREE.LatheGeometry(prof, 26);
  geo.rotateZ(-Math.PI / 2);
  geo.scale(1, 0.82, 1.24); // shallow back-to-belly, broad across the shoulders
  geo.computeVertexNormals();
  return geo;
}

export function headGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.098, 24, 18);
  geo.scale(1.22, 0.98, 0.92); // longer front-to-back than it is wide
  geo.computeVertexNormals();
  return geo;
}

export const SKIN = {
  color: new THREE.Color('#b8845f'),
  roughness: 0.46,
  clearcoat: 0.4,
  clearcoatRoughness: 0.22,
};
