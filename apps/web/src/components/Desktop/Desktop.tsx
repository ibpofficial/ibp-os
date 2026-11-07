import React, { useEffect, useState } from 'react';
import {
  Code,
  Terminal,
  Folder,
  Activity,
  BookOpen,
  Trophy,
  Settings,
  Sparkles,
  RefreshCw,
  Play,
  Palette,
  ExternalLink,
  Cpu,
  HardDrive,
  Clock,
  Layers,
  ChevronRight,
  Wand2,
} from 'lucide-react';
import { useDesktopStore, APP_REGISTRY } from '../../stores/desktopStore';
import { useVFSStore } from '../../stores/vfsStore';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { BootScreen } from './BootScreen';
import { CommandPalette } from './CommandPalette';
import { OnboardingTour } from './OnboardingTour';
import { AppId } from '../../types/desktop';
import { IBP_TIPS } from '@ibp/engine';

type WallpaperTheme = 'deep-space' | 'cyberpunk' | 'aurora' | 'sunset';

const WALLPAPERS: Record<WallpaperTheme, { name: string; bg: string }> = {
  'deep-space': {
    name: 'Deep Space',
    bg: `
      radial-gradient(circle at 15% 20%, rgba(37, 99, 235, 0.16) 0%, transparent 45%),
      radial-gradient(circle at 85% 75%, rgba(56, 189, 248, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.75) 0%, #0B1120 100%)
    `,
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    bg: `
      radial-gradient(circle at 20% 25%, rgba(236, 72, 153, 0.18) 0%, transparent 45%),
      radial-gradient(circle at 80% 75%, rgba(139, 92, 246, 0.20) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(20, 10, 35, 0.85) 0%, #080313 100%)
    `,
  },
  aurora: {
    name: 'Aurora Borealis',
    bg: `
      radial-gradient(circle at 25% 15%, rgba(16, 185, 129, 0.18) 0%, transparent 45%),
      radial-gradient(circle at 75% 80%, rgba(14, 165, 233, 0.16) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(6, 26, 35, 0.85) 0%, #031017 100%)
    `,
  },
  sunset: {
    name: 'Midnight Sunset',
    bg: `
      radial-gradient(circle at 20% 30%, rgba(245, 158, 11, 0.16) 0%, transparent 45%),
      radial-gradient(circle at 80% 70%, rgba(225, 29, 72, 0.16) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(28, 10, 20, 0.85) 0%, #0C040B 100%)
    `,
  },
};

export const Desktop: React.FC = () => {
  const { isBooted, windows, openWindow, setStartMenu } = useDesktopStore();
  const { init: initVFS, createFile } = useVFSStore();

  const [time, setTime] = useState(new Date());
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * IBP_TIPS.length));
  const [wallpaperTheme, setWallpaperTheme] = useState<WallpaperTheme>(() => {
    try {
      const saved = localStorage.getItem('ibp_wallpaper_theme') as WallpaperTheme;
      return saved && WALLPAPERS[saved] ? saved : 'deep-space';
    } catch {
      return 'deep-space';
    }
  });

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    initVFS();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // When booted, open requested app via URL param or default to Studio
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const initialApp = params.get('app') as AppId | null;
      if (initialApp && APP_REGISTRY[initialApp]) {
        openWindow(initialApp);
        return;
      }
    } catch {
      // ignore
    }
    if (isBooted && windows.length === 0) {
      openWindow('studio');
    }
  }, [isBooted]);

  const desktopShortcuts: { appId: AppId; title: string; icon: React.ReactNode; badge?: string }[] = [
    { appId: 'studio', title: 'IBP Studio', icon: <Code size={26} className="text-sky-400" />, badge: 'IDE' },
    { appId: 'langcraft', title: 'LangCraft', icon: <Wand2 size={26} className="text-purple-400" />, badge: 'Design Lang' },
    { appId: 'handbook', title: 'Learn IBP', icon: <BookOpen size={26} className="text-cyan-400" />, badge: 'PDF & Guide' },
    { appId: 'playground', title: 'Playground', icon: <Trophy size={26} className="text-yellow-400" />, badge: '20 Levels' },
    { appId: 'terminal', title: 'Terminal', icon: <Terminal size={26} className="text-emerald-400" />, badge: 'REPL' },
    { appId: 'explorer', title: 'File Explorer', icon: <Folder size={26} className="text-amber-400" /> },
    { appId: 'monitor', title: 'System Monitor', icon: <Activity size={26} className="text-indigo-400" /> },
    { appId: 'settings', title: 'Settings', icon: <Settings size={26} className="text-slate-400" /> },
  ];

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % IBP_TIPS.length);
  };

  const handleCycleWallpaper = () => {
    const themes: WallpaperTheme[] = ['deep-space', 'cyberpunk', 'aurora', 'sunset'];
    const nextIdx = (themes.indexOf(wallpaperTheme) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    setWallpaperTheme(nextTheme);
    try {
      localStorage.setItem('ibp_wallpaper_theme', nextTheme);
    } catch {
      // ignore
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    if (contextMenu) setContextMenu(null);
  };

  const handleQuickNewFile = async () => {
    const timestamp = Date.now().toString().slice(-4);
    const path = `IBP://USERS/guest/projects/quick_${timestamp}.ibp`;
    await createFile(path, '# Quick Starter Script\nkeep name = "Explorer"\nsay "Welcome to IBP OS, {name}!"\nshout "let\'s code something fun!"\n\nrecipe double(x) => x * 2\nsay "Double 21 is: {double(21)}"\ncelebrate\n');
    openWindow('studio');
  };

  if (!isBooted) {
    return <BootScreen />;
  }

  const currentWp = WALLPAPERS[wallpaperTheme] || WALLPAPERS['deep-space'];
  const hasVisibleWindows = windows.some((w) => !w.isMinimized);

  return (
    <div
      onClick={() => {
        setStartMenu(false);
        closeContextMenu();
      }}
      onContextMenu={handleContextMenu}
      className="relative w-screen h-screen overflow-hidden bg-[#0B1120] select-none font-sans flex flex-col justify-between"
      style={{ backgroundImage: currentWp.bg }}
    >
      {/* 1. Desktop Wallpaper / Grid Shortcuts (Left Side) */}
      <div className="absolute inset-0 p-5 grid grid-flow-col grid-rows-6 gap-3 auto-cols-max z-0 pointer-events-none">
        {desktopShortcuts.map((sc) => (
          <button
            key={sc.appId}
            onClick={() => openWindow(sc.appId)}
            className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl p-2.5 hover:bg-slate-800/40 border border-transparent hover:border-slate-700/50 hover:shadow-lg hover:backdrop-blur-sm transition duration-150 group pointer-events-auto relative text-center"
          >
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md group-hover:scale-110 group-hover:border-sky-500/40 transition-transform duration-150">
              {sc.icon}
            </div>
            <span className="text-[11px] font-semibold text-slate-200 mt-2 drop-shadow truncate w-full tracking-wide">
              {sc.title}
            </span>
            {sc.badge && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {sc.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 2. Interactive Desktop Background Widgets (Visible in Center / Right when windows minimized or empty) */}
      <div className={`absolute top-8 right-8 max-w-sm w-full space-y-4 z-0 pointer-events-none transition-opacity duration-300 ${hasVisibleWindows ? 'opacity-25 hover:opacity-100 pointer-events-auto' : 'opacity-100 pointer-events-auto'}`}>
        {/* Widget 1: Digital Clock & Date */}
        <div className="glass-panel p-5 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center space-x-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>IBP OS 🪐 ONLINE</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-[10px] text-sky-300 font-mono">
              v0.1.0
            </span>
          </div>

          <div className="text-3xl font-extrabold text-slate-100 tracking-tight font-mono my-1">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-xs font-medium text-slate-400">
            {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          {/* Quick Stats Pill */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-1.5 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <span className="text-slate-400 block">VM Clock</span>
              <span className="font-semibold text-sky-400">1x Realtime</span>
            </div>
            <div className="p-1.5 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <span className="text-slate-400 block">Storage</span>
              <span className="font-semibold text-emerald-400">IndexedDB</span>
            </div>
            <div className="p-1.5 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <span className="text-slate-400 block">Sandbox</span>
              <span className="font-semibold text-purple-400">Safe & Pure</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Tip of the Day & Quick Actions */}
        <div className="glass-panel p-4 rounded-2xl shadow-xl border border-slate-700/40 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
              <Sparkles size={14} />
              <span>LANGUAGE TIP OF THE DAY</span>
            </div>
            <button
              onClick={handleNextTip}
              className="p-1 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded transition"
              title="Next Tip"
            >
              <RefreshCw size={12} />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/70">
            {IBP_TIPS[tipIndex]}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleQuickNewFile}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/30 rounded-xl text-xs font-semibold transition"
            >
              <Play size={12} fill="currentColor" />
              <span>Start Coding</span>
            </button>
            <button
              onClick={() => openWindow('handbook')}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <BookOpen size={12} />
              <span>Learn IBP (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Floating Window Workspace */}
      <div className="relative flex-1 overflow-hidden pointer-events-none">
        {windows.map((win) => (
          <div key={win.id} className="pointer-events-auto">
            <Window window={win} />
          </div>
        ))}
      </div>

      {/* 4. Desktop Right-Click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-52 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 backdrop-blur-xl text-xs text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
            IBP Desktop Menu
          </div>
          <button
            onClick={() => {
              openWindow('studio');
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-sky-600/30 hover:text-sky-300 transition text-left"
          >
            <Code size={14} className="text-sky-400" />
            <span>Open IBP Studio</span>
          </button>
          <button
            onClick={() => {
              openWindow('langcraft');
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-600/30 hover:text-purple-300 transition text-left"
          >
            <Wand2 size={14} className="text-purple-400" />
            <span>LangCraft (Design Your Language)</span>
          </button>
          <button
            onClick={() => {
              openWindow('terminal');
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-600/30 hover:text-emerald-300 transition text-left"
          >
            <Terminal size={14} className="text-emerald-400" />
            <span>Open Terminal</span>
          </button>
          <button
            onClick={() => {
              openWindow('handbook');
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-cyan-600/30 hover:text-cyan-300 transition text-left"
          >
            <BookOpen size={14} className="text-cyan-400" />
            <span>Learn IBP (Full Guide & PDF)</span>
          </button>
          <button
            onClick={() => {
              openWindow('playground');
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-yellow-600/30 hover:text-yellow-300 transition text-left"
          >
            <Trophy size={14} className="text-yellow-400" />
            <span>Open Challenges Playground</span>
          </button>
          <button
            onClick={() => {
              openWindow('explorer');
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-600/30 hover:text-amber-300 transition text-left"
          >
            <Folder size={14} className="text-amber-400" />
            <span>File Explorer</span>
          </button>

          <div className="border-t border-slate-800 my-1" />

          <button
            onClick={() => {
              handleCycleWallpaper();
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-600/30 hover:text-purple-300 transition text-left"
          >
            <Palette size={14} className="text-purple-400" />
            <span>Theme: {currentWp.name}</span>
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition text-left"
          >
            <RefreshCw size={14} className="text-slate-400" />
            <span>Refresh Workspace</span>
          </button>
        </div>
      )}

      {/* 5. Taskbar */}
      <div className="relative z-50">
        <Taskbar />
        <StartMenu />
      </div>

      {/* 6. Global Modals */}
      <CommandPalette />
      <OnboardingTour />
    </div>
  );
};
