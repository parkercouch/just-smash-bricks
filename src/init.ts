import { Pool, Sprite } from 'kontra';
import {
  BALL_COLOR,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PADDLE_COLOR,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  PARTICLE_COLOR,
} from './globals';
import { particleRender, renderBall } from './render';
import { ballIntercept } from './util';
import { paddleBounce } from './animations';
import {
  movePaddle,
  movePaddleLeft,
  movePaddleRight,
  movingBall,
  paddleUpdate,
  particleGravity,
  stopPaddle,
} from './update';

// Create the main paddle
// createPaddle :: () -> Sprite
export function createPaddle(): Sprite {
  const newPaddle = Sprite({
    type: 'paddle',
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    // Place paddle in midde and above the bottom display
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    dx: 0,
    dy: 0,
    moving: false,
    ttl: Infinity,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    top: CANVAS_HEIGHT - 50 - PADDLE_HEIGHT / 2 + 1,
    bottom: CANVAS_HEIGHT - 50 + PADDLE_HEIGHT / 2 - 1,
    left: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    right: CANVAS_WIDTH / 2 + PADDLE_WIDTH / 2,
    color: PADDLE_COLOR,
    // image: kontra.assets.images.paddle,
    update: paddleUpdate,
    move: movePaddle,
    onHit: paddleBounce,
    moveLeft: movePaddleLeft,
    moveRight: movePaddleRight,
    stop: stopPaddle,
  });
  // Keep paddle on the screen
  newPaddle.position.clamp(
    0 + newPaddle.width / 2,
    0,
    CANVAS_WIDTH - newPaddle.width / 2,
    CANVAS_HEIGHT,
  );
  return newPaddle;
}

// Creates a new ball and attaches to paddle
// newBall :: Pool -> Sprite -> ()
export function newBall(pool: Pool, paddle: Sprite) {
  pool.get({
    type: 'ball',
    combo: 0,
    attached: paddle, // keep track if it is stuck to something
    mass: 100,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    // Testing start ball location
    x: paddle.x + paddle.width / 2,
    y: paddle.y - 8,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    radius: 11,
    color: BALL_COLOR,
    update: movingBall,
    render: renderBall,
    collidesWith: ballIntercept,
    contain: function(this: Sprite) {
      this.position.clamp(
        0 + this.radius / 2,
        0 + this.radius / 2,
        CANVAS_WIDTH - this.radius / 2,
        CANVAS_HEIGHT - this.radius / 2,
      );
    },
  });
}

// Creates new brick pool
// newBrickPool :: () -> ()
export function newBrickPool(): Pool {
  return Pool({
    create: Sprite,
    maxSize: 100,
  });
}

// Creates new ball pool
// newBallPool :: () -> ()
export function newBallPool(): Pool {
  return Pool({
    create: Sprite,
    maxSize: 10,
  });
}

// Creates the boundary walls
// createWalls :: () -> [Sprite]
export function createWalls(): Sprite[] {
  // WALLS //
  return [
    // Left Wall
    Sprite({
      type: 'wall',
      anchor: {
        x: 1,
        y: 0,
      },
      x: 0.5,
      y: 0,
      dx: 0,
      dy: 0,
      ttl: Infinity,
      width: 1,
      height: CANVAS_HEIGHT,
      top: 0,
      bottom: CANVAS_HEIGHT,
      left: -0.5,
      right: 0,
    }),

    // Right Wall
    Sprite({
      type: 'wall',
      anchor: {
        x: 0,
        y: 0,
      },
      x: CANVAS_WIDTH - 0.5,
      y: 0,
      dx: 0,
      dy: 0,
      ttl: Infinity,
      width: 1,
      height: CANVAS_HEIGHT,
      top: 0,
      bottom: CANVAS_HEIGHT,
      left: CANVAS_WIDTH - 0.5,
      right: CANVAS_WIDTH + 0.5,
    }),

    // Top Wall
    Sprite({
      type: 'wall',
      anchor: {
        x: 0,
        y: 1,
      },
      x: 0,
      y: 0.5,
      dx: 0,
      dy: 0,
      ttl: Infinity,
      width: CANVAS_WIDTH,
      height: 1,
      top: -0.5,
      bottom: 0.5,
      left: 0,
      right: CANVAS_WIDTH,
    }),

    // Bottom Wall
    Sprite({
      type: 'blackhole',
      anchor: {
        x: 0,
        y: 0,
      },
      x: 0,
      y: CANVAS_HEIGHT - 0.5,
      dx: 0,
      dy: 0,
      ttl: Infinity,
      width: CANVAS_WIDTH,
      height: 1,
      top: CANVAS_HEIGHT - 0.5,
      bottom: CANVAS_HEIGHT + 0.5,
      left: 0,
      right: CANVAS_WIDTH,
    }),
  ];
}

// PARTICLES //

// Create a pool to pull particles from
// newParticlePool :: Maybe Int -> Pool
export function newParticlePool(max = 50): Pool {
  return Pool({
    create: Sprite,
    maxSize: max,
  });
}

// Creates a group of particles
// createParticles :: Pool -> Int -> Sprite -> ()
export function createParticles(
  pool: Pool,
  amount: number,
  barycenter: Sprite,
) {
  for (let i = 0; i < amount; i++) {
    pool.get({
      type: 'particle',
      barycenter: barycenter, // keep track if it is stuck to something
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      x: barycenter.x + (2 - Math.random() * 4),
      y: barycenter.y + (2 - Math.random() * 4),
      dx: 2 - Math.random() * 4,
      dy: 2 - Math.random() * 4,
      maxDx: 10,
      maxDy: 10,
      ttl: Infinity,
      color: PARTICLE_COLOR,
      width: 3,
      height: 3,
      update: particleGravity,
      render: particleRender,
    });
  }
  // Keep particles contained so they don't fly too far away
  // This keeps them just off screen so they don't clump up and look weird
  pool.getAliveObjects().forEach((particle) => {
    (particle as Sprite).position.clamp(
      -50,
      -50,
      CANVAS_WIDTH + 50,
      CANVAS_HEIGHT + 50,
    );
  });
}
