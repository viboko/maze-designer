/** Which wall a square gets: along its top, or down its right-hand side. */
export type Wall = 'top' | 'right';

export interface Maze {
  readonly columns: number;
  readonly rows: number;
  /**
   * `walls[row][column]` is the wall added to that square, or `null` for squares in the top row
   * and the right-hand column, which get no wall so there's always a clear path along the top and
   * down the right. Rows are numbered from 0 at the top, columns from 0 on the left.
   */
  readonly walls: readonly (readonly (Wall | null)[])[];
}

/**
 * Make a maze with the "binary tree" algorithm used by the Maze projects at Gravesend Code Club:
 * for every square, except those in the top row and the right-hand column, flip a coin and put a
 * wall either along its top or down its right-hand side.
 *
 * Every square ends up with exactly one opening (up or right) towards the top-right corner, so
 * every square can be reached and there is exactly one route between any two squares.
 */
export function generateMaze(
  columns: number,
  rows: number,
  random: () => number = Math.random,
): Maze {
  const walls = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column): Wall | null => {
      if (row === 0 || column === columns - 1) return null;
      return random() < 0.5 ? 'top' : 'right';
    }),
  );
  return { columns, rows, walls };
}

export interface Cell {
  readonly column: number;
  readonly row: number;
}

/** Whether you can step directly between two neighbouring squares. */
export function isOpen(maze: Maze, a: Cell, b: Cell): boolean {
  const inside = (c: Cell) =>
    c.column >= 0 && c.column < maze.columns && c.row >= 0 && c.row < maze.rows;
  if (!inside(a) || !inside(b)) return false;
  const dc = b.column - a.column;
  const dr = b.row - a.row;
  if (Math.abs(dc) + Math.abs(dr) !== 1) return false;
  if (dr !== 0) {
    // Moving vertically crosses the top wall of the lower square.
    const lower = dr > 0 ? b : a;
    return maze.walls[lower.row]?.[lower.column] !== 'top';
  }
  // Moving horizontally crosses the right wall of the left-hand square.
  const left = dc > 0 ? a : b;
  return maze.walls[left.row]?.[left.column] !== 'right';
}
