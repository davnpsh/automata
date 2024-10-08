import { RegExp, SyntaxTreeNode } from "./regex";
import {
  State,
  Automaton,
  TransitionsTable,
  AutomatonConfig,
} from "./automaton";

export class NFA extends Automaton {
  /**
   * The regular expression
   */
  public regexp!: RegExp;
  /**
   * The transition table of the DFA.
   */
  public transitions!: TransitionsTable;

  constructor(expression: string, config?: AutomatonConfig) {
    super(expression, config);
    this.generateTransitionsTable();
  }

  /**
   * Build the NFA from the syntax tree using Thompson's construction.
   * https://en.wikipedia.org/wiki/Thompson%27s_construction
   * @param expression - The regex expression to be converted to NFA
   */
  protected build(expression: string): [State, State[]] {
    const empty_symbol: string = this.empty_symbol;

    function generateGraph(st_node: SyntaxTreeNode, initial_state: State) {
      let letter: string,
        next_state: State,
        last_state: State,
        last_states: Array<State>,
        prev_state: State,
        accept_state: State;

      switch (st_node.type) {
        case "empty":
          accept_state = new State(++label);

          initial_state.addNext(empty_symbol, accept_state);

          // Return accept state
          return accept_state;

        //
        // (initial_state) ----- a -----> (accept_state)
        case "text":
          letter = st_node.text as string;
          accept_state = new State(++label);

          initial_state.addNext(letter, accept_state);

          // Return accept state
          return accept_state;

        //
        // (initial_state) ----- ϵ -----> (next_state)...(sub-automaton)... ----- ϵ -----> (accept_state)
        case "or":
          last_states = [];

          for (let part of st_node.parts as Array<SyntaxTreeNode>) {
            next_state = new State(++label);
            initial_state.addNext(empty_symbol, next_state);
            // Resolve sub-automaton
            last_state = generateGraph(part, next_state) as State;
            last_states.push(last_state);
          }

          accept_state = new State(++label);

          for (let state of last_states) {
            state.addNext(empty_symbol, accept_state);
          }

          return accept_state;

        //
        // (initial_state) ...(sub-automaton).. ...(sub-automaton).. ... (accept_state)
        case "cat":
          prev_state = initial_state;

          for (let part of st_node.parts as Array<SyntaxTreeNode>) {
            prev_state = generateGraph(part, prev_state) as State;
          }

          return prev_state;

        //
        case "star":
        case "plus":
        case "optional":
          // (initial_state) ----- ϵ -----> (temp_initial_state)
          let temp_initial_state = new State(++label);
          initial_state.addNext(empty_symbol, temp_initial_state);

          // Resolve sub-automaton
          let temp_accept_state = generateGraph(
            st_node.sub as SyntaxTreeNode,
            temp_initial_state,
          ) as State;

          // Only for "star" or "plus"
          if (st_node.type == "star" || st_node.type == "plus") {
            // (temp_accept_state) ----- ϵ -----> (temp_initial_state)
            temp_accept_state.addNext(empty_symbol, temp_initial_state);
          }

          accept_state = new State(++label);

          // (temp_last_state) ----- ϵ -----> (accept_state)
          temp_accept_state.addNext(empty_symbol, accept_state);

          // Only for "star" and "optional"
          if (st_node.type == "star" || st_node.type == "optional") {
            // (initial_state) ----- ϵ -----> (accept_state)
            initial_state.addNext(empty_symbol, accept_state);
          }

          return accept_state;
      }
    }

    // RegExp object
    this.regexp = new RegExp(expression, this.empty_symbol);

    // Regex syntax tree
    const st = this.regexp.syntax_tree;

    // Global labeling
    let label = 0;

    const initial_state = new State(label),
      // There will be always only 1 accept state in a NFA
      accept_states = [generateGraph(st, initial_state) as State];

    return [initial_state, accept_states];
  }

  /**
   * Enclose the automaton with states. By default, the enclosure is done with empty symbol transitions.
   * @param T - The state or states to be enclosed
   * @param symbol - The symbol to be used for enclosure
   * @returns The set of states reachable from the given states
   */
  public enclosure(
    T: State | State[],
    symbol: string = this.empty_symbol,
  ): State[] {
    const reacheable_states = new Set<State>();

    // Use depth-first search algorithm
    function DFS(state: State) {
      if (reacheable_states.has(state)) return;
      reacheable_states.add(state);

      for (const edge of state.next) {
        if (edge.symbol == symbol) {
          DFS(edge.to);
        }
      }
    }

    // Check if T is an array or a single state
    if (Array.isArray(T)) {
      for (const state of T) {
        DFS(state);
      }
    } else {
      DFS(T);
    }

    return Array.from(reacheable_states);
  }

  protected generateTransitionsTable(): void {
    const empty_symbol = this.empty_symbol;
    this.transitions = new TransitionsTable();
    const visited = new Set();

    // Use depth-first search algorithm
    function DFS(transitions: TransitionsTable, state: State) {
      if (visited.has(state)) return;
      visited.add(state);

      if (state.next.length == 0) {
        transitions.add(state.label.toString());
      }

      for (const edge of state.next) {
        transitions.add(
          state.label.toString(),
          edge.symbol,
          edge.to.label.toString(),
          empty_symbol,
        );

        DFS(transitions, edge.to);
      }
    }

    DFS(this.transitions, this.initial_state);
  }
}
