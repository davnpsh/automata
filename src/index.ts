import { NFA } from "./nfa";

const regex: string = "(a|b)*abb";

const nfa = new NFA(regex);
const enclosure = nfa.enclosure(nfa.initial_state);

console.log(enclosure);
