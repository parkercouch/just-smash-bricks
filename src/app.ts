import { init } from 'kontra';
import {
  initDebugButton,
  initFullscreenButton,
  initMuteButton,
  initSpeedButton,
} from './dom';
import { displayHighScore } from './score';
import { gameStates } from './ui_states';
import { initializeInputs } from './input';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './globals';

document.addEventListener('DOMContentLoaded', () => {
  initFullscreenButton();
  initSpeedButton();
  initDebugButton();
  initMuteButton();

  displayHighScore();

  const canvas = document.getElementById('game')! as HTMLCanvasElement;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  init(canvas);
  initializeInputs();

  gameStates.startLoading();
});
