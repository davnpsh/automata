import { NFA } from "./src/nfa";
import { mDFA } from "./src/mdfa";
import { uDFA } from "./src/udfa";

const expression = "a+b";

const automata = new mDFA(expression);

const test = automata.test("*")

console.log(automata.transitions.table);
console.log(test)