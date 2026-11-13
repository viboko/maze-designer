import type { MazeLayout } from './layout';
import { BACKGROUND_COLOUR } from './palette';
import { CANVAS_HEIGHT, CANVAS_WIDTH, type MazeSettings } from './settings';

/** Draw the maze onto a canvas that is `scale` pixels per maze unit. */
export function drawMaze(
  ctx: CanvasRenderingContext2D,
  layout: MazeLayout | null,
  settings: MazeSettings,
  scale: number,
): void {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = BACKGROUND_COLOUR;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (!layout) return;

  const fill = (r: { x: number; y: number; width: number; height: number }) =>
    ctx.fillRect(r.x, r.y, r.width, r.height);

  ctx.fillStyle = settings.startColour;
  fill(layout.start);
  ctx.fillStyle = settings.endColour;
  fill(layout.end);
  ctx.fillStyle = settings.wallColour;
  layout.walls.forEach(fill);
}
