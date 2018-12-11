/* eslint-disable */

// ------------------------------------------------------- //
// ------------------------GLOBALS------------------------ //
// ------------------------------------------------------- //
/* #region */
const GAME = {};
const FPS = 120;
const BRICKHEIGHT = 15;
const BRICKWIDTH = 50;
const PADDLEWIDTH = 60;
const PADDLEHEIGHT = 10;


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

// MAIN GAME LOGIC
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
    dy: 0,
    width: PADDLEWIDTH,
    height: PADDLEHEIGHT, 
    color: 'green',
    // image: kontra.assets.images.paddle,
    update: function() {
      this.top = this.y;
      this.bottom = this.y + this.height;
      this.left = this.x;
      this.right = this.x + this.width;
    },
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
    radius: 8,
    color: 'blue',
    // image: kontra.assets.images.ball,
    update: function (dt) { 
  ////---- BALL LOGIC ---///
  ///NEEDS UPDATED FOR ALL CASES AND PUT INTO FUNCTION///
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
      const p2 = move(ball, dt);
      // console.log(ball);
      // console.log(p2);

      let mCurrent;
      let mClosest = Infinity;
      let point;
      let item;
      let closest = null;

      // for (let n = 0; n < this.hitTargets.length; n++) {
      //   item = this.hitTargets[n];
      brickPool.getAliveObjects().forEach((brick) => {
        

      item = brick;
      // if (!item.hit) {
      point = ballIntercept(ball, item, p2.nx, p2.ny);
      // console.log(point);
      if (point) {
        //
        brick.ttl = 0;
        brickPool.update();


        mCurrent = magnitude(point.x - this.x, point.y - this.y);
        if (mCurrent < mClosest) {
          mClosest = mCurrent;
          closest = { item: item, point: point };
        }
      }
    });
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
        console.log(udt);
        console.log(dt);
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

  /// ---- END BALL LOGIC ---- ///
    },
    render: function() {
      this.context.fillStyle = this.color;
  
      this.context.beginPath();
      this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      this.context.fill();
    },
  });

  // Pool to pull bricks from
  const brickPool = kontra.pool({
    // create a new sprite every time the pool needs new objects
    create: kontra.sprite,  
    maxSize: 100,
    fill: true,
  });
  
  // MAGIC NUMBERS FOR TESTING
  // MAKE FORMULA LATER
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 6; j++) {
      // let x = 30 + (i * 5) + (i - 1) * 50;
      let startX = 30 + (j * 5) + (j - 1) * 50;
      let startY = 30 + (i * 5) + (i - 1) * 15;
      console.log(startX,startY);
      brickPool.get({
        x: startX,        // starting x,y position of the sprite
        y: startY,
        dx: 0,
        dy: 0,
        width: BRICKWIDTH,
        height: BRICKHEIGHT,
        top: startY, 
        bottom: startY + BRICKHEIGHT,
        left: startX,
        right: startX + BRICKWIDTH,
        color: 'red',
        fix: true,
        // ttl: Infinity,
        // update: function () {
        // },
        // render: function () {
        // },
      });
      brickPool.update();
      brickPool.render();
    }
  }
  console.log(brickPool.size);

  // const brick = kontra.sprite({
  //   x: 35,        // starting x,y position of the sprite
  //   y: 35,
  //   dx: 0,
  //   dy: 0,
  //   width: BRICKWIDTH,
  //   height: BRICKHEIGHT,
  //   top: 100,
  //   bottom: 100 + BRICKHEIGHT,
  //   left: 200,
  //   right: 200 + BRICKWIDTH,
  //   color: 'red',
  //   // image: kontra.assets.images.brick,
  //   update: function () {
  //   },
  // });

  let loop = kontra.gameLoop({  // create the main game loop
    fps: FPS,
    // clearCanvas: false,  // not clearing helps with debug
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

      paddle.update();
      ball.update(dt);
      brickPool.update();

    },
    render: function () {        // render the game state
      paddle.render();
      ball.render();
      // brick.render();
      brickPool.render();

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
  // Look up the size the canvas is being displayed
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

// Line intercept
// intercept :: (Num, Num), (Num, Num), (Num, Num), (Num, Num), String -> {Num, Num, String}
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
// ballIntercept Object -> Object -> Num -> Num -> {x,y,d}
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

// magnitute :: Num -> Num -> Num
function magnitude (x, y) {
  return Math.sqrt(x * x + y * y);
}

// Calculated position after move
// move :: {x,y,dx,dy}, dt -> {x,y,dx,dy,nx,ny}
function move(object, dt) {
  // KONTRA USES FIXED GAME LOOP dx is just change in pixel/frame
  var nx = object.dx * dt * FPS;
  var ny = object.dy * dt * FPS;
  return { 
    x: object.x + nx,
    y: object.y + ny,
    dx: object.dx,
    dy: object.dy,
    nx: nx,
    ny: ny,
  };
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

  // Deflect depending on which side is hit
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



