/* eslint-disable */

// Make initial empty highScore array if none exists
// initializeHighScores :: () -> ()
export function initializeHighScores() {
  if (localStorage.getItem('highScores') === null) {
    setHighScores([]);
  } else {
    displayHighScore(getHighScores());
  }
}

export function getHighScores(): number[] {
  try {
    return JSON.parse(localStorage.getItem('highScores') ?? '[]');
  } catch (e) {
    return [];
  }
}

export function setHighScores(scores: number[]) {
  localStorage.setItem('highScores', JSON.stringify(scores));
}

// Add current score if in the top 3
// updateHighScore :: Int -> ()
export function updateHighScores(score: number) {
  // Add current score, sort, then remove lowest (to keep only 3)
  const currentHighScores = getHighScores();
  currentHighScores.push(score);
  currentHighScores.sort((a: number, b: number) => b - a);

  // If more than 5 then remove lowest one
  if (currentHighScores.length > 5) {
    currentHighScores.pop();
  }

  displayHighScore(currentHighScores);

  setHighScores(currentHighScores);
}

// Show high scores for the user
// displayHighScore :: [Int] -> ()
export function displayHighScore(highScores: number[]) {
  // Select high score element
  const scoreList = document.getElementById('highscore-list');

  // Remove all child nodes (there will only be 3 so not worth only updating)
  // Maybe change this if a large list of high scores is kept
  while (scoreList?.firstChild) {
    scoreList.removeChild(scoreList.firstChild);
  }
  // Add the scores
  highScores.forEach((score) => {
    const newScore = document.createElement('li');
    newScore.classList.add('highscore-item');
    newScore.textContent = `${score}`;
    scoreList?.appendChild(newScore);
  });
}
