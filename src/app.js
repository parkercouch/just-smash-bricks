/* eslint-disable */

// ------------------------------------------------------- //
// ------------------------GLOBALS------------------------ //
// ------------------------------------------------------- //
/* #region */
const GAME = {};


/* #endregion */

// ------------------------------------------------------- //
// ----------------------DOM LOADED----------------------- //
// ------------------------------------------------------- //
/* #region */

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM LOADED');
  const canvasElement = document.getElementById('game');
  resizeCanvasToDisplaySize(canvasElement);
  kontra.init(canvasElement);
  console.log(gameStates.state); //pageLoad
  console.log(gameStates);
  gameStates.startLoading();
  console.log(gameStates.state); //loading
});

/* endregion */


// ------------------------------------------------------- //
// ------------------------ASSETS------------------------- //
// ------------------------------------------------------- //
/* #region */


// Set kontra assets paths and assets to load at start
kontra.assets.imagePath = './assets/img';
kontra.assets.audioPath = './assets/sfx';
const imgAssets = [
  'ball.png',
  'brick.png',
  'paddle.png',
];
const sfxAssets = [
  'hit.ogg',
];

/* #endregion */

// ------------------------------------------------------- //
// ---------------------KONTRA LOOP----------------------- //
// ------------------------------------------------------- //
/* #region */

// EXAMPLE BOILERPLATE
const startGameLoop = function () {

  // PADDLE //
  const paddle = kontra.sprite({
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    x: 200,        // starting x,y position of the sprite
    y: 550,
    dx: 0,
    image: kontra.assets.images.paddle,
    move: function (canMoveLeft, canMoveRight) { 
      paddle.advance();
      switch (true) {
        case (kontra.keys.pressed('left') && canMoveLeft):
          paddle.dx = -5;
          break;
        case (kontra.keys.pressed('right') && canMoveRight):
          paddle.dx = 5;
          break;
        default:
          paddle.dx = 0;
      }
    },
  });

  const ball = kontra.sprite({
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    x: 20,        // starting x,y position of the sprite
    y: 300,
    dx: 2,
    dy: 2,
    image: kontra.assets.images.ball,
    update: function () { 
      ball.advance();
      // Collides with Paddle
      if (this.collidesWith(paddle)) {
        this.dy *= -1;
      }
      if (outOfBounds(this.x, this.y)) {
        // reflect back
        // Bouncing off bottom for debugging 
        if ( this.y < 1 || this.y > kontra.canvas.height) {
          this.dy *= -1;
        } else {
          this.dx *= -1;
        }
      }
    },
  });


  let loop = kontra.gameLoop({  // create the main game loop
    update: function () {        // update the game state

      // Keep paddle contained in canvas
      // POSSIBLE REFACTOR AND PUT INTO PADDLE OBJECT
      if (paddle.x < (kontra.canvas.width - paddle.width / 2) 
       && paddle.x > (0 + paddle.width / 2)) {
        paddle.move(true, true);
      } else if (paddle.x >= (kontra.canvas.width - paddle.width / 2)) {
        paddle.move(true, false);
      } else if (paddle.x <= (0 + paddle.width)) {
        paddle.move(false, true);
      }

      ball.update();

    },
    render: function () {        // render the game state
      paddle.render();
      ball.render();
    }
  });

  loop.start();    // start the game
};
/* #endregion */


// ------------------------------------------------------- //
// -------------------STATE MANAGEMENT-------------------- //
// ------------------------------------------------------- //
/* #region */

const loadAssets = function () {
  kontra.assets.load(...imgAssets, ...sfxAssets)
    .then(() => {
      // all assets have loaded
      console.log('All assets loaded');
      console.log(kontra.assets);
      gameStates.finishLoading();
    }).catch((err) => {
      // error loading an asset
      console.log(err);
    });
};

// SKIPS TO GAME. WILL MAKE MENU LATER
const displayMenu = function () {
  console.log('In Menu');
  
  // Skip straight to game 
  setTimeout(() => {gameStates.start();}, 1000);

};

var gameStates = new StateMachine({
  init: 'pageLoad',
  transitions: [
    { name: 'startLoading',     from: 'pageLoad',  to: 'loading' },
    { name: 'finishLoading',     from: 'loading',  to: 'menu' },
    { name: 'start',     from: 'menu',  to: 'game' },
    { name: 'pause',   from: 'game', to: 'paused'  },
    { name: 'unpause',   from: 'paused', to: 'game'  },
    { name: 'quit', from: '*', to: 'menu'    },
  ],
  methods: {
    onLoading: loadAssets,
    onMenu: displayMenu,
    onGame: startGameLoop,
  }
});

/* #endregion */


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

// Checks if out of bounds. Uses global Kontra
// outOfBounds :: Num, Num -> Bool
function outOfBounds (x, y) {
  if (x <= 0 || x >= kontra.canvas.width
    || y <= 0 || y >= kontra.canvas.height) {
      return true;
    }
  return false;
}


/* #endregion */

