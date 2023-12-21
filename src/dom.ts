import screenfull from 'screenfull';
import { hideTouchButtons, showTouchButtons } from './touch';
import { ac, playMusic, stopMusic } from './sounds';
import { DEBUG_ON, DEFAULT_FPS, FPS, LIVES, SCORE } from './globals';

export function initFullscreenButton() {
  // Add listener to fullscreen button and change/state
  document.getElementById('fs-button')?.addEventListener('click', (e) => {
    (e.target as HTMLElement).blur();
    if (screenfull.isEnabled) {
      void screenfull.toggle();
    }
  });
  screenfull.onchange(() => {
    if (screenfull.isFullscreen) {
      document.getElementById('fs-button')?.setAttribute('innerText', 'Exit');
      // Show touch buttons
      document.querySelector('.container')?.classList.add('no-padding');
      showTouchButtons();
    } else {
      document
        .getElementById('fs-button')
        ?.setAttribute('innerText', 'Fullscreen');
      // Hide touch buttons
      document.querySelector('.container')?.classList.remove('no-padding');
      hideTouchButtons();
    }
  });
}

export function initSpeedButton() {
  // Add listener to change speed button
  document.getElementById('speed-button')?.addEventListener('click', (e) => {
    (e.target as HTMLElement).blur();
    if (FPS.value === 120) {
      FPS.value = 60;
    } else {
      FPS.value = 120;
    }
  });
}

export function initDebugButton() {
  // Add listener to debug mode button
  document.getElementById('debug-button')?.addEventListener('click', (e) => {
    (e.target as HTMLElement).blur();
    if (DEBUG_ON.value === false) {
      DEBUG_ON.value = true;
    } else {
      DEBUG_ON.value = false;
    }
  });
}

export function initMuteButton() {
  document.getElementById('mute-button')?.addEventListener('click', (e) => {
    (e.target as HTMLElement).blur();
    if (ac.state === 'running') {
      void ac.suspend().then(function() {
        (e.target as HTMLElement).textContent = 'Unmute';
      });
    } else if (ac.state === 'suspended') {
      void ac.resume().then(function() {
        playMusic();
        (e.target as HTMLElement).textContent = 'Mute';
      });
    }
    stopMusic();
  });
}

export function updateLevelDisplay(currentLevel: number) {
  document
    .querySelector('.level')!
    .textContent = currentLevel.toString();
}

export function updateScore(combo: number) {
  if (DEBUG_ON.value) {
    return;
  }
  const fpsMultiplier = FPS.value === DEFAULT_FPS ? 5 : 1;

  SCORE.value += combo * 50 * fpsMultiplier;

  document
    .querySelector('.score')!
    .textContent = SCORE.value.toString();
}

export function updateLives() {
  document
    .querySelector('.lives')!
    .textContent = `${LIVES.value - 1}`;
}

