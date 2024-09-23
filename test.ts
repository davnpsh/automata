import { NFA } from "./src/nfa";
import { mDFA } from "./src/mdfa";
import { uDFA } from "./src/udfa";

const expression = "(a|b)*abb";

const automata = new mDFA(expression);

console.log(automata.transitions.table);
