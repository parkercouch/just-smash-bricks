/* eslint-disable */
import { Pool, Sprite } from 'kontra';
import { OrbitingParticle } from './particle';
import { CENTER_POINT } from './globals';

export class ParticleSwarm {
  private pool: Pool;

  constructor(maxSize = 50, barycenter = CENTER_POINT) {
    this.pool = Pool({
      create: () => new OrbitingParticle({ barycenter }),
      maxSize,
    });
  }

  render() {
    this.pool.render();
  }

  update() {
    this.pool.update();
  }

  start = (amount = 10, overrides?: object) => {
    for (let i = 0; i < amount; i++) {
      this.pool.get(overrides);
      console.log('get');
    }
  };

  follow = (barycenter: Sprite) => {
    const currentSwarm = this.pool;
    this.pool = Pool({
      create: () => new OrbitingParticle({ barycenter }),
      maxSize: currentSwarm.maxSize,
    });
    currentSwarm.clear();
    this.start();
  };
}
