import React, { useState, useEffect } from 'react';
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
  Cpu,
  Layers,
  Settings2,
  Code2,
  Boxes,
  HelpCircle,
  FileCode,
  Save,
  Terminal,
  Activity,
  Sliders,
  Braces,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { executeIBP } from '@ibp/engine';
import { useVFSStore } from '../../stores/vfsStore';

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
  equalityOperator: '==' | '===' | 'is' | 'equals';
  inequalityOperator: '!=' | '<>' | 'isnt';
  andOperator: 'and' | '&&' | 'aur';
  orOperator: 'or' | '||' | 'ya';
  notOperator: 'not' | '!' | 'mat';
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
  };
  customFunctions: CustomFunctionSpec[];
  sampleCode: string;
}

export const STARTER_TEMPLATES: Record<string, CustomLanguageSpec> = {
  hinglish_pro: {
    name: 'Hinglish Logic',
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
    },
    keywords: {
      say: 'bolo',
      shout: 'chillao',
      whisper: 'dhire',
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
    },
    customFunctions: [
      { id: '1', name: 'jodo', params: 'a, b', body: 'a + b', description: 'Add two numbers' },
      { id: '2', name: 'guna', params: 'a, b', body: 'a * b', description: 'Multiply two numbers' },
      { id: '3', name: 'varg', params: 'x', body: 'x * x', description: 'Square of a number' },
    ],
    sampleCode: `# Hinglish Logic Language (Zero Commas, karo...bas blocks)
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

# Loop with custom jodo function
bolo "Sum of 10 and 20:" jodo(10 20)
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
    },
    keywords: {
      say: 'print',
      shout: 'PRINT_LOUD',
      whisper: 'print_soft',
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
    },
    customFunctions: [
      { id: 'p1', name: 'square', params: 'x', body: 'x * x', description: 'Calculate x²' },
      { id: 'p2', name: 'cube', params: 'x', body: 'x * x * x', description: 'Calculate x³' },
    ],
    sampleCode: `# PySimple Language: Indentation blocks with colons
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

  nocomma_speak: {
    name: 'Natural English (Zero Commas)',
    author: 'Easy Code Lab',
    description: 'Reads like natural speech with zero commas anywhere. Uses "begin...end" blocks and English assignment.',
    syntax: {
      blockStyle: 'keywords',
      blockStartKeyword: 'begin',
      blockEndKeyword: 'end',
      commaPolicy: 'forbidden',
      variableDeclMode: 'keyword',
      assignmentOperator: '=',
      commentStyle: '//',
      equalityOperator: 'is',
      inequalityOperator: 'isnt',
      andOperator: 'and',
      orOperator: 'or',
      notOperator: 'not',
    },
    keywords: {
      say: 'display',
      shout: 'announce',
      whisper: 'murmur',
      keep: 'let',
      lock: 'fixed',
      when: 'if',
      orwhen: 'else_if',
      otherwise: 'otherwise',
      unless: 'except_if',
      repeat: 'cycle',
      times: 'rounds',
      count: 'tally',
      from: 'starting',
      to: 'ending',
      each: 'iterate',
      in: 'inside',
      while: 'as_long_as',
      recipe: 'formula',
      give: 'yield',
      yes: 'affirmative',
      no: 'negative',
      empty: 'void',
      celebrate: 'party',
    },
    customFunctions: [
      { id: 'n1', name: 'triple', params: 'n', body: 'n * 3', description: 'Triples a number' },
      { id: 'n2', name: 'average', params: 'x, y', body: '(x + y) / 2', description: 'Average of two numbers' },
    ],
    sampleCode: `// Natural English with Zero Commas and begin...end
let greeting = "Welcome traveler"
display greeting

let num1 = 30
let num2 = 60
display "Average:" average(num1 num2)
display "Triple of 9 is:" triple(9)

if num2 is 60 begin
  announce "Condition met perfectly!"
  party
end otherwise begin
  display "Did not match"
end
`,
  },

  physicode: {
    name: 'PhysiCode',
    author: 'Quantum Academy',
    description: 'Designed for physics, kinematics, and scientific modeling with built-in mechanics and dynamics logic.',
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
    },
    keywords: {
      say: 'display',
      shout: 'alert',
      whisper: 'log',
      keep: 'state',
      lock: 'constant',
      when: 'test',
      orwhen: 'retest',
      otherwise: 'fallback',
      unless: 'except',
      repeat: 'simulate',
      times: 'steps',
      count: 'sweep',
      from: 'from',
      to: 'to',
      each: 'for_sample',
      in: 'in',
      while: 'integrate',
      recipe: 'equation',
      give: 'yield',
      yes: 'valid',
      no: 'invalid',
      empty: 'null_vector',
      celebrate: 'converge',
    },
    customFunctions: [
      { id: 'ph1', name: 'kineticEnergy', params: 'm, v', body: '0.5 * m * v * v', description: 'Kinetic energy (Joules)' },
      { id: 'ph2', name: 'potentialEnergy', params: 'm, h', body: 'm * 9.80665 * h', description: 'Gravitational potential energy' },
      { id: 'ph3', name: 'momentum', params: 'm, v', body: 'm * v', description: 'Linear momentum (kg·m/s)' },
      { id: 'ph4', name: 'gravForce', params: 'm1, m2, r', body: '(6.674e-11 * m1 * m2) / (r * r)', description: 'Newtonian gravitational attraction' },
    ],
    sampleCode: `# PhysiCode: Kinematics & Mechanics Simulation
constant G = 9.80665
state mass = 1200
state velocity = 30
state altitude = 50

display "Vehicle Mass (kg):", mass
display "Kinetic Energy (J):", kineticEnergy(mass, velocity)
display "Potential Energy (J):", potentialEnergy(mass, altitude)
display "Total Momentum (kg·m/s):", momentum(mass, velocity)

test velocity >= 25 {
  alert "High Velocity Warning: Kinetic energy is critical!"
} fallback {
  display "Velocity within nominal boundary."
}

converge
`,
  },

  emojiscript: {
    name: 'EmojiScript',
    author: 'Visual Coder',
    description: 'Iconic emoji-driven visual language for younger learners and fun visual thinking.',
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
    },
    keywords: {
      say: '📢',
      shout: '🔊',
      whisper: '🤫',
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
    },
    customFunctions: [
      { id: 'e1', name: 'spark', params: 'a, b', body: 'a + b', description: 'Combine two energies' },
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

export const LangCraftApp: React.FC = () => {
  const { createFile } = useVFSStore();
  const [activeTemplateKey, setActiveTemplateKey] = useState<string>('hinglish_pro');
  const [langSpec, setLangSpec] = useState<CustomLanguageSpec>(STARTER_TEMPLATES['hinglish_pro']);
  const [customCode, setCustomCode] = useState<string>(STARTER_TEMPLATES['hinglish_pro'].sampleCode);
  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transpiledPreview, setTranspiledPreview] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [savedToVFS, setSavedToVFS] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'syntax' | 'keywords' | 'functions' | 'export'>('editor');
  const [rightPanelMode, setRightPanelMode] = useState<'output' | 'transpiled'>('output');

  // Custom function form
  const [newFnName, setNewFnName] = useState('');
  const [newFnParams, setNewFnParams] = useState('');
  const [newFnBody, setNewFnBody] = useState('');
  const [newFnDesc, setNewFnDesc] = useState('');

  const handleSelectTemplate = (key: string) => {
    setActiveTemplateKey(key);
    const tmpl = STARTER_TEMPLATES[key];
    if (tmpl) {
      setLangSpec(tmpl);
      setCustomCode(tmpl.sampleCode);
      setOutputLogs([]);
      setErrorMsg(null);
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

    // 3. Comma Policy (Zero commas allowed / space-separated)
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
      code = code.replace(/^(\s*(?:say|bolo|display|print|📢)[^\n]+)$/gm, (line) => {
        return line.replace(/("[^"]*")\s+([a-zA-Z0-9_"])/g, '$1, $2');
      });
    }

    // 4. Operator Normalization
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

    // 5. Keyword Vocabulary Translation
    const mapping = Object.entries(langSpec.keywords);
    mapping.sort((a, b) => b[1].length - a[1].length);

    for (const [canonical, customWord] of mapping) {
      if (!customWord || customWord === canonical) continue;
      const escaped = customWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const isWord = /^[a-zA-Z0-9_]+$/.test(customWord);
      const regex = isWord ? new RegExp(`\\b${escaped}\\b`, 'g') : new RegExp(escaped, 'g');
      code = code.replace(regex, canonical);
    }

    // 6. Automatic Variable Declaration if enabled
    if (langSpec.syntax.variableDeclMode === 'auto') {
      // Find lines that start with `identifier = value` without keep/lock
      code = code.replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^=].*)$/gm, (match, indent, name, value) => {
        // Skip if inside block header or comparison
        return `${indent}keep ${name} = ${value}`;
      });
    }

    // 7. Inject Custom Logic Functions at the top
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
        setErrorMsg(res.error.format(transpiled));
      } else {
        setOutputLogs(res.output);
      }
    } catch (e: any) {
      setErrorMsg(e.message || String(e));
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
      const fileName = `${langSpec.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.json`;
      const path = `IBP://USERS/guest/languages/${fileName}`;
      await createFile(path, JSON.stringify(langSpec, null, 2));
      setSavedToVFS(true);
      setTimeout(() => setSavedToVFS(false), 2500);
    } catch (e) {
      alert('Failed to save to VFS: ' + String(e));
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

  return (
    <div className="flex flex-col h-full bg-[#0B1120] text-slate-100 font-sans text-xs select-text">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0E1526] border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-sky-500/20 border border-purple-500/40 rounded-xl text-purple-400 shadow-md">
            <Wand2 size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span>LangCraft Studio</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-[10px] text-purple-300 border border-purple-800/60 font-mono">
                Full-Stack Language Engine
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Design custom programming languages, logic systems, syntax & standard libraries</p>
          </div>
        </div>

        {/* Template Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Blueprints:</span>
          {Object.entries(STARTER_TEMPLATES).map(([key, tmpl]) => (
            <button
              key={key}
              onClick={() => handleSelectTemplate(key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                activeTemplateKey === key
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Primary Navigation Tabs */}
      <div className="flex items-center justify-between bg-[#111827] border-b border-slate-800 px-4">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'editor'
                ? 'border-purple-400 text-purple-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 size={14} />
            <span>IDE & Live Runner</span>
          </button>

          <button
            onClick={() => setActiveTab('syntax')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'syntax'
                ? 'border-purple-400 text-purple-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={14} />
            <span>Logic & Grammar Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('keywords')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'keywords'
                ? 'border-purple-400 text-purple-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 size={14} />
            <span>Keywords & Vocabulary</span>
          </button>

          <button
            onClick={() => setActiveTab('functions')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'functions'
                ? 'border-purple-400 text-purple-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes size={14} />
            <span>Standard Library ({langSpec.customFunctions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'export'
                ? 'border-purple-400 text-purple-400 bg-slate-800/50'
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
              className="flex items-center space-x-1.5 px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-900/30 transition active:scale-95"
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
            <div className="flex-1 flex flex-col border-r border-slate-800">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0A0F1D] border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-slate-200 font-semibold">{langSpec.name} Program</span>
                  <span className="text-slate-500 text-[10px]">
                    (Blocks: {langSpec.syntax.blockStyle} | Commas: {langSpec.syntax.commaPolicy})
                  </span>
                </div>
                <button
                  onClick={() => setCustomCode(STARTER_TEMPLATES[activeTemplateKey]?.sampleCode || '')}
                  className="flex items-center space-x-1 text-slate-400 hover:text-slate-200"
                >
                  <RotateCcw size={11} />
                  <span>Reset Sample</span>
                </button>
              </div>

              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full p-4 bg-[#0B1120] text-sky-200 font-mono text-xs resize-none focus:outline-none leading-relaxed"
                placeholder={`Write programs in ${langSpec.name}...`}
              />
            </div>

            {/* Output & Transpiled Preview Pane */}
            <div className="w-full md:w-96 bg-[#0E1526] flex flex-col border-t md:border-t-0 md:border-l border-slate-800">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setRightPanelMode('output')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                      rightPanelMode === 'output' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Output Console
                  </button>
                  <button
                    onClick={() => setRightPanelMode('transpiled')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                      rightPanelMode === 'transpiled' ? 'bg-slate-800 text-purple-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    IBP Transpiler View
                  </button>
                </div>
                {outputLogs.length > 0 && rightPanelMode === 'output' && (
                  <span className="text-[10px] text-emerald-400 font-mono">{outputLogs.length} line(s)</span>
                )}
              </div>

              {rightPanelMode === 'output' ? (
                <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#080D1A]">
                  {outputLogs.length === 0 && !errorMsg && (
                    <div className="text-slate-500 italic text-[11px] p-2 leading-relaxed">
                      Click <strong className="text-emerald-400">"Run {langSpec.name}"</strong> to compile your custom grammar, apply logic transformations, and execute on the IBP VM.
                    </div>
                  )}

                  {outputLogs.map((line, idx) => (
                    <div key={idx} className="text-slate-200 flex items-start space-x-1.5">
                      <span className="text-emerald-500 select-none font-bold">&gt;</span>
                      <span className="whitespace-pre-wrap">{line}</span>
                    </div>
                  ))}

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[11px] whitespace-pre-wrap leading-relaxed shadow-lg">
                      <div className="font-bold text-rose-400 mb-1 flex items-center space-x-1.5">
                        <span>Compile / Execution Notice</span>
                      </div>
                      {errorMsg}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] bg-[#070B14] text-purple-200 space-y-2">
                  <div className="text-[10px] text-slate-500 italic">
                    This is the canonical IBP intermediate representation compiled from your custom grammar and injected functions:
                  </div>
                  <pre className="whitespace-pre-wrap bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                    {transpiledPreview}
                  </pre>
                </div>
              )}

              {/* Quick Language Summary Footer */}
              <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[10px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-300 uppercase tracking-wider">{langSpec.name} Logic Spec</span>
                  <span className="text-sky-400 font-mono">By {langSpec.author}</span>
                </div>
                <div className="text-slate-400 leading-tight truncate">{langSpec.description}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOGIC & GRAMMAR RULES */}
        {activeTab === 'syntax' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Sliders size={18} className="text-purple-400" />
                <span>Custom Logic & Syntax Rules</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Configure fundamental language semantics: block structure, comma strictness, assignment operators, and comments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Block Style */}
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-slate-200 font-bold">
                  <Braces size={16} className="text-sky-400" />
                  <span>Block Delimiter Logic</span>
                </div>
                <p className="text-[11px] text-slate-400">How code blocks and nesting are defined:</p>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/50 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="blockStyle"
                      checked={langSpec.syntax.blockStyle === 'braces'}
                      onChange={() => handleUpdateSyntax('blockStyle', 'braces')}
                      className="text-purple-500 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Curly Braces {'{ ... }'}</span>
                      <span className="text-[10px] text-slate-500">Traditional C/JavaScript/Rust style blocks</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/50 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="blockStyle"
                      checked={langSpec.syntax.blockStyle === 'indent'}
                      onChange={() => handleUpdateSyntax('blockStyle', 'indent')}
                      className="text-purple-500 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Indentation with Colons (Pythonic)</span>
                      <span className="text-[10px] text-slate-500">Blocks start with ':' and use whitespace indent (no braces)</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/50 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="blockStyle"
                      checked={langSpec.syntax.blockStyle === 'keywords'}
                      onChange={() => handleUpdateSyntax('blockStyle', 'keywords')}
                      className="text-purple-500 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Word Keyword Pairs</span>
                      <span className="text-[10px] text-slate-500">e.g. karo...bas, begin...end, do...end</span>
                    </div>
                  </label>
                </div>

                {langSpec.syntax.blockStyle === 'keywords' && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Start Word</span>
                      <input
                        type="text"
                        value={langSpec.syntax.blockStartKeyword}
                        onChange={(e) => handleUpdateSyntax('blockStartKeyword', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-sky-300"
                        placeholder="e.g. karo, begin"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">End Word</span>
                      <input
                        type="text"
                        value={langSpec.syntax.blockEndKeyword}
                        onChange={(e) => handleUpdateSyntax('blockEndKeyword', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-purple-300"
                        placeholder="e.g. bas, end"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Comma Policy */}
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-slate-200 font-bold">
                  <Sliders size={16} className="text-emerald-400" />
                  <span>Comma Syntax Policy</span>
                </div>
                <p className="text-[11px] text-slate-400">Decide if lists and arguments require commas or allow zero commas:</p>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/50 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="commaPolicy"
                      checked={langSpec.syntax.commaPolicy === 'forbidden'}
                      onChange={() => handleUpdateSyntax('commaPolicy', 'forbidden')}
                      className="text-purple-500 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-emerald-400 block">Zero Commas (Pure Whitespace)</span>
                      <span className="text-[10px] text-slate-500">Clean arguments like [1 2 3] and fn(x y), no commas needed!</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/50 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="commaPolicy"
                      checked={langSpec.syntax.commaPolicy === 'optional'}
                      onChange={() => handleUpdateSyntax('commaPolicy', 'optional')}
                      className="text-purple-500 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Optional Commas</span>
                      <span className="text-[10px] text-slate-500">User can include commas or omit them freely</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/50 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="commaPolicy"
                      checked={langSpec.syntax.commaPolicy === 'strict'}
                      onChange={() => handleUpdateSyntax('commaPolicy', 'strict')}
                      className="text-purple-500 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Strict Commas</span>
                      <span className="text-[10px] text-slate-500">Commas mandatory between parameters and collection items</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Assignment Operator & Variable Declaration */}
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-slate-200 font-bold">
                  <Activity size={16} className="text-amber-400" />
                  <span>Variable Declaration & Assignment</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Variable Declaration Style:</span>
                    <select
                      value={langSpec.syntax.variableDeclMode}
                      onChange={(e) => handleUpdateSyntax('variableDeclMode', e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-sky-300"
                    >
                      <option value="keyword">Keyword-driven (requires 'keep', 'let', 'rakho', etc.)</option>
                      <option value="auto">Auto-assign (e.g. x = 10 automatically declares variable)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Assignment Operator:</span>
                    <select
                      value={langSpec.syntax.assignmentOperator}
                      onChange={(e) => handleUpdateSyntax('assignmentOperator', e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-emerald-300"
                    >
                      <option value="=">= (Standard Equal)</option>
                      <option value=":=">:= (Walrus / Go / Pascal Assignment)</option>
                      <option value="<-">&lt;- (Arrow / R Assignment)</option>
                      <option value="equals">equals (English assignment)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Logic Operators & Comments */}
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-slate-200 font-bold">
                  <Terminal size={16} className="text-purple-400" />
                  <span>Logic Operators & Comments</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Comment Style:</span>
                    <select
                      value={langSpec.syntax.commentStyle}
                      onChange={(e) => handleUpdateSyntax('commentStyle', e.target.value as any)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-200"
                    >
                      <option value="#"># (Python/Shell Hash)</option>
                      <option value="//">// (C/JS Double Slash)</option>
                      <option value="--">-- (Lua/SQL Double Dash)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Equality Operator:</span>
                    <select
                      value={langSpec.syntax.equalityOperator}
                      onChange={(e) => handleUpdateSyntax('equalityOperator', e.target.value as any)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-200"
                    >
                      <option value="==">==</option>
                      <option value="===">===</option>
                      <option value="is">is</option>
                      <option value="equals">equals</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">AND Operator:</span>
                    <input
                      type="text"
                      value={langSpec.syntax.andOperator}
                      onChange={(e) => handleUpdateSyntax('andOperator', e.target.value as any)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-sky-300"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">OR Operator:</span>
                    <input
                      type="text"
                      value={langSpec.syntax.orOperator}
                      onChange={(e) => handleUpdateSyntax('orOperator', e.target.value as any)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-sky-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KEYWORDS & VOCABULARY */}
        {activeTab === 'keywords' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Settings2 size={18} className="text-purple-400" />
                <span>Vocabulary & Keyword Remapping</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Customize every keyword in {langSpec.name}. You can use English, Hindi, emojis, or any invented words!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(langSpec.keywords).map(([canonical, customWord]) => (
                <div
                  key={canonical}
                  className="flex flex-col p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-purple-400 font-bold">{canonical}</span>
                    <span className="text-[9px] text-slate-500 uppercase">Canonical</span>
                  </div>
                  <input
                    type="text"
                    value={customWord}
                    onChange={(e) => handleUpdateKeyword(canonical as any, e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-sky-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOM STANDARD LIBRARY & LOGIC FUNCTIONS */}
        {activeTab === 'functions' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Boxes size={18} className="text-purple-400" />
                  <span>Standard Library Logic Builder</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Define custom formulas and built-in logic that ship natively with {langSpec.name}.
                </p>
              </div>
            </div>

            {/* Add New Function Form */}
            <div className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-xl space-y-3 shadow-lg">
              <span className="font-bold text-xs text-purple-300 flex items-center space-x-1.5">
                <Plus size={14} />
                <span>Add Built-in Function / Logic Formula</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Function Name</span>
                  <input
                    type="text"
                    value={newFnName}
                    onChange={(e) => setNewFnName(e.target.value)}
                    placeholder="e.g. square, force"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-sky-300 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Parameters</span>
                  <input
                    type="text"
                    value={newFnParams}
                    onChange={(e) => setNewFnParams(e.target.value)}
                    placeholder="e.g. m, a"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-emerald-300 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Description</span>
                  <input
                    type="text"
                    value={newFnDesc}
                    onChange={(e) => setNewFnDesc(e.target.value)}
                    placeholder="e.g. Calculate Newton force"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Logic Formula / Body</span>
                <input
                  type="text"
                  value={newFnBody}
                  onChange={(e) => setNewFnBody(e.target.value)}
                  placeholder="e.g. m * a  or  0.5 * m * v * v"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleAddCustomFunction}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow transition"
                >
                  <Plus size={13} />
                  <span>Register Function</span>
                </button>
              </div>
            </div>

            {/* Existing Functions List */}
            <div className="space-y-3">
              <span className="font-bold text-xs text-slate-300 uppercase tracking-wider block">
                Active Standard Library Functions ({langSpec.customFunctions.length})
              </span>

              {langSpec.customFunctions.length === 0 ? (
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-slate-500 text-xs italic">
                  No custom functions yet. Add one above!
                </div>
              ) : (
                langSpec.customFunctions.map((fn) => (
                  <div
                    key={fn.id}
                    className="flex items-center justify-between p-3 bg-slate-900/70 border border-slate-800 rounded-xl hover:border-slate-700 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-sky-400">
                          {fn.name}({fn.params})
                        </span>
                        <span className="text-slate-500 text-[10px]">=&gt;</span>
                        <span className="font-mono text-xs text-purple-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {fn.body}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{fn.description}</div>
                    </div>

                    <button
                      onClick={() => handleDeleteCustomFunction(fn.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
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

        {/* TAB 5: EXPORT & VFS */}
        {activeTab === 'export' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Share2 size={18} className="text-purple-400" />
                <span>Export, Share & Save to VFS</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Your custom language specification is fully serialized as portable JSON.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopySpec}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied Specification' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={handleDownloadSpec}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 transition"
              >
                <Download size={14} />
                <span>Download .json Spec</span>
              </button>

              <button
                onClick={handleSaveToVFS}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/30 transition"
              >
                {savedToVFS ? <Check size={14} className="text-emerald-300" /> : <Save size={14} />}
                <span>{savedToVFS ? 'Saved to VFS!' : 'Save to IBP OS VFS'}</span>
              </button>
            </div>

            <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-4 font-mono text-xs text-sky-200 overflow-x-auto shadow-inner">
              <pre>{JSON.stringify(langSpec, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
