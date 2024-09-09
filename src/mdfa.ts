import { State } from "./automaton";
import { DFA, StatesTable } from "./dfa";
import { uDFA } from "./udfa";

export class mDFA extends DFA {
  constructor(expression: string) {
    super(expression);
  }

  /**
   * Build the mDFA from the NFA reducing equivalent states.
   * https://en.wikipedia.org/wiki/DFA_minimization
   * @param nfa - The NFA to build the uDFA from.
   */
  protected build(expression: string): [State, State[]] {
    // Build from uDFA
    const dfa = new uDFA(expression);
    const old_table = dfa.states;
    const new_table = this.reduceStates(dfa.states);

    console.log(old_table.table);
    console.log(new_table.table);

    return [new State(0), []];
  }

  /**
   * Reduce the states of the uDFA.
   * @param states - The states table of the uDFA.
   * @returns A new and reduced states table.
   */
  protected reduceStates(states: StatesTable): StatesTable {
    const new_table: StatesTable = new StatesTable();

    function isSignificant(state: State): boolean {
      // If it is an accept state
      if (state.next.length == 0) return true;
      // If it has at least 1 edge with a symbol different from epsilon
      if (state.next[0].symbol !== "ϵ") return true;

      return false;
    }

    for (const entry of states.table) {
      // Copy new entry for modification
      const new_entry = { ...entry, states: [...entry.states] };

      // Reduce
      for (let i = new_entry.states.length - 1; i >= 0; i--) {
        const state = new_entry.states[i];

        if (!isSignificant(state)) new_entry.states.splice(i, 1);
      }

      // Add
      new_table.table.add(new_entry);
    }

    return new_table;
  }
}
