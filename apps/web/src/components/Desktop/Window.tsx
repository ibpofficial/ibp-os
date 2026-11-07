import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { WindowState } from '../../types/desktop';
import { useDesktopStore } from '../../stores/desktopStore';
import { StudioApp } from '../../apps/Studio';
import { TerminalApp } from '../../apps/Terminal';
import { ExplorerApp } from '../../apps/Explorer';
import { MonitorApp } from '../../apps/Monitor';
import { HandbookApp } from '../../apps/Handbook';
import { PlaygroundApp } from '../../apps/Playground';
import { SettingsApp } from '../../apps/Settings';

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
        height: 'calc(100vh - 44px)',
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

  return (
    <div
      style={style}
      onMouseDown={() => focusWindow(window.id)}
      className={`flex flex-col bg-[#0B1120] rounded-lg shadow-2xl overflow-hidden border transition-shadow duration-150 ${
        isFocused ? 'border-sky-500/50 shadow-sky-950/40 ring-1 ring-sky-500/20' : 'border-slate-800/80 shadow-black/60'
      }`}
    >
      {/* Window Header */}
      <div
        onMouseDown={handleMouseDownHeader}
        onDoubleClick={() => maximizeWindow(window.id)}
        className={`flex items-center justify-between px-3 py-2 select-none cursor-move border-b ${
          isFocused ? 'bg-[#131D31] border-slate-700/60 text-slate-100' : 'bg-[#0E1526] border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex items-center space-x-2 truncate">
          <span className="font-semibold text-xs truncate">{window.title}</span>
        </div>

        {/* Window action buttons */}
        <div className="flex items-center space-x-1.5" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => minimizeWindow(window.id)}
            className="p-1 hover:bg-slate-700/60 rounded text-slate-400 hover:text-slate-200 transition"
            title="Minimize"
          >
            <Minus size={12} />
          </button>
          <button
            onClick={() => maximizeWindow(window.id)}
            className="p-1 hover:bg-slate-700/60 rounded text-slate-400 hover:text-slate-200 transition"
            title={window.isMaximized ? 'Restore' : 'Maximize'}
          >
            {window.isMaximized ? <Copy size={11} /> : <Square size={11} />}
          </button>
          <button
            onClick={() => closeWindow(window.id)}
            className="p-1 hover:bg-rose-600 hover:text-white rounded text-slate-400 transition"
            title="Close"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* App Body */}
      <div className="flex-1 overflow-hidden relative">{renderAppContent()}</div>
    </div>
  );
};
