import * as TWEEN from '@tweenjs/tween.js';
import { getCanvas, Sprite, SpriteClass } from 'kontra';
import { DEBUG_ON } from './globals';
import { playPaddleSound } from './sounds';
import { Collidable } from './collision';
import { isLeftPressed, isRightPressed } from './input';

export class Paddle extends SpriteClass implements Collidable {
  type = 'paddle';
  hitbox_padding = -1;
  width= 80;
  height= 15;
  color= '#B993EA';

  constructor() {
    const canvas = getCanvas();
    super();
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - 50 - this.height / 2;
    this.position.clamp(0, 0, canvas.width - this.width, canvas.height);
  }

  move(ball?: Sprite) {
    if (DEBUG_ON.value && !!ball && ball.attached === null) {
      this.x = ball.x - (this.width / 2 - ball.radius / 2);
    }
    this.update();
  }

  update() {
    if (isLeftPressed() && !isRightPressed()) {
      this.dx = -5;
    } else if (isRightPressed() && !isLeftPressed()) {
      this.dx = 5;
    } else {
      this.dx = 0;
    }

    this.advance();
  }

  onHit = () => {
    playPaddleSound();
    const coords = { y: this.y };
    // Chain up to the end of down
    const up = new TWEEN.Tween(coords)
      .to({ y: '-15' }, 50)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(() => {
        this.y = coords.y;
        this.render();
      });
    new TWEEN.Tween(coords)
      .to({ y: '+15' }, 50)
      .easing(TWEEN.Easing.Quadratic.In)
      .onUpdate(() => {
        this.y = coords.y;
        this.render();
      })
      .chain(up)
      .start();
  };
}
