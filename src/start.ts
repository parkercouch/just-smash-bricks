/* eslint-disable */
import { Sprite, track } from 'kontra';
import { generate_level } from './levels';
import { showTopDisplay } from './messages';
import { playDropSound } from './sounds';
import {
  addTouchEventListeners,
  createLeftButton,
  createMiddleButton,
  createRightButton,
} from './touch';
import { createGameLoop } from './game_loop';
import {
  createWalls,
  newBallPool,
  newBrickPool,
} from './init';
import { CURRENT_LEVEL, LIVES, SCORE } from './globals';
import { Paddle } from './paddle';
import { ParticleSwarm } from './particle_swarm';

// startGameLoop :: () -> ()
export const startGameLoop = function() {
  // Reset lives and score
  LIVES.value = 5;
  SCORE.value = 0;
  CURRENT_LEVEL.value = 1;

  const paddle = new Paddle();

  // BALLS //
  const ballPool = newBallPool(paddle);
  ballPool.get();

  // TOUCH BUTTONS //
  const leftButton = createLeftButton();
  const rightButton = createRightButton();
  const middleButton = createMiddleButton();

  addTouchEventListeners();
  track(leftButton);
  track(rightButton);
  track(middleButton);

  // BOUNDARY WALLS //
  const walls = createWalls();

  // BRICKS //
  const brickPool = newBrickPool();

  // Create Level 1
  generate_level(brickPool, 1);

  const particleSwarm = new ParticleSwarm(100, ballPool.getAliveObjects()[0] as Sprite);
  particleSwarm.start(10);

  // PRE-RENDER //

  brickPool.update();
  brickPool.render();
  paddle.update();
  paddle.render();
  ballPool.update();
  ballPool.render();
  particleSwarm.render();
  rightButton.render();
  leftButton.render();
  middleButton.render();
  showTopDisplay();

  // Drop in first level
  playDropSound(100);
  brickPool.getAliveObjects().forEach((brick, i) => {
    (brick as Sprite).onSpawn(100 / (1 + Math.floor(i / 6)));
  });

  const gameLoop = createGameLoop({
    brickPool,
    ballPool,
    particleSwarm,
    paddle,
    walls,
  });

  // Start the game!
  gameLoop.start();
};
