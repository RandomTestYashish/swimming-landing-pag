export type Lesson = {
  /** two-digit chapter number, used by the progress rail */
  id: string;
  /** short label shown in the rail */
  label: string;
  /** editorial title for the chapter */
  title: string;
  /** one-line statement of what the swimmer is learning */
  statement: string;
  /** two or three supporting notes — kept short by design */
  notes: { k: string; v: string }[];
  /** how deep the camera sits during this chapter, 0 = surface, 1 = deep */
  depth: number;
  /** swimmer pose key driving the figure's state machine */
  pose: string;
};

export const LESSONS: Lesson[] = [
  {
    id: '01',
    label: 'Water Basics',
    title: 'Start with the water, not the stroke.',
    statement: 'Before technique comes comfort. Stand, enter, and let the water feel ordinary.',
    notes: [
      { k: 'Depth', v: 'Stay where you can stand.' },
      { k: 'Entry', v: 'Use the steps or the wall.' },
      { k: 'Time', v: 'Five quiet minutes is enough.' },
    ],
    depth: 0.05,
    pose: 'standing',
  },
  {
    id: '02',
    label: 'Breathing',
    title: 'Breathe out, the whole time your face is in.',
    statement: 'Beginners hold their breath. Swimmers empty their lungs slowly and never rush the next one.',
    notes: [
      { k: 'In', v: 'A normal breath above the surface.' },
      { k: 'Out', v: 'A long stream of bubbles below it.' },
      { k: 'Rhythm', v: 'Never hold. Never gasp.' },
    ],
    depth: 0.3,
    pose: 'bubbles',
  },
  {
    id: '03',
    label: 'Body Position',
    title: 'One line from fingertips to toes.',
    statement: 'The flatter and longer you are, the less water you have to push out of the way.',
    notes: [
      { k: 'Head', v: 'Eyes down, in line with the spine.' },
      { k: 'Hips', v: 'High, just under the surface.' },
      { k: 'Legs', v: 'Long, loose, pointed.' },
    ],
    depth: 0.45,
    pose: 'streamline',
  },
  {
    id: '04',
    label: 'Floating',
    title: 'Let the water hold you.',
    statement: 'Buoyancy is not a technique. It is what happens when you stop fighting.',
    notes: [
      { k: 'Front', v: 'Face down, arms wide, breathe out.' },
      { k: 'Back', v: 'Ears under, chin up, ribs open.' },
      { k: 'Recover', v: 'Tuck, plant your feet, stand.' },
    ],
    depth: 0.35,
    pose: 'float',
  },
  {
    id: '05',
    label: 'Freestyle',
    title: 'Long, continuous, unhurried.',
    statement: 'One arm enters as the other finishes. The body rolls with them, not against them.',
    notes: [
      { k: 'Catch', v: 'Fingers down, elbow high.' },
      { k: 'Pull', v: 'Move past your hand.' },
      { k: 'Roll', v: 'Shoulders lead, hips follow.' },
    ],
    depth: 0.6,
    pose: 'freestyle',
  },
  {
    id: '06',
    label: 'Kick',
    title: 'The kick starts at the hip.',
    statement: 'Small, steady, continuous. If your knees are leading, you are cycling, not kicking.',
    notes: [
      { k: 'Size', v: 'Feet stay inside the body line.' },
      { k: 'Ankles', v: 'Loose. Toes pointed.' },
      { k: 'Tempo', v: 'Six beats to one stroke cycle.' },
    ],
    depth: 0.75,
    pose: 'kick',
  },
  {
    id: '07',
    label: 'Arm Movement',
    title: 'Entry, catch, pull, push, recover.',
    statement: 'Five moments in one arm cycle. Learn them slowly and the speed arrives on its own.',
    notes: [
      { k: 'Entry', v: 'Fingertips first, in front of the shoulder.' },
      { k: 'Push', v: 'Finish past the hip, every time.' },
      { k: 'Recover', v: 'Relax the arm on the way forward.' },
    ],
    depth: 0.85,
    pose: 'armcycle',
  },
  {
    id: '08',
    label: 'Breathing Technique',
    title: 'Turn with the body, not the neck.',
    statement: 'One goggle stays in the water. The head rides the roll that is already happening.',
    notes: [
      { k: 'Timing', v: 'As the near arm finishes.' },
      { k: 'Angle', v: 'Cheek on the water, one eye under.' },
      { k: 'Return', v: 'Face down before the arm enters.' },
    ],
    depth: 0.65,
    pose: 'breathe',
  },
  {
    id: '09',
    label: 'Confidence',
    title: 'You do not need the whole pool. Just the next movement.',
    statement: 'Water confidence is built one repetition at a time, in water you can stand up in.',
    notes: [
      { k: 'Practice', v: 'Two or three short sessions a week.' },
      { k: 'Safety', v: 'Never alone. Always supervised.' },
      { k: 'Progress', v: 'Comfort first, speed much later.' },
    ],
    depth: 0.2,
    pose: 'glide',
  },
];
