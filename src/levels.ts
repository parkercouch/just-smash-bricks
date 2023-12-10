import { GameLoop } from 'kontra';
import {
  level2,
  level3,
  level4,
  level5,
  playDropSound,
  startNextSong,
  stopMusic,
} from './sounds';
import { updateLevelDisplay } from './dom';
import { SCORE } from './globals';
import { gameStates } from './ui_states';
import { BrickPool } from './brick';

export function advanceLevel(
  loop: GameLoop,
  bricks: BrickPool,
  currentLevel: number,
): number {
  const level = currentLevel + 1;
  // score boost for every level
  SCORE.value += level * 1000;

  switch (level) {
    case 2:
      startNextSong(level2);
      generate_level(bricks, 2);
      break;
    case 3:
      startNextSong(level3);
      generate_level(bricks, 3);
      break;
    case 4:
      startNextSong(level4);
      generate_level(bricks, 4);
      break;
    case 5:
      startNextSong(level5);
      generate_level(bricks, 5);
      break;
    case 6:
      stopMusic();
      generate_level(bricks, 6);
      break;
    // WIN!
    default:
      // TODO: Add win music here
      // Big score boost for win
      SCORE.value += 100000;
      loop.stop();
      gameStates.win();
      return 0;
  }

  bricks.forEach((brick, i) => {
    brick.onSpawn(500 / (1 + Math.floor(i / 6)));
  });

  updateLevelDisplay(level);
  playDropSound(300);
  return level;
}

export function generate_level(pool: BrickPool, hits: number) {
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 6; j++) {
      const startX = 30 + j * 5 + (j - 1) * 50;
      const startY = 30 + i * 5 + (i - 1) * 15 - 500;

      pool.get({
        startX,
        startY,
        hits,
      });
    }
  }
}
