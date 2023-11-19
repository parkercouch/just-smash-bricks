// TODO: Replace with actual types
declare module 'javascript-state-machine' {
  export default class StateMachine {
    constructor(options: {
      init: string;
      transitions: {
        name: string;
        from: string;
        to: string;
      }[];
      methods: { [key: string]: () => void };
    });
    [key: string]: () => void;
  }
}
