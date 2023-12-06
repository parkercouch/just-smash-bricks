import { Sprite } from 'kontra';

// Transparent render for buttons
// renderButton :: () -> ()
export function renderButton(this: Sprite) {
  this.context.fillStyle = 'rgba(0,250,0,1)';
}
