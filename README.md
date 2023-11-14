# Just Smash Bricks!

[Live Link](https://parkercouch.github.io/just-smash-bricks/)

### What is this?
This is a breakout/arkanoid type game. I originally had one week to make the game 
(the 'school' branch has the code at that point). This was a fun
challenge and I also was inspired but things like js13kgames when considering how
I wanted to make the game. I didn't actually check to see the exact size of the
files (and with some of the libraries included it is definitely above 13kb), 
but I made all the music and graphics in javascript instead of loading in
assets. There are many things I wanted to add that I didn't have time for, but I
am happy with how it turned out.

### To Run Locally
`pnpm i` - install packages\
`pnpm dev` - start build watcher and dev server

### TODO:
* Improve browser compatibility
* Create more levels
* Add more types of bricks


#### Libraries Used:
* [Kontra.js](https://github.com/straker/kontra) - Game loop, sprite management, localStorage, Object pools (particles)
* [TinyMusic](https://github.com/kevincennis/TinyMusic) - All game sounds and music
* [tween.js](https://github.com/tweenjs/tween.js) - Animation tweening 
* [javascript-state-machine](https://github.com/jakesgordon/javascript-state-machine) - High level game states
* [screenfull.js](https://github.com/sindresorhus/screenfull.js/) - For full screen support
