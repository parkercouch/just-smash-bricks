import { FPS, LIVES, SCORE } from './globals';

// Update level
// updateLevelDisplay :: Int -> ()
export function updateLevelDisplay(currentLevel: number) {
  document
    .querySelector('.level')!
    .textContent = currentLevel.toString();
}

// Update score
// updateScore :: () -> ()
export function updateScore() {
  document
    .querySelector('.score')!
    .textContent = SCORE.value.toString();
}

// Update lives
// updateLives :: () -> ()
export function updateLives() {
  document
    .querySelector('.lives')!
    .textContent = `${LIVES.value - 1}`;
}

// Line intercept
// intercept :: (Num, Num), (Num, Num), (Num, Num), (Num, Num), String -> {Num, Num, String}
export function line_intercept(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
  d: string,
) {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom != 0) {
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    if (ua >= 0 && ua <= 1) {
      const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
      if (ub >= 0 && ub <= 1) {
        const x = x1 + ua * (x2 - x1);
        const y = y1 + ua * (y2 - y1);
        return { x: x, y: y, d: d };
      }
    }
  }
  return null;
}

// magnitute :: Num -> Num -> Num
export function magnitude(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

// Calculated position after move
// move :: {dx,dy}, dt -> {nx,ny}
export function move(
  object: { dx: number; dy: number },
  dt: number,
): { nx: number; ny: number } {
  // KONTRA USES FIXED GAME LOOP dx is just change in pixel/frame
  return {
    nx: object.dx * dt * FPS.value,
    ny: object.dy * dt * FPS.value,
  };
}

export function isNullOrUndefined(obj: unknown): obj is null | undefined {
  return obj === null || obj === undefined;
}
