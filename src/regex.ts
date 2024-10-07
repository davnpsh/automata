export interface SyntaxTreeNode {
  begin: number;
  end: number;
  type?: string;
  parts?: Array<SyntaxTreeNode>;
  sub?: SyntaxTreeNode;
  text?: string;
}

export class RegExp {
  /**
   * The regular expression
   */
  public expression: string;
  /**
   * The syntax tree of the regular expression
   */
  public syntax_tree: SyntaxTreeNode;
  /**
   * The symbols of the regular expression
   */
  public symbols: string[];
  /*
   * Empty symbol to be used on the regexp
   */
  protected empty_symbol: string;

  constructor(expression: string, empty_symbol: string) {
    this.empty_symbol = empty_symbol;
    this.expression = expression;
    this.syntax_tree = this.parse();
    this.symbols = this.extractSymbols();
  }

  /**
   * Parse a regular expression into a syntax tree.
   *
   * Originally from:
   * https://github.com/CyberZHG/toolbox/blob/gh-pages/js/lexical.js
   *
   * This function was modified for this project.
   @returns The syntax tree of the regular expression
   */
  protected parse(): SyntaxTreeNode {
    const empty_symbol: string = this.empty_symbol;

    function parseSub(
      text: string,
      begin: number,
      end: number,
      first: boolean,
    ): SyntaxTreeNode {
      var i: number,
        last: number = 0,
        stack: number = 0,
        node: SyntaxTreeNode = { begin: begin, end: end },
        virNode: SyntaxTreeNode,
        tempNode: SyntaxTreeNode,
        sub: SyntaxTreeNode,
        parts: SyntaxTreeNode[] = [];
      let lastOperator: string | null = null;

      if (text.length === 0) {
        throw new Error("Empty input");
      }

      // Look for alternation at top level
      if (first) {
        // Check every character on the string
        for (i = 0; i <= text.length; i += 1) {
          // Check for alternation operator
          if (i === text.length || (text[i] === "|" && stack === 0)) {
            if (last === 0 && i === text.length) {
              // If no alternation found, parse the whole string
              return parseSub(text, begin + last, begin + i, false);
            }
            // Recursively parse each part of the alternation
            sub = parseSub(
              text.substr(last, i - last),
              begin + last,
              begin + i,
              true,
            );
            parts.push(sub); // Add parsed part to parts array
            last = i + 1;
          } else if (text[i] === "(") {
            stack += 1; // Increment stack on opening bracket
          } else if (text[i] === ")") {
            stack -= 1; // Decrement stack on closing bracket
            if (stack < 0) {
              throw new Error("Unmatched closing parenthesis at position " + i + ".");
            }
          }
        }
        if (parts.length === 1) {
          return parts[0]; // If only one part, return it
        }
        node.type = "or"; // Set type to alternation
        node.parts = parts;
      } else {
        // Second pass: handle concatenation and other operators
        for (i = 0; i < text.length; i += 1) {
          if (text[i] === "(") {
            last = i + 1;
            i += 1;
            stack = 1;
            while (i < text.length && stack !== 0) {
              if (text[i] === "(") {
                stack += 1; // Increment stack on opening bracket
              } else if (text[i] === ")") {
                stack -= 1; // Decrement stack on closing bracket
              }
              i += 1;
            }
            if (stack !== 0) {
              throw new Error(
                "Missing right bracket for " + (begin + last) + ".",
              );
            }
            i -= 1;
            sub = parseSub(
              text.substr(last, i - last),
              begin + last,
              begin + i,
              true,
            );
            sub.begin -= 1;
            sub.end += 1;
            parts.push(sub); // Add parsed subexpression to parts
            lastOperator = null; // Reset lastOperator after a group
          } else if (text[i] === "*" || text[i] === "+" || text[i] === "?") {
            // Handle Kleene or positive enclosure and optional
            //
            if (parts.length === 0) {
              throw new Error(`Unexpected ${text[i]} at ${begin + i}.`);
            }

            const lastPart = parts[parts.length - 1];

            // Check for invalid combinations
            if (lastOperator !== null) {
              if (lastOperator === "?" && text[i] === "?") {
                throw new Error(`Invalid '?' after '?' at ${begin + i}.`);
              }
              if (
                (text[i] === "*" || text[i] === "+") &&
                (lastOperator === "*" ||
                  lastOperator === "+" ||
                  lastOperator === "?")
              ) {
                throw new Error(
                  `Invalid '${text[i]}' after '${lastOperator}' at ${begin + i}.`,
                );
              }
            }

            tempNode = {
              begin: lastPart.begin,
              end: lastPart.end + 1,
            };

            if (text[i] === "*") {
              tempNode.type = "star";
            } else if (text[i] === "+") {
              tempNode.type = "plus";
            } else {
              // text[i] === "?"
              tempNode.type = "optional";
            }

            tempNode.sub = lastPart;
            parts[parts.length - 1] = tempNode;
            lastOperator = text[i];
          } else if (text[i] === empty_symbol) {
            // Handle epsilon (empty string)
            tempNode = { begin: begin + i, end: begin + i + 1 };
            tempNode.type = "empty";
            parts.push(tempNode); // Add empty node to parts
            lastOperator = null;
          } else {
            // Handle literal characters
            tempNode = { begin: begin + i, end: begin + i + 1 };
            tempNode.type = "text";
            tempNode.text = text[i];
            parts.push(tempNode); // Add text node to parts
            lastOperator = null;
          }
        }
        if (parts.length === 1) {
          return parts[0]; // If only one part, return it
        }
        node.type = "cat"; // Set type to concatenation
        node.parts = parts; // Set parts to the parsed parts
      }

      // After parsing the entire expression, check if any unbalanced parentheses remain
      if (stack > 0) {
        throw new Error("Unmatched opening parenthesis at position " + end + ".");
      }

      return node; // Return the constructed node
    }

    // Start parsing from the beginning of the string
    return parseSub(this.expression, 0, this.expression.length, true);
  }

  /**
   * Extracts all unique symbols from the regex string.
   * @returns An array of unique symbols.
   */
  protected extractSymbols(): string[] {
    const ignoreChars = ["(", ")", "|", "*", "+", "?", this.empty_symbol];

    //Set to store unique symbols
    const symbolsSet = new Set<string>();

    // Iterate through each character in the regex string
    for (const char of this.expression) {
      // Check if the character is not in the ignore list
      if (!ignoreChars.includes(char)) {
        symbolsSet.add(char);
      }
    }

    // Convert the Set to an array and return it
    return Array.from(symbolsSet);
  }
}
