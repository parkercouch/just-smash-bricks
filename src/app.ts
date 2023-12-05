/* eslint-disable */

import { init } from 'kontra';
import {
  initDebugButton,
  initFullscreenButton,
  initMuteButton,
  initSpeedButton,
} from './dom';
import { resizeCanvasToDisplaySize } from './util';
import { initializeHighScores } from './score';
import { gameStates } from './ui_states';
import { initializeInputs } from './input';

document.addEventListener('DOMContentLoaded', function() {
  initFullscreenButton();
  initSpeedButton();
  initDebugButton();
  initMuteButton();

  initializeHighScores();

  const canvasElement = document.getElementById('game')! as HTMLCanvasElement;
  resizeCanvasToDisplaySize(canvasElement);

  // Initialize Kontra
  init(canvasElement);
  initializeInputs();

  gameStates.startLoading();
});
