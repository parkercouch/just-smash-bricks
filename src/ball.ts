import { getCanvas, PoolClass, Sprite, SpriteClass, Vector } from 'kontra';
import { FPS } from './globals';
import { isNullOrUndefined } from './util';
import {
  doesCircleCollideWithObject,
  Collision,
  Side,
  CollidableQuadTree,
} from './collision';
import { updateScore } from './dom';
import { Collidable } from './collision';
import { Paddle } from './paddle';
import { isMiddlePressed } from './input';

const BALL_COLOR = 'white';

export class Ball extends SpriteClass {
  radius: number;
  attached: Sprite | null;
  mass: number;
  combo: number;

  constructor({ attached }: { attached: Sprite }) {
    const canvas = getCanvas();
    super({
      type: 'ball',
      x: attached.x + attached.width,
      y: attached.y - 11,
      color: BALL_COLOR,
    });

    this.combo = 0;
    this.mass = 100;
    this.attached = attached;
    this.radius = 11;
    this.position.clamp(
      0,
      0,
      canvas.width - this.radius,
      canvas.height - this.radius,
    );
  }

  init = () => {};

  draw() {
    this.context.fillStyle = this.color;
    this.context.beginPath();
    this.context.arc(0, 0, this.radius - 3, 0, 2 * Math.PI);
    this.context.fill();
  }

  update() {}

  advanceWithCollision(dt: number, collidable_objects: Collidable[]) {
    if (this.attached) {
      this.x = this.attached.x + this.attached.width / 2;
      this.y = this.attached.y - this.radius;
      if (isMiddlePressed()) {
        this.launchBall();
      }
      return this.advance();
    }

    // keep checking collision until out of time
    while (dt >= 0) {
      const maybeCollision = this.checkCollision(dt, collidable_objects);
      if (isNullOrUndefined(maybeCollision)) {
        return this.advance(dt * FPS.value);
      }
      const { collision, udt } = maybeCollision;
      dt -= udt;
      this.advance(dt);
      this.onHit(collision);
      collision.collidedWith.onHit({ ...collision, collidedWith: this });
    }
  }

  launchBall() {
    // Shoot left/right randomly
    if (Math.floor(Math.random() * 100) % 2 === 0) {
      this.dx = -5;
    } else {
      this.dx = 5;
    }
    this.dy = -6;
    this.attached = null;
  }

  checkCollision(
    dt: number,
    objects: Collidable[],
  ): { closestMagnitude: number; collision: Collision; udt: number } | null {
    const nextPosition = Vector({
      x: this.dx * dt * FPS.value,
      y: this.dy * dt * FPS.value,
    });
    return objects.reduce(
      (
        acc: {
          closestMagnitude: number;
          collision: Collision;
          udt: number;
        } | null,
        item: Collidable,
      ) => {
        const collision = doesCircleCollideWithObject(this, nextPosition, item);
        if (isNullOrUndefined(collision)) {
          return acc;
        }

        const currentMagnitude = collision.at.distance({
          x: this.x,
          y: this.y,
        });
        if (currentMagnitude < (acc?.closestMagnitude ?? Infinity)) {
          return {
            closestMagnitude: currentMagnitude,
            collision,
            udt: dt * (currentMagnitude / nextPosition.length()),
          };
        }
        return acc;
      },
      null,
    );
  }

  onHit(collision: Collision) {
    const { collidedWith, at, side } = collision;
    if (collidedWith.type === 'blackhole') {
      return (this.ttl = 0);
    }
    switch (side) {
      case Side.LEFT:
      case Side.RIGHT:
        this.dx *= -1;
        break;
      case Side.TOP:
      case Side.BOTTOM:
        this.dy *= -1;
        break;
    }
    switch (collidedWith.type) {
      case 'paddle':
        {
          const paddle = collidedWith as Paddle;
          this.combo = 0;
          if (side === Side.TOP || side === Side.BOTTOM) {
            if (at.x <= paddle.x + paddle.width / 4) {
              this.dx = -1 * Math.abs(this.dx);
            } else if (at.x >= paddle.x + paddle.width * (3 / 4)) {
              this.dx = Math.abs(this.dx);
            }
          }
        }
        break;
      case 'brick':
        this.combo += 1;
        updateScore(this.combo);
        break;
      case 'default':
    }
  }
}

export class BallPool extends PoolClass {
  constructor({ attached }: { attached: Sprite }) {
    super({
      create: () => new Ball({ attached }),
      maxSize: 100,
    });
  }

  getBall(): Ball {
    return this.getAliveObjects()[0] as Ball;
  }

  numberAlive(): number {
    return this.getAliveObjects().length;
  }

  updateWithCollision(dt: number, quadtree: CollidableQuadTree) {
    (this.getAliveObjects() as Ball[]).forEach((ball) => {
      ball.advanceWithCollision(dt, quadtree.getNearbyObjects(ball));
    });
    this.update();
  }
}
