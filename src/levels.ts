/* eslint-disable */
import { GameLoop, Pool, Sprite } from 'kontra';
import {
  level2,
  level3,
  level4,
  level5,
  playDropSound,
  startNextSong,
  stopMusic,
} from './sounds';
import { updateLevelDisplay } from './util';
import { BRICK_HEIGHT, BRICK_WIDTH, SCORE } from './globals';
import { brickBounce, dropDown } from './animations';
import { colorChange } from './update';
import { gameStates } from './ui_states';

// Start next level and check for win
export function advanceLevel(
  loop: GameLoop,
  bricks: Pool,
  currentLevel: number,
): number {
  // Move to next level
  const level = currentLevel + 1;
  // score boost for every level
  SCORE.value += level * 1000;

  switch (level) {
    // Level 2
    case 2:
      startNextSong(level2);
      generate_level(bricks, 2);
      break;

    // Level 3
    case 3:
      startNextSong(level3);
      generate_level(bricks, 3);
      break;

    // Level 4
    case 4:
      startNextSong(level4);
      generate_level(bricks, 4);
      break;

    // Level 5
    case 5:
      startNextSong(level5);
      generate_level(bricks, 5);
      break;

    // Level 6
    case 6:
      stopMusic();
      generate_level(bricks, 6);
      break;

    // WIN!
    default:
      // Add win music here
      // Big score boost for win
      SCORE.value += 10000;
      loop.stop();
      gameStates.win();
      return 0;
  }

  bricks.getAliveObjects().forEach((brick, i) => {
    (brick as Sprite).onSpawn(500 / (1 + Math.floor(i / 6)));
  });

  updateLevelDisplay(level);
  playDropSound(300);
  return level;
}

export function generate_level(pool: Pool, hits: number) {
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 6; j++) {
      const startX = 30 + j * 5 + (j - 1) * 50;
      const startY = 30 + i * 5 + (i - 1) * 15 - 500;

      pool.get({
        type: 'brick',
        hits,
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        x: startX + BRICK_WIDTH / 2,
        y: startY + BRICK_HEIGHT / 2,
        originalX: startX + BRICK_WIDTH / 2,
        originalY: startY + BRICK_HEIGHT / 2,
        dx: 0,
        dy: 0,
        ttl: Infinity,
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        top: startY - BRICK_HEIGHT - 1,
        bottom: startY + BRICK_HEIGHT + 1,
        left: startX - BRICK_WIDTH - 1,
        right: startX + BRICK_WIDTH + 1,
        color: 'black',
        update: colorChange,
        onHit: brickBounce,
        onSpawn: dropDown,
      });
    }
  }
}
