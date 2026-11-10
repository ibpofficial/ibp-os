import React from 'react';
import { TerminalView } from '../../components/Terminal/TerminalView';
import { useDesktopStore } from '../../stores/desktopStore';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalAppProps {
  initialCommand?: string;
  initialCwd?: string;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  initialCommand,
  initialCwd = 'IBP://USERS/guest/projects',
}) => {
  const { theme } = useDesktopStore();
  const isLight = theme === 'light';

  return (
    <div
      className={`h-full flex flex-col font-mono text-xs overflow-hidden select-text ${
        isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#0B1120] text-slate-100'
      }`}
    >
      {/* Terminal Title Bar / Tabs Header */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b select-none ${
          isLight ? 'bg-slate-200/90 border-slate-300' : 'bg-[#111827] border-slate-800'
        }`}
      >
        <div className="flex items-center space-x-2">
          <TerminalIcon size={14} className="text-sky-400" />
          <span className="font-semibold text-xs tracking-wide">IBP Terminal & Shell</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span>Tab: complete</span>
          <span>•</span>
          <span>Ctrl+C: stop</span>
          <span>•</span>
          <span>Ctrl+L: clear</span>
        </div>
      </div>

      {/* Main Terminal View */}
      <div className="flex-1 overflow-hidden">
        <TerminalView initialCwd={initialCwd} initialCommand={initialCommand} />
      </div>
    </div>
  );
};
