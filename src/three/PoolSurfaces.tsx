import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CAUSTIC_GLSL } from './caustics';

export const POOL = {
  width: 46,     // along X, the direction of travel
  length: 30,    // along Z, toward the camera
  depth: 2.35,   // floor below the surface
};

/**
 * Pool floor and walls.
 *
 * Standard physically based surfaces, with caustics and depth absorption
 * patched into the shader — so the tile is genuinely lit by the moving
 * water above it rather than having a caustic image laid over the top.
 */
export function PoolSurfaces({ quality }: { quality: 'high' | 'medium' | 'low' }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const uniforms = useRef({ uTime: { value: 0 }, uCaustic: { value: quality === 'low' ? 0 : 1 } });

  const tile = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#dfe6e4';
    ctx.fillRect(0, 0, 256, 256);
    // grout: a soft valley, not a drawn line
    ctx.strokeStyle = 'rgba(120,140,142,0.5)';
    ctx.lineWidth = 4;
    for (let i = 0; i <= 4; i++) {
      const p = (i / 4) * 256;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 256); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(256, p); ctx.stroke();
    }
    // faint per-tile variation so the grid never reads as wallpaper
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.06})`;
        ctx.fillRect(x * 64 + 3, y * 64 + 3, 58, 58);
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(POOL.width / 1.5, POOL.length / 1.5);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);

  useFrame((_, dt) => { uniforms.current.uTime.value += dt; });

  const patch = (shader: THREE.WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = uniforms.current.uTime;
    shader.uniforms.uCaustic = uniforms.current.uCaustic;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWorld;')
      .replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\n vWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;'
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWorld;\nuniform float uTime;\nuniform float uCaustic;\n${CAUSTIC_GLSL}`)
      .replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
         // caustics fall from the surface onto whatever is beneath
         float caus = uCaustic > 0.5 ? causticField(vWorld.xz * 1.05, uTime * 0.24) : 0.0;
         float lit = 1.0 - smoothstep(0.0, ${POOL.depth.toFixed(2)}, -vWorld.y);
         gl_FragColor.rgb += caus * (0.16 + lit * 0.5) * vec3(0.86, 0.99, 1.0);
         // water absorbs the surface's colour with distance
         float col = clamp(-vWorld.y / ${POOL.depth.toFixed(2)}, 0.0, 1.0);
         gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.043, 0.353, 0.451), col * 0.72);`
      );
  };

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -POOL.depth, 0]} receiveShadow>
        <planeGeometry args={[POOL.width, POOL.length]} />
        <meshStandardMaterial ref={mat} map={tile} roughness={0.72} metalness={0} onBeforeCompile={patch} />
      </mesh>
      {/* far wall */}
      <mesh position={[0, -POOL.depth / 2, -POOL.length / 2]} receiveShadow>
        <planeGeometry args={[POOL.width, POOL.depth]} />
        <meshStandardMaterial map={tile} roughness={0.72} metalness={0} onBeforeCompile={patch} />
      </mesh>
      {/* near wall, seen from inside */}
      <mesh position={[0, -POOL.depth / 2, POOL.length / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[POOL.width, POOL.depth]} />
        <meshStandardMaterial map={tile} roughness={0.72} metalness={0} onBeforeCompile={patch} />
      </mesh>
    </group>
  );
}
