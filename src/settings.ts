/** Image size (the same as the Scratch stage). All maze geometry is in these units. */
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 360;

export interface MazeSettings {
  /** Minimum gap around the outside of the maze. */
  readonly margin: number;
  /** Thickness of every wall, including the border. */
  readonly wallThickness: number;
  readonly wallColour: string;
  readonly startColour: string;
  readonly endColour: string;
  /** Number of squares across. */
  readonly columns: number;
  /** Number of squares down. */
  readonly rows: number;
}

export type NumericSetting = 'margin' | 'wallThickness' | 'columns' | 'rows';
export type ColourSetting = 'wallColour' | 'startColour' | 'endColour';

export interface Range {
  readonly min: number;
  readonly max: number;
}

export const LIMITS: Record<NumericSetting, Range> = {
  margin: { min: 0, max: 80 },
  wallThickness: { min: 1, max: 20 },
  columns: { min: 2, max: 40 },
  rows: { min: 2, max: 30 },
};

/** The defaults match the Maze projects at Gravesend Code Club: 10 × 8 squares, purple walls. */
export const DEFAULT_SETTINGS: MazeSettings = {
  margin: 20,
  wallThickness: 4,
  wallColour: '#7a3ff2',
  startColour: '#22c55e',
  endColour: '#ef4444',
  columns: 10,
  rows: 8,
};

/** Turn user input into a whole number within the setting's range, or `fallback` if it isn't a number. */
export function clampSetting(
  key: NumericSetting,
  value: string | number,
  fallback: number,
): number {
  const n = typeof value === 'number' ? value : value.trim() === '' ? NaN : Number(value);
  if (!Number.isFinite(n)) return fallback;
  const { min, max } = LIMITS[key];
  return Math.min(max, Math.max(min, Math.round(n)));
}

const HEX_COLOUR = /^#[0-9a-f]{6}$/i;

/** Normalise a `#rrggbb` colour to lower case, or return `fallback` if it isn't one. */
export function parseColour(value: string, fallback: string): string {
  const v = value.trim();
  return HEX_COLOUR.test(v) ? v.toLowerCase() : fallback;
}
