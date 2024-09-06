import { NFA } from "./nfa";

const regex: string = "a|b";

const nfa = new NFA(regex);
console.log(nfa.cytograph());
