// Automaton definitions

export class State {
  /**
   * The state label
   */
  public label: number | string;
  /**
   * The set of outgoing edges
   */
  public next: Array<Edge>;
  /**
   * Is the state an accept state?
   */
  public accept: boolean = false;

  constructor(label: number | string) {
    this.label = label;
    this.next = [];
  }

  /**
   * Add a new edge to the state
   * @param symbol Symbol of the alphabet associeted with the edge
   * @param state State to which the edge is pointing
   */
  public addNext(symbol: string, state: State): void {
    let edge = new Edge(symbol, state);
    this.next.push(edge);
  }
}

class Edge {
  /**
   * The symbol of the alphabet associated with the edge
   */
  public symbol: string;
  /**
   * The state to which the edge is pointing
   */
  public to: State;

  constructor(symbol: string, to: State) {
    this.symbol = symbol;
    this.to = to;
  }
}

export abstract class Automaton {
  /**
   * The initial state of the automaton
   */
  public initial_state: State;
  /**
   * The accept state of the automaton
   */
  public accept_states: State[];

  constructor(data: string) {
    [this.initial_state, this.accept_states] = this.build(data);

    // Mark accept states
    this.accept_states.forEach((state) => (state.accept = true));
  }

  /**
   *
   * @param data Data to build the automaton from
   * @returns [initial_state, accept_state]
   */
  protected abstract build(data: string): [State, State[]];

  /**
   * @returns The set of states and edges in the automaton in a Cytoscape-compatible format
   */
  public cytograph(): object[] {
    const visited = new Set();
    const states: object[] = [];
    const edges: object[] = [];

    // Use depth-first search algorithm
    function DFS(state: State) {
      if (visited.has(state)) return;
      visited.add(state);
      states.push({
        data: { id: state.label, label: state.label },
      });

      for (const edge of state.next) {
        states.push({
          data: {
            source: state.label,
            target: edge.to.label,
            label: edge.symbol,
          },
        });
        DFS(edge.to);
      }
    }

    DFS(this.initial_state);

    return states.concat(edges);
  }
}
