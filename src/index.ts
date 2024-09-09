import { uDFA } from "./dfa";
import { NFA } from "./nfa";

const regex: string = "b+|b*(ab(bb)*)+";

const nfa = new NFA(regex);
