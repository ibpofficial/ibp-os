import React, { useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  Play,
  Sparkles,
  Printer,
  Search,
  FileText,
  ChevronRight,
  ExternalLink,
  Code2,
  Terminal,
  Download,
} from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';
import { useVFSStore } from '../../stores/vfsStore';

interface Section {
  id: string;
  chapter: string;
  title: string;
  summary: string;
  content: string[];
  syntax?: string;
  code: string;
  tips?: string[];
}

const HANDBOOK_SECTIONS: Section[] = [
  {
    id: 'intro',
    chapter: 'Chapter 1',
    title: 'Welcome to IBP OS & Language',
    summary: 'The human-first, educational programming language and experimental browser operating system.',
    content: [
      'IBP is designed from the ground up for clarity, joy, and learning. It reads like natural English, so even a 12-year-old can guess what code does at first glance.',
      'Unlike cryptic languages full of semicolons, brackets, and confusing type errors, IBP prioritizes friendly vocabulary, meaningful errors, and built-in delights like seeded randomness, virtual clocks, and confetti.',
    ],
    syntax: `say "Hello, World!"`,
    code: `# Welcome to IBP!
keep name = "Explorer"
say "Hello, {name}! Welcome to IBP OS."
shout "let's build something wonderful!"
whisper "code should feel like magic"
celebrate
`,
    tips: [
      'Keywords are always lowercase English words.',
      'Comments start with # and run to the end of the line.',
      'Statements end at newlines—no semicolons required!',
    ],
  },
  {
    id: 'variables',
    chapter: 'Chapter 2',
    title: 'Variables, Constants & Data Types',
    summary: 'Manage state with "keep" for mutable variables and "lock" for immutable constants.',
    content: [
      'Use "keep" to declare variables that can change over time. Reassignment uses the variable name followed by =.',
      'Use "lock" to declare permanent constants. Attempting to change a locked constant will trigger a friendly TypeError.',
      'IBP supports numbers (integers and decimals), text strings with {expression} interpolation, booleans ("yes" or "no", with "true" / "false" aliases), and null ("empty" or "null").',
    ],
    syntax: `keep variable = value\nlock CONSTANT = value`,
    code: `# Variables & Constants
keep score = 100
lock MAX_LIVES = 3
keep player = "Aria"
keep active = yes
keep currentQuest = empty

# Reassignment
score = score + 25

# String interpolation with expressions
say "Player: {player}, Score: {score} / {MAX_LIVES * 100}"
say "Type of score is: {kind(score)}"
say "Type of player is: {kind(player)}"
`,
    tips: [
      'Booleans can be written as yes/no or true/false.',
      'Variables can hold any type and are checked safely at runtime.',
      'Helpful aliases like "let", "var", and "const" are also supported for convenience!',
    ],
  },
  {
    id: 'conditionals',
    chapter: 'Chapter 3',
    title: 'Natural English Conditionals',
    summary: 'Decision making using "when", "orwhen", "otherwise", and "unless".',
    content: [
      'Control program logic cleanly without confusing symbols. Use "when" instead of "if", "orwhen" instead of "else if", and "otherwise" instead of "else".',
      'The "unless condition" block runs only when the condition is NOT true—making negative checks easy to read.',
      'Comparisons support both math symbols (==, !=, <, >, <=, >=) and natural English words: "is", "isnt", "above", "below", "and", "or", "not", and "in".',
    ],
    syntax: `when condition {\n  ...\n} orwhen condition {\n  ...\n} otherwise {\n  ...\n}`,
    code: `# Natural Decision Making
keep age = 16
keep hasKey = yes

when age above 18 and hasKey is yes {
  say "Access granted: Full Admin"
} orwhen age >= 13 {
  say "Access granted: Teen Explorer"
} otherwise {
  say "Access denied: Age restricted"
}

# The unless statement
keep sleeping = no
unless sleeping {
  say "The system is awake and running!"
}
`,
    tips: [
      '"is" is an alias for ==, "isnt" for !=.',
      '"above" means >, "below" means <.',
      '"if", "elif", and "else" are also accepted as friendly aliases.',
    ],
  },
  {
    id: 'loops',
    chapter: 'Chapter 4',
    title: 'Loops & Iteration',
    summary: 'Repeat actions with repeat, count, each, while, and forever.',
    content: [
      'IBP provides four dedicated loop constructs tailored to what you want to achieve:',
      '1. "repeat N times": The simplest loop for doing an action a fixed number of times.',
      '2. "count i from A to B [step S]": Inclusive counting loop from start to finish.',
      '3. "each item in collection": Iterates over lists, ranges, or boxes.',
      '4. "while condition" and "forever": Guarded by IBP\'s safety limit to prevent browser freezes.',
    ],
    syntax: `repeat 5 times { ... }\ncount i from 1 to 10 step 2 { ... }\neach item in list { ... }`,
    code: `# 1. Repeat a fixed count
repeat 3 times {
  say "IBP is running smoothly! 🪐"
}

# 2. Count loop with step
count num from 2 to 10 step 2 {
  say "Even number: {num}"
}

# 3. Iterate over a list
keep fruits = ["apple", "banana", "dragonfruit"]
each f in fruits {
  say "Delicacy: {f}"
}

# 4. Loop with skip and stop
count i from 1 to 5 {
  when i is 2 { skip }
  when i is 4 { stop }
  say "Value: {i}"
}
`,
    tips: [
      '"skip" skips to the next iteration (continue).',
      '"stop" exits the loop immediately (break).',
      'All loops are bounded by IBP\'s max instruction guard (default 100,000 steps) so an infinite loop will never freeze your computer.',
    ],
  },
  {
    id: 'recipes',
    chapter: 'Chapter 5',
    title: 'Recipes (Functions & Closures)',
    summary: 'Reusable building blocks: default arguments, arrow syntax, closures, and recursion.',
    content: [
      'In IBP, functions are called "recipes". You define a recipe, give it ingredients (parameters), and return a result using the "give" keyword.',
      'Recipes are first-class values: you can assign them to variables, pass them to other recipes, and return them.',
      'Inline arrow recipes allow concise one-line transformations: "recipe double(x) => x * 2".',
    ],
    syntax: `recipe name(params) {\n  give result\n}\nrecipe name(param) => expression`,
    code: `# Standard recipe with default parameters
recipe greet(name = "friend", title = "Explorer") {
  give "Greetings, {title} {name}!"
}

# Concise inline arrow recipe
recipe square(x) => x * x

# Higher-order recipe (closure)
recipe makeMultiplier(factor) {
  recipe multiplier(n) {
    give n * factor
  }
  give multiplier
}

say greet("Ishant", "Architect")
say "Square of 8: {square(8)}"

keep triple = makeMultiplier(3)
say "Triple 7: {triple(7)}"
`,
    tips: [
      'Use "give" to return a value from a recipe.',
      '"recipe double(x) => x * 2" is equivalent to a block with "give x * 2".',
      '"fun", "fn", and "return" are also supported aliases.',
    ],
  },
  {
    id: 'collections',
    chapter: 'Chapter 6',
    title: 'Collections: Lists & Boxes',
    summary: 'Work with ordered lists, key-value boxes, and safe navigation ?.',
    content: [
      'Lists hold sequences of values: [10, 20, 30]. Access items using 0-based indexing: list[0].',
      'Statements like "add item to list" and "remove item from list" make list operations clear.',
      'Objects in IBP are called "boxes": "box user { name: "Aria", level: 5 }". Access properties with dot notation (user.name) or dynamic indexing (user["level"]).',
      'Safe navigation "?." prevents crashes when inspecting nested properties that might not exist.',
    ],
    syntax: `keep list = [1, 2, 3]\nbox name { key: value }\nitem?.nested?.prop`,
    code: `# Lists
keep scores = [10, 20, 30]
add 40 to scores
say "First score: {scores[0]}"
say "Total scores: {scores.length}"

# Boxes (Records / Dictionaries)
box character {
  name: "Aria",
  class: "Mage",
  inventory: box {
    weapon: "Starlight Staff",
    potions: 3
  }
}

say "Character: {character.name} ({character.class})"
say "Weapon: {character.inventory.weapon}"

# Safe Navigation (?.)
say "Pet: {character?.pet?.name}" # Prints "empty" instead of crashing!
`,
    tips: [
      'Trailing commas in lists and boxes are fully supported: [1, 2, 3,].',
      'Use keys(box) and values(box) to inspect box contents.',
    ],
  },
  {
    id: 'pipes',
    chapter: 'Chapter 7',
    title: 'Signature Feature: Pipeline Flow (|>)',
    summary: 'Transform data cleanly from left to right with the pipe operator.',
    content: [
      'The pipe operator (|>) passes the result of the left-hand expression as the first argument to the recipe on the right.',
      'This eliminates ugly nested function calls like "say(total(map(double, filter(even, numbers))))" and turns them into a clean, readable assembly line.',
    ],
    syntax: `data |> step1 |> step2 |> output`,
    code: `# Data transformation pipeline
recipe isEven(x) => x % 2 == 0
recipe double(x) => x * 2

keep numbers = [1, 2, 3, 4, 5, 6, 7, 8]

# Process pipeline
numbers
  |> filter(isEven)
  |> map(double)
  |> total
  |> say
`,
    tips: [
      'Any recipe that takes an argument can be piped into.',
      '"say" can be piped into directly at the end of a chain!',
    ],
  },
  {
    id: 'randomness',
    chapter: 'Chapter 8',
    title: 'Seeded Randomness & Virtual Clock',
    summary: 'Deterministic pseudo-randomness and non-blocking virtual timers.',
    content: [
      'IBP comes with built-in seeded randomness so procedural games, generative art, and math experiments can be 100% reproducible.',
      'Use "seed N" to set the generator. Then use "luck(min, max)", "coin()", "pick(list)", and "shuffle(list)".',
      '"wait N seconds" pauses execution on a virtual clock without ever blocking the browser or eating CPU cycles.',
    ],
    syntax: `seed 42\nluck(1, 6)\ncoin()\npick(list)\nwait 2 seconds`,
    code: `# Deterministic Simulation
seed 100

say "Rolling 6-sided die: {luck(1, 6)}"
say "Coin flip: {coin()}"

keep cards = ["Ace", "King", "Queen", "Jack"]
say "Card draw: {pick(cards)}"
say "Shuffled deck: {shuffle(cards)}"

# Non-blocking virtual pause
say "Preparing launch..."
wait 1 second
say "Blast off! 🚀"
celebrate
`,
    tips: [
      'A seeded run produces the exact same results every time—perfect for testing and games.',
      '"wait" supports fractions like "wait 0.5 seconds".',
    ],
  },
  {
    id: 'builtins',
    chapter: 'Chapter 9',
    title: 'Standard Built-in Library Reference',
    summary: 'Over 35 native built-in functions covering Text, Math, Lists, Boxes, and System.',
    content: [
      'IBP provides a rich built-in standard library ready to use without requiring any imports:',
      '• Text: length(s), upper(s), lower(s), trim(s), split(s, delim), join(list, delim), replace(s, a, b), contains(s, sub), starts(s, sub), ends(s, sub), repeatText(s, count), reverse(s).',
      '• Math: abs(n), round(n), floor(n), ceil(n), min(a, b), max(a, b), sqrt(n), power(b, exp).',
      '• Lists: first(list), last(list), total(list), average(list), unique(list), count(list, match), sort(list), map(recipe, list), filter(recipe, list), reduce(recipe, init, list).',
      '• Boxes: keys(box), values(box), has(box, key).',
      '• System & Files: today(), now(), tip(), exists(path), readFile(path), writeFile(path, text).',
    ],
    syntax: `upper("hello")\nsqrt(144)\ntotal([1, 2, 3])`,
    code: `# Built-ins Showcase
say "Upper: " + upper("ibp os")
say "Math sqrt(81): {sqrt(81)}"
say "Floor of 9.7: {floor(9.7)}"

keep data = [5, 10, 15, 20]
say "Total: {total(data)}"
say "Average: {average(data)}"
say "First: {first(data)}, Last: {last(data)}"

box item { id: 1, name: "Shield", active: yes }
say "Box keys: {keys(item)}"
`,
    tips: [
      'Call "say tip()" anywhere to get a helpful programming tip!',
      'All file operations are securely sandboxed inside the virtual filesystem (IBP://).',
    ],
  },
  {
    id: 'easter-eggs',
    chapter: 'Chapter 10',
    title: 'Fun Elements & Playful Features',
    summary: 'Easter eggs designed to spark joy: Magic 8-Ball, jokes, ASCII art, and dice.',
    content: [
      'Learning to code should be fun! IBP includes whimsical built-ins that bring smiles to beginners and experienced developers alike:',
      '• magic8Ball(): Answers your questions with mystic fortune-telling responses.',
      '• joke(): Returns witty programmer jokes.',
      '• asciiArt(name): Prints ASCII graphics ("rocket", "cat", "dog", "planet", "heart", "star").',
      '• rollDice(sides) & d20(): Tabletop gaming dice with critical roll alerts.',
      '• badge(label, icon): Generates stylish status badges.',
      '• celebrate: Statement that launches celebratory confetti in the UI!',
    ],
    syntax: `say magic8Ball()\nsay joke()\nsay asciiArt("cat")\nsay d20()\ncelebrate`,
    code: `# Fun & Easter Eggs
seed 42

say "Mystic 8-Ball, will my code compile?"
say magic8Ball()

say "\nNeed a laugh?"
say joke()

say "\nDice Roll (D20):"
say d20()

say "\nASCII Mascot:"
say asciiArt("rocket")

say badge("LEVEL 10 MASTER", "⭐")
celebrate
`,
    tips: [
      '"celebrate" triggers confetti in IBP Studio and Terminal.',
      'Use asciiArt("cat") or asciiArt("dog") for adorable terminal pets.',
    ],
  },
  {
    id: 'error-handling',
    chapter: 'Chapter 11',
    title: 'Error Handling & Friendly Diagnostics',
    summary: 'Never fear crashes: "attempt", "rescue", "always", and helpful suggestions.',
    content: [
      'IBP has the friendliest error messages in any programming language. If you make a typo, IBP uses Levenshtein edit distance to guess what variable or keyword you meant and offers a "Try this" hint.',
      'Catch unexpected runtime problems using "attempt ... rescue problem ... always" blocks.',
      'Throw your own custom errors using "raise "message"".',
    ],
    syntax: `attempt {\n  ...\n} rescue problem {\n  say problem.message\n} always {\n  ...\n}`,
    code: `# Safe Error Handling
attempt {
  say "Trying dangerous operation..."
  raise "Custom warning: Out of mana!"
} rescue problem {
  say "Caught problem: {problem.message}"
} always {
  say "Cleanup complete. Continuing program."
}

say "Program continued without crashing!"
`,
    tips: [
      'The "always" block executes whether an error happened or not.',
      'Syntax errors display a source excerpt with a caret marker pointing right at the issue.',
    ],
  },
  {
    id: 'checks',
    chapter: 'Chapter 12',
    title: 'Built-in Checks & Testing',
    summary: 'First-class assertions using "expect" for automated verification.',
    content: [
      'Testing is built right into the language syntax! Write "expect expression is expected" to test your recipes.',
      'Check statements do not crash your program if they fail; instead, results are recorded in the Studio "Checks" panel and test runners.',
    ],
    syntax: `expect value is expected\nexpect "label": value is expected`,
    code: `# Built-in Verification
recipe add(a, b) => a + b
recipe isPositive(n) => n > 0

expect add(2, 3) is 5
expect "addition works": add(10, 20) is 30
expect isPositive(100) is yes

say "All automated checks executed!"
`,
    tips: [
      'The Playground uses "expect" checks to automatically verify challenge solutions.',
      'You can label tests with strings: expect "my test": 1 + 1 is 2.',
    ],
  },
];

export const HandbookApp: React.FC = () => {
  const [selectedId, setSelectedId] = useState(HANDBOOK_SECTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chapters' | 'full-document'>('chapters');

  const { openWindow } = useDesktopStore();
  const { createFile } = useVFSStore();

  const filteredSections = HANDBOOK_SECTIONS.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.content.some((c) => c.toLowerCase().includes(q)) ||
      s.code.toLowerCase().includes(q)
    );
  });

  const activeSection = HANDBOOK_SECTIONS.find((s) => s.id === selectedId) || HANDBOOK_SECTIONS[0];

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTryInStudio = async (sec: Section) => {
    const path = `IBP://USERS/guest/projects/learn_${sec.id}.ibp`;
    await createFile(path, sec.code);
    openWindow('studio');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1120] text-slate-100 font-sans text-xs select-text">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0E1526] border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <BookOpen size={16} />
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
              <span>IBP Language Guide & Learning Center</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-[10px] text-cyan-300 border border-cyan-800/60 font-mono">
                12 Chapters
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Comprehensive official specification, tutorials & reference</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode switch */}
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            <button
              onClick={() => setViewMode('chapters')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                viewMode === 'chapters' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive Chapters
            </button>
            <button
              onClick={() => setViewMode('full-document')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                viewMode === 'full-document' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Document / Book View
            </button>
          </div>

          {/* Export / Print PDF Button */}
          <button
            onClick={handlePrintPDF}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold text-xs shadow-md transition"
            title="Print or Save as PDF"
          >
            <Printer size={13} />
            <span>Export / Print Full PDF</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      {viewMode === 'chapters' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar / Table of Contents */}
          <div className="w-64 bg-[#0E1526]/80 border-r border-slate-800 flex flex-col">
            <div className="p-2.5 border-b border-slate-800">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics, syntax..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setSelectedId(sec.id)}
                  className={`w-full text-left p-2 rounded-xl transition duration-150 flex flex-col ${
                    selectedId === sec.id
                      ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      {sec.chapter}
                    </span>
                    <ChevronRight size={12} className="text-slate-500" />
                  </div>
                  <span className="text-xs font-semibold mt-0.5 truncate">{sec.title.replace(/^Chapter \d+:\s*/, '')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Content View */}
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                {activeSection.chapter}
              </span>
              <h2 className="text-xl font-extrabold text-slate-100">{activeSection.title}</h2>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">{activeSection.summary}</p>
            </div>

            {/* Prose Content */}
            <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
              {activeSection.content.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Syntax Blueprint */}
            {activeSection.syntax && (
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Syntax Blueprint
                </span>
                <pre className="font-mono text-cyan-300 text-xs">{activeSection.syntax}</pre>
              </div>
            )}

            {/* Interactive Code Example */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                <span className="font-mono text-xs text-slate-300 font-semibold flex items-center space-x-2">
                  <Code2 size={14} className="text-sky-400" />
                  <span>Example Code ({activeSection.id}.ibp)</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyCode(activeSection.id, activeSection.code)}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs font-medium transition"
                  >
                    {copiedId === activeSection.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedId === activeSection.id ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => handleTryInStudio(activeSection)}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition"
                  >
                    <Play size={12} fill="currentColor" />
                    <span>Run in Studio</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 font-mono text-xs text-sky-200 overflow-x-auto leading-relaxed bg-[#0A0F1D]">
                {activeSection.code}
              </pre>
            </div>

            {/* Pro Tips */}
            {activeSection.tips && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                  <Sparkles size={14} />
                  <span>Pro Tips & Best Practices</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  {activeSection.tips.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full Document / Continuous Book View (Printable PDF ready) */
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto space-y-10 print:p-0 print:max-w-none">
          <div className="text-center space-y-3 border-b border-slate-800 pb-8 print:border-b-2 print:border-black">
            <h1 className="text-3xl font-extrabold text-slate-100 print:text-black">🪐 IBP Programming Language</h1>
            <p className="text-sm font-semibold text-cyan-400 print:text-gray-700">The Complete Human-Friendly Educational Handbook & Specification</p>
            <p className="text-xs text-slate-400 print:text-gray-600">Edition 1.0 • Built for learners, educators, and curious minds</p>
          </div>

          {HANDBOOK_SECTIONS.map((sec, index) => (
            <div key={sec.id} className="space-y-4 border-b border-slate-800/80 pb-8 print:border-b print:break-inside-avoid">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider print:text-gray-700">
                  {sec.chapter}
                </span>
                <h2 className="text-lg font-bold text-slate-100 print:text-black">{sec.title}</h2>
                <p className="text-xs text-slate-400 italic print:text-gray-600">{sec.summary}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed print:text-black">
                {sec.content.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="bg-[#0A0F1D] border border-slate-800 rounded-xl p-4 font-mono text-xs text-sky-200 print:bg-gray-100 print:text-black print:border-gray-400">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold print:text-gray-600">
                  Code Example
                </div>
                <pre className="overflow-x-auto whitespace-pre leading-relaxed">{sec.code}</pre>
              </div>

              {sec.tips && (
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-xs text-slate-300 print:bg-gray-50 print:text-black">
                  <span className="font-bold text-amber-400 block mb-1 print:text-black">Key Takeaways:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {sec.tips.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          <div className="text-center text-xs text-slate-500 py-6 border-t border-slate-800 print:text-black">
            End of IBP Language Handbook • Happy Coding with IBP OS 🪐
          </div>
        </div>
      )}
    </div>
  );
};
