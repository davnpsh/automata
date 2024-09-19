import { NFA } from "./src/nfa";
import { mDFA } from "./src/mdfa";
import { uDFA } from "./src/udfa";

const expression = "b+|a";

const automata = new NFA(expression);

let string = "";

const routes = automata.test(string).routes;

for (const route of routes) {
  console.log(route.valid);
  for (const transition of route.transitions) {
    console.log(
      `${transition.from.label} ${transition.symbol ? "---" + transition.symbol + "--->" : ""}`,
    );
  }
}
