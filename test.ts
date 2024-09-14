import { NFA } from "./src/nfa";
import { mDFA } from "./src/mdfa";

const expression = "ab";

const dfa = new mDFA(expression);

console.log(dfa);
