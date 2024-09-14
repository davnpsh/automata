import { NFA } from "./src/nfa";
import { mDFA } from "./src/mdfa";

const expression = "(a|b)*abb";

const dfa = new mDFA(expression);

console.log(dfa.NFA.transitions.table);
