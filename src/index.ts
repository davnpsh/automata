import { uDFA } from "./udfa";
import { NFA } from "./nfa";
import { mDFA } from "./mdfa";

const regex: string = "(a(bc|de|fg|hi|jk|lm|no|pq|rs|tu|vw|xy|za)+)*z";
//xz

const dfa = new mDFA(regex);
//console.log(dfa.uDFA.states);

console.log(dfa.transitions.table);
console.log(dfa.cytograph());
console.log(dfa.accept_states);
