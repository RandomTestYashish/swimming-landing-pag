import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildEnvironment } from './environment';

export type Quality = 'high' | 'medium' | 'low';

/**
 * Lighting and tone mapping for the whole scene: one warm sun from the
 * upper left, sky and ground bounce from the procedural environment, and
 * ACES tone mapping so the bright limestone rolls off instead of clipping.
 */
export function Stage({ quality }: { quality: Quality }) {
  const { gl, scene } = useThree();

  const env = useMemo(() => buildEnvironment(gl), [gl]);

  useEffect(() => {
    scene.environment = env;
    scene.background = new THREE.Color('#f2efe8');
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.9;
    return () => { env.dispose(); };
  }, [env, gl, scene]);

  return (
    <>
      <hemisphereLight args={['#dbeaf3', '#e8dfcd', 0.55]} />
      <directionalLight
        position={[-16, 19, 15]}
        intensity={2.5}
        color="#fff4e0"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0007}
        shadow-normalBias={0.02}
      />
      {/* a cool fill from the water side keeps the shadow faces from going dead */}
      <directionalLight position={[8, 6, 14]} intensity={0.28} color="#cfe6f2" />
    </>
  );
}
