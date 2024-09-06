import { parseRegex, SyntaxTreeNode } from "./regex";
import { NFA, State } from "./nfa";

const regex: string = "(a|b)*abb";
const syntax_tree: SyntaxTreeNode = parseRegex(regex);

console.log(syntax_tree);

const nfa = new NFA(syntax_tree);
console.log(nfa);
