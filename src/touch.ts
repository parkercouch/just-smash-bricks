import { Pool, Sprite } from 'kontra';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './globals';
import { renderButton } from './render';
import { disableLaunch, launchBall } from './update';
import {
  input_left_off,
  input_left_on,
  input_right_off,
  input_right_on,
} from './input';

// Create left button sprite for touch input
// createLeftButton :: Sprite -> Sprite
export function createLeftButton(): Sprite {
  return Sprite({
    type: 'button',
    action: 'left',
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    x: CANVAS_WIDTH / 4,
    y: CANVAS_HEIGHT / 2,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: CANVAS_WIDTH / 2,
    height: CANVAS_HEIGHT,
    onDown: input_left_on,
    onUp: input_left_off,
    render: renderButton,
  });
}

// Create right button sprite for touch input
// createRightButton :: Sprite -> Sprite
export function createRightButton(): Sprite {
  return Sprite({
    type: 'button',
    action: 'right',
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    x: CANVAS_WIDTH * (3 / 4),
    y: CANVAS_HEIGHT / 2,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: CANVAS_WIDTH / 2,
    height: CANVAS_HEIGHT,
    fill: true,
    onDown: input_right_on,
    onUp: input_right_off,
    render: renderButton,
  });
}

// Create Middle button sprite for touch input
// createMiddleButton :: Pool -> Sprite
export function createMiddleButton(balls: Pool): Sprite {
  return Sprite({
    type: 'button',
    action: 'launch',
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: CANVAS_WIDTH / 4,
    height: CANVAS_HEIGHT,
    fill: false,
    onDown: launchBall(balls.getAliveObjects()[0] as Sprite),
    onUp: disableLaunch,
    render: renderButton,
  });
}

// Show fullscreen touch buttons when changed to fullscreen
// showTouchButtons () -> ()
export function showTouchButtons() {
  const controls = document.querySelector('#controls') as HTMLElement;
  controls?.classList.remove('hide-controls');
  controls?.classList.add('show-controls');
  if (window.screen.height < 850) {
    controls.style.height = `${window.screen.height - 26 - CANVAS_HEIGHT}px`;
  }
}

// Hide fullscreen touch buttons when leaving fullscreen
// hideTouchButtons () -> ()
export function hideTouchButtons() {
  document.querySelector('#controls')?.classList.add('hide-controls');
  document.querySelector('#controls')?.classList.remove('show-controls');
}

// Add needed listeners to fullscreen touch buttons
export function addTouchEventListeners(middle: () => void) {
  document
    .querySelector('.left')
    ?.addEventListener('pointerdown', input_left_on);
  document
    .querySelector('.left')
    ?.addEventListener('pointerup', input_left_off);
  document
    .querySelector('.right')
    ?.addEventListener('pointerdown', input_right_on);
  document
    .querySelector('.right')
    ?.addEventListener('pointerup', input_right_off);
  document
    .querySelector('.middle')
    ?.addEventListener('pointerdown', function handle(e) {
      e.target?.removeEventListener('pointerdown', handle);
      middle();
    });
}

// Remove listeners to fullscreen touch buttons
export function removeTouchEventListeners() {
  document
    .querySelector('.left')
    ?.removeEventListener('pointerdown', input_left_on);
  document
    .querySelector('.left')
    ?.removeEventListener('pointerup', input_left_off);
  document
    .querySelector('.right')
    ?.removeEventListener('pointerdown', input_right_on);
  document
    .querySelector('.right')
    ?.removeEventListener('pointerup', input_left_off);
}

// Update which ball is launched when a new ball is created
// updateMiddleTouchButton :: Function -> ()
export function updateMiddleTouchButton(newFunction: () => void) {
  document
    .querySelector('.middle')
    ?.addEventListener('pointerdown', function handle(e) {
      e.target?.removeEventListener('pointerdown', handle);
      newFunction();
    });
}
