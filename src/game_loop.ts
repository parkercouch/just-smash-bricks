/* eslint-disable */
import { GameLoop, Pool, Sprite } from 'kontra';
import * as TWEEN from '@tweenjs/tween.js';
import { advanceLevel } from './levels';
import { updateLives } from './util';
import { stopMusic } from './sounds';
import { removeTouchEventListeners } from './touch';
import { addMessage, clearMessages } from './messages';
import { CURRENT_LEVEL, DEBUG_ON, FPS, LIVES } from './globals';
import { gameStates } from './ui_states';
import { Paddle } from './paddle';
import { ParticleSwarm } from './particle_swarm';

export type gameLoopInitOptions = {
  brickPool: Pool;
  ballPool: Pool;
  particleSwarm: ParticleSwarm;
  paddle: Paddle;
  walls: Sprite[];
};

let GAMELOOP: GameLoop;

export function createGameLoop({
  brickPool,
  ballPool,
  particleSwarm,
  paddle,
  walls,
}: gameLoopInitOptions) {
  GAMELOOP = GameLoop({
    fps: FPS.value,

    // UPDATE GAME STATE //
    update: function(dt: number) {
      TWEEN.update();

      brickPool.update();
      paddle.move(ballPool.getAliveObjects()[0] as Sprite);
      const bricks = brickPool.getAliveObjects();

      // Ready to check for collision!
      ballPool.update(dt, [...bricks, ...walls, paddle]);
      particleSwarm.update();
      brickPool.update();

      // If all bricks are gone then go to next level/win
      if (brickPool.getAliveObjects().length <= 0) {
        brickPool.clear();
        CURRENT_LEVEL.value = advanceLevel(
          this,
          brickPool,
          CURRENT_LEVEL.value,
        );
        LIVES.value += 1;
        updateLives();
        return;
      }

      // Check if any balls are left
      if (ballPool.getAliveObjects().length <= 0) {
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
        ballPool.clear();
        ballPool.get();
        particleSwarm.follow(ballPool.getAliveObjects()[0] as Sprite)
        return;
      }
    },

    // RENDER GAME STATE //
    render: function() {
      paddle.render();
      ballPool.render();
      brickPool.render();
      particleSwarm.render();
    },
  });

  return GAMELOOP;
}

// Pause Game
// pause :: Event -> ()
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
