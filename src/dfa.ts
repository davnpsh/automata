import { Automaton, State } from "./automaton";
import { NFA } from "./nfa";
import { equalStates } from "./helper";

export interface TransitionD {
  label: string;
  transitions: Map<string, string>;
}

export interface StateD {
  label: string;
  states: State[];
  marked: boolean;
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

export class StatesTable {
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

export abstract class DFA extends Automaton<NFA> {
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

  /**
   * Generate the graph from the states and transitions tables.
   */
  protected generateGraph(
    states: StatesTable,
    transitions: TransitionsTable,
  ): [State, State[]] {
    const symbols = this.NFA.regexp.symbols;

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

    // Get initial state
    const initial_state: State = ((): State | null => {
      for (const entry of states.table) {
        for (const state of entry.states) {
          if (state.label == this.NFA.initial_state.label) {
            return lookUp(entry.label) as State;
          }
        }
      }
      return null;
    })() as State;

    // Get accept states
    const accept_states: State[] = [];
    for (const entry of states.table) {
      for (const state of entry.states) {
        // The NFA only has 1 accept state
        if (state.label == this.NFA.accept_states[0].label) {
          accept_states.push(lookUp(entry.label) as State);
        }
      }
    }

    return [initial_state, accept_states];
  }
}
