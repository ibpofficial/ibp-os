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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { executeIBP } from '@ibp/engine';
import { useVFSStore } from '../../stores/vfsStore';
import { useDesktopStore } from '../../stores/desktopStore';

export interface CustomFunctionSpec {
  id: string;
  name: string;
  params: string;
  body: string;
  description: string;
}

export interface CustomSyntaxRules {
  blockStyle: 'braces' | 'indent' | 'keywords';
  blockStartKeyword: string;
  blockEndKeyword: string;
  commaPolicy: 'optional' | 'forbidden' | 'strict';
  variableDeclMode: 'keyword' | 'auto';
  assignmentOperator: '=' | ':=' | '<-' | 'equals';
  commentStyle: '#' | '//' | '--';
  equalityOperator: '==' | '===' | 'is' | 'equals' | 'hobe';
  inequalityOperator: '!=' | '<>' | 'isnt' | 'hobena';
  andOperator: string;
  orOperator: string;
  notOperator: string;
  pipeOperator: '|>' | '>>' | 'pipe';
  stringDelimiter: '"' | "'" | 'both';
  autoDeclareVariables: boolean;
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
  hinglish_pro: {
    name: 'Hinglish Logic Pro',
    author: 'IBP Architect',
    description: 'Hindi-English syntax with "karo...bas" logic blocks, zero commas required, and custom Hindi math functions.',
    syntax: {
      blockStyle: 'keywords',
      blockStartKeyword: 'karo',
      blockEndKeyword: 'bas',
      commaPolicy: 'forbidden',
      variableDeclMode: 'keyword',
      assignmentOperator: '=',
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
      commaPolicy: 'forbidden',
      variableDeclMode: 'keyword',
      assignmentOperator: '=',
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
      commaPolicy: 'optional',
      variableDeclMode: 'auto',
      assignmentOperator: '=',
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
      commaPolicy: 'optional',
      variableDeclMode: 'auto',
      assignmentOperator: '=',
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
      commaPolicy: 'optional',
      variableDeclMode: 'keyword',
      assignmentOperator: '=',
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
      commaPolicy: 'optional',
      variableDeclMode: 'keyword',
      assignmentOperator: '=',
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
      { id: 'st1', title: 'Force formula', code: 'sample f = newton_force(10, 5)\ndisplay f', expectedOutput: '50' },
    ],
    sampleCode: `# Science & Lab Notebook: Scientific calculation
constant SPEED_OF_LIGHT = 299792458
sample mass = 80
sample velocity = 12

display "Mass (kg):", mass
display "Velocity (m/s):", velocity
display "Kinetic Energy (J):", kinetic_energy(mass, velocity)

observe velocity > 10 {
  display "Target is in high-speed kinematic regime."
  publish_discovery
} conclude {
  display "Low velocity observation recorded."
}
`,
  },

  emojiscript: {
    name: 'EmojiScript',
    author: 'Visual Coder',
    description: 'Iconic emoji-driven visual language for playful visual thinking.',
    syntax: {
      blockStyle: 'braces',
      blockStartKeyword: '{',
      blockEndKeyword: '}',
      commaPolicy: 'optional',
      variableDeclMode: 'keyword',
      assignmentOperator: '=',
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
      say: '📢',
      shout: '🔊',
      whisper: '🤫',
      ask: '❓_ask',
      keep: '📦',
      lock: '🔒',
      when: '❓',
      orwhen: '❔',
      otherwise: '❌',
      unless: '🚫',
      repeat: '🔁',
      times: '⏱️',
      count: '🔢',
      from: '▶️',
      to: '🏁',
      each: '👥',
      in: '📥',
      while: '🔄',
      recipe: '📜',
      give: '🎁',
      yes: '✅',
      no: '❎',
      empty: '🕳️',
      celebrate: '🎉',
      check: '🎯',
      attempt: '🧪',
      rescue: '🩹',
      todo: '📌',
    },
    customFunctions: [
      { id: 'e1', name: 'spark', params: 'a, b', body: 'a + b', description: 'Combine two energies' },
    ],
    testCases: [
      { id: 'et1', title: 'Emoji Spark', code: '📦 res = spark(10, 20)\n📢 res', expectedOutput: '30' },
    ],
    sampleCode: `📦 name = "Pixel"
🔒 MAX_POWER = 100

📢 "Hello {name}!"
📢 "Energy Boost:", spark(40, 60)

❓ MAX_POWER >= 100 {
  📢 "System at Full Throttle!"
} ❌ {
  📢 "Charging..."
}

🎉
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
   Block Style: ${syn.blockStyle} | Comma Policy: ${syn.commaPolicy}
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
  = ("${kw.say}" | "${kw.shout}" | "${kw.whisper}") ExpressionList ;

InputStmt
  = "${kw.ask}" [ "number" | "text" ] Expression [ "into" Identifier ] ;

VarDeclStmt
  = ("${kw.keep}" | "${kw.lock}") Identifier "${syn.assignmentOperator}" Expression ;

AssignStmt
  = Identifier "${syn.assignmentOperator}" Expression ;

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

    // 1. Comment Normalization
    if (langSpec.syntax.commentStyle === '//') {
      code = code.replace(/\/\/(.*)$/gm, '#$1');
    } else if (langSpec.syntax.commentStyle === '--') {
      code = code.replace(/--(.*)$/gm, '#$1');
    }

    // 2. Block Style Transformation
    if (langSpec.syntax.blockStyle === 'indent') {
      code = convertIndentationToBraces(code);
    } else if (langSpec.syntax.blockStyle === 'keywords') {
      const startKw = langSpec.syntax.blockStartKeyword;
      const endKw = langSpec.syntax.blockEndKeyword;
      if (startKw) {
        const regexStart = new RegExp(`\\b${startKw}\\b`, 'g');
        code = code.replace(regexStart, '{');
      }
      if (endKw) {
        const regexEnd = new RegExp(`\\b${endKw}\\b`, 'g');
        code = code.replace(regexEnd, '}');
      }
    }

    // 3. String Delimiter Normalization (if single quotes allowed)
    if (langSpec.syntax.stringDelimiter === "'" || langSpec.syntax.stringDelimiter === 'both') {
      // Normalize '...' into "..." while respecting internal escaped quotes
      code = code.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (match, inner) => {
        const escaped = inner.replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
    }

    // 4. Comma Policy (Zero commas allowed / space-separated)
    if (langSpec.syntax.commaPolicy === 'forbidden') {
      // Replace whitespace-separated arguments inside call parentheses like fn(a b) -> fn(a, b)
      code = code.replace(/\(([a-zA-Z0-9_"\.\s]+)\)/g, (match, inner) => {
        const tokens = inner.trim().split(/\s+/).filter(Boolean);
        return `(${tokens.join(', ')})`;
      });
      // Replace whitespace inside bracketed lists [1 2 3] -> [1, 2, 3]
      code = code.replace(/\[([a-zA-Z0-9_"\.\s]+)\]/g, (match, inner) => {
        const tokens = inner.trim().split(/\s+/).filter(Boolean);
        return `[${tokens.join(', ')}]`;
      });
      // Replace say statements with multiple space-delimited string/idents
      code = code.replace(/^(\s*(?:say|bolo|display|print|puts|show|📢)[^\n]+)$/gm, (line) => {
        return line.replace(/("[^"]*")\s+([a-zA-Z0-9_"])/g, '$1, $2');
      });
    }

    // 5. Operator Normalization
    if (langSpec.syntax.assignmentOperator !== '=') {
      const opEsc = langSpec.syntax.assignmentOperator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      code = code.replace(new RegExp(opEsc, 'g'), '=');
    }

    if (langSpec.syntax.equalityOperator !== '==') {
      code = code.replace(new RegExp(`\\b${langSpec.syntax.equalityOperator}\\b`, 'g'), '==');
    }
    if (langSpec.syntax.inequalityOperator !== '!=') {
      code = code.replace(new RegExp(`\\b${langSpec.syntax.inequalityOperator}\\b`, 'g'), '!=');
    }
    if (langSpec.syntax.andOperator !== 'and') {
      code = code.replace(new RegExp(`\\b${langSpec.syntax.andOperator}\\b`, 'g'), 'and');
    }
    if (langSpec.syntax.orOperator !== 'or') {
      code = code.replace(new RegExp(`\\b${langSpec.syntax.orOperator}\\b`, 'g'), 'or');
    }
    if (langSpec.syntax.notOperator !== 'not') {
      code = code.replace(new RegExp(`\\b${langSpec.syntax.notOperator}\\b`, 'g'), 'not');
    }

    // Pipe operator: x |> fn() -> fn(x)
    if (langSpec.syntax.pipeOperator) {
      const pipeEsc = langSpec.syntax.pipeOperator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      code = code.replace(
        new RegExp(`([a-zA-Z0-9_]+)\\s*${pipeEsc}\\s*([a-zA-Z0-9_]+)\\s*\\(([^)]*)\\)`, 'g'),
        (match, val, fn, args) => {
          return `${fn}(${val}${args.trim() ? ', ' + args : ''})`;
        }
      );
    }

    // 6. Keyword Vocabulary Translation
    const mapping = Object.entries(langSpec.keywords);
    mapping.sort((a, b) => b[1].length - a[1].length);

    for (const [canonical, customWord] of mapping) {
      if (!customWord || customWord === canonical) continue;
      const escaped = customWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const isWord = /^[a-zA-Z0-9_]+$/.test(customWord);
      const regex = isWord ? new RegExp(`\\b${escaped}\\b`, 'g') : new RegExp(escaped, 'g');
      code = code.replace(regex, canonical);
    }

    // 7. Automatic Variable Declaration if enabled
    if (langSpec.syntax.variableDeclMode === 'auto' || langSpec.syntax.autoDeclareVariables) {
      // Find lines that start with `identifier = value` without keep/lock
      code = code.replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^=].*)$/gm, (match, indent, name, value) => {
        // Skip keywords or special headers
        if (['when', 'orwhen', 'while', 'if', 'return', 'give'].includes(name)) return match;
        return `${indent}keep ${name} = ${value}`;
      });
    }

    // 8. Inject Custom Logic Functions at the top
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
      const fileName = `${langSpec.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.json`;
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
      const specPath = `IBP://USERS/guest/languages/${projSlug}.json`;

      await createFile(specPath, JSON.stringify(langSpec, null, 2));
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
                Language Architecture Suite
              </span>
            </h1>
            <p className={isLight ? 'text-slate-500 text-[10px]' : 'text-slate-400 text-[10px]'}>
              Design custom programming languages, syntax paradigms, logic rules & verified standard libraries
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
            <span>Logic & Grammar</span>
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
            <span>Keywords ({Object.keys(langSpec.keywords).length})</span>
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
            <span>Export & VFS</span>
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
                    (Blocks: {langSpec.syntax.blockStyle} | Commas: {langSpec.syntax.commaPolicy} | Quotes:{' '}
                    {langSpec.syntax.stringDelimiter})
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

        {/* TAB 2: LOGIC & GRAMMAR RULES */}
        {activeTab === 'syntax' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <div className={`border-b pb-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <Sliders size={18} className="text-purple-500" />
                <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                  Custom Logic & Syntax Rules
                </span>
              </h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Configure structural semantics: block structure, comma strictness, assignment operators, string quotation rules, and logic delimiters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Block Style */}
              <div
                className={`p-4 border rounded-xl space-y-3 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold">
                  <Braces size={16} className="text-sky-500" />
                  <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>Block Delimiter Logic</span>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  How code blocks and nesting scope are defined:
                </p>

                <div className="space-y-2">
                  <label
                    className={`flex items-center space-x-2 p-2.5 rounded-lg border cursor-pointer transition ${
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
                      <span className="text-[10px] text-slate-500">Traditional C/JavaScript/Rust style blocks</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-2 p-2.5 rounded-lg border cursor-pointer transition ${
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
                        Indentation with Colons (Pythonic)
                      </span>
                      <span className="text-[10px] text-slate-500">Blocks start with ':' and use whitespace indent (no braces)</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-2 p-2.5 rounded-lg border cursor-pointer transition ${
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
                        Word Keyword Pairs
                      </span>
                      <span className="text-[10px] text-slate-500">e.g. karo...bas, shuru...shesh, begin...end, do...end</span>
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
                      <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Start Word
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
                        placeholder="e.g. karo, begin"
                      />
                    </div>
                    <div>
                      <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        End Word
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
                        placeholder="e.g. bas, end"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Comma Policy */}
              <div
                className={`p-4 border rounded-xl space-y-3 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold">
                  <Sliders size={16} className="text-emerald-500" />
                  <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>Comma Syntax Policy</span>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Decide if lists and arguments require commas or allow pure whitespace:
                </p>

                <div className="space-y-2">
                  <label
                    className={`flex items-center space-x-2 p-2.5 rounded-lg border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="commaPolicy"
                      checked={langSpec.syntax.commaPolicy === 'forbidden'}
                      onChange={() => handleUpdateSyntax('commaPolicy', 'forbidden')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 block">
                        Zero Commas (Space-Separated)
                      </span>
                      <span className="text-[10px] text-slate-500">Clean arguments like [1 2 3] and fn(x y), no commas needed!</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-2 p-2.5 rounded-lg border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="commaPolicy"
                      checked={langSpec.syntax.commaPolicy === 'optional'}
                      onChange={() => handleUpdateSyntax('commaPolicy', 'optional')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className={`font-semibold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        Optional Commas
                      </span>
                      <span className="text-[10px] text-slate-500">User can include commas or omit them freely</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-2 p-2.5 rounded-lg border cursor-pointer transition ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="commaPolicy"
                      checked={langSpec.syntax.commaPolicy === 'strict'}
                      onChange={() => handleUpdateSyntax('commaPolicy', 'strict')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className={`font-semibold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        Strict Commas
                      </span>
                      <span className="text-[10px] text-slate-500">Commas mandatory between parameters and collection items</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Assignment Operator & Auto-Declaration */}
              <div
                className={`p-4 border rounded-xl space-y-3 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold">
                  <Activity size={16} className="text-amber-500" />
                  <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>
                    Variable Declaration & Assignment
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className={`text-[11px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Variable Declaration Mode:
                    </span>
                    <select
                      value={langSpec.syntax.variableDeclMode}
                      onChange={(e) => handleUpdateSyntax('variableDeclMode', e.target.value as any)}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-800'
                          : 'bg-slate-950 border-slate-700 text-sky-300'
                      }`}
                    >
                      <option value="keyword">Keyword-driven (requires 'keep', 'let', 'rakho', etc.)</option>
                      <option value="auto">Auto-declaration (e.g. x = 10 automatically declares variable)</option>
                    </select>
                  </div>

                  <div>
                    <span className={`text-[11px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Assignment Operator:
                    </span>
                    <select
                      value={langSpec.syntax.assignmentOperator}
                      onChange={(e) => handleUpdateSyntax('assignmentOperator', e.target.value as any)}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-800'
                          : 'bg-slate-950 border-slate-700 text-emerald-300'
                      }`}
                    >
                      <option value="=">= (Standard Equal)</option>
                      <option value=":=">:= (Walrus / Go / Pascal Assignment)</option>
                      <option value="<-">&lt;- (Arrow / R Assignment)</option>
                      <option value="equals">equals (English assignment)</option>
                    </select>
                  </div>

                  <div>
                    <span className={`text-[11px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      String Delimiter / Quotes:
                    </span>
                    <select
                      value={langSpec.syntax.stringDelimiter}
                      onChange={(e) => handleUpdateSyntax('stringDelimiter', e.target.value as any)}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-800'
                          : 'bg-slate-950 border-slate-700 text-purple-300'
                      }`}
                    >
                      <option value="both">Both Double ("...") & Single ('...') Quotes Allowed</option>
                      <option value={'"'}>Double Quotes Only ("...")</option>
                      <option value={"'"}>Single Quotes Only ('...')</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Logic Operators & Comments */}
              <div
                className={`p-4 border rounded-xl space-y-3 shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold">
                  <Terminal size={16} className="text-purple-500" />
                  <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>
                    Logic Operators & Comments
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Comment Style:
                    </span>
                    <select
                      value={langSpec.syntax.commentStyle}
                      onChange={(e) => handleUpdateSyntax('commentStyle', e.target.value as any)}
                      className={`w-full px-2 py-1 border rounded text-xs font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    >
                      <option value="#"># (Python/Shell Hash)</option>
                      <option value="//">// (C/JS Double Slash)</option>
                      <option value="--">-- (Lua/SQL Double Dash)</option>
                    </select>
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Equality Operator:
                    </span>
                    <input
                      type="text"
                      value={langSpec.syntax.equalityOperator}
                      onChange={(e) => handleUpdateSyntax('equalityOperator', e.target.value as any)}
                      className={`w-full px-2 py-1 border rounded text-xs font-mono ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      AND Operator:
                    </span>
                    <input
                      type="text"
                      value={langSpec.syntax.andOperator}
                      onChange={(e) => handleUpdateSyntax('andOperator', e.target.value)}
                      className={`w-full px-2 py-1 border rounded text-xs font-mono ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-sky-300'
                      }`}
                    />
                  </div>

                  <div>
                    <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      OR Operator:
                    </span>
                    <input
                      type="text"
                      value={langSpec.syntax.orOperator}
                      onChange={(e) => handleUpdateSyntax('orOperator', e.target.value)}
                      className={`w-full px-2 py-1 border rounded text-xs font-mono ${
                        isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-sky-300'
                      }`}
                    />
                  </div>

                  <div className="col-span-2">
                    <span className={`text-[10px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Pipe Flow Operator:
                    </span>
                    <select
                      value={langSpec.syntax.pipeOperator}
                      onChange={(e) => handleUpdateSyntax('pipeOperator', e.target.value as any)}
                      className={`w-full px-2 py-1 border rounded text-xs font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                      }`}
                    >
                      <option value="|=">None</option>
                      <option value="|&gt;">|&gt; (Elixir / F# / JS Pipe)</option>
                      <option value="&gt;&gt;">&gt;&gt; (Haskell Composition Pipe)</option>
                    </select>
                  </div>
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

        {/* TAB 7: EXPORT & VFS */}
        {activeTab === 'export' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto space-y-6">
            <div className={`border-b pb-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <Share2 size={18} className="text-purple-500" />
                <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>
                  Export, Share & Save to VFS
                </span>
              </h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Your custom language specification is fully serialized as portable JSON and can be packaged into projects.
              </p>
            </div>

            {projectCreatedMsg && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/50 dark:text-emerald-200 flex items-center space-x-2">
                <CheckCircle2 size={16} />
                <span>{projectCreatedMsg}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopySpec}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Copied Specification' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={handleDownloadSpec}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 transition cursor-pointer"
              >
                <Download size={14} />
                <span>Download .json Spec</span>
              </button>

              <button
                onClick={handleSaveToVFS}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/30 transition cursor-pointer"
              >
                {savedToVFS ? <Check size={14} className="text-emerald-200" /> : <Save size={14} />}
                <span>{savedToVFS ? 'Saved to VFS!' : 'Save to IBP OS VFS'}</span>
              </button>

              <button
                onClick={handleCreateStudioProject}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                <FolderPlus size={14} />
                <span>Create Project in IBP Studio</span>
              </button>
            </div>

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
