import { Pool, Sprite } from 'kontra';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './globals';
import { renderButton } from './render';
import {
  disableLaunch,
  launchBall,
  movePaddleLeft,
  movePaddleRight,
  stopPaddle,
} from './update';

// Create left button sprite for touch input
// createLeftButton :: Sprite -> Sprite
export function createLeftButton(paddle: Sprite): Sprite {
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
    onDown: movePaddleLeft(paddle),
    onUp: stopPaddle(paddle),
    render: renderButton,
  });
}

// Create right button sprite for touch input
// createRightButton :: Sprite -> Sprite
export function createRightButton(paddle: Sprite): Sprite {
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
    onDown: movePaddleRight(paddle),
    onUp: stopPaddle(paddle),
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
// addTouchEventListeners :: Function -> Function -> Function -> Function -> ()
export function addTouchEventListeners(
  left: () => void,
  right: () => void,
  middle: () => void,
  stop: () => void,
) {
  document.querySelector('.left')?.addEventListener('pointerdown', left);
  document.querySelector('.left')?.addEventListener('pointerup', stop);
  document.querySelector('.right')?.addEventListener('pointerdown', right);
  document.querySelector('.right')?.addEventListener('pointerup', stop);
  document
    .querySelector('.middle')
    ?.addEventListener('pointerdown', function handle(e) {
      e.target?.removeEventListener('pointerdown', handle);
      middle();
    });
}

// Remove listeners to fullscreen touch buttons
// removeTouchEventListeners :: Function -> Function -> Function -> ()
export function removeTouchEventListeners(
  left: () => void,
  right: () => void,
  stop: () => void,
) {
  document.querySelector('.left')?.removeEventListener('pointerdown', left);
  document.querySelector('.left')?.removeEventListener('pointerup', stop);
  document.querySelector('.right')?.removeEventListener('pointerdown', right);
  document.querySelector('.right')?.removeEventListener('pointerup', stop);
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
