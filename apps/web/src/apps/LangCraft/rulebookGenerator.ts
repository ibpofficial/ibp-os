import { CustomLanguageSpec } from './index';

function generateEBNF(spec: CustomLanguageSpec): string {
  const syn = spec.syntax;
  const kw = spec.keywords;
  const blockOpen = syn.blockStyle === 'keywords' ? syn.blockStartKeyword : syn.blockStyle === 'indent' ? ':' : '{';
  const blockClose = syn.blockStyle === 'keywords' ? syn.blockEndKeyword : syn.blockStyle === 'indent' ? '<DEDENT>' : '}';
  const term = syn.statementTerminator === 'none' ? '\\n' : syn.statementTerminator;
  const callOpen = syn.callDelimiterStyle === 'brackets' ? '[' : syn.callDelimiterStyle === 'angles' ? '<' : '(';
  const callClose = syn.callDelimiterStyle === 'brackets' ? ']' : syn.callDelimiterStyle === 'angles' ? '>' : ')';

  return `program        = { statement } ;
statement      = ( say_stmt | ask_stmt | bind_stmt | when_stmt | loop_stmt | recipe_stmt | expr_stmt ) [ "${term}" ] ;
say_stmt       = ( "${kw.say}" | "${kw.shout}" | "${kw.whisper}" ) expression ;
ask_stmt       = "${kw.ask}" [ "number" | "text" ] STRING "into" IDENTIFIER ;
bind_stmt      = [ "${kw.keep}" | "${kw.lock}" ] IDENTIFIER "${syn.assignmentOperator}" expression ;
when_stmt      = "${kw.when}" expression "${blockOpen}" block_body "${blockClose}" [ "${kw.otherwise}" "${blockOpen}" block_body "${blockClose}" ] ;
loop_stmt      = "${kw.repeat}" expression "${kw.times}" "${blockOpen}" block_body "${blockClose}"
               | "${kw.while}" expression "${blockOpen}" block_body "${blockClose}" ;
recipe_stmt    = "${kw.recipe}" IDENTIFIER "${callOpen}" [ param_list ] "${callClose}" "${blockOpen}" block_body "${blockClose}" ;
call_expr      = IDENTIFIER "${callOpen}" [ arg_list ] "${callClose}" ;
expression     = logical_or ;
logical_or     = logical_and { "${syn.orOperator}" logical_and } ;
logical_and    = equality { "${syn.andOperator}" equality } ;
equality       = comparison { ( "${syn.equalityOperator}" | "${syn.inequalityOperator}" ) comparison } ;
comparison     = term { ( "<" | "<=" | ">" | ">=" ) term } ;
term           = factor { ( "+" | "-" ) factor } ;
factor         = unary { ( "*" | "/" | "%" ) unary } ;
unary          = [ "${syn.notOperator}" | "-" ] primary ;
primary        = NUMBER | STRING | BOOLEAN | IDENTIFIER | call_expr | "(" expression ")" ;`;
}

export function generateLanguageRulebookMarkdown(spec: CustomLanguageSpec): string {
  const syn = spec.syntax;
  const kw = spec.keywords;

  return `# 📖 ${spec.name} Specification & Language Rulebook

**Author:** ${spec.author}  
**Edition:** LangCraft Standard v1.0 (IBP OS)  
**Date:** ${new Date().toLocaleDateString()}  

> ${spec.description}

---

## 1. Architectural Philosophy & Grammar Rules

| Rule Category | Setting / Configuration | Semantics & Behavior |
| :--- | :--- | :--- |
| **Block Structure** | \`${syn.blockStyle}\` | ${
    syn.blockStyle === 'keywords'
      ? `Blocks begin with keyword \`${syn.blockStartKeyword}\` and close with \`${syn.blockEndKeyword}\`.`
      : syn.blockStyle === 'indent'
      ? `Blocks begin with colon \`:\` and use whitespace indentation (Pythonic).`
      : `Blocks are enclosed in traditional curly braces \`{ ... }\`.`
  } |
| **Statement Separators** | \`${syn.statementTerminator}\` (\`${syn.statementTerminatorPolicy}\`) | ${
    syn.statementTerminator === 'none'
      ? 'Statements are separated by natural newlines (no semicolons required).'
      : `Statements end with \`${syn.statementTerminator}\` (${syn.statementTerminatorPolicy}).`
  } |
| **Comma Strictness** | \`${syn.commaPolicy}\` | ${
    syn.commaPolicy === 'forbidden'
      ? 'Zero commas allowed. Arguments and array elements are space-separated.'
      : syn.commaPolicy === 'optional'
      ? 'Commas are optional everywhere.'
      : 'Strict commas required between parameters and elements.'
  } |
| **Variable Declaration** | \`${syn.variableDeclMode}\` | ${
    syn.variableDeclMode === 'auto'
      ? 'Automatic variable declaration on first assignment (e.g. `x = 10`).'
      : `Requires explicit declaration keywords (\`${kw.keep}\` / \`${kw.lock}\`).`
  } |
| **String Quotation** | \`${syn.stringDelimiter}\` | ${
    syn.stringDelimiter === 'both'
      ? 'Both double quotes (`"..."`) and single quotes (`\'...\'`) permitted.'
      : syn.stringDelimiter === '"'
      ? 'Double quotes (`"..."`) strictly enforced.'
      : 'Single quotes (`\'...\'`) strictly enforced.'
  } |
| **Comment Marker** | \`${syn.commentStyle}\` | Lines starting with \`${syn.commentStyle}\` are treated as comments. |

---

## 2. Signs, Punctuations & Operators Matrix

| Syntax Feature | Chosen Sign / Symbol | Code Example | Semantics |
| :--- | :---: | :--- | :--- |
| **Assignment** | \`${syn.assignmentOperator}\` | \`count ${syn.assignmentOperator} 42\` | Store value into variable |
| **Equality Check** | \`${syn.equalityOperator}\` | \`a ${syn.equalityOperator} b\` | Evaluates true if both values are equal |
| **Inequality Check** | \`${syn.inequalityOperator}\` | \`a ${syn.inequalityOperator} b\` | Evaluates true if values differ |
| **Logical AND** | \`${syn.andOperator}\` | \`flag1 ${syn.andOperator} flag2\` | Short-circuit boolean AND |
| **Logical OR** | \`${syn.orOperator}\` | \`flag1 ${syn.orOperator} flag2\` | Short-circuit boolean OR |
| **Logical NOT** | \`${syn.notOperator}\` | \`${syn.notOperator} flag\` | Unary boolean inversion |
| **Pipe Flow** | \`${syn.pipeOperator || 'none'}\` | \`val ${syn.pipeOperator} fn()\` | Left-to-right expression pipelining |
| **Function Call Wrapping** | \`${syn.callDelimiterStyle || 'parens'}\` | \`calc(a, b)\` | Delimits arguments passed to calls |
| **Array / List Delimiters** | \`${syn.listDelimiterStyle || 'brackets'}\` | \`[1, 2, 3]\` | Collection constructor |
| **Member / Property Sign** | \`${syn.memberAccessSign || '.'}\` | \`player${syn.memberAccessSign || '.'}score\` | Object field access |
| **Choose Action** | \`${syn.chooseActionKeyword || 'inputchoose'}\` | \`${syn.chooseActionKeyword || 'inputchoose'} (+, -, *, /)\` | Interactive operator prompt |
| **Input 1 Action** | \`${syn.inputNumberActionKeyword || 'input1'}\` | \`${syn.inputNumberActionKeyword || 'input1'}(a)\` | Input first number |
| **Input 2 Action** | \`${syn.inputNumber2ActionKeyword || 'input2'}\` | \`${syn.inputNumber2ActionKeyword || 'input2'}(b)\` | Input second number |
| **Dynamic Execution** | \`${syn.computeActionKeyword || 'execute'}\` | \`${syn.computeActionKeyword || 'execute'}(a (op) b)\` | Dynamic arithmetic calculation |
| **Output Action** | \`${syn.outputActionKeyword || 'output'}\` | \`${syn.outputActionKeyword || 'output'} result\` | Console output display |

---

## 3. Keyword Vocabulary Dictionary

| Canonical Meaning | ${spec.name} Keyword | Category | Usage & Description |
| :--- | :--- | :--- | :--- |
| \`say\` | **\`${kw.say}\`** | I/O | Standard output print statement |
| \`shout\` | **\`${kw.shout}\`** | I/O | Uppercase / high-priority loud output |
| \`whisper\` | **\`${kw.whisper}\`** | I/O | Low-key telemetry / debug output |
| \`ask\` | **\`${kw.ask}\`** | I/O | Interactive user input prompt |
| \`keep\` | **\`${kw.keep}\`** | Variables | Mutable variable binding |
| \`lock\` | **\`${kw.lock}\`** | Variables | Immutable constant binding |
| \`when\` | **\`${kw.when}\`** | Branching | Conditional if block |
| \`orwhen\` | **\`${kw.orwhen}\`** | Branching | Else-if condition branch |
| \`otherwise\` | **\`${kw.otherwise}\`** | Branching | Fallback else branch |
| \`unless\` | **\`${kw.unless}\`** | Branching | Inverse conditional (executes if false) |
| \`repeat\` | **\`${kw.repeat}\`** | Loops | Counted repetition loop |
| \`times\` | **\`${kw.times}\`** | Loops | Iteration count specifier |
| \`count\` | **\`${kw.count}\`** | Loops | Numeric for-range loop |
| \`from\` | **\`${kw.from}\`** | Loops | Range start boundary |
| \`to\` | **\`${kw.to}\`** | Loops | Range end boundary |
| \`each\` | **\`${kw.each}\`** | Loops | Collection iterator |
| \`in\` | **\`${kw.in}\`** | Loops | Membership / range quantifier |
| \`while\` | **\`${kw.while}\`** | Loops | Predicate-driven loop |
| \`recipe\` | **\`${kw.recipe}\`** | Functions | Function / procedure declaration |
| \`give\` | **\`${kw.give}\`** | Functions | Return result from recipe |
| \`yes\` | **\`${kw.yes}\`** | Literals | Boolean true value |
| \`no\` | **\`${kw.no}\`** | Literals | Boolean false value |
| \`empty\` | **\`${kw.empty}\`** | Literals | Null / void representation |
| \`celebrate\` | **\`${kw.celebrate}\`** | Runtime | Success event / confetti trigger |
| \`check\` | **\`${kw.check}\`** | Testing | Assertion / unit check |
| \`attempt\` | **\`${kw.attempt}\`** | Exceptions | Try protected execution block |
| \`rescue\` | **\`${kw.rescue}\`** | Exceptions | Catch error handler block |
| \`todo\` | **\`${kw.todo}\`** | Tools | Task marker annotation |

---

## 4. Built-in Standard Library Formulas

${
  spec.customFunctions.length === 0
    ? '_No custom standard library functions registered._'
    : spec.customFunctions
        .map(
          (fn) => `### \`${fn.name}(${fn.params})\`
* **Formula / Expression:** \`${fn.body}\`
* **Description:** ${fn.description}
`
        )
        .join('\n')
}

---

## 5. Canonical Sample Code

\`\`\`${spec.name.toLowerCase().replace(/[^a-z0-9]/g, '')}
${spec.sampleCode}
\`\`\`

---

## 6. Formal EBNF Grammar

\`\`\`ebnf
${generateEBNF(spec)}
\`\`\`

---
*Generated by LangCraft Studio • IBP Virtual Operating System*
`;
}

export function generateLanguageRulebookHTML(spec: CustomLanguageSpec): string {
  const syn = spec.syntax;
  const kw = spec.keywords;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${spec.name} - Specification & Language Rulebook</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-before: always; }
      .no-print { display: none !important; }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 24px;
    }
    .header-box {
      border: 2px solid #7c3aed;
      border-radius: 12px;
      padding: 20px 24px;
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      margin-bottom: 24px;
    }
    h1 {
      font-size: 22pt;
      font-weight: 800;
      color: #4c1d95;
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .subtitle {
      font-size: 11pt;
      color: #6d28d9;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .meta-bar {
      display: flex;
      gap: 16px;
      font-size: 9pt;
      color: #64748b;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #ddd6fe;
    }
    h2 {
      font-size: 14pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 20px 0;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334155;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    code, pre {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    code {
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
      color: #6b21a8;
      font-size: 9pt;
    }
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      font-size: 9pt;
      overflow-x: auto;
      line-height: 1.45;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      background: #ede9fe;
      color: #6d28d9;
    }
    .print-btn-bar {
      position: sticky;
      top: 0;
      background: #ffffff;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      background: #7c3aed;
      color: #ffffff;
      border: 0;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 10pt;
      cursor: pointer;
    }
    .btn:hover { background: #6d28d9; }
  </style>
</head>
<body>

  <div class="print-btn-bar no-print">
    <div>
      <strong>Language Rulebook Preview</strong> • Click Print to generate your PDF
    </div>
    <button class="btn" onclick="window.print()">🖨️ Print / Save to PDF</button>
  </div>

  <div class="header-box">
    <h1>🪐 ${spec.name}</h1>
    <div class="subtitle">Complete Language Specification, Punctuation & Rulebook</div>
    <div>${spec.description}</div>
    <div class="meta-bar">
      <span><strong>Author:</strong> ${spec.author}</span>
      <span><strong>Standard:</strong> LangCraft v1.0</span>
      <span><strong>Paradigms:</strong> ${syn.blockStyle} blocks, ${syn.commaPolicy} commas</span>
      <span><strong>Date:</strong> ${new Date().toLocaleDateString()}</span>
    </div>
  </div>

  <h2>1. Architectural Grammar & Syntax Rules</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 28%;">Grammar Domain</th>
        <th style="width: 25%;">Configured Rule</th>
        <th>Behavior & Language Semantics</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Block Scoping</strong></td>
        <td><code>${syn.blockStyle}</code></td>
        <td>${
          syn.blockStyle === 'keywords'
            ? `Word keywords: starts with <code>${syn.blockStartKeyword}</code>, ends with <code>${syn.blockEndKeyword}</code>.`
            : syn.blockStyle === 'indent'
            ? `Indentation with colons: header ends with <code>:</code>, body is indented.`
            : `Enclosed within curly braces <code>{ ... }</code>.`
        }</td>
      </tr>
      <tr>
        <td><strong>Statement Separators</strong></td>
        <td><code>${syn.statementTerminator}</code> (${syn.statementTerminatorPolicy})</td>
        <td>${
          syn.statementTerminator === 'none'
            ? 'Statements terminate on newline. No semicolons needed.'
            : `Terminated with <code>${syn.statementTerminator}</code>.`
        }</td>
      </tr>
      <tr>
        <td><strong>Comma Strictness</strong></td>
        <td><code>${syn.commaPolicy}</code></td>
        <td>${
          syn.commaPolicy === 'forbidden'
            ? 'Zero commas. Arguments and collections are space-separated.'
            : syn.commaPolicy === 'optional'
            ? 'Commas may be written or omitted freely.'
            : 'Strict commas required between arguments and collection items.'
        }</td>
      </tr>
      <tr>
        <td><strong>Variable Declarations</strong></td>
        <td><code>${syn.variableDeclMode}</code></td>
        <td>${
          syn.variableDeclMode === 'auto'
            ? 'Automatic binding upon assignment (e.g. <code>x = 10</code> declares variable).'
            : `Explicit declaration with <code>${kw.keep}</code> and <code>${kw.lock}</code>.`
        }</td>
      </tr>
      <tr>
        <td><strong>String Delimiters</strong></td>
        <td><code>${syn.stringDelimiter}</code></td>
        <td>${
          syn.stringDelimiter === 'both'
            ? 'Both double quotes (<code>"..."</code>) and single quotes (<code>\'...\'</code>) are valid.'
            : syn.stringDelimiter === '"'
            ? 'Double quotes strictly required.'
            : 'Single quotes strictly required.'
        }</td>
      </tr>
      <tr>
        <td><strong>Comment Markers</strong></td>
        <td><code>${syn.commentStyle}</code></td>
        <td>Single-line comments begin with <code>${syn.commentStyle}</code>.</td>
      </tr>
    </tbody>
  </table>

  <h2>2. Signs, Punctuations & Operator Reference Matrix</h2>
  <table>
    <thead>
      <tr>
        <th>Domain</th>
        <th style="text-align: center;">Configured Sign</th>
        <th>Usage Example</th>
        <th>Semantics</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Assignment</strong></td>
        <td style="text-align: center;"><code>${syn.assignmentOperator}</code></td>
        <td><code>value ${syn.assignmentOperator} 100</code></td>
        <td>Assigns value to variable</td>
      </tr>
      <tr>
        <td><strong>Equality</strong></td>
        <td style="text-align: center;"><code>${syn.equalityOperator}</code></td>
        <td><code>score ${syn.equalityOperator} 100</code></td>
        <td>Returns true if left equals right</td>
      </tr>
      <tr>
        <td><strong>Inequality</strong></td>
        <td style="text-align: center;"><code>${syn.inequalityOperator}</code></td>
        <td><code>score ${syn.inequalityOperator} 0</code></td>
        <td>Returns true if left does not equal right</td>
      </tr>
      <tr>
        <td><strong>Logical AND</strong></td>
        <td style="text-align: center;"><code>${syn.andOperator}</code></td>
        <td><code>ready ${syn.andOperator} active</code></td>
        <td>Boolean conjunction</td>
      </tr>
      <tr>
        <td><strong>Logical OR</strong></td>
        <td style="text-align: center;"><code>${syn.orOperator}</code></td>
        <td><code>failed ${syn.orOperator} timeout</code></td>
        <td>Boolean disjunction</td>
      </tr>
      <tr>
        <td><strong>Logical NOT</strong></td>
        <td style="text-align: center;"><code>${syn.notOperator}</code></td>
        <td><code>${syn.notOperator} done</code></td>
        <td>Boolean inversion</td>
      </tr>
      <tr>
        <td><strong>Pipe Flow</strong></td>
        <td style="text-align: center;"><code>${syn.pipeOperator || 'none'}</code></td>
        <td><code>x ${syn.pipeOperator} calc()</code></td>
        <td>Pipes expression into following call</td>
      </tr>
      <tr>
        <td><strong>Call Wrapping</strong></td>
        <td style="text-align: center;"><code>${syn.callDelimiterStyle || '()'}</code></td>
        <td><code>square(4)</code></td>
        <td>Delimits function invocation arguments</td>
      </tr>
      <tr>
        <td><strong>List Delimiters</strong></td>
        <td style="text-align: center;"><code>${syn.listDelimiterStyle || '[]'}</code></td>
        <td><code>[10, 20, 30]</code></td>
        <td>Collection / array constructor</td>
      </tr>
      <tr>
        <td><strong>Choose Action</strong></td>
        <td style="text-align: center;"><code>${syn.chooseActionKeyword || 'inputchoose'}</code></td>
        <td><code>${syn.chooseActionKeyword || 'inputchoose'} (+, -, *, /)</code></td>
        <td>Prompts user to choose an operator</td>
      </tr>
      <tr>
        <td><strong>Input 1 Action</strong></td>
        <td style="text-align: center;"><code>${syn.inputNumberActionKeyword || 'input1'}</code></td>
        <td><code>${syn.inputNumberActionKeyword || 'input1'}(a)</code></td>
        <td>Prompts user for first number</td>
      </tr>
      <tr>
        <td><strong>Input 2 Action</strong></td>
        <td style="text-align: center;"><code>${syn.inputNumber2ActionKeyword || 'input2'}</code></td>
        <td><code>${syn.inputNumber2ActionKeyword || 'input2'}(b)</code></td>
        <td>Prompts user for second number</td>
      </tr>
      <tr>
        <td><strong>Dynamic Execution</strong></td>
        <td style="text-align: center;"><code>${syn.computeActionKeyword || 'execute'}</code></td>
        <td><code>${syn.computeActionKeyword || 'execute'}(a (op) b)</code></td>
        <td>Calculates result dynamically with chosen operator</td>
      </tr>
      <tr>
        <td><strong>Output Action</strong></td>
        <td style="text-align: center;"><code>${syn.outputActionKeyword || 'output'}</code></td>
        <td><code>${syn.outputActionKeyword || 'output'} ans</code></td>
        <td>Displays result to console output</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>3. Complete Keyword Vocabulary Dictionary</h2>
  <table>
    <thead>
      <tr>
        <th>Canonical</th>
        <th>${spec.name} Keyword</th>
        <th>Category</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><code>say</code></td><td><strong><code>${kw.say}</code></strong></td><td><span class="badge">I/O</span></td><td>Outputs text or values</td></tr>
      <tr><td><code>shout</code></td><td><strong><code>${kw.shout}</code></strong></td><td><span class="badge">I/O</span></td><td>High-emphasis loud output</td></tr>
      <tr><td><code>whisper</code></td><td><strong><code>${kw.whisper}</code></strong></td><td><span class="badge">I/O</span></td><td>Muted telemetry / debug output</td></tr>
      <tr><td><code>ask</code></td><td><strong><code>${kw.ask}</code></strong></td><td><span class="badge">I/O</span></td><td>Interactive user input prompt</td></tr>
      <tr><td><code>keep</code></td><td><strong><code>${kw.keep}</code></strong></td><td><span class="badge">State</span></td><td>Declares mutable variable</td></tr>
      <tr><td><code>lock</code></td><td><strong><code>${kw.lock}</code></strong></td><td><span class="badge">State</span></td><td>Declares immutable constant</td></tr>
      <tr><td><code>when</code></td><td><strong><code>${kw.when}</code></strong></td><td><span class="badge">Control</span></td><td>Conditional if-branch</td></tr>
      <tr><td><code>orwhen</code></td><td><strong><code>${kw.orwhen}</code></strong></td><td><span class="badge">Control</span></td><td>Else-if branch</td></tr>
      <tr><td><code>otherwise</code></td><td><strong><code>${kw.otherwise}</code></strong></td><td><span class="badge">Control</span></td><td>Else branch</td></tr>
      <tr><td><code>repeat</code></td><td><strong><code>${kw.repeat}</code></strong></td><td><span class="badge">Loops</span></td><td>Repeats body N times</td></tr>
      <tr><td><code>count</code></td><td><strong><code>${kw.count}</code></strong></td><td><span class="badge">Loops</span></td><td>For-range loop</td></tr>
      <tr><td><code>while</code></td><td><strong><code>${kw.while}</code></strong></td><td><span class="badge">Loops</span></td><td>While-loop predicate</td></tr>
      <tr><td><code>recipe</code></td><td><strong><code>${kw.recipe}</code></strong></td><td><span class="badge">Procedures</span></td><td>Function / recipe definition</td></tr>
      <tr><td><code>give</code></td><td><strong><code>${kw.give}</code></strong></td><td><span class="badge">Procedures</span></td><td>Returns result from function</td></tr>
      <tr><td><code>yes</code> / <code>no</code></td><td><strong><code>${kw.yes}</code> / <code>${kw.no}</code></strong></td><td><span class="badge">Values</span></td><td>Boolean true / false</td></tr>
      <tr><td><code>celebrate</code></td><td><strong><code>${kw.celebrate}</code></strong></td><td><span class="badge">Runtime</span></td><td>Triggers celebration event</td></tr>
    </tbody>
  </table>

  <h2>4. Built-in Standard Library Formulas</h2>
  ${
    spec.customFunctions.length === 0
      ? '<p><em>No custom functions registered in standard library.</em></p>'
      : `<table>
          <thead>
            <tr>
              <th>Signature</th>
              <th>Formula / Expression</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${spec.customFunctions
              .map(
                (f) => `<tr>
                  <td><code>${f.name}(${f.params})</code></td>
                  <td><code>${f.body}</code></td>
                  <td>${f.description}</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>`
  }

  <h2>5. Canonical Sample Code</h2>
  <pre><code>${spec.sampleCode}</code></pre>

  <h2>6. Formal EBNF Grammar</h2>
  <pre><code>${generateEBNF(spec).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>

  <p style="text-align: center; font-size: 8pt; color: #94a3b8; margin-top: 30px;">
    Authored in LangCraft Studio • IBP OS Educational Platform
  </p>

</body>
</html>`;
}

export function printRulebookAsPDF(spec: CustomLanguageSpec): void {
  const html = generateLanguageRulebookHTML(spec);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Create invisible iframe to trigger print dialog directly
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = url;
  document.body.appendChild(iframe);

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.open(url, '_blank');
      }
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }, 60000);
    }, 250);
  };
}
