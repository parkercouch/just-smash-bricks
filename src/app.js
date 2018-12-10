/* eslint-disable */

document.addEventListener('DOMContentLoaded', function () {
  // console.log('DOM LOADED');
});

var gameStates = new StateMachine({
  init: 'loading',
  transitions: [
    { name: 'finishLoading',     from: 'loading',  to: 'menu' },
    { name: 'start',     from: 'menu',  to: 'game' },
    { name: 'pause',   from: 'game', to: 'paused'  },
    { name: 'unpause',   from: 'paused', to: 'game'  },
    { name: 'quit', from: '*', to: 'menu'    },
  ]
});

// console.log(gameStates.state); // loading
// console.log(gameStates.finishLoading());
// console.log(gameStates.state); // menu
// console.log(gameStates.start());
// console.log(gameStates.state); // game
// console.log(gameStates.pause());
// console.log(gameStates.state); // paused
// console.log(gameStates.unpause());
// console.log(gameStates.state); // game
// console.log(gameStates.quit());
// console.log(gameStates.state); // menu 
// try {
// console.log(gameStates.pause());
// console.log(gameStates.state); // Will not run, there is an exception
// } catch (err) {
//   console.log(err);

// }
// console.log(gameStates.quit());
// console.log(gameStates.state); // menu