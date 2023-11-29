import { Sprite } from 'kontra';

// Paddle update that auto moves for debugging!
// debugAutoMove :: Sprite -> ()
export function debugAutoMove(this: Sprite, ball: Sprite) {
  this.x = ball.x;
  this.top = this.y - this.height / 2 - 1;
  this.bottom = this.y + this.height / 2 + 1;
  this.left = this.x - this.width / 2 + 1;
  this.right = this.x + this.width / 2 - 1;
}
