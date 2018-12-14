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
const bass = [
  'C3  q',          '-   h',                            'E3   q',

  'G2  q',          '-   h',                            'F#2  q',

  'A#2 q',          '-   h',                            'C#2  q',

  'C2  q',          '-   h',                            'E2   q',

  'G2  q',          '-   h',                            'C#2  q',

  'A#1 q',          '-   h',                            'C#2  q',
];

// create 3 new sequences (one for lead, one for harmony, one for bass)
const sequence1 = new TinyMusic.Sequence( ac, tempo, lead );
const sequence2 = new TinyMusic.Sequence( ac, tempo, harmony );
const sequence3 = new TinyMusic.Sequence( ac, tempo, bass );

// set staccato and smoothing values for maximum coolness
sequence1.staccato = 0.55;
sequence2.staccato = 0.55;
sequence3.staccato = 0.05;
sequence3.smoothing = 0.4;

// adjust the levels so the bass and harmony aren't too loud
sequence1.gain.gain.value = 1.0 / 8;
sequence2.gain.gain.value = 0.8 / 8;
sequence3.gain.gain.value = 0.65 / 8;

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

// play
function playMusic() {
  when = ac.currentTime;
  //start the lead part immediately
  sequence1.play( when );
  // delay the harmony by 16 beats
  sequence2.play( when + ( 60 / tempo ) * 16 );
  // start the bass part immediately
  sequence3.play( when );
}

// pause
function stopMusic() {
  sequence1.stop();
  sequence2.stop();
  sequence3.stop();
}
