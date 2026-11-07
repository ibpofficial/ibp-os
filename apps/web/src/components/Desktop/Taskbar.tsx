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
  Wand2,
  Palette,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Wifi,
  Battery,
  Sliders,
  Check,
  Layers,
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
    openWindow,
  } = useDesktopStore();

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [showTrayMenu, setShowTrayMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getAppIcon = (appId: AppId) => {
    switch (appId) {
      case 'studio':
        return <Code size={14} className="text-sky-400" />;
      case 'langcraft':
        return <Wand2 size={14} className="text-purple-400" />;
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
    <>
      <div className="h-11 bg-[#0E1526]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between px-3 select-none z-50">
        {/* Left: Start Button, Search & Window Tabs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleStartMenu}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-bold text-xs transition duration-150 ${
              isStartMenuOpen
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700/60'
            }`}
          >
            <span className="text-sm">🪐</span>
            <span className="tracking-wide">IBP OS</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setCommandPalette(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900/70 hover:bg-slate-800 rounded-lg text-slate-400 text-xs border border-slate-800 transition"
          >
            <Search size={13} />
            <span className="hidden sm:inline">Search (Ctrl+K)</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          {/* Running Window Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-lg">
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
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition truncate max-w-[150px] ${
                    isActive
                      ? 'bg-sky-950/80 text-sky-200 border border-sky-500/50 shadow-sm font-semibold'
                      : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  {getAppIcon(win.appId)}
                  <span className="truncate">{win.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Settings Pill & Clock */}
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          {/* Quick System Tray Toggle */}
          <button
            onClick={() => setShowTrayMenu(!showTrayMenu)}
            className={`flex items-center space-x-2 px-2.5 py-1 rounded-lg border transition ${
              showTrayMenu
                ? 'bg-slate-800 text-sky-400 border-sky-500/40'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
            title="Quick Settings & Status"
          >
            <Wifi size={13} className="text-emerald-400" />
            <Battery size={13} className="text-sky-400" />
            <Sliders size={13} className="text-slate-400" />
          </button>

          {/* Clock & Date */}
          <div
            onClick={() => setShowTrayMenu(!showTrayMenu)}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900/70 hover:bg-slate-800 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 cursor-pointer transition"
          >
            <span>{timeStr}</span>
            <span className="text-slate-500 text-[10px] hidden sm:inline">• {dateStr}</span>
          </div>
        </div>
      </div>

      {/* Quick Settings & Tray Flyout Menu */}
      {showTrayMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-14 right-3 w-72 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 select-none z-50 text-xs text-slate-200 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 space-y-3.5"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-bold text-slate-100 flex items-center space-x-2">
              <span className="text-sm">🪐</span>
              <span>Quick Controls</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Kernel 0.1.0</span>
          </div>

          {/* Quick Toggles */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition"
            >
              {theme === 'dark' ? <Moon size={14} className="text-sky-400" /> : <Sun size={14} className="text-amber-400" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition"
            >
              {soundEnabled ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} className="text-slate-500" />}
              <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
            </button>

            <button
              onClick={handleToggleFullscreen}
              className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition"
            >
              {isFullscreen ? <Minimize2 size={14} className="text-indigo-400" /> : <Maximize2 size={14} className="text-indigo-400" />}
              <span>{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
            </button>

            <button
              onClick={() => {
                openWindow('handbook');
                setShowTrayMenu(false);
              }}
              className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition"
            >
              <BookOpen size={14} className="text-cyan-400" />
              <span>Handbook</span>
            </button>
          </div>

          {/* System Metrics */}
          <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-[10px] space-y-1 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Interpreter Status:</span>
              <span className="text-emerald-400 font-semibold">Active (Normal)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Filesystem Storage:</span>
              <span className="text-sky-400 font-semibold">IndexedDB (Local)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Instruction Guard:</span>
              <span className="text-purple-400 font-semibold">100,000 steps</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
