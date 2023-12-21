/* eslint-disable */
import * as TWEEN from '@tweenjs/tween.js';
import { getCanvas, on, Sprite, SpriteClass } from 'kontra';
import { DEBUG_ON } from './globals';
import { playPaddleSound } from './sounds';
import { Collidable, Collision } from './collision';

const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 15;
const PADDLE_COLOR = '#B993EA';

export class Paddle extends SpriteClass implements Collidable {
  type = 'paddle';
  hitbox_padding = -1;
  moving = false;

  constructor() {
    const canvas = getCanvas();
    super({
      x: canvas.width / 2 - PADDLE_WIDTH / 2,
      y: canvas.height - 50 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      color: PADDLE_COLOR,
    });

    this.position.clamp(0, 0, canvas.width - this.width, canvas.height);

    on('input_left:on', this.startMoveLeft);
    on('input_right:on', this.startMoveRight);
    on('input_left:off', this.stopMovement);
    on('input_right:off', this.stopMovement);
  }

  move(ball?: Sprite) {
    if (DEBUG_ON.value && !!ball && ball.attached === null) {
      this.x = ball.x - (this.width / 2 - ball.radius / 2);
    }
    this.update();
  }

  startMoveLeft = () => {
    this.moving = true;
    this.dx = -5;
  };

  startMoveRight = () => {
    this.moving = true;
    this.dx = 5;
  };

  stopMovement = () => {
    this.moving = false;
    this.dx = 0;
  };

  onHit = (collision: Collision) => {
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
