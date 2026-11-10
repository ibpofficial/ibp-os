import React, { useState, useRef } from 'react';
import { Minus, Square, Copy, X, SunMoon, Sliders } from 'lucide-react';
import { WindowState } from '../../types/desktop';
import { useDesktopStore, APP_REGISTRY } from '../../stores/desktopStore';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { StudioApp } from '../../apps/Studio';
import { TerminalApp } from '../../apps/Terminal';
import { ExplorerApp } from '../../apps/Explorer';
import { MonitorApp } from '../../apps/Monitor';
import { HandbookApp } from '../../apps/Handbook';
import { PlaygroundApp } from '../../apps/Playground';
import { SettingsApp } from '../../apps/Settings';
import { LangCraftApp } from '../../apps/LangCraft';
import { BrowserApp } from '../../apps/Browser';
import { GamesApp } from '../../apps/Games';
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

interface WindowProps {
  window: WindowState;
}

export const Window: React.FC<WindowProps> = ({ window }) => {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowBounds,
    activeWindowId,
    theme,
    toggleTheme,
    toggleStartMenu,
    toggleControlCenter,
  } = useDesktopStore();

  const isLight = theme === 'light';
  const isFocused = activeWindowId === window.id;
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const [activeResizing, setActiveResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, winX: 0, winY: 0 });

  // Handle Dragging via Title Bar
  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      winX: window.x,
      winY: window.y,
    };
    focusWindow(window.id);

    const handleMouseMove = (moveEv: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = moveEv.clientX - dragStart.current.x;
      const dy = moveEv.clientY - dragStart.current.y;
      updateWindowBounds(window.id, {
        x: Math.max(0, dragStart.current.winX + dx),
        y: Math.max(0, dragStart.current.winY + dy),
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle 8-Direction Window Resizing
  const handleMouseDownResize = (direction: string, e: React.MouseEvent) => {
    if (window.isMaximized) return;
    e.stopPropagation();
    e.preventDefault();
    isResizing.current = true;
    setActiveResizing(true);
    focusWindow(window.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWinX = window.x;
    const startWinY = window.y;
    const startWinW = window.width;
    const startWinH = window.height;

    const minW = 440;
    const minH = 280;
    const screenW = typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1920;
    const screenH = typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 1080;
    const maxW = screenW - 20;
    const maxH = screenH - 50;

    const handleMouseMove = (moveEv: MouseEvent) => {
      if (!isResizing.current) return;
      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;

      let newX = startWinX;
      let newY = startWinY;
      let newW = startWinW;
      let newH = startWinH;

      // Horizontal resize
      if (direction.includes('e')) {
        newW = Math.max(minW, Math.min(maxW, startWinW + dx));
      }
      if (direction.includes('w')) {
        const potentialW = startWinW - dx;
        if (potentialW >= minW && potentialW <= maxW) {
          newW = potentialW;
          newX = startWinX + dx;
        } else if (potentialW < minW) {
          newW = minW;
          newX = startWinX + (startWinW - minW);
        }
      }

      // Vertical resize
      if (direction.includes('s')) {
        newH = Math.max(minH, Math.min(maxH, startWinH + dy));
      }
      if (direction.includes('n')) {
        const potentialH = startWinH - dy;
        if (potentialH >= minH && potentialH <= maxH) {
          newH = potentialH;
          newY = startWinY + dy;
        } else if (potentialH < minH) {
          newH = minH;
          newY = startWinY + (startWinH - minH);
        }
      }

      updateWindowBounds(window.id, {
        x: Math.max(0, Math.round(newX)),
        y: Math.max(0, Math.round(newY)),
        width: Math.round(newW),
        height: Math.round(newH),
      });
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      setActiveResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getWindowMiniIcon = () => {
    switch (window.appId) {
      case 'studio':
        return <VSCodeStudioIcon size={16} showShortcutArrow={false} />;
      case 'langcraft':
        return <LangCraftIcon size={16} />;
      case 'terminal':
        return <TerminalOSIcon size={16} />;
      case 'explorer':
        return <FolderUserIcon size={16} hasUserBadge={false} />;
      case 'monitor':
        return <MonitorOSIcon size={16} />;
      case 'handbook':
        return <HandbookOSIcon size={16} />;
      case 'playground':
        return <PlaygroundOSIcon size={16} />;
      case 'settings':
        return <SettingsOSIcon size={16} />;
      case 'browser':
        return <ChromeBrowserIcon size={16} />;
      case 'games':
        return <ArcadeGamesIcon size={16} />;
      default:
        return null;
    }
  };

  const renderAppContent = () => {
    switch (window.appId) {
      case 'studio':
        return <StudioApp />;
      case 'terminal':
        return <TerminalApp />;
      case 'explorer':
        return <ExplorerApp />;
      case 'monitor':
        return <MonitorApp />;
      case 'handbook':
        return <HandbookApp />;
      case 'playground':
        return <PlaygroundApp />;
      case 'settings':
        return <SettingsApp />;
      case 'langcraft':
        return <LangCraftApp />;
      case 'browser':
        return <BrowserApp initialUrl={window.params?.url} />;
      case 'games':
        return <GamesApp />;
      default:
        return <div className="p-4 text-slate-400">App not found</div>;
    }
  };

  if (window.isMinimized) return null;

  const style: React.CSSProperties = window.isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: window.zIndex,
      }
    : {
        position: 'absolute',
        top: `${window.y}px`,
        left: `${window.x}px`,
        width: `${window.width}px`,
        height: `${window.height}px`,
        zIndex: window.zIndex,
      };

  const appMeta = APP_REGISTRY[window.appId];

  return (
    <div
      style={style}
      onMouseDown={() => focusWindow(window.id)}
      className={`pointer-events-auto flex flex-col overflow-hidden ${
        activeResizing ? '' : 'transition-all duration-150'
      } ${
        window.isMaximized ? 'rounded-none border-0 shadow-none' : 'rounded-xl shadow-2xl'
      } ${
        isLight
          ? isFocused
            ? window.isMaximized
              ? 'bg-white text-slate-800'
              : 'bg-white/95 text-slate-800 border border-slate-300 ring-1 ring-sky-500/50 shadow-2xl'
            : window.isMaximized
            ? 'bg-slate-50 text-slate-700'
            : 'bg-slate-50/95 text-slate-700 border border-slate-300/80 shadow-lg opacity-95'
          : window.isMaximized
          ? 'bg-[#0B1120] text-slate-100'
          : `liquid-glass-window ${
              isFocused ? 'liquid-glass-active ring-1 ring-sky-400/40' : 'opacity-95'
            }`
      }`}
    >
      {/* Liquid Glass Window Titlebar (Windows-Style Controls on the RIGHT) */}
      <div
        onMouseDown={handleMouseDownHeader}
        onDoubleClick={() => maximizeWindow(window.id)}
        className={`flex items-center justify-between pl-3 pr-0 py-0 select-none cursor-move border-b h-8 ${
          isLight
            ? isFocused
              ? 'bg-slate-200/95 text-slate-800 border-slate-300'
              : 'bg-slate-100/95 text-slate-500 border-slate-250'
            : isFocused
            ? 'bg-gradient-to-r from-slate-900/95 via-slate-850/90 to-slate-900/95 text-slate-100 border-white/10'
            : 'bg-slate-950/85 text-slate-400 border-white/10'
        }`}
      >
        {/* Left: Start Orb + App Icon + Window Title */}
        <div className="flex items-center space-x-2 truncate py-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleStartMenu();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center transition-transform hover:scale-110 shrink-0 pointer-events-auto cursor-pointer"
            title="Start Menu / Launcher (Win)"
          >
            <IBPOSLogoIcon size={16} />
          </button>
          {getWindowMiniIcon()}
          <span
            className={`font-semibold text-xs tracking-wide truncate ${
              isLight ? 'text-slate-800' : 'text-slate-100'
            }`}
          >
            {window.title}
          </span>
          <span
            className={`text-[10px] font-mono hidden sm:inline px-1.5 py-0.2 rounded border ${
              isLight
                ? 'text-sky-700 bg-sky-50 border-sky-300/60'
                : 'text-sky-400/80 bg-sky-950/50 border-sky-500/20'
            }`}
          >
            {appMeta?.title || 'IBP App'}
          </span>
        </div>

        {/* Right: Windows-Style Minimize, Maximize & Close Controls */}
        <div
          className="flex items-stretch h-full shrink-0 pointer-events-auto z-10"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Quick Control Center Toggle */}
          <button
            data-control-center-toggle="true"
            onClick={(e) => {
              e.stopPropagation();
              toggleControlCenter();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-8 h-8 flex items-center justify-center transition-colors cursor-pointer pointer-events-auto ${
              isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-300/70'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Open Control Center"
          >
            <Sliders size={12} strokeWidth={2} />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-8 h-8 flex items-center justify-center transition-colors cursor-pointer pointer-events-auto ${
              isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-300/70'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Light / Dark Mode"
          >
            <SunMoon size={12} strokeWidth={2} />
          </button>

          {/* Minimize Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(window.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-11 h-8 flex items-center justify-center transition-colors cursor-pointer pointer-events-auto ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/70'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Minimize"
          >
            <Minus size={13} strokeWidth={2} />
          </button>

          {/* Maximize / Restore Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              maximizeWindow(window.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-11 h-8 flex items-center justify-center transition-colors cursor-pointer pointer-events-auto ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/70'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={window.isMaximized ? 'Restore' : 'Maximize'}
          >
            {window.isMaximized ? (
              <Copy size={11} strokeWidth={2} />
            ) : (
              <Square size={11} strokeWidth={2} />
            )}
          </button>

          {/* Close Button with Windows Red Hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(window.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-11 h-8 flex items-center justify-center transition-colors cursor-pointer pointer-events-auto ${
              isLight
                ? 'text-slate-600 hover:text-white hover:bg-[#E81123]'
                : 'text-slate-400 hover:text-white hover:bg-[#E81123]'
            }`}
            title="Close"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* App Body */}
      <div className={`flex-1 overflow-hidden relative ${isLight ? 'bg-white' : 'bg-[#0B1120]/95'}`}>
        <ErrorBoundary fallbackTitle={`Error in ${window.title}`}>
          {renderAppContent()}
        </ErrorBoundary>
      </div>

      {/* 8-Direction Window Resize Handles (When not in full screen) */}
      {!window.isMaximized && (
        <>
          {/* North edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize('n', e)}
            className="absolute top-0 left-2 right-2 h-2 cursor-ns-resize z-50 hover:bg-sky-500/20 active:bg-sky-500/40"
            title="Resize window height"
          />
          {/* South edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize('s', e)}
            className="absolute bottom-0 left-2 right-2 h-2.5 cursor-ns-resize z-50 hover:bg-sky-500/20 active:bg-sky-500/40"
            title="Resize window height"
          />
          {/* West edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize('w', e)}
            className="absolute top-2 bottom-2 left-0 w-2 cursor-ew-resize z-50 hover:bg-sky-500/20 active:bg-sky-500/40"
            title="Resize window width"
          />
          {/* East edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize('e', e)}
            className="absolute top-2 bottom-2 right-0 w-2.5 cursor-ew-resize z-50 hover:bg-sky-500/20 active:bg-sky-500/40"
            title="Resize window width"
          />
          {/* North-West corner */}
          <div
            onMouseDown={(e) => handleMouseDownResize('nw', e)}
            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-sky-500/30 active:bg-sky-500/50 rounded-tl-xl"
            title="Resize window"
          />
          {/* North-East corner */}
          <div
            onMouseDown={(e) => handleMouseDownResize('ne', e)}
            className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-50 hover:bg-sky-500/30 active:bg-sky-500/50 rounded-tr-xl"
            title="Resize window"
          />
          {/* South-West corner */}
          <div
            onMouseDown={(e) => handleMouseDownResize('sw', e)}
            className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-50 hover:bg-sky-500/30 active:bg-sky-500/50 rounded-bl-xl"
            title="Resize window"
          />
          {/* South-East corner */}
          <div
            onMouseDown={(e) => handleMouseDownResize('se', e)}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-sky-500/30 active:bg-sky-500/50 rounded-br-xl"
            title="Resize window"
          />
        </>
      )}
    </div>
  );
};
