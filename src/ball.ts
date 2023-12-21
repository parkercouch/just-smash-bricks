/* eslint-disable */
import { getCanvas, on, PoolClass, Sprite, SpriteClass, Vector } from 'kontra';
import { FPS } from './globals';
import { isNullOrUndefined } from './util';
import { doesCircleCollideWithObject, Collision } from './collision';
import { updateScore } from './dom';
import { Collidable } from './collision';
import { Paddle } from './paddle';

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

  init = (_options: any) => {
    on('input_middle:on', this.launchBall);
  };

  launchBall = (_options: any) => {
    if (!this.attached) {
      return;
    }
    // Shoot left/right randomly
    if (Math.floor(Math.random() * 100) % 2 === 0) {
      this.dx = -5;
    } else {
      this.dx = 5;
    }
    this.dy = -6;
    this.attached = null;
  };

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
      this.advance();
      return;
    }

    let collision_dt = dt;
    // keep checking collision until out of time
    while (collision_dt >= 0) {
      const nextPosition = Vector({
        x: this.dx * collision_dt * FPS.value,
        y: this.dy * collision_dt * FPS.value,
      });
      const { collision, udt } = this.checkCollision(
        collision_dt,
        collidable_objects,
      );

      if (isNullOrUndefined(collision)) {
        this.advance(collision_dt * FPS.value);
        return;
      }
      collision_dt -= udt;
      this.advance(collision_dt);
      this.onHit(collision);
      collision.collidedWith.onHit({ ...collision, collidedWith: this });
    }
  }

  checkCollision(
    dt: number,
    objects: Collidable[],
  ): { closestMagnitude: number; collision: Collision | null; udt: number } {
    const nextPosition = Vector({
      x: this.dx * dt * FPS.value,
      y: this.dy * dt * FPS.value,
    });
    return objects.reduce(
      (
        acc: {
          closestMagnitude: number;
          collision: Collision | null;
          udt: number;
        },
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
        if (currentMagnitude < acc.closestMagnitude) {
          return {
            closestMagnitude: currentMagnitude,
            collision,
            udt: dt * (currentMagnitude / nextPosition.length()),
          };
        }
        return acc;
      },
      { closestMagnitude: Infinity, collision: null, udt: 0 },
    );
  }

  onHit(collision: Collision) {
    const { collidedWith, at, side } = collision;
    switch (collidedWith.type) {
      case 'paddle':
        const paddle = collidedWith as Paddle;
        this.combo = 0;

        // Reflect ball
        switch (side) {
          case 'left':
          case 'right':
            this.dx *= -1;
            break;

          // ** ROOM FOR IMPROVEMENT **
          // Edges of paddle bounce ball back instead of reflecting exact angles
          case 'top':
          case 'bottom':
            // If right 1/4 then bounce back right
            if (at.x > paddle.x + paddle.width / 4) {
              this.dx = Math.abs(this.dx);
              this.dy *= -1;
              // If in the middle 1/2 then reflect
            } else if (at.x >= paddle.x - paddle.width / 4) {
              this.dy *= -1;
              // If left 1/4 then bounce back left
            } else {
              this.dx = -1 * Math.abs(this.dx);
              this.dy *= -1;
            }
            break;
        }
        break;

      case 'brick':
        this.combo += 1;
        updateScore(this.combo);

        switch (side) {
          case 'left':
          case 'right':
            this.dx *= -1;
            break;

          case 'top':
          case 'bottom':
            this.dy *= -1;
            break;
        }
        break;

      case 'wall':
        switch (side) {
          case 'left':
          case 'right':
            this.dx *= -1;
            break;
          case 'top':
          case 'bottom':
            this.dy *= -1;
            break;
        }
        break;

      case 'blackhole':
        this.ttl = 0;
        return;
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

  update(dt: number, collidable_objects: Collidable[]) {
    (this.getAliveObjects() as Ball[]).forEach((ball) => {
      ball.advanceWithCollision(dt, collidable_objects);
    });
    super.update();
  }
}
