import { uDFA } from "./udfa";
import { NFA } from "./nfa";
import { mDFA } from "./mdfa";

const regex: string = "b+|b*(ab(bb)*)+";
//bbbabbbab

const dfa = new mDFA(regex);
console.log(dfa.cytograph());
console.log(dfa.accept_states);
