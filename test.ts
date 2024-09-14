import { NFA } from "./src/nfa";
import { mDFA } from "./src/mdfa";

const expression = "ϵ";

const dfa = new mDFA(expression);

console.log(dfa.transitions);
console.log(dfa.cytograph());
