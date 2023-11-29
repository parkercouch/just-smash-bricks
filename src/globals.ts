export const DEFAULT_FPS = 120;
export const BRICK_HEIGHT = 15;
export const BRICK_WIDTH = 50;
export const PADDLE_WIDTH = 80;
export const PADDLE_HEIGHT = 15;
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

export const GAME_CONTAINER = document.getElementById('game-container');

export const PADDLE_COLOR = '#B993EA';
export const PARTICLE_COLOR = '#ECFFE0';
export const BALL_COLOR = 'white';

class MutableGlobal<T> {
  constructor(public value: T) { }
}

export const FPS = new MutableGlobal(DEFAULT_FPS);
export const LIVES = new MutableGlobal(0);
export const SCORE = new MutableGlobal(0);
export const CURRENT_LEVEL = new MutableGlobal(0);
export const DEBUG_ON = new MutableGlobal(false);
