/* eslint-disable */
/// THIS DOESNT LOOK BETTER/// KEEPING BUT GOING BACK///

// GAME OBJECT
const GAME = {
  // GAME ASSETS //
  imgAssets: [
    'ball.png',
    'brick.png',
    'paddle.png',
  ],
  sfxAssets: [
    'hit.ogg',
  ],

  // GAME STATES //
  state: new StateMachine({
    init: 'pageLoad',
    transitions: [
      { name: 'startLoading',     from: 'pageLoad',  to: 'loading' },
      { name: 'finishLoading', from: 'loading', to: 'menu' },
      { name: 'start', from: 'menu', to: 'game' },
      { name: 'pause', from: 'game', to: 'paused' },
      { name: 'unpause', from: 'paused', to: 'game' },
      { name: 'quit', from: '*', to: 'menu' },
    ],
    methods: {
      onLoading: function () {
        kontra.assets.imagePath = './assets/img';
        kontra.assets.audioPath = './assets/sfx';
        kontra.assets.load(...GAME.imgAssets, ...GAME.sfxAssets)
          .then(() => {
            // all assets have loaded
            console.log('All assets loaded');
            console.log(kontra.assets);
            this.finishLoading();
          }).catch((err) => {
            // error loading an asset
            console.log(err);
          });
      }, 
      onMenu: function () {
        console.log('In Menu');

        // Skip straight to game 
        setTimeout(() => { this.start(); }, 1000);

      },
      onGame: function () {
        GAME.prepareGame();
      },
    }
  }),
  
  // GAME METHODS //
  // Start Game!
  run: function (canvas) {
    kontra.init(canvas);
    this.state.startLoading();
  },

  prepareGame: function () {

    // PADDLE //
    GAME.paddle = kontra.sprite({
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      x: 200,        // starting x,y position of the sprite
      y: 550,
      dx: 0,
      image: kontra.assets.images.paddle,
      move: function (canMoveLeft, canMoveRight) {
        GAME.paddle.advance();
        switch (true) {
          case (kontra.keys.pressed('left') && canMoveLeft):
            GAME.paddle.dx = -5;
            break;
          case (kontra.keys.pressed('right') && canMoveRight):
            GAME.paddle.dx = 5;
            break;
          default:
            GAME.paddle.dx = 0;
        }
      },
    });


    // BALL //
    GAME.ball = kontra.sprite({
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      x: 200,        // starting x,y position of the sprite
      y: 300,
      dx: 2,
      dy: 2,
      image: kontra.assets.images.ball,
      update: function () {
        GAME.ball.advance();
      },
    });


    GAME.mainLoop.start();    // start the game
  },

  // MAIN GAME LOOP LOGIC
  mainLoop: kontra.gameLoop({  // create the main game loop
    update: function () {        // update the game state

      // Keep paddle contained in canvas
      // POSSIBLE REFACTOR AND PUT INTO PADDLE OBJECT
      if (GAME.paddle.x < (kontra.canvas.width - GAME.paddle.width / 2)
        && GAME.paddle.x > (0 + GAME.paddle.width / 2)) {
        GAME.paddle.move(true, true);
      } else if (GAME.paddle.x >= (kontra.canvas.width - GAME.paddle.width / 2)) {
        GAME.paddle.move(true, false);
      } else if (GAME.paddle.x <= (0 + GAME.paddle.width)) {
        GAME.paddle.move(false, true);
      }

      GAME.ball.update();

    },
    render: function () {        // render the game state
      GAME.paddle.render();
      GAME.ball.render();
    }
  }),


  // PUB/SUB EVENTS //
};



// DOM START
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM LOADED');
  // Make sure canvas is the right size
  const canvasElement = document.getElementById('game');
  resizeCanvasToDisplaySize(canvasElement);
  // START GAME
  GAME.run(canvasElement);
})


// ------------------------------------------------------- //
// ------------------------HELPERS------------------------ //
// ------------------------------------------------------- //
/* #region */


// Keeps canvas size 1x1 pixels so it draws correctly
// resizeCanvasToDisplaySize :: Element -> Void
function resizeCanvasToDisplaySize(canvas) {
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // If it's resolution does not match change it
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }

  return false;
}


/* #endregion */

