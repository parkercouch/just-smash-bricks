/* eslint-disable */
import * as TWEEN from '@tweenjs/tween.js';
import { GameObject, PoolClass, SpriteClass, Vector } from 'kontra';
import { playChirpSound } from './sounds';
import { Collidable, HitBox, updateHitbox } from './collision';

const BRICK_HEIGHT = 15;
const BRICK_WIDTH = 50;

export class Brick extends SpriteClass implements Collidable {
  hitbox: HitBox;
  hits: number;
  spawnLocation: {
    x: number;
    y: number;
  };

  constructor(hits = 1) {
    super({
      type: 'brick',
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      width: BRICK_WIDTH,
      height: BRICK_HEIGHT,
      color: 'black',
    });
    this.hitbox = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
    this.hits = hits;
    this.spawnLocation = {
      x: 0,
      y: 0,
    };
  }

  init = (properties: any) => {
    const { startX, startY, hits } = properties;
    this.hits = hits;
    this.x = startX + BRICK_WIDTH / 2;
    this.y = startY + BRICK_HEIGHT / 2;
    this.spawnLocation = {
      x: this.x,
      y: this.y,
    };
    this.hitbox = updateHitbox(this, 2);
  };

  update(dt?: number) {
    this.advance(dt);

    switch (true) {
      case this.hits > 5:
        this.color = 'black';
        break;
      case this.hits > 4:
        this.color = '#718FEA';
        break;
      case this.hits > 3:
        this.color = '#9EEA70';
        break;
      case this.hits > 2:
        this.color = '#EDED86';
        break;
      case this.hits > 1:
        this.color = '#E0986B';
        break;
      default:
        this.color = '#E77474';
        break;
    }

    this.hitbox = updateHitbox(this, 2);
  }

  onHit = (collidedWith: GameObject, at: Vector) => {
    playChirpSound();
    const xOffset = 10 * Math.random() + 10;
    const yOffset = 10 * Math.random() + 10;
    const xDirection = collidedWith.dx >= 0 ? 1 : -1;
    const yDirection = collidedWith.dy >= 0 ? 1 : -1;
    const startX = this.spawnLocation.x;
    const startY = this.spawnLocation.y;
    // Movement based on hits left
    const endx = startX + xDirection * xOffset * (1 / this.hits);
    const endy = startY + yDirection * yOffset * (1 / this.hits);

    const coords = {
      x: startX,
      y: startY,
    };

    new TWEEN.Tween(coords)
      .to(
        {
          x: endx,
          y: endy,
        },
        50,
      )
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        this.x = coords.x;
        this.y = coords.y;
        this.render();
      })
      .chain(
        // back to start location
        new TWEEN.Tween(coords)
          .to(
            {
              x: startX,
              y: startY,
            },
            100,
          )
          .easing(TWEEN.Easing.Quadratic.In)
          .onUpdate(() => {
            this.x = coords.x;
            this.y = coords.y;
            this.render();
          }),
      )
      .start();
  };

  onSpawn = (delay: number) => {
    const coords = { y: this.y };
    new TWEEN.Tween(coords)
      .to({ y: '+500' }, 750)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate(() => {
        this.y = coords.y;
        this.spawnLocation.y = coords.y;
        this.render();
      })
      .delay(delay)
      .start();
  };
}

export class BrickPool extends PoolClass {
  constructor() {
    super({
      create: () => new Brick(),
      maxSize: 100,
    });
  }

  forEach(fn: (brick: Brick, i: number, array: Brick[]) => void) {
    (this.getAliveObjects() as Brick[]).forEach(fn);
  }
}
