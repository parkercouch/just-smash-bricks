import { emit, initInput, onInput } from 'kontra';

export const input_left_on = () => {
  emit('input_left:on');
};

export const input_left_off = () => {
  emit('input_left:off');
};

export const input_right_on = () => {
  emit('input_right:on');
};

export const input_right_off = () => {
  emit('input_right:off');
};

export const input_middle_on = () => {
  emit('input_middle:on');
};

export const input_middle_off = () => {
  emit('input_middle:off');
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

  onInput(['a', 'arrowleft', 'dpadleft'], input_left_on, onDown);
  onInput(['a', 'arrowleft', 'dpadleft'], input_left_off, onUp);

  onInput(['d', 'arrowright', 'dpadright'], input_right_on, onDown);
  onInput(['d', 'arrowright', 'dpadright'], input_right_off, onUp);

  onInput(['w', 'arrowup', 'dpadup'], input_middle_on, onDown);
  onInput(['w', 'arrowup', 'dpadup'], input_middle_off, onUp);
}
