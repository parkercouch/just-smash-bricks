import { CURRENT_LEVEL, LIVES, SCORE } from './globals';

export const MESSAGE = document.getElementById('message');
export const TITLE = document.getElementById('title');
export const TOP_DISPLAY = document.getElementById('top-display');

// startIntroScene :: () -> [timeout id's]
export function startIntroScene(): number[] {
  const intro_messages = [
    { delay_ms: 2000, message: `WAKE UP!` },
    { delay_ms: 5000, message: `What? Where am I?` },
    { delay_ms: 8000, message: `No questions. \r\n Just Smash Bricks!` },
    { delay_ms: 11000, message: `Just...What?` },
    { delay_ms: 14000, message: `No questions. \r\n Just Smash Bricks!` },
    { delay_ms: 17000, message: `...why? \r\n Who are you?` },
    { delay_ms: 20000, message: `No questions. \r\n Just Smash Bricks!` },
    { delay_ms: 23000, message: `Ok...fine. \r\n I'll smash the bricks.` },
    {
      delay_ms: 26000,
      message: `I'm glad you understand. \r\n Smash all 5 levels \r\n and we might let you live.`,
    },
    { delay_ms: 31000, message: `...I guess I don't have much of a choice.` },
  ];

  const ids = intro_messages.map(({ message, delay_ms }) =>
    setTimeout(() => {
      clearMessages();
      addMessage(message, 'intro');
    }, delay_ms),
  );

  ids.push(
    setTimeout(() => {
      clearMessages();
      addTitle('JUST SMASH BRICKS!', 'title');
      addMessage(`Click, tap, press, or whatever to continue`, 'pause');
    }, 34000),
  );

  return ids;
}

export function clearMessages() {
  MESSAGE?.classList.remove('showMessage');
  MESSAGE?.classList.add('hideMessage');
  while (MESSAGE?.firstChild) {
    MESSAGE.removeChild(MESSAGE.firstChild);
  }
}

export function addMessage(message: string, type: string) {
  MESSAGE?.classList.remove('hideMessage');
  MESSAGE?.classList.add('showMessage');
  const newMessage = document.createElement('h2');
  newMessage.textContent = message;
  newMessage.classList.add(type);
  MESSAGE?.appendChild(newMessage);
}

export function addTitle(message: string, type: string) {
  const newMessage = document.createElement('h1');
  newMessage.textContent = message;
  newMessage.classList.add(type);
  TITLE?.appendChild(newMessage);
}

export function clearTitle() {
  while (TITLE?.firstChild) {
    TITLE.removeChild(TITLE.firstChild);
  }
}

export function showTopDisplay() {
  const livesTitle = document.createElement('h5');
  livesTitle.textContent = 'Lives left: ';
  livesTitle.classList.add('lives-title');

  const scoreTitle = document.createElement('h5');
  scoreTitle.textContent = 'Score: ';
  scoreTitle.classList.add('score-title');

  const levelTitle = document.createElement('h5');
  levelTitle.textContent = 'Level ';
  levelTitle.classList.add('level-title');

  const lives = document.createElement('span');
  lives.textContent = `${LIVES.value - 1}`;
  lives.classList.add('lives');
  livesTitle.appendChild(lives);

  const score = document.createElement('span');
  score.textContent = SCORE.value.toString();
  score.classList.add('score');
  scoreTitle.appendChild(score);

  const level = document.createElement('span');
  level.textContent = `${CURRENT_LEVEL.value}`;
  level.classList.add('level');
  levelTitle.appendChild(level);

  TOP_DISPLAY?.appendChild(livesTitle);
  TOP_DISPLAY?.appendChild(scoreTitle);
  TOP_DISPLAY?.appendChild(levelTitle);
}

export function hideTopDisplay() {
  while (TOP_DISPLAY?.firstChild) {
    TOP_DISPLAY.removeChild(TOP_DISPLAY.firstChild);
  }
}
