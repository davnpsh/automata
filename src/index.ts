import { uDFA } from "./udfa";
import { NFA } from "./nfa";

const regex: string = "b+|b*(ab(bb)*)+";

const nfa = new NFA(regex);
const dfa = new uDFA(nfa);
