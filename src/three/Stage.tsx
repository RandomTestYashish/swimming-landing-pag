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
type StageProps = {
  quality: Quality;
  theme: 'light' | 'dark';
  /** 'pool' is the hero's real environment; 'studio' is the teaching view,
      which needs the body readable rather than atmospheric */
  variant?: 'pool' | 'studio';
};

export function Stage({ quality, theme, variant = 'pool' }: StageProps) {
  const dark = theme === 'dark';
  const studio = variant === 'studio';
  const { gl, scene } = useThree();

  const envRT = useMemo(() => buildEnvironment(gl, dark), [gl, dark]);
  const env = envRT.texture;

  useEffect(() => {
    scene.environment = env;
    scene.background = new THREE.Color(dark ? '#11161a' : '#eff1f1');
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = dark ? 1.08 : 0.9;
    return () => { envRT.dispose(); };
  }, [env, envRT, gl, scene, dark]);

  return (
    <>
      <hemisphereLight args={dark ? (studio ? ['#5b7f93', '#1a242b', 1.0] : ['#20313d', '#0c1318', 0.4]) : ['#dbeaf3', '#dfe4e4', 0.55]} />
      <directionalLight
        position={dark ? [-20, 7, 14] : [-16, 19, 15]}
        intensity={dark ? (studio ? 1.5 : 0.55) : 2.5}
        color={dark ? (studio ? '#dfeaf2' : '#c8ad88') : '#fff4e0'}
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
      <directionalLight
        position={[8, 6, 14]}
        intensity={dark ? (studio ? 0.6 : 0.1) : 0.28}
        color="#cfe6f2"
      />

      {/* at dusk the pool is the light source: lamps set into the walls */}
      {dark && !studio && (
        <>
          <pointLight position={[-11, -1.7, -3]} intensity={16} distance={17} decay={2} color="#86d2f0" />
          <pointLight position={[2, -1.7, -3]} intensity={16} distance={17} decay={2} color="#86d2f0" />
          <pointLight position={[15, -1.7, -3]} intensity={12} distance={15} decay={2} color="#86d2f0" />
        </>
      )}
    </>
  );
}
