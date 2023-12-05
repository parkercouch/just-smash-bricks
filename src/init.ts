import { Pool, Sprite } from 'kontra';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PARTICLE_COLOR,
} from './globals';
import { particleRender } from './render';
import { particleGravity } from './update';
import { Ball } from './ball';

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
export function newBallPool(attached: Sprite): Pool {
  return Pool({
    create: () => {return new Ball({attached})},
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
