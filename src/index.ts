import { uDFA } from "./udfa";
import { NFA } from "./nfa";
import { mDFA } from "./mdfa";

const regex: string = "(a|b)*abb";

const dfa = new uDFA(regex);
console.log(dfa.initial_state);
