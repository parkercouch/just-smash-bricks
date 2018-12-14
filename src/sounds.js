/* eslint-disable */

/* TINY MUSIC ENABLED SOUNDS! */

// create the audio context
const ac = typeof AudioContext !== 'undefined' ? new AudioContext : new webkitAudioContext;
  // get the current Web Audio timestamp (this is when playback should begin)
let when = ac.currentTime;
  // set the tempo
const tempo = 60;
  // initialize some vars
  // create an array of "note strings" that can be passed to a sequence

const lead = [
  'C4   e', 'C4   e', 'C4   e', 'C4   e', 'C#4  e', 'C#4  e', 'C#4  e', 'C#4  e',

  'C#4  e', 'E5   e', 'E5   e', 'E5   e', 'E5   e', 'E5   e', 'E5   e', '-    e',
  
  '-    e', '-    e', 'F#6  es', 'F#6  s', '-    e', 'C#6  s', '-    es', '-    e',

  '-    e', '-    e', 'C#5  s', 'C#3  s', '-    q', '-    e', '-    e', '-    e',

  '-    e', '-    e', 'C#4  s', 'C#2  s', 'C#1  q', '-    e', '-    e', '-    e',

];

const harmony = [
  '-   e', 'C#4 e', 'C#3 e', 'C#4 e', '-   e', '-   e', 'C#2 e', '-   e',

  '-   e', 'C#4 e', 'C#3 e', 'C#4 e', '-   e', '-   e', 'C#2 e', '-   e',

  '-   e', 'C#4 e', 'C#3 e', 'C#4 e', '-   e', '-   e', 'C#2 e', '-   e',

  '-   e', 'C#4 e', 'C#3 e', 'C#4 e', '-   e', '-   e', 'C#2 e', '-   e',

  '-   e', 'C#4 e', 'C#3 e', 'C#4 e', '-   e', '-   e', 'C#2 e', '-   e',

  '-   e', 'C#4 e', 'C#3 e', 'C#4 e', '-   e', '-   e', 'C#2 e', '-   e',
];

const harmony2 = [
  '-   e', '-   s', 'F#2 es', 'C#4 s', 'C#2 e', 'F#1 e', '-   es', 'C#2 s', '-   s',

  '-   e', '-   s', 'F#2 es', 'C#4 s', 'C#2 e', 'F#1 e', '-   es', 'C#2 s', 'C#1 s',

  '-   e', '-   s', 'F#2 es', 'C#4 s', 'C#2 e', 'F#1 e', '-   es', 'C#2 s', '-   s',

  '-   e', '-   s', 'F#2 es', 'C#4 s', 'C#2 e', 'F#1 e', '-   es', 'C#2 s', 'C#1 s',

  '-   e', '-   s', 'F#2 es', 'C#4 s', 'C#2 e', 'F#1 e', '-   es', 'C#2 s', '-   s',

  '-   e', '-   s', 'F#2 es', 'C#4 s', 'C#2 e', 'F#1 e', '-   es', 'C#2 s', '-   s',
];

const bass2 = [
  '-   e', '- e', '- e', '- e', '-   e', '-   e', '- e', '-   e',

  '-   e', '- e', '- e', '- e', '-   e', '-   e', '- e', '-   e',

  '-   e', '- e', '- e', '- e', '-   e', '-   e', '- e', '-   e',

  '-   e', '- e', '- e', '- e', '-   e', '-   e', '- e', '-   e',

  '-   e', '- e', '- e', '- e', '-   e', '-   e', '- e', '-   e',

  '-   e', '- e', '- e', '- e', '-   e', '-   e', '- e', '-   e',
];


const bass = [
  'C3  q',          '-   h',                            'E3   q',

  'G2  q',          '-   h',                            'F#2  q',

  'A#2 q',          '-   h',                            'C#2  q',

  'C2  q',          '-   h',                            'E2   q',

  'G2  q',          '-   h',                            'C#2  q',

  'A#1 q',          '-   h',                            'C#2  q',
];

const beep = [
  'C#2  0.0125', 'C#1 0.0125'
];

const highBeep = [
  'C#5  0.0125', 'C#2 0.0125'
];

// create 3 new sequences (one for lead, one for harmony, one for bass)
const sequence1 = new TinyMusic.Sequence( ac, tempo, lead );
const sequence2 = new TinyMusic.Sequence( ac, tempo, harmony );
const sequence3 = new TinyMusic.Sequence( ac, tempo, bass );
const sequence4 = new TinyMusic.Sequence( ac, tempo, harmony2);
const bassSequence2 = new TinyMusic.Sequence( ac, tempo, bass2);
const beepSound = new TinyMusic.Sequence( ac, tempo, beep);
const highBeepSound = new TinyMusic.Sequence( ac, tempo, highBeep);

// set staccato and smoothing values for maximum coolness
sequence1.staccato = 0.65;
sequence2.staccato = 0.55;
sequence3.staccato = 0.05;
sequence3.smoothing = 0.3;
sequence4.staccato = .30;
// sequence4.smoothing = 0.1;
bassSequence2.staccato = 0.1;
bassSequence2.smoothing = 0.4;

beepSound.staccato = 0.65;
beepSound.gain.gain.value = 1.0 / 6;
beepSound.loop = false;

highBeepSound.staccato = 0.65;
highBeepSound.gain.gain.value = 1.0 / 6;
highBeepSound.loop = false;

// adjust the levels so the bass and harmony aren't too loud
sequence1.gain.gain.value = 1.0 / 8;
sequence2.gain.gain.value = 0.8 / 8;
sequence3.gain.gain.value = 0.65 / 8;
sequence4.gain.gain.value = 0.9 / 8;
bassSequence2.gain.gain.value = 0.65 / 8;

// apply EQ settings
sequence1.mid.frequency.value = 800;
sequence1.mid.gain.value = 3;
sequence2.mid.frequency.value = 1200;
sequence3.mid.gain.value = 3;
sequence3.bass.gain.value = 6;
sequence3.bass.frequency.value = 80;
sequence3.mid.gain.value = -6;
sequence3.mid.frequency.value = 500;
sequence3.treble.gain.value = -2;
sequence3.treble.frequency.value = 1400;
sequence4.bass.gain.value = 8;
sequence4.bass.frequency.value = 100;
bassSequence2.mid.gain.value = 3;
bassSequence2.bass.gain.value = 6;
bassSequence2.bass.frequency.value = 80;
bassSequence2.mid.gain.value = -6;
bassSequence2.mid.frequency.value = 500;
bassSequence2.treble.gain.value = -2;
bassSequence2.treble.frequency.value = 1400;

// sequence4.createCustomWave([-1,0,1,0,-1,0,1]);
sequence4.createCustomWave([-1,-0.9,-0.6,-0.3, 0, 0.3, 0.6, 0.9,1]);
// sequence4.waveType('sine');


// play
function playMusic() {
  when = ac.currentTime;
  //start the lead part immediately
  // sequence1.play( when + ( 60 / tempo) * 24 );
  // delay the harmony by 16 beats
  // sequence2.play( when + ( 60 / tempo ) * 48 );
  // sequence2.play( when );
  // start the bass part immediately
  sequence3.play( when );
  // sequence4.play( when );
  // sequence4.play( when + ( 60 / tempo ) * 72 );
}

function startSequence(sequence, time) {
  sequence.play( time );
}

function stopSequence(sequence) {
  sequence.stop();
}

// pause
function stopMusic() {
  sequence1.stop();
  sequence2.stop();
  sequence3.stop();
}

function playBeepSound() {
  beepSound.play( ac.currentTime );
}

function playHighBeepSound() {
  highBeepSound.play( ac.currentTime );
}