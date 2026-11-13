// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { layoutMaze } from '../src/layout';
import { generateMaze } from '../src/maze';
import { mulberry32 } from '../src/prng';
import { DEFAULT_SETTINGS } from '../src/settings';
import { buildSvg } from '../src/svg';

const parse = (svg: string) =>
  new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;

describe('buildSvg', () => {
  const s = {
    ...DEFAULT_SETTINGS,
    wallColour: '#123456',
    startColour: '#00ff00',
    endColour: '#ff0000',
  };
  const layout = layoutMaze(generateMaze(s.columns, s.rows, mulberry32(3)), s)!;
  const svg = parse(buildSvg(layout, s));

  it('is the size of the Scratch stage', () => {
    expect(svg.getAttribute('width')).toBe('480');
    expect(svg.getAttribute('height')).toBe('360');
    expect(svg.getAttribute('viewBox')).toBe('0 0 480 360');
  });

  it('draws every wall in the wall colour', () => {
    const walls = svg.querySelector('g.walls')!;
    expect(walls.getAttribute('fill')).toBe('#123456');
    expect(walls.querySelectorAll('rect')).toHaveLength(layout.walls.length);
  });

  it('draws the start and end squares in their colours', () => {
    const start = svg.querySelector('g.start')!;
    const end = svg.querySelector('g.end')!;
    expect(start.getAttribute('fill')).toBe('#00ff00');
    expect(end.getAttribute('fill')).toBe('#ff0000');
    expect(start.querySelector('rect')!.getAttribute('x')).toBe(String(layout.start.x));
    expect(end.querySelector('rect')!.getAttribute('y')).toBe(String(layout.end.y));
  });

  it('draws just the background when the maze does not fit', () => {
    const empty = parse(buildSvg(null, s));
    expect(empty.querySelectorAll('rect')).toHaveLength(1);
  });
});
