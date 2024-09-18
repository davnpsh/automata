import { NFA } from "./src/nfa";
import { mDFA } from "./src/mdfa";

const expression = "b+|a";

const automata = new mDFA(expression);

const string = "aa";

console.log(automata.test(string));
