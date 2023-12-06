/* eslint-disable */
import { Sprite, SpriteClass } from 'kontra';
import { CANVAS_HEIGHT, CANVAS_WIDTH, PARTICLE_COLOR } from './globals';

export class OrbitingParticle extends SpriteClass {
  constructor({ barycenter }: { barycenter: Sprite }) {
    super({
      type: 'particle',
      barycenter,
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      x: barycenter.x + (2 - Math.random() * 4),
      y: barycenter.y + (2 - Math.random() * 4),
      dx: 2 - Math.random() * 4,
      dy: 2 - Math.random() * 4,
      maxDx: 10,
      maxDy: 10,
      ttl: Infinity,
      color: PARTICLE_COLOR,
      width: 3,
      height: 3,
    });

    this.contain();
  }

  render() {
    this.context.fillStyle = this.color;
    this.context.fillRect(this.x, this.y, this.height, this.width);
  }

  init = (_properties: any) => {};

  follow = (barycenter: Sprite) => {
    this.barycenter = barycenter;
    this.update();
  };

  contain() {
    this.position.clamp(-50, -50, CANVAS_WIDTH + 50, CANVAS_HEIGHT + 50);
  }

  update() {
    const vectorX = this.barycenter.x - this.x;
    const vectorY = this.barycenter.y - this.y;
    const force =
      this.barycenter.mass /
      Math.pow(vectorX * vectorX + vectorY * vectorY, 1.5);
    const totalDistance = Math.sqrt(vectorX ** 2 + vectorY ** 2);

    // Ramp up acceleration when particles move far away to keep them contained
    if (totalDistance > 50) {
      this.acceleration.x = vectorX * force * 100;
      this.acceleration.y = vectorY * force * 100;
    } else {
      this.acceleration.x = vectorX * force;
      this.acceleration.y = vectorY * force;
    }

    // Keep particles from going too fast
    if (Math.abs(this.dx) > this.maxDx) {
      this.dx > 0 ? (this.dx = this.maxDx) : (this.dx = -1 * this.maxDx);
    }
    if (Math.abs(this.dy) > this.maxDy) {
      this.dy > 0 ? (this.dy = this.maxDy) : (this.dy = -1 * this.maxDy);
    }

    this.advance();
  }
}
