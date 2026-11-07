import React, { useState } from 'react';
import { BookOpen, Copy, Check, Play, Sparkles } from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';
import { useVFSStore } from '../../stores/vfsStore';

interface HandbookSection {
  id: string;
  title: string;
  content: string;
  code?: string;
}

const SECTIONS: HandbookSection[] = [
  {
    id: 'getting-started',
    title: '1. Getting Started',
    content: 'Welcome to IBP! IBP is an educational, human-friendly programming language designed to make coding accessible and delightful.',
    code: `keep name = "Explorer"
say "Hello, {name}!"
shout "welcome to ibp os"
whisper "enjoy the ride"
`,
  },
  {
    id: 'variables',
    title: '2. Variables & Constants',
    content: 'Use "keep" for variables that change, and "lock" for immutable constants. Booleans can be written as "yes" or "no". Null is called "empty".',
    code: `keep score = 100
lock MAX_LIVES = 3
keep active = yes
keep nothing = empty

score = score + 25
say "Lives: {MAX_LIVES}, Score: {score}"
`,
  },
  {
    id: 'conditions',
    title: '3. Conditions (when / orwhen / otherwise)',
    content: 'Control program flow with English conditional words: "when", "orwhen", "otherwise", and "unless".',
    code: `keep age = 16

when age >= 18 {
  say "Adult access granted"
} orwhen age >= 13 {
  say "Teen access"
} otherwise {
  say "Access denied"
}

unless age < 13 {
  say "Not a child"
}
`,
  },
  {
    id: 'loops',
    title: '4. Loops & Iteration',
    content: 'IBP includes intuitive loop constructs: "repeat N times", "count i from start to end", "each item in list", and "while".',
    code: `repeat 3 times {
  say "Hip hip hooray!"
}

count i from 1 to 5 {
  say "Count: {i}"
}

keep fruits = ["apple", "banana", "cherry"]
each fruit in fruits {
  say "Fruit: {fruit}"
}
`,
  },
  {
    id: 'recipes',
    title: '5. Recipes (Functions)',
    content: 'Functions in IBP are called recipes. Return values using "give". Recipes support default parameters, recursion, closures, and single-line arrow syntax.',
    code: `recipe add(a, b = 0) {
  give a + b
}

recipe double(x) => x * 2

say "add(10, 20) = {add(10, 20)}"
say "double(25) = {double(25)}"
`,
  },
  {
    id: 'collections',
    title: '6. Lists & Boxes',
    content: 'Lists hold ordered items. Objects are called boxes. Safe access is supported using "?." to prevent crashes.',
    code: `keep scores = [10, 20, 30]
add 40 to scores
say "Length: {scores.length}"

box player {
  name: "Aria",
  level: 5,
  profile: box {
    city: "Nexus"
  }
}

say "Player: {player.name}, Level: {player.level}"
say "City: {player.profile.city}"
say "Safe check: {player?.inventory?.sword}"
`,
  },
  {
    id: 'pipes',
    title: '7. Pipe Operator (|>)',
    content: 'Pipes allow you to chain operations cleanly from left to right.',
    code: `recipe double(x) => x * 2
recipe isEven(x) => x % 2 == 0

keep numbers = [1, 2, 3, 4, 5, 6]
numbers |> filter(isEven) |> map(double) |> total |> say
`,
  },
  {
    id: 'randomness',
    title: '8. Seeded Randomness & Delight',
    content: 'Deterministic randomness is built-in with "luck(min, max)", "coin()", "pick(list)", and "shuffle(list)". Use "seed" to make games repeatable!',
    code: `seed 42
say "Luck roll (1-6): {luck(1, 6)}"
say "Coin toss: {coin()}"
say "Random pick: {pick(["Gold", "Silver", "Bronze"])}"
celebrate
`,
  },
];

export const HandbookApp: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState(SECTIONS[0].id);
  const [copied, setCopied] = useState(false);
  const { openWindow } = useDesktopStore();
  const { createFile } = useVFSStore();

  const section = SECTIONS.find((s) => s.id === selectedSectionId) || SECTIONS[0];

  const handleCopy = () => {
    if (!section.code) return;
    navigator.clipboard.writeText(section.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunInStudio = async () => {
    if (!section.code) return;
    const path = `IBP://USERS/guest/projects/sample_${section.id}.ibp`;
    await createFile(path, section.code);
    openWindow('studio');
  };

  return (
    <div className="flex h-full bg-[#0B1120] text-slate-100 font-sans text-xs">
      {/* Sidebar Table of Contents */}
      <div className="w-64 bg-[#0E1526] border-r border-slate-800 p-2 overflow-y-auto space-y-1">
        <div className="flex items-center space-x-2 px-2 py-1.5 text-slate-400 font-semibold text-[11px]">
          <BookOpen size={14} className="text-sky-400" />
          <span>HANDBOOK TOPICS</span>
        </div>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSectionId(s.id)}
            className={`w-full text-left px-2.5 py-1.5 rounded transition ${
              selectedSectionId === s.id
                ? 'bg-sky-600/30 text-sky-300 font-medium border border-sky-500/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto max-w-3xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <span>{section.title}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{section.content}</p>
        </div>

        {section.code && (
          <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
              <span className="font-mono text-[11px] text-slate-400">Example Code (.ibp)</span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-[11px]"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleRunInStudio}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white text-[11px] font-semibold"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Try in Studio</span>
                </button>
              </div>
            </div>
            <pre className="p-4 font-mono text-[12px] text-sky-200 overflow-x-auto leading-relaxed">
              {section.code}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
