import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Download,
  Search,
  Sparkles,
} from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';
import { AppId } from '../../types/desktop';
import { downloadOfflineBundle } from '../../utils/offlineDownloader';
import { ControlCenter } from './ControlCenter';
import {
  VSCodeStudioIcon,
  FolderUserIcon,
  LangCraftIcon,
  TerminalOSIcon,
  HandbookOSIcon,
  PlaygroundOSIcon,
  MonitorOSIcon,
  SettingsOSIcon,
  ChromeBrowserIcon,
} from '../Icons/OSIcons';

interface TaskbarProps {
  onOpenWallpaperModal?: () => void;
  brightness?: number;
  onBrightnessChange?: (val: number) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  onOpenWallpaperModal = () => {},
  brightness = 0.85,
  onBrightnessChange = () => {},
}) => {
  const {
    windows,
    activeWindowId,
    focusWindow,
    minimizeWindow,
    toggleStartMenu,
    isStartMenuOpen,
    setCommandPalette,
    openWindow,
  } = useDesktopStore();

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [isDownloadingOffline, setIsDownloadingOffline] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const dockApps: { appId: AppId; label: string; renderIcon: () => React.ReactNode }[] = [
    { appId: 'studio', label: 'IBP Studio', renderIcon: () => <VSCodeStudioIcon size={44} showShortcutArrow={false} /> },
    { appId: 'browser', label: 'Chrome', renderIcon: () => <ChromeBrowserIcon size={44} showShortcutArrow={false} /> },
    { appId: 'terminal', label: 'Command Prompt', renderIcon: () => <TerminalOSIcon size={44} /> },
    { appId: 'langcraft', label: 'LangCraft Studio', renderIcon: () => <LangCraftIcon size={44} /> },
    { appId: 'explorer', label: 'File Explorer', renderIcon: () => <FolderUserIcon size={44} hasUserBadge={true} /> },
    { appId: 'handbook', label: 'Learn IBP', renderIcon: () => <HandbookOSIcon size={44} /> },
    { appId: 'playground', label: 'Playground', renderIcon: () => <PlaygroundOSIcon size={44} /> },
    { appId: 'monitor', label: 'System Monitor', renderIcon: () => <MonitorOSIcon size={44} /> },
    { appId: 'settings', label: 'Settings', renderIcon: () => <SettingsOSIcon size={44} /> },
  ];

  return (
    <>
      {/* Floating macOS-Style Liquid Glass Dock */}
      <div className="fixed bottom-3 inset-x-0 mx-auto w-max max-w-[96vw] h-16 liquid-glass-dock rounded-3xl flex items-center justify-center px-4 select-none z-50 transition-all duration-200">
        <div className="flex items-center space-x-2 sm:space-x-3.5">
          {/* Start Orb (macOS Finder / IBP OS Orb) */}
          <div className="relative group flex flex-col items-center">
            <button
              onClick={toggleStartMenu}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center os-icon-spring transition-all ${
                isStartMenuOpen
                  ? 'bg-sky-500/30 border border-sky-400/60 shadow-lg shadow-sky-500/40 scale-110'
                  : 'hover:bg-white/10'
              }`}
              title="Start Menu"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/40 border border-white/30 text-sm">
                🪐
              </div>
            </button>
            <div className="absolute -top-10 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-white/15 text-[11px] text-slate-100 font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl backdrop-blur-xl">
              IBP OS
            </div>
          </div>

          {/* Quick Search Button */}
          <div className="relative group flex flex-col items-center">
            <button
              onClick={() => setCommandPalette(true)}
              className="w-11 h-11 rounded-2xl flex items-center justify-center os-icon-spring bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 hover:text-sky-300 shadow-md"
              title="Spotlight Search (Ctrl+K)"
            >
              <Search size={20} className="text-sky-400" />
            </button>
            <div className="absolute -top-10 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-white/15 text-[11px] text-slate-100 font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl backdrop-blur-xl">
              Search Apps (Ctrl+K)
            </div>
          </div>

          {/* macOS Dock Apps */}
          {dockApps.map((app) => {
            const isRunning = windows.some((w) => w.appId === app.appId);
            const isCurrentActive = windows.some(
              (w) => w.appId === app.appId && w.id === activeWindowId && !w.isMinimized
            );

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
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center os-icon-spring transition-all cursor-pointer ${
                    isCurrentActive ? 'scale-105' : ''
                  }`}
                >
                  {app.renderIcon()}
                </button>

                {/* macOS Active Dot Indicator */}
                {isRunning && (
                  <span
                    className={`absolute -bottom-1.5 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      isCurrentActive
                        ? 'bg-sky-400 shadow-[0_0_8px_#38BDF8] scale-125'
                        : 'bg-white/80'
                    }`}
                  />
                )}

                {/* macOS Hover Tooltip */}
                <div className="absolute -top-10 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-white/15 text-[11px] text-slate-100 font-semibold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-2xl backdrop-blur-xl">
                  {app.label}
                </div>
              </div>
            );
          })}

          {/* macOS Dock Vertical Divider */}
          <div className="w-[1px] h-9 bg-white/20 mx-1 rounded-full" />

          {/* Offline ZIP Download Button */}
          <div className="relative group flex flex-col items-center">
            <button
              onClick={handleDownloadOffline}
              disabled={isDownloadingOffline}
              className="w-11 h-11 rounded-2xl flex items-center justify-center os-icon-spring bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 shadow-md cursor-pointer"
              title="Download Offline Edition (ZIP)"
            >
              {isDownloadingOffline ? (
                <span className="w-4 h-4 rounded-full border-2 border-emerald-300 border-t-transparent animate-spin" />
              ) : (
                <Download size={20} />
              )}
            </button>
            <div className="absolute -top-10 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-white/15 text-[11px] text-emerald-300 font-semibold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-2xl backdrop-blur-xl">
              Run Offline (ZIP)
            </div>
          </div>

          {/* macOS Control Center Toggle */}
          <div className="relative group flex flex-col items-center">
            <button
              onClick={() => setShowControlCenter(!showControlCenter)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center os-icon-spring border transition-all cursor-pointer ${
                showControlCenter
                  ? 'bg-sky-500/30 text-sky-300 border-sky-400/50 shadow-lg shadow-sky-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Control Center"
            >
              <Sliders size={18} />
            </button>
            <div className="absolute -top-10 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-white/15 text-[11px] text-slate-100 font-semibold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-2xl backdrop-blur-xl">
              Control Center
            </div>
          </div>

          {/* Mini Clock on Dock */}
          <div
            onClick={() => setShowControlCenter(!showControlCenter)}
            className="flex flex-col items-center justify-center px-2 py-1 rounded-xl hover:bg-white/10 cursor-pointer transition font-mono text-slate-200"
            title={dateStr}
          >
            <span className="text-[11px] font-bold tracking-tight">{timeStr}</span>
            <span className="text-[9px] text-slate-400 leading-none">{dateStr}</span>
          </div>
        </div>
      </div>

      {/* Liquid Glass Control Center Popover */}
      <ControlCenter
        isOpen={showControlCenter}
        onClose={() => setShowControlCenter(false)}
        onOpenWallpaperModal={onOpenWallpaperModal}
        brightness={brightness}
        onBrightnessChange={onBrightnessChange}
      />
    </>
  );
};
