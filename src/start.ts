import { track } from 'kontra';
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
import { createWalls } from './wall';
import { CURRENT_LEVEL, LIVES, SCORE } from './globals';
import { Paddle } from './paddle';
import { ParticleSwarm } from './particle';
import { BrickPool } from './brick';
import { BallPool } from './ball';

export const startGameLoop = () => {
  LIVES.value = 5;
  SCORE.value = 0;
  CURRENT_LEVEL.value = 1;

  const paddle = new Paddle();

  const balls = new BallPool({ attached: paddle });
  balls.get();

  const leftButton = createLeftButton();
  const rightButton = createRightButton();
  const middleButton = createMiddleButton();

  addTouchEventListeners();
  track(leftButton);
  track(rightButton);
  track(middleButton);
  rightButton.render();
  leftButton.render();
  middleButton.render();

  const walls = createWalls();
  const bricks = new BrickPool();

  generate_level(bricks, 1);

  const particleSwarm = new ParticleSwarm(balls.getBall());
  particleSwarm.start(10);

  showTopDisplay();

  // Drop in first level
  playDropSound(100);
  bricks.forEach((brick, i) => {
    brick.onSpawn(100 / (1 + Math.floor(i / 6)));
  });

  const gameLoop = createGameLoop({
    bricks,
    balls,
    particleSwarm,
    paddle,
    walls,
  });

  gameLoop.start();
};
