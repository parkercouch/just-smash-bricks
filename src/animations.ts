/* eslint-disable */
import * as TWEEN from '@tweenjs/tween.js';
import { playChirpSound } from './sounds';
import { Sprite } from 'kontra';

// Brick onHit animation/sound
// brickBounce :: Sprite -> ()
export function brickBounce(hitLocation: Sprite) {
  playChirpSound();
  const thisObject = this;
  const xOffset = 10 * Math.random() + 10;
  const yOffset = 10 * Math.random() + 10;
  const xDirection = hitLocation.dx >= 0 ? 1 : -1;
  const yDirection = hitLocation.dy >= 0 ? 1 : -1;
  const startX = this.originalX;
  const startY = this.originalY;
  // Movement based on hits left
  const endx = startX + xDirection * xOffset * (1 / this.hits);
  const endy = startY + yDirection * yOffset * (1 / this.hits);

  const coords = {
    x: startX,
    y: startY,
  };
  const back = new TWEEN.Tween(coords)
    .to(
      {
        x: startX,
        y: startY,
      },
      100,
    )
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate(function() {
      thisObject.x = coords.x;
      thisObject.y = coords.y;
      thisObject.render();
    });

  new TWEEN.Tween(coords)
    .to(
      {
        x: endx,
        y: endy,
      },
      50,
    )
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function() {
      thisObject.x = coords.x;
      thisObject.y = coords.y;
      thisObject.render();
    })
    .chain(back)
    .start();
}

// Fall from sky animation
// dropDown :: Int -> ()
export function dropDown(delay: number) {
  const thisObject = this;
  const coords = { y: this.y };
  new TWEEN.Tween(coords)
    .to({ y: '+500' }, 750)
    .easing(TWEEN.Easing.Elastic.InOut)
    .onUpdate(function() {
      thisObject.y = coords.y;
      thisObject.originalY = coords.y;
      thisObject.render();
    })
    .delay(delay)
    .start();
}
