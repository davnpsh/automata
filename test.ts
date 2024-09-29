import { NFA } from "./src/nfa";
import { mDFA } from "./src/mdfa";
import { uDFA } from "./src/udfa";

const expression = "b(b(a?)*)+";
// Problem:
// ? <- no ?, * or + after this
// * <- no * or + after this
// + <- no * or + after this

const automata = new mDFA(expression);

console.log(automata.transitions.table);
