import { Sprite, getCanvas } from 'kontra';
import { playBounceSound } from './sounds';

export function createWalls(): Sprite[] {
  const canvas = getCanvas();
  return [
    // Left Wall
    Sprite({
      type: 'wall',
      x: -0.5,
      y: 0,
      width: 1,
      height: canvas.height,
      hitbox_padding: 0,
      onHit: () => {
        playBounceSound();
      },
    }),

    // Right Wall
    Sprite({
      type: 'wall',
      x: canvas.width - 0.5,
      y: 0,
      width: 1,
      height: canvas.height,
      hitbox_padding: 0,
      onHit: () => {
        playBounceSound();
      },
    }),

    // Top Wall
    Sprite({
      type: 'wall',
      x: 0,
      y: -0.5,
      width: canvas.width,
      height: 1,
      hitbox_padding: 0,
      onHit: () => {
        playBounceSound();
      },
    }),

    // Bottom Wall
    Sprite({
      type: 'blackhole',
      x: 0,
      y: canvas.height - 0.5,
      width: canvas.width,
      height: 1,
      hitbox_padding: 0,
      onHit: () => {},
    }),
  ];
}
