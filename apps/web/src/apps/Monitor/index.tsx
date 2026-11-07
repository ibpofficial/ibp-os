import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DEFAULT_LIMITS } from '@ibp/engine';
import { useDesktopStore } from '../../stores/desktopStore';

export const MonitorApp: React.FC = () => {
  const { windows } = useDesktopStore();
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTicks((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0B1120] text-slate-100 p-4 font-sans text-xs space-y-4 overflow-y-auto">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center space-x-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-md">
            <Cpu size={20} />
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">INSTRUCTION CAP</div>
            <div className="text-sm font-semibold text-slate-100 font-mono">
              {DEFAULT_LIMITS.maxInstructions.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-md">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">ACTIVE WINDOWS</div>
            <div className="text-sm font-semibold text-slate-100 font-mono">
              {windows.length}
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-md">
            <HardDrive size={20} />
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">VIRTUAL VFS</div>
            <div className="text-sm font-semibold text-slate-100 font-mono">IndexedDB Ready</div>
          </div>
        </div>
      </div>

      {/* Safety & Limits Configuration */}
      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
        <div className="flex items-center space-x-2 text-slate-200 font-semibold mb-3">
          <ShieldAlert size={15} className="text-amber-400" />
          <span>Execution Limits & Sandbox Safeguards</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono">
          <div className="p-2 bg-slate-950/40 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">RECURSION DEPTH</span>
            <span className="text-sky-300 font-bold">{DEFAULT_LIMITS.maxRecursionDepth} calls</span>
          </div>
          <div className="p-2 bg-slate-950/40 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">LOOP ITERATIONS</span>
            <span className="text-sky-300 font-bold">{DEFAULT_LIMITS.maxLoopIterations.toLocaleString()}</span>
          </div>
          <div className="p-2 bg-slate-950/40 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">MAX OUTPUT</span>
            <span className="text-sky-300 font-bold">{(DEFAULT_LIMITS.maxOutputLength / 1000)}k chars</span>
          </div>
          <div className="p-2 bg-slate-950/40 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">TIMEOUT</span>
            <span className="text-sky-300 font-bold">{DEFAULT_LIMITS.timeoutMs / 1000}s</span>
          </div>
        </div>
      </div>

      {/* Active System Processes Table */}
      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex-1">
        <div className="text-slate-200 font-semibold mb-2">Active OS Processes</div>
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800">
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>IBP Virtual Machine Kernel</span>
            </div>
            <span className="text-emerald-400 text-[10px]">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800">
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>IndexedDB VFS Syncer</span>
            </div>
            <span className="text-emerald-400 text-[10px]">ONLINE</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded border border-slate-800">
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Monaco Language Service (IBP Monarch)</span>
            </div>
            <span className="text-emerald-400 text-[10px]">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
