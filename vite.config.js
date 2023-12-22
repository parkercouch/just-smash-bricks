import { defineConfig } from 'vite';
import kontraPlugin from 'rollup-plugin-kontra';

export default defineConfig({
  base: '/just-smash-bricks/',
  build: {
    minify: true,
  },
  plugins: [
    kontraPlugin({
      gameObject: {
        velocity: true,
        acceleration: true,
        ttl: true,
      },
      vector: {
        clamp: true,
        distance: true,
        length: true,
      },
    }),
  ],
});
