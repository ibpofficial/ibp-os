import React, { useState, useRef } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
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
import {
  VSCodeStudioIcon,
  FolderUserIcon,
  LangCraftIcon,
  TerminalOSIcon,
  HandbookOSIcon,
  PlaygroundOSIcon,
  MonitorOSIcon,
  SettingsOSIcon,
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
  } = useDesktopStore();

  const isFocused = activeWindowId === window.id;
  const isDragging = useRef(false);
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
      default:
        return <div className="p-4 text-slate-400">App not found</div>;
    }
  };

  if (window.isMinimized) return null;

  const style: React.CSSProperties = window.isMaximized
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 68px)',
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
      className={`flex flex-col liquid-glass-window rounded-xl overflow-hidden transition-all duration-150 shadow-2xl ${
        isFocused ? 'liquid-glass-active ring-1 ring-sky-400/40' : 'opacity-95'
      }`}
    >
      {/* Liquid Glass Window Titlebar (Windows-Style Controls on the RIGHT) */}
      <div
        onMouseDown={handleMouseDownHeader}
        onDoubleClick={() => maximizeWindow(window.id)}
        className={`flex items-center justify-between pl-3 pr-0 py-0 select-none cursor-move border-b border-white/10 h-8 ${
          isFocused
            ? 'bg-gradient-to-r from-slate-900/95 via-slate-850/90 to-slate-900/95 text-slate-100'
            : 'bg-slate-950/85 text-slate-400'
        }`}
      >
        {/* Left: App Icon + Window Title */}
        <div className="flex items-center space-x-2 truncate py-1">
          {getWindowMiniIcon()}
          <span className="font-semibold text-xs tracking-wide text-slate-100 truncate">
            {window.title}
          </span>
          <span className="text-[10px] text-sky-400/80 font-mono hidden sm:inline px-1.5 py-0.2 rounded bg-sky-950/50 border border-sky-500/20">
            {appMeta?.title || 'IBP App'}
          </span>
        </div>

        {/* Right: Windows-Style Minimize, Maximize & Close Controls */}
        <div className="flex items-stretch h-full" onMouseDown={(e) => e.stopPropagation()}>
          {/* Minimize Button */}
          <button
            onClick={() => minimizeWindow(window.id)}
            className="w-11 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize"
          >
            <Minus size={13} strokeWidth={2} />
          </button>

          {/* Maximize / Restore Button */}
          <button
            onClick={() => maximizeWindow(window.id)}
            className="w-11 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
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
            onClick={() => closeWindow(window.id)}
            className="w-11 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#E81123] transition-colors"
            title="Close"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* App Body */}
      <div className="flex-1 overflow-hidden relative bg-[#0B1120]/95">
        <ErrorBoundary fallbackTitle={`Error in ${window.title}`}>
          {renderAppContent()}
        </ErrorBoundary>
      </div>
    </div>
  );
};
