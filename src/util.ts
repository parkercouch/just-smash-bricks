/* eslint-disable */
import { Vector } from 'kontra';

export function isNullOrUndefined(obj: unknown): obj is null | undefined {
  return obj === null || obj === undefined;
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

export function magnitude(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

export function doesCircleCollideWithBox(
  circle: { x: number; y: number; radius: number },
  circleVelocity: Vector,
  box: { right: number; top: number; bottom: number; left: number },
): { pointOfCollision: Vector; d: string } | null {
  let collision: { pointOfCollision: Vector; d: string } | null = null;
  if (circleVelocity.x < 0) {
    collision = line_intercept(
      circle.x,
      circle.y,
      circle.x + circleVelocity.x,
      circle.y + circleVelocity.y,
      box.right + circle.radius,
      box.top - circle.radius,
      box.right + circle.radius,
      box.bottom + circle.radius,
      'right',
    );
  } else if (circleVelocity.x > 0) {
    collision = line_intercept(
      circle.x,
      circle.y,
      circle.x + circleVelocity.x,
      circle.y + circleVelocity.y,
      box.left - circle.radius,
      box.top - circle.radius,
      box.left - circle.radius,
      box.bottom + circle.radius,
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
      box.left - circle.radius,
      box.bottom + circle.radius,
      box.right + circle.radius,
      box.bottom + circle.radius,
      'bottom',
    );
  } else if (circleVelocity.y > 0) {
    collision = line_intercept(
      circle.x,
      circle.y,
      circle.x + circleVelocity.x,
      circle.y + circleVelocity.y,
      box.left - circle.radius,
      box.top - circle.radius,
      box.right + circle.radius,
      box.top - circle.radius,
      'top',
    );
  }
  return collision;
}
