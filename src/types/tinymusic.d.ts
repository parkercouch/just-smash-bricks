// TODO: Replace with actual types
declare module 'tinymusic' {
  export class Sequence {
    staccato: number;
    smoothing: number;
    gain: GainFreq;
    bass: GainFreq;
    mid: GainFreq;
    treble: GainFreq;
    loop: boolean;
    constructor(audioContext: AudioContext, tempo: number, sequence: string[]);
    play(start: number): void;
    stop(): void;
    createCustomWave(wave: number[]): void;
  }

  type GainFreq = {
    gain: { value: number };
    frequency: { value: number };
  };
}
