import type { MazeLayout } from './layout';
import { drawMaze } from './render';
import { CANVAS_HEIGHT, CANVAS_WIDTH, type MazeSettings } from './settings';
import { buildSvg } from './svg';

export function renderPng(
  layout: MazeLayout | null,
  settings: MazeSettings,
  scale: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH * scale;
  canvas.height = CANVAS_HEIGHT * scale;
  drawMaze(canvas.getContext('2d')!, layout, settings, scale);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed'))),
      'image/png',
    ),
  );
}

export function renderSvg(layout: MazeLayout | null, settings: MazeSettings): Blob {
  return new Blob([buildSvg(layout, settings)], { type: 'image/svg+xml' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
