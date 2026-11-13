import './style.css';
import { downloadBlob, renderPng, renderSvg } from './download';
import { layoutMaze, type MazeLayout } from './layout';
import { generateMaze, type Maze } from './maze';
import { drawMaze } from './render';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_SETTINGS,
  LIMITS,
  clampSetting,
  parseColour,
  type ColourSetting,
  type MazeSettings,
  type NumericSetting,
} from './settings';

/** On-screen canvas resolution, in pixels per maze unit. */
const DISPLAY_SCALE = 2;
/** Downloaded PNG resolution, in pixels per maze unit. */
const PNG_SCALE = 2;

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>('maze-canvas');
const ctx = canvas.getContext('2d')!;
const hint = $('hint');
const newMazeButton = $<HTMLButtonElement>('new-maze');
const downloadButtons = document.querySelectorAll<HTMLButtonElement>('[data-download]');

const numericInputs: Record<NumericSetting, HTMLInputElement> = {
  margin: $('margin'),
  wallThickness: $('wall-thickness'),
  columns: $('columns'),
  rows: $('rows'),
};
const UNITS: Record<NumericSetting, string> = {
  margin: 'px',
  wallThickness: 'px',
  columns: 'squares',
  rows: 'squares',
};

const showValue = (key: NumericSetting, value: number | string): void => {
  const output = document.querySelector<HTMLOutputElement>(
    `output[for="${numericInputs[key].id}"]`,
  )!;
  output.value = `${value} ${UNITS[key]}`;
};

const colourInputs: Record<ColourSetting, HTMLInputElement> = {
  wallColour: $('wall-colour'),
  startColour: $('start-colour'),
  endColour: $('end-colour'),
};

canvas.width = CANVAS_WIDTH * DISPLAY_SCALE;
canvas.height = CANVAS_HEIGHT * DISPLAY_SCALE;

let settings: MazeSettings = DEFAULT_SETTINGS;
let maze: Maze;
let layout: MazeLayout | null = null;

/** Make a brand new random maze for the current settings, and show it. */
function redraw(): void {
  maze = generateMaze(settings.columns, settings.rows);
  layout = layoutMaze(maze, settings);
  drawMaze(ctx, layout, settings, DISPLAY_SCALE);
  hint.hidden = layout !== null;
  canvas.setAttribute(
    'aria-label',
    layout
      ? `A maze ${settings.columns} squares wide and ${settings.rows} squares tall, starting in ` +
          `the top-right square and ending in the bottom-left square`
      : 'Empty maze: too many squares to fit',
  );
  downloadButtons.forEach((b) => (b.disabled = layout === null));
}

function syncInputs(): void {
  (Object.keys(numericInputs) as NumericSetting[]).forEach((key) => {
    numericInputs[key].value = String(settings[key]);
    showValue(key, settings[key]);
  });
  (Object.keys(colourInputs) as ColourSetting[]).forEach((key) => {
    colourInputs[key].value = settings[key];
  });
}

(Object.entries(numericInputs) as [NumericSetting, HTMLInputElement][]).forEach(([key, input]) => {
  input.min = String(LIMITS[key].min);
  input.max = String(LIMITS[key].max);
  // Show the number while dragging; make the new maze when the slider is let go.
  input.addEventListener('input', () => showValue(key, input.value));
  input.addEventListener('change', () => {
    settings = { ...settings, [key]: clampSetting(key, input.value, settings[key]) };
    syncInputs();
    redraw();
  });
});

(Object.entries(colourInputs) as [ColourSetting, HTMLInputElement][]).forEach(([key, input]) => {
  input.addEventListener('change', () => {
    settings = { ...settings, [key]: parseColour(input.value, settings[key]) };
    syncInputs();
    redraw();
  });
});

newMazeButton.addEventListener('click', redraw);

downloadButtons.forEach((button) =>
  button.addEventListener('click', async () => {
    if (button.dataset.download === 'svg') {
      downloadBlob(renderSvg(layout, settings), 'maze.svg');
    } else {
      downloadBlob(await renderPng(layout, settings, PNG_SCALE), 'maze.png');
    }
  }),
);

syncInputs();
redraw();
