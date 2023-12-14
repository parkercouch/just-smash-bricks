export const DEFAULT_FPS = 120;
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

export const GAME_CONTAINER = document.getElementById('game-container');

class MutableGlobal<T> {
  constructor(public value: T) {}
}

export const FPS = new MutableGlobal(DEFAULT_FPS);
export const LIVES = new MutableGlobal(0);
export const SCORE = new MutableGlobal(0);
export const CURRENT_LEVEL = new MutableGlobal(0);
export const DEBUG_ON = new MutableGlobal(false);
