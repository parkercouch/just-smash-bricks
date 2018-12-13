/* eslint-disable */

// ------------------------------------------------------- //
// ------------------------GLOBALS------------------------ //
// ------------------------------------------------------- //
/* #region */
const FPS = 120;
const BRICK_HEIGHT = 15;
const BRICK_WIDTH = 50;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
let LIVES;
let SCORE;
let GAMELOOP;
const MESSAGE = document.getElementById('message');
const HUD = document.getElementById('hud');
const BOTTOM_DISPLAY = document.getElementById('bottom-display');


/* #endregion */

// ------------------------------------------------------- //
// ----------------------DOM LOADED----------------------- //
// ------------------------------------------------------- //
/* #region */

document.addEventListener('DOMContentLoaded', function () {
  const canvasElement = document.getElementById('game');
  resizeCanvasToDisplaySize(canvasElement);
  kontra.init(canvasElement);
  gameStates.startLoading();
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

  LIVES = 3;
  SCORE = 0;

  // QUADTREE FOR COLLISION DETECTION //
  const collidableObjects = kontra.quadtree();

  // WALLS //
  const leftWall = kontra.sprite({
    type: 'wall',
    anchor: {
      x: 1,
      y: 0,
    },
    x: 0.5,
    y: 0,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: 1,
    height: kontra.canvas.height,
    top: 0,
    bottom: kontra.canvas.height,
    left: -0.5,
    right: 0,
  });

  const rightWall = kontra.sprite({
    type: 'wall',
    anchor: {
      x: 0,
      y: 0,
    },
    x: kontra.canvas.width - 0.5,
    y: 0,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: 1,
    height: kontra.canvas.height,
    top: 0,
    bottom: kontra.canvas.height,
    left: kontra.canvas.width - 0.5,
    right: kontra.canvas.width + 0.5,
  });

  const topWall = kontra.sprite({
    type: 'wall',
    anchor: {
      x: 0,
      y: 1,
    },
    x: 0,
    y: 0.5,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: kontra.canvas.width,
    height: 1,
    top: -0.5,
    bottom: 0.5,
    left: 0,
    right: kontra.canvas.width,
  });

  const bottomWall = kontra.sprite({
    type: 'blackhole',
    anchor: {
      x: 0,
      y: 0,
    },
    x: 0,
    y: kontra.canvas.height - 0.5,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: kontra.canvas.width,
    height: 1,
    top: kontra.canvas.height - 0.5,
    bottom: kontra.canvas.height + 0.5,
    left: 0,
    right: kontra.canvas.width,
  });

  leftWall.render();
  rightWall.render();
  topWall.render();
  bottomWall.render();

  // PADDLE //
  const paddle = kontra.sprite({
    type: 'paddle',
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    // Place paddle in midde and above the bottom display
    x: CANVAS_WIDTH / 2, // - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT, 
    top: CANVAS_HEIGHT - 50 - PADDLE_HEIGHT / 2 + 1,
    bottom: CANVAS_HEIGHT - 50 + PADDLE_HEIGHT / 2 - 1,
    left: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    right: CANVAS_WIDTH / 2 + PADDLE_WIDTH / 2,
    color: 'black',
    // image: kontra.assets.images.paddle,
    update: paddleUpdate,
    move: movePaddle,
    onHit: paddleBounce,
  });

  const ballPool = kontra.pool({
    create: kontra.sprite,
    maxSize: 10,
    fill: true,
  });

  ballPool.get({
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
    ttl: Infinity,
    radius: 8,
    color: 'blue',
    // image: kontra.assets.images.ball,
    update: movingBall,
    render: renderBall,
    collidesWith: ballIntercept,
  });
  ballPool.render();

  showBottomDisplay();

  // Pool to pull bricks from
  const brickPool = kontra.pool({
    // create a new sprite every time the pool needs new objects
    create: kontra.sprite,  
    maxSize: 100,
    fill: true,
  });
  
  // LEVEL ONE BRICK GENERATOR //
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 6; j++) {
      let startX = 30 + (j * 5) + (j - 1) * 50;
      let startY = 30 + (i * 5) + (i - 1) * 15;

      brickPool.get({
        type: 'brick',
        hits: 6,
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        x: startX + BRICK_WIDTH / 2,
        y: startY + BRICK_HEIGHT / 2,
        originalX: startX + BRICK_WIDTH / 2,
        originalY: startY + BRICK_HEIGHT / 2,
        dx: 0,
        dy: 0,
        ttl: Infinity,
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        top: startY - BRICK_HEIGHT - 1, 
        bottom: startY + BRICK_HEIGHT + 1,
        left: startX - BRICK_WIDTH - 1,
        right: startX + BRICK_WIDTH + 1,
        color: 'black',
        update: colorChange,
        onHit: brickBounce,
      });

      brickPool.update();
      brickPool.render();
    }
  }


  GAMELOOP = kontra.gameLoop({  // create the main game loop
    fps: FPS,
    // clearCanvas: false,  // not clearing helps with debug
    // UPDATE GAME STATE //
    update: function (dt) {

      TWEEN.update();

      // Update paddle and bricks then add to quadtree
      brickPool.update();
      paddle.update();
      collidableObjects.clear();
      collidableObjects.add(brickPool.getAliveObjects());
      collidableObjects.add(leftWall, topWall, rightWall, bottomWall);
      collidableObjects.add(paddle);

      // Ready to check for collision!
      ballPool.update(dt, collidableObjects);


      // If all bricks are gone then go to win state
      if (brickPool.getAliveObjects().length <= 0) {
        this.stop();
        gameStates.win();
      }

      // If all balls die then check for lose or start another ball
      if (ballPool.getAliveObjects().length <= 0) {
        LIVES -= 1;
        if (LIVES <= 0) {
          // LOSE
          this.stop();
          gameStates.lose();
          return;
        }
        updateLives();
        ballPool.get({
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
          ttl: Infinity,
          radius: 8,
          color: 'blue',
          // image: kontra.assets.images.ball,
          update: movingBall,
          render: renderBall,
        });
      }

    },
    // RENDER GAME STATE //
    render: function () {
      paddle.render();
      ballPool.render();
      brickPool.render();
    }
  });

  GAMELOOP.start();    // start the game
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
    { name: 'quit', from: '*', to: 'menu'    },
    { name: 'win', from: '*', to: 'winner'    },
    { name: 'lose', from: '*', to: 'loser'    },
    { name: 'restart', from: '*', to: 'menu' }
  ],
  methods: {
    onLoading: loadAssets,
    onMenu: displayMenu,
    onEnterGame: gameStart,
    onGame: startGameLoop,
    onLeaveGame: gameEnd,
    onWinner: winMessage,
    onLoser: loseMessage,
  }
});

function loadAssets() {
  addMessage('Loading...', 'loading');

  kontra.assets.load(...imgAssets, ...sfxAssets)
    .then(() => {
      clearMessages();
      gameStates.finishLoading();
    }).catch((err) => {
      // error loading an asset
      console.log(err);
    });
};

// Basic press any key to start 'menu'
// displayMenu :: () -> Void
function displayMenu() {
  // Clear Canvas
  const context = kontra.canvas.getContext('2d');
  context.clearRect(0, 0, kontra.canvas.width, kontra.canvas.height);
   hideBottomDisplay();
   clearMessages();
  // Display Menu
  addTitle('BRICK SMASHING GAME!', 'title');
  addMessage('Press any key to start', 'menu');
  document.addEventListener('keypress', function handler(e) {
    e.currentTarget.removeEventListener(e.type, handler);
    clearMessages();
    clearHUD();
    // Delay start so pressing space doesn't launch ball immediately
    setTimeout(() => {gameStates.start();}, 500);
  });
};

// Show win message
// Skips straight to menu
function winMessage() {
  addMessage('You amount to something.', 'win');
  setTimeout(() => {gameStates.restart();}, 3000);
}

// Show lose message
// Skips straight to menu
function loseMessage() {
  addMessage('You are a loser.', 'lose');
  setTimeout(() => {gameStates.restart();}, 3000);
}

// Enter Game
// gameEnd :: () -> Void
function gameStart() {
  document.addEventListener('keypress', pause);
}

// Leave Game
// gameEnd :: () -> Void
function gameEnd() {
  document.removeEventListener('keypress', pause);
}


/* #endregion */


// ------------------------------------------------------- //
// ------------------------HELPERS------------------------ //
// ------------------------------------------------------- //
/* #region */


// Keeps canvas size 1x1 pixels so it draws correctly
// resizeCanvasToDisplaySize :: Element -> Void
function resizeCanvasToDisplaySize(canvas) {
  // Look up the size the canvas is being displayed
  canvas.clientWidth = CANVAS_WIDTH;
  canvas.clientHeight = CANVAS_HEIGHT;

  // If it's resolution does not match change it
  if (canvas.width !== CANVAS_WIDTH || canvas.height !== CANVAS_HEIGHT) {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    return true;
  }

  return false;
}

// Clear Messages from MESSAGES
// clearMessage :: () -> Void
function clearMessages () {
  while (MESSAGE.firstChild) {
    MESSAGE.removeChild(MESSAGE.firstChild);
  }
}

// Add Message to MESSAGES
// addMessage :: String -> String -> Void
function addMessage (message, type) {
  const newMessage = document.createElement('h2');
  newMessage.textContent = message;
  newMessage.classList.add(type);
  MESSAGE.appendChild(newMessage);
}

// Add title to HUD
// addMessage :: String -> String -> Void
function addTitle (message, type) {
  const newMessage = document.createElement('h1');
  newMessage.textContent = message;
  newMessage.classList.add(type);
  HUD.appendChild(newMessage);
}

// Clear all elements from HUD
// clearMessage :: () -> Void
function clearHUD () {
  while (HUD.firstChild) {
    HUD.removeChild(HUD.firstChild);
  }
}

// Display Lives/Score
// addMessage :: () -> Void
function showBottomDisplay () {
  const livesTitle = document.createElement('h5');
  livesTitle.textContent = 'Lives left: ';
  livesTitle.classList.add('lives-title');
  const scoreTitle = document.createElement('h5');
  scoreTitle.textContent = 'Score: ';
  scoreTitle.classList.add('score-title');

  const score = document.createElement('span');
  score.textContent = SCORE;
  score.classList.add('score');
  scoreTitle.appendChild(score);
  const lives = document.createElement('span');
  lives.textContent = LIVES - 1;
  lives.classList.add('lives');
  livesTitle.appendChild(lives);


  BOTTOM_DISPLAY.appendChild(livesTitle);
  BOTTOM_DISPLAY.appendChild(scoreTitle);
}

// Clear bottom display 
// hideBottomDisplay :: () -> Void
function hideBottomDisplay () {
  while (BOTTOM_DISPLAY.firstChild) {
    BOTTOM_DISPLAY.removeChild(BOTTOM_DISPLAY.firstChild);
  }
}

// Update score
// updateScore :: () -> Void
function updateScore () {
  const score = document.querySelector('.score');
  score.textContent = SCORE;
}

// Update lives 
// updateLives :: () -> Void
function updateLives () {
  const lives = document.querySelector('.lives');
  lives.textContent = LIVES - 1;
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
  let pt = false;
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

// Converts degrees to radians
// degToRad :: Num -> Num
function degToRad (deg) {
  return deg * Math.PI / 180;
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

// Pause Game
// pause :: Event -> Void
function pause(e) {
  if (e.keyCode === 112) {
    if (GAMELOOP.isStopped) {
      clearMessages();
      GAMELOOP.start();
    } else {
      addMessage('PAUSED', 'pause')
      GAMELOOP.stop();
    }
  }
}

/* #endregion */


// ------------------------------------------------------- //
// -------------------UPDATE FUNCTIONS-------------------- //
// ------------------------------------------------------- //
/* #region */

// Update paddle and keep in bounds
// paddleUpdate :: () -> Void
function paddleUpdate() {
  this.top = this.y - this.height / 2;
  this.bottom = this.y + this.height / 2;
  this.left = this.x - this.width / 2;
  this.right = this.x + this.width / 2;

  // Keep paddle contained in canvas
  if (this.x < (CANVAS_WIDTH - this.width / 2)
    && this.x > this.width / 2) {
    this.move(true, true);
  } else if (this.x >= CANVAS_WIDTH - this.width / 2) {
    this.move(true, false);
  } else if (this.x <= this.width / 2) {
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
    this.x = this.attached.x;
    this.y = this.attached.y - this.radius - this.attached.height / 2;

    // WILL NEED TO UPDATE TO WORK WITH DIFFERENT OBJECTS BESIDES PADDLE
    if (kontra.keys.pressed('space')) {
      if(kontra.keys.pressed('right')) {
        this.attached = null;
        this.dx = 5;
        this.dy = -6;
      } else if (kontra.keys.pressed('left')) {
        this.attached = null;
        this.dx = -5;
        this.dy = -6;
      }
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
    // const point = this.collidesWith(item, p2.nx, p2.ny)
    const point = ballIntercept(this, item, p2.nx, p2.ny);
    // If it exists then check magnitudes
    if (point) {
      const currentMagnitude = magnitude(point.x - this.x, point.y - this.y);
      if (currentMagnitude < closestMagnitude) {
        closestMagnitude = currentMagnitude;
        // set the closest point of collision/item hit
        closest = { item: item, point: point };
      }
    }
  });

  // ----- A collision happend so deal with it ------- //
  if (closest) {

    // How much time did it take to get to first collision?
    const udt = dt * (closestMagnitude / magnitude(p2.nx, p2.ny));
    // Update the ball to point of collision
    this.advance(udt);

    // Check what object was hit
    switch (closest.item.type) {
      case 'paddle':
        // IF THE PADDLE IS HIT //
        // Reset combo when paddle is hit
        this.combo = 0;

        // Animate/sounds
        closest.item.onHit();

        // Reflect ball
        switch (closest.point.d) {
          case 'left':
          case 'right':
            this.dy = p2.dy;
            this.dx = -p2.dx;
            break;

          // ** ROOM FOR IMPROVEMENT **
          // Edges of paddle bounce ball back instead of reflecting exact angles
          case 'top':
          case 'bottom':
            // If right 1/4 then bounce back right
            if (closest.point.x > (closest.item.x + closest.item.width / 4)) {
              this.dx = Math.abs(p2.dx);
              this.dy = -p2.dy;
            // If in the middle 1/2 then reflect
            } else if (closest.point.x >= (closest.item.x - closest.item.width / 4)) {
              this.dx = p2.dx;
              this.dy = -p2.dy;
            // If left 1/4 then bounce back left
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

        // THIS IS GROSS... But will iterate through all bricks and animate
        if (collidableObjects.objects.length === 0) {
          collidableObjects.subnodes.forEach((subnode) => {
            const bricks = subnode.objects.filter(n => n.type === 'brick')
            bricks.forEach((brick) => {
              brick.onHit(p2);
            });
          })
        } else {
          const bricks = collidableObjects.objects.filter(n => n.type === 'brick')
          bricks.forEach((brick) => {
            brick.onHit(p2);
          });
        }

        // ** ROOM FOR IMPROVEMENT **
        SCORE += this.combo * 50;
        updateScore();

        // If the brick has no hits left then destroy it
        if (closest.item.hits <= 0) {
          closest.item.ttl = 0;
        }

      // FALLTHROUGH! Both brick and wall update dx/dy the same way
      case 'wall':
        // IF A WALL OR BRICK IS HIT //
        switch (closest.point.d) {
          // Reflect x if right/left hit
          case 'left':
          case 'right':
            this.dy = p2.dy;
            this.dx = -p2.dx;
            break;

          // Reflect y if top/bottom hit
          case 'top':
          case 'bottom':
            this.dy = -p2.dy;
            this.dx = p2.dx;
            break;
        }
        break;

      case 'blackhole':
        // IF THE BOTTOM IS HIT //
        // Lose a ball
        this.ttl = 0;
        return;
    }
    // ----------------------------------------- //

    // Run collision recursively if there is time left
    return this.update(dt - udt, collidableObjects);
  }

  // Update ball position after all collisions have been resolved
  this.advance(dt * FPS);
}

// Brick color chaning logic
// colorChange :: Num -> Void
function colorChange() {
  switch (true) {
    case (this.hits > 5):
      this.color = 'black';
      break;
    case (this.hits > 4):
      this.color = 'blue';
      break;
    case (this.hits > 3):
      this.color = 'green';
      break;
    case (this.hits > 2):
      this.color = 'yellow';
      break;
    case (this.hits > 1):
      this.color = 'orange';
      break;
    default:
      this.color = 'red';
      break;
  }
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

// // Possible use with ball animation... needs tweaked
// function ellipse(cx, cy, rx, ry){
//   this.context.save(); // save state
//   this.context.beginPath();

//   this.context.translate(cx-rx, cy-ry);
//   this.context.scale(rx, ry);
//   this.context.arc(1, 1, 1, 0, 2 * Math.PI, false);

//   this.context.restore(); // restore to original state
//   this.context.stroke();
// }

/* #endregion */


// ------------------------------------------------------- //
// ----------------------ANIMATIONS----------------------- //
// ------------------------------------------------------- //
/* #region */


// paddle onHit animation/sounds
// paddleBounce :: () -> Void
function paddleBounce() {
  const thisObject = this;
  const coords = { y: this.y };
  // Chain up to the end of down
  const up = new TWEEN.Tween(coords)
    .to({ y: "-15" }, 50)
    .easing(TWEEN.Easing.Linear.None)
    .onUpdate(function () {
      thisObject.y = coords.y;
      thisObject.render();
    });
  new TWEEN.Tween(coords)
    .to({ y: "+15" }, 50)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate(function () {
      thisObject.y = coords.y;
      thisObject.render();
    })
    .chain(up)
    .start();
}

// Brick onHit animation/sound
// brickBounce :: (Object) -> Void
function brickBounce (hitLocation) {
  const thisObject = this;
  const xOffset = 5 * Math.random() + 5;
  const yOffset = 5 * Math.random() + 5;
  const xDirection = hitLocation.dx >= 0 ? 1 : -1;
  const yDirection = hitLocation.dy >= 0 ? 1 : -1;
  const startX = this.originalX;
  const startY = this.originalY;
  const endx = startX + (xDirection * xOffset);
  const endy = startY + (yDirection * yOffset);


  const coords = {
    x: startX,
    y: startY,
  };
  const back = new TWEEN.Tween(coords)
    .to({
      x: startX,
      y: startY,
    }, 100)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate(function () {
      thisObject.x = coords.x;
      thisObject.y = coords.y;
      thisObject.render();
    });

  new TWEEN.Tween(coords)
    .to({
      x: endx,
      y: endy,
    }, 50)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () {
      thisObject.x = coords.x;
      thisObject.y = coords.y;
      thisObject.render();
    })
    .chain(back)
    .start();

}



/* #endregion */

