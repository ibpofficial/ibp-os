import React, { useEffect } from 'react';
import {
  Code,
  Terminal,
  Folder,
  Activity,
  BookOpen,
  Trophy,
  Settings,
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

export const Desktop: React.FC = () => {
  const {
    isBooted,
    windows,
    openWindow,
    setStartMenu,
  } = useDesktopStore();
  const { init: initVFS } = useVFSStore();

  useEffect(() => {
    initVFS();
  }, []);

  // When booted, open Studio by default if no window is open
  useEffect(() => {
    if (isBooted && windows.length === 0) {
      openWindow('studio');
    }
  }, [isBooted]);

  const desktopShortcuts: { appId: AppId; title: string; icon: React.ReactNode }[] = [
    { appId: 'studio', title: 'IBP Studio', icon: <Code size={26} className="text-sky-400" /> },
    { appId: 'terminal', title: 'Terminal', icon: <Terminal size={26} className="text-emerald-400" /> },
    { appId: 'playground', title: 'Playground', icon: <Trophy size={26} className="text-yellow-400" /> },
    { appId: 'explorer', title: 'File Explorer', icon: <Folder size={26} className="text-amber-400" /> },
    { appId: 'handbook', title: 'IBP Handbook', icon: <BookOpen size={26} className="text-cyan-400" /> },
    { appId: 'monitor', title: 'System Monitor', icon: <Activity size={26} className="text-indigo-400" /> },
    { appId: 'settings', title: 'Settings', icon: <Settings size={26} className="text-slate-400" /> },
  ];

  if (!isBooted) {
    return <BootScreen />;
  }

  return (
    <div
      onClick={() => setStartMenu(false)}
      className="relative w-screen h-screen overflow-hidden bg-[#0B1120] select-none font-sans flex flex-col justify-between"
      style={{
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(37, 99, 235, 0.12) 0%, transparent 40%),
          radial-gradient(circle at 85% 75%, rgba(56, 189, 248, 0.08) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.7) 0%, #0B1120 100%)
        `,
      }}
    >
      {/* 1. Desktop Wallpaper / Grid Shortcuts */}
      <div className="absolute inset-0 p-4 grid grid-flow-col grid-rows-6 gap-4 auto-cols-max z-0 pointer-events-none">
        {desktopShortcuts.map((sc) => (
          <button
            key={sc.appId}
            onClick={() => openWindow(sc.appId)}
            className="flex flex-col items-center justify-center w-20 h-20 rounded-xl p-2 hover:bg-slate-800/40 border border-transparent hover:border-slate-700/40 transition group pointer-events-auto"
          >
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow group-hover:scale-105 transition-transform">
              {sc.icon}
            </div>
            <span className="text-[11px] font-medium text-slate-300 mt-1.5 text-center drop-shadow truncate w-full">
              {sc.title}
            </span>
          </button>
        ))}
      </div>

      {/* 2. Floating Window Workspace */}
      <div className="relative flex-1 overflow-hidden pointer-events-none">
        {windows.map((win) => (
          <div key={win.id} className="pointer-events-auto">
            <Window window={win} />
          </div>
        ))}
      </div>

      {/* 3. Taskbar */}
      <div className="relative z-50">
        <Taskbar />
        <StartMenu />
      </div>

      {/* 4. Global Modals */}
      <CommandPalette />
      <OnboardingTour />
    </div>
  );
};
