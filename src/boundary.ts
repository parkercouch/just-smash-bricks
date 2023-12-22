import { GameObjectClass, getCanvas } from 'kontra';
import { playBounceSound } from './sounds';
import { Collidable } from './collision';

export class Boundary extends GameObjectClass implements Collidable {
  constructor({
    x,
    y,
    width,
    height,
    type,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
  }) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.hitbox_padding = -3;
  }

  onHit() {
    playBounceSound();
  }
}

export function createBoundaries(): Boundary[] {
  const canvas = getCanvas();
  return [
    new Boundary({
      type: 'left_wall',
      x: 0,
      y: 0,
      width: 2,
      height: canvas.height,
    }),
    new Boundary({
      type: 'right_wall',
      x: canvas.width,
      y: 0,
      width: 2,
      height: canvas.height,
    }),
    new Boundary({
      type: 'ceiling',
      x: 0,
      y: 0,
      width: canvas.width,
      height: 2,
    }),
    new Boundary({
      type: 'blackhole',
      x: 0,
      y: canvas.height,
      width: canvas.width,
      height: 2,
    }),
  ];
}
