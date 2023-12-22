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
import { CURRENT_LEVEL, SCORE } from './globals';
import { GameState } from './state';
import { BrickPool } from './brick';

export function advanceLevel(loop: GameLoop, bricks: BrickPool) {
  CURRENT_LEVEL.value += 1;
  SCORE.value += CURRENT_LEVEL.value * 1000;

  switch (CURRENT_LEVEL.value) {
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
      GameState.Instance.win();
      return;
  }

  bricks.forEach((brick, i) => {
    brick.onSpawn(500 / (1 + Math.floor(i / 6)));
  });

  updateLevelDisplay(CURRENT_LEVEL.value);
  playDropSound(300);
}

export function generate_level(pool: BrickPool, hits: number) {
  //prettier-ignore
  const levelCoords =
    [
      [35, 35], [90, 35], [145, 35], [200, 35], [255, 35], [310, 35],
      [35, 55], [90, 55], [145, 55], [200, 55], [255, 55], [310, 55],
      [35, 75], [90, 75], [145, 75], [200, 75], [255, 75], [310, 75],
      [35, 95], [90, 95], [145, 95], [200, 95], [255, 95], [310, 95],
      [35, 115], [90, 115], [145, 115], [200, 115], [255, 115], [310, 115],
    ];
  levelCoords.map(([x, y]) =>
    pool.get({
      startX: x,
      startY: y - 500,
      hits,
    }),
  );
}
