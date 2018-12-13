/* eslint-disable */

// ------------------------------------------------------- //
// ------------------------GLOBALS------------------------ //
// ------------------------------------------------------- //
/* #region */
const FPS = 120;
const BRICKHEIGHT = 15;
const BRICKWIDTH = 50;
const PADDLEWIDTH = 80;
const PADDLEHEIGHT = 10;
const CANVASHEIGHT = 600;
const CANVASWIDTH = 400;
let BALLRESERVE;
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

  BALLRESERVE = 3;
  SCORE = 0;

  // QUADTREE FOR COLLISION DETECTION //
  const collidableObjects = kontra.quadtree();
  // collidableObjects.maxObjects = 10;

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
    type: 'blackhole',
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

  const ballPool = kontra.pool({
    create: kontra.sprite,
    maxSize: 10,
    fill: true,
  });

  ballPool.get({
    type: 'ball',
    combo: 0,
    attached: paddle, // keep track if it is stuck to something
    fix: true, // temp fix for kontra bug
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
  ballPool.render();

  showBottomDisplay();

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
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        x: startX + BRICKWIDTH / 2,        // starting x,y position of the sprite
        y: startY + BRICKHEIGHT / 2,
        dx: 0,
        dy: 0,
        width: BRICKWIDTH,
        height: BRICKHEIGHT,
        top: startY - BRICKHEIGHT - 1, 
        bottom: startY + BRICKHEIGHT + 1,
        left: startX - BRICKWIDTH - 1,
        right: startX + BRICKWIDTH + 1,
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

  GAMELOOP = kontra.gameLoop({  // create the main game loop
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
      ballPool.update(dt, collidableObjects);


      // If all bricks are gone then go to win state
      if (brickPool.getAliveObjects().length <= 0) {
        this.stop();
        gameStates.win();
      }

      // If all balls die then check for lose or start another ball
      if (ballPool.getAliveObjects().length <= 0) {
        BALLRESERVE -= 1;
        if (BALLRESERVE <= 0) {
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
          fix: true, // temp fix for kontra bug
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
  lives.textContent = BALLRESERVE - 1;
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
  lives.textContent = BALLRESERVE - 1;
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
      this.dy = -6;
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

    const udt = dt * (closestMagnitude / magnitude(p2.nx, p2.ny));
    this.advance(udt);

    // this.x = closest.point.x;
    // this.y = closest.point.y;

    switch (closest.item.type) {
      case 'paddle':
        // IF THE PADDLE IS HIT //
        // Reset combo when paddle is hit
        this.combo = 0;

        // Paddle bounce
        bounceDown([closest.item], 6, 2);

        switch (closest.point.d) {
          case 'left':
          case 'right':
            this.dy = p2.dy;
            this.dx = -p2.dx;
            break;

          // MAGIC NUMBERS
          // NEED TO ADD DIFFERENT ANGLES DEPENDING ON PADDLE MOVEMENT
          // Edges of paddle bounce ball back instead of reflecting exact angles
          case 'top':
          case 'bottom':
            if (closest.point.x > (closest.item.x + closest.item.width / 4 * 3)) {
              this.dx = Math.abs(p2.dx); // + 1
              this.dy = -p2.dy; // + 2
              // this.ddx +=  0.5;
            } else if (closest.point.x >= (closest.item.x + closest.item.width / 4)) {
              this.dx = p2.dx;
              this.dy = -p2.dy;
            } else {
              this.dx = -1 * Math.abs(p2.dx); // -1
              this.dy = -p2.dy; // + 2
              // this.ddx -= 0.5;
            }
            break;
        }
        break;

      case 'brick':
        // IF A BRICK IS HIT //
        // Reduce its hitcount and add to combo
        closest.item.hits -= 1;
        this.combo += 1;

        if (collidableObjects.objects.length === 0) {
          collidableObjects.subnodes.forEach((subnode) => {
            const bricks = subnode.objects.filter(n => n.type === 'brick')
            jiggle(bricks);
            bounceDown(bricks, 1);
          })
        } else {
          const bricks = collidableObjects.objects.filter(n => n.type === 'brick')
          jiggle(bricks);
          bounceDown(bricks, 0.5, 0.5);
        }


        //// RANDOM SCORE UNTIL FORMULA IS MADE
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
      case 'blackhole':
        this.ttl = 0;
        return;
    }
    // ----------------------------------------- //


    // How much time did it take to get to first collision?
    // var udt = dt * (closestMagnitude / magnitude(p2.nx, p2.ny));
    // Run collision recursively if there is time left
    return this.update(dt - udt, collidableObjects);
  }

  // Update ball position after all collisions have been resolved
  // this.x = p2.x;
  // this.y = p2.y;
  this.advance(dt * FPS);
  // this.dx = p2.dx;
  // this.dy = p2.dy;
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


// ------------------------------------------------------- //
// ----------------------ANIMATIONS----------------------- //
// ------------------------------------------------------- //
/* #region */


function bounceDown(objects, speed = 5, distance = 1) {
  objects.forEach((object) => {

  object.y += 1;
  for (let i = 1; i <= 10; i++) {
    setTimeout(() => {
      object.y += distance;
    }, i*speed)
    setTimeout(() => {
      object.y -= distance;
    }, i*speed + 50)
  }
  setTimeout(() => {
    object.y -= distance;
  }, 1000)
  });
}

function jiggle(objects, speed = 2.5) {
  const angleIncrement = degToRad(1);
  objects.forEach((object) => {
    object.rotation += angleIncrement;
    for (let i = 1; i <= 10; i++) {
      setTimeout(() => {
        object.rotation += angleIncrement;
      }, i * 2.5)
      setTimeout(() => {
        object.rotation -= angleIncrement;
      }, i * 2.5 + 25)
    }
    setTimeout(() => {
      object.rotation -= angleIncrement;
    }, 50)

    setTimeout(() => {
      object.rotation -= angleIncrement;
    }, 50);

    for (let i = 1; i <= 10; i++) {
      setTimeout(() => {
        object.rotation -= angleIncrement;
      }, i * 2.5 + 50)
      setTimeout(() => {
        object.rotation += angleIncrement;
      }, i * 2.5 + 52.5)
    }
    setTimeout(() => {
      object.rotation += angleIncrement;
    }, 100)

  })
}

function degToRad (deg) {
  return deg * Math.PI / 180;
}



/* #endregion */

