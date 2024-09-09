import { uDFA } from "./udfa";
import { NFA } from "./nfa";

const regex: string = "b+|b*(ab(bb)*)+";

const dfa = new uDFA(regex);
