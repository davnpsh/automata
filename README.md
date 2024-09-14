# automata

[![npm](https://img.shields.io/badge/package%20-%20red?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@davnpsh/automata)


This npm package provides a way to create and manipulate finite automata based on regular expressions.

## Usage

The NFA (Nondeterministic Finite Automaton) object allows you to create an NFA from a regular expression string.

```js
import { NFA } from 'automata';

const nfa = new NFA('a(b|c)*');
console.log(nfa);
```