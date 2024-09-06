// Automaton definitions

export class State {
  public label: number;
  public next: Array<Edge>;

  constructor(label: number) {
    this.label = label;
    this.next = [];
  }

  /**
   * Add a new edge to the state
   */
  addNext(letter: string, state: State) {
    let edge = new Edge(letter, state);
    this.next.push(edge);
  }
}

class Edge {
  public letter: string;
  public to: State;

  constructor(letter: string, to: State) {
    this.letter = letter;
    this.to = to;
  }
}

export abstract class Automaton {
  public initial_state: State;
  public accept_state: State;

  constructor(regex: string) {
    [this.initial_state, this.accept_state] = this.build(regex);
  }

  abstract build(regex: string): [State, State];
}
