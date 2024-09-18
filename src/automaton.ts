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

export interface TransitionD {
  label: string;
  transitions: Map<string, string>;
}

export class TransitionsTable {
  /**
   * The transition table of the DFA.
   */
  public table: Set<TransitionD>;

  constructor() {
    this.table = new Set();
  }

  /**
   * Check if the transition table contains an entry.
   * @param label - The label of the transition.
   * @returns The entry or null if it doesn't exist.
   */
  public get(label: string): TransitionD | null {
    for (const row of this.table) {
      if (row.label == label) return row;
    }

    return null;
  }

  /**
   * Check if the transition table contains an entry.
   * @param T - The origin label of the transition.
   * @param symbol - The symbol of the transition.
   * @param U - The destiny label of the transition.
   */
  public add(T: string, symbol?: string, U?: string): void {
    // Check if the entry already exists
    let entry = this.get(T);

    // If not, add the new entry
    if (entry === null) {
      entry = { label: T, transitions: new Map() };
      this.table.add(entry);
    }

    if (symbol && U)
      // Add the new transition
      entry.transitions.set(symbol, U);
  }

  /**
   * Clones the transition table
   * @returns The cloned transition table
   */
  public clone(): TransitionsTable {
    const new_table: TransitionsTable = new TransitionsTable();

    for (const entry of this.table) {
      const new_transitions = new Map<string, string>(entry.transitions);

      const new_entry: TransitionD = {
        label: entry.label,
        transitions: new_transitions,
      };

      new_table.table.add(new_entry);
    }

    return new_table;
  }
}

export interface AutomatonConfig {
  /**
   * Custom epsilon symbol
   */
  empty_symbol?: string;
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
  /**
   * The automaton configuration
   */
  protected config: AutomatonConfig | undefined;
  /**
   * The epsilon symbol to be used in the automaton
   */
  protected empty_symbol!: string;

  constructor(data: string, config?: AutomatonConfig) {
    this.config = config;

    this.parseConfig();

    [this.initial_state, this.accept_states] = this.build(data);

    // Mark accept states
    this.accept_states.forEach((state) => (state.accept = true));
  }

  /**
   * @param data Data to build the automaton from
   * @returns [initial_state, accept_state]
   */
  protected abstract build(data: string): [State, State[]];

  /**
   * Parse the automaton configuration
   * @param config - The configuration to be parsed
   */
  protected parseConfig(): void {
    // Custom epsilon symbol
    this.empty_symbol = this.config?.empty_symbol || "ϵ";
  }

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
        classes: state.accept ? "accept" : "",
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

    // Push dummy start node and edge
    states.push({ data: { id: "invisible", label: "" }, classes: "invisible" });
    states.push({
      data: {
        id: "start",
        source: "invisible",
        target: this.initial_state.label,
        label: "start",
      },
    });

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
    const empty_symbol: string = this.empty_symbol;

    if (string.includes(empty_symbol)) {
      throw new Error(
        "String cannot contain character used for empty string on regular expression (" +
          empty_symbol +
          ").",
      );
    }

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
        if (state.accept && sub.length == 0) accept = true;
        return;
      }

      let dead_end = true;
      for (const edge of state.next) {
        // If there is somewhere to go
        if (edge.symbol == sub[0] || edge.symbol == empty_symbol) {
          // There is
          dead_end = false;
          // Complete the rest of the transition
          transition.symbol = edge.symbol;
          const newSub = edge.symbol == empty_symbol ? sub : sub.slice(1);
          traverse(edge.to, newSub, path.slice());
        }
      }
      if (dead_end) {
        routes.push(path);
        return;
      }
    }

    traverse(this.initial_state, string);

    return { accept: accept, routes: routes };
  }
}
