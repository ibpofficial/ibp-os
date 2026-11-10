import React, { useState, useEffect, useMemo } from 'react';
import {
  Wand2,
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  Sparkles,
  Plus,
  Trash2,
  Layers,
  Settings2,
  Code2,
  Boxes,
  FileCode,
  Save,
  Terminal,
  Activity,
  Sliders,
  Braces,
  Share2,
  CheckCircle2,
  XCircle,
  Beaker,
  FileSpreadsheet,
  RefreshCw,
  Quote,
  ShieldAlert,
  ArrowRight,
  FolderPlus,
  Printer,
  FileText,
  FileDown,
  TerminalSquare,
  Package,
  Hash,
  ExternalLink,
  Calculator,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { executeIBP } from '@ibp/engine';
import { useVFSStore } from '../../stores/vfsStore';
import { useDesktopStore } from '../../stores/desktopStore';
import { printRulebookAsPDF, generateLanguageRulebookMarkdown } from './rulebookGenerator';
import { generateIBPCompilerScript, generateVSCodePackageZip } from './compilerGenerator';

export interface CustomFunctionSpec {
  id: string;
  name: string;
  params: string;
  body: string;
  description: string;
}

export interface CustomSyntaxRules {
  // 1. Block Delimiters & Scoping
  blockStyle: 'braces' | 'indent' | 'keywords' | 'parens' | 'brackets';
  blockStartKeyword: string; // e.g. '{', 'do', 'begin', 'shuru', 'karo', ':'
  blockEndKeyword: string;   // e.g. '}', 'end', 'bas', 'shesh', 'done'

  // 2. Statements & Punctuation Signs
  statementTerminator: 'none' | ';' | ';;' | '.' | 'newline';
  statementTerminatorPolicy: 'optional' | 'strict' | 'forbidden';
  commaPolicy: 'optional' | 'forbidden' | 'strict';

  // 3. Delimiter Signs for Calls, Lists & Groups
  callDelimiterStyle: 'parens' | 'brackets' | 'angles' | 'spaces'; // () vs [] vs <> vs space
  listDelimiterStyle: 'brackets' | 'angles' | 'braces'; // [1, 2] vs <1, 2> vs {1, 2}
  memberAccessSign: '.' | '->' | '::'; // object.field vs object->field vs object::field
  stringDelimiter: '"' | "'" | 'both';
  commentStyle: '#' | '//' | '--' | ';;';

  // 4. Variables, Types & Assignment Signs
  variableDeclMode: 'keyword' | 'auto';
  autoDeclareVariables: boolean;
  assignmentOperator: '=' | ':=' | '<-' | '->' | 'equals' | 'is' | 'be';
  typeAnnotationSign: 'none' | ':' | '::' | 'as'; // x: number vs x:: Int vs x as int

  // 5. Operators & Logic Signs
  equalityOperator: '==' | '===' | 'is' | 'equals' | 'hobe' | 'eq';
  inequalityOperator: '!=' | '<>' | '!==' | 'isnt' | 'hobena' | 'neq';
  andOperator: string; // 'and' | '&&' | '&' | 'aur' | 'ebong'
  orOperator: string;  // 'or' | '||' | '|' | 'ya' | 'othoba'
  notOperator: string; // 'not' | '!' | '~' | 'mat' | 'noy'
  pipeOperator: 'none' | '|>' | '>>' | '->' | 'pipe';

  // 6. Easy Calculator & Action Flow
  easyFlowMode?: boolean;
  chooseActionKeyword?: string; // e.g. 'inputchoose', 'choose', 'chuno', 'select'
  inputNumberActionKeyword?: string; // e.g. 'input1', 'input', 'dalo', 'lo'
  inputNumber2ActionKeyword?: string; // e.g. 'input2', 'dalo2', 'lo2'
  computeActionKeyword?: string; // e.g. 'execute', 'compute', 'calculate', 'hisab'
  outputActionKeyword?: string; // e.g. 'output', 'dikhao', 'show'
}

export interface TestCaseSpec {
  id: string;
  title: string;
  code: string;
  expectedOutput: string;
}

export interface CustomLanguageSpec {
  name: string;
  author: string;
  description: string;
  syntax: CustomSyntaxRules;
  keywords: {
    say: string;
    shout: string;
    whisper: string;
    ask: string;
    keep: string;
    lock: string;
    when: string;
    orwhen: string;
    otherwise: string;
    unless: string;
    repeat: string;
    times: string;
    count: string;
    from: string;
    to: string;
    each: string;
    in: string;
    while: string;
    recipe: string;
    give: string;
    yes: string;
    no: string;
    empty: string;
    celebrate: string;
    check: string;
    attempt: string;
    rescue: string;
    todo: string;
  };
  customFunctions: CustomFunctionSpec[];
  testCases: TestCaseSpec[];
  sampleCode: string;
}

export const STARTER_TEMPLATES: Record<string, CustomLanguageSpec> = {
  easycalc: {
    name: 'EasyCalc Flow',
    author: 'Human-First Labs',
    description: 'Ultra-simplified calculator & action-flow language. No programming boilerplate: write inputchoose(+, -, *, /), input1(a), input2(b), execute(a (op) b), and output in plain human style.',
    syntax: {
      blockStyle: 'braces',
      blockStartKeyword: '{',
      blockEndKeyword: '}',
      statementTerminator: 'none',
      statementTerminatorPolicy: 'optional',
      commaPolicy: 'optional',
      callDelimiterStyle: 'parens',
      listDelimiterStyle: 'brackets',
      memberAccessSign: '.',
      variableDeclMode: 'auto',
      assignmentOperator: '=',
      typeAnnotationSign: 'none',
      commentStyle: '#',
      equalityOperator: '==',
      inequalityOperator: '!=',
      andOperator: 'and',
      orOperator: 'or',
      notOperator: 'not',
      pipeOperator: '|>',
      stringDelimiter: 'both',
      autoDeclareVariables: true,
      easyFlowMode: true,
      chooseActionKeyword: 'inputchoose',
      inputNumberActionKeyword: 'input1',
      inputNumber2ActionKeyword: 'input2',
      computeActionKeyword: 'execute',
      outputActionKeyword: 'output',
    },
    keywords: {
      say: 'output',
      shout: 'shout',
      whisper: 'whisper',
      ask: 'input',
      keep: 'let',
      lock: 'fixed',
      when: 'if',
      orwhen: 'else_if',
      otherwise: 'else',
      unless: 'unless',
      repeat: 'repeat',
      times: 'times',
      count: 'count',
      from: 'from',
      to: 'to',
      each: 'for_each',
      in: 'in',
      while: 'while',
      recipe: 'action',
      give: 'return',
      yes: 'yes',
      no: 'no',
      empty: 'none',
      celebrate: 'jashn',
      check: 'verify',
      attempt: 'try',
      rescue: 'on_error',
      todo: 'todo',
    },
    customFunctions: [
      { id: 'ec1', name: 'square', params: 'x', body: 'x * x', description: 'Squares a number' },
      { id: 'ec2', name: 'average', params: 'a, b', body: '(a + b) / 2', description: 'Computes average of two numbers' },
    ],
    testCases: [
      { id: 'ect1', title: 'EasyCalc test', code: 'input1 = 20\ninput2 = 5\nexecute(input1 (/) input2) into ans\noutput ans', expectedOutput: '4' },
    ],
    sampleCode: `# EasyCalc Flow: Write a Calculator with Zero Hassle!
# Choose your operator, input two numbers, and execute.

inputchoose (/, *, +, -)

input1(a)
input2(b)

execute(a (inputchoose) b) into result
output "The calculated answer is:" result
jashn
`,
  },
  hinglish_pro: {
    name: 'Hinglish Logic Pro',
    author: 'IBP Architect',
    description: 'Hindi-English syntax with "karo...bas" logic blocks, zero commas required, and custom Hindi math functions.',
    syntax: {
      blockStyle: 'keywords',
      blockStartKeyword: 'karo',
      blockEndKeyword: 'bas',
      statementTerminator: 'none',
      statementTerminatorPolicy: 'optional',
      commaPolicy: 'forbidden',
      callDelimiterStyle: 'parens',
      listDelimiterStyle: 'brackets',
      memberAccessSign: '.',
      variableDeclMode: 'keyword',
      assignmentOperator: '=',
      typeAnnotationSign: 'none',
      commentStyle: '#',
      equalityOperator: '==',
      inequalityOperator: '!=',
      andOperator: 'aur',
      orOperator: 'ya',
      notOperator: 'mat',
      pipeOperator: '|>',
      stringDelimiter: 'both',
      autoDeclareVariables: false,
    },
    keywords: {
      say: 'bolo',
      shout: 'chillao',
      whisper: 'dhire',
      ask: 'pucho',
      keep: 'rakho',
      lock: 'pakka',
      when: 'agar',
      orwhen: 'warna_agar',
      otherwise: 'warna',
      unless: 'bina',
      repeat: 'dohrao',
      times: 'baar',
      count: 'gino',
      from: 'se',
      to: 'tak',
      each: 'har',
      in: 'mein',
      while: 'jabtak',
      recipe: 'tareeka',
      give: 'de_do',
      yes: 'haan',
      no: 'nahi',
      empty: 'khali',
      celebrate: 'jashn',
      check: 'dhyan_do',
      attempt: 'koshish',
      rescue: 'bachao',
      todo: 'karna_hai',
    },
    customFunctions: [
      { id: '1', name: 'jodo', params: 'a, b', body: 'a + b', description: 'Add two numbers' },
      { id: '2', name: 'guna', params: 'a, b', body: 'a * b', description: 'Multiply two numbers' },
      { id: '3', name: 'varg', params: 'x', body: 'x * x', description: 'Square of a number' },
    ],
    testCases: [
      { id: 't1', title: 'Square calculation', code: 'rakho s = varg(4)\nbolo s', expectedOutput: '16' },
      { id: 't2', title: 'Conditional logic', code: 'rakho x = 10\nagar x == 10 karo\n  bolo "Sahi"\nbas', expectedOutput: 'Sahi' },
    ],
    sampleCode: `# Hinglish Logic Pro (Zero Commas, karo...bas blocks)
rakho naam = "Ishant"
pakka LEVEL = 10

bolo "Namaste {naam}! Swagat hai aapka."

# Custom function call
rakho square_val = varg(5)
bolo "5 ka square hai:" square_val

# Condition with karo...bas block (No braces!)
agar LEVEL >= 10 karo
  chillao "Zabardast! Level Master unlocked!"
  jashn
bas warna karo
  bolo "Agla level jald aayega."
bas

# Built-in math calculation
bolo "Sum of 10 and 20:" jodo(10 20)
`,
  },

  bengali_logic: {
    name: 'Bengali Logic Pro',
    author: 'Eastern Script Lab',
    description: 'Intuitive Bengali-English syntax with "shuru...shesh" blocks, zero commas, and native reasoning tokens.',
    syntax: {
      blockStyle: 'keywords',
      blockStartKeyword: 'shuru',
      blockEndKeyword: 'shesh',
      statementTerminator: 'none',
      statementTerminatorPolicy: 'optional',
      commaPolicy: 'forbidden',
      callDelimiterStyle: 'parens',
      listDelimiterStyle: 'brackets',
      memberAccessSign: '.',
      variableDeclMode: 'keyword',
      assignmentOperator: '=',
      typeAnnotationSign: 'none',
      commentStyle: '//',
      equalityOperator: 'hobe',
      inequalityOperator: 'hobena',
      andOperator: 'ebong',
      orOperator: 'othoba',
      notOperator: 'noy',
      pipeOperator: '>>',
      stringDelimiter: 'both',
      autoDeclareVariables: false,
    },
    keywords: {
      say: 'lekho',
      shout: 'chikitso',
      whisper: 'chupchap',
      ask: 'jiggesh',
      keep: 'dhoro',
      lock: 'sthir',
      when: 'jodi',
      orwhen: 'na_hole_jodi',
      otherwise: 'na_hole',
      unless: 'chhara',
      repeat: 'barbar',
      times: 'bar',
      count: 'gonona',
      from: 'theke',
      to: 'porjonto',
      each: 'protiti',
      in: 'er_moddhe',
      while: 'jotokhon',
      recipe: 'niyom',
      give: 'ferot_dao',
      yes: 'sotto',
      no: 'mittha',
      empty: 'shunyo',
      celebrate: 'utsab',
      check: 'porikkha',
      attempt: 'chesta',
      rescue: 'shomadhan',
      todo: 'baki',
    },
    customFunctions: [
      { id: 'b1', name: 'jog', params: 'x, y', body: 'x + y', description: 'Add two numbers' },
      { id: 'b2', name: 'gun', params: 'x, y', body: 'x * y', description: 'Multiply two numbers' },
      { id: 'b3', name: 'borgo', params: 'n', body: 'n * n', description: 'Square a number' },
    ],
    testCases: [
      { id: 'bt1', title: 'Borgo test', code: 'dhoro r = borgo(6)\nlekho r', expectedOutput: '36' },
    ],
    sampleCode: `// Bengali Logic Pro: shuru...shesh blocks and native syntax
dhoro shongkha = 15
sthir SIMA = 10

lekho "Shongkha holo:" shongkha
lekho "Borgo holo:" borgo(shongkha)

jodi shongkha >= SIMA shuru
  chikitso "Sima par hoye geche!"
  utsab
shesh na_hole shuru
  lekho "Simar moddhe ache"
shesh
`,
  },

  pysimple: {
    name: 'PySimple',
    author: 'Python Enthusiast',
    description: 'Pythonic clean language: uses colons & indentation for blocks, "def", "print", "#" comments, and automatic variable declaration.',
    syntax: {
      blockStyle: 'indent',
      blockStartKeyword: ':',
      blockEndKeyword: '',
      statementTerminator: 'none',
      statementTerminatorPolicy: 'forbidden',
      commaPolicy: 'optional',
      callDelimiterStyle: 'parens',
      listDelimiterStyle: 'brackets',
      memberAccessSign: '.',
      variableDeclMode: 'auto',
      assignmentOperator: '=',
      typeAnnotationSign: 'none',
      commentStyle: '#',
      equalityOperator: '==',
      inequalityOperator: '!=',
      andOperator: 'and',
      orOperator: 'or',
      notOperator: 'not',
      pipeOperator: '|>',
      stringDelimiter: 'both',
      autoDeclareVariables: true,
    },
    keywords: {
      say: 'print',
      shout: 'PRINT_LOUD',
      whisper: 'print_soft',
      ask: 'input',
      keep: 'let',
      lock: 'CONST',
      when: 'if',
      orwhen: 'elif',
      otherwise: 'else',
      unless: 'unless',
      repeat: 'repeat',
      times: 'times',
      count: 'for_range',
      from: 'from',
      to: 'to',
      each: 'for',
      in: 'in',
      while: 'while',
      recipe: 'def',
      give: 'return',
      yes: 'True',
      no: 'False',
      empty: 'None',
      celebrate: 'cheer',
      check: 'assert',
      attempt: 'try',
      rescue: 'except',
      todo: 'todo',
    },
    customFunctions: [
      { id: 'p1', name: 'square', params: 'x', body: 'x * x', description: 'Calculate x²' },
      { id: 'p2', name: 'cube', params: 'x', body: 'x * x * x', description: 'Calculate x³' },
    ],
    testCases: [
      { id: 'pt1', title: 'Pythonic assignment', code: 'score = 42\nprint("Score is:", score)', expectedOutput: 'Score is: 42' },
    ],
    sampleCode: `# PySimple Language: Indentation blocks with colons & auto declaration
player = "Hero"
score = 95

print("Player:", player, "Score:", score)
print("Square of 7 is:", square(7))

if score >= 90:
  print("Outstanding performance!")
  cheer
else:
  print("Keep practicing!")

def calc_bonus(pts, mult):
  return pts * mult

print("Bonus points:", calc_bonus(score, 2))
`,
  },

  rubyclean: {
    name: 'RubyClean',
    author: 'Craftsman Code',
    description: 'Elegant Ruby-inspired dialect with "do...end" blocks, "def", "puts", and natural expression flow.',
    syntax: {
      blockStyle: 'keywords',
      blockStartKeyword: 'do',
      blockEndKeyword: 'end',
      statementTerminator: 'none',
      statementTerminatorPolicy: 'optional',
      commaPolicy: 'optional',
      callDelimiterStyle: 'parens',
      listDelimiterStyle: 'brackets',
      memberAccessSign: '.',
      variableDeclMode: 'auto',
      assignmentOperator: '=',
      typeAnnotationSign: 'none',
      commentStyle: '#',
      equalityOperator: '==',
      inequalityOperator: '!=',
      andOperator: 'and',
      orOperator: 'or',
      notOperator: 'not',
      pipeOperator: '>>',
      stringDelimiter: 'both',
      autoDeclareVariables: true,
    },
    keywords: {
      say: 'puts',
      shout: 'WARN',
      whisper: 'debug_log',
      ask: 'gets',
      keep: 'let',
      lock: 'FROZEN',
      when: 'if',
      orwhen: 'elsif',
      otherwise: 'else',
      unless: 'unless',
      repeat: 'loop',
      times: 'times',
      count: 'for',
      from: 'from',
      to: 'to',
      each: 'each',
      in: 'in',
      while: 'while',
      recipe: 'def',
      give: 'return',
      yes: 'true',
      no: 'false',
      empty: 'nil',
      celebrate: 'party',
      check: 'assert',
      attempt: 'begin',
      rescue: 'rescue',
      todo: 'todo',
    },
    customFunctions: [
      { id: 'r1', name: 'double_val', params: 'x', body: 'x * 2', description: 'Double number' },
    ],
    testCases: [
      { id: 'rt1', title: 'Ruby block logic', code: 'x = 10\nif x == 10 do\n  puts "Perfect"\nend', expectedOutput: 'Perfect' },
    ],
    sampleCode: `# RubyClean: Beautiful expressive syntax with do...end
title = "RubyClean Engine"
version = 3.2

puts "Running {title} v{version}"
puts "Double of 12 is:", double_val(12)

if version >= 3.0 do
  puts "Modern engine features enabled!"
  party
end else do
  puts "Legacy mode active."
end
`,
  },

  kidsscript: {
    name: 'Kids Block Script',
    author: 'Creative Academy',
    description: 'Friendly, encouraging language designed for beginners and young learners with plain English words.',
    syntax: {
      blockStyle: 'braces',
      blockStartKeyword: '{',
      blockEndKeyword: '}',
      statementTerminator: 'none',
      statementTerminatorPolicy: 'optional',
      commaPolicy: 'optional',
      callDelimiterStyle: 'parens',
      listDelimiterStyle: 'brackets',
      memberAccessSign: '.',
      variableDeclMode: 'keyword',
      assignmentOperator: '=',
      typeAnnotationSign: 'none',
      commentStyle: '//',
      equalityOperator: 'is',
      inequalityOperator: 'isnt',
      andOperator: 'and',
      orOperator: 'or',
      notOperator: 'not',
      pipeOperator: '|>',
      stringDelimiter: 'both',
      autoDeclareVariables: false,
    },
    keywords: {
      say: 'show',
      shout: 'say_loud',
      whisper: 'say_soft',
      ask: 'ask_player',
      keep: 'remember',
      lock: 'locked_box',
      when: 'when_true',
      orwhen: 'or_when_true',
      otherwise: 'otherwise_do',
      unless: 'unless_true',
      repeat: 'repeat_loop',
      times: 'times',
      count: 'count_up',
      from: 'from',
      to: 'to',
      each: 'for_each',
      in: 'in',
      while: 'keep_going_while',
      recipe: 'magic_trick',
      give: 'hand_back',
      yes: 'yes',
      no: 'no',
      empty: 'nothing',
      celebrate: 'confetti',
      check: 'make_sure',
      attempt: 'try_this',
      rescue: 'if_it_fails',
      todo: 'need_to_do',
    },
    customFunctions: [
      { id: 'k1', name: 'add_bonus', params: 'pts', body: 'pts + 100', description: 'Give 100 bonus stars' },
    ],
    testCases: [
      { id: 'kt1', title: 'Kid friendly output', code: 'remember stars = 50\nshow "Stars:" stars', expectedOutput: 'Stars: 50' },
    ],
    sampleCode: `// Kids Block Script: Friendly and simple!
remember pet_name = "Buddy"
remember treats = 5

show "Hello! My pet is {pet_name}."
show "Treats with bonus:", add_bonus(treats)

when_true treats >= 5 {
  say_loud "Buddy is super happy!"
  confetti
} otherwise_do {
  show "Time to fetch more treats!"
}
`,
  },

  science_lab: {
    name: 'Science & Lab Notebook',
    author: 'Research Lab',
    description: 'Scientific computation and laboratory modeling with precision units, constants, and hypothesis verification.',
    syntax: {
      blockStyle: 'braces',
      blockStartKeyword: '{',
      blockEndKeyword: '}',
      statementTerminator: ';',
      statementTerminatorPolicy: 'optional',
      commaPolicy: 'optional',
      callDelimiterStyle: 'angles',
      listDelimiterStyle: 'brackets',
      memberAccessSign: '::',
      variableDeclMode: 'keyword',
      assignmentOperator: ':=',
      typeAnnotationSign: ':',
      commentStyle: '#',
      equalityOperator: '==',
      inequalityOperator: '!=',
      andOperator: 'and',
      orOperator: 'or',
      notOperator: 'not',
      pipeOperator: '|>',
      stringDelimiter: 'both',
      autoDeclareVariables: false,
    },
    keywords: {
      say: 'display',
      shout: 'warning_alarm',
      whisper: 'telemetry_log',
      ask: 'measure_input',
      keep: 'sample',
      lock: 'constant',
      when: 'observe',
      orwhen: 're_observe',
      otherwise: 'conclude',
      unless: 'except',
      repeat: 'iterate',
      times: 'cycles',
      count: 'sweep',
      from: 'from',
      to: 'to',
      each: 'for_each_datum',
      in: 'in',
      while: 'maintain_while',
      recipe: 'formula',
      give: 'yield',
      yes: 'confirmed',
      no: 'refuted',
      empty: 'null_reading',
      celebrate: 'publish_discovery',
      check: 'verify_hypothesis',
      attempt: 'experiment',
      rescue: 'calibrate_sensor',
      todo: 'investigation_pending',
    },
    customFunctions: [
      { id: 's1', name: 'kinetic_energy', params: 'm, v', body: '0.5 * m * v * v', description: 'Calculate kinetic energy in Joules' },
      { id: 's2', name: 'newton_force', params: 'm, a', body: 'm * a', description: 'Force = mass * acceleration' },
    ],
    testCases: [
      { id: 'st1', title: 'Force formula', code: 'sample f := newton_force(10, 5);\ndisplay f;', expectedOutput: '50' },
    ],
    sampleCode: `# Science & Lab Notebook: Scientific calculation
constant SPEED_OF_LIGHT = 299792458;
sample mass := 80;
sample velocity := 12;

display "Mass (kg):", mass;
display "Velocity (m/s):", velocity;
display "Kinetic Energy (J):", kinetic_energy(mass, velocity);

observe velocity > 10 {
  display "Target is in high-speed kinematic regime.";
  publish_discovery;
} conclude {
  display "Low velocity observation recorded.";
}
`,
  },
};

// Helper: convert Pythonic indentation with colons into { } blocks
function convertIndentationToBraces(code: string): string {
  const lines = code.split('\n');
  const result: string[] = [];
  const indentStack: number[] = [0];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('--')) {
      result.push(rawLine);
      continue;
    }

    const currentIndent = rawLine.search(/\S/);

    while (indentStack.length > 1 && currentIndent < indentStack[indentStack.length - 1]) {
      indentStack.pop();
      result.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
    }

    let lineToPush = rawLine;

    // Check if line ends with a colon
    if (trimmed.endsWith(':')) {
      const withoutColon = rawLine.slice(0, rawLine.lastIndexOf(':'));
      lineToPush = withoutColon + ' {';
      let nextIndent = currentIndent + 2;
      for (let j = i + 1; j < lines.length; j++) {
        const nextTrimmed = lines[j].trim();
        if (nextTrimmed && !nextTrimmed.startsWith('#') && !nextTrimmed.startsWith('//') && !nextTrimmed.startsWith('--')) {
          nextIndent = lines[j].search(/\S/);
          break;
        }
      }
      indentStack.push(nextIndent);
    }

    result.push(lineToPush);
  }

  while (indentStack.length > 1) {
    indentStack.pop();
    result.push('}');
  }

  return result.join('\n');
}

// Generate EBNF Grammar specification string from language configuration
export function generateEBNFGrammar(spec: CustomLanguageSpec): string {
  const kw = spec.keywords;
  const syn = spec.syntax;

  return `(* =========================================================================
   Formal EBNF Grammar Specification for ${spec.name}
   Author: ${spec.author}
   Block Style: ${syn.blockStyle} | Statement Terminator: ${syn.statementTerminator}
   ========================================================================= *)

Program
  = { Statement } ;

Statement
  = OutputStmt
  | InputStmt
  | VarDeclStmt
  | AssignStmt
  | ConditionStmt
  | LoopStmt
  | RecipeDeclStmt
  | CelebrateStmt
  | ExprStmt ;

OutputStmt
  = ("${kw.say}" | "${kw.shout}" | "${kw.whisper}") ExpressionList [ "${syn.statementTerminator !== 'none' ? syn.statementTerminator : ''}" ] ;

InputStmt
  = "${kw.ask}" [ "number" | "text" ] Expression [ "into" Identifier ] [ "${syn.statementTerminator !== 'none' ? syn.statementTerminator : ''}" ] ;

VarDeclStmt
  = ("${kw.keep}" | "${kw.lock}") Identifier "${syn.assignmentOperator}" Expression [ "${syn.statementTerminator !== 'none' ? syn.statementTerminator : ''}" ] ;

AssignStmt
  = Identifier "${syn.assignmentOperator}" Expression [ "${syn.statementTerminator !== 'none' ? syn.statementTerminator : ''}" ] ;

ConditionStmt
  = "${kw.when}" Expression Block
    { "${kw.orwhen}" Expression Block }
    [ "${kw.otherwise}" Block ] ;

LoopStmt
  = "${kw.repeat}" Expression "${kw.times}" Block
  | "${kw.count}" Identifier "${kw.from}" Expression "${kw.to}" Expression Block
  | "${kw.each}" Identifier "${kw.in}" Expression Block
  | "${kw.while}" Expression Block ;

RecipeDeclStmt
  = "${kw.recipe}" Identifier "(" [ ParameterList ] ")" Block ;

CelebrateStmt
  = "${kw.celebrate}" ;

Block
  ${
    syn.blockStyle === 'keywords'
      ? `= "${syn.blockStartKeyword}" { Statement } "${syn.blockEndKeyword}" ;`
      : syn.blockStyle === 'indent'
      ? `= ":" Indent { Statement } Dedent ;`
      : `= "{" { Statement } "}" ;`
  }

Expression
  = LogicalOrExpr ;

LogicalOrExpr
  = LogicalAndExpr { "${syn.orOperator}" LogicalAndExpr } ;

LogicalAndExpr
  = EqualityExpr { "${syn.andOperator}" EqualityExpr } ;

EqualityExpr
  = RelationalExpr [ ("${syn.equalityOperator}" | "${syn.inequalityOperator}") RelationalExpr ] ;

ExpressionList
  ${
    syn.commaPolicy === 'forbidden'
      ? `= Expression { Expression } ;`
      : `= Expression { [ "," ] Expression } ;`
  }
`;
}

export const LangCraftApp: React.FC = () => {
  const { createFile } = useVFSStore();
  const { theme, openWindow } = useDesktopStore();
  const isLight = theme === 'light';

  const [activeTemplateKey, setActiveTemplateKey] = useState<string>('hinglish_pro');
  const [langSpec, setLangSpec] = useState<CustomLanguageSpec>(STARTER_TEMPLATES['hinglish_pro']);
  const [customCode, setCustomCode] = useState<string>(STARTER_TEMPLATES['hinglish_pro'].sampleCode);
  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transpiledPreview, setTranspiledPreview] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [savedToVFS, setSavedToVFS] = useState(false);
  const [projectCreatedMsg, setProjectCreatedMsg] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'editor' | 'syntax' | 'keywords' | 'functions' | 'grammar' | 'tests' | 'export'
  >('editor');
  const [rightPanelMode, setRightPanelMode] = useState<'output' | 'transpiled'>('output');

  // Test Suite Runner State
  const [testResults, setTestResults] = useState<
    Record<string, { passed: boolean; actual: string; expected: string }>
  >({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Custom function form
  const [newFnName, setNewFnName] = useState('');
  const [newFnParams, setNewFnParams] = useState('');
  const [newFnBody, setNewFnBody] = useState('');
  const [newFnDesc, setNewFnDesc] = useState('');

  // Switch Starter Blueprint
  const handleSelectTemplate = (key: string) => {
    setActiveTemplateKey(key);
    const tmpl = STARTER_TEMPLATES[key];
    if (tmpl) {
      setLangSpec(tmpl);
      setCustomCode(tmpl.sampleCode);
      setOutputLogs([]);
      setErrorMsg(null);
      setTestResults({});
    }
  };

  const handleUpdateKeyword = (key: keyof CustomLanguageSpec['keywords'], val: string) => {
    setLangSpec((prev) => ({
      ...prev,
      keywords: {
        ...prev.keywords,
        [key]: val,
      },
    }));
  };

  const handleUpdateSyntax = <K extends keyof CustomSyntaxRules>(key: K, val: CustomSyntaxRules[K]) => {
    setLangSpec((prev) => ({
      ...prev,
      syntax: {
        ...prev.syntax,
        [key]: val,
      },
    }));
  };

  const handleAddCustomFunction = () => {
    if (!newFnName.trim() || !newFnBody.trim()) return;
    const newFn: CustomFunctionSpec = {
      id: Date.now().toString(),
      name: newFnName.trim(),
      params: newFnParams.trim() || 'x',
      body: newFnBody.trim(),
      description: newFnDesc.trim() || `Custom logic function ${newFnName}`,
    };
    setLangSpec((prev) => ({
      ...prev,
      customFunctions: [...prev.customFunctions, newFn],
    }));
    setNewFnName('');
    setNewFnParams('');
    setNewFnBody('');
    setNewFnDesc('');
  };

  const handleDeleteCustomFunction = (id: string) => {
    setLangSpec((prev) => ({
      ...prev,
      customFunctions: prev.customFunctions.filter((f) => f.id !== id),
    }));
  };

  // Compile / Transpile custom language into canonical IBP
  const compileCustomCode = (source: string): string => {
    let code = source;
    const syn = langSpec.syntax;
    const kw = langSpec.keywords;

    // 0. Easy Action & Calculator Flow Normalization
    const chooseKw = (syn.chooseActionKeyword || 'inputchoose').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const input1Kw = (syn.inputNumberActionKeyword || 'input1').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const input2Kw = (syn.inputNumber2ActionKeyword || 'input2').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const computeKw = (syn.computeActionKeyword || 'execute').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const outputKw = (syn.outputActionKeyword || 'output').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 0A. Choose action: inputchoose (/,*,+,-) or choose op (+, -, *, /) or chuno op (+, -, *, /)
    code = code.replace(
      new RegExp(`^(\\s*)(?:${chooseKw}|inputchoose|choose|chuno|select)\\s+([a-zA-Z0-9_]+)\\s*(?:from)?\\s*\\(([^)]+)\\)`, 'gmi'),
      (match, indent, varName, options) => {
        return `${indent}ask "Choose operation (${options.trim()}):" into ${varName}`;
      }
    );
    code = code.replace(
      new RegExp(`^(\\s*)(?:${chooseKw}|inputchoose|choose|chuno|select)\\s*\\(([^)]+)\\)`, 'gmi'),
      (match, indent, options) => {
        return `${indent}ask "Choose operation (${options.trim()}):" into inputchoice`;
      }
    );

    // 0B. Input1 action: input1(number2) or input1(a) or input1 or dalo a or lo a
    code = code.replace(
      new RegExp(`^(\\s*)(?:${input1Kw}|input1|dalo1|ask1)\\s*\\(\\s*([a-zA-Z0-9_]*)\\s*\\)`, 'gmi'),
      (match, indent, varName) => {
        const dest = varName.trim() || 'input1';
        return `${indent}ask number "Enter first number:" into ${dest}`;
      }
    );
    code = code.replace(
      new RegExp(`^(\\s*)(?:${input1Kw}|input1|dalo1|ask1)\\s*$`, 'gmi'),
      (match, indent) => `${indent}ask number "Enter first number:" into input1`
    );
    code = code.replace(
      /^(\s*)(?:dalo|lo)\s+([a-zA-Z0-9_]+)\s*$/gmi,
      (match, indent, varName) => `${indent}ask number "Enter value for ${varName}:" into ${varName}`
    );

    // 0C. Input2 action: input2(number2) or input2(b) or input2
    code = code.replace(
      new RegExp(`^(\\s*)(?:${input2Kw}|input2|dalo2|ask2)\\s*\\(\\s*([a-zA-Z0-9_]*)\\s*\\)`, 'gmi'),
      (match, indent, varName) => {
        const dest = varName.trim() || 'input2';
        return `${indent}ask number "Enter second number:" into ${dest}`;
      }
    );
    code = code.replace(
      new RegExp(`^(\\s*)(?:${input2Kw}|input2|dalo2|ask2)\\s*$`, 'gmi'),
      (match, indent) => `${indent}ask number "Enter second number:" into input2`
    );

    // 0D. Dynamic execute / compute / hisab:
    code = code.replace(
      new RegExp(`^(\\s*)(?:${computeKw}|execute|compute|calculate|hisab)\\s*\\(\\s*([a-zA-Z0-9_]+)\\s*\\(\\s*([a-zA-Z0-9_]+)\\s*\\)\\s*([a-zA-Z0-9_]+)\\s*\\)(?:\\s+into\\s+([a-zA-Z0-9_]+))?`, 'gmi'),
      (match, indent, op1, opName, op2, intoVar) => {
        const dest = intoVar ? intoVar.trim() : 'result';
        const actualOp1 = op1 === 'input' ? 'input1' : op1;
        return `${indent}keep ${dest} = execute(${actualOp1}, ${opName}, ${op2})`;
      }
    );

    code = code.replace(
      new RegExp(`^(\\s*)(?:${computeKw}|execute|compute|calculate|hisab)\\s*\\(\\s*([a-zA-Z0-9_]+)\\s*,\\s*([a-zA-Z0-9_]+)\\s*,\\s*([a-zA-Z0-9_]+)\\s*\\)(?:\\s+into\\s+([a-zA-Z0-9_]+))?`, 'gmi'),
      (match, indent, op1, opName, op2, intoVar) => {
        const dest = intoVar ? intoVar.trim() : 'result';
        const actualOp1 = op1 === 'input' ? 'input1' : op1;
        return `${indent}keep ${dest} = execute(${actualOp1}, ${opName}, ${op2})`;
      }
    );

    code = code.replace(
      new RegExp(`^(\\s*)(?:${computeKw}|execute|compute|calculate|hisab)\\s+([a-zA-Z0-9_]+)\\s*=\\s*([a-zA-Z0-9_]+)\\s*\\(\\s*([a-zA-Z0-9_]+)\\s*\\)\\s*([a-zA-Z0-9_]+)`, 'gmi'),
      (match, indent, dest, op1, opName, op2) => {
        const actualOp1 = op1 === 'input' ? 'input1' : op1;
        return `${indent}keep ${dest} = execute(${actualOp1}, ${opName}, ${op2})`;
      }
    );

    code = code.replace(
      new RegExp(`(?:${computeKw}|execute|compute|calculate|hisab)\\s*\\(\\s*([a-zA-Z0-9_]+)\\s*\\(\\s*([a-zA-Z0-9_]+)\\s*\\)\\s*([a-zA-Z0-9_]+)\\s*\\)`, 'gi'),
      (match, op1, opName, op2) => {
        const actualOp1 = op1 === 'input' ? 'input1' : op1;
        return `execute(${actualOp1}, ${opName}, ${op2})`;
      }
    );

    // 0E. Output action: output, output result, output "Ans is:", res, dikhao ...
    code = code.replace(
      new RegExp(`^(\\s*)(?:${outputKw}|output|dikhao)\\s*$`, 'gmi'),
      (match, indent) => `${indent}say result`
    );
    code = code.replace(
      new RegExp(`^(\\s*)(?:${outputKw}|output|dikhao)\\s+(.+)$`, 'gmi'),
      (match, indent, rest) => `${indent}say ${rest}`
    );

    // 1. Comment Normalization
    if (syn.commentStyle === '//') {
      code = code.replace(/\/\/(.*)$/gm, '#$1');
    } else if (syn.commentStyle === '--') {
      code = code.replace(/--(.*)$/gm, '#$1');
    } else if (syn.commentStyle === ';;') {
      code = code.replace(/;;(.*)$/gm, '#$1');
    }

    // 2. Statement Terminator Stripping (e.g. trailing ; or ;;)
    if (syn.statementTerminator && syn.statementTerminator !== 'none') {
      const termEsc = syn.statementTerminator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      code = code.replace(new RegExp(termEsc + '\\s*$', 'gm'), '');
    }

    // 3. Block Style Transformation
    if (syn.blockStyle === 'indent') {
      code = convertIndentationToBraces(code);
    } else if (syn.blockStyle === 'keywords') {
      const startKw = syn.blockStartKeyword;
      const endKw = syn.blockEndKeyword;
      if (startKw) {
        const regexStart = new RegExp(`\\b${startKw}\\b`, 'g');
        code = code.replace(regexStart, '{');
      }
      if (endKw) {
        const regexEnd = new RegExp(`\\b${endKw}\\b`, 'g');
        code = code.replace(regexEnd, '}');
      }
    }

    // 4. String Delimiter Normalization
    if (syn.stringDelimiter === "'" || syn.stringDelimiter === 'both') {
      code = code.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (match, inner) => {
        const escaped = inner.replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
    }

    // 5. Call Delimiters & List Delimiters (<1, 2> -> [1, 2], fn <a, b> -> fn(a, b))
    if (syn.callDelimiterStyle === 'angles') {
      code = code.replace(/([a-zA-Z0-9_]+)\s*<([^>]+)>/g, '$1($2)');
    } else if (syn.callDelimiterStyle === 'brackets') {
      code = code.replace(/([a-zA-Z0-9_]+)\s*\[([^\]]+)\]/g, '$1($2)');
    }

    if (syn.listDelimiterStyle === 'angles') {
      code = code.replace(/<([^>]+)>/g, '[$1]');
    }

    // Member access sign (e.g. -> to .)
    if (syn.memberAccessSign === '->') {
      code = code.replace(/([a-zA-Z0-9_]+)->([a-zA-Z0-9_]+)/g, '$1.$2');
    }

    // 6. Comma Policy (Zero commas allowed / space-separated)
    if (syn.commaPolicy === 'forbidden') {
      code = code.replace(/\(([a-zA-Z0-9_"\.\s]+)\)/g, (match, inner) => {
        const tokens = inner.trim().split(/\s+/).filter(Boolean);
        return `(${tokens.join(', ')})`;
      });
      code = code.replace(/\[([a-zA-Z0-9_"\.\s]+)\]/g, (match, inner) => {
        const tokens = inner.trim().split(/\s+/).filter(Boolean);
        return `[${tokens.join(', ')}]`;
      });
      code = code.replace(/^(\s*(?:say|bolo|display|print|puts|show|📢)[^\n]+)$/gm, (line) => {
        return line.replace(/("[^"]*")\s+([a-zA-Z0-9_"])/g, '$1, $2');
      });
    }

    // 7. Operator Normalization
    if (syn.assignmentOperator !== '=') {
      const opEsc = syn.assignmentOperator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      code = code.replace(new RegExp(opEsc, 'g'), '=');
    }

    if (syn.equalityOperator !== '==') {
      code = code.replace(new RegExp(`\\b${syn.equalityOperator}\\b`, 'g'), '==');
    }
    if (syn.inequalityOperator !== '!=') {
      code = code.replace(new RegExp(`\\b${syn.inequalityOperator}\\b`, 'g'), '!=');
    }
    if (syn.andOperator !== 'and') {
      code = code.replace(new RegExp(`\\b${syn.andOperator}\\b`, 'g'), 'and');
    }
    if (syn.orOperator !== 'or') {
      code = code.replace(new RegExp(`\\b${syn.orOperator}\\b`, 'g'), 'or');
    }
    if (syn.notOperator !== 'not') {
      code = code.replace(new RegExp(`\\b${syn.notOperator}\\b`, 'g'), 'not');
    }

    // Pipe operator: x |> fn() -> fn(x)
    if (syn.pipeOperator && syn.pipeOperator !== 'none') {
      const pipeEsc = syn.pipeOperator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      code = code.replace(
        new RegExp(`([a-zA-Z0-9_]+)\\s*${pipeEsc}\\s*([a-zA-Z0-9_]+)\\s*\\(([^)]*)\\)`, 'g'),
        (match, val, fn, args) => {
          return `${fn}(${val}${args.trim() ? ', ' + args : ''})`;
        }
      );
    }

    // 8. Keyword Vocabulary Translation
    const mapping = Object.entries(kw);
    mapping.sort((a, b) => b[1].length - a[1].length);

    for (const [canonical, customWord] of mapping) {
      if (!customWord || customWord === canonical) continue;
      const escaped = customWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const isWord = /^[a-zA-Z0-9_]+$/.test(customWord);
      const regex = isWord ? new RegExp(`\\b${escaped}\\b`, 'g') : new RegExp(escaped, 'g');
      code = code.replace(regex, canonical);
    }

    // 9. Automatic Variable Declaration if enabled
    if (syn.variableDeclMode === 'auto' || syn.autoDeclareVariables) {
      code = code.replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^=].*)$/gm, (match, indent, name, value) => {
        if (['when', 'orwhen', 'while', 'if', 'return', 'give', 'def', 'recipe'].includes(name)) return match;
        return `${indent}keep ${name} = ${value}`;
      });
    }

    // 10. Inject Custom Logic Functions at the top
    let injectedHeader = '';
    if (langSpec.customFunctions.length > 0) {
      injectedHeader += `# --- Standard Library for ${langSpec.name} ---\n`;
      for (const fn of langSpec.customFunctions) {
        injectedHeader += `recipe ${fn.name}(${fn.params}) { give ${fn.body} }\n`;
      }
      injectedHeader += `# ------------------------------------------\n\n`;
    }

    return injectedHeader + code;
  };

  // Run Custom Code
  const handleRunCustomCode = () => {
    setOutputLogs([]);
    setErrorMsg(null);

    try {
      const transpiled = compileCustomCode(customCode);
      setTranspiledPreview(transpiled);

      const res = executeIBP(transpiled, {
        onEvent: (ev) => {
          if (ev.type === 'celebrate') {
            confetti({ particleCount: 80, spread: 70 });
          }
        },
      });

      if (res.error) {
        const rawErr = res.error as any;
        const formatted =
          typeof rawErr?.format === 'function'
            ? rawErr.format(transpiled)
            : rawErr?.message || String(rawErr);
        setErrorMsg(formatted);
      } else {
        setOutputLogs(res.output);
      }
    } catch (e: any) {
      setErrorMsg(e.message || String(e));
    }
  };

  // Run Language Test Suite
  const handleRunAllTests = () => {
    setIsRunningTests(true);
    const results: Record<string, { passed: boolean; actual: string; expected: string }> = {};

    for (const tc of langSpec.testCases) {
      try {
        const transpiled = compileCustomCode(tc.code);
        const res = executeIBP(transpiled);
        const actual = res.output.join('\n').trim();
        const expected = tc.expectedOutput.trim();
        const passed = actual === expected;
        results[tc.id] = { passed, actual, expected };
      } catch (e: any) {
        results[tc.id] = {
          passed: false,
          actual: `Error: ${e.message || String(e)}`,
          expected: tc.expectedOutput,
        };
      }
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  // Export: PDF Rulebook
  const handlePrintPDF = () => {
    printRulebookAsPDF(langSpec);
  };

  // Export: Markdown Rulebook
  const handleDownloadMarkdown = () => {
    const md = generateLanguageRulebookMarkdown(langSpec);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${langSpec.name.toLowerCase().replace(/\s+/g, '_')}_rulebook.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export: Standalone ibpcompiler.js CLI
  const handleDownloadCompiler = () => {
    const script = generateIBPCompilerScript(langSpec);
    const blob = new Blob([script], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ibpcompiler.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export: VS Code Starter Kit (.zip)
  const handleDownloadVSCodeKit = async () => {
    try {
      setIsZipping(true);
      const zipBlob = await generateVSCodePackageZip(langSpec);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${langSpec.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}_vscode_kit.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error creating VS Code package: ' + String(e));
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopySpec = () => {
    navigator.clipboard.writeText(JSON.stringify(langSpec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSpec = () => {
    const blob = new Blob([JSON.stringify(langSpec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${langSpec.name.toLowerCase().replace(/\s+/g, '_')}_spec.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToVFS = async () => {
    try {
      const fileName = `${langSpec.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.lang.json`;
      const path = `IBP://USERS/guest/languages/${fileName}`;
      await createFile(path, JSON.stringify(langSpec, null, 2));
      setSavedToVFS(true);
      setTimeout(() => setSavedToVFS(false), 2500);
    } catch (e) {
      alert('Failed to save to VFS: ' + String(e));
    }
  };

  const handleCreateStudioProject = async () => {
    try {
      const projSlug = langSpec.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const transpiled = compileCustomCode(customCode);
      const codePath = `IBP://USERS/guest/projects/${projSlug}_demo/main.ibp`;
      const sourcePath = `IBP://USERS/guest/projects/${projSlug}_demo/main.${projSlug}`;
      const specPath = `IBP://USERS/guest/languages/${projSlug}.lang.json`;

      await createFile(specPath, JSON.stringify(langSpec, null, 2));
      await createFile(sourcePath, customCode);
      await createFile(codePath, transpiled);

      setProjectCreatedMsg(`Created project at ${codePath}! Opening Studio...`);
      setTimeout(() => {
        setProjectCreatedMsg(null);
        openWindow('studio');
      }, 1500);
    } catch (e) {
      alert('Failed to create Studio project: ' + String(e));
    }
  };

  const handleRunInTerminal = async () => {
    try {
      const projSlug = langSpec.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const transpiled = compileCustomCode(customCode);
      const codePath = `IBP://USERS/guest/projects/${projSlug}_demo/main.ibp`;
      await createFile(codePath, transpiled);
      openWindow('terminal');
    } catch (e) {
      alert('Failed to launch Terminal: ' + String(e));
    }
  };

  // Keep transpiled preview updated whenever customCode changes
  useEffect(() => {
    try {
      setTranspiledPreview(compileCustomCode(customCode));
    } catch {
      // ignore
    }
  }, [customCode, langSpec]);

  const ebnfGrammar = useMemo(() => generateEBNFGrammar(langSpec), [langSpec]);
  const lineCount = useMemo(() => (customCode.match(/\n/g) || []).length + 1, [customCode]);

  return (
    <div
      className={`flex flex-col h-full font-sans text-xs select-text transition-colors ${
        isLight ? 'bg-[#F8FAFC] text-slate-800' : 'bg-[#0B1120] text-slate-100'
      }`}
    >
      {/* 1. Header Toolbar */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b transition-colors ${
          isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-[#0E1526] border-slate-800'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl shadow-sm border ${
              isLight
                ? 'bg-purple-50 border-purple-200 text-purple-600'
                : 'bg-gradient-to-br from-purple-500/20 to-sky-500/20 border-purple-500/40 text-purple-400'
            }`}
          >
            <Wand2 size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold flex items-center space-x-2">
              <span className={isLight ? 'text-slate-900 font-extrabold' : 'text-slate-100'}>LangCraft Studio</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                  isLight
                    ? 'bg-purple-100/80 text-purple-800 border-purple-200 font-semibold'
                    : 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                }`}
              >
                Full-Stack Language & Logic Engine
              </span>
            </h1>
            <p className={isLight ? 'text-slate-500 text-[10px]' : 'text-slate-400 text-[10px]'}>
              Design custom syntax, punctuations, logic rules & export standalone CLI compilers with printable PDF rulebooks
            </p>
          </div>
        </div>

        {/* Template Switcher */}
        <div className="flex items-center space-x-1.5 overflow-x-auto max-w-[55%] py-1">
          <span
            className={`text-[10px] uppercase font-bold tracking-wider mr-1 hidden sm:inline ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Blueprints:
          </span>
          {Object.entries(STARTER_TEMPLATES).map(([key, tmpl]) => (
            <button
              key={key}
              onClick={() => handleSelectTemplate(key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition whitespace-nowrap cursor-pointer ${
                activeTemplateKey === key
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm ring-1 ring-purple-400 font-bold'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Primary Navigation Tabs */}
      <div
        className={`flex items-center justify-between border-b px-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'
        }`}
      >
        <div className="flex space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'editor'
                ? isLight
                  ? 'border-purple-600 text-purple-700 bg-purple-50/70 font-bold'
                  : 'border-purple-400 text-purple-400 bg-slate-800/50'
                : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 size={14} />
            <span>IDE & Runner</span>
          </button>

          <button
            onClick={() => setActiveTab('syntax')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'syntax'
                ? isLight
                  ? 'border-purple-600 text-purple-700 bg-purple-50/70 font-bold'
                  : 'border-purple-400 text-purple-400 bg-slate-800/50'
                : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={14} />
            <span>Logic & Grammar Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('keywords')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'keywords'
                ? isLight
                  ? 'border-purple-600 text-purple-700 bg-purple-50/70 font-bold'
                  : 'border-purple-400 text-purple-400 bg-slate-800/50'
                : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 size={14} />
            <span>Keywords & Vocabulary</span>
          </button>

          <button
            onClick={() => setActiveTab('functions')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'functions'
                ? isLight
                  ? 'border-purple-600 text-purple-700 bg-purple-50/70 font-bold'
                  : 'border-purple-400 text-purple-400 bg-slate-800/50'
                : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes size={14} />
            <span>Standard Library ({langSpec.customFunctions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('grammar')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'grammar'
                ? isLight
                  ? 'border-purple-600 text-purple-700 bg-purple-50/70 font-bold'
                  : 'border-purple-400 text-purple-400 bg-slate-800/50'
                : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Live EBNF</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'tests'
                ? isLight
                  ? 'border-purple-600 text-purple-700 bg-purple-50/70 font-bold'
                  : 'border-purple-400 text-purple-400 bg-slate-800/50'
                : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Beaker size={14} />
            <span>Test Suite</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'export'
                ? isLight
                  ? 'border-purple-600 text-purple-700 bg-purple-50/70 font-bold'
                  : 'border-purple-400 text-purple-400 bg-slate-800/50'
                : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download size={14} />
            <span>Export & Rulebook</span>
          </button>
        </div>

        {activeTab === 'editor' && (
          <div className="flex items-center space-x-2 my-1">
            <button
              onClick={handleRunCustomCode}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition active:scale-95 cursor-pointer"
            >
              <Play size={12} fill="currentColor" />
              <span>Run {langSpec.name}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Tab Contents */}
      <div className="flex-1 overflow-hidden flex">
        {/* TAB 1: CODE EDITOR & RUNNER */}
        {activeTab === 'editor' && (
          <div className="flex-1 flex flex-col md:flex-row h-full">
            {/* Editor Pane */}
            <div
              className={`flex-1 flex flex-col border-r transition-colors ${
                isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-[#0B1120]'
              }`}
            >
              <div
                className={`flex items-center justify-between px-3.5 py-2 border-b text-[11px] font-mono ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0A0F1D] border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs" />
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                    {langSpec.name} Source
                  </span>
                  <span className={isLight ? 'text-slate-500 text-[10px]' : 'text-slate-500 text-[10px]'}>
                    (Blocks: {langSpec.syntax.blockStyle} | Separator: {langSpec.syntax.statementTerminator} | Commas: {langSpec.syntax.commaPolicy})
                  </span>
                </div>
                <button
                  onClick={() => setCustomCode(STARTER_TEMPLATES[activeTemplateKey]?.sampleCode || '')}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded transition cursor-pointer ${
                    isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <RotateCcw size={11} />
                  <span>Reset Sample</span>
                </button>
              </div>

              {/* Editor Workspace with Line Numbers */}
              <div className="flex-1 flex overflow-hidden">
                <div
                  className={`w-10 py-4 select-none text-right pr-2.5 font-mono text-[11px] overflow-hidden border-r ${
                    isLight
                      ? 'bg-slate-50/70 text-slate-400 border-slate-200'
                      : 'bg-[#080D1A] text-slate-600 border-slate-800'
                  }`}
                >
                  {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                    <div key={i} className="leading-relaxed">
                      {i + 1}
                    </div>
                  ))}
                </div>

                <textarea
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  spellCheck={false}
                  className={`flex-1 w-full p-4 font-mono text-xs resize-none focus:outline-none leading-relaxed transition-colors ${
                    isLight
                      ? 'bg-white text-slate-900 selection:bg-purple-100 placeholder-slate-400'
                      : 'bg-[#0B1120] text-sky-200 selection:bg-purple-900/60 placeholder-slate-600'
                  }`}
                  placeholder={`Write programs in ${langSpec.name}...`}
                />
              </div>
            </div>

            {/* Output & Transpiled Preview Pane */}
            <div
              className={`w-full md:w-[420px] flex flex-col border-t md:border-t-0 md:border-l transition-colors ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0E1526] border-slate-800'
              }`}
            >
              <div
                className={`flex items-center justify-between px-3 py-1.5 border-b ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex space-x-1">
                  <button
                    onClick={() => setRightPanelMode('output')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                      rightPanelMode === 'output'
                        ? isLight
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'bg-slate-800 text-sky-400'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Output Console
                  </button>
                  <button
                    onClick={() => setRightPanelMode('transpiled')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                      rightPanelMode === 'transpiled'
                        ? isLight
                          ? 'bg-white text-purple-700 shadow-sm'
                          : 'bg-slate-800 text-purple-400'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Transpiled IBP View
                  </button>
                </div>
                {outputLogs.length > 0 && rightPanelMode === 'output' && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {outputLogs.length} line(s)
                  </span>
                )}
              </div>

              {rightPanelMode === 'output' ? (
                <div
                  className={`flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5 transition-colors ${
                    isLight ? 'bg-white text-slate-800' : 'bg-[#080D1A] text-slate-200'
                  }`}
                >
                  {outputLogs.length === 0 && !errorMsg && (
                    <div className={`italic text-[11px] p-2 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Click{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">"Run {langSpec.name}"</strong> to compile
                      your custom grammar rules, inject standard library functions, and execute on the virtual machine.
                    </div>
                  )}

                  {outputLogs.map((line, idx) => (
                    <div key={idx} className={`flex items-start space-x-1.5 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                      <span className="text-emerald-600 dark:text-emerald-400 select-none font-bold">&gt;</span>
                      <span className="whitespace-pre-wrap">{line}</span>
                    </div>
                  ))}

                  {errorMsg && (
                    <div
                      className={`p-3 rounded-xl border text-[11px] whitespace-pre-wrap leading-relaxed shadow-lg ${
                        isLight
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                      }`}
                    >
                      <div className="font-bold mb-1 flex items-center space-x-1.5 text-rose-600 dark:text-rose-300">
                        <ShieldAlert size={14} className="text-rose-500" />
                        <span>Language Execution Notice</span>
                      </div>
                      {errorMsg}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-2 ${
                    isLight ? 'bg-white text-purple-900' : 'bg-[#070B14] text-purple-200'
                  }`}
                >
                  <div className={`text-[10px] italic ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Canonical intermediate representation compiled from your custom syntax and functions:
                  </div>
                  <pre
                    className={`whitespace-pre-wrap p-2.5 rounded-lg border leading-relaxed font-mono ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-slate-950/70 border-slate-800/80 text-purple-200'
                    }`}
                  >
                    {transpiledPreview}
                  </pre>
                </div>
              )}

              {/* Quick Language Summary Footer */}
              <div
                className={`p-3 border-t text-[10px] ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {langSpec.name} Specification
                  </span>
                  <span className="text-purple-600 dark:text-sky-400 font-mono font-semibold">
                    By {langSpec.author}
                  </span>
                </div>
                <div className={`leading-tight truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {langSpec.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOGIC & GRAMMAR RULES (DEEP CUSTOMIZATION ENGINE) */}
        {activeTab === 'syntax' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
            <div className={`border-b pb-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <Sliders size={18} className="text-purple-500" />
                <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                  Custom Logic, Syntax & Punctuation Rules Engine
                </span>
              </h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Fine-tune every structural sign, bracket, delimiter, terminator, and operator in {langSpec.name} from scratch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Block Delimiters & Scoping */}
              <div
                className={`p-5 border rounded-2xl space-y-3 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold">
                  <Braces size={16} className="text-sky-500" />
                  <span className={isLight ? 'text-slate-900 font-bold' : 'text-slate-200'}>
                    1. Block Delimiter & Nesting Signs
                  </span>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Choose how code blocks and nested statements are opened and closed:
                </p>

                <div className="space-y-2">
                  <label
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="blockStyle"
                      checked={langSpec.syntax.blockStyle === 'braces'}
                      onChange={() => handleUpdateSyntax('blockStyle', 'braces')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className={`font-semibold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        Curly Braces {'{ ... }'}
                      </span>
                      <span className="text-[10px] text-slate-500">C, C++, Rust, JavaScript standard</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="blockStyle"
                      checked={langSpec.syntax.blockStyle === 'indent'}
                      onChange={() => handleUpdateSyntax('blockStyle', 'indent')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className={`font-semibold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        Colons with Indentation {': ...'}
                      </span>
                      <span className="text-[10px] text-slate-500">Pythonic whitespace nesting (no closing symbol required)</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="blockStyle"
                      checked={langSpec.syntax.blockStyle === 'keywords'}
                      onChange={() => handleUpdateSyntax('blockStyle', 'keywords')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className={`font-semibold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        Word Enclosing Keywords
                      </span>
                      <span className="text-[10px] text-slate-500">e.g. karo...bas, begin...end, shuru...shesh, do...end</span>
                    </div>
                  </label>
                </div>

                {langSpec.syntax.blockStyle === 'keywords' && (
                  <div
                    className={`grid grid-cols-2 gap-2 pt-2 border-t ${
                      isLight ? 'border-slate-200' : 'border-slate-800'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Start Keyword
                      </span>
                      <input
                        type="text"
                        value={langSpec.syntax.blockStartKeyword}
                        onChange={(e) => handleUpdateSyntax('blockStartKeyword', e.target.value)}
                        className={`w-full px-2.5 py-1 rounded text-xs font-mono border ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-800'
                            : 'bg-slate-950 border-slate-700 text-sky-300'
                        }`}
                        placeholder="e.g. karo, begin, shuru"
                      />
                    </div>
                    <div>
                      <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Closing Keyword
                      </span>
                      <input
                        type="text"
                        value={langSpec.syntax.blockEndKeyword}
                        onChange={(e) => handleUpdateSyntax('blockEndKeyword', e.target.value)}
                        className={`w-full px-2.5 py-1 rounded text-xs font-mono border ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-800'
                            : 'bg-slate-950 border-slate-700 text-purple-300'
                        }`}
                        placeholder="e.g. bas, end, shesh"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Statement Terminators & Commas */}
              <div
                className={`p-5 border rounded-2xl space-y-3 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold">
                  <Hash size={16} className="text-emerald-500" />
                  <span className={isLight ? 'text-slate-900 font-bold' : 'text-slate-200'}>
                    2. Statement Terminators & Punctuation
                  </span>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Configure semicolons, commas, and line ending strictness:
                </p>

                <div className="space-y-3">
                  <div>
                    <span className={`text-[11px] block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Statement Terminator Sign:
                    </span>
                    <select
                      value={langSpec.syntax.statementTerminator}
                      onChange={(e) => handleUpdateSyntax('statementTerminator', e.target.value as any)}
                      className={`w-full px-2.5 py-1.5 border rounded-xl text-xs font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    >
                      <option value="none">None (Natural Newlines, like Python & Go)</option>
                      <option value=";">Semicolon (;) - Traditional C/Java/C# style</option>
                      <option value=";;">Double Semicolon (;;) - OCaml / F# style</option>
                      <option value=".">Period (.) - COBOL / Smalltalk style</option>
                    </select>
                  </div>

                  <div>
                    <span className={`text-[11px] block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Comma Syntax Policy:
                    </span>
                    <select
                      value={langSpec.syntax.commaPolicy}
                      onChange={(e) => handleUpdateSyntax('commaPolicy', e.target.value as any)}
                      className={`w-full px-2.5 py-1.5 border rounded-xl text-xs font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    >
                      <option value="forbidden">Zero Commas (Pure whitespace lists [1 2 3] and fn(x y))</option>
                      <option value="optional">Optional Commas (Users can include or omit commas freely)</option>
                      <option value="strict">Strict Commas (Commas required between arguments & collections)</option>
                    </select>
                  </div>

                  <div>
                    <span className={`text-[11px] block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Comment Sign Style:
                    </span>
                    <select
                      value={langSpec.syntax.commentStyle}
                      onChange={(e) => handleUpdateSyntax('commentStyle', e.target.value as any)}
                      className={`w-full px-2.5 py-1.5 border rounded-xl text-xs font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    >
                      <option value="#"># (Hash / Shell / Python)</option>
                      <option value="//">// (Double Slash / JS / Rust / Go)</option>
                      <option value="--">-- (Double Dash / SQL / Lua / Haskell)</option>
                      <option value=";;">;; (Double Semicolon / Lisp / Scheme)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Call Delimiters, List Signs & Quotes */}
              <div
                className={`p-5 border rounded-2xl space-y-3 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold">
                  <Quote size={16} className="text-amber-500" />
                  <span className={isLight ? 'text-slate-900 font-bold' : 'text-slate-200'}>
                    3. Call Signs, Brackets & String Delimiters
                  </span>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Customize function wrapping signs, brackets, and quotes:
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Call Wrapping:
                    </span>
                    <select
                      value={langSpec.syntax.callDelimiterStyle || 'parens'}
                      onChange={(e) => handleUpdateSyntax('callDelimiterStyle', e.target.value as any)}
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    >
                      <option value="parens">fn(x, y) - Parentheses</option>
                      <option value="brackets">fn[x, y] - Square Brackets</option>
                      <option value="angles">fn &lt;x, y&gt; - Angle Brackets</option>
                    </select>
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Collection / Array Sign:
                    </span>
                    <select
                      value={langSpec.syntax.listDelimiterStyle || 'brackets'}
                      onChange={(e) => handleUpdateSyntax('listDelimiterStyle', e.target.value as any)}
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    >
                      <option value="brackets">[1, 2, 3] - Brackets</option>
                      <option value="angles">&lt;1, 2, 3&gt; - Angles</option>
                    </select>
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      String Quotes Sign:
                    </span>
                    <select
                      value={langSpec.syntax.stringDelimiter}
                      onChange={(e) => handleUpdateSyntax('stringDelimiter', e.target.value as any)}
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    >
                      <option value="both">Both ("...") and ('...')</option>
                      <option value={'"'}>Double Quotes Only ("...")</option>
                      <option value={"'"}>Single Quotes Only ('...')</option>
                    </select>
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Property Access Sign:
                    </span>
                    <select
                      value={langSpec.syntax.memberAccessSign || '.'}
                      onChange={(e) => handleUpdateSyntax('memberAccessSign', e.target.value as any)}
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    >
                      <option value=".">. (Dot: object.field)</option>
                      <option value="->">-&gt; (Arrow: object-&gt;field)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Assignment, Variables & Operators */}
              <div
                className={`p-5 border rounded-2xl space-y-3 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold">
                  <Activity size={16} className="text-purple-500" />
                  <span className={isLight ? 'text-slate-900 font-bold' : 'text-slate-200'}>
                    4. Assignment, Variables & Logic Signs
                  </span>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Configure assignment operators, equality comparisons, and boolean logic:
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Assignment Operator:
                    </span>
                    <select
                      value={langSpec.syntax.assignmentOperator}
                      onChange={(e) => handleUpdateSyntax('assignmentOperator', e.target.value as any)}
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-emerald-700' : 'bg-slate-950 border-slate-700 text-emerald-300'
                      }`}
                    >
                      <option value="=">= (Standard Equal)</option>
                      <option value=":=">:= (Walrus / Pascal Assignment)</option>
                      <option value="<-">&lt;- (Arrow / R Assignment)</option>
                      <option value="equals">equals (English assignment)</option>
                      <option value="is">is (Speech assignment)</option>
                    </select>
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Equality Check Sign:
                    </span>
                    <input
                      type="text"
                      value={langSpec.syntax.equalityOperator}
                      onChange={(e) => handleUpdateSyntax('equalityOperator', e.target.value as any)}
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      AND Logic Sign:
                    </span>
                    <input
                      type="text"
                      value={langSpec.syntax.andOperator}
                      onChange={(e) => handleUpdateSyntax('andOperator', e.target.value)}
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-sky-300'
                      }`}
                    />
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      OR Logic Sign:
                    </span>
                    <input
                      type="text"
                      value={langSpec.syntax.orOperator}
                      onChange={(e) => handleUpdateSyntax('orOperator', e.target.value)}
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-sky-300'
                      }`}
                    />
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      NOT Logic Sign:
                    </span>
                    <input
                      type="text"
                      value={langSpec.syntax.notOperator}
                      onChange={(e) => handleUpdateSyntax('notOperator', e.target.value)}
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-sky-300'
                      }`}
                    />
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Pipe Flow Sign:
                    </span>
                    <select
                      value={langSpec.syntax.pipeOperator || 'none'}
                      onChange={(e) => handleUpdateSyntax('pipeOperator', e.target.value as any)}
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    >
                      <option value="none">None</option>
                      <option value="|&gt;">|&gt; (Elixir / F# / JS Pipe)</option>
                      <option value="&gt;&gt;">&gt;&gt; (Composition Pipe)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 6. Easy Action & Calculator Flow Signs */}
              <div
                className={`p-5 border rounded-2xl space-y-3 shadow-sm md:col-span-2 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold">
                    <Calculator size={16} className="text-pink-500" />
                    <span className={isLight ? 'text-slate-900 font-bold' : 'text-slate-200'}>
                      6. Easy Action & Calculator Flow Signs (Zero Boilerplate)
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500 font-semibold border border-pink-500/20">
                    Interactive Math & Calculator
                  </span>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Empower beginners to write interactive calculators and actions using ultra-simple human words like{' '}
                  <code className="text-pink-600 dark:text-pink-400 font-bold">inputchoose (+, -, *, /)</code>,{' '}
                  <code className="text-sky-600 dark:text-sky-400 font-bold">input1(a)</code>,{' '}
                  <code className="text-emerald-600 dark:text-emerald-400 font-bold">execute(a (op) b)</code>, and{' '}
                  <code className="text-purple-600 dark:text-purple-400 font-bold">output</code>. Customize each action keyword freely!
                </p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs pt-1">
                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Choose Action Word:
                    </span>
                    <input
                      type="text"
                      value={langSpec.syntax.chooseActionKeyword || 'inputchoose'}
                      onChange={(e) => handleUpdateSyntax('chooseActionKeyword', e.target.value)}
                      placeholder="e.g. inputchoose, chuno, select"
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono text-xs ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-pink-400'
                      }`}
                    />
                    <span className="text-[9px] text-slate-400">e.g. inputchoose (/, *, +, -)</span>
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Input 1 Word:
                    </span>
                    <input
                      type="text"
                      value={langSpec.syntax.inputNumberActionKeyword || 'input1'}
                      onChange={(e) => handleUpdateSyntax('inputNumberActionKeyword', e.target.value)}
                      placeholder="e.g. input1, dalo1, lo1"
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono text-xs ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-sky-400'
                      }`}
                    />
                    <span className="text-[9px] text-slate-400">e.g. input1(num1) or dalo a</span>
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Input 2 Word:
                    </span>
                    <input
                      type="text"
                      value={langSpec.syntax.inputNumber2ActionKeyword || 'input2'}
                      onChange={(e) => handleUpdateSyntax('inputNumber2ActionKeyword', e.target.value)}
                      placeholder="e.g. input2, dalo2, lo2"
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono text-xs ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-sky-400'
                      }`}
                    />
                    <span className="text-[9px] text-slate-400">e.g. input2(num2) or dalo b</span>
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Execute/Compute Word:
                    </span>
                    <input
                      type="text"
                      value={langSpec.syntax.computeActionKeyword || 'execute'}
                      onChange={(e) => handleUpdateSyntax('computeActionKeyword', e.target.value)}
                      placeholder="e.g. execute, compute, hisab"
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono text-xs ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-emerald-400'
                      }`}
                    />
                    <span className="text-[9px] text-slate-400">e.g. execute(a (op) b)</span>
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Output Word:
                    </span>
                    <input
                      type="text"
                      value={langSpec.syntax.outputActionKeyword || 'output'}
                      onChange={(e) => handleUpdateSyntax('outputActionKeyword', e.target.value)}
                      placeholder="e.g. output, dikhao, show"
                      className={`w-full px-2 py-1.5 border rounded-lg font-mono text-xs ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-purple-400'
                      }`}
                    />
                    <span className="text-[9px] text-slate-400">e.g. output result</span>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border text-[11px] font-mono flex items-center space-x-2 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-pink-500 font-bold">Live Flow Preview:</span>
                  <span className="truncate">
                    {langSpec.syntax.chooseActionKeyword || 'inputchoose'} (+, -, *, /) ➔{' '}
                    {langSpec.syntax.inputNumberActionKeyword || 'input1'}(a) ➔{' '}
                    {langSpec.syntax.inputNumber2ActionKeyword || 'input2'}(b) ➔{' '}
                    {langSpec.syntax.computeActionKeyword || 'execute'}(a (op) b) ➔{' '}
                    {langSpec.syntax.outputActionKeyword || 'output'} ans
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KEYWORDS & VOCABULARY */}
        {activeTab === 'keywords' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <div className={`border-b pb-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <Settings2 size={18} className="text-purple-500" />
                <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                  Vocabulary & Keyword Remapping
                </span>
              </h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Customize every single keyword in {langSpec.name}. Supports English, Hindi, Bengali, emojis, or any inventive lexicon!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(langSpec.keywords).map(([canonical, customWord]) => (
                <div
                  key={canonical}
                  className={`flex flex-col p-3 border rounded-xl space-y-1.5 shadow-sm transition ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-purple-600 dark:text-purple-400 font-bold">
                      {canonical}
                    </span>
                    <span className={`text-[9px] uppercase font-semibold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                      Canonical
                    </span>
                  </div>
                  <input
                    type="text"
                    value={customWord}
                    onChange={(e) => handleUpdateKeyword(canonical as any, e.target.value)}
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono focus:outline-none focus:border-purple-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white'
                        : 'bg-slate-950 border-slate-700 text-sky-200 focus:bg-black'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOM STANDARD LIBRARY & LOGIC FUNCTIONS */}
        {activeTab === 'functions' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <div className={`border-b pb-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <Boxes size={18} className="text-purple-500" />
                <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                  Standard Library Logic Builder
                </span>
              </h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Define built-in logic formulas and helper functions that ship natively with {langSpec.name}.
              </p>
            </div>

            {/* Add New Function Form */}
            <div
              className={`p-4 border rounded-xl space-y-3 shadow-md ${
                isLight ? 'bg-white border-purple-200' : 'bg-slate-900/80 border-purple-500/30'
              }`}
            >
              <span className="font-bold text-xs text-purple-600 dark:text-purple-300 flex items-center space-x-1.5">
                <Plus size={14} />
                <span>Add Built-in Function / Logic Formula</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Function Name
                  </span>
                  <input
                    type="text"
                    value={newFnName}
                    onChange={(e) => setNewFnName(e.target.value)}
                    placeholder="e.g. square, force"
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono focus:outline-none focus:border-purple-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-800'
                        : 'bg-slate-950 border-slate-700 text-sky-300'
                    }`}
                  />
                </div>

                <div>
                  <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Parameters
                  </span>
                  <input
                    type="text"
                    value={newFnParams}
                    onChange={(e) => setNewFnParams(e.target.value)}
                    placeholder="e.g. m, a"
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono focus:outline-none focus:border-purple-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-800'
                        : 'bg-slate-950 border-slate-700 text-emerald-300'
                    }`}
                  />
                </div>

                <div>
                  <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Description
                  </span>
                  <input
                    type="text"
                    value={newFnDesc}
                    onChange={(e) => setNewFnDesc(e.target.value)}
                    placeholder="e.g. Calculate Newton force"
                    className={`w-full px-2.5 py-1.5 border rounded-lg text-xs focus:outline-none focus:border-purple-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-800'
                        : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Logic Formula / Body Expression
                </span>
                <input
                  type="text"
                  value={newFnBody}
                  onChange={(e) => setNewFnBody(e.target.value)}
                  placeholder="e.g. m * a  or  0.5 * m * v * v"
                  className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono focus:outline-none focus:border-purple-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-purple-700'
                      : 'bg-slate-950 border-slate-700 text-purple-300'
                  }`}
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleAddCustomFunction}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow transition cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Register Function</span>
                </button>
              </div>
            </div>

            {/* Existing Functions List */}
            <div className="space-y-3">
              <span className={`font-bold text-xs uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Active Standard Library Functions ({langSpec.customFunctions.length})
              </span>

              {langSpec.customFunctions.length === 0 ? (
                <div
                  className={`p-4 border rounded-xl text-center text-xs italic ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  No custom functions registered. Add one above!
                </div>
              ) : (
                langSpec.customFunctions.map((fn) => (
                  <div
                    key={fn.id}
                    className={`flex items-center justify-between p-3 border rounded-xl transition ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                          {fn.name}({fn.params})
                        </span>
                        <span className={isLight ? 'text-slate-400 text-[10px]' : 'text-slate-500 text-[10px]'}>=&gt;</span>
                        <span
                          className={`font-mono text-xs px-2 py-0.5 rounded border ${
                            isLight
                              ? 'bg-slate-100 text-purple-700 border-slate-200'
                              : 'bg-slate-950 text-purple-300 border-slate-800'
                          }`}
                        >
                          {fn.body}
                        </span>
                      </div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {fn.description}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCustomFunction(fn.id)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isLight
                          ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                          : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                      }`}
                      title="Delete function"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: LIVE EBNF GRAMMAR GENERATOR */}
        {activeTab === 'grammar' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <div className={`border-b pb-3 flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div>
                <h2 className="text-base font-bold flex items-center space-x-2">
                  <FileSpreadsheet size={18} className="text-purple-500" />
                  <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                    Live EBNF Formal Grammar Specification
                  </span>
                </h2>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Auto-generated Extended Backus-Naur Form (EBNF) describing the complete formal syntax of {langSpec.name}.
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(ebnfGrammar);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Copied Grammar' : 'Copy EBNF'}</span>
              </button>
            </div>

            <div
              className={`p-4 rounded-2xl border font-mono text-xs leading-relaxed overflow-x-auto shadow-inner ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0A0F1D] border-slate-800 text-sky-200'
              }`}
            >
              <pre className="whitespace-pre-wrap">{ebnfGrammar}</pre>
            </div>
          </div>
        )}

        {/* TAB 6: TEST SUITE & ASSERTIONS */}
        {activeTab === 'tests' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <div className={`border-b pb-3 flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div>
                <h2 className="text-base font-bold flex items-center space-x-2">
                  <Beaker size={18} className="text-purple-500" />
                  <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                    Language Test Suite & Verification
                  </span>
                </h2>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Automated test cases to ensure {langSpec.name} transpiles and behaves correctly across test assertions.
                </p>
              </div>

              <button
                onClick={handleRunAllTests}
                disabled={isRunningTests}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={isRunningTests ? 'animate-spin' : ''} />
                <span>Run Test Suite</span>
              </button>
            </div>

            <div className="space-y-4">
              {langSpec.testCases.map((tc) => {
                const res = testResults[tc.id];
                return (
                  <div
                    key={tc.id}
                    className={`p-4 border rounded-xl space-y-3 transition ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        {tc.title}
                      </span>
                      {res && (
                        <span
                          className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            res.passed
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}
                        >
                          {res.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          <span>{res.passed ? 'PASSED' : 'FAILED'}</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Test Input Code:
                        </span>
                        <pre
                          className={`p-2 rounded border whitespace-pre-wrap ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-800'
                              : 'bg-slate-950 border-slate-800 text-sky-200'
                          }`}
                        >
                          {tc.code}
                        </pre>
                      </div>

                      <div>
                        <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Expected Output:
                        </span>
                        <pre
                          className={`p-2 rounded border whitespace-pre-wrap ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-800'
                              : 'bg-slate-950 border-slate-800 text-emerald-300'
                          }`}
                        >
                          {tc.expectedOutput}
                        </pre>
                        {res && !res.passed && (
                          <div className="mt-2 text-rose-500 text-[11px]">
                            <strong>Actual Output:</strong> {res.actual}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 7: EXPORT, PDF RULEBOOK & STANDALONE COMPILER */}
        {activeTab === 'export' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <div className={`border-b pb-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <Share2 size={18} className="text-purple-500" />
                <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                  Export Language: PDF Rulebook, IBP OS & Standalone PC Compiler
                </span>
              </h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Run your language inside IBP OS Studio/Terminal, download a publication-grade PDF rulebook, or run in VS Code on your PC with <code>ibpcompiler</code>.
              </p>
            </div>

            {projectCreatedMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/50 dark:text-emerald-200 flex items-center space-x-2 shadow-sm">
                <CheckCircle2 size={16} />
                <span className="font-semibold">{projectCreatedMsg}</span>
              </div>
            )}

            {/* 1. PDF Rulebook & Specification Manuals */}
            <div
              className={`p-5 border rounded-2xl space-y-3 shadow-sm ${
                isLight ? 'bg-white border-purple-200' : 'bg-slate-900/80 border-purple-500/30'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm">
                <Printer size={18} className="text-purple-600 dark:text-purple-400" />
                <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                  Language Rulebook & Manual (PDF / Markdown)
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Generate a formatted, publication-grade specification manual containing your architecture paradigms, complete signs table, keywords dictionary, EBNF grammar, and examples.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handlePrintPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 transition cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Download Language Rulebook (PDF)</span>
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <FileText size={14} />
                  <span>Download Rulebook (.md)</span>
                </button>

                <button
                  onClick={handleDownloadSpec}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <FileDown size={14} />
                  <span>Download Spec JSON</span>
                </button>
              </div>
            </div>

            {/* 2. Run Locally in VS Code on PC with ibpcompiler */}
            <div
              className={`p-5 border rounded-2xl space-y-3 shadow-sm ${
                isLight ? 'bg-white border-sky-200' : 'bg-slate-900/80 border-sky-500/30'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm">
                <Package size={18} className="text-sky-600 dark:text-sky-400" />
                <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                  Run in VS Code on PC with <code>ibpcompiler</code>
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Download the standalone CLI compiler <strong><code>ibpcompiler.js</code></strong> or a complete VS Code Starter Kit zip containing tasks, launch configs, and your custom language spec.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleDownloadVSCodeKit}
                  disabled={isZipping}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/30 transition cursor-pointer disabled:opacity-50"
                >
                  <Package size={15} />
                  <span>{isZipping ? 'Creating Zip...' : 'Download VS Code Starter Kit (.zip)'}</span>
                </button>

                <button
                  onClick={handleDownloadCompiler}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <TerminalSquare size={14} />
                  <span>Download ibpcompiler.js CLI</span>
                </button>
              </div>

              {/* Quick CLI command instructions */}
              <div
                className={`p-3 rounded-xl border text-[11px] font-mono leading-relaxed ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-950 border-slate-800 text-sky-200'
                }`}
              >
                <div className={`text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Quick Terminal Commands (PC / Mac / Linux):
                </div>
                <div>node ibpcompiler.js app.{langSpec.name.toLowerCase().replace(/[^a-z0-9]/g, '')} <span className="opacity-60"># Execute program</span></div>
                <div>node ibpcompiler.js app.{langSpec.name.toLowerCase().replace(/[^a-z0-9]/g, '')} --compile <span className="opacity-60"># Transpile to canonical IBP</span></div>
              </div>
            </div>

            {/* 3. Run inside IBP Virtual Operating System */}
            <div
              className={`p-5 border rounded-2xl space-y-3 shadow-sm ${
                isLight ? 'bg-white border-emerald-200' : 'bg-slate-900/80 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm">
                <FolderPlus size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                  Execute & Save Directly in IBP OS
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Save your language specification into the IBP Virtual File System (VFS) to run inside IBP Studio or the interactive Terminal.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleCreateStudioProject}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  <FolderPlus size={15} />
                  <span>Create Project & Open in Studio</span>
                </button>

                <button
                  onClick={handleRunInTerminal}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <Terminal size={14} />
                  <span>Run in Terminal</span>
                </button>

                <button
                  onClick={handleSaveToVFS}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {savedToVFS ? <Check size={14} className="text-emerald-600" /> : <Save size={14} />}
                  <span>{savedToVFS ? 'Saved to VFS!' : 'Save Spec to VFS'}</span>
                </button>

                <button
                  onClick={handleCopySpec}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
                </button>
              </div>
            </div>

            {/* Spec JSON Viewer */}
            <div
              className={`border rounded-2xl p-4 font-mono text-xs overflow-x-auto shadow-inner ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0A0F1D] border-slate-800 text-sky-200'
              }`}
            >
              <pre>{JSON.stringify(langSpec, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
