import { GameObject, Sprite, Vector } from 'kontra';

export interface Collidable extends Sprite {
  top: number,
  bottom: number,
  left: number,
  right: number,
  dx: number,
  dy: number,
  x: number,
  y: number,
  onHit: (collidedWith: GameObject, at: Vector) => void,
}

