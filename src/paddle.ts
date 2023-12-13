/* eslint-disable */
import * as TWEEN from '@tweenjs/tween.js';
import { GameObject, on, Sprite, SpriteClass, Vector } from 'kontra';
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEBUG_ON } from './globals';
import { playPaddleSound } from './sounds';
import { Collidable, HitBox, updateHitbox } from './collision';

const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 15;
const PADDLE_COLOR = '#B993EA';

export class Paddle extends SpriteClass implements Collidable {
  hitbox: HitBox;
  moving: boolean;

  constructor() {
    super({
      type: 'paddle',
      // TODO: update anchor to default
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      color: PADDLE_COLOR,
    });

    this.hitbox = updateHitbox(this, -1);
    this.position.clamp(
      0 + this.width / 2,
      0,
      CANVAS_WIDTH - this.width / 2,
      CANVAS_HEIGHT,
    );
    this.moving = false;

    on('input_left:on', this.startMoveLeft);
    on('input_right:on', this.startMoveRight);
    on('input_left:off', this.stopMovement);
    on('input_right:off', this.stopMovement);
  }

  move(ball?: Sprite) {
    if (DEBUG_ON.value && !!ball && ball.attached === null) {
      this.x = ball.x;
    }

    this.update();
  }

  update() {
    this.hitbox = updateHitbox(this, -1);
    this.advance();
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

  onHit = (collidedWith: GameObject, at: Vector) => {
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
