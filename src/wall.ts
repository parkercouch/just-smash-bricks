import { Sprite } from 'kontra';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './globals';

export function createWalls(): Sprite[] {
  return [
    // Left Wall
    Sprite({
      type: 'wall',
      x: -0.5,
      y: 0,
      width: 1,
      height: CANVAS_HEIGHT,
      hitbox: {
        top: 0,
        bottom: CANVAS_HEIGHT,
        left: -0.5,
        right: 0,
      },
    }),

    // Right Wall
    Sprite({
      type: 'wall',
      x: CANVAS_WIDTH - 0.5,
      y: 0,
      width: 1,
      height: CANVAS_HEIGHT,
      hitbox: {
        top: 0,
        bottom: CANVAS_HEIGHT,
        left: CANVAS_WIDTH - 0.5,
        right: CANVAS_WIDTH + 0.5,
      },
    }),

    // Top Wall
    Sprite({
      type: 'wall',
      x: 0,
      y: -0.5,
      width: CANVAS_WIDTH,
      height: 1,
      hitbox: {
        top: -0.5,
        bottom: 0.5,
        left: 0,
        right: CANVAS_WIDTH,
      },
    }),

    // Bottom Wall
    Sprite({
      type: 'blackhole',
      x: 0,
      y: CANVAS_HEIGHT - 0.5,
      width: CANVAS_WIDTH,
      height: 1,
      hitbox: {
        top: CANVAS_HEIGHT - 0.5,
        bottom: CANVAS_HEIGHT + 0.5,
        left: 0,
        right: CANVAS_WIDTH,
      },
    }),
  ];
}
