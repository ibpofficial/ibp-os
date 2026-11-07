import React from 'react';
import { Settings as SettingsIcon, Moon, Sun, RotateCcw, Compass, Database } from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';
import { defaultVFS } from '@ibp/vfs';
import { useVFSStore } from '../../stores/vfsStore';

export const SettingsApp: React.FC = () => {
  const { theme, toggleTheme, setOnboardingStep } = useDesktopStore();
  const { refreshFiles } = useVFSStore();

  const handleResetVFS = async () => {
    if (confirm('Are you sure you want to reset your virtual workspace? This will restore starter files.')) {
      const all = await defaultVFS.getAllFiles();
      for (const f of all) {
        await defaultVFS.deleteFile(f.path);
      }
      await defaultVFS.init(true);
      await refreshFiles();
      alert('Virtual Filesystem reset to initial state!');
    }
  };

  const handleStartTour = () => {
    setOnboardingStep(1);
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1120] text-slate-100 p-6 font-sans text-xs space-y-6 max-w-2xl overflow-y-auto">
      <div>
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <SettingsIcon size={18} className="text-sky-400" />
          <span>System Settings</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">Configure your IBP OS appearance and workspace environment.</p>
      </div>

      {/* Theme Settings */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
        <div className="font-semibold text-slate-200">Theme & Appearance</div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Desktop Theme Mode</span>
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 border border-slate-700"
          >
            {theme === 'dark' ? <Moon size={14} className="text-sky-400" /> : <Sun size={14} className="text-amber-400" />}
            <span className="capitalize">{theme} Theme</span>
          </button>
        </div>
      </div>

      {/* Workspace & Storage */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
        <div className="font-semibold text-slate-200">Virtual Filesystem & Data</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-300 font-medium">Reset Virtual Storage</div>
            <div className="text-slate-500 text-[11px]">Wipes modified files and re-seeds starter projects</div>
          </div>
          <button
            onClick={handleResetVFS}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded border border-rose-500/30"
          >
            <RotateCcw size={14} />
            <span>Reset VFS</span>
          </button>
        </div>
      </div>

      {/* Guided Tour */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
        <div className="font-semibold text-slate-200">Onboarding & Guided Walkthrough</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-300 font-medium">Replay Guided Tour</div>
            <div className="text-slate-500 text-[11px]">Take the 60-second interactive tour of IBP OS</div>
          </div>
          <button
            onClick={handleStartTour}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium shadow"
          >
            <Compass size={14} />
            <span>Start Tour</span>
          </button>
        </div>
      </div>
    </div>
  );
};
