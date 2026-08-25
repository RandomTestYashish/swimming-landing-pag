import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { limbGeometry, torsoGeometry, headGeometry } from './body';

export type Movement = 'body' | 'kick' | 'catch' | 'pull' | 'breathing' | 'full';

type Props = {
  movement?: Movement;
  playing?: boolean;
  speed?: number;
  reduced?: boolean;
  /** metres travelled per second along +X, 0 holds the swimmer in frame */
  drift?: number;
  castShadow?: boolean;
};

const TAU = Math.PI * 2;

/* Where each lesson freezes the stroke, and what it lets keep moving.
   `stream` holds both arms extended in front, which is what body position
   and kick actually want — the alternating cycle would misrepresent them. */
const FOCUS: Record<Movement, {
  phase: number; live: boolean; legs: number; roll: number; stream?: boolean;
}> = {
  body:      { phase: 0.0,  live: false, legs: 0.30, roll: 0.08, stream: true },
  kick:      { phase: 0.0,  live: true,  legs: 1.0,  roll: 0.10, stream: true },
  catch:     { phase: 0.07, live: false, legs: 0.35, roll: 0.7 },
  pull:      { phase: 0.21, live: false, legs: 0.35, roll: 1.0 },
  breathing: { phase: 0.66, live: true,  legs: 0.6,  roll: 1.0 },
  full:      { phase: 0,    live: true,  legs: 1.0,  roll: 1.0 },
};

/**
 * A swimmer built from geometry rather than drawn.
 *
 * Fourteen joints on a prone body travelling along +X, face down. The
 * freestyle cycle is driven by one phase value: each arm sweeps a full
 * turn half a cycle apart, the legs beat six times against it, and the
 * torso rolls with the arms rather than against them.
 */
export function SwimmerModel({
  movement = 'full',
  playing = true,
  speed = 1,
  reduced = false,
  drift = 0,
  castShadow = true,
}: Props) {
  const root = useRef<THREE.Group>(null);
  const spine = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);
  const foreL = useRef<THREE.Group>(null);
  const hipR = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const phase = useRef(0);

  const geo = useMemo(
    () => ({
      torso: torsoGeometry(),
      head: headGeometry(),
      upperArm: limbGeometry(0.30, 0.062, 0.058, 0.044),
      foreArm: limbGeometry(0.27, 0.046, 0.048, 0.032),
      hand: limbGeometry(0.20, 0.034, 0.040, 0.016),
      thigh: limbGeometry(0.43, 0.098, 0.092, 0.058),
      shin: limbGeometry(0.41, 0.060, 0.066, 0.030),
      foot: limbGeometry(0.23, 0.032, 0.030, 0.014),
      neck: limbGeometry(0.09, 0.048, 0.050, 0.052),
    }),
    []
  );

  const mats = useMemo(() => {
    const skin = new THREE.MeshPhysicalMaterial({
      color: '#a97551', roughness: 0.52, clearcoat: 0.3, clearcoatRoughness: 0.28, envMapIntensity: 0.6,
    });
    const suit = new THREE.MeshPhysicalMaterial({
      color: '#152238', roughness: 0.4, clearcoat: 0.4, clearcoatRoughness: 0.22, envMapIntensity: 0.55,
    });
    const cap = new THREE.MeshPhysicalMaterial({
      color: '#0e1520', roughness: 0.28, clearcoat: 0.55, clearcoatRoughness: 0.16, envMapIntensity: 0.7,
    });
    return { skin, suit, cap };
  }, []);

  useFrame((_, dt) => {
    const f = FOCUS[movement];
    const live = f.live && playing && !reduced;
    if (live) phase.current += dt * 0.2 * speed;
    const p = live ? phase.current % 1 : f.phase;

    const th = p * TAU;
    const thL = th + Math.PI;

    // arms: a full turn each, half a cycle apart. Negative Z sweeps the
    // hand down and back, which is the propulsive half of the stroke.
    const bend = (a: number) => {
      const s = Math.sin(a);
      return Math.max(0, s) * 1.15 + Math.max(0, -s) * 1.4;
    };
    if (f.stream) {
      // both arms long in front, a hand's width apart
      if (armR.current) { armR.current.rotation.z = 0.06; armR.current.rotation.y = -0.05; }
      if (armL.current) { armL.current.rotation.z = 0.06; armL.current.rotation.y = 0.05; }
      if (foreR.current) foreR.current.rotation.z = 0;
      if (foreL.current) foreL.current.rotation.z = 0;
    } else {
      if (armR.current) { armR.current.rotation.z = -th; armR.current.rotation.y = Math.sin(th) * 0.14; }
      if (armL.current) { armL.current.rotation.z = -thL; armL.current.rotation.y = Math.sin(thL) * 0.14; }
      if (foreR.current) foreR.current.rotation.z = -bend(th);
      if (foreL.current) foreL.current.rotation.z = -bend(thL);
    }

    // six-beat flutter, driven from the hip with the knee trailing
    const beat = Math.sin(TAU * (f.stream ? 1.6 : 3) * (live ? phase.current : p)) * f.legs;
    if (hipR.current) hipR.current.rotation.z = beat * 0.26;
    if (hipL.current) hipL.current.rotation.z = -beat * 0.26;
    if (kneeR.current) kneeR.current.rotation.z = -Math.max(0, beat) * 0.42;
    if (kneeL.current) kneeL.current.rotation.z = -Math.max(0, -beat) * 0.42;

    // the body rolls with the arms; the head rides that roll to breathe
    if (spine.current) spine.current.rotation.x = Math.sin(f.stream ? 0 : th) * 0.44 * f.roll;
    if (head.current) {
      const window = movement === 'breathing' ? 1 : 0.45;
      const turn = Math.max(0, Math.sin(th - 0.9)) ** 2 * window;
      head.current.rotation.x = turn * 1.15;
      head.current.rotation.z = -0.06 - turn * 0.12;
    }

    if (root.current && drift) {
      root.current.position.x = ((root.current.position.x + dt * drift + 8) % 16) - 8;
    }
  });

  const S = (props: { g: THREE.BufferGeometry; m?: THREE.Material; [k: string]: unknown }) => {
    const { g, m, ...rest } = props;
    return <mesh geometry={g} material={m ?? mats.skin} castShadow={castShadow} receiveShadow {...rest} />;
  };

  return (
    <group ref={root}>
      <group ref={spine}>
        {/* torso runs from the hips forward along +X */}
        <S g={geo.torso} />
        {/* jammers */}
        {/* jammers, matched to the torso's elliptical section so they sit on
            the body rather than clamping round it */}
        <mesh
          position={[0.09, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[1.26, 1, 0.84]}
          material={mats.suit}
          castShadow
        >
          <cylinderGeometry args={[0.136, 0.126, 0.23, 26, 1, true]} />
        </mesh>

        {/* neck and head */}
        <group position={[0.56, 0.012, 0]}>
          <S g={geo.neck} rotation={[0, 0, -0.25]} />
          <group ref={head} position={[0.085, 0.026, 0]}>
            <S g={geo.head} m={mats.cap} />
            {/* the face is the only part left in skin; the cap covers the rest */}
            {/* the face, the only part the cap leaves bare */}
            <mesh position={[0.055, -0.028, 0]} rotation={[0, 0, -0.35]} material={mats.skin} castShadow>
              <sphereGeometry args={[0.076, 18, 14, 0, Math.PI * 0.95, 0.5, Math.PI * 0.6]} />
            </mesh>
            {/* goggles */}
            <mesh position={[0.082, -0.006, 0]} rotation={[Math.PI / 2, 0, 0.2]} material={mats.cap}>
              <torusGeometry args={[0.049, 0.013, 10, 20, Math.PI * 1.05]} />
            </mesh>
          </group>
        </group>

        {/* arms hang off the shoulder girdle */}
        <group ref={armR} position={[0.50, 0.02, 0.155]}>
          <S g={geo.upperArm} />
          <group ref={foreR} position={[0.30, 0, 0]}>
            <S g={geo.foreArm} />
            <group position={[0.27, 0, 0]}>
              <S g={geo.hand} />
            </group>
          </group>
        </group>
        <group ref={armL} position={[0.50, 0.02, -0.155]}>
          <S g={geo.upperArm} />
          <group ref={foreL} position={[0.30, 0, 0]}>
            <S g={geo.foreArm} />
            <group position={[0.27, 0, 0]}>
              <S g={geo.hand} />
            </group>
          </group>
        </group>
      </group>

      {/* legs trail from the hips along -X */}
      <group ref={hipR} position={[0.02, 0, 0.075]} rotation={[0, Math.PI, 0]}>
        <S g={geo.thigh} />
        <group ref={kneeR} position={[0.43, 0, 0]}>
          <S g={geo.shin} />
          <group position={[0.41, 0, 0]} rotation={[0, 0, 0.28]}>
            <S g={geo.foot} />
          </group>
        </group>
      </group>
      <group ref={hipL} position={[0.02, 0, -0.075]} rotation={[0, Math.PI, 0]}>
        <S g={geo.thigh} />
        <group ref={kneeL} position={[0.43, 0, 0]}>
          <S g={geo.shin} />
          <group position={[0.41, 0, 0]} rotation={[0, 0, 0.28]}>
            <S g={geo.foot} />
          </group>
        </group>
      </group>
    </group>
  );
}
