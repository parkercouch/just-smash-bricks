import { Sprite, getCanvas } from 'kontra';
import {
  input_left_off,
  input_left_on,
  input_middle_off,
  input_middle_on,
  input_right_off,
  input_right_on,
} from './input';

export function createLeftButton(): Sprite {
  const canvas = getCanvas();
  return Sprite({
    type: 'button',
    action: 'left',
    x: 0,
    y: 0,
    width: canvas.width / 2,
    height: canvas.height,
    onDown: input_left_on,
    onUp: input_left_off,
    render: renderButton,
  });
}

export function createRightButton(): Sprite {
  const canvas = getCanvas();
  return Sprite({
    type: 'button',
    action: 'right',
    x: canvas.width / 2,
    y: 0,
    width: canvas.width / 2,
    height: canvas.height,
    fill: true,
    onDown: input_right_on,
    onUp: input_right_off,
    render: renderButton,
  });
}

export function createMiddleButton(): Sprite {
  const canvas = getCanvas();
  return Sprite({
    type: 'button',
    action: 'launch',
    x: canvas.width / 2 - canvas.width / 4,
    y: 0,
    width: canvas.width / 4,
    height: canvas.height,
    fill: false,
    onDown: input_middle_on,
    onUp: input_middle_off,
    render: renderButton,
  });
}

export function showTouchButtons() {
  const canvas = getCanvas();
  const controls = document.querySelector('#controls') as HTMLElement;
  controls?.classList.remove('hide-controls');
  controls?.classList.add('show-controls');
  if (window.screen.height < 850) {
    controls.style.height = `${window.screen.height - 26 - canvas.height}px`;
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
