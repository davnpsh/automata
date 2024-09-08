import { uDFA } from "./dfa";
import { NFA } from "./nfa";

const regex: string = "b+|b*(ab(bb)*)+";

const nfa = new NFA(regex);
const enclosure = nfa.enclosure(nfa.initial_state);
const movements = nfa.move(enclosure, "a");

const dfa = new uDFA(nfa);
console.log(dfa.cytograph());
console.log(dfa.initial_state);
console.log(dfa.accept_state);

//
console.log(nfa.accept_state);
for (const entry of dfa.states.table) {
  console.log("----");
  console.log(entry);
}
