/* eslint-disable */

/* TINY MUSIC ENABLED SOUNDS! */

// create the audio context and set the start time and tempo
const ac = typeof AudioContext !== 'undefined' ? new AudioContext : new webkitAudioContext;
let SONG_START = ac.currentTime;
const tempo = 60;

// Slow Bass
const s1 = [
  'C3  q',          '-   h',                            'E3   q',
  'G2  q',          '-   h',                            'F#2  q',
  'A#2 q',          '-   h',                            'C#2  q',
  'C2  q',          '-   h',                            'E2   q',
  'G2  q',          '-   h',                            'C#2  q',
  'A#1 q',          '-   h',                            'C#2  q',
];

// Lead
const s2 = [
  'C4   e', 'C4   e', 'C4   e', 'C4   e', 'C#4  e', 'C#4  e', 'C#4  e', 'C#4  e',
  'C#4  e', 'E5   e', 'E5   e', 'E5   e', 'E5   e', 'E5   e', 'E5   e', '-    e',
  '-    e', '-    e', 'F#6  es', 'F#6  s', '-    e', 'C#6  s', '-    es', '-    e',
  '-    e', '-    e', 'C#5  s', 'C#3  s', '-    q', '-    e', '-    e', '-    e',
  '-    e', '-    e', 'C#4  s', 'C#2  s', 'C#1  q', '-    e', '-    e', '-    e',
];

// Dissonant harmony
const s3 = [
  '-   e', 'C#4 e', 'C#3 e', 'C#4 e', '-   e', '-   e', 'C#2 e', '-   e',
  '-   e', 'C#4 e', 'C#3 e', 'C#4 e', '-   e', '-   e', 'C#2 e', '-   e',
  '-   e', 'C#4 e', 'C#3 e', 'C#4 e', '-   e', '-   e', 'C#2 e', '-   e',
  '-   e', 'C#4 e', 'C#3 e', 'C#4 e', '-   e', '-   e', 'C#2 e', '-   e',
  '-   e', 'C#4 e', 'C#3 e', 'C#4 e', '-   e', '-   e', 'C#2 e', '-   e',
  '-   e', 'C#4 e', 'C#3 e', 'C#4 e', '-   e', '-   e', 'C#2 e', '-   e',
];

// Bass
const s4 = [
  'C#4 s', 'C#1 s', '- e', '- e', '-   e', '-   e', '- e', '-   e','-   e',
  'C#4 s', 'C#1 s', '- e', '- e', '-   e', '-   e', '- e', '-   e','-   e',
  'C#4 s', 'C#1 s', '- e', '- e', '-   e', '-   e', '- e', '-   e','-   e',
  'C#4 s', 'C#1 s', '- e', '- e', '-   e', '-   e', '- e', '-   e','-   e',
  'C#4 s', 'C#1 s', '- e', '- e', '-   e', '-   e', '- e', '-   e','-   e',
  'C#4 s', 'C#1 s', '- e', '- e', '-   e', '-   e', '- e', '-   e','-   e',
];

// Dissonant harmony
const s5 = [
  '-   e', '-   s', 'F#2 es', 'C#4 s', 'C#2 e', 'F#1 e', '-   es', 'C#2 s', '-   s',
  '-   e', '-   s', 'F#2 es', 'C#4 s', 'C#2 e', 'F#1 e', '-   es', 'C#2 s', 'C#1 s',
  '-   e', '-   s', 'F#2 es', 'C#4 s', 'C#2 e', 'F#1 e', '-   es', 'C#2 s', '-   s',
  '-   e', '-   s', 'F#2 es', 'C#4 s', 'C#2 e', 'F#1 e', '-   es', 'C#2 s', 'C#1 s',
  '-   e', '-   s', 'F#2 es', 'C#4 s', 'C#2 e', 'F#1 e', '-   es', 'C#2 s', '-   s',
  '-   e', '-   s', 'F#2 es', 'C#4 s', 'C#2 e', 'F#1 e', '-   es', 'C#2 s', '-   s',
];

// Create new sequences for each level
const level1 = new TinyMusic.Sequence( ac, tempo, s1 );
const level2 = new TinyMusic.Sequence( ac, tempo, s2 );
const level3 = new TinyMusic.Sequence( ac, tempo, s3 );
const level4 = new TinyMusic.Sequence( ac, tempo, s4 );
const level5 = new TinyMusic.Sequence( ac, tempo, s5 );
// const level6 = new TinyMusic.Sequence( ac, tempo, s6 );

// Level 1
level1.staccato = 0.05;
level1.smoothing = 0.3;
level1.gain.gain.value = 0.8 / 8;
level1.mid.gain.value = 3;
level1.bass.gain.value = 6;
level1.bass.frequency.value = 80;
level1.mid.gain.value = -6;
level1.mid.frequency.value = 500;
level1.treble.gain.value = -2;
level1.treble.frequency.value = 1400;

// Level 2
level2.mid.frequency.value = 800;
level2.mid.gain.value = 3;
level2.gain.gain.value = 0.8 / 8;
level2.staccato = 0.65;

// Level 3
level3.staccato = 0.55;
level3.gain.gain.value = 0.8 / 8;
level3.mid.frequency.value = 1200;

// Level 4
level4.staccato = 0.1;
level4.smoothing = 0.4;
level4.mid.gain.value = 3;
level4.bass.gain.value = 6;
level4.bass.frequency.value = 80;
level4.mid.gain.value = -6;
level4.mid.frequency.value = 500;
level4.treble.gain.value = -2;
level4.treble.frequency.value = 1400;
level4.gain.gain.value = 0.65 / 8;

// Level 5
level5.staccato = .30;
level5.gain.gain.value = 0.9 / 8;
level5.bass.gain.value = 8;
level5.bass.frequency.value = 100;
level5.createCustomWave([-1,-0.9,-0.6,-0.3, 0, 0.3, 0.6, 0.9,1]);


// Level 6
// Silence...


// SFX

// Bounce sound
const beep = [
  'C#2  0.0125', 'C#1 0.0125'
];

// Chirp Sound
const highBeep = [
  'C#5  0.0125', 'C#2 0.0125'
];

const beepSound = new TinyMusic.Sequence( ac, tempo, beep);
const highBeepSound = new TinyMusic.Sequence( ac, tempo, highBeep);

beepSound.staccato = 0.65;
beepSound.gain.gain.value = 1.0 / 6;
beepSound.loop = false;

highBeepSound.staccato = 0.65;
highBeepSound.gain.gain.value = 1.0 / 6;
highBeepSound.loop = false;


// play
function playMusic() {
  // Set Global for other sequences to sync to
  SONG_START = ac.currentTime;
  level1.play( SONG_START );
}

function startNextSong(sequence) {
  sequence.play( SONG_START );
}


// pause
function stopMusic() {
  level1.stop();
  level2.stop();
  level3.stop();
  level4.stop();
  level5.stop();
}

function playBeepSound() {
  beepSound.play( ac.currentTime );
}

function playHighBeepSound() {
  highBeepSound.play( ac.currentTime );
}