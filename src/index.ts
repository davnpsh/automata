import { NFA } from "./nfa";

const regex: string = "(a|b)*abb";

const nfa = new NFA(regex);
console.log(nfa);
