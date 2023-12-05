import { Sprite } from 'kontra';

// Transparent render for buttons
// renderButton :: () -> ()
export function renderButton(this: Sprite) {
  this.context.fillStyle = 'rgba(0,250,0,1)';
}

// Basic render for particles
// particleRender :: () -> ()
export function particleRender(this: Sprite) {
  this.context.fillStyle = this.color;
  this.context.fillRect(0, 0, this.height, this.width);
}
