import { State } from "./automaton";
import { NFA } from "./nfa";
import { DFA, StateD, StatesTable, TransitionsTable } from "./dfa";
import { LetterGenerator } from "./helper";

export class uDFA extends DFA {
  constructor(expression: string) {
    super(expression);
  }

  /**
   * Build the uDFA from the NFA using subset construction.
   * https://en.wikipedia.org/wiki/Powerset_construction
   * @param nfa - The NFA to build the uDFA from.
   */
  protected build(expression: string): [State, State[]] {
    /**
     * Subset construction.
     * @returns The states table and the transitions table.
     */
    function subset(nfa: NFA): [StatesTable, TransitionsTable] {
      const symbols = nfa.regexp.symbols;

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

    // Important to assign before generateGraph execution!
    this.NFA = new NFA(expression);

    [this.states, this.transitions] = subset(this.NFA);

    return this.generateGraph(this.states, this.transitions);
  }
}
