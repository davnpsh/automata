import { Automaton, State, TransitionsTable } from "./automaton";
import { NFA } from "./nfa";
import { equalStates } from "./helper";

export interface StateD {
  label: string;
  states: State[];
  marked: boolean;
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

  /**
   * Clones the states table
   * @returns The cloned states table
   */
  public clone(): StatesTable {
    const new_table: StatesTable = new StatesTable();

    for (const entry of this.table) {
      const new_entry = { ...entry, states: [...entry.states] };
      new_table.table.add(new_entry);
    }

    return new_table;
  }
}

export abstract class DFA extends Automaton {
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

  protected lookUp(label: string, states: Set<State>): State | null {
    for (const state of states) {
      if (state.label == label) return state;
    }

    return null;
  }

  /**
   * Generate the graph from the states and transitions tables.
   * @returns The states of the graph.
   */
  protected generateGraph(): Set<State> {
    const symbols = this.NFA.regexp.symbols;

    // Generate all states
    const new_states = new Set<State>();
    for (const entry of this.states.table) {
      new_states.add(new State(entry.label));
    }

    // Link them
    for (const entry of this.transitions.table) {
      const state: State = this.lookUp(entry.label, new_states) as State;

      // Much better method to avoid null values
      entry.transitions.forEach((label, symbol) => {
        const next_state = this.lookUp(label as string, new_states) as State;
        state.addNext(symbol, next_state);
      });
    }

    return new_states;
  }

  /**
   * Initialize initial and accept states.
   * @param graph_states - The states of the graph.
   * @returns The initial and accept states.
   */
  protected abstract initializeStates(
    graph_states: Set<State>,
  ): [State, State[]];
}
