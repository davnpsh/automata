import { Automaton, State } from "./automaton";
import { NFA } from "./nfa";

// Some helper functions
/**
 * A helper class to generate letters.
 */
class LetterGenerator {
  private current: string;

  constructor() {
    this.current = "A"; // Start with 'A'
  }

  public next(): string {
    const result = this.current;
    this.increment();
    return result;
  }

  private increment() {
    let carry = true;
    const chars = this.current.split("");

    for (let i = chars.length - 1; i >= 0 && carry; i--) {
      if (chars[i] === "Z") {
        chars[i] = "A"; // Reset to 'A' and carry to the next character
      } else {
        chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1); // Increment the character
        carry = false; // No more carry needed
      }
    }

    if (carry) {
      // If we still have a carry, we need to add a new character at the start
      this.current = "A" + this.current;
    } else {
      this.current = chars.join("");
    }
  }
}

/**
 * Check if two states are equal.
 * @param A - The first state.
 * @param B - The second state.
 * @returns True if the states are equal, false otherwise.
 */
function equalStates(A: State[], B: State[]): boolean {
  // Create sets of labels
  const set_A = new Set(A.map((obj) => obj.label));
  const set_B = new Set(B.map((obj) => obj.label));

  if (set_A.size !== set_B.size) return false;

  for (const label of set_A) {
    if (!set_B.has(label)) {
      return false;
    }
  }

  return true;
}

interface TransitionD {
  states: State[];
  symbols: Map<string, State[]>;
}

interface StateD {
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
   * @param states - The states of the transition.
   * @returns The entry or null if it doesn't exist.
   */
  public get(states: State[]): TransitionD | null {
    for (const row of this.table) {
      if (equalStates(row.states, states)) return row;
    }

    return null;
  }

  /**
   * Check if the transition table contains an entry.
   * @param T - The origin state of the transition.
   * @param U - The destiny state of the transition.
   * @param symbol - The symbol of the transition.
   */
  public add(T: State[], U: State[], symbol: string): void {
    // Check if the entry already exists
    let entry = this.get(T);

    // If not, just add the new transition
    if (entry === null) {
      entry = { states: T, symbols: new Map() };
      this.table.add(entry);
    }

    // Add the new transition
    entry.symbols.set(symbol, U);
  }
}

class StatesTable {
  /**
   * The states table of the DFA.
   */
  private table: Set<StateD>;

  constructor() {
    this.table = new Set();
  }

  /**
   * Check if the states table contains an entry.
   * @param states - The states of the entry.
   * @returns True if the entry is in the states table, false otherwise.
   */
  public has(states: State[]): boolean {
    for (const row of this.table) {
      if (equalStates(row.states, states)) return true;
    }

    return false;
  }

  /**
   * Add a new state to the states table.
   * @param U - The states to add.
   */
  public add(U: State[]): void {
    const entry = { states: U, marked: false };
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

    /* MAIN ALGORITHM */

    const symbols = nfa.regexp.symbols;

    const transitions_table = new TransitionsTable();
    const states_table = new StatesTable();

    // On start, enclosure-ϵ(s_0) is the only state inside the states table and it is NOT marked.
    states_table.add(nfa.enclosure(nfa.initial_state));

    while (true) {
      // While there is an unmarked entry in the states table
      const entry: StateD | null = states_table.getUnmarked();

      if (entry === null) break;

      // Mark T
      entry.marked = true;

      const T: State[] = entry!.states;

      for (const symbol of symbols) {
        const U: State[] = nfa.enclosure(nfa.move(T, symbol));

        if (!states_table.has(U)) {
          // Add U as an unmarked state to the states table
          states_table.add(U);
        }

        // Add U to the transition
        transitions_table.add(T, U, symbol);
      }
    }

    /* Graph generation */
    function generateGraph() {
      // Get initial and accept states from the transition tables
      let initial_state = new State(0);
    }

    for (let transition of transitions_table.table) {
      for (let state of transition.states) {
        console.log(state.label);
      }
      console.log("---");
    }

    return [nfa.initial_state, nfa.accept_state];
  }
}
