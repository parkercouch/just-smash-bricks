import { initInput, onInput } from 'kontra';

let LEFT_IS_PRESSED = false;
let RIGHT_IS_PRESSED = false;
let MIDDLE_IS_PRESSED = false;

export const input_left_on = () => {
  LEFT_IS_PRESSED = true;
};

export const input_left_off = () => {
  LEFT_IS_PRESSED = false;
};

export const input_right_on = () => {
  RIGHT_IS_PRESSED = true;
};

export const input_right_off = () => {
  RIGHT_IS_PRESSED = false;
};

export const input_middle_on = () => {
  MIDDLE_IS_PRESSED = true;
};

export const input_middle_off = () => {
  MIDDLE_IS_PRESSED = false;
};

const onDown = {
  key: {
    handler: 'keydown',
  },
  gamepad: {
    handler: 'gamepaddown',
  },
};

const onUp = {
  key: {
    handler: 'keyup',
  },
  gamepad: {
    handler: 'gamepadup',
  },
};

export function initializeInputs() {
  initInput();

  onInput(['w', 'arrowup', 'dpadup'], input_middle_on, onDown);
  onInput(['w', 'arrowup', 'dpadup'], input_middle_off, onUp);

  onInput(['a', 'arrowleft', 'dpadleft'], input_left_on, onDown);
  onInput(['a', 'arrowleft', 'dpadleft'], input_left_off, onUp);

  onInput(['d', 'arrowright', 'dpadright'], input_right_on, onDown);
  onInput(['d', 'arrowright', 'dpadright'], input_right_off, onUp);
}

export function isLeftPressed(): boolean {
  return LEFT_IS_PRESSED;
}

export function isRightPressed(): boolean {
  return RIGHT_IS_PRESSED;
}

export function isMiddlePressed(): boolean {
  return MIDDLE_IS_PRESSED;
}
