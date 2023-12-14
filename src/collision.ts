import { GameObject, Sprite, Vector, getWorldRect } from 'kontra';
import { isNullOrUndefined } from './util';

export const DEFAULT_HITBOX_PADDING = 2;

export interface Collidable extends Sprite {
  hitbox_padding?: number;
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
 */
export function extractHitbox(obj: Collidable): HitBox {
  const worldRect = getWorldRect(obj);
  const paddingPixels = obj.hitbox_padding ?? DEFAULT_HITBOX_PADDING;
  return {
    top: worldRect.y - paddingPixels,
    bottom: worldRect.y + worldRect.height + paddingPixels,
    left: worldRect.x - paddingPixels,
    right: worldRect.x + worldRect.width + paddingPixels,
  };
}

// intercept :: (Num, Num), (Num, Num), (Num, Num), (Num, Num), String -> {Num, Num, String}
export function line_intercept(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
  d: string,
) {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom != 0) {
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    if (ua >= 0 && ua <= 1) {
      const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
      if (ub >= 0 && ub <= 1) {
        const x = x1 + ua * (x2 - x1);
        const y = y1 + ua * (y2 - y1);
        return { pointOfCollision: Vector({ x, y }), d };
      }
    }
  }
  return null;
}

export function doesCircleCollideWithObject(
  circle: { x: number; y: number; radius: number },
  circleVelocity: Vector,
  collidable_object: Collidable,
): { pointOfCollision: Vector; d: string } | null {
  const hitbox = extractHitbox(collidable_object);
  let collision: { pointOfCollision: Vector; d: string } | null = null;
  if (circleVelocity.x < 0) {
    collision = line_intercept(
      circle.x,
      circle.y,
      circle.x + circleVelocity.x,
      circle.y + circleVelocity.y,
      hitbox.right + circle.radius,
      hitbox.top - circle.radius,
      hitbox.right + circle.radius,
      hitbox.bottom + circle.radius,
      'right',
    );
  } else if (circleVelocity.x > 0) {
    collision = line_intercept(
      circle.x,
      circle.y,
      circle.x + circleVelocity.x,
      circle.y + circleVelocity.y,
      hitbox.left - circle.radius,
      hitbox.top - circle.radius,
      hitbox.left - circle.radius,
      hitbox.bottom + circle.radius,
      'left',
    );
  }

  if (!isNullOrUndefined(collision)) {
    return collision;
  }

  if (circleVelocity.y < 0) {
    collision = line_intercept(
      circle.x,
      circle.y,
      circle.x + circleVelocity.x,
      circle.y + circleVelocity.y,
      hitbox.left - circle.radius,
      hitbox.bottom + circle.radius,
      hitbox.right + circle.radius,
      hitbox.bottom + circle.radius,
      'bottom',
    );
  } else if (circleVelocity.y > 0) {
    collision = line_intercept(
      circle.x,
      circle.y,
      circle.x + circleVelocity.x,
      circle.y + circleVelocity.y,
      hitbox.left - circle.radius,
      hitbox.top - circle.radius,
      hitbox.right + circle.radius,
      hitbox.top - circle.radius,
      'top',
    );
  }
  return collision;
}
