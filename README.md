# automata

[![npm](https://img.shields.io/badge/package%20-%20red?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@davnpsh/automata)


This npm package provides a way to create and manipulate finite automata based on regular expressions.

## Usage

The NFA (Nondeterministic Finite Automaton) object allows you to create an NFA from a regular expression string.

```js
import { NFA } from 'automata';

const nfa = new NFA('a(b|c)*');
```

You can also create an deterministic automaton from a regular expression string.

```js
import { uDFA, mDFA } from 'automata';

const udfa = new uDFA('a(b|c)*'); // Unoptimised DFA
const mdfa = new mDFA('a(b|c)*'); // Minimised DFA
```

In both cases, you can traverse the automaton given the `initial_state` attribute and going through the `next` attribute,
which is an array of edges.

## Configuration

These objects can also be configured.

```js
import { NFA } from 'automata';

const nfa = new NFA('a(b|c)*', {
  // Custom empty symbol
  empty_symbol: "&"
});
```

## Test

You can test the automaton with a string.

```js
import { mDFA } from 'automata';

const mdfa = new mDFA('a(b|c)*');
mdfa.test("ab");
```

It returns an object with the `accept` attribute and the `routes` attribute, which is an array of arrays of transitions.

## Graph

You can also get the graph of the automaton in a format compatible with [Cytoscape](https://js.cytoscape.org/).

```js
import { mDFA } from 'automata';

const mdfa = new mDFA('a(b|c)*');
mdfa.cytograph(); // Cytoscape elements format
```

It is recommended to import the stylesheet into your project.

```js
import { cytoscape_styles } from 'automata';

// Use it on your cytoscape component.
// For example, in React:

const Graph = ({ elements }: GraphProps) => {
  return (
    <CytoscapeComponent
      elements={elements}
      style={{ width: "100%", height: "100%" }}
      stylesheet={cytoscape_styles}
      layout={layout}
    />
  );
};
```
