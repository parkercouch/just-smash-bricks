import { Sprite } from 'kontra';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './globals';
import {
  input_left_off,
  input_left_on,
  input_middle_off,
  input_middle_on,
  input_right_off,
  input_right_on,
} from './input';

export function createLeftButton(): Sprite {
  return Sprite({
    type: 'button',
    action: 'left',
    x: 0,
    y: 0,
    width: CANVAS_WIDTH / 2,
    height: CANVAS_HEIGHT,
    onDown: input_left_on,
    onUp: input_left_off,
    render: renderButton,
  });
}

export function createRightButton(): Sprite {
  return Sprite({
    type: 'button',
    action: 'right',
    x: CANVAS_WIDTH / 2,
    y: 0,
    width: CANVAS_WIDTH / 2,
    height: CANVAS_HEIGHT,
    fill: true,
    onDown: input_right_on,
    onUp: input_right_off,
    render: renderButton,
  });
}

export function createMiddleButton(): Sprite {
  return Sprite({
    type: 'button',
    action: 'launch',
    x: CANVAS_WIDTH / 2 - CANVAS_WIDTH / 4,
    y: 0,
    width: CANVAS_WIDTH / 4,
    height: CANVAS_HEIGHT,
    fill: false,
    onDown: input_middle_on,
    onUp: input_middle_off,
    render: renderButton,
  });
}

export function showTouchButtons() {
  const controls = document.querySelector('#controls') as HTMLElement;
  controls?.classList.remove('hide-controls');
  controls?.classList.add('show-controls');
  if (window.screen.height < 850) {
    controls.style.height = `${window.screen.height - 26 - CANVAS_HEIGHT}px`;
  }
}

export function hideTouchButtons() {
  document.querySelector('#controls')?.classList.add('hide-controls');
  document.querySelector('#controls')?.classList.remove('show-controls');
}

export function addTouchEventListeners() {
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
    ?.addEventListener('pointerdown', input_middle_on);
  document
    .querySelector('.middle')
    ?.addEventListener('pointerup', input_middle_off);
}

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
  document
    .querySelector('.middle')
    ?.removeEventListener('pointerdown', input_middle_on);
  document
    .querySelector('.middle')
    ?.removeEventListener('pointerup', input_middle_off);
}

// Transparent render for buttons
function renderButton(this: Sprite) {
  this.context.fillStyle = 'rgba(0,250,0,1)';
}
