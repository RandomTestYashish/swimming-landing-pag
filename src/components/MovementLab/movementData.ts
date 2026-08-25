import type { Movement } from '../../three/SwimmerModel';

export type MovementSpec = {
  id: Movement;
  n: string;
  label: string;
  title: string;
  body: string;
  /** camera placement chosen for what this movement needs you to see */
  cam: [number, number, number];
  target: [number, number, number];
  /** at most two notes, pinned to a point on the body */
  notes: { at: [number, number, number]; text: string; side?: 'left' | 'right' }[];
};

export const MOVEMENTS: MovementSpec[] = [
  {
    id: 'body',
    n: '01',
    label: 'Body position',
    title: 'One long line, just under the surface.',
    body: 'Head neutral, eyes down, hips high. Everything you do afterwards is easier from here.',
    cam: [0.15, 0.5, 3.5],
    target: [0.25, -0.12, 0],
    notes: [
      { at: [0.66, 0.08, 0], text: 'Neutral head', side: 'right' },
      { at: [0.02, -0.14, 0], text: 'Hips near the surface', side: 'left' },
    ],
  },
  {
    id: 'kick',
    n: '02',
    label: 'Kick',
    title: 'Compact, and from the hip.',
    body: 'A small continuous beat. If the knee is leading, the legs are cycling rather than kicking.',
    cam: [-1.7, 0.45, 2.6],
    target: [-0.45, -0.14, 0],
    notes: [
      { at: [-0.1, 0.06, 0.08], text: 'Drive from the hip', side: 'right' },
      { at: [-1.0, -0.16, 0.08], text: 'Loose ankle', side: 'left' },
    ],
  },
  {
    id: 'catch',
    n: '03',
    label: 'Catch',
    title: 'Fingers down before the arm moves back.',
    body: 'Set the forearm early and keep the elbow above the hand. This is where the stroke is won.',
    cam: [2.2, 0.6, 2.5],
    target: [0.55, -0.2, 0.1],
    notes: [
      { at: [0.86, 0.06, 0.26], text: 'Elbow stays high', side: 'right' },
      { at: [1.16, -0.36, 0.26], text: 'Fingertips down', side: 'left' },
    ],
  },
  {
    id: 'pull',
    n: '04',
    label: 'Pull',
    title: 'Press the water backwards, not down.',
    body: 'The hand travels straight back beneath the body. You move past your hand, rather than pulling it to you.',
    cam: [1.3, -0.3, 3.1],
    target: [0.3, -0.3, 0],
    notes: [
      { at: [0.55, -0.44, 0.2], text: 'Press water backwards', side: 'right' },
      { at: [-0.18, -0.1, 0.2], text: 'Finish past the hip', side: 'left' },
    ],
  },
  {
    id: 'breathing',
    n: '05',
    label: 'Breathing',
    title: 'Turn with the body, not the neck.',
    body: 'The roll is already happening. Ride it, take the breath, and leave one goggle in the water.',
    cam: [1.5, 0.3, 2.7],
    target: [0.6, -0.08, 0],
    notes: [
      { at: [0.72, 0.12, 0.16], text: 'One goggle stays under', side: 'right' },
      { at: [0.0, -0.16, 0.2], text: 'Roll from the hips', side: 'left' },
    ],
  },
  {
    id: 'full',
    n: '06',
    label: 'Full stroke',
    title: 'Put it together, slowly.',
    body: 'Long on the front, continuous at the back. The speed arrives on its own once the shape is right.',
    cam: [0.9, 0.75, 4.6],
    target: [0.2, -0.16, 0],
    notes: [],
  },
];
