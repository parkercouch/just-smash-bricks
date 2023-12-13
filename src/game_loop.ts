/* eslint-disable */
import { GameLoop, Sprite } from 'kontra';
import * as TWEEN from '@tweenjs/tween.js';
import { advanceLevel } from './levels';
import { updateLives } from './dom';
import { stopMusic } from './sounds';
import { removeTouchEventListeners } from './touch';
import { addMessage, clearMessages } from './messages';
import { CURRENT_LEVEL, FPS, LIVES } from './globals';
import { gameStates } from './ui_states';
import { Paddle } from './paddle';
import { ParticleSwarm } from './particle';
import { BrickPool } from './brick';
import { BallPool } from './ball';

let GAMELOOP: GameLoop;

export function createGameLoop(options: {
  bricks: BrickPool;
  balls: BallPool;
  particleSwarm: ParticleSwarm;
  paddle: Paddle;
  walls: Sprite[];
}) {
  const { bricks, balls, particleSwarm, paddle, walls } = options;

  GAMELOOP = GameLoop({
    fps: FPS.value,

    update: function (dt: number) {
      TWEEN.update();

      bricks.update();
      paddle.move(balls.getBall());

      // Ready to check for collision!
      balls.update(dt, [...bricks.getAliveObjects(), ...walls, paddle]);
      particleSwarm.update();
      bricks.update();

      // If all bricks are gone then go to next level/win
      if (bricks.getAliveObjects().length <= 0) {
        bricks.clear();
        CURRENT_LEVEL.value = advanceLevel(this, bricks, CURRENT_LEVEL.value);
        LIVES.value += 1;
        updateLives();
        return;
      }

      if (balls.numberAlive() <= 0) {
        LIVES.value -= 1;
        // You Lose!
        if (LIVES.value <= 0) {
          this.stop();
          stopMusic();
          removeTouchEventListeners();
          gameStates.lose();
          return;
        }
        updateLives();
        balls.clear();
        balls.get();
        particleSwarm.follow(balls.getBall());
        return;
      }
    },

    render: function () {
      paddle.render();
      balls.render();
      bricks.render();
      particleSwarm.render();
    },
  });

  return GAMELOOP;
}

export function pause(e: any) {
  if (e.keyCode === 112) {
    if (GAMELOOP.isStopped) {
      clearMessages();
      GAMELOOP.start();
    } else {
      addMessage('PAUSED', 'pause');
      GAMELOOP.stop();
    }
  }
}
