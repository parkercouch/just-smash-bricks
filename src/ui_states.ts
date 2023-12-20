/* eslint-disable */
import StateMachine from 'javascript-state-machine';
import {
  addMessage,
  addTitle,
  clearMessages,
  clearTitle,
  hideTopDisplay,
  startIntroScene,
} from './messages';
import { GAME_CONTAINER, SCORE } from './globals';
import { ac, playMusic } from './sounds';
import { getCanvas, getContext } from 'kontra';
import { updateHighScores } from './score';
import { pause } from './game_loop';
import { startGameLoop } from './start';

// Create high level state machine (Play/Pause/Menu...)
export const gameStates = new StateMachine({
  init: 'pageLoad',
  transitions: [
    { name: 'startLoading', from: 'pageLoad', to: 'loading' },
    { name: 'finishLoading', from: '*', to: 'menu' },
    { name: 'start', from: '*', to: 'game' },
    { name: 'quit', from: '*', to: 'menu' },
    { name: 'win', from: '*', to: 'winner' },
    { name: 'lose', from: '*', to: 'loser' },
    { name: 'restart', from: '*', to: 'menu' },
  ],
  methods: {
    onLoading: loadAssets,
    onMenu: displayMenu,
    onEnterGame: gameStart,
    onGame: startGameLoop,
    onLeaveGame: gameEnd,
    onWinner: winMessage,
    onLoser: loseMessage,
  },
});

function loadAssets() {
  addMessage('Loading...', 'loading');

  const introIntervals = startIntroScene();

  const nextStep = function () {
    GAME_CONTAINER.removeEventListener('click', nextStep);
    document.removeEventListener('keypress', nextStep);
    clearMessages();
    clearTitle();
    introIntervals.forEach((id) => {
      clearTimeout(id);
    });
    // Resume AudioContext and start playing music after interaction
    void ac.resume().then(() => {
      playMusic();
    });
    setTimeout(() => {
      gameStates.start();
    }, 500);
  };

  // Make click/keypress skip intro
  GAME_CONTAINER.addEventListener('click', nextStep);
  document.addEventListener('keypress', nextStep);
}

// Basic press any key to start 'menu'
// displayMenu :: () -> ()
function displayMenu() {
  // Clear Canvas
  const context = getContext();
  const canvas = getCanvas();
  context.clearRect(0, 0, canvas.width, canvas.height);
  hideTopDisplay();
  clearMessages();
  // Display Menu
  addTitle('JUST SMASH BRICKS!', 'title');
  addMessage('Click, tap, press, or whatever to start smashing.', 'menu');
  GAME_CONTAINER.addEventListener('click', waitForButton);
  document.addEventListener('keypress', waitForButton);
}

// Start click event listener
// waitForButton :: Event -> ()
function waitForButton() {
  GAME_CONTAINER.removeEventListener('click', waitForButton);
  document.removeEventListener('keypress', waitForButton);
  // Resume AudioContext and start playing music after interaction
  void ac.resume().then(() => {
    playMusic();
  });
  clearMessages();
  clearTitle();
  // Delay start so pressing space doesn't launch ball immediately
  setTimeout(() => {
    gameStates.start();
  }, 500);
}

function winMessage() {
  addMessage(
    `We didn't think this would happen... \r\n Score: ${SCORE.value}`,
    'win',
  );
  setTimeout(() => {
    gameStates.restart();
  }, 3000);
  updateHighScores(SCORE.value);
}

function loseMessage() {
  addMessage(`You fail. \r\n Score: ${SCORE.value}`, 'lose');
  setTimeout(() => {
    gameStates.restart();
  }, 3000);
  updateHighScores(SCORE.value);
}

function gameStart() {
  document.addEventListener('keypress', pause);
}

function gameEnd() {
  document.removeEventListener('keypress', pause);
}
