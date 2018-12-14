/* eslint-disable */

// ------------------------------------------------------- //
// ------------------------GLOBALS------------------------ //
// ------------------------------------------------------- //
/* #region */
const FPS = 120;
const BRICK_HEIGHT = 15;
const BRICK_WIDTH = 50;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 15;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
let LIVES;
let SCORE;
let GAMELOOP;
// Temp fix to test levels
let CURRENT_LEVEL = 1;
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
  // Make sure the canvas is the right size/resolution
  resizeCanvasToDisplaySize(canvasElement);
  // Attach canvas to Kontra
  kontra.init(canvasElement);
  // Start everything!
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
// startGameLoop :: () -> Void
const startGameLoop = function () {

  // Reset lives and score
  LIVES = 5;
  SCORE = 0;
  let currentLevel = 1;


  // PADDLE //
  const paddle = createPaddle();
  
  // BALLS //
  const ballPool = newBallPool();
  newBall(ballPool, paddle);
  // Clamp vector in boundaries
  ballPool.getAliveObjects().forEach((ball) => {
    ball.contain();
  });

  // TOUCH BUTTONS //
  const leftButton = kontra.sprite({
    type: 'button',
    action: 'left',
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    x: CANVAS_WIDTH / 4,
    y: CANVAS_HEIGHT * (3/4),
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: CANVAS_WIDTH / 2,
    height: CANVAS_HEIGHT / 2, 
    onDown: movePaddleLeft(paddle),
    onUp: stopPaddle(paddle),
    render: renderButton,
  });
  kontra.pointer.track(leftButton);

  const rightButton = kontra.sprite({
    type: 'button',
    action: 'right',
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    x: CANVAS_WIDTH * (3/4),
    y: CANVAS_HEIGHT * (3/4),
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: CANVAS_WIDTH / 2,
    height: CANVAS_HEIGHT / 2, 
    fill: false,
    onDown: movePaddleRight(paddle),
    onUp: stopPaddle(paddle),
    render: renderButton,
  });
  kontra.pointer.track(rightButton);

  const middleButton = kontra.sprite({
    type: 'button',
    action: 'launch',
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT * (3/4),
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: CANVAS_WIDTH / 4,
    height: CANVAS_HEIGHT / 2, 
    fill: false,
    onDown: launchBall(ballPool.getAliveObjects()[0]),
    onUp: disableLaunch,
    render: renderButton,
  });
  kontra.pointer.track(middleButton);


  // QUADTREE FOR COLLISION DETECTION //
  const collidableObjects = kontra.quadtree({
    maxObjects: 10,
  });

  // BOUNDARY WALLS //
  const walls = createWalls();

  // Objects that always need to be checked for
  const alwaysCollidableObjects = [...walls, paddle];


  // BRICKS //
  const brickPool = newBrickPool();
  levelOne(brickPool);
  // levelOneTEST(brickPool);

  // PRE-RENDER ALL //
  brickPool.update();
  brickPool.render();
  paddle.update();
  paddle.render();
  rightButton.render();
  leftButton.render();
  middleButton.render();
  showBottomDisplay();


  brickPool.getAliveObjects().forEach((brick) => {
    brick.onSpawn(0);
  });

  // MAIN GAME LOOP
  GAMELOOP = kontra.gameLoop({
    fps: FPS,

    // UPDATE GAME STATE //
    update: function (dt) {

      // Sync tween animations
      TWEEN.update();

      // Update paddle and bricks then add to quadtree
      brickPool.update();
      paddle.update();

      collidableObjects.clear();
      collidableObjects.add(brickPool.getAliveObjects());

      // Ready to check for collision!
      ballPool.update(dt, collidableObjects, alwaysCollidableObjects);


      brickPool.update();
      // If all bricks are gone then go to next level/win
      if (brickPool.getAliveObjects().length <= 0) {
        brickPool.clear();
        currentLevel = advanceLevel(this, brickPool, currentLevel);
      }

      // Check if any balls are left
      if (ballPool.getAliveObjects().length <= 0) {
        LIVES -= 1;
        // You Lose!
        if (LIVES <= 0) {
          this.stop();
          gameStates.lose();
        } else {
          updateLives();
          newBall(ballPool, paddle);
          // Clamp vector in boundaries
          ballPool.getAliveObjects().forEach((ball) => {
            ball.contain();
          });
          // Reset button to launch new ball
          middleButton.onDown = launchBall(ballPool.getAliveObjects()[0])
        }
      }

    },

    // RENDER GAME STATE //
    render: function () {
      paddle.render();
      ballPool.render();
      brickPool.render();
      rightButton.render();
      leftButton.render();
      middleButton.render();
    }
  });

  // Start the game!
  GAMELOOP.start();
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
    { name: 'startLoading',   from: 'pageLoad',  to: 'loading' },
    { name: 'finishLoading',  from: 'loading',   to: 'menu' },
    { name: 'start',          from: 'menu',      to: 'game' },
    { name: 'quit',           from: '*',         to: 'menu'    },
    { name: 'win',            from: '*',         to: 'winner'    },
    { name: 'lose',           from: '*',         to: 'loser'    },
    { name: 'restart',        from: '*',         to: 'menu' }
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
      // Not addressed yet...
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
  addMessage('Touch or press a key to start', 'menu');
  document.addEventListener('click', waitForButton);
  document.addEventListener('keypress', waitForButton);
};

// Start click event listener
// waitForButton :: Event -> ()
function waitForButton (e) {
  document.removeEventListener('click', waitForButton);
  document.removeEventListener('keypress', waitForButton);
  // Resume AudioContext and start playing music after interaction
  ac.resume().then(() => { playMusic(); });
  clearMessages();
  clearHUD();
  // Delay start so pressing space doesn't launch ball immediately
  setTimeout(() => { gameStates.start(); }, 500);
}

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

// USED TO OVERRIDE collidesWith function for ball sprites
// ballIntercept {top, bottom, left, right} -> {nx, ny} -> {x,y,d}
function ballIntercept (rect, futurePosition) {
  const nx = futurePosition.nx;
  const ny = futurePosition.ny;
  let pt;
  if (nx < 0) {
    pt = intercept(this.x, this.y, this.x + nx, this.y + ny, 
                             rect.right  + this.radius, 
                             rect.top    - this.radius, 
                             rect.right  + this.radius, 
                             rect.bottom + this.radius, 
                             "right");
  }
  else if (nx > 0) {
    pt = intercept(this.x, this.y, this.x + nx, this.y + ny, 
                             rect.left   - this.radius, 
                             rect.top    - this.radius, 
                             rect.left   - this.radius, 
                             rect.bottom + this.radius,
                             "left");
  }
  if (!pt) {
    if (ny < 0) {
      pt = intercept(this.x, this.y, this.x + nx, this.y + ny, 
                               rect.left   - this.radius, 
                               rect.bottom + this.radius, 
                               rect.right  + this.radius, 
                               rect.bottom + this.radius,
                               "bottom");
    }
    else if (ny > 0) {
      pt = intercept(this.x, this.y, this.x + nx, this.y + ny, 
                               rect.left   - this.radius, 
                               rect.top    - this.radius, 
                               rect.right  + this.radius, 
                               rect.top    - this.radius,
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
// move :: {dx,dy}, dt -> {nx,ny}
function move(object, dt) {
  // KONTRA USES FIXED GAME LOOP dx is just change in pixel/frame
  return { 
    nx: object.dx * dt * FPS,
    ny: object.dy * dt * FPS,
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
  this.top = this.y - this.height / 2 - 1;
  this.bottom = this.y + this.height / 2 + 1;
  this.left = this.x - this.width / 2 + 1;
  this.right = this.x + this.width / 2 - 1;

  this.move();

}

// NEED TO COMBINE WITH TOUCH CONTROLS
// Move paddle!
// movePaddle :: Bool -> Bool -> Void
function movePaddle() {
  this.advance();
  switch (true) {
    case (kontra.keys.pressed('left')):
      this.dx = -5;
      break;
    case (kontra.keys.pressed('right')):
      this.dx = 5;
      break;
    case (!this.moving):
      this.dx = 0;
  }
}

// Touch control move paddle
// movePaddleLeft :: Sprite -> () -> Void
function movePaddleLeft (p) {
  return () => {
    p.moving = true;
    p.dx = -5;
  }
}

// Touch control move paddle
// movePaddleLeft :: Sprite -> () -> Void
function movePaddleRight (p) {
  return () => {
    p.moving = true;
    p.dx = 5;
  }
}

// Touch control stop movement on release
// movePaddleLeft :: Sprite -> () -> Void
function stopPaddle (p) {
  return () => {
    p.moving = false;
    p.dx = 0;
  }
}

// MAGIC NUMBERS
// Touch control launch
// launchBall :: Sprite -> () -> Void
function launchBall (b) {
  return () => {
    // Shoot left/right randomly
    if (Math.floor((Math.random() * 100)) % 2 === 0) {
      b.dx = -5;
    } else {
      b.dx = 5;
    }
    b.dy = -6;
    b.attached = null;
  }
}

// Turn off touch launch after launching
// disableLaunch :: () -> Void
function disableLaunch () {
  this.onDown = () => {};
}


// MODIFIED KONTRA JS TO PASS IN MULTIPLE ARGUMENTS
// Update logic for ball objects
// movingBall :: Num -> [Object] -> [Object] -> Void
function movingBall(dt, collidableObjects, alwaysCollidable) {

  // If attached to something then wait for keypress
  if (this.attached) {
    this.x = this.attached.x;
    this.y = this.attached.y - this.radius + 3 - this.attached.height / 2;

    // WILL NEED TO UPDATE TO WORK WITH DIFFERENT OBJECTS BESIDES PADDLE
    if (kontra.keys.pressed('space')) {
      if (Math.floor((Math.random() * 100)) % 2 === 0) {
        this.dx = -5;
      } else {
        this.dx = 5;
      }
      this.dy = -6;
      this.attached = null;
    }
    this.advance();
    return;
  }

  // Calculate future position of ball
  // const p2 = move(this, dt);
  const nextPosition = move(this, dt);

  let closestMagnitude = Infinity;
  let closest = null;

  // Check all objects in current node of quadtree and walls/paddle
  const nearbyCollidableObjects = collidableObjects.get(this)
  const allCollidableObjects = [...nearbyCollidableObjects, ...alwaysCollidable];

  allCollidableObjects.forEach((item) => {
    // Check for point of collision
    const point = this.collidesWith(item, nextPosition)
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
    const udt = dt * (closestMagnitude / magnitude(nextPosition.nx, nextPosition.ny));
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
            this.dx *= -1;
            break;

          // ** ROOM FOR IMPROVEMENT **
          // Edges of paddle bounce ball back instead of reflecting exact angles
          case 'top':
          case 'bottom':
            // If right 1/4 then bounce back right
            if (closest.point.x > (closest.item.x + closest.item.width / 4)) {
              this.dx = Math.abs(this.dx);
              this.dy *= -1;
            // If in the middle 1/2 then reflect
            } else if (closest.point.x >= (closest.item.x - closest.item.width / 4)) {
              this.dy *= -1;
            // If left 1/4 then bounce back left
            } else {
              this.dx = -1 * Math.abs(this.dx);
              this.dy *= -1;
            }
            break;
        }
        break;

      case 'brick':
        // IF A BRICK IS HIT //
        // Reduce its hitcount and add to combo
        closest.item.hits -= 1;
        this.combo += 1;

        // Animate all bricks in same quadrant
        nearbyCollidableObjects.forEach((brick) => {
          brick.onHit(this);
        });

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
            this.dx *= -1;
            break;

          // Reflect y if top/bottom hit
          case 'top':
          case 'bottom':
            this.dy *= -1;
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
    return this.update(dt - udt, collidableObjects, alwaysCollidable);
  }

  // Update ball position after all collisions have been resolved
  this.advance(dt * FPS);
}

// Brick color changing logic
// colorChange :: Num -> Void
function colorChange(dt) {
  this.advance(dt);

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
  
  //Update hitbox on move
  this.top = this.y - this.height / 2 - 2;
  this.bottom = this.y + this.height / 2 + 2;
  this.left = this.x - this.width / 2 - 2;
  this.right = this.x + this.width / 2 + 2;
}


/* #endregion */


// ------------------------------------------------------- //
// -------------------CREATE FUNCTIONS-------------------- //
// ------------------------------------------------------- //
/* #region */


// Create the main paddle
// createPaddle :: () -> Sprite
function createPaddle () {
  const newPaddle = kontra.sprite({
    type: 'paddle',
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    // Place paddle in midde and above the bottom display
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    dx: 0,
    dy: 0,
    moving: false,
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
    moveLeft: movePaddleLeft,
    moveRight: movePaddleRight,
    stop: stopPaddle,
  })
  // Keep paddle on the screen
  newPaddle.position.clamp(0 + newPaddle.width / 2, 0, CANVAS_WIDTH - newPaddle.width / 2, CANVAS_HEIGHT);
  return newPaddle;
}

// Creates a new ball and attaches to paddle
// newBall :: Pool -> Sprite -> Void
function newBall (pool, paddle) {
  pool.get({
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
    radius: 11,
    color: 'blue',
    // image: kontra.assets.images.ball,
    update: movingBall,
    render: renderBall,
    collidesWith: ballIntercept,
    contain: function () {
      this.position.clamp(0 + this.radius / 2, 0 + this.radius / 2, CANVAS_WIDTH - this.radius / 2, CANVAS_HEIGHT - this.radius / 2);
    }
  });


}

// Creates new brick pool
// newBrickPool :: () -> Void
function newBrickPool () {
  return kontra.pool({
    // create a new sprite every time the pool needs new objects
    create: kontra.sprite,  
    maxSize: 100,
    fill: true,
  });
}

// Creates new ball pool
// newBallPool :: () -> Void
function newBallPool () {
  return kontra.pool({
    create: kontra.sprite,
    maxSize: 10,
    fill: true,
  });
}

// Creates the boundary walls
// createWalls :: () -> [Sprite]
function createWalls () {
  // WALLS //
  return [
    // Left Wall
    kontra.sprite({
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
      height: CANVAS_HEIGHT,
      top: 0,
      bottom: CANVAS_HEIGHT,
      left: -0.5,
      right: 0,
    }),

    // Right Wall
    kontra.sprite({
      type: 'wall',
      anchor: {
        x: 0,
        y: 0,
      },
      x: CANVAS_WIDTH - 0.5,
      y: 0,
      dx: 0,
      dy: 0,
      ttl: Infinity,
      width: 1,
      height: CANVAS_HEIGHT,
      top: 0,
      bottom: CANVAS_HEIGHT,
      left: CANVAS_WIDTH - 0.5,
      right: CANVAS_WIDTH + 0.5,
    }),

    // Top Wall
    kontra.sprite({
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
      width: CANVAS_WIDTH,
      height: 1,
      top: -0.5,
      bottom: 0.5,
      left: 0,
      right: CANVAS_WIDTH,
    }),

    // Bottom Wall
    kontra.sprite({
      type: 'blackhole',
      anchor: {
        x: 0,
        y: 0,
      },
      x: 0,
      y: CANVAS_HEIGHT - 0.5,
      dx: 0,
      dy: 0,
      ttl: Infinity,
      width: CANVAS_WIDTH,
      height: 1,
      top: CANVAS_HEIGHT - 0.5,
      bottom: CANVAS_HEIGHT + 0.5,
      left: 0,
      right: CANVAS_WIDTH,
    }),
  ];
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
  this.context.arc(this.x, this.y, this.radius - 3, 0, 2 * Math.PI);
  this.context.fill();
}


// Transparent render for buttons
// renderButton :: () -> Void
function renderButton () {
  this.context.fillStyle = 'rgba(0,0,0,0)';
}

/* #endregion */


// ------------------------------------------------------- //
// ----------------------ANIMATIONS----------------------- //
// ------------------------------------------------------- //
/* #region */


// paddle onHit animation/sounds
// paddleBounce :: () -> Void
function paddleBounce() {
  // testing beep sounds
  playBeepSound();
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
  playHighBeepSound();
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

// Fall from sky animation
function dropDown (delay) {
  const thisObject = this;
  const coords = { y: this.y };
  new TWEEN.Tween(coords)
    .to({ y: "+500" }, 750)
    .easing(TWEEN.Easing.Elastic.InOut)
    .onUpdate(function () {
      thisObject.y = coords.y;
      thisObject.originalY = coords.y;
      thisObject.render();
    })
    .delay(delay)
    .start();
}


/* #endregion */


// ------------------------------------------------------- //
// ------------------------LEVELS------------------------- //
// ------------------------------------------------------- //
/* #region */


// Start next level and check for win
function advanceLevel(loop, bricks, currentLevel) {
  // Move to next level
  const level = currentLevel + 1;

  switch (level) {

    case 2:
      startSequence(sequence1);
      levelTwo(bricks);
      bricks.getAliveObjects().forEach((brick) => {
        brick.onSpawn(500);
      });
      return level;

    case 3:
      startSequence(sequence2);
      levelThree(bricks);
      bricks.getAliveObjects().forEach((brick) => {
        brick.onSpawn(500);
      });
      return level;

    case 4:
      // startSequence(sequence2);
      levelFour(bricks);
      bricks.getAliveObjects().forEach((brick) => {
        brick.onSpawn(500);
      });
      return level;

    case 5:
      // startSequence(sequence2);
      levelFive(bricks);
      bricks.getAliveObjects().forEach((brick) => {
        brick.onSpawn(500);
      });
      return level;

    case 6:
      // startSequence(sequence2);
      levelSix(bricks);
      bricks.getAliveObjects().forEach((brick) => {
        brick.onSpawn(500);
      });
      return level;

    default:
      loop.stop();
      gameStates.win();
      break;
  }

}

// LEVEL 1 EASY MODE TO DEBUG
// levelOne :: Pool -> Void
function levelOneTEST (pool) {
  for (let i = 1; i <= 5; i++) {
    // for (let j = 1; j <= 6; j++) {
      const startX = 30 + (i * 5) + (i - 1) * 50;
      const startY = 30 + (i * 5) + (i - 1) * 15;

      pool.get({
        type: 'brick',
        hits: 1,
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        x: startX + BRICK_WIDTH / 2,
        y: startY + BRICK_HEIGHT / 2 - 500,
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
        onSpawn: dropDown,
      });
    }
  // }
}


// LEVEL 1
// levelOne :: Pool -> Void
function levelOne (pool) {
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 6; j++) {
      const startX = 30 + (j * 5) + (j - 1) * 50;
      const startY = 30 + (i * 5) + (i - 1) * 15;

      pool.get({
        type: 'brick',
        hits: 1,
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        x: startX + BRICK_WIDTH / 2,
        y: startY + BRICK_HEIGHT / 2 - 500,
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
        onSpawn: dropDown,
      });
    }
  }
}

// LEVEL 2
// levelTwo :: Pool -> Void
function levelTwo (pool) {
  console.log('Creating level 2');
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 6; j++) {
      const startX = 30 + (j * 5) + (j - 1) * 50;
      const startY = 30 + (i * 5) + (i - 1) * 15 - 500;

      pool.get({
        type: 'brick',
        hits: 2,
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
        onSpawn: dropDown,
      });
    }
  }
}


// LEVEL 3
// levelThree :: Pool -> Void
function levelThree (pool) {
  console.log('Creating level 2');
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 6; j++) {
      const startX = 30 + (j * 5) + (j - 1) * 50;
      const startY = 30 + (i * 5) + (i - 1) * 15 - 500;

      pool.get({
        type: 'brick',
        hits: 3,
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
        onSpawn: dropDown,
      });
    }
  }
}

// LEVEL 4
// levelFour :: Pool -> Void
function levelFour (pool) {
  console.log('Creating level 2');
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 6; j++) {
      const startX = 30 + (j * 5) + (j - 1) * 50;
      const startY = 30 + (i * 5) + (i - 1) * 15 - 500;

      pool.get({
        type: 'brick',
        hits: 4,
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
        onSpawn: dropDown,
      });
    }
  }
}

// LEVEL 5
// levelFive :: Pool -> Void
function levelFive (pool) {
  console.log('Creating level 2');
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 6; j++) {
      const startX = 30 + (j * 5) + (j - 1) * 50;
      const startY = 30 + (i * 5) + (i - 1) * 15 - 500;

      pool.get({
        type: 'brick',
        hits: 5,
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
        onSpawn: dropDown,
      });
    }
  }
}

// LEVEL 6
// levelSix :: Pool -> Void
function levelSix (pool) {
  console.log('Creating level 2');
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 6; j++) {
      const startX = 30 + (j * 5) + (j - 1) * 50;
      const startY = 30 + (i * 5) + (i - 1) * 15 - 500;

      pool.get({
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
        onSpawn: dropDown,
      });
    }
  }
}


/* #endregion */

