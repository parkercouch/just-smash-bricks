import * as TWEEN from '@tweenjs/tween.js';
import { PoolClass, SpriteClass, emit, on } from 'kontra';
import { playChirpSound } from './sounds';
import { Collidable, Collision } from './collision';

const BRICK_HEIGHT = 15;
const BRICK_WIDTH = 50;

export class Brick extends SpriteClass implements Collidable {
  type = 'brick';
  hitbox_padding = -1;
  hits: number;
  spawnLocation: {
    x: number;
    y: number;
  };

  constructor(hits = 1) {
    super({
      width: BRICK_WIDTH,
      height: BRICK_HEIGHT,
      color: 'black',
    });
    this.hits = hits;
    this.spawnLocation = {
      x: 0,
      y: 0,
    };
  }

  init = (properties?: unknown) => {
    const { startX, startY, hits } = properties as {
      startX: number;
      startY: number;
      hits: number;
    };

    this.hits = hits;
    this.x = startX;
    this.y = startY;
    this.spawnLocation = {
      x: this.x,
      y: this.y,
    };
    on('brick:hit', this.onHitAnimation);
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
  }

  onHitAnimation = (collision: Collision) => {
    const { collidedWith } = collision;
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

  onHit(collision: Collision) {
    this.hits -= 1;
    if (this.hits <= 0) {
      this.ttl = 0;
    }
    emit('brick:hit', collision);
  }

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

  getAll(): Brick[] {
    return this.getAliveObjects() as Brick[];
  }
}
