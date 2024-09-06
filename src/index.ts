import { NFA } from "./nfa";

const regex: string = "(a|b)*abb(a|b)*";

const nfa = new NFA(regex);
console.log(nfa);
