export type Grid = number[][];

export interface ArcExample {
  input: Grid;
  output: Grid;
}

export interface ArcPuzzle {
  dayNumber: number;
  title: string;
  ruleHint: string;
  examples: ArcExample[];
  testInput: Grid;
  options: Grid[];
  correctOptionIndex: number;
  explanation: string;
}

interface RawArcPuzzle {
  title: string;
  ruleHint: string;
  examples: ArcExample[];
  testInput: Grid;
  correctOutput: Grid;
  distractors: Grid[];
  explanation: string;
}

// ---------------------------------------------------------------------
// Curated Foundational ARC Visual Reasoning Puzzles (3x3 Grids)
// Colors: 0=Black, 1=Blue, 2=Red, 3=Green, 4=Yellow, 6=Magenta, 7=Orange, 8=Cyan
// ---------------------------------------------------------------------
const ARC_CATALOG: RawArcPuzzle[] = [
  // 0. Horizontal Reflection
  {
    title: 'Symmetry Mirror',
    ruleHint: 'Horizontal Reflection across center axis',
    examples: [
      {
        input: [
          [1, 0, 0],
          [1, 1, 0],
          [2, 0, 0],
        ],
        output: [
          [0, 0, 1],
          [0, 1, 1],
          [0, 0, 2],
        ],
      },
      {
        input: [
          [3, 3, 0],
          [0, 3, 0],
          [4, 0, 0],
        ],
        output: [
          [0, 3, 3],
          [0, 3, 0],
          [0, 0, 4],
        ],
      },
    ],
    testInput: [
      [7, 0, 0],
      [7, 7, 0],
      [8, 8, 8],
    ],
    correctOutput: [
      [0, 0, 7],
      [0, 7, 7],
      [8, 8, 8],
    ],
    distractors: [
      [
        [7, 7, 0],
        [0, 7, 7],
        [8, 8, 8],
      ],
      [
        [0, 0, 7],
        [7, 7, 0],
        [8, 8, 8],
      ],
      [
        [8, 8, 8],
        [0, 7, 7],
        [0, 0, 7],
      ],
    ],
    explanation: 'Every row is horizontally flipped (reflected left-to-right).',
  },
  // 1. 90-Degree Clockwise Rotation
  {
    title: 'Orbital Rotation',
    ruleHint: 'Rotate the grid 90° clockwise',
    examples: [
      {
        input: [
          [1, 2, 3],
          [0, 0, 0],
          [0, 0, 0],
        ],
        output: [
          [0, 0, 1],
          [0, 0, 2],
          [0, 0, 3],
        ],
      },
      {
        input: [
          [4, 0, 0],
          [4, 0, 0],
          [0, 0, 0],
        ],
        output: [
          [0, 4, 4],
          [0, 0, 0],
          [0, 0, 0],
        ],
      },
    ],
    testInput: [
      [6, 6, 0],
      [0, 6, 0],
      [0, 0, 0],
    ],
    correctOutput: [
      [0, 0, 6],
      [0, 6, 6],
      [0, 0, 0],
    ],
    distractors: [
      [
        [0, 6, 0],
        [6, 6, 0],
        [0, 0, 0],
      ],
      [
        [0, 0, 0],
        [0, 6, 6],
        [0, 0, 6],
      ],
      [
        [6, 6, 0],
        [0, 6, 0],
        [0, 0, 0],
      ],
    ],
    explanation: 'The entire 3x3 grid undergoes a rigid 90-degree clockwise rotation.',
  },
  // 2. Gravitational Fall (Drop to Bottom)
  {
    title: 'Gravity Well',
    ruleHint: 'Objects fall straight down into lowest available row',
    examples: [
      {
        input: [
          [0, 1, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
        output: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 1, 0],
        ],
      },
      {
        input: [
          [2, 0, 3],
          [2, 0, 0],
          [0, 0, 0],
        ],
        output: [
          [0, 0, 0],
          [2, 0, 0],
          [2, 0, 3],
        ],
      },
    ],
    testInput: [
      [4, 0, 7],
      [0, 0, 7],
      [0, 0, 0],
    ],
    correctOutput: [
      [0, 0, 0],
      [0, 0, 7],
      [4, 0, 7],
    ],
    distractors: [
      [
        [4, 0, 7],
        [0, 0, 7],
        [0, 0, 0],
      ],
      [
        [0, 0, 0],
        [4, 0, 7],
        [0, 0, 7],
      ],
      [
        [0, 0, 7],
        [4, 0, 7],
        [0, 0, 0],
      ],
    ],
    explanation: 'All colored tiles drop down vertically along their columns until hitting the bottom edge.',
  },
  // 3. Enclosed Fill (Negative Space)
  {
    title: 'Cavity Fill',
    ruleHint: 'Fill enclosed hollow space with Yellow (4)',
    examples: [
      {
        input: [
          [1, 1, 1],
          [1, 0, 1],
          [1, 1, 1],
        ],
        output: [
          [1, 1, 1],
          [1, 4, 1],
          [1, 1, 1],
        ],
      },
      {
        input: [
          [2, 2, 0],
          [2, 0, 2],
          [2, 2, 2],
        ],
        output: [
          [2, 2, 0],
          [2, 4, 2],
          [2, 2, 2],
        ],
      },
    ],
    testInput: [
      [3, 3, 3],
      [3, 0, 3],
      [0, 3, 0],
    ],
    correctOutput: [
      [3, 3, 3],
      [3, 4, 3],
      [0, 3, 0],
    ],
    distractors: [
      [
        [3, 3, 3],
        [3, 0, 3],
        [0, 3, 0],
      ],
      [
        [3, 4, 3],
        [3, 4, 3],
        [0, 3, 0],
      ],
      [
        [3, 3, 3],
        [3, 3, 3],
        [0, 3, 0],
      ],
    ],
    explanation: 'Any empty black cell (0) that is bounded on at least 3 sides by colored walls turns into Yellow (4).',
  },
  // 4. Color Inversion / Pair Swap
  {
    title: 'Chromatic Polarizer',
    ruleHint: 'Swap Red (2) and Blue (1)',
    examples: [
      {
        input: [
          [1, 0, 2],
          [0, 1, 0],
          [2, 0, 1],
        ],
        output: [
          [2, 0, 1],
          [0, 2, 0],
          [1, 0, 2],
        ],
      },
      {
        input: [
          [1, 1, 0],
          [0, 2, 2],
          [0, 0, 0],
        ],
        output: [
          [2, 2, 0],
          [0, 1, 1],
          [0, 0, 0],
        ],
      },
    ],
    testInput: [
      [2, 2, 1],
      [1, 0, 2],
      [0, 1, 1],
    ],
    correctOutput: [
      [1, 1, 2],
      [2, 0, 1],
      [0, 2, 2],
    ],
    distractors: [
      [
        [2, 2, 1],
        [1, 0, 2],
        [0, 1, 1],
      ],
      [
        [1, 1, 1],
        [2, 0, 2],
        [0, 2, 2],
      ],
      [
        [0, 2, 2],
        [2, 0, 1],
        [1, 1, 2],
      ],
    ],
    explanation: 'All 1s become 2s, and all 2s become 1s, leaving black cells (0) untouched.',
  },
];

// ---------------------------------------------------------------------
// 10-Year (3,650-Day) Deterministic Engine
// ---------------------------------------------------------------------
const START_EPOCH = new Date('2026-11-13T00:00:00Z').getTime();

export function getDayIndex(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00Z`).getTime();
  if (isNaN(target)) return 0;
  return Math.max(0, Math.floor((target - START_EPOCH) / (1000 * 60 * 60 * 24)));
}

function deterministicHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getDailyArcPuzzle(dateStr: string): ArcPuzzle {
  const dayIndex = getDayIndex(dateStr);
  const hash = deterministicHash(dateStr);

  const catalogIndex = (dayIndex * 7 + (hash % 5)) % ARC_CATALOG.length;
  const raw = ARC_CATALOG[catalogIndex] ?? ARC_CATALOG[0];

  // Options pool: 1 correct + 3 distractors
  const allOptions = [raw.correctOutput, ...raw.distractors];

  // Seeded deterministic shuffle of options
  const seed = hash + dayIndex * 19;
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(((seed * (i + 1) * 37) % 1000) / 1000 * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }

  // Find where the correct output landed
  const correctIndex = allOptions.findIndex((opt) =>
    JSON.stringify(opt) === JSON.stringify(raw.correctOutput)
  );

  return {
    dayNumber: dayIndex + 1,
    title: raw.title,
    ruleHint: raw.ruleHint,
    examples: raw.examples,
    testInput: raw.testInput,
    options: allOptions,
    correctOptionIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation: raw.explanation,
  };
}
