import { GameObject, Sprite, Vector, getWorldRect } from 'kontra';

export interface Collidable extends Sprite {
  hitbox: HitBox;
  dx: number;
  dy: number;
  x: number;
  y: number;
  onHit: (collidedWith: GameObject, at: Vector) => void;
}

export type HitBox = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/**
 * @param {Collidable} obj - Collidable object to extract hitbox from
 * @param {number} [paddingPixels=2] - `+` makes hitbox bigger; `-` makes hitbox smaller
 */
export function updateHitbox(
  obj: Collidable,
  paddingPixels: number = 2,
): HitBox {
  const worldRect = getWorldRect(obj);
  return {
    top: worldRect.y - paddingPixels,
    bottom: worldRect.y + worldRect.height + paddingPixels,
    left: worldRect.x - paddingPixels,
    right: worldRect.x + worldRect.width + paddingPixels,
  };
}
