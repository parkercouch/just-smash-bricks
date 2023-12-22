import {
  addMessage,
  addTitle,
  clearMessages,
  clearTitle,
  hideTopDisplay,
  startIntroScene,
} from './messages';
import { CANVAS_HEIGHT, CANVAS_WIDTH, GAME_CONTAINER, SCORE } from './globals';
import { ac, playMusic } from './sounds';
import { getCanvas, getContext, init } from 'kontra';
import { displayHighScore, updateHighScores } from './score';
import { pause } from './game_loop';
import { startGameLoop } from './start';
import {
  initDebugButton,
  initFullscreenButton,
  initMuteButton,
  initSpeedButton,
} from './dom';
import { initializeInputs } from './input';

export class GameState {
  static #_instance: GameState;
  private constructor() { }
  public static get Instance(): GameState {
    if (!GameState.#_instance) {
      GameState.#_instance = new GameState();
    }
    return GameState.#_instance;
  }

  setupGame() {
    const canvas = document.getElementById('game')! as HTMLCanvasElement;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    init(canvas);
    initFullscreenButton();
    initSpeedButton();
    initDebugButton();
    initMuteButton();
    initializeInputs();
    displayHighScore();

    addMessage('Loading...', 'loading');

    const introIntervals = startIntroScene();

    const nextStep = function() {
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
        GameState.Instance.start();
      }, 500);
    };

    // Make click/keypress skip intro
    GAME_CONTAINER.addEventListener('click', nextStep);
    document.addEventListener('keypress', nextStep);
  }

  start() {
    document.addEventListener('keypress', pause);
    startGameLoop();
  }

  displayMenu() {
    // Clear Canvas
    const context = getContext();
    const canvas = getCanvas();
    context.clearRect(0, 0, canvas.width, canvas.height);
    hideTopDisplay();
    clearMessages();
    // Display Menu
    addTitle('JUST SMASH BRICKS!', 'title');
    addMessage('Click, tap, press, or whatever to start smashing.', 'menu');
    GAME_CONTAINER.addEventListener('click', clickToStart);
    document.addEventListener('keypress', clickToStart);
  }

  restart() {
    document.removeEventListener('keypress', pause);
    this.displayMenu();
  }

  win() {
    addMessage(
      `We didn't think this would happen... \r\n Score: ${SCORE.value}`,
      'win',
    );
    setTimeout(() => {
      GameState.Instance.restart();
    }, 3000);
    updateHighScores(SCORE.value);
  }

  lose() {
    addMessage(`You fail. \r\n Score: ${SCORE.value}`, 'lose');
    setTimeout(() => {
      GameState.Instance.restart();
    }, 3000);
    updateHighScores(SCORE.value);
  }
}

function clickToStart() {
  GAME_CONTAINER.removeEventListener('click', clickToStart);
  document.removeEventListener('keypress', clickToStart);
  // Resume AudioContext and start playing music after interaction
  void ac.resume().then(() => {
    playMusic();
  });
  clearMessages();
  clearTitle();
  // Delay start so pressing space doesn't launch ball immediately
  setTimeout(() => {
    GameState.Instance.start();
  }, 500);
}
