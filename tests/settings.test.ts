import { describe, expect, it } from 'vitest';
import { layoutMaze } from '../src/layout';
import { generateMaze } from '../src/maze';
import { DEFAULT_SETTINGS, LIMITS, clampSetting, parseColour } from '../src/settings';

describe('clampSetting', () => {
  it('rounds and clamps to the allowed range', () => {
    expect(clampSetting('columns', '12', 10)).toBe(12);
    expect(clampSetting('columns', '12.6', 10)).toBe(13);
    expect(clampSetting('columns', '1', 10)).toBe(LIMITS.columns.min);
    expect(clampSetting('columns', '999', 10)).toBe(LIMITS.columns.max);
    expect(clampSetting('margin', -5, 20)).toBe(0);
  });

  it('falls back when the input is not a number', () => {
    expect(clampSetting('rows', '', 8)).toBe(8);
    expect(clampSetting('rows', 'abc', 8)).toBe(8);
    expect(clampSetting('rows', NaN, 8)).toBe(8);
  });
});

describe('parseColour', () => {
  it('accepts #rrggbb colours, lower-cased', () => {
    expect(parseColour('#7A3FF2', '#000000')).toBe('#7a3ff2');
  });

  it('falls back for anything else', () => {
    expect(parseColour('red', '#000000')).toBe('#000000');
    expect(parseColour('#fff', '#000000')).toBe('#000000');
    expect(parseColour('url(#x)', '#000000')).toBe('#000000');
  });
});

describe('DEFAULT_SETTINGS', () => {
  it('are within their limits and make a maze that fits', () => {
    for (const [key, { min, max }] of Object.entries(LIMITS)) {
      const v = DEFAULT_SETTINGS[key as keyof typeof LIMITS];
      expect(v).toBeGreaterThanOrEqual(min);
      expect(v).toBeLessThanOrEqual(max);
    }
    const s = DEFAULT_SETTINGS;
    expect(layoutMaze(generateMaze(s.columns, s.rows), s)).not.toBeNull();
  });

  it('allow the largest maze with the thinnest walls and no margin', () => {
    const s = {
      ...DEFAULT_SETTINGS,
      margin: 0,
      wallThickness: 1,
      ...{ columns: LIMITS.columns.max, rows: LIMITS.rows.max },
    };
    expect(layoutMaze(generateMaze(s.columns, s.rows), s)).not.toBeNull();
  });
});
