/* eslint-disable */
import { GameObject, keyPressed, on, Sprite, SpriteClass } from 'kontra';
import {
  BALL_COLOR,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEBUG_ON,
  DEFAULT_FPS,
  FPS,
  SCORE,
} from './globals';
import {
  isNullOrUndefined,
  line_intercept,
  magnitude,
  move,
  updateScore,
} from './util';
import { playBounceSound } from './sounds';

export class Ball extends SpriteClass {
  constructor({ attached }: { attached: Sprite }) {
    super({
      type: 'ball',
      combo: 0,
      mass: 100,
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      attached,
      x: attached.x + attached.width / 2,
      y: attached.y - 8,
      dx: 0,
      dy: 0,
      ttl: Infinity,
      radius: 11,
      color: BALL_COLOR,
    });

    this.contain();
    on('input_middle:on', this.launchBall);
  }

  launchBall = (_options: any) => {
    console.log('launch ball command received');
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

  collidesWith(
    rect: { right: number; top: number; bottom: number; left: number },
    futurePosition: { nx: number; ny: number },
  ): { x: number; y: number; d: string } | null {
    const nx = futurePosition.nx;
    const ny = futurePosition.ny;
    let pt: { x: number; y: number; d: string } | null = null;
    if (nx < 0) {
      pt = line_intercept(
        this.x,
        this.y,
        this.x + nx,
        this.y + ny,
        rect.right + this.radius,
        rect.top - this.radius,
        rect.right + this.radius,
        rect.bottom + this.radius,
        'right',
      );
    } else if (nx > 0) {
      pt = line_intercept(
        this.x,
        this.y,
        this.x + nx,
        this.y + ny,
        rect.left - this.radius,
        rect.top - this.radius,
        rect.left - this.radius,
        rect.bottom + this.radius,
        'left',
      );
    }
    if (!pt) {
      if (ny < 0) {
        pt = line_intercept(
          this.x,
          this.y,
          this.x + nx,
          this.y + ny,
          rect.left - this.radius,
          rect.bottom + this.radius,
          rect.right + this.radius,
          rect.bottom + this.radius,
          'bottom',
        );
      } else if (ny > 0) {
        pt = line_intercept(
          this.x,
          this.y,
          this.x + nx,
          this.y + ny,
          rect.left - this.radius,
          rect.top - this.radius,
          rect.right + this.radius,
          rect.top - this.radius,
          'top',
        );
      }
    }
    return pt;
  }

  update(
    dt?: number,
    // collidableObjects: Sprite[],
    options?: any,
  ) {
    // If attached to something then wait for keypress
    if (this.attached) {
      this.x = this.attached.x;
      this.y = this.attached.y - this.radius + 3 - this.attached.height / 2;

      // WILL NEED TO UPDATE TO WORK WITH DIFFERENT OBJECTS BESIDES PADDLE
      if (keyPressed('w') || keyPressed('arrowup')) {
        if (Math.floor(Math.random() * 100) % 2 === 0) {
          this.dx = -5;
        } else {
          this.dx = 5;
        }
        this.dy = -6;
        this.attached = null;
      }
      this.advance();
      return;
    }

    // Calculate future position of ball
    const nextPosition = move(this, dt!);

    const { closest, closestMagnitude } = options?.reduce(
      (acc, item) => {
        // @ts-ignore TODO: fix
        const point: GameObject | null = this.collidesWith(item, nextPosition);
        if (isNullOrUndefined(point)) {
          // No collision happened
          return acc;
        }

        const currentMagnitude = magnitude(point.x - this.x, point.y - this.y);
        if (currentMagnitude < acc.closestMagnitude) {
          return {
            closest: { item, point },
            closestMagnitude: currentMagnitude,
          };
        }
        return acc;
      },
      { closestMagnitude: Infinity, closest: null } as {
        closestMagnitude: number;
        closest: { item: Sprite; point: GameObject } | null;
      },
    );

    if (isNullOrUndefined(closest)) {
      return this.advance(dt! * FPS.value);
    }

    // ----- A collision happend so deal with it ------- //

    // How much time did it take to get to first collision?
    const udt =
      dt! * (closestMagnitude / magnitude(nextPosition.nx, nextPosition.ny));
    // Update the ball to point of collision
    this.advance(udt);

    // Check what object was hit
    switch (closest.item.type) {
      case 'paddle':
        // IF THE PADDLE IS HIT //
        // Reset combo when paddle is hit
        this.combo = 0;

        // Animate/sounds
        closest.item.onHit();

        // Reflect ball
        switch (closest.point.d) {
          case 'left':
          case 'right':
            this.dx *= -1;
            break;

          // ** ROOM FOR IMPROVEMENT **
          // Edges of paddle bounce ball back instead of reflecting exact angles
          case 'top':
          case 'bottom':
            // If right 1/4 then bounce back right
            if (closest.point.x > closest.item.x + closest.item.width / 4) {
              this.dx = Math.abs(this.dx);
              this.dy *= -1;
              // If in the middle 1/2 then reflect
            } else if (
              closest.point.x >=
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
          .forEach((brick) => {
            brick.onHit(this);
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

        switch (closest.point.d) {
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
        switch (closest.point.d) {
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
