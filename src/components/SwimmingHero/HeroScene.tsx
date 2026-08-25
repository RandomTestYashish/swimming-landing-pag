import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Stage, type Quality } from '../../three/Stage';
import { PoolSurfaces } from '../../three/PoolSurfaces';
import { WaterSurface } from '../../three/WaterSurface';
import { SwimmerModel } from '../../three/SwimmerModel';
import { Architecture } from '../../three/Architecture';

type Props = { quality: Quality; reduced: boolean; pointer: React.RefObject<{ x: number; y: number }> };

/** Camera: a long lens from just above the water, barely moved by the pointer. */
function HeroCamera({ reduced, pointer }: { reduced: boolean; pointer: Props['pointer'] }) {
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3(0.4, 1.28, -10));
  const base = useRef(new THREE.Vector3(2.4, 3.6, 13));

  // A portrait frame is not the desktop shot cropped: the lens widens and
  // the camera swings toward the swimmer so the body stays whole.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const portrait = size.width / size.height < 0.95;
    if (portrait) {
      cam.fov = 46;
      base.current.set(2.4, 3.1, 9.2);
      target.current.set(2.3, 1.0, -6);
    } else {
      cam.fov = size.width / size.height < 1.5 ? 33 : 27;
      base.current.set(2.4, 3.6, 13);
      target.current.set(0.4, 1.28, -10);
    }
    cam.updateProjectionMatrix();
    camera.position.copy(base.current);
    camera.lookAt(target.current);
  }, [camera, size.width, size.height]);

  useFrame((_, dt) => {
    if (reduced) return;
    const p = pointer.current ?? { x: 0, y: 0 };
    // a very small parallax: enough to feel alive, never enough to notice
    const wantX = base.current.x + p.x * 0.42;
    const wantY = base.current.y + p.y * -0.2;
    const k = Math.min(1, dt * 1.6);
    camera.position.x += (wantX - camera.position.x) * k;
    camera.position.y += (wantY - camera.position.y) * k;
    camera.lookAt(target.current);
  });
  return null;
}

export function HeroScene({ quality, reduced, pointer }: Props) {
  return (
    <Canvas
      className="hero-canvas"
      dpr={quality === 'high' ? [1, 1.6] : [1, 1.2]}
      gl={{ antialias: quality !== 'low', powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 27, near: 0.4, far: 130 }}
      shadows={quality !== 'low'}
      frameloop={reduced ? 'demand' : 'always'}
    >
      <Suspense fallback={null}>
        <Stage quality={quality} />
        <HeroCamera reduced={reduced} pointer={pointer} />
        <Architecture />
        <PoolSurfaces quality={quality} />
        {/* the body sits at the surface: back breaking it, everything else under */}
        <group position={[2.6, -0.12, -1.2]} rotation={[0, -0.13, 0]}>
          <SwimmerModel movement="full" playing={!reduced} speed={0.75} reduced={reduced} />
        </group>
        <WaterSurface quality={quality} />
      </Suspense>
    </Canvas>
  );
}
