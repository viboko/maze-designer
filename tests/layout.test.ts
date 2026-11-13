import { describe, expect, it } from 'vitest';
import { cellSize, layoutMaze, MIN_PASSAGE, type Rect } from '../src/layout';
import { generateMaze, type Maze } from '../src/maze';
import { mulberry32 } from '../src/prng';
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_SETTINGS, type MazeSettings } from '../src/settings';

const settings = (overrides: Partial<MazeSettings> = {}): MazeSettings => ({
  ...DEFAULT_SETTINGS,
  ...overrides,
});
const mazeFor = (s: MazeSettings, seed = 1): Maze =>
  generateMaze(s.columns, s.rows, mulberry32(seed));

function bounds(rects: readonly Rect[]) {
  return {
    left: Math.min(...rects.map((r) => r.x)),
    top: Math.min(...rects.map((r) => r.y)),
    right: Math.max(...rects.map((r) => r.x + r.width)),
    bottom: Math.max(...rects.map((r) => r.y + r.height)),
  };
}

describe('cellSize', () => {
  it('uses the largest whole-number square that fits', () => {
    // (360 - 40 - 4) / 8 = 39.5 is tighter than (480 - 40 - 4) / 10 = 43.6.
    expect(cellSize(settings())).toBe(39);
    expect(cellSize(settings({ columns: 20, rows: 2 }))).toBe(21);
  });
});

describe('layoutMaze', () => {
  it('draws a border plus one wall per coin flip', () => {
    const s = settings();
    const maze = mazeFor(s);
    const layout = layoutMaze(maze, s)!;
    expect(layout.walls).toHaveLength(4 + (s.columns - 1) * (s.rows - 1));
  });

  it.each([
    settings(),
    settings({ margin: 0, wallThickness: 1, columns: 40, rows: 30 }),
    settings({ margin: 80, wallThickness: 20, columns: 2, rows: 2 }),
    settings({ margin: 7, wallThickness: 3, columns: 13, rows: 29 }),
  ])('keeps the maze inside the margin, centred: %o', (s) => {
    const layout = layoutMaze(mazeFor(s), s)!;
    expect(layout).not.toBeNull();
    const b = bounds(layout.walls);
    expect(b.left).toBeGreaterThanOrEqual(s.margin);
    expect(b.top).toBeGreaterThanOrEqual(s.margin);
    expect(CANVAS_WIDTH - b.right).toBeGreaterThanOrEqual(s.margin);
    expect(CANVAS_HEIGHT - b.bottom).toBeGreaterThanOrEqual(s.margin);
    expect(Math.abs(b.left - (CANVAS_WIDTH - b.right))).toBeLessThanOrEqual(1);
    expect(Math.abs(b.top - (CANVAS_HEIGHT - b.bottom))).toBeLessThanOrEqual(1);
    expect(b.right - b.left).toBe(s.columns * layout.cell + s.wallThickness);
    expect(b.bottom - b.top).toBe(s.rows * layout.cell + s.wallThickness);
  });

  it('uses whole-number coordinates so the walls are crisp', () => {
    const s = settings({ margin: 13, wallThickness: 5, columns: 9, rows: 7 });
    const layout = layoutMaze(mazeFor(s), s)!;
    for (const r of [...layout.walls, layout.start, layout.end]) {
      for (const v of [r.x, r.y, r.width, r.height]) expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('makes every wall the chosen thickness', () => {
    const s = settings({ wallThickness: 6 });
    const layout = layoutMaze(mazeFor(s), s)!;
    layout.walls.forEach((r) => expect(Math.min(r.width, r.height)).toBe(6));
  });

  it('puts the start in the top-right square and the end in the bottom-left square', () => {
    const s = settings();
    const layout = layoutMaze(mazeFor(s), s)!;
    const b = bounds(layout.walls);
    expect(layout.start).toEqual({
      x: b.right - layout.cell,
      y: b.top + s.wallThickness,
      width: layout.cell - s.wallThickness,
      height: layout.cell - s.wallThickness,
    });
    expect(layout.end).toEqual({
      x: b.left + s.wallThickness,
      y: b.bottom - layout.cell,
      width: layout.cell - s.wallThickness,
      height: layout.cell - s.wallThickness,
    });
  });

  it('places walls on the top or right of the right squares', () => {
    const s = settings({ columns: 3, rows: 2, margin: 0, wallThickness: 2 });
    const maze: Maze = {
      columns: 3,
      rows: 2,
      walls: [
        [null, null, null],
        ['top', 'right', null],
      ],
    };
    const layout = layoutMaze(maze, s)!;
    const { cell } = layout;
    const left = layout.walls[0]!.x;
    const top = layout.walls[0]!.y;
    expect(layout.walls.slice(4)).toEqual([
      { x: left, y: top + cell, width: cell + 2, height: 2 },
      { x: left + 2 * cell, y: top + cell, width: 2, height: cell + 2 },
    ]);
  });

  it('returns null when the squares are too small to leave a path', () => {
    const s = settings({ margin: 80, wallThickness: 20, columns: 20, rows: 20 });
    expect(cellSize(s) - s.wallThickness).toBeLessThan(MIN_PASSAGE);
    expect(layoutMaze(mazeFor(s), s)).toBeNull();
  });

  it('rejects a maze that does not match the settings', () => {
    expect(() => layoutMaze(generateMaze(3, 3), settings())).toThrow();
  });
});
