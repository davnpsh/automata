import { uDFA } from "./udfa";
import { NFA } from "./nfa";
import { mDFA } from "./mdfa";

const regex: string = "(a|b)*abb";
//bbbabbbab

const dfa = new mDFA(regex);
dfa.NFA.test("babb");
dfa.uDFA.test("babb");
dfa.test("babb");
