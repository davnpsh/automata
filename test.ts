import { NFA } from "./src/nfa";
import { mDFA } from "./src/mdfa";

const expression = "a|&";

const automata = new mDFA(expression, { empty_symbol: "&" });

console.log(automata.transitions);
console.log(automata.cytograph());
