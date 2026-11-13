import type { Maze } from './maze';
import { CANVAS_HEIGHT, CANVAS_WIDTH, type MazeSettings } from './settings';

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface MazeLayout {
  /** Size of each square, from one wall line to the next. */
  readonly cell: number;
  /** Every wall, including the four sides of the border. */
  readonly walls: readonly Rect[];
  /** The inside of the start square (top-right). */
  readonly start: Rect;
  /** The inside of the end square (bottom-left). */
  readonly end: Rect;
}

/** Smallest gap between two walls that still leaves a path through. */
export const MIN_PASSAGE = 2;

/** The largest whole-number square size that fits the maze inside the margins. */
export function cellSize(settings: MazeSettings): number {
  const { margin, wallThickness: wall, columns, rows } = settings;
  return Math.floor(
    Math.min(
      (CANVAS_WIDTH - 2 * margin - wall) / columns,
      (CANVAS_HEIGHT - 2 * margin - wall) / rows,
    ),
  );
}

/**
 * Work out where every wall goes, centring the maze in the image. Returns `null` if the maze
 * doesn't fit: the squares would be too small to leave a path between the walls.
 *
 * Like the Python Maze project, each wall is a rectangle that starts on a grid line and is
 * `wallThickness` thick to the right of / below it, and is `wallThickness` longer than a square so
 * that the corners join up.
 */
export function layoutMaze(maze: Maze, settings: MazeSettings): MazeLayout | null {
  const { wallThickness: wall, columns, rows } = settings;
  if (maze.columns !== columns || maze.rows !== rows) {
    throw new Error('Maze size does not match the settings');
  }
  const cell = cellSize(settings);
  if (cell - wall < MIN_PASSAGE) return null;

  const width = columns * cell;
  const height = rows * cell;
  const left = Math.round((CANVAS_WIDTH - width - wall) / 2);
  const top = Math.round((CANVAS_HEIGHT - height - wall) / 2);

  const walls: Rect[] = [
    { x: left, y: top, width: width + wall, height: wall },
    { x: left, y: top + height, width: width + wall, height: wall },
    { x: left, y: top, width: wall, height: height + wall },
    { x: left + width, y: top, width: wall, height: height + wall },
  ];

  maze.walls.forEach((cells, row) =>
    cells.forEach((w, column) => {
      const x = left + column * cell;
      const y = top + row * cell;
      if (w === 'top') walls.push({ x, y, width: cell + wall, height: wall });
      else if (w === 'right') walls.push({ x: x + cell, y, width: wall, height: cell + wall });
    }),
  );

  const inside = (column: number, row: number): Rect => ({
    x: left + column * cell + wall,
    y: top + row * cell + wall,
    width: cell - wall,
    height: cell - wall,
  });

  return { cell, walls, start: inside(columns - 1, 0), end: inside(0, rows - 1) };
}
