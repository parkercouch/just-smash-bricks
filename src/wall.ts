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
      hitbox_padding: 0,
    }),

    // Right Wall
    Sprite({
      type: 'wall',
      x: CANVAS_WIDTH - 0.5,
      y: 0,
      width: 1,
      height: CANVAS_HEIGHT,
      hitbox_padding: 0,
    }),

    // Top Wall
    Sprite({
      type: 'wall',
      x: 0,
      y: -0.5,
      width: CANVAS_WIDTH,
      height: 1,
      hitbox_padding: 0,
    }),

    // Bottom Wall
    Sprite({
      type: 'blackhole',
      x: 0,
      y: CANVAS_HEIGHT - 0.5,
      width: CANVAS_WIDTH,
      height: 1,
      hitbox_padding: 0,
    }),
  ];
}
