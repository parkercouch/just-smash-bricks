import { init } from 'kontra';
import {
  initDebugButton,
  initFullscreenButton,
  initMuteButton,
  initSpeedButton,
} from './dom';
import { initializeHighScores } from './score';
import { gameStates } from './ui_states';
import { initializeInputs } from './input';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './globals';

document.addEventListener('DOMContentLoaded', function () {
  initFullscreenButton();
  initSpeedButton();
  initDebugButton();
  initMuteButton();

  initializeHighScores();

  const canvas = document.getElementById('game')! as HTMLCanvasElement;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  init(canvas);
  initializeInputs();

  gameStates.startLoading();
});
