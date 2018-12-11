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
const CANVASHEIGHT = 600;
const CANVASWIDTH = 400;


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

/* #endregion */


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

  // QUADTREE FOR COLLISION DETECTION //
  const collidableObjects = kontra.quadtree();

  // WALLS //
  const leftWall = kontra.sprite({
    type: 'wall',
    anchor: {
      x: 1,
      y: 0,
    },
    x: 0.5,        // starting x,y position of the sprite
    y: 0,
    dx: 0,
    dy: 0,
    width: 1,
    height: kontra.canvas.height,
    top: 0,
    bottom: kontra.canvas.height,
    left: -0.5,
    right: 0,
    // color: 'red',
  });

  const rightWall = kontra.sprite({
    type: 'wall',
    anchor: {
      x: 0,
      y: 0,
    },
    x: kontra.canvas.width - 0.5,        // starting x,y position of the sprite
    y: 0,
    dx: 0,
    dy: 0,
    width: 1,
    height: kontra.canvas.height,
    top: 0,
    bottom: kontra.canvas.height,
    left: kontra.canvas.width - 0.5,
    right: kontra.canvas.width + 0.5,
    // color: 'red',
  });

  const topWall = kontra.sprite({
    type: 'wall',
    anchor: {
      x: 0,
      y: 1,
    },
    x: 0,        // starting x,y position of the sprite
    y: 0.5,
    dx: 0,
    dy: 0,
    width: kontra.canvas.width,
    height: 1,
    top: -0.5,
    bottom: 0.5,
    left: 0,
    right: kontra.canvas.width,
    // color: 'red',
  });

  // BOTTOM WALL FOR TESTING AND MAYBE POWERUP??
  const bottomWall = kontra.sprite({
    type: 'wall',
    anchor: {
      x: 0,
      y: 0,
    },
    x: 0,        // starting x,y position of the sprite
    y: kontra.canvas.height - 0.5,
    dx: 0,
    dy: 0,
    width: kontra.canvas.width,
    height: 1,
    top: kontra.canvas.height - 0.5,
    bottom: kontra.canvas.height + 0.5,
    left: 0,
    right: kontra.canvas.width,
    // color: 'red',
  });

  leftWall.render();
  rightWall.render();
  topWall.render();
  bottomWall.render();

  //MAGIC NUMBERS... UPDATE ME!
  // PADDLE //
  const paddle = kontra.sprite({
    type: 'paddle',
    anchor: {
      x: 0,
      y: 0,
    },
    x: 200,
    y: 550,
    dx: 0,
    dy: 0,
    width: PADDLEWIDTH,
    height: PADDLEHEIGHT, 
    top: 550,
    bottom: 550 + PADDLEHEIGHT,
    left: 200,
    right: 200 + PADDLEWIDTH,
    color: 'green',
    // image: kontra.assets.images.paddle,
    update: paddleUpdate,
    move: movePaddle,
  });

  const ball = kontra.sprite({
    type: 'ball',
    combo: 0,
    attached: paddle, // keep track if it is stuck to something
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    // Testing start ball location
    x: paddle.x + paddle.width / 2,
    y: paddle.y - 8,
    dx: 0,
    dy: 0,
    radius: 8,
    color: 'blue',
    // image: kontra.assets.images.ball,
    update: movingBall,
    render: renderBall,
  });

  // Pool to pull bricks from
  const brickPool = kontra.pool({
    // create a new sprite every time the pool needs new objects
    create: kontra.sprite,  
    maxSize: 100,
    fill: true,
  });
  
  // MAGIC NUMBERS FOR TESTING BRICK LAYOUT
  // MAKE FORMULA LATER
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 6; j++) {
      let startX = 30 + (j * 5) + (j - 1) * 50;
      let startY = 30 + (i * 5) + (i - 1) * 15;
      brickPool.get({
        type: 'brick',
        hits: 2,
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
        color: 'black',
        fix: true,
        update: function () {
          if (this.hits <= 1) {
            this.color = 'red';
          }
        },
      });
      brickPool.update();
      brickPool.render();
    }
  }

  let loop = kontra.gameLoop({  // create the main game loop
    fps: FPS,
    // clearCanvas: false,  // not clearing helps with debug
    // UPDATE GAME STATE //
    update: function (dt) {

      // Update paddle and bricks then add to quadtree
      brickPool.update();
      paddle.update();
      collidableObjects.clear();
      collidableObjects.add(brickPool.getAliveObjects());
      collidableObjects.add(leftWall, topWall, rightWall, bottomWall);
      collidableObjects.add(paddle);

      // Ready to check for collision!
      ball.update(dt, collidableObjects);
    },
    // RENDER GAME STATE //
    render: function () {
      paddle.render();
      ball.render();
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

// Create high level state machine (Play/Pause/Menu...)
const gameStates = new StateMachine({
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

function loadAssets() {
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
function displayMenu() {
  console.log('In Menu');
  
  // Skip straight to game 
  setTimeout(() => {gameStates.start();}, 1000);

};


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


// ------------------------------------------------------- //
// -------------------UPDATE FUNCTIONS-------------------- //
// ------------------------------------------------------- //
/* #region */

// Movement for paddle
// paddleUpdate :: () -> Void
function paddleUpdate() {

  this.top = this.y;
  this.bottom = this.y + this.height;
  this.left = this.x;
  this.right = this.x + this.width;

  // Keep paddle contained in canvas
  if (this.x < (kontra.canvas.width - this.width)
    && this.x > 0) {
    this.move(true, true);
  } else if (this.x >= (kontra.canvas.width - this.width)) {
    this.move(true, false);
  } else if (this.x <= 0) {
    this.move(false, true);
  }
}

// Move paddle!
// movePaddle :: Bool -> Bool -> Void
function movePaddle(canMoveLeft, canMoveRight) {
  this.advance();
  switch (true) {
    case (kontra.keys.pressed('left') && canMoveLeft):
      this.dx = -5;
      break;
    case (kontra.keys.pressed('right') && canMoveRight):
      this.dx = 5;
      break;
    default:
      this.dx = 0;
  }
}


// Update logic for ball objects
// movingBall :: Num -> Void
function movingBall(dt, collidableObjects) {

  // If attached to something then wait for keypress
  if (this.attached) {
    this.x = this.attached.x + this.attached.width / 2;
    this.y = this.attached.y - this.radius;

    // Always launches the same way.
    // WILL NEED TO UPDATE TO WORK WITH DIFFERENT OBJECTS BESIDES PADDLE
    if (kontra.keys.pressed('space')) {
      this.attached = null;
      this.dx = 5;
      this.dy = -5;
    }
    this.advance();
    return;
  }  



  // Calculate future position of ball
  const p2 = move(this, dt);

  let closestMagnitude = Infinity;
  let closest = null;

  // Check all objects in current node of quadtree
  collidableObjects.get(this).forEach((item) => {
    // Check for point of collision
    const point = ballIntercept(this, item, p2.nx, p2.ny);
    // If it exists then check magnitudes
    if (point) {
      const currentMagnitude = magnitude(point.x - this.x, point.y - this.y);
      if (currentMagnitude < closestMagnitude) {
        closestMagnitude = currentMagnitude;
        closest = { item: item, point: point };
      }
    }
  });

  // ----- A collision happend so deal with it ------- //
  if (closest) {
    this.x = closest.point.x;
    this.y = closest.point.y;

    switch (closest.item.type) {
      case 'paddle':
        // IF THE PADDLE IS HIT //
        // Reset combo when paddle is hit
        this.combo = 0;

        switch (closest.point.d) {
          case 'left':
          case 'right':
            this.dy = p2.dy;
            this.dx = -p2.dx;
            break;

          // MAGIC NUMBERS
          // Edges of paddle bounce ball back instead of reflecting exact angles
          case 'top':
          case 'bottom':
            if (closest.point.x > (closest.item.x + closest.item.width / 4 * 3)) {
              this.dx = Math.abs(p2.dx);
              this.dy = -p2.dy;
            } else if (closest.point.x >= (closest.item.x + closest.item.width / 4)) {
              this.dx = p2.dx;
              this.dy = -p2.dy;
            } else {
              this.dx = -1 * Math.abs(p2.dx);
              this.dy = -p2.dy;
            }
            break;
        }
        break;

      case 'brick':
        // IF A BRICK IS HIT //
        // Reduce its hitcount and add to combo
        closest.item.hits -= 1;
        this.combo += 1;

        // If the brick has no hits left then destroy it
        if (closest.item.hits <= 0) {
          closest.item.ttl = 0;
        }

      // FALLTHROUGH! Both brick and wall update dx/dy the same way
      case 'wall':
        // IF A WALL IS HIT //
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
        break;
    }
    // ----------------------------------------- //


    // How much time did it take to get to first collision?
    var udt = dt * (closestMagnitude / magnitude(p2.nx, p2.ny));
    // Run collision recursively if there is time left
    return this.update(dt - udt, collidableObjects);
  }

  // Update ball position after all collisions have been resolved
  this.x = p2.x;
  this.y = p2.y;
  this.dx = p2.dx;
  this.dy = p2.dy;
}


// PROBABLY ISN'T NEEDED
// Ball logic for starting from stop
// staticBall :: Object -> Void
function staticBall(attachedTo) {

}

/* #endregion */

// ------------------------------------------------------- //
// -------------------RENDER FUNCTIONS-------------------- //
// ------------------------------------------------------- //
/* #region */

// Renders ball of this.radius in this.color
// renderBall :: () -> Void
function renderBall() {
  this.context.fillStyle = this.color;
  this.context.beginPath();
  this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
  this.context.fill();
}


/* #endregion */



