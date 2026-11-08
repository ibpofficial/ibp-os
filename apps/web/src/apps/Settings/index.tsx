import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, RotateCcw, Compass, Database, Palette, Image as ImageIcon, Check, Download } from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';
import { defaultVFS } from '@ibp/vfs';
import { useVFSStore } from '../../stores/vfsStore';
import { WALLPAPER_PRESETS, WallpaperPresetKey } from '../../components/Desktop/Desktop';
import { downloadOfflineBundle } from '../../utils/offlineDownloader';

export const SettingsApp: React.FC = () => {
  const { theme, toggleTheme, setOnboardingStep } = useDesktopStore();
  const isLight = theme === 'light';
  const { refreshFiles } = useVFSStore();

  const [currentPreset, setCurrentPreset] = useState<string>(() => {
    try {
      return localStorage.getItem('ibp_wallpaper_preset') || (theme === 'light' ? 'liquid-light' : 'deep-space');
    } catch {
      return 'deep-space';
    }
  });

  const handleSelectWallpaperPreset = (key: WallpaperPresetKey) => {
    setCurrentPreset(key);
    try {
      localStorage.setItem('ibp_wallpaper_type', 'preset');
      localStorage.setItem('ibp_wallpaper_preset', key);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('ibp_wallpaper_changed'));
    } catch {
      // ignore
    }
  };

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
    <div className={`flex flex-col h-full w-full p-6 md:p-8 font-sans text-xs overflow-y-auto ${
      isLight ? 'bg-[#F8FAFC] text-slate-800' : 'bg-[#0B1120] text-slate-100'
    }`}>
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h2 className={`text-base font-bold flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            <SettingsIcon size={18} className="text-sky-500" />
            <span>System Settings</span>
          </h2>
          <p className={`${isLight ? 'text-slate-500' : 'text-slate-400'} text-xs mt-1`}>
            Configure your IBP OS appearance, custom wallpapers, and workspace environment.
          </p>
        </div>

      {/* Theme Settings */}
      <div className={`p-4 border rounded-2xl space-y-3 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'}`}>
        <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>Theme & Appearance</div>
        <div className="flex items-center justify-between">
          <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Desktop Theme Mode</span>
          <button
            onClick={toggleTheme}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {theme === 'dark' ? <Moon size={14} className="text-sky-400" /> : <Sun size={14} className="text-amber-500" />}
            <span className="capitalize">{theme} Theme</span>
          </button>
        </div>
      </div>

      {/* Wallpaper Themes */}
      <div className={`p-4 border rounded-2xl space-y-3 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'}`}>
        <div className="flex items-center justify-between">
          <span className={`font-semibold flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
            <Palette size={15} className="text-purple-500" />
            <span>Desktop Wallpaper</span>
          </span>
          <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Also customizable via right-click desktop</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
          {Object.entries(WALLPAPER_PRESETS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => handleSelectWallpaperPreset(key as WallpaperPresetKey)}
              className={`p-2.5 rounded-xl border transition text-center relative group ${
                currentPreset === key
                  ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/40'
                  : isLight
                  ? 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div
                className="w-full h-9 rounded-lg mb-1.5 border border-slate-400/20 shadow-inner"
                style={{ background: item.bg }}
              />
              <span className={`text-[10px] font-medium block truncate ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{item.name}</span>
              {currentPreset === key && (
                <span className="absolute top-1.5 right-1.5 p-0.5 bg-purple-500 text-white rounded-full">
                  <Check size={8} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Offline Download Section */}
      <div className="p-4 bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-emerald-300 font-semibold flex items-center space-x-1.5">
              <Download size={15} />
              <span>Standalone Offline OS Package</span>
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              Download complete standalone distribution (ZIP) with double-click desktop launchers
            </div>
          </div>
          <button
            onClick={() => downloadOfflineBundle()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow transition"
          >
            <Download size={14} />
            <span>Download ZIP</span>
          </button>
        </div>
      </div>

      {/* Workspace & Storage */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
        <div className="font-semibold text-slate-200">Virtual Filesystem & Data</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-300 font-medium">Reset Virtual Storage</div>
            <div className="text-slate-500 text-[11px]">Wipes modified files and re-seeds starter projects</div>
          </div>
          <button
            onClick={handleResetVFS}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg border border-rose-500/30 transition"
          >
            <RotateCcw size={14} />
            <span>Reset VFS</span>
          </button>
        </div>
      </div>

      {/* Guided Tour */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
        <div className="font-semibold text-slate-200">Onboarding & Guided Walkthrough</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-300 font-medium">Replay Guided Tour</div>
            <div className="text-slate-500 text-[11px]">Take the 60-second interactive tour of IBP OS</div>
          </div>
          <button
            onClick={handleStartTour}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium shadow transition"
          >
            <Compass size={14} />
            <span>Start Tour</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
