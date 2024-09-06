export interface SyntaxTreeNode {
  begin: number;
  end: number;
  type?: string;
  parts?: Array<SyntaxTreeNode>;
  sub?: SyntaxTreeNode;
  text?: string;
}

/**
 * Parse a regular expression into a syntax tree.
 *
 * Originally from:
 * https://github.com/CyberZHG/toolbox/blob/gh-pages/js/lexical.js
 *
 * This function was modified for this project.
 */
export function parseRegex(regex: string): SyntaxTreeNode {
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
        } else if (text[i] === "*") {
          // Handle Kleene star operator
          if (parts.length === 0) {
            throw new Error("Unexpected * at " + (begin + i) + ".");
          }
          tempNode = {
            begin: parts[parts.length - 1].begin,
            end: parts[parts.length - 1].end + 1,
          };
          tempNode.type = "star";
          tempNode.sub = parts[parts.length - 1];
          parts[parts.length - 1] = tempNode; // Replace last part with star node
        } else if (text[i] === "+") {
          // Handle plus operator
          if (parts.length === 0) {
            throw new Error("Unexpected + at " + (begin + i) + ".");
          }
          tempNode = {
            begin: parts[parts.length - 1].begin,
            end: parts[parts.length - 1].end + 1,
          };
          tempNode.type = "plus";
          tempNode.sub = parts[parts.length - 1];
          parts[parts.length - 1] = tempNode; // Replace last part with plus node
        } else if (text[i] === "?") {
          // Handle question mark operator
          if (parts.length === 0) {
            throw new Error("Unexpected + at " + (begin + i) + ".");
          }
          tempNode = {
            begin: parts[parts.length - 1].begin,
            end: parts[parts.length - 1].end + 1,
          };
          tempNode.type = "optional";
          tempNode.sub = parts[parts.length - 1];
          parts[parts.length - 1] = tempNode; // Replace last part with optional node
        } else if (text[i] === "ϵ") {
          // Handle epsilon (empty string)
          tempNode = { begin: begin + i, end: begin + i + 1 };
          tempNode.type = "empty";
          parts.push(tempNode); // Add empty node to parts
        } else {
          // Handle literal characters
          tempNode = { begin: begin + i, end: begin + i + 1 };
          tempNode.type = "text";
          tempNode.text = text[i];
          parts.push(tempNode); // Add text node to parts
        }
      }
      if (parts.length === 1) {
        return parts[0]; // If only one part, return it
      }
      node.type = "cat"; // Set type to concatenation
      node.parts = parts; // Set parts to the parsed parts
    }
    return node; // Return the constructed node
  }

  // Start parsing from the beginning of the string
  return parseSub(regex, 0, regex.length, true);
}
