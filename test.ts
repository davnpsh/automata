import { NFA } from "./src/nfa";
import { mDFA } from "./src/mdfa";

const expression = "(a|b)b*";

const automata = new mDFA(expression);

const string = "bbbb";

console.log(automata.test(string));
