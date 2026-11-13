import type { MazeLayout, Rect } from './layout';
import { BACKGROUND_COLOUR } from './palette';
import { CANVAS_HEIGHT, CANVAS_WIDTH, type MazeSettings } from './settings';

const rect = (r: Rect): string =>
  `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}"/>`;

/** Build an SVG of the maze, the same size as the Scratch stage. */
export function buildSvg(layout: MazeLayout | null, settings: MazeSettings): string {
  const body = [
    `<rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="${BACKGROUND_COLOUR}"/>`,
  ];
  if (layout) {
    body.push(
      `<g class="start" fill="${settings.startColour}">${rect(layout.start)}</g>`,
      `<g class="end" fill="${settings.endColour}">${rect(layout.end)}</g>`,
      `<g class="walls" fill="${settings.wallColour}">${layout.walls.map(rect).join('')}</g>`,
    );
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" ` +
    `viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" shape-rendering="crispEdges">` +
    body.join('') +
    `</svg>`
  );
}
