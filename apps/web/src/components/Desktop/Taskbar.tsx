import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Download,
  Search,
  Sparkles,
  Command,
  Monitor,
  Terminal,
  Settings,
  Folder,
  RefreshCw,
  SunMoon,
  Gamepad2,
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
  ArcadeGamesIcon,
  IBPOSLogoIcon,
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
    isControlCenterOpen,
    toggleControlCenter,
    setControlCenter,
    setCommandPalette,
    openWindow,
    theme,
  } = useDesktopStore();
  const isLight = theme === 'light';

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isDownloadingOffline, setIsDownloadingOffline] = useState(false);
  const [isDockHovered, setIsDockHovered] = useState(false);
  const [startQuickMenu, setStartQuickMenu] = useState<{ x: number; y: number } | null>(null);

  // Auto-hide dock ONLY when an active window is MAXIMIZED in full screen mode
  const hasMaximizedWindow = windows.some((w) => !w.isMinimized && w.isMaximized);
  const shouldHideDock = hasMaximizedWindow && !isDockHovered && !isStartMenuOpen && !isControlCenterOpen && !startQuickMenu;

  // Active Mouse Tracking: Show dock only when cursor is strictly at the bottom 3px,
  // and immediately hide dock when mouse moves upwards into the window
  useEffect(() => {
    if (!hasMaximizedWindow) {
      setIsDockHovered(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Reveal dock only if cursor hits the bottom 3px edge
      if (e.clientY >= window.innerHeight - 3) {
        setIsDockHovered(true);
      } else if (e.clientY < window.innerHeight - 80) {
        // As soon as cursor leaves the dock zone upwards into the window, hide immediately!
        setIsDockHovered(false);
      }
    };

    const handleBlur = () => {
      setIsDockHovered(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('blur', handleBlur);
    };
  }, [hasMaximizedWindow]);

  // Auto-dismiss dock timer: If dock is peeked over an active window, auto-dismiss after 2.5s of inactivity
  useEffect(() => {
    if (!isDockHovered || !hasMaximizedWindow || isStartMenuOpen || isControlCenterOpen || startQuickMenu) {
      return;
    }
    const timer = setTimeout(() => {
      setIsDockHovered(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isDockHovered, hasMaximizedWindow, isStartMenuOpen, isControlCenterOpen, startQuickMenu]);

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

  // Dismiss start quick menu on click outside
  useEffect(() => {
    if (!startQuickMenu) return;
    const handleClick = () => setStartQuickMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [startQuickMenu]);

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
    { appId: 'games', label: 'Arcade Games', renderIcon: () => <ArcadeGamesIcon size={44} /> },
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
      {/* Extreme bottom edge sensor (3px) to reveal dock when cursor reaches the very bottom of the screen */}
      {hasMaximizedWindow && (
        <div
          onMouseEnter={() => setIsDockHovered(true)}
          className="fixed bottom-0 inset-x-0 h-[3px] z-50 pointer-events-auto bg-transparent"
        />
      )}

      {/* Floating macOS-Style Liquid Glass Dock (Auto-hides in Fullscreen mode like Windows/macOS) */}
      <div
        onMouseEnter={() => setIsDockHovered(true)}
        onMouseLeave={() => setIsDockHovered(false)}
        className={`fixed bottom-3 inset-x-0 mx-auto w-max max-w-[96vw] h-16 liquid-glass-dock rounded-3xl flex items-center justify-center px-4 select-none z-50 transition-all duration-300 ease-out ${
          shouldHideDock
            ? 'translate-y-36 opacity-0 pointer-events-none'
            : 'translate-y-0 opacity-100 pointer-events-auto shadow-2xl'
        }`}
      >
        <div className="flex items-center space-x-2 sm:space-x-3.5">
          {/* Start Orb (Refined IBP OS Insignia Logo with Win+X Quick Menu) */}
          <div className="relative group flex flex-col items-center">
            <button
              onClick={toggleStartMenu}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setStartQuickMenu({ x: e.clientX, y: e.clientY });
              }}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center os-icon-spring transition-all cursor-pointer ${
                isStartMenuOpen
                  ? 'bg-sky-500/30 border border-sky-400/60 shadow-lg shadow-sky-500/40 scale-110'
                  : 'hover:bg-white/10'
              }`}
              title="Start Menu (Right-click for Quick Menu)"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                <IBPOSLogoIcon size={32} />
              </div>
            </button>
            <div className="absolute -top-10 px-2.5 py-1 rounded-xl bg-slate-900/95 border border-white/15 text-[11px] text-slate-100 font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-xl backdrop-blur-xl">
              Start Menu
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
              data-control-center-toggle="true"
              onClick={(e) => {
                e.stopPropagation();
                toggleControlCenter();
              }}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center os-icon-spring border transition-all cursor-pointer ${
                isControlCenterOpen
                  ? 'bg-sky-500/30 text-sky-400 border-sky-400/50 shadow-lg shadow-sky-500/30'
                  : isLight
                  ? 'bg-white/80 hover:bg-white border-slate-300/80 text-slate-700 hover:text-slate-900 shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Control Center"
            >
              <Sliders size={18} />
            </button>
            <div className={`absolute -top-10 px-2.5 py-1 rounded-xl border text-[11px] font-semibold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-2xl backdrop-blur-xl ${
              isLight ? 'bg-white/95 border-slate-300 text-slate-800 shadow-slate-300/50' : 'bg-slate-900/95 border-white/15 text-slate-100'
            }`}>
              Control Center
            </div>
          </div>

          {/* Mini Clock on Dock */}
          <div
            data-control-center-toggle="true"
            onClick={(e) => {
              e.stopPropagation();
              toggleControlCenter();
            }}
            className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl cursor-pointer transition font-mono ${
              isLight ? 'hover:bg-slate-200/60 text-slate-800' : 'hover:bg-white/10 text-slate-200'
            }`}
            title={dateStr}
          >
            <span className="text-[11px] font-bold tracking-tight">{timeStr}</span>
            <span className={`text-[9px] leading-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{dateStr}</span>
          </div>
        </div>
      </div>

      {/* Start Orb Right-Click Win+X Quick Power Menu */}
      {startQuickMenu && (
        <div
          style={{ position: 'fixed', bottom: '80px', left: `${startQuickMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-56 rounded-2xl liquid-glass shadow-2xl p-1.5 backdrop-blur-2xl text-xs select-none border border-white/20 text-slate-100 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            <span>Quick Actions</span>
            <Command size={11} />
          </div>

          <button
            onClick={() => {
              openWindow('studio');
              setStartQuickMenu(null);
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition text-left text-slate-200 hover:text-white"
          >
            <Monitor size={14} className="text-slate-300" />
            <span>IBP Studio</span>
          </button>

          <button
            onClick={() => {
              openWindow('terminal');
              setStartQuickMenu(null);
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition text-left text-slate-200 hover:text-white"
          >
            <Terminal size={14} className="text-slate-300" />
            <span>Command Prompt</span>
          </button>

          <button
            onClick={() => {
              openWindow('explorer');
              setStartQuickMenu(null);
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition text-left text-slate-200 hover:text-white"
          >
            <Folder size={14} className="text-slate-300" />
            <span>File Explorer</span>
          </button>

          <button
            onClick={() => {
              openWindow('games');
              setStartQuickMenu(null);
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition text-left text-slate-200 hover:text-white"
          >
            <Gamepad2 size={14} className="text-slate-300" />
            <span>Arcade Games</span>
          </button>

          <button
            onClick={() => {
              openWindow('settings');
              setStartQuickMenu(null);
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition text-left text-slate-200 hover:text-white"
          >
            <Settings size={14} className="text-slate-300" />
            <span>Settings</span>
          </button>

          <div className="border-t border-white/10 my-1" />

          <button
            onClick={() => {
              useDesktopStore.getState().toggleTheme();
              setStartQuickMenu(null);
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition text-left text-slate-200 hover:text-white"
          >
            <SunMoon size={14} className="text-slate-300" />
            <span>Toggle Light / Dark Mode</span>
          </button>

          <button
            onClick={() => {
              window.location.reload();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition text-left text-slate-200 hover:text-white"
          >
            <RefreshCw size={14} className="text-slate-300" />
            <span>Restart Workspace</span>
          </button>
        </div>
      )}
    </>
  );
};
