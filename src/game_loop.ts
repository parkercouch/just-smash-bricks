/* eslint-disable */
import { GameLoop, Pool, Sprite } from 'kontra';
import * as TWEEN from '@tweenjs/tween.js';
import { advanceLevel } from './levels';
import { updateLives } from './util';
import { stopMusic } from './sounds';
import { removeTouchEventListeners, updateMiddleTouchButton } from './touch';
import { addMessage, clearMessages } from './messages';
import { newBall } from './init';
import { CURRENT_LEVEL, DEBUG_ON, FPS, LIVES } from './globals';
import { launchBall } from './update';
import { gameStates } from './ui_states';

export type gameLoopInitOptions = {
  brickPool: Pool;
  ballPool: Pool;
  particlePool: Pool;
  paddle: Sprite;
  walls: Sprite[];
  buttons: {
    left: Sprite;
    middle: Sprite;
    right: Sprite;
    moveLeftFunc: () => void;
    moveRightFunc: () => void;
    stopPaddleFunc: () => void;
  };
};

let GAMELOOP: GameLoop;

export function createGameLoop({
  brickPool,
  ballPool,
  particlePool,
  paddle,
  walls,
  buttons,
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
          paddle.autoMove(ballPool.getAliveObjects()[0]);
        } else {
          paddle.update();
        }
      } else {
        paddle.update(); // Normal paddle update
      }

      const bricks = brickPool.getAliveObjects();

      // Ready to check for collision!

      // console.log(bricks, walls, paddle)
      ballPool.update(dt, [...bricks, ...walls, paddle]);

      particlePool.update();

      // Update bricks after collision detection
      brickPool.update();

      // If all bricks are gone then go to next level/win
      if (brickPool.getAliveObjects().length <= 0) {
        brickPool.clear();
        CURRENT_LEVEL.value = advanceLevel(
          this,
          brickPool,
          CURRENT_LEVEL.value,
        );
        // Add a life every level
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
          removeTouchEventListeners(
            buttons.moveLeftFunc,
            buttons.moveRightFunc,
            buttons.stopPaddleFunc,
          );
          gameStates.lose();
          return;
        } else {
          updateLives();
          newBall(ballPool, paddle);
          // Clamp vector in boundaries
          (ballPool.getAliveObjects()[0] as Sprite).contain();
          // Reset button to launch new ball
          buttons.middle.onDown = launchBall(
            ballPool.getAliveObjects()[0] as Sprite,
          );
          // Update fs-touch button
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
      buttons.right.render();
      buttons.left.render();
      buttons.middle.render();
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
