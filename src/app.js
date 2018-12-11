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
    dx: 5,
    dy: 5,
    radius: 16,
    image: kontra.assets.images.ball,
    update: function (dt) { 
  ////---- BALL LOGIC ---///
      // ball.advance();
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

      // testing collision algorithm
      const p2 = move(ball);
      console.log(ball);
      console.log(p2);

      let mCurrent;
      let mClosest = Infinity;
      let point;
      let item;
      let closest = null;

      // for (let n = 0; n < this.hitTargets.length; n++) {
      //   item = this.hitTargets[n];
      item = brick;
      console.log(brick);
      // if (!item.hit) {
      point = ballIntercept(ball, item, p2.nx, p2.ny);
      console.log(point);
      if (point) {
        mCurrent = magnitude(point.x - this.x, point.y - this.y);
        if (mCurrent < mClosest) {
          mClosest = mCurrent;
          closest = { item: item, point: point };
        }
      }
      // }
      // }

      if (closest) {

        // if ((closest.item == this.game.paddle) && (closest.point.d == 'top')) {
        //   p2.dx = this.speed * (closest.point.x - (this.game.paddle.left + this.game.paddle.w / 2)) / (this.game.paddle.w / 2);
        //   this.game.playSound('paddle');
        // }

        this.x = closest.point.x;
        this.y = closest.point.y;

        switch (closest.point.d) {
          case 'left':
          case 'right':
            this.dy = p2.dy;
            this.dx = -p2.dx;
            break;

          case 'top':
          case 'bottom':
            this.dy = -p2.dy;
            this.dx = p2.dx;
            break;
        }

        var udt = dt * (mClosest / magnitude(p2.nx, p2.ny)); // how far along did we get before intercept ?
        return this.update(dt - udt);                                  // so we can update for time remaining
      }

      // if ((p2.x < 0) || (p2.y < 0) || (p2.x > this.game.width) || (p2.y > this.game.height)) {
      //   this.game.loseBall();
      // }
      // else {
      // this.setpos(p2.x, p2.y);
      // this.setdir(p2.dx, p2.dy);
      // }

      // this.x = p2.x;
      // this.y = p2.y;
      // this.dx = p2.dx;
      // this.dy = p2.dy;
      ball.advance();

  /// ---- END BALL LOGIC ---- ///
    },
  });

  const brick = kontra.sprite({
    x: 200,        // starting x,y position of the sprite
    y: 100,
    dx: 0,
    dy: 0,
    image: kontra.assets.images.brick,
    update: function () {
    },
  });
  brick.top = brick.y;
  brick.bottom = brick.y + brick.height;
  brick.left = brick.x;
  brick.right = brick.x + brick.width;

  let loop = kontra.gameLoop({  // create the main game loop
    update: function (dt) {        // update the game state

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

      ball.update(dt);

    },
    render: function () {        // render the game state
      paddle.render();
      ball.render();
      brick.render();
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

function intercept (x1, y1, x2, y2, x3, y3, x4, y4, d) {
  var denom = ((y4-y3) * (x2-x1)) - ((x4-x3) * (y2-y1));
  if (denom != 0) {
    var ua = (((x4-x3) * (y1-y3)) - ((y4-y3) * (x1-x3))) / denom;
    if ((ua >= 0) && (ua <= 1)) {
      var ub = (((x2-x1) * (y1-y3)) - ((y2-y1) * (x1-x3))) / denom;
      if ((ub >= 0) && (ub <= 1)) {
        var x = x1 + (ua * (x2-x1));
        var y = y1 + (ua * (y2-y1));
        return { x: x, y: y, d: d};
      }
    }
  }
  return null;
}

// USED TO OVERRIDE collidesWith function for kontra.sprites
function ballIntercept (ball, rect, nx, ny) {
  let pt;
  if (nx < 0) {
    pt = intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, 
                             rect.right  + ball.radius, 
                             rect.top    - ball.radius, 
                             rect.right  + ball.radius, 
                             rect.bottom + ball.radius, 
                             "right");
  }
  else if (nx > 0) {
    pt = intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, 
                             rect.left   - ball.radius, 
                             rect.top    - ball.radius, 
                             rect.left   - ball.radius, 
                             rect.bottom + ball.radius,
                             "left");
  }
  if (!pt) {
    if (ny < 0) {
      pt = intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, 
                               rect.left   - ball.radius, 
                               rect.bottom + ball.radius, 
                               rect.right  + ball.radius, 
                               rect.bottom + ball.radius,
                               "bottom");
    }
    else if (ny > 0) {
      pt = intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, 
                               rect.left   - ball.radius, 
                               rect.top    - ball.radius, 
                               rect.right  + ball.radius, 
                               rect.top    - ball.radius,
                               "top");
    }
  }
  return pt;
}

// magnitute
function magnitude (x, y) {
  return Math.sqrt(x * x + y * y);
}

/* #endregion */

// collision detection algorithm that I need to fix for my engine
function ballLogic () {

// if (!this.moving)
//   return this.moveToPaddle();

const p2 = move(this, dt);

let mCurrent;
let mClosest = Infinity;
let point;
let item;
let closest = null;

// for (let n = 0; n < this.hitTargets.length; n++) {
//   item = this.hitTargets[n];
  item = brick;
  // if (!item.hit) {
    point = ballIntercept(this, item, p2.nx, p2.ny);
    if (point) {
      mCurrent = magnitude(point.x - this.x, point.y - this.y);
      if (mCurrent < mClosest) {
        mClosest = mCurrent;
        closest = { item: item, point: point };
      }
    }
  // }
// }

if (closest) {

  // if ((closest.item == this.game.paddle) && (closest.point.d == 'top')) {
  //   p2.dx = this.speed * (closest.point.x - (this.game.paddle.left + this.game.paddle.w / 2)) / (this.game.paddle.w / 2);
  //   this.game.playSound('paddle');
  // }

  this.x = closest.point.x;
  this.y = closest.point.y;

  switch (closest.point.d) {
    case 'left':
    case 'right':
      this.dy = p2.dy;
      this.dx = -p2.dx;
      break;

    case 'top':
    case 'bottom':
      this.dy = -p2.dy;
      this.dx = p2.dx;
      break;
  }

  var udt = dt * (mClosest / magnitude(p2.nx, p2.ny)); // how far along did we get before intercept ?
  return this.update(dt - udt);                                  // so we can update for time remaining
}

// if ((p2.x < 0) || (p2.y < 0) || (p2.x > this.game.width) || (p2.y > this.game.height)) {
//   this.game.loseBall();
// }
// else {
  // this.setpos(p2.x, p2.y);
  // this.setdir(p2.dx, p2.dy);
// }

this.x = p2.x;
this.y = p2.y;
this.dx = p2.dx;
this.dy = p2.dy;

}

function move(object) {
  // KONTRA USES FIXED GAME LOOP dt is just change in pixel/frame
  // var nx = object.dx * dt;
  // var ny = object.dy * dt;
  return { 
    x: object.x + object.dx,
    y: object.y + object.dy,
    dx: object.dx,
    dy: object.dy,
    nx: object.dx,
    ny: object.dy };
}


