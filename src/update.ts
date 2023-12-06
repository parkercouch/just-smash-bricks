/* eslint-disable */

import { Sprite } from 'kontra';

// Brick color changing logic
export function colorChange(this: Sprite, dt: number) {
  this.advance(dt);

  switch (true) {
    case this.hits > 5:
      this.color = 'black';
      break;
    case this.hits > 4:
      // this.color = 'blue';
      this.color = '#718FEA';
      break;
    case this.hits > 3:
      // this.color = 'green';
      this.color = '#9EEA70';
      break;
    case this.hits > 2:
      // this.color = 'yellow';
      this.color = '#EDED86';
      break;
    case this.hits > 1:
      // this.color = 'orange';
      this.color = '#E0986B';
      break;
    default:
      // this.color = 'red';
      this.color = '#E77474';
      break;
  }

  //Update hitbox on move
  this.top = this.y - this.height / 2 - 2;
  this.bottom = this.y + this.height / 2 + 2;
  this.left = this.x - this.width / 2 - 2;
  this.right = this.x + this.width / 2 + 2;
}
