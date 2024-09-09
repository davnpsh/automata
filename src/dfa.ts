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

      for (const symbol of symbols) {
        const next_state: State = this.lookUp(
          entry.transitions.get(symbol) as string,
          new_states,
        ) as State;
        state.addNext(symbol, next_state);
      }
    }

    return new_states;
  }

  protected abstract initializeStates(
    graph_states: Set<State>,
  ): [State, State[]];
}
