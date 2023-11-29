/* eslint-disable */

import { GameObject, Sprite, keyPressed } from 'kontra';
import { DEBUG_ON, DEFAULT_FPS, FPS, SCORE } from './globals';
import { isNullOrUndefined, magnitude, move, updateScore } from './util';
import { playBounceSound } from './sounds';

// Update paddle and keep in bounds
// paddleUpdate :: () -> ()
export function paddleUpdate(this: Sprite) {
  this.top = this.y - this.height / 2 - 1;
  this.bottom = this.y + this.height / 2 + 1;
  this.left = this.x - this.width / 2 + 1;
  this.right = this.x + this.width / 2 - 1;

  this.move();
}

// NEED TO COMBINE WITH TOUCH CONTROLS
// Move paddle!
// movePaddle :: Bool -> Bool -> ()
export function movePaddle(this: Sprite) {
  this.advance();
  switch (true) {
    case keyPressed('left') || keyPressed('a'):
      this.dx = -5;
      break;
    case keyPressed('right') || keyPressed('d'):
      this.dx = 5;
      break;
    case !this.moving:
      this.dx = 0;
  }
}

// Touch control move paddle
// movePaddleLeft :: Sprite -> () -> ()
export function movePaddleLeft(paddle: Sprite) {
  return () => {
    paddle.moving = true;
    paddle.dx = -5;
  };
}

// Touch control move paddle
// movePaddleLeft :: Sprite -> () -> ()
export function movePaddleRight(paddle: Sprite) {
  return () => {
    paddle.moving = true;
    paddle.dx = 5;
  };
}

// Touch control stop movement on release
// movePaddleLeft :: Sprite -> () -> ()
export function stopPaddle(paddle: Sprite) {
  return () => {
    paddle.moving = false;
    paddle.dx = 0;
  };
}

// MAGIC NUMBERS
// Touch control launch
// launchBall :: Sprite -> () -> ()
export function launchBall(ball: Sprite) {
  return () => {
    // Shoot left/right randomly
    if (Math.floor(Math.random() * 100) % 2 === 0) {
      ball.dx = -5;
    } else {
      ball.dx = 5;
    }
    ball.dy = -6;
    ball.attached = null;
  };
}

// Turn off touch launch after launching
// disableLaunch :: () -> ()
export function disableLaunch() {
  this.onDown = () => { };
}

// MODIFIED KONTRA JS TO PASS IN MULTIPLE ARGUMENTS
// Update logic for ball objects
// movingBall :: Num -> [Sprite] -> ()
export function movingBall(
  this: Sprite,
  dt: number,
  collidableObjects: Sprite[],
) {
  // If attached to something then wait for keypress
  if (this.attached) {
    this.x = this.attached.x;
    this.y = this.attached.y - this.radius + 3 - this.attached.height / 2;

    // WILL NEED TO UPDATE TO WORK WITH DIFFERENT OBJECTS BESIDES PADDLE
    if (keyPressed('w') || keyPressed('up')) {
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
  const nextPosition = move(this, dt);

  const { closest, closestMagnitude } = collidableObjects?.reduce(
    (acc, item) => {
      const point: GameObject | null = this.collidesWith(item, nextPosition);
      if (isNullOrUndefined(point)) {
        // No collision happened
        return acc;
      }

      const currentMagnitude = magnitude(point.x - this.x, point.y - this.y);
      if (currentMagnitude < acc.closestMagnitude) {
        return {
          closest: item,
          closestMagnitude: currentMagnitude,
        };
      }
      return acc;
    },
    { closestMagnitude: Infinity, closest: null } as {
      closestMagnitude: number;
      closest: Sprite | null;
    },
  ) ?? { closest: null, closestMagnitude: Infinity };

  if (isNullOrUndefined(closest)) {
    return this.advance(dt * FPS.value);
  }

  // ----- A collision happend so deal with it ------- //

  // How much time did it take to get to first collision?
  const udt =
    dt * (closestMagnitude / magnitude(nextPosition.nx, nextPosition.ny));
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
      collidableObjects
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
  // @ts-ignore - TODO: fix kontra patch to include types
  return this.update(dt - udt, collidableObjects);
}

// Brick color changing logic
// colorChange :: Num -> ()
export function colorChange(this: Sprite, dt: number) {
  this.advance(dt);

  switch (true) {
    case this.hits > 5:
      this.color = 'black';
      break;
    case this.hits > 4:
      // this.color = 'blue';
      this.color = '#718FEA';
      break;
    case this.hits > 3:
      // this.color = 'green';
      this.color = '#9EEA70';
      break;
    case this.hits > 2:
      // this.color = 'yellow';
      this.color = '#EDED86';
      break;
    case this.hits > 1:
      // this.color = 'orange';
      this.color = '#E0986B';
      break;
    default:
      // this.color = 'red';
      this.color = '#E77474';
      break;
  }

  //Update hitbox on move
  this.top = this.y - this.height / 2 - 2;
  this.bottom = this.y + this.height / 2 + 2;
  this.left = this.x - this.width / 2 - 2;
  this.right = this.x + this.width / 2 + 2;
}

// Orbit around barycenter (the ball)
// particleGravity :: () -> ()
export function particleGravity(this: Sprite) {
  const vectorX = this.barycenter.x - this.x;
  const vectorY = this.barycenter.y - this.y;
  const force =
    this.barycenter.mass / Math.pow(vectorX * vectorX + vectorY * vectorY, 1.5);
  const totalDistance = Math.sqrt(vectorX ** 2 + vectorY ** 2);

  // Ramp up acceleration when particles move far away to keep them contained
  if (totalDistance > 50) {
    this.acceleration.x = vectorX * force * 100;
    this.acceleration.y = vectorY * force * 100;
  } else {
    this.acceleration.x = vectorX * force;
    this.acceleration.y = vectorY * force;
  }

  // Keep particles from going too fast
  if (Math.abs(this.dx) > this.maxDx) {
    this.dx > 0 ? (this.dx = this.maxDx) : (this.dx = -1 * this.maxDx);
  }
  if (Math.abs(this.dy) > this.maxDy) {
    this.dy > 0 ? (this.dy = this.maxDy) : (this.dy = -1 * this.maxDy);
  }

  this.advance();
}
