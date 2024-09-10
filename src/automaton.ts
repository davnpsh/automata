/**
 * Transition definition
 */
interface Transition {
  /**
   * The state from which the transition is made
   */
  from: State;
  /**
   * The symbol of the alphabet associated with the transition
   */
  symbol?: string;
}

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

  /**
   * Move the automaton with states.
   * @param T - The state or states to be enclosed
   * @param symbol - The symbol to be used for the move
   * @returns The set of states reachable from the given states
   */
  public move(T: State | State[], symbol: string): State[] {
    const reacheable_states = new Set<State>();

    function lookUp(state: State) {
      for (const edge of state.next) {
        if (edge.symbol == symbol) {
          reacheable_states.add(edge.to);
        }
      }
    }

    // Check if T is an array or a single state
    if (Array.isArray(T)) {
      for (const state of T) {
        lookUp(state);
      }
    } else {
      lookUp(T);
    }

    return Array.from(reacheable_states);
  }

  /**
   * Test the automaton with a string
   * @param string - The string to be tested
   * @returns The set of routes to accept states
   */
  public test(string: string) {
    let accept: boolean = false;

    const routes: Array<Array<Transition>> = [];
    /**
     * @param state - The state to be tested
     * @param sub - The string to be tested
     */
    function traverse(
      state: State,
      sub: string,
      path: Array<Transition> = [],
    ): void {
      let transition: Transition = { from: state };
      // Add itself to the path
      path.push(transition);

      // If there is no more string left to check
      // or there are no more states to go to
      if (sub.length == 0 || state.next.length == 0) {
        routes.push(path);
        // Mark the flag as string accepted
        accept = true;
        return;
      }

      for (const edge of state.next) {
        // If there is somewhere to go
        if (edge.symbol == sub[0] || edge.symbol == "ϵ") {
          // Complete the rest of the transition
          transition.symbol = edge.symbol;
          const newSub = edge.symbol == "ϵ" ? sub : sub.slice(1);
          traverse(edge.to, newSub, path.slice());
        }
      }
    }

    traverse(this.initial_state, string);

    return { accept: accept, routes: routes };
  }
}
