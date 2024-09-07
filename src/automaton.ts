// Automaton definitions

export class State {
  public label: number;
  public next: Array<Edge>;

  constructor(label: number) {
    this.label = label;
    this.next = [];
  }

  /**
   *Add a new edge to the state
   * @param symbol Symbol of the alphabet associeted with the edge
   * @param state State to which the edge is pointing
   */
  addNext(symbol: string, state: State) {
    let edge = new Edge(symbol, state);
    this.next.push(edge);
  }
}

class Edge {
  public symbol: string;
  public to: State;

  constructor(symbol: string, to: State) {
    this.symbol = symbol;
    this.to = to;
  }
}

export abstract class Automaton<T> {
  public initial_state: State;
  public accept_state: State;

  constructor(data: T) {
    [this.initial_state, this.accept_state] = this.build(data);
  }

  /**
   *
   * @param data Data to build the automaton from
   * @returns [initial_state, accept_state]
   */
  abstract build(data: T): [State, State];

  /**
   * Return the set of states and edges in the automaton in a Cytoscape-compatible format
   */
  cytograph() {
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
