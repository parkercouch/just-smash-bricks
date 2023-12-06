/* eslint-disable */
import * as TWEEN from '@tweenjs/tween.js';
import { on, Sprite, SpriteClass } from 'kontra';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEBUG_ON,
  PADDLE_COLOR,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
} from './globals';
import { playPaddleSound } from './sounds';

export class Paddle extends SpriteClass {
  constructor() {
    super({
      type: 'paddle',
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      // Place paddle in midde and above the bottom display
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      dx: 0,
      dy: 0,
      moving: false,
      ttl: Infinity,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      top: CANVAS_HEIGHT - 50 - PADDLE_HEIGHT / 2 + 1,
      bottom: CANVAS_HEIGHT - 50 + PADDLE_HEIGHT / 2 - 1,
      left: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      right: CANVAS_WIDTH / 2 + PADDLE_WIDTH / 2,
      color: PADDLE_COLOR,
    });

    this.position.clamp(
      0 + this.width / 2,
      0,
      CANVAS_WIDTH - this.width / 2,
      CANVAS_HEIGHT,
    );

    on('input_left:on', this.startMoveLeft);
    on('input_right:on', this.startMoveRight);
    on('input_left:off', this.stopMovement);
    on('input_right:off', this.stopMovement);
  }

  move(ball?: Sprite) {
    if (DEBUG_ON.value && !!ball && ball.attached === null) {
      this.follow(ball);
      return;
    } 

    this.update();
  }
  
  update() {
    this.top = this.y - this.height / 2 - 1;
    this.bottom = this.y + this.height / 2 + 1;
    this.left = this.x - this.width / 2 + 1;
    this.right = this.x + this.width / 2 - 1;

    this.advance();
  }

  follow(ball: Sprite) {
    this.x = ball.x;
    this.top = this.y - this.height / 2 - 1;
    this.bottom = this.y + this.height / 2 + 1;
    this.left = this.x - this.width / 2 + 1;
    this.right = this.x + this.width / 2 - 1;
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

  public onHit() {
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
  }
}
