import { Sprite } from 'kontra';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './globals';

export function createWalls(): Sprite[] {
  return [
    // Left Wall
    Sprite({
      type: 'wall',
      anchor: {
        x: 1,
        y: 0,
      },
      x: 0.5,
      y: 0,
      dx: 0,
      dy: 0,
      ttl: Infinity,
      width: 1,
      height: CANVAS_HEIGHT,
      top: 0,
      bottom: CANVAS_HEIGHT,
      left: -0.5,
      right: 0,
    }),

    // Right Wall
    Sprite({
      type: 'wall',
      anchor: {
        x: 0,
        y: 0,
      },
      x: CANVAS_WIDTH - 0.5,
      y: 0,
      dx: 0,
      dy: 0,
      ttl: Infinity,
      width: 1,
      height: CANVAS_HEIGHT,
      top: 0,
      bottom: CANVAS_HEIGHT,
      left: CANVAS_WIDTH - 0.5,
      right: CANVAS_WIDTH + 0.5,
    }),

    // Top Wall
    Sprite({
      type: 'wall',
      anchor: {
        x: 0,
        y: 1,
      },
      x: 0,
      y: 0.5,
      dx: 0,
      dy: 0,
      ttl: Infinity,
      width: CANVAS_WIDTH,
      height: 1,
      top: -0.5,
      bottom: 0.5,
      left: 0,
      right: CANVAS_WIDTH,
    }),

    // Bottom Wall
    Sprite({
      type: 'blackhole',
      anchor: {
        x: 0,
        y: 0,
      },
      x: 0,
      y: CANVAS_HEIGHT - 0.5,
      dx: 0,
      dy: 0,
      ttl: Infinity,
      width: CANVAS_WIDTH,
      height: 1,
      top: CANVAS_HEIGHT - 0.5,
      bottom: CANVAS_HEIGHT + 0.5,
      left: 0,
      right: CANVAS_WIDTH,
    }),
  ];
}
