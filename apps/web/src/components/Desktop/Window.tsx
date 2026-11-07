import React, { useState, useRef, useEffect } from 'react';
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
  const [isHoveringControls, setIsHoveringControls] = useState(false);

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
        height: 'calc(100vh - 60px)',
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
      className={`flex flex-col liquid-glass-window rounded-2xl overflow-hidden transition-all duration-200 ${
        isFocused ? 'liquid-glass-active ring-1 ring-sky-400/40' : 'opacity-95'
      }`}
    >
      {/* Liquid Glass Window Header (macOS Traffic Lights + Centered Title) */}
      <div
        onMouseDown={handleMouseDownHeader}
        onDoubleClick={() => maximizeWindow(window.id)}
        className={`flex items-center justify-between px-3.5 py-2.5 select-none cursor-move border-b border-white/10 ${
          isFocused
            ? 'bg-gradient-to-r from-slate-900/90 via-slate-850/80 to-slate-900/90 text-slate-100'
            : 'bg-slate-950/80 text-slate-400'
        }`}
      >
        {/* Left: macOS Traffic Lights with subtle hover icons */}
        <div
          className="flex items-center space-x-2"
          onMouseEnter={() => setIsHoveringControls(true)}
          onMouseLeave={() => setIsHoveringControls(false)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => closeWindow(window.id)}
            className="mac-btn-close group"
            title="Close"
          >
            {isHoveringControls && <X size={8} className="text-black/80 font-bold" />}
          </button>
          <button
            onClick={() => minimizeWindow(window.id)}
            className="mac-btn-min group"
            title="Minimize"
          >
            {isHoveringControls && <Minus size={8} className="text-black/80 font-bold" />}
          </button>
          <button
            onClick={() => maximizeWindow(window.id)}
            className="mac-btn-max group"
            title={window.isMaximized ? 'Restore' : 'Maximize'}
          >
            {isHoveringControls && (
              window.isMaximized ? (
                <Copy size={7} className="text-black/80" />
              ) : (
                <Square size={7} className="text-black/80" />
              )
            )}
          </button>
        </div>

        {/* Center: Title with App Name */}
        <div className="flex items-center space-x-2 truncate">
          <span className="font-semibold text-xs tracking-wide text-slate-100 truncate">
            {window.title}
          </span>
          <span className="text-[10px] text-sky-400/80 font-mono hidden sm:inline px-1.5 py-0.2 rounded bg-sky-950/40 border border-sky-500/20">
            {appMeta?.title || 'IBP App'}
          </span>
        </div>

        {/* Right: Spacer for symmetric balance */}
        <div className="w-14" />
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
