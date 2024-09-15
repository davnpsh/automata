import {
  AutomatonConfig,
  State,
  TransitionD,
  TransitionsTable,
} from "./automaton";
import { DFA, StateD, StatesTable } from "./dfa";
import { equalStates } from "./helper";
import { uDFA } from "./udfa";

class Identifiables {
  public table: Map<string, Set<string>>;

  constructor() {
    this.table = new Map();
  }

  public add(label: string, identical: string) {
    // Check if the Set for the given label already exists
    if (!this.table.has(label)) {
      // If not, create a new Set
      this.table.set(label, new Set<string>());
    }

    // Get the Set for the label and add the identical element
    const set = this.table.get(label);
    if (set) {
      set.add(identical);
    }
  }
}

export class mDFA extends DFA {
  /**
   * The uDFA used to build the mDFA.
   */
  public uDFA!: uDFA;
  /**
   * The equivalent states table converted from the uDFA.
   */
  public equivalent_states!: StatesTable;
  /**
   * The identifiable states of the mDFA.
   */
  public identifiables!: Identifiables;

  constructor(expression: string, config?: AutomatonConfig) {
    super(expression, config);
  }

  /**
   * Build the mDFA from the NFA reducing equivalent states.
   * https://en.wikipedia.org/wiki/DFA_minimization
   * @param nfa - The NFA to build the uDFA from.
   */
  protected build(expression: string): [State, State[]] {
    // Build from uDFA
    const udfa = new uDFA(expression, this.config);

    // Reference base NFA
    this.NFA = udfa.NFA;
    // Reference base uDFA
    this.uDFA = udfa;

    // Equivalent states without removing identical ones
    this.equivalent_states = this.equivalentStates(udfa.states);

    [this.states, this.transitions] = this.reduce(
      this.equivalent_states,
      udfa.transitions,
    );

    const graph_states = this.generateGraph();

    return this.initializeStates(graph_states);
  }

  protected initializeStates(graph_states: Set<State>): [State, State[]] {
    // Initial state
    const initial_state = ((): State | null => {
      // This basically looks for the original initial state of the uDFA and compartes
      for (const entry of this.states.table) {
        if (entry.label == this.uDFA.initial_state.label)
          return this.lookUp(entry.label, graph_states);
      }
      return null;
    })() as State;

    // Accept states
    const accept_states: State[] = [];
    for (const entry of this.states.table) {
      for (const state of entry.states) {
        // The NFA only has 1 accept state
        if (state.label == this.NFA.accept_states[0].label) {
          accept_states.push(this.lookUp(entry.label, graph_states) as State);
        }
      }
    }

    return [initial_state, accept_states];
  }

  /**
   * Reduce the states of the uDFA.
   * @param states - The states table of the uDFA.
   * @returns A new and reduced states table.
   */
  protected equivalentStates(states: StatesTable): StatesTable {
    const new_table: StatesTable = states.clone();
    const empty_symbol: string = this.empty_symbol;

    function isSignificant(state: State): boolean {
      // If it is an accept state
      if (state.accept == true) return true;
      // If it has at least 1 edge with a symbol different from epsilon
      if (state.next.length != 0)
        if (state.next[0].symbol !== empty_symbol) return true;

      return false;
    }

    for (const entry of new_table.table) {
      // Reduce
      for (let i = entry.states.length - 1; i >= 0; i--) {
        const state = entry.states[i];

        if (!isSignificant(state)) entry.states.splice(i, 1);
      }
    }

    return new_table;
  }

  /**
   * Reduce the transitions of the uDFA.
   * @param states - The equivalent states table of the uDFA.
   * @param transitions - The original transitions table of the uDFA.
   * @returns New and reduced states and transitions tables.
   */
  protected reduce(
    equivalent_states: StatesTable,
    transitions: TransitionsTable,
  ): [StatesTable, TransitionsTable] {
    // To keep track of the identifiable states
    this.identifiables = new Identifiables();
    // Clone, reduce and get an array from the original states table
    const new_states: Array<StateD> = Array.from(equivalent_states.table);
    //
    const new_transitions: Array<TransitionD> = Array.from(transitions.table);

    function replaceLabel(new_label: string, old_label: string): void {
      // Iterate and remove old transitions
      for (let i = 0; i < new_transitions.length; i++) {
        if (new_transitions[i].label == old_label) {
          new_transitions.splice(i, 1);
        }
      }

      // Iterate and replace the rest
      for (let i = 0; i < new_transitions.length; i++) {
        new_transitions[i].transitions.forEach((transition, symbol) => {
          if (transition === old_label) {
            new_transitions[i].transitions.set(symbol, new_label);
          }
        });
      }
    }

    for (let i = 0; i < new_states.length; i++) {
      for (let j = i + 1; j < new_states.length; j++) {
        // Check if equal
        if (equalStates(new_states[i].states, new_states[j].states)) {
          // Identical label to persist
          const new_label: string = new_states[i].label;
          // Identical label to replace
          const old_label: string = new_states[j].label;

          replaceLabel(new_label, old_label);
          this.identifiables.add(new_label, old_label);

          // Delete from new states
          new_states.splice(j, 1);
        }
      }
    }

    let mdfa_states = new StatesTable();
    mdfa_states.table = new Set(new_states);

    let mdfa_transitions = new TransitionsTable();
    mdfa_transitions.table = new Set(new_transitions);

    return [mdfa_states, mdfa_transitions];
  }
}
