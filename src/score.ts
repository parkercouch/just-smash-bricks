/* eslint-disable */

import { getStoreItem, setStoreItem } from "kontra";

export function updateHighScores(score: number) {
  const currentHighScores: number[] = getStoreItem('highScores') ?? [];

  currentHighScores.push(score);
  currentHighScores.sort((a: number, b: number) => b - a);

  if (currentHighScores.length > 5) {
    currentHighScores.pop();
  }

  setStoreItem('highScores', currentHighScores);
}

export function displayHighScore() {
  const highScores: number[] = getStoreItem('highScores') ?? [];

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
