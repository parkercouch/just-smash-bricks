import { getStoreItem, setStoreItem } from 'kontra';
import { DEBUG_ON } from './globals';

export function updateHighScores(score: number) {
  if (DEBUG_ON.value) {
    return;
  }

  const currentHighScores = (getStoreItem('highScores') as number[]) ?? [];

  currentHighScores.push(score);
  currentHighScores.sort((a: number, b: number) => b - a);

  if (currentHighScores.length > 5) {
    currentHighScores.pop();
  }

  setStoreItem('highScores', currentHighScores);
  displayHighScore();
}

export function displayHighScore() {
  const highScores = (getStoreItem('highScores') as number[]) ?? [];

  const scoreList = document.getElementById('highscore-list');

  while (scoreList?.firstChild) {
    scoreList.removeChild(scoreList.firstChild);
  }

  highScores.forEach((score) => {
    const newScore = document.createElement('li');
    newScore.classList.add('highscore-item');
    newScore.textContent = `${score}`;
    scoreList?.appendChild(newScore);
  });
}
