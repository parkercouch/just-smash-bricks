import { Sprite } from 'kontra';

// Renders ball of this.radius in this.color
// renderBall :: () -> ()
export function renderBall(this: Sprite) {
  this.context.fillStyle = this.color;
  this.context.beginPath();
  this.context.arc(this.x, this.y, this.radius - 3, 0, 2 * Math.PI);
  this.context.fill();
}

// Transparent render for buttons
// renderButton :: () -> ()
export function renderButton(this: Sprite) {
  this.context.fillStyle = 'rgba(0,250,0,1)';
}

// Basic render for particles
// particleRender :: () -> ()
export function particleRender(this: Sprite) {
  this.context.fillStyle = this.color;
  this.context.fillRect(this.x, this.y, this.height, this.width);
}
