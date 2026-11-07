import React, { useState, useEffect } from 'react';
import {
  Code,
  Terminal,
  Folder,
  Activity,
  BookOpen,
  Trophy,
  Settings,
  Search,
  Moon,
  Sun,
} from 'lucide-react';
import { useDesktopStore, APP_REGISTRY } from '../../stores/desktopStore';
import { AppId } from '../../types/desktop';

export const Taskbar: React.FC = () => {
  const {
    windows,
    activeWindowId,
    focusWindow,
    minimizeWindow,
    toggleStartMenu,
    isStartMenuOpen,
    setCommandPalette,
    theme,
    toggleTheme,
  } = useDesktopStore();

  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getAppIcon = (appId: AppId) => {
    switch (appId) {
      case 'studio':
        return <Code size={14} className="text-sky-400" />;
      case 'terminal':
        return <Terminal size={14} className="text-emerald-400" />;
      case 'explorer':
        return <Folder size={14} className="text-amber-400" />;
      case 'monitor':
        return <Activity size={14} className="text-indigo-400" />;
      case 'handbook':
        return <BookOpen size={14} className="text-cyan-400" />;
      case 'playground':
        return <Trophy size={14} className="text-yellow-400" />;
      case 'settings':
        return <Settings size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="h-11 bg-[#0E1526]/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-between px-3 select-none z-50">
      {/* Left: Start Button & Windows */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleStartMenu}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-semibold text-xs transition duration-150 ${
            isStartMenuOpen
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200'
          }`}
        >
          <span className="text-sm">🪐</span>
          <span>IBP OS</span>
        </button>

        {/* Search / Command Palette Trigger */}
        <button
          onClick={() => setCommandPalette(true)}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900/60 hover:bg-slate-800 rounded-md text-slate-400 text-xs border border-slate-800 transition"
        >
          <Search size={13} />
          <span className="hidden sm:inline">Search (Ctrl+K)</span>
        </button>

        {/* Running Window Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto max-w-lg">
          {windows.map((win) => {
            const isActive = activeWindowId === win.id && !win.isMinimized;
            return (
              <button
                key={win.id}
                onClick={() => {
                  if (isActive) {
                    minimizeWindow(win.id);
                  } else {
                    focusWindow(win.id);
                  }
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs transition truncate max-w-[140px] ${
                  isActive
                    ? 'bg-sky-950/70 text-sky-200 border border-sky-500/40 font-medium'
                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 border border-slate-800/60'
                }`}
              >
                {getAppIcon(win.appId)}
                <span className="truncate">{win.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: System Tray & Clock */}
      <div className="flex items-center space-x-3 text-xs text-slate-300">
        <button
          onClick={toggleTheme}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Moon size={14} className="text-sky-400" /> : <Sun size={14} className="text-amber-400" />}
        </button>

        <div className="px-2 py-0.5 bg-slate-900/60 rounded border border-slate-800 font-mono text-[11px] text-slate-300">
          {timeStr}
        </div>
      </div>
    </div>
  );
};
