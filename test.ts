import { NFA } from "./src/nfa";
import { mDFA } from "./src/mdfa";

const expression = "abbbbb";

const automata = new mDFA(expression);

const string = "baaa";

console.log(automata.test(string).routes);
