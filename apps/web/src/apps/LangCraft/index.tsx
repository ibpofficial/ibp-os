import React, { useState } from 'react';
import {
  Wand2,
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  Cpu,
  Layers,
  Settings2,
  Code2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { executeIBP } from '@ibp/engine';

export interface CustomLanguageSpec {
  name: string;
  author: string;
  description: string;
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
  sampleCode: string;
}

const TEMPLATES: Record<string, CustomLanguageSpec> = {
  hinglish: {
    name: 'HinglishLang',
    author: 'IBP Explorer',
    description: 'Human-friendly Hindi + English coding language for natural learning.',
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
    sampleCode: `rakho naam = "Aman"
pakka LEVEL = 10

bolo "Namaste {naam}!"

agar LEVEL >= 10 {
  chillao "Zabardast! Aap master coder hain!"
} warna {
  bolo "Seekhte rahiye!"
}

tareeka jod(a, b) {
  de_do a + b
}

bolo "15 + 25 =", jod(15, 25)
jashn
`,
  },

  emojilang: {
    name: 'EmojiScript',
    author: 'Visual Coder',
    description: 'Playful emoji-based syntax for younger learners and creative visual minds.',
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
    sampleCode: `📦 name = "Nova"
🔒 MAX = 100

📢 "Hello {name}!"

❓ MAX >= 100 {
  📢 "Power is at Maximum!"
} ❌ {
  📢 "Charging..."
}

📜 add(a, b) {
  🎁 a + b
}

📢 "Sum is:", add(20, 30)
🎉
`,
  },

  mathphys: {
    name: 'PhysiCode',
    author: 'Science Academy',
    description: 'Designed specifically for physics equations, kinematics, and scientific modeling.',
    keywords: {
      say: 'display',
      shout: 'alert',
      whisper: 'note',
      keep: 'state',
      lock: 'constant',
      when: 'test',
      orwhen: 'retest',
      otherwise: 'fallback',
      unless: 'except',
      repeat: 'loop',
      times: 'cycles',
      count: 'step',
      from: 'start',
      to: 'stop',
      each: 'forall',
      in: 'inside',
      while: 'simulate',
      recipe: 'formula',
      give: 'yield',
      yes: 'valid',
      no: 'invalid',
      empty: 'nullstate',
      celebrate: 'converge',
    },
    sampleCode: `constant G = 9.80665
state mass = 1200
state speed = 25

formula kineticEnergy(m, v) {
  yield 0.5 * m * v * v
}

display "Vehicle Kinetic Energy (Joules):", kineticEnergy(mass, speed)

test speed >= 20 {
  alert "High momentum detected!"
} fallback {
  display "Safe operational velocity."
}

converge
`,
  },
};

export const LangCraftApp: React.FC = () => {
  const [activeTemplateKey, setActiveTemplateKey] = useState<string>('hinglish');
  const [langSpec, setLangSpec] = useState<CustomLanguageSpec>(TEMPLATES['hinglish']);
  const [customCode, setCustomCode] = useState<string>(TEMPLATES['hinglish'].sampleCode);
  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'rules' | 'export'>('editor');

  const handleSelectTemplate = (key: string) => {
    setActiveTemplateKey(key);
    const tmpl = TEMPLATES[key];
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

  // Transpile custom user code back to canonical IBP and execute it
  const handleRunCustomCode = () => {
    setOutputLogs([]);
    setErrorMsg(null);

    try {
      let transpiled = customCode;

      // Replace custom keywords with canonical IBP keywords safely
      const mapping = Object.entries(langSpec.keywords);
      // Sort by keyword length descending to avoid partial word overlaps
      mapping.sort((a, b) => b[1].length - a[1].length);

      for (const [canonical, customWord] of mapping) {
        if (!customWord || customWord === canonical) continue;
        // Escape special chars in customWord (like emojis or symbols)
        const escaped = customWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Word boundary match if alphanumeric, else plain literal match
        const isWord = /^[a-zA-Z0-9_]+$/.test(customWord);
        const regex = isWord
          ? new RegExp(`\\b${escaped}\\b`, 'g')
          : new RegExp(escaped, 'g');
        transpiled = transpiled.replace(regex, canonical);
      }

      const res = executeIBP(transpiled, {
        onEvent: (ev) => {
          if (ev.type === 'celebrate') {
            confetti({ particleCount: 75, spread: 60 });
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

  return (
    <div className="flex flex-col h-full bg-[#0B1120] text-slate-100 font-sans text-xs select-text">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0E1526] border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
            <Wand2 size={16} />
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
              <span>LangCraft Studio 🛠️</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-950 text-[10px] text-purple-300 border border-purple-800/60 font-mono">
                Language Designer
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Design custom programming languages, grammar rules & run live code</p>
          </div>
        </div>

        {/* Template Quick Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Starter Templates:</span>
          {Object.entries(TEMPLATES).map(([key, tmpl]) => (
            <button
              key={key}
              onClick={() => handleSelectTemplate(key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                activeTemplateKey === key
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between bg-[#111827] border-b border-slate-800 px-4">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'editor'
                ? 'border-purple-400 text-purple-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 size={14} />
            <span>Code Editor & Live Runner</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'rules'
                ? 'border-purple-400 text-purple-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 size={14} />
            <span>Grammar & Keyword Rules</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'export'
                ? 'border-purple-400 text-purple-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download size={14} />
            <span>Specification & Export</span>
          </button>
        </div>

        {activeTab === 'editor' && (
          <button
            onClick={handleRunCustomCode}
            className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition my-1"
          >
            <Play size={12} fill="currentColor" />
            <span>Run in {langSpec.name}</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {activeTab === 'editor' && (
          <div className="flex-1 flex flex-col md:flex-row h-full">
            {/* Custom Code Editor */}
            <div className="flex-1 flex flex-col border-r border-slate-800">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0A0F1D] border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                <span>Program written in {langSpec.name}</span>
                <button
                  onClick={() => setCustomCode(TEMPLATES[activeTemplateKey]?.sampleCode || '')}
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

            {/* Output & Diagnostics */}
            <div className="w-full md:w-80 bg-[#0E1526] flex flex-col border-t md:border-t-0 md:border-l border-slate-800">
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 font-semibold text-slate-300 text-[11px] flex items-center justify-between">
                <span>OUTPUT CONSOLE</span>
                {outputLogs.length > 0 && (
                  <span className="text-[10px] text-emerald-400">{outputLogs.length} line(s)</span>
                )}
              </div>

              <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#080D1A]">
                {outputLogs.length === 0 && !errorMsg && (
                  <div className="text-slate-500 italic text-[11px]">
                    Click "Run in {langSpec.name}" to compile and execute your custom language program.
                  </div>
                )}

                {outputLogs.map((line, idx) => (
                  <div key={idx} className="text-slate-200 flex items-start space-x-1.5">
                    <span className="text-slate-500 select-none">&gt;</span>
                    <span className="whitespace-pre-wrap">{line}</span>
                  </div>
                ))}

                {errorMsg && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] whitespace-pre-wrap">
                    {errorMsg}
                  </div>
                )}
              </div>

              {/* Quick Keywords Reference Sidebar */}
              <div className="p-3 bg-slate-900/90 border-t border-slate-800">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1.5">
                  Active {langSpec.name} Vocabulary
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  <div className="p-1 bg-slate-950/60 rounded border border-slate-800 truncate">
                    <span className="text-slate-500">say:</span> <span className="text-sky-300 font-semibold">{langSpec.keywords.say}</span>
                  </div>
                  <div className="p-1 bg-slate-950/60 rounded border border-slate-800 truncate">
                    <span className="text-slate-500">keep:</span> <span className="text-emerald-300 font-semibold">{langSpec.keywords.keep}</span>
                  </div>
                  <div className="p-1 bg-slate-950/60 rounded border border-slate-800 truncate">
                    <span className="text-slate-500">when:</span> <span className="text-amber-300 font-semibold">{langSpec.keywords.when}</span>
                  </div>
                  <div className="p-1 bg-slate-950/60 rounded border border-slate-800 truncate">
                    <span className="text-slate-500">recipe:</span> <span className="text-purple-300 font-semibold">{langSpec.keywords.recipe}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Customize Keywords & Rules for {langSpec.name}</span>
              </h2>
              <p className="text-slate-400 text-xs">
                Edit the table below to rename any concept to whatever words, characters, or emojis you desire.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(langSpec.keywords).map(([canonical, customWord]) => (
                <div
                  key={canonical}
                  className="flex items-center justify-between p-3 bg-slate-900/70 border border-slate-800 rounded-xl"
                >
                  <div>
                    <span className="font-mono text-xs text-purple-400 font-semibold block">{canonical}</span>
                    <span className="text-[10px] text-slate-500">Canonical IBP Concept</span>
                  </div>

                  <div className="w-40">
                    <input
                      type="text"
                      value={customWord}
                      onChange={(e) => handleUpdateKeyword(canonical as any, e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-sky-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto space-y-6">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100">Export & Share Language Specification</h2>
              <p className="text-slate-400 text-xs">
                Your custom language specification is fully serialized as portable JSON.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopySpec}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
              </button>
              <button
                onClick={handleDownloadSpec}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                <Download size={13} />
                <span>Download .json Specification</span>
              </button>
            </div>

            <div className="bg-[#0A0F1D] border border-slate-800 rounded-xl p-4 font-mono text-xs text-sky-200 overflow-x-auto">
              <pre>{JSON.stringify(langSpec, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
