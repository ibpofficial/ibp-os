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
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Wifi,
  Battery,
  Sliders,
  Download,
  Check,
  Sparkles,
  Layers,
  Globe,
  Radio,
} from 'lucide-react';
import { useDesktopStore, APP_REGISTRY } from '../../stores/desktopStore';
import { AppId } from '../../types/desktop';
import { downloadOfflineBundle } from '../../utils/offlineDownloader';

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
  const [isDownloadingOffline, setIsDownloadingOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

  const handleDownloadOffline = async () => {
    setIsDownloadingOffline(true);
    try {
      await downloadOfflineBundle();
    } catch (e) {
      alert('Error bundling offline package: ' + String(e));
    } finally {
      setTimeout(() => setIsDownloadingOffline(false), 2000);
    }
  };

  const dockApps: { appId: AppId; label: string; icon: React.ReactNode; bg: string }[] = [
    { appId: 'studio', label: 'IBP Studio', icon: <Code size={19} className="text-sky-300" />, bg: 'from-blue-600 to-sky-500' },
    { appId: 'langcraft', label: 'LangCraft Studio', icon: <Wand2 size={19} className="text-purple-200" />, bg: 'from-purple-600 to-pink-500' },
    { appId: 'handbook', label: 'Learn IBP', icon: <BookOpen size={19} className="text-cyan-200" />, bg: 'from-cyan-600 to-teal-500' },
    { appId: 'playground', label: 'Playground', icon: <Trophy size={19} className="text-amber-200" />, bg: 'from-amber-600 to-yellow-500' },
    { appId: 'terminal', label: 'Terminal', icon: <Terminal size={19} className="text-emerald-200" />, bg: 'from-emerald-700 to-teal-600' },
    { appId: 'explorer', label: 'File Explorer', icon: <Folder size={19} className="text-amber-300" />, bg: 'from-amber-700 to-orange-600' },
    { appId: 'monitor', label: 'System Monitor', icon: <Activity size={19} className="text-indigo-200" />, bg: 'from-indigo-700 to-purple-600' },
    { appId: 'settings', label: 'Settings', icon: <Settings size={19} className="text-slate-200" />, bg: 'from-slate-700 to-slate-600' },
  ];

  return (
    <>
      {/* Floating Liquid Glass Taskbar / Dock Container */}
      <div className="fixed bottom-3 inset-x-0 mx-auto max-w-6xl w-[96vw] h-13 liquid-glass-dock rounded-2xl flex items-center justify-between px-3 select-none z-50 transition-all duration-200">
        {/* Left: Start Button with Animated Glowing Orbital Insignia & Quick Search */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleStartMenu}
            className={`group relative flex items-center space-x-2 px-3 py-1.5 rounded-xl transition duration-200 ${
              isStartMenuOpen
                ? 'bg-sky-500/25 border border-sky-400/50 shadow-lg shadow-sky-500/25'
                : 'hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60'
            }`}
            title="Start Menu (Win)"
          >
            {/* Glowing Orb */}
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-md shadow-sky-500/40 group-hover:scale-105 transition-transform">
              <span className="text-xs">🪐</span>
              <span className="absolute inset-0 rounded-full border border-sky-300/40 animate-ping opacity-25" />
            </div>
            <span className="font-bold text-xs text-slate-100 hidden sm:inline tracking-wide font-sans">
              IBP OS
            </span>
          </button>

          {/* Quick Search Button (Windows 11 / macOS Spotlight style) */}
          <button
            onClick={() => setCommandPalette(true)}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition text-[11px]"
            title="Search Apps & Files (Ctrl+K)"
          >
            <Search size={13} className="text-sky-400" />
            <span className="hidden md:inline text-slate-400">Search</span>
            <kbd className="hidden lg:inline px-1.5 py-0.2 text-[9px] bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Center: Centered Liquid Glass App Dock with macOS Springs & Windows Running Dots */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 px-2 py-0.5">
          {dockApps.map((app) => {
            const isRunning = windows.some((w) => w.appId === app.appId);
            const isCurrentActive = windows.some((w) => w.appId === app.appId && w.id === activeWindowId && !w.isMinimized);

            return (
              <div key={app.appId} className="relative group flex flex-col items-center">
                <button
                  onClick={() => {
                    const existing = windows.find((w) => w.appId === app.appId);
                    if (existing) {
                      if (existing.isMinimized) {
                        focusWindow(existing.id);
                      } else if (activeWindowId === existing.id) {
                        minimizeWindow(existing.id);
                      } else {
                        focusWindow(existing.id);
                      }
                    } else {
                      openWindow(app.appId);
                    }
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center os-icon-spring shadow-md transition-all ${
                    isCurrentActive
                      ? 'bg-gradient-to-br ' + app.bg + ' ring-2 ring-sky-400/70 shadow-lg shadow-sky-500/30'
                      : isRunning
                      ? 'bg-slate-800/90 border border-slate-700/80 hover:bg-slate-700/90'
                      : 'bg-slate-900/70 border border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {app.icon}
                </button>

                {/* macOS style active indicator dot */}
                {isRunning && (
                  <span
                    className={`absolute -bottom-1.5 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      isCurrentActive
                        ? 'bg-sky-400 shadow-[0_0_8px_#38BDF8] scale-125'
                        : 'bg-slate-400/80'
                    }`}
                  />
                )}

                {/* Floating Tooltip */}
                <div className="absolute -top-9 px-2.5 py-1 rounded-lg bg-slate-900/95 border border-slate-700 text-[10px] text-slate-100 font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl backdrop-blur-md">
                  {app.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: System Tray (Offline Download, Network, Battery, Clock & Flyout) */}
        <div className="flex items-center space-x-2">
          {/* 1-Click Download Offline OS Button */}
          <button
            onClick={handleDownloadOffline}
            disabled={isDownloadingOffline}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition active:scale-95 shadow-sm"
            title="Download Standalone Offline OS (ZIP)"
          >
            {isDownloadingOffline ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-emerald-300 border-t-transparent animate-spin" />
                <span className="hidden sm:inline">Bundling...</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span className="hidden md:inline">Run Offline</span>
              </>
            )}
          </button>

          {/* Quick Settings Capsule */}
          <button
            onClick={() => setShowTrayMenu(!showTrayMenu)}
            className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border transition ${
              showTrayMenu
                ? 'bg-slate-800 text-sky-400 border-sky-500/50 shadow-md shadow-sky-500/20'
                : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border-slate-800/80'
            }`}
            title="Quick Settings & System Status"
          >
            {isOnline ? (
              <Wifi size={13} className="text-emerald-400" />
            ) : (
              <Radio size={13} className="text-amber-400 animate-pulse" />
            )}
            <Battery size={13} className="text-sky-400" />
            <Sliders size={13} className="text-slate-400" />
          </button>

          {/* Digital Clock & Calendar */}
          <div
            onClick={() => setShowTrayMenu(!showTrayMenu)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900/70 hover:bg-slate-800 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-200 cursor-pointer transition select-none"
          >
            <span>{timeStr}</span>
            <span className="text-slate-500 text-[10px] hidden lg:inline">• {dateStr}</span>
          </div>

          {/* Show Desktop Peek Bar (Windows style far right line) */}
          <div
            onClick={() => {
              windows.forEach((w) => {
                if (!w.isMinimized) minimizeWindow(w.id);
              });
            }}
            className="w-1.5 h-7 hover:bg-sky-400/60 rounded-full cursor-pointer transition-colors"
            title="Show Desktop"
          />
        </div>
      </div>

      {/* Liquid Glass Quick Settings Flyout Menu */}
      {showTrayMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-16 right-4 w-80 liquid-glass rounded-2xl shadow-2xl p-4 select-none z-50 text-xs text-slate-200 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 space-y-3.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="font-bold text-slate-100 flex items-center space-x-2">
              <span className="text-sm">🪐</span>
              <span>Liquid System Controls</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
              {isOnline ? 'Online (PWA Ready)' : 'Offline Active'}
            </span>
          </div>

          {/* Quick Toggles */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition"
            >
              {theme === 'dark' ? <Moon size={14} className="text-sky-400" /> : <Sun size={14} className="text-amber-400" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition"
            >
              {soundEnabled ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} className="text-slate-500" />}
              <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
            </button>

            <button
              onClick={handleToggleFullscreen}
              className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition"
            >
              {isFullscreen ? <Minimize2 size={14} className="text-indigo-400" /> : <Maximize2 size={14} className="text-indigo-400" />}
              <span>{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
            </button>

            <button
              onClick={() => {
                openWindow('handbook');
                setShowTrayMenu(false);
              }}
              className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition"
            >
              <BookOpen size={14} className="text-cyan-400" />
              <span>Handbook</span>
            </button>
          </div>

          {/* Download Offline Package Card */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/50 to-teal-950/50 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-emerald-300 font-semibold text-[11px]">
              <span className="flex items-center space-x-1.5">
                <Download size={13} />
                <span>Portable Offline Edition</span>
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">ZIP Bundle</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Download the standalone package to run IBP OS anywhere on your laptop with zero internet needed.
            </p>
            <button
              onClick={handleDownloadOffline}
              disabled={isDownloadingOffline}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow transition flex items-center justify-center space-x-1.5"
            >
              <Download size={12} />
              <span>Download Offline OS (ZIP)</span>
            </button>
          </div>

          {/* System Telemetry */}
          <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 text-[10px] space-y-1 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Virtual Core:</span>
              <span className="text-emerald-400 font-semibold">Deterministic VM</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Local Storage:</span>
              <span className="text-sky-400 font-semibold">IndexedDB (Active)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Active Windows:</span>
              <span className="text-purple-400 font-semibold">{windows.length} Running</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
