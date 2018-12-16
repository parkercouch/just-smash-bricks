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
const GAME_CONTAINER = document.getElementById('game-container');
const MESSAGE = document.getElementById('message');
const HUD = document.getElementById('hud');
const TOP_DISPLAY = document.getElementById('top-display');


const PADDLE_COLOR = '#B993EA';
const PARTICLE_COLOR = '#F6C5F7';
const BALL_COLOR = '#ECFFE0';


/* #endregion */

// ------------------------------------------------------- //
// ----------------------DOM LOADED----------------------- //
// ------------------------------------------------------- //
/* #region */

document.addEventListener('DOMContentLoaded', function () {

  // Add listener to fullscreen button and change/state
  document.getElementById('fs-button').addEventListener('click', (e) => {
    e.target.blur();
    if (screenfull.enabled) { screenfull.toggle(); }
  });
  screenfull.onchange(() => {
    if (screenfull.isFullscreen) {
      document.getElementById('fs-button').innerText = 'Exit';
      // Show touch buttons
      document.querySelector('.container').classList.add('no-padding');
      showTouchButtons();

    } else {
      document.getElementById('fs-button').innerText = 'Fullscreen';
      // Hide touch buttons
      document.querySelector('.container').classList.remove('no-padding');
      hideTouchButtons();
    }
  });

  // Make highscore list in localStorage if none exists
  initializeHighScores();

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
// startGameLoop :: () -> ()
const startGameLoop = function () {

  // Reset lives and score
  LIVES = 5;
  SCORE = 0;
  let currentLevel = 1;

  // PADDLE //
  const paddle = createPaddle();

  //* AUTO MOVE DEBUG MODE *//
  // paddle.autoMove = debugAutoMove;
  //* -------------------- *//
  
  // BALLS //
  const ballPool = newBallPool();
  newBall(ballPool, paddle);
  // Clamp vector in boundaries
  ballPool.getAliveObjects()[0].contain();


  // TOUCH BUTTONS //
  // Create buttons
  const leftButton = createLeftButton(paddle);
  const rightButton = createRightButton(paddle);
  const middleButton = createMiddleButton(ballPool);

  const moveLeftFunc = movePaddleLeft(paddle);
  const moveRightFunc = movePaddleRight(paddle);
  const stopPaddleFunc = stopPaddle(paddle);
  // Needs to be updated with when new balls are created
  let shootBallFunc = launchBall(ballPool.getAliveObjects()[0]);

  addTouchEventListeners(moveLeftFunc, moveRightFunc, shootBallFunc, stopPaddleFunc);

  // Fullscreen buttons
  // document.querySelector('.left').addEventListener('pointerdown', movePaddleLeft(paddle))

  // Track pointer on buttons
  kontra.pointer.track(leftButton);
  kontra.pointer.track(rightButton);
  kontra.pointer.track(middleButton);


  // BOUNDARY WALLS //
  const walls = createWalls();


  // BRICKS //
  const brickPool = newBrickPool();
  
  // Create Level 1
  levelOne(brickPool);
  //* Debug easy mode *//
  // levelOneTEST(brickPool);
  //* --------------- *//

  // Particles //
  const particlePool = newParticlePool(100);
  createParticles(particlePool, 10, ballPool.getAliveObjects()[0]);


  // PRE-RENDER //

  brickPool.update();
  brickPool.render();
  paddle.update();
  paddle.render();
  rightButton.render();
  leftButton.render();
  middleButton.render();
  showTopDisplay(currentLevel);


  // Drop in first level
  playDropSound(100);
  brickPool.getAliveObjects().forEach((brick, i) => {
    brick.onSpawn(100 / (1 + Math.floor(i / 6)));
  });

  //------------------//
  //- MAIN GAME LOOP -//
  //------------------//
  GAMELOOP = kontra.gameLoop({
    fps: FPS,

    // UPDATE GAME STATE //
    update: function (dt) {

      // Sync tween animations
      TWEEN.update();

      // Update paddle and bricks then add to quadtree
      brickPool.update();

      //DEBUG AUTO MOVE //
      // if (ballPool.getAliveObjects()[0].attached === null) {
      //   paddle.autoMove(ballPool.getAliveObjects()[0]);
      // } else {
      //   paddle.update();
      // }
      paddle.update(); // Normal paddle update

      const bricks = brickPool.getAliveObjects();

      // Ready to check for collision!

      // console.log(bricks, walls, paddle)
      ballPool.update(dt, [...bricks, ...walls, paddle]);

      particlePool.update();

      // Update bricks after collision detection
      brickPool.update();

      // If all bricks are gone then go to next level/win
      if (brickPool.getAliveObjects().length <= 0) {
        brickPool.clear();
        currentLevel = advanceLevel(this, brickPool, currentLevel);
        // Add a life every level
        LIVES += 1;
      }

      // Check if any balls are left
      if (ballPool.getAliveObjects().length <= 0) {
        LIVES -= 1;
        // You Lose!
        if (LIVES <= 0) {
          this.stop();
          stopMusic();
          updateHighScores(SCORE);
          removeTouchEventListeners(moveLeftFunc, moveRightFunc, stopPaddleFunc);
          gameStates.lose();
        } else {
          updateLives();
          newBall(ballPool, paddle);
          // Clamp vector in boundaries
          ballPool.getAliveObjects()[0].contain();
          // Reset button to launch new ball
          middleButton.onDown = launchBall(ballPool.getAliveObjects()[0]);
          // Update fs-touch button
          updateMiddleTouchButton(launchBall(ballPool.getAliveObjects()[0]));
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
      particlePool.render();
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

  // Skipping assets for now
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
// displayMenu :: () -> ()
function displayMenu() {
  // Clear Canvas
  const context = kontra.canvas.getContext('2d');
  context.clearRect(0, 0, kontra.canvas.width, kontra.canvas.height);
   hideTopDisplay();
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
// gameEnd :: () -> ()
function gameStart() {
  document.addEventListener('keypress', pause);
}

// Leave Game
// gameEnd :: () -> ()
function gameEnd() {
  document.removeEventListener('keypress', pause);
}


/* #endregion */


// ------------------------------------------------------- //
// ------------------------HELPERS------------------------ //
// ------------------------------------------------------- //
/* #region */


// Keeps canvas size 1x1 pixels so it draws correctly
// resizeCanvasToDisplaySize :: Element -> ()
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
// clearMessage :: () -> ()
function clearMessages () {
  MESSAGE.classList.remove('showMessage');
  MESSAGE.classList.add('hideMessage');
  while (MESSAGE.firstChild) {
    MESSAGE.removeChild(MESSAGE.firstChild);
  }
}

// Add Message to MESSAGES
// addMessage :: String -> String -> ()
function addMessage (message, type) {
  MESSAGE.classList.remove('hideMessage');
  MESSAGE.classList.add('showMessage');
  const newMessage = document.createElement('h2');
  newMessage.textContent = message;
  newMessage.classList.add(type);
  MESSAGE.appendChild(newMessage);
}

// Add title to HUD
// addMessage :: String -> String -> ()
function addTitle (message, type) {
  const newMessage = document.createElement('h1');
  newMessage.textContent = message;
  newMessage.classList.add(type);
  HUD.appendChild(newMessage);
}

// Clear all elements from HUD
// clearMessage :: () -> ()
function clearHUD () {
  while (HUD.firstChild) {
    HUD.removeChild(HUD.firstChild);
  }
}

// Display Lives/Score
// addMessage :: () -> ()
function showTopDisplay (currentLevel) {
  const livesTitle = document.createElement('h5');
  livesTitle.textContent = 'Lives left: ';
  livesTitle.classList.add('lives-title');

  const scoreTitle = document.createElement('h5');
  scoreTitle.textContent = 'Score: ';
  scoreTitle.classList.add('score-title');

  const levelTitle = document.createElement('h5');
  levelTitle.textContent = 'Level ';
  levelTitle.classList.add('level-title');


  const lives = document.createElement('span');
  lives.textContent = LIVES - 1;
  lives.classList.add('lives');
  livesTitle.appendChild(lives);
  
  const score = document.createElement('span');
  score.textContent = SCORE;
  score.classList.add('score');
  scoreTitle.appendChild(score);

  const level = document.createElement('span');
  level.textContent = currentLevel;
  level.classList.add('level');
  levelTitle.appendChild(level);



  TOP_DISPLAY.appendChild(livesTitle);
  TOP_DISPLAY.appendChild(scoreTitle);
  TOP_DISPLAY.appendChild(levelTitle);
}

// // Show current level
// // showLevel :: Int -> ()
// function showLevel (currentLevel) {
//   const levelTitle = document.createElement('h5');
//   levelTitle.textContent = 'Level';
//   levelTitle.classList.add('level-title');

//   const level = document.createElement('span');
//   level.textContent = currentLevel;
//   level.classList.add('level');
//   levelTitle.appendChild(level);

//   TOP_DISPLAY.appendChild(levelTitle);
// }

// Clear bottom display 
// hideTopDisplay :: () -> ()
function hideTopDisplay () {
  while (TOP_DISPLAY.firstChild) {
    TOP_DISPLAY.removeChild(TOP_DISPLAY.firstChild);
  }
}

// Update level
// updateLevelDisplay :: Int -> ()
function updateLevelDisplay (currentLevel) {
  document.querySelector('.level').textContent = currentLevel;
}

// Update score
// updateScore :: () -> ()
function updateScore () {
  document.querySelector('.score').textContent = SCORE;
}

// Update lives 
// updateLives :: () -> ()
function updateLives () {
  document.querySelector('.lives').textContent = LIVES - 1;
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
// pause :: Event -> ()
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
// paddleUpdate :: () -> ()
function paddleUpdate() {
  this.top = this.y - this.height / 2 - 1;
  this.bottom = this.y + this.height / 2 + 1;
  this.left = this.x - this.width / 2 + 1;
  this.right = this.x + this.width / 2 - 1;

  this.move();

}

// NEED TO COMBINE WITH TOUCH CONTROLS
// Move paddle!
// movePaddle :: Bool -> Bool -> ()
function movePaddle() {
  this.advance();
  switch (true) {
    case (kontra.keys.pressed('left') || kontra.keys.pressed('a')):
      this.dx = -5;
      break;
    case (kontra.keys.pressed('right') || kontra.keys.pressed('s')):
      this.dx = 5;
      break;
    case (!this.moving):
      this.dx = 0;
  }
}

// Touch control move paddle
// movePaddleLeft :: Sprite -> () -> ()
function movePaddleLeft (p) {
  return () => {
    p.moving = true;
    p.dx = -5;
  }
}

// Touch control move paddle
// movePaddleLeft :: Sprite -> () -> ()
function movePaddleRight (p) {
  return () => {
    p.moving = true;
    p.dx = 5;
  }
}

// Touch control stop movement on release
// movePaddleLeft :: Sprite -> () -> ()
function stopPaddle (p) {
  return () => {
    p.moving = false;
    p.dx = 0;
  }
}

// MAGIC NUMBERS
// Touch control launch
// launchBall :: Sprite -> () -> ()
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
// disableLaunch :: () -> ()
function disableLaunch () {
  this.onDown = () => {};
}


// MODIFIED KONTRA JS TO PASS IN MULTIPLE ARGUMENTS
// Update logic for ball objects
// movingBall :: Num -> [Sprite] -> ()
function movingBall(dt, collidableObjects) {

  // If attached to something then wait for keypress
  if (this.attached) {
    this.x = this.attached.x;
    this.y = this.attached.y - this.radius + 3 - this.attached.height / 2;

    // WILL NEED TO UPDATE TO WORK WITH DIFFERENT OBJECTS BESIDES PADDLE
    if (kontra.keys.pressed('z')) {
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
  const nextPosition = move(this, dt);

  let closestMagnitude = Infinity;
  let closest = null;

  collidableObjects.forEach((item) => {
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

        // Animate all bricks
        collidableObjects.filter(n => n.type === 'brick')
          .forEach(brick => { brick.onHit(this); });

        // ** ROOM FOR IMPROVEMENT **
        SCORE += this.combo * 50;
        updateScore();

        // If the brick has no hits left then destroy it
        if (closest.item.hits <= 0) {
          closest.item.ttl = 0;
        }

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

      case 'wall':
        // IF A WALL OR BRICK IS HIT //
        // Need to move this into a onHit Function
        playBounceSound();
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
    // return this.update(dt - udt, collidableObjects, alwaysCollidable);
    return this.update(dt - udt, collidableObjects);
  }

  // Update ball position after all collisions have been resolved
  this.advance(dt * FPS);
}

// Brick color changing logic
// colorChange :: Num -> ()
function colorChange(dt) {
  this.advance(dt);

  switch (true) {
    case (this.hits > 5):
      this.color = 'black';
      break;
    case (this.hits > 4):
      // this.color = 'blue';
      this.color = '#718FEA';
      break;
    case (this.hits > 3):
      // this.color = 'green';
      this.color = '#9EEA70';
      break;
    case (this.hits > 2):
      // this.color = 'yellow';
      this.color = '#EDED86';
      break;
    case (this.hits > 1):
      // this.color = 'orange';
      this.color = '#E0986B';
      break;
    default:
      // this.color = 'red';
      this.color = '#E77474';
      break;
  }
  
  //Update hitbox on move
  this.top = this.y - this.height / 2 - 2;
  this.bottom = this.y + this.height / 2 + 2;
  this.left = this.x - this.width / 2 - 2;
  this.right = this.x + this.width / 2 + 2;
}


// Orbit around barycenter (the ball)
// particleGravity :: () -> ()
function particleGravity() {
  const vectorX = this.barycenter.x - this.x;
  const vectorY = this.barycenter.y - this.y;
  const force = this.barycenter.mass / Math.pow(vectorX * vectorX + vectorY * vectorY, 1.5);
  const totalDistance = Math.sqrt(vectorX ** 2 + vectorY ** 2);

  // Ramp up acceleration when particles move far away to keep them contained
  if (totalDistance > 50) {
    this.acceleration.x = vectorX * force * 100;
    this.acceleration.y = vectorY * force * 100;
  } else {
    this.acceleration.x = vectorX * force;
    this.acceleration.y = vectorY * force;
  }

  // Keep particles from going too fast
  if (Math.abs(this.dx) > this.maxDx) {
    this.dx > 0 ? this.dx = this.maxDx : this.dx = -1 * this.maxDx;
  }
  if (Math.abs(this.dy) > this.maxDy) {
    this.dy > 0 ? this.dy = this.maxDy : this.dy = -1 * this.maxDy;
  }

  this.advance();
};



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
    color: PADDLE_COLOR,
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
// newBall :: Pool -> Sprite -> ()
function newBall (pool, paddle) {
  pool.get({
    type: 'ball',
    combo: 0,
    attached: paddle, // keep track if it is stuck to something
    mass: 100,
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
    color: BALL_COLOR,
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
// newBrickPool :: () -> ()
function newBrickPool () {
  return kontra.pool({
    // create a new sprite every time the pool needs new objects
    create: kontra.sprite,  
    maxSize: 100,
    fill: true,
  });
}

// Creates new ball pool
// newBallPool :: () -> ()
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

// PARTICLES //


// Create a pool to pull particles from
// newParticlePool :: Maybe Int -> Pool
function newParticlePool (max = 50) {
  return kontra.pool({
    // create a new sprite every time the pool needs new objects
    create: kontra.sprite,  
    maxSize: max,
    fill: true,
  });
}


// Creates a group of particles
// createParticles :: Pool -> Int -> Sprite -> ()
function createParticles (pool, amount, barycenter) {
  for (let i = 0; i < amount; i++) {
    pool.get({
      type: 'particle',
      barycenter: barycenter, // keep track if it is stuck to something
      anchor: {
        x: 0.5,
        y: 0.5,
      },
      x: barycenter.x + (2 - Math.random() * 4),
      y: barycenter.y + (2 - Math.random() * 4),
      dx: 2 - Math.random() * 4,
      dy: 2 - Math.random() * 4,
      maxDx: 10,
      maxDy: 10,
      ttl: Infinity,
      color: PARTICLE_COLOR,
      width: 3,
      height: 3,
      update: particleGravity,
      render: particleRender,
    });
  }
  // Keep particles contained so they don't fly too far away
  // This keeps them just off screen so they don't clump up and look weird
  pool.getAliveObjects().forEach((particle) => {
    particle.position.clamp(-50, -50, CANVAS_WIDTH + 50, CANVAS_HEIGHT + 50);
  })
}



// TOUCH BUTTONS //

// Create left button sprite for touch input
// createLeftButton :: Sprite -> Sprite
function createLeftButton(p) {
  return kontra.sprite({
    type: 'button',
    action: 'left',
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    x: CANVAS_WIDTH / 4,
    y: CANVAS_HEIGHT / 2,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: CANVAS_WIDTH / 2,
    height: CANVAS_HEIGHT,
    onDown: movePaddleLeft(p),
    onUp: stopPaddle(p),
    render: renderButton,
  });
}

// Create right button sprite for touch input
// createRightButton :: Sprite -> Sprite
function createRightButton(p) {
  return kontra.sprite({
    type: 'button',
    action: 'right',
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    x: CANVAS_WIDTH * (3 / 4),
    y: CANVAS_HEIGHT / 2,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: CANVAS_WIDTH / 2,
    height: CANVAS_HEIGHT,
    fill: true,
    onDown: movePaddleRight(p),
    onUp: stopPaddle(p),
    render: renderButton,
  });
}

// Create Middle button sprite for touch input
// createMiddleButton :: Pool -> Sprite
function createMiddleButton(balls) {
  return kontra.sprite({
    type: 'button',
    action: 'launch',
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: 0,
    dy: 0,
    ttl: Infinity,
    width: CANVAS_WIDTH / 4,
    height: CANVAS_HEIGHT,
    fill: false,
    onDown: launchBall(balls.getAliveObjects()[0]),
    onUp: disableLaunch,
    render: renderButton,
  });
}



/* #endregion */


// ------------------------------------------------------- //
// -------------------RENDER FUNCTIONS-------------------- //
// ------------------------------------------------------- //
/* #region */

// Renders ball of this.radius in this.color
// renderBall :: () -> ()
function renderBall() {
  this.context.fillStyle = this.color;
  this.context.beginPath();
  this.context.arc(this.x, this.y, this.radius - 3, 0, 2 * Math.PI);
  this.context.fill();
}

// Transparent render for buttons
// renderButton :: () -> ()
function renderButton () {
  this.context.fillStyle = 'rgba(0,250,0,1)';
}

// Basic render for particles
// particleRender :: () -> ()
function particleRender () {
  this.context.fillStyle = this.color;
  this.context.fillRect(this.x, this.y, this.height, this.width);
};


/* #endregion */


// ------------------------------------------------------- //
// ----------------------ANIMATIONS----------------------- //
// ------------------------------------------------------- //
/* #region */


// paddle onHit animation/sounds
// paddleBounce :: () -> ()
function paddleBounce() {
  playPaddleSound();
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
// brickBounce :: Sprite -> ()
function brickBounce (hitLocation) {
  playChirpSound();
  const thisObject = this;
  const xOffset = 10 * Math.random() + 10;
  const yOffset = 10 * Math.random() + 10;
  const xDirection = hitLocation.dx >= 0 ? 1 : -1;
  const yDirection = hitLocation.dy >= 0 ? 1 : -1;
  const startX = this.originalX;
  const startY = this.originalY;
  // Movement based on hits left
  const endx = startX + (xDirection * xOffset * (1 / this.hits));
  const endy = startY + (yDirection * yOffset * (1 / this.hits));


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
// dropDown :: Int -> ()
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

    // Level 2
    case 2:
      startNextSong(level2);
      levelTwo(bricks);
      break;

    // Level 3
    case 3:
      startNextSong(level3);
      levelThree(bricks);
      break;

    // Level 4
    case 4:
      startNextSong(level4);
      levelFour(bricks);
      break;

    // Level 5
    case 5:
      startNextSong(level5);
      levelFive(bricks);
      break;

    // Level 6
    case 6:
      stopMusic();
      levelSix(bricks);
      break;

    // WIN!
    default:
      // Add win music here
      loop.stop();
      gameStates.win();
      break;
  }

  bricks.getAliveObjects().forEach((brick) => {
    brick.onSpawn(500);
  });
  updateLevelDisplay(level);
  playDropSound(500);
  return level;
}

// LEVEL 1 EASY MODE TO DEBUG
// levelOne :: Pool -> ()
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
// levelOne :: Pool -> ()
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
// levelTwo :: Pool -> ()
function levelTwo (pool) {
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
// levelThree :: Pool -> ()
function levelThree (pool) {
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
// levelFour :: Pool -> ()
function levelFour (pool) {
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
// levelFive :: Pool -> ()
function levelFive (pool) {
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
// levelSix :: Pool -> ()
function levelSix (pool) {
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



// ------------------------------------------------------- //
// -------------------DEBUG FUNCTIONS--------------------- //
// ------------------------------------------------------- //
/* #region */

// Paddle update that auto moves for debugging!
// debugAutoMove :: Sprite -> ()
function debugAutoMove(ball) {
  this.x = ball.x;
  this.top = this.y - this.height / 2 - 1;
  this.bottom = this.y + this.height / 2 + 1;
  this.left = this.x - this.width / 2 + 1;
  this.right = this.x + this.width / 2 - 1;
}

/* #endregion */


// ------------------------------------------------------- //
// -------------------MISC FUNCTIONS---------------------- //
// ------------------------------------------------------- //
/* #region */

// Make initial empty highScore array if none exists
// initializeHighScores :: () -> ()
function initializeHighScores() {
  // console.log(localStorage.getItem('highScores'));
  if (localStorage.getItem('highScores') === null) {
    kontra.store.set('highScores', []);
  } else {
    displayHighScore(kontra.store.get('highScores'));
  }
}

// Add current score if in the top 3
// updateHighScore :: Int -> ()
function updateHighScores (score) {
  // Add current score, sort, then remove lowest (to keep only 3)
  const currentHighScores = kontra.store.get('highScores');
  // console.log(currentHighScores);
  currentHighScores.push(score);
  currentHighScores.sort((a, b) => b - a);

  // If more than 3 then remove lowest one
  if (currentHighScores.length > 3) {
    currentHighScores.pop();
  }

  displayHighScore(currentHighScores);

  // update local storage
  kontra.store.set('highScores', currentHighScores);
}

// Show high scores for the user
// displayHighScore :: [Int] -> ()
function displayHighScore (highScores) {
  // Select high score element
  const scoreList = document.getElementById('highscore-list');

  // Remove all child nodes (there will only be 3 so not worth only updating)
  // Maybe change this if a large list of high scores is kept
  while(scoreList.firstChild) {
    scoreList.removeChild(scoreList.firstChild);
  }
  // Add the top three
  highScores.forEach((score) => {
    const newScore = document.createElement('li');
    newScore.classList.add('highscore-item');
    console.log(score);
    newScore.textContent = score;
    scoreList.appendChild(newScore);
  })

}

function showTouchButtons () {
  const controls = document.querySelector('#controls');
  controls.classList.remove('hide-controls');
  controls.classList.add('show-controls');
  if (window.screen.height < 850) {
    controls.style.height = `${window.screen.height - 26 - CANVAS_HEIGHT}px`;
  }
}

function hideTouchButtons () {
  document.querySelector('#controls').classList.add('hide-controls');
  document.querySelector('#controls').classList.remove('show-controls');
}

function addTouchEventListeners (left, right, middle, stop) {
  document.querySelector('.left').addEventListener('pointerdown', left);
  document.querySelector('.left').addEventListener('pointerup', stop);
  document.querySelector('.right').addEventListener('pointerdown', right);
  document.querySelector('.right').addEventListener('pointerup', stop);
  document.querySelector('.middle').addEventListener('pointerdown', function handle(e) {
    e.target.removeEventListener('pointerdown', handle);
    middle();
  });
}

function removeTouchEventListeners (left, right, stop) {
  document.querySelector('.left').removeEventListener('pointerdown', left);
  document.querySelector('.left').removeEventListener('pointerup', stop);
  document.querySelector('.right').removeEventListener('pointerdown', right);
  document.querySelector('.right').removeEventListener('pointerup', stop);
}

function updateMiddleTouchButton (newFunction) {
  document.querySelector('.middle').addEventListener('pointerdown', function handle(e) {
    e.target.removeEventListener('pointerdown', handle);
    newFunction();
  });
}
// pointerdown
// pointerup

/* #endregion */
