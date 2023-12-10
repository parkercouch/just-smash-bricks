/* eslint-disable */
import { on, PoolClass, Sprite, SpriteClass, Vector } from 'kontra';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEBUG_ON,
  DEFAULT_FPS,
  FPS,
  SCORE,
} from './globals';
import { doesCircleCollideWithBox, isNullOrUndefined } from './util';
import { playBounceSound } from './sounds';
import { updateScore } from './dom';
import { Collidable } from './collision';
import { Brick } from './brick';

const BALL_COLOR = 'white';

export class Ball extends SpriteClass {
  radius: number;
  attached: Sprite | null;

  constructor({ attached }: { attached: Sprite }) {
    super({
      type: 'ball',
      combo: 0,
      mass: 100,
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      x: attached.x + attached.width / 2,
      y: attached.y - 8,
      dx: 0,
      dy: 0,
      ttl: Infinity,
      color: BALL_COLOR,
    });

    this.attached = attached;
    this.radius = 11;
    this.contain();
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

  render() {
    this.context.fillStyle = this.color;
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius - 3, 0, 2 * Math.PI);
    this.context.fill();
  }

  contain() {
    this.position.clamp(
      0 + this.radius / 2,
      0 + this.radius / 2,
      CANVAS_WIDTH - this.radius / 2,
      CANVAS_HEIGHT - this.radius / 2,
    );
  }

  getVectorToNextPosition(dt: number): Vector {
    // KONTRA USES FIXED GAME LOOP dx is just change in pixel/frame
    return Vector({
      x: this.dx * dt * FPS.value,
      y: this.dy * dt * FPS.value,
    });
  }

  // TODO: split up collision and movement/update; collision detection can call update? trying to remove patch that adds
  // options argument
  update(
    dt?: number,
    // collidableObjects: Sprite[],
    options?: any,
  ) {
    // If attached to something then wait for keypress
    if (this.attached) {
      this.x = this.attached.x;
      this.y = this.attached.y - this.radius + 3 - this.attached.height / 2;
      this.advance();
      return;
    }

    const vectorToNextPosition = this.getVectorToNextPosition(dt!);

    const { closest, closestMagnitude } = (options as Collidable[])?.reduce(
      (
        acc: {
          closestMagnitude: number;
          closest: {
            item: Collidable;
            pointOfCollision: Vector;
            d: string;
          } | null;
        },
        item: Collidable,
      ) => {
        const collision = doesCircleCollideWithBox(
          this,
          vectorToNextPosition,
          item,
        );
        if (isNullOrUndefined(collision)) {
          // No collision happened
          return acc;
        }

        const currentMagnitude = collision.pointOfCollision.distance({
          x: this.x,
          y: this.y,
        });
        if (currentMagnitude < acc.closestMagnitude) {
          return {
            closestMagnitude: currentMagnitude,
            closest: {
              item,
              pointOfCollision: collision.pointOfCollision,
              d: collision.d,
            },
          };
        }
        return acc;
      },
      { closestMagnitude: Infinity, closest: null },
    );

    if (isNullOrUndefined(closest)) {
      return this.advance(dt! * FPS.value);
    }

    // ----- A collision happend so deal with it ------- //

    // How much time did it take to get to first collision?
    const udt = dt! * (closestMagnitude / vectorToNextPosition.length());
    // Update the ball to point of collision
    this.advance(udt);

    // Check what object was hit
    switch (closest.item.type) {
      case 'paddle':
        // IF THE PADDLE IS HIT //
        // Reset combo when paddle is hit
        this.combo = 0;

        // Animate/sounds
        closest.item.onHit(this, closest.pointOfCollision);

        // Reflect ball
        switch (closest.d) {
          case 'left':
          case 'right':
            this.dx *= -1;
            break;

          // ** ROOM FOR IMPROVEMENT **
          // Edges of paddle bounce ball back instead of reflecting exact angles
          case 'top':
          case 'bottom':
            // If right 1/4 then bounce back right
            if (
              closest.pointOfCollision.x >
              closest.item.x + closest.item.width / 4
            ) {
              this.dx = Math.abs(this.dx);
              this.dy *= -1;
              // If in the middle 1/2 then reflect
            } else if (
              closest.pointOfCollision.x >=
              closest.item.x - closest.item.width / 4
            ) {
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
        // IF A BRICK IS HIT //
        // Reduce its hitcount and add to combo
        closest.item.hits -= 1;
        this.combo += 1;

        // Animate all bricks
        options
          .filter((n) => n.type === 'brick')
          .forEach((brick: Brick) => {
            brick.onHit(this, closest.pointOfCollision);
          });

        // No points in debug mode
        if (!DEBUG_ON.value) {
          if (FPS.value === DEFAULT_FPS) {
            SCORE.value += this.combo * 50 * 5;
          } else {
            SCORE.value += this.combo * 50;
          }
        }
        updateScore();

        // If the brick has no hits left then destroy it
        if (closest.item.hits <= 0) {
          closest.item.ttl = 0;
        }

        switch (closest.d) {
          // Reflect x if right/left hit
          case 'left':
          case 'right':
            this.dx *= -1;
            break;

          // Reflect y if top/bottom hit
          case 'top':
          case 'bottom':
            this.dy *= -1;
            break;
        }
        break;

      case 'wall':
        // IF A WALL OR BRICK IS HIT //
        // Need to move this into a onHit Function
        playBounceSound();
        switch (closest.d) {
          // Reflect x if right/left hit
          case 'left':
          case 'right':
            this.dx *= -1;
            break;

          // Reflect y if top/bottom hit
          case 'top':
          case 'bottom':
            this.dy *= -1;
            break;
        }
        break;

      case 'blackhole':
        // IF THE BOTTOM IS HIT //
        // Lose a ball
        this.ttl = 0;
        return;
    }
    // ----------------------------------------- //

    // Run collision recursively if there is time left
    return this.update(dt! - udt, options);
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
}
