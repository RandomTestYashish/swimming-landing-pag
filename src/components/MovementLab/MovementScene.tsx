import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Stage, type Quality } from '../../three/Stage';
import { SwimmerModel, type Movement } from '../../three/SwimmerModel';
import { CAUSTIC_GLSL } from '../../three/caustics';
import { MOVEMENTS } from './movementData';

type Props = {
  movement: Movement;
  playing: boolean;
  speed: number;
  reduced: boolean;
  quality: Quality;
  resetKey: number;
  onProject: (points: { x: number; y: number; visible: boolean }[]) => void;
};

/** A training view: no pool walls, just the body in graded water. */
function Backdrop() {
  const uniforms = useRef({ uTime: { value: 0 } });
  useFrame((_, dt) => { uniforms.current.uTime.value += dt; });
  return (
    <mesh position={[0, -0.4, -4]} scale={[26, 14, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms.current}
        vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
        fragmentShader={`
          precision highp float; varying vec2 vUv; uniform float uTime;
          ${CAUSTIC_GLSL}
          void main(){
            vec3 top = vec3(0.929, 0.941, 0.925);
            vec3 mid = vec3(0.667, 0.792, 0.827);
            vec3 low = vec3(0.180, 0.443, 0.545);
            float y = vUv.y;
            vec3 c = mix(low, mid, smoothstep(0.0, 0.62, y));
            c = mix(c, top, smoothstep(0.68, 1.0, y));
            float caus = causticField(vec2(vUv.x * 16.0, (1.0 - y) * 7.0), uTime * 0.2);
            c += caus * (1.0 - smoothstep(0.2, 0.95, y)) * 0.13;
            gl_FragColor = vec4(c, 1.0);
          }`}
      />
    </mesh>
  );
}

function Rig({ movement, resetKey, reduced, onProject }: Omit<Props, 'playing' | 'speed' | 'quality'>) {
  const { camera, size } = useThree();
  const want = useRef({ pos: new THREE.Vector3(), tgt: new THREE.Vector3() });
  const tgt = useRef(new THREE.Vector3());
  const v = useMemo(() => new THREE.Vector3(), []);

  const spec = MOVEMENTS.find((m) => m.id === movement) ?? MOVEMENTS[0];

  useEffect(() => {
    want.current.pos.set(...spec.cam);
    want.current.tgt.set(...spec.target);
    if (reduced) {
      camera.position.copy(want.current.pos);
      tgt.current.copy(want.current.tgt);
      camera.lookAt(tgt.current);
    }
  }, [spec, camera, reduced, resetKey]);

  useFrame((_, dt) => {
    const k = Math.min(1, dt * 2.1);
    camera.position.lerp(want.current.pos, k);
    tgt.current.lerp(want.current.tgt, k);
    camera.lookAt(tgt.current);

    // project the note anchors so the DOM labels can track the body
    onProject(
      spec.notes.map((n) => {
        v.set(...n.at).project(camera);
        return {
          x: (v.x * 0.5 + 0.5) * size.width,
          y: (-v.y * 0.5 + 0.5) * size.height,
          visible: v.z < 1,
        };
      })
    );
  });

  return null;
}

export function MovementScene({ movement, playing, speed, reduced, quality, resetKey, onProject }: Props) {
  return (
    <Canvas
      dpr={quality === 'high' ? [1, 1.6] : [1, 1.2]}
      gl={{ antialias: quality !== 'low', alpha: false }}
      camera={{ fov: 34, near: 0.2, far: 60, position: [0.2, 0.55, 4.6] }}
      shadows={false}
      frameloop={reduced ? 'demand' : 'always'}
    >
      <Stage quality={quality} />
      <Backdrop />
      <Rig movement={movement} reduced={reduced} resetKey={resetKey} onProject={onProject} />
      <SwimmerModel
        movement={movement}
        playing={playing}
        speed={speed}
        reduced={reduced}
        castShadow={false}
      />
    </Canvas>
  );
}
