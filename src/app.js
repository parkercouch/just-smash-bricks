/* eslint-disable */

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM LOADED');
  console.log(gameStates.state);
  gameStates.startLoading();
  console.log(gameStates.state);
});


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



  // ------------------------------------------------------- //
  // -------------------STATE MANAGEMENT-------------------- //
  // ------------------------------------------------------- //

const loadAssets = function () {
  kontra.assets.load(...imgAssets, ...sfxAssets)
    .then(() => {
      // all assets have loaded
      console.log('All assets loaded');
    }).catch((err) => {
      // error loading an asset
      console.log(err);
    });
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
    onLoading: loadAssets(), 
  }
});

