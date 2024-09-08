import { Automaton, State } from "./automaton";
import { NFA } from "./nfa";
import { LetterGenerator, equalStates } from "./helper";

interface TransitionD {
  label: string;
  transitions: Map<string, string>;
}

interface StateD {
  label: string;
  states: State[];
  marked: boolean;
}

class TransitionsTable {
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
  public add(T: string, symbol: string, U: string): void {
    // Check if the entry already exists
    let entry = this.get(T);

    // If not, add the new entry
    if (entry === null) {
      entry = { label: T, transitions: new Map() };
      this.table.add(entry);
    }

    // Add the new transition
    entry.transitions.set(symbol, U);
  }
}

class StatesTable {
  /**
   * The states table of the DFA.
   */
  public table: Set<StateD>;

  constructor() {
    this.table = new Set();
  }

  /**
   * Check if the transition table contains an entry.
   * @param states - The states of the transition.
   * @returns The entry or null if it doesn't exist.
   */
  public get(states: State[]): StateD | null {
    for (const row of this.table) {
      if (equalStates(row.states, states)) return row;
    }

    return null;
  }

  /**
   * Add a new state to the states table.
   * @param U - The states to add.
   */
  public add(label: string, U: State[]): void {
    const entry = { label: label, states: U, marked: false };
    this.table.add(entry);
  }

  /**
   * Get an unmarked state from the states table.
   * @returns The unmarked state or null if there is no such state.
   */
  public getUnmarked(): StateD | null {
    for (const row of this.table) {
      if (!row.marked) return row;
    }

    return null;
  }
}

export class uDFA extends Automaton<NFA> {
  /**
   * The non-deterministic finite automaton (NFA) that this unoptimized DFA is based on.
   */
  public NFA!: NFA;
  /**
   * The states table of the DFA.
   */
  public states!: StatesTable;
  /**
   * The transition table of the DFA.
   */
  public transitions!: TransitionsTable;

  constructor(nfa: NFA) {
    super(nfa);
  }

  /**
   * Build the uDFA from the NFA using subset construction.
   * https://en.wikipedia.org/wiki/Powerset_construction
   * @param nfa - The NFA to build the uDFA from.
   */
  protected build(nfa: NFA): [State, State] {
    this.NFA = nfa;

    const symbols = nfa.regexp.symbols;

    /**
     * Subset construction.
     * @returns The states table and the transitions table.
     */
    function subset(): [StatesTable, TransitionsTable] {
      const states = new StatesTable();
      const transitions = new TransitionsTable();

      const labeler = new LetterGenerator();
      let label: string, T_label: string, U_label: string;

      // On start, enclosure-ϵ(s_0) is the only state inside the states table and it is NOT marked.
      label = labeler.next();
      states.add(label, nfa.enclosure(nfa.initial_state));

      while (true) {
        // While there is an unmarked entry in the states table
        const T_entry: StateD | null = states.getUnmarked();

        if (T_entry === null) break;

        // Mark T
        T_entry.marked = true;

        const T: State[] = T_entry!.states;

        for (const symbol of symbols) {
          const U: State[] = nfa.enclosure(nfa.move(T, symbol));

          // Check if U already exists in the states table
          const U_entry: StateD | null = states.get(U);

          // If not, add it
          if (U_entry === null) {
            label = labeler.next();
            // Add U as an unmarked state to the states table
            states.add(label, U);
          }

          T_label = T_entry.label;
          U_label = U_entry === null ? label : U_entry.label;

          // Add U to the transition table
          transitions.add(T_label, symbol, U_label);
        }
      }

      return [states, transitions];
    }

    function generateGraph(
      states: StatesTable,
      transitions: TransitionsTable,
    ): [State, State] {
      // Generate all states
      const new_states = new Set<State>();
      for (const entry of states.table) {
        new_states.add(new State(entry.label));
      }

      function lookUp(label: string): State | null {
        for (const state of new_states) {
          if (state.label == label) return state;
        }

        return null;
      }

      // Link them
      for (const entry of transitions.table) {
        const state: State = lookUp(entry.label) as State;

        for (const symbol of symbols) {
          const next_state: State = lookUp(
            entry.transitions.get(symbol) as string,
          ) as State;
          state.addNext(symbol, next_state);
        }
      }

      // Look for initial and accept states
      let initial_state: State | null = null,
        accept_state: State | null = null;

      for (const entry of states.table) {
        for (const state of entry.states) {
          // Initial
          if (state.label == nfa.initial_state.label) {
            initial_state = lookUp(entry.label) as State;
          }
          // Accept
          if (state.label == nfa.accept_state.label) {
            accept_state = lookUp(entry.label) as State;
          }
        }
      }

      if (initial_state === null || accept_state === null)
        throw new Error(
          "Impossible to find initial or accept states for the uDFA.",
        );

      return [initial_state, accept_state];
    }

    [this.states, this.transitions] = subset();

    return generateGraph(this.states, this.transitions);
  }
}
