import { GameObject, Quadtree, Vector, getWorldRect } from 'kontra';

export const DEFAULT_HITBOX_PADDING = 2;

export interface Collidable extends GameObject {
  hitbox_padding?: number;
  x: number;
  y: number;
  onHit: (collision: Collision) => void;
}

export class CollidableQuadTree {
  #quadtree = Quadtree({ maxDepth: 10, maxObjects: 100 });

  update(objects: Collidable[]) {
    this.#quadtree.clear();
    this.#quadtree.add(objects);
  }

  getNearbyObjects(object: GameObject): Collidable[] {
    return this.#quadtree.get(object) as Collidable[];
  }
}

export type Collision = {
  collidedWith: Collidable;
  at: Vector;
  side: Side;
};

export enum Side {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
}

export type HitBox = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/**
 * @param {Collidable} obj - Collidable object to extract hitbox from
 * @returns {HitBox} obj - hitbox edges
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

export function doesCircleCollideWithObject(
  circle: { x: number; y: number; radius: number },
  circleVelocity: Vector,
  collidable_object: Collidable,
): Collision | null {
  const hitbox = extractHitbox(collidable_object);
  let collision: Collision | null = null;
  if (circleVelocity.x < 0) {
    const intercept = line_intercept(
      circle.x,
      circle.y,
      circle.x + circleVelocity.x,
      circle.y + circleVelocity.y,
      hitbox.right + circle.radius,
      hitbox.top - circle.radius,
      hitbox.right + circle.radius,
      hitbox.bottom + circle.radius,
    );

    if (intercept) {
      collision = {
        at: intercept,
        collidedWith: collidable_object,
        side: Side.RIGHT,
      };
    }
  } else if (circleVelocity.x > 0) {
    const intercept = line_intercept(
      circle.x,
      circle.y,
      circle.x + circleVelocity.x,
      circle.y + circleVelocity.y,
      hitbox.left - circle.radius,
      hitbox.top - circle.radius,
      hitbox.left - circle.radius,
      hitbox.bottom + circle.radius,
    );
    if (intercept) {
      collision = {
        at: intercept,
        collidedWith: collidable_object,
        side: Side.LEFT,
      };
    }
  }

  if (collision) {
    return collision;
  }

  if (circleVelocity.y < 0) {
    const intercept = line_intercept(
      circle.x,
      circle.y,
      circle.x + circleVelocity.x,
      circle.y + circleVelocity.y,
      hitbox.left - circle.radius,
      hitbox.bottom + circle.radius,
      hitbox.right + circle.radius,
      hitbox.bottom + circle.radius,
    );
    if (intercept) {
      collision = {
        at: intercept,
        collidedWith: collidable_object,
        side: Side.BOTTOM,
      };
    }
  } else if (circleVelocity.y > 0) {
    const intercept = line_intercept(
      circle.x,
      circle.y,
      circle.x + circleVelocity.x,
      circle.y + circleVelocity.y,
      hitbox.left - circle.radius,
      hitbox.top - circle.radius,
      hitbox.right + circle.radius,
      hitbox.top - circle.radius,
    );
    if (intercept) {
      collision = {
        at: intercept,
        collidedWith: collidable_object,
        side: Side.TOP,
      };
    }
  }
  return collision;
}

function line_intercept(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
): Vector | null {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom != 0) {
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    if (ua >= 0 && ua <= 1) {
      const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
      if (ub >= 0 && ub <= 1) {
        const x = x1 + ua * (x2 - x1);
        const y = y1 + ua * (y2 - y1);
        return Vector({ x, y });
      }
    }
  }
  return null;
}
