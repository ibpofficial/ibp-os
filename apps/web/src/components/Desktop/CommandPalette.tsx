import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Code,
  Terminal,
  Folder,
  Activity,
  BookOpen,
  Trophy,
  Moon,
  Sun,
  Compass,
} from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';
import { AppId } from '../../types/desktop';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPalette,
    openWindow,
    toggleTheme,
    setOnboardingStep,
  } = useDesktopStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPalette(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    {
      id: 'studio',
      title: 'Open IBP Studio',
      desc: 'Code editor, runner and debugger',
      icon: <Code size={16} className="text-sky-400" />,
      run: () => openWindow('studio'),
    },
    {
      id: 'terminal',
      title: 'Open Terminal',
      desc: 'IBP CLI and interactive REPL',
      icon: <Terminal size={16} className="text-emerald-400" />,
      run: () => openWindow('terminal'),
    },
    {
      id: 'playground',
      title: 'Open Playground',
      desc: '20+ interactive challenges with XP',
      icon: <Trophy size={16} className="text-yellow-400" />,
      run: () => openWindow('playground'),
    },
    {
      id: 'explorer',
      title: 'Open File Explorer',
      desc: 'Browse and manage files under IBP://',
      icon: <Folder size={16} className="text-amber-400" />,
      run: () => openWindow('explorer'),
    },
    {
      id: 'handbook',
      title: 'Open IBP Handbook',
      desc: 'Complete documentation and tutorial',
      icon: <BookOpen size={16} className="text-cyan-400" />,
      run: () => openWindow('handbook'),
    },
    {
      id: 'monitor',
      title: 'Open System Monitor',
      desc: 'Process statistics and execution limits',
      icon: <Activity size={16} className="text-indigo-400" />,
      run: () => openWindow('monitor'),
    },
    {
      id: 'tour',
      title: 'Start 60s Guided Tour',
      desc: 'Take an interactive tour of IBP OS',
      icon: <Compass size={16} className="text-sky-400" />,
      run: () => setOnboardingStep(1),
    },
    {
      id: 'theme',
      title: 'Toggle Theme',
      desc: 'Switch between Dark and Light mode',
      icon: <Moon size={16} className="text-slate-400" />,
      run: () => toggleTheme(),
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (idx: number) => {
    const action = filtered[idx];
    if (action) {
      action.run();
      setCommandPalette(false);
    }
  };

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  };

  return (
    <div
      onClick={() => setCommandPalette(false)}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 select-none animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0E1526] border border-slate-700 rounded-xl shadow-2xl overflow-hidden font-sans text-xs text-slate-100"
      >
        <div className="flex items-center px-3.5 py-3 border-b border-slate-800 space-x-2.5">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            placeholder="Type a command or search apps..."
            className="w-full bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-xs"
          />
        </div>

        <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs">No matching commands found.</div>
          ) : (
            filtered.map((action, idx) => (
              <div
                key={action.id}
                onClick={() => handleSelect(idx)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                  selectedIndex === idx ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="shrink-0">{action.icon}</div>
                <div className="flex-1 truncate">
                  <div className="font-semibold">{action.title}</div>
                  <div className={`text-[10px] ${selectedIndex === idx ? 'text-sky-100' : 'text-slate-400'}`}>
                    {action.desc}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
