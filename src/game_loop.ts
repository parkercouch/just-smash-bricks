/* eslint-disable */
import { GameLoop, Pool, Sprite } from 'kontra';
import * as TWEEN from '@tweenjs/tween.js';
import { advanceLevel } from './levels';
import { updateLives } from './util';
import { stopMusic } from './sounds';
import { removeTouchEventListeners, updateMiddleTouchButton } from './touch';
import { addMessage, clearMessages } from './messages';
import { CURRENT_LEVEL, DEBUG_ON, FPS, LIVES } from './globals';
import { launchBall } from './update';
import { gameStates } from './ui_states';
import { Paddle } from './paddle';

export type gameLoopInitOptions = {
  brickPool: Pool;
  ballPool: Pool;
  particlePool: Pool;
  paddle: Paddle;
  walls: Sprite[];
  middleButton: Sprite;
};

let GAMELOOP: GameLoop;

export function createGameLoop({
  brickPool,
  ballPool,
  particlePool,
  paddle,
  walls,
  middleButton,
}: gameLoopInitOptions) {
  GAMELOOP = GameLoop({
    fps: FPS.value,

    // UPDATE GAME STATE //
    update: function(dt: number) {
      // Sync tween animations
      TWEEN.update();

      // Update paddle and bricks then add to quadtree
      brickPool.update();

      //DEBUG AUTO MOVE //
      if (DEBUG_ON.value) {
        if ((ballPool.getAliveObjects()[0] as Sprite).attached === null) {
          paddle.autoMove(ballPool.getAliveObjects()[0] as Sprite);
        } else {
          paddle.update();
        }
      } else {
        paddle.update(); // Normal paddle update
      }

      const bricks = brickPool.getAliveObjects();

      // Ready to check for collision!
      ballPool.update(dt, [...bricks, ...walls, paddle]);
      particlePool.update();
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
        } else {
          updateLives();
          ballPool.get({attached:paddle});
          // Reset button to launch new ball
          middleButton.onDown = launchBall(
            ballPool.getAliveObjects()[0] as Sprite,
          );
          updateMiddleTouchButton(
            launchBall(ballPool.getAliveObjects()[0] as Sprite),
          );
        }
      }
    },

    // RENDER GAME STATE //
    render: function() {
      paddle.render();
      ballPool.render();
      brickPool.render();
      middleButton.render();
      particlePool.render();
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
