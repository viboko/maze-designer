import { describe, expect, it } from 'vitest';
import { generateMaze, isOpen, type Cell, type Maze } from '../src/maze';
import { mulberry32 } from '../src/prng';

/** Every square reachable from the top-right corner, by flood fill. */
function reachable(maze: Maze): Set<string> {
  const start: Cell = { column: maze.columns - 1, row: 0 };
  const seen = new Set([`${start.column},${start.row}`]);
  const queue = [start];
  while (queue.length) {
    const c = queue.pop()!;
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const n = { column: c.column + dc, row: c.row + dr };
      const key = `${n.column},${n.row}`;
      if (!seen.has(key) && isOpen(maze, c, n)) {
        seen.add(key);
        queue.push(n);
      }
    }
  }
  return seen;
}

/** Number of open connections between neighbouring squares. */
function openings(maze: Maze): number {
  let n = 0;
  for (let row = 0; row < maze.rows; row++) {
    for (let column = 0; column < maze.columns; column++) {
      const c = { column, row };
      if (isOpen(maze, c, { column: column + 1, row })) n++;
      if (isOpen(maze, c, { column, row: row + 1 })) n++;
    }
  }
  return n;
}

describe('generateMaze', () => {
  it('has the requested size', () => {
    const maze = generateMaze(10, 8, mulberry32(1));
    expect(maze.columns).toBe(10);
    expect(maze.rows).toBe(8);
    expect(maze.walls).toHaveLength(8);
    maze.walls.forEach((row) => expect(row).toHaveLength(10));
  });

  it('leaves the top row and right-hand column clear', () => {
    const maze = generateMaze(7, 5, mulberry32(2));
    maze.walls[0]!.forEach((w) => expect(w).toBeNull());
    maze.walls.forEach((row) => expect(row[6]).toBeNull());
  });

  it('flips a coin for every other square', () => {
    const tops = generateMaze(5, 4, () => 0.1);
    const rights = generateMaze(5, 4, () => 0.9);
    for (let row = 1; row < 4; row++) {
      for (let column = 0; column < 4; column++) {
        expect(tops.walls[row]![column]).toBe('top');
        expect(rights.walls[row]![column]).toBe('right');
      }
    }
  });

  it('makes different mazes from different random numbers', () => {
    const a = generateMaze(10, 8, mulberry32(1));
    const b = generateMaze(10, 8, mulberry32(2));
    expect(a.walls).not.toEqual(b.walls);
  });

  it.each([
    [2, 2],
    [10, 8],
    [60, 45],
    [3, 17],
  ])('makes a perfect %i × %i maze: every square reachable, one route between any two', (c, r) => {
    for (let seed = 0; seed < 20; seed++) {
      const maze = generateMaze(c, r, mulberry32(seed));
      expect(reachable(maze).size).toBe(c * r);
      // A connected grid with exactly (squares - 1) openings has no loops.
      expect(openings(maze)).toBe(c * r - 1);
    }
  });
});

describe('isOpen', () => {
  const maze: Maze = {
    columns: 2,
    rows: 2,
    walls: [
      [null, null],
      ['top', null],
    ],
  };

  it('is blocked by a top wall in both directions', () => {
    expect(isOpen(maze, { column: 0, row: 0 }, { column: 0, row: 1 })).toBe(false);
    expect(isOpen(maze, { column: 0, row: 1 }, { column: 0, row: 0 })).toBe(false);
  });

  it('is open where there is no wall', () => {
    expect(isOpen(maze, { column: 0, row: 1 }, { column: 1, row: 1 })).toBe(true);
    expect(isOpen(maze, { column: 1, row: 1 }, { column: 1, row: 0 })).toBe(true);
  });

  it('rejects squares that are not neighbours or are outside the maze', () => {
    expect(isOpen(maze, { column: 0, row: 0 }, { column: 1, row: 1 })).toBe(false);
    expect(isOpen(maze, { column: 0, row: 0 }, { column: 0, row: 0 })).toBe(false);
    expect(isOpen(maze, { column: 1, row: 0 }, { column: 2, row: 0 })).toBe(false);
  });
});
