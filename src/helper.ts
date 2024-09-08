import { State } from "./automaton";

// Some helper functions
/**
 * A helper class to generate letters.
 */
export class LetterGenerator {
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
export function equalStates(A: State[], B: State[]): boolean {
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
