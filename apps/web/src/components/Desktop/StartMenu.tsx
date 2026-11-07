import React from 'react';
import {
  Code,
  Terminal,
  Folder,
  Activity,
  BookOpen,
  Trophy,
  Settings,
  Power,
  User,
  ExternalLink,
} from 'lucide-react';
import { useDesktopStore, APP_REGISTRY } from '../../stores/desktopStore';
import { AppId } from '../../types/desktop';

export const StartMenu: React.FC = () => {
  const { isStartMenuOpen, setStartMenu, openWindow, setBooted, currentUser } = useDesktopStore();

  if (!isStartMenuOpen) return null;

  const handleLaunch = (appId: AppId) => {
    openWindow(appId);
    setStartMenu(false);
  };

  const handleRestart = () => {
    setStartMenu(false);
    setBooted(false);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-12 left-3 w-80 bg-[#0E1526] border border-slate-700/80 rounded-xl shadow-2xl p-4 select-none z-50 text-xs font-sans text-slate-100 flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-100"
    >
      {/* User Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            {currentUser[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-100">{currentUser}</div>
            <div className="text-[10px] text-slate-400">IBP OS Explorer</div>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="p-1.5 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 rounded-md transition"
          title="Restart IBP OS"
        >
          <Power size={15} />
        </button>
      </div>

      {/* Applications Grid */}
      <div className="space-y-1">
        <div className="text-[10px] font-semibold text-slate-500 px-1 uppercase tracking-wider mb-2">
          Applications
        </div>
        <div className="grid grid-cols-1 gap-1">
          <button
            onClick={() => handleLaunch('studio')}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-850 hover:bg-slate-800 transition text-left"
          >
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <Code size={16} />
            </div>
            <div>
              <div className="font-medium text-slate-200">IBP Studio</div>
              <div className="text-[10px] text-slate-400">Write, debug & run IBP programs</div>
            </div>
          </button>

          <button
            onClick={() => handleLaunch('terminal')}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800 transition text-left"
          >
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Terminal size={16} />
            </div>
            <div>
              <div className="font-medium text-slate-200">Terminal</div>
              <div className="text-[10px] text-slate-400">CLI command environment & REPL</div>
            </div>
          </button>

          <button
            onClick={() => handleLaunch('playground')}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800 transition text-left"
          >
            <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg">
              <Trophy size={16} />
            </div>
            <div>
              <div className="font-medium text-slate-200">Playground</div>
              <div className="text-[10px] text-slate-400">20+ coding challenges with XP</div>
            </div>
          </button>

          <button
            onClick={() => handleLaunch('explorer')}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800 transition text-left"
          >
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Folder size={16} />
            </div>
            <div>
              <div className="font-medium text-slate-200">File Explorer</div>
              <div className="text-[10px] text-slate-400">Browse & manage virtual storage</div>
            </div>
          </button>

          <button
            onClick={() => handleLaunch('handbook')}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800 transition text-left"
          >
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <BookOpen size={16} />
            </div>
            <div>
              <div className="font-medium text-slate-200">IBP Handbook</div>
              <div className="text-[10px] text-slate-400">Language tutorial & reference</div>
            </div>
          </button>

          <button
            onClick={() => handleLaunch('monitor')}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800 transition text-left"
          >
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Activity size={16} />
            </div>
            <div>
              <div className="font-medium text-slate-200">System Monitor</div>
              <div className="text-[10px] text-slate-400">Instruction counters & execution limits</div>
            </div>
          </button>

          <button
            onClick={() => handleLaunch('settings')}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800 transition text-left"
          >
            <div className="p-2 bg-slate-500/10 text-slate-400 rounded-lg">
              <Settings size={16} />
            </div>
            <div>
              <div className="font-medium text-slate-200">Settings</div>
              <div className="text-[10px] text-slate-400">Preferences & system options</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
