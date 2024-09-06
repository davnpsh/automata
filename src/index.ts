import { NFA } from "./nfa";

const regex: string = "(a|b*)?|a?";

const nfa = new NFA(regex);
console.log(nfa);
