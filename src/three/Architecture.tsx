import { useMemo } from 'react';
import * as THREE from 'three';
import { POOL } from './PoolSurfaces';

/**
 * The room the pool sits in: a limestone deck, a low wall behind it, and a
 * mass of planting at one edge. Kept deliberately plain — the architecture
 * is a ground for the water, not a subject.
 */
export function Architecture() {
  const stone = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#e9e4d8';
    ctx.fillRect(0, 0, 256, 256);
    // fine aggregate, so the deck is not a flat fill under raking light
    for (let i = 0; i < 5200; i++) {
      const v = 200 + Math.random() * 55;
      ctx.fillStyle = `rgba(${v},${v - 6},${v - 18},${0.05 + Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.4, 1.4);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(14, 6);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  // planting: a cluster of flattened spheres reads as a canopy mass once
  // it is backlit and thrown out of focus by distance
  const canopy = useMemo(() => {
    const out: { p: [number, number, number]; s: number; tone: string }[] = [];
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 46; i++) {
      const a = rnd();
      out.push({
        p: [15 + rnd() * 11, 3.4 + rnd() * 4.2, 2 - rnd() * 12],
        s: 0.9 + rnd() * 1.9,
        tone: a < 0.34 ? '#6f8f4a' : a < 0.7 ? '#54763a' : '#87a95c',
      });
    }
    return out;
  }, []);

  return (
    <group>
      {/* the coping the water meets — the brightest line in the frame */}
      <mesh position={[0, 0.05, -POOL.length / 2 - 0.22]} receiveShadow castShadow>
        <boxGeometry args={[POOL.width + 40, 0.2, 0.44]} />
        <meshStandardMaterial color="#f3eee2" roughness={0.82} />
      </mesh>
      {/* deck, running back from that edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, -POOL.length / 2 - 5]} receiveShadow>
        <planeGeometry args={[POOL.width + 40, 10]} />
        <meshStandardMaterial map={stone} color="#d8d1bf" roughness={0.96} metalness={0} />
      </mesh>
      {/* a low wall gives the deck an end and casts the long shadow */}
      <mesh position={[0, 0.78, -POOL.length / 2 - 9.6]} receiveShadow castShadow>
        <boxGeometry args={[POOL.width + 40, 1.56, 0.6]} />
        <meshStandardMaterial color="#cbc3ae" roughness={0.97} />
      </mesh>
      {/* the far building: a flat value that separates from the sky */}
      <mesh position={[0, 5.4, -POOL.length / 2 - 17]}>
        <planeGeometry args={[POOL.width + 60, 9.6]} />
        <meshBasicMaterial color="#e2dbca" />
      </mesh>

      {canopy.map((c, i) => (
        <mesh key={i} position={c.p} scale={[c.s, c.s * 0.68, c.s * 0.9]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={c.tone} roughness={1} metalness={0} />
        </mesh>
      ))}
      {/* trunks, barely there */}
      {[0, 1].map((i) => (
        <mesh key={i} position={[17 + i * 5, 1.9, -1 - i * 5]}>
          <cylinderGeometry args={[0.13, 0.19, 4.2, 8]} />
          <meshStandardMaterial color="#8d8474" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
