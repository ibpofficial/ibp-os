/**
 * Easy Flow & Calculator Preprocessor for IBP OS
 * Translates human-friendly action flows (inputchoose, input1, input2, execute, output)
 * into canonical IBP statements, maintaining 1:1 line numbers.
 */
export function preprocessEasyFlow(source: string): string {
  if (!source) return source;

  // Quick check: if the source doesn't contain any easy-flow tokens, skip immediately
  if (!/(?:inputchoose|input1|input2|choose|chuno|dalo|hisab|execute|output|dikhao)/i.test(source)) {
    return source;
  }

  const lines = source.split('\n');
  const result: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('--')) {
      result.push(line);
      continue;
    }

    let processed = line;

    // 1. Choose action
    // Pattern 1A: choose op (+, -, *, /) or chuno op from (+, -, *, /) or inputchoose op (...)
    processed = processed.replace(
      /^(\s*)(?:inputchoose|choose|chuno|select)\s+([a-zA-Z0-9_]+)\s*(?:from)?\s*\(([^)]+)\)\s*$/i,
      '$1ask "Choose operation ($3):" into $2'
    );

    // Pattern 1B: inputchoose (+, -, *, /) or inputchoose (/,*,+,-)
    processed = processed.replace(
      /^(\s*)(?:inputchoose|choose|chuno|select)\s*\(([^)]+)\)\s*$/i,
      '$1ask "Choose operation ($2):" into inputchoose'
    );

    // 2. Input1 action
    // Pattern 2A: input1(a) or input1(num1) or ask1(a) or dalo1(a)
    processed = processed.replace(
      /^(\s*)(?:input1|dalo1|lo1|ask1)\s*\(\s*([a-zA-Z0-9_]*)\s*\)\s*$/i,
      (m, indent, name) => `${indent}ask number "Enter first number:" into ${name.trim() || 'input1'}`
    );

    // Pattern 2B: bare input1 or dalo1
    processed = processed.replace(
      /^(\s*)(?:input1|dalo1|lo1|ask1)\s*$/i,
      '$1ask number "Enter first number:" into input1'
    );

    // Pattern 2C: dalo a or lo a
    processed = processed.replace(
      /^(\s*)(?:dalo|lo)\s+([a-zA-Z0-9_]+)\s*$/i,
      '$1ask number "Enter value for $2:" into $2'
    );

    // 3. Input2 action
    // Pattern 3A: input2(b) or input2(num2) or ask2(b) or dalo2(b)
    processed = processed.replace(
      /^(\s*)(?:input2|dalo2|lo2|ask2)\s*\(\s*([a-zA-Z0-9_]*)\s*\)\s*$/i,
      (m, indent, name) => `${indent}ask number "Enter second number:" into ${name.trim() || 'input2'}`
    );

    // Pattern 3B: bare input2 or dalo2
    processed = processed.replace(
      /^(\s*)(?:input2|dalo2|lo2|ask2)\s*$/i,
      '$1ask number "Enter second number:" into input2'
    );

    // 4. Dynamic execute / compute / hisab
    // Pattern 4A: execute(a (op) b) into result  OR  execute(a (op) b)
    processed = processed.replace(
      /^(\s*)(?:execute|compute|calculate|hisab)\s*\(\s*([a-zA-Z0-9_]+)\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*([a-zA-Z0-9_]+)\s*\)(?:\s+into\s+([a-zA-Z0-9_]+))?\s*$/i,
      (m, indent, a, op, b, intoVar) => {
        const dest = intoVar ? intoVar.trim() : 'result';
        const actualA = a === 'input' ? 'input1' : a;
        const actualOp = op === 'inputchoice' ? 'inputchoose' : op;
        return `${indent}keep ${dest} = execute(${actualA}, ${actualOp}, ${b})`;
      }
    );

    // Pattern 4B: execute(a, op, b) into result  OR  execute(a, op, b)
    processed = processed.replace(
      /^(\s*)(?:execute|compute|calculate|hisab)\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\)(?:\s+into\s+([a-zA-Z0-9_]+))?\s*$/i,
      (m, indent, a, op, b, intoVar) => {
        const dest = intoVar ? intoVar.trim() : 'result';
        const actualA = a === 'input' ? 'input1' : a;
        const actualOp = op === 'inputchoice' ? 'inputchoose' : op;
        return `${indent}keep ${dest} = execute(${actualA}, ${actualOp}, ${b})`;
      }
    );

    // Pattern 4C: compute result = a (op) b  OR  hisab result = a (op) b
    processed = processed.replace(
      /^(\s*)(?:compute|calculate|hisab|execute)\s+([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*([a-zA-Z0-9_]+)\s*$/i,
      (m, indent, dest, a, op, b) => {
        const actualA = a === 'input' ? 'input1' : a;
        const actualOp = op === 'inputchoice' ? 'inputchoose' : op;
        return `${indent}keep ${dest} = execute(${actualA}, ${actualOp}, ${b})`;
      }
    );

    // 5. Output / Dikhao action
    // Pattern 5A: bare output or bare dikhao
    processed = processed.replace(
      /^(\s*)(?:output|dikhao)\s*$/i,
      '$1say result'
    );

    // Pattern 5B: output "Message:", val or output "Message:" val
    processed = processed.replace(
      /^(\s*)(?:output|dikhao)\s+(.+)$/i,
      (m, indent, rest) => {
        const cleanedRest = rest.replace(/(".*?")\s+([a-zA-Z0-9_])/g, '$1, $2');
        return `${indent}say ${cleanedRest}`;
      }
    );

    result.push(processed);
  }

  return result.join('\n');
}
