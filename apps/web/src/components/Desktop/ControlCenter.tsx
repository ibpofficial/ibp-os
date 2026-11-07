import React, { useState } from 'react';
import {
  Wifi,
  Radio,
  Sun,
  SunMedium,
  Volume2,
  VolumeX,
  Moon,
  Maximize2,
  Minimize2,
  Palette,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  HardDrive,
  Cpu,
  Clock,
  Layers,
  X,
} from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';
import { downloadOfflineBundle } from '../../utils/offlineDownloader';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWallpaperModal: () => void;
  brightness: number;
  onBrightnessChange: (val: number) => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  isOpen,
  onClose,
  onOpenWallpaperModal,
  brightness,
  onBrightnessChange,
}) => {
  const { theme, toggleTheme, setBooted, windows } = useDesktopStore();

  const [soundVolume, setSoundVolume] = useState<number>(() => {
    try {
      const v = localStorage.getItem('ibp_sound_volume');
      return v ? parseFloat(v) : 0.8;
    } catch {
      return 0.8;
    }
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  if (!isOpen) return null;

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadOfflineBundle();
    } catch (e) {
      alert('Error bundling offline package: ' + String(e));
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setSoundVolume(newVol);
    if (newVol === 0) setIsMuted(true);
    else setIsMuted(false);
    try {
      localStorage.setItem('ibp_sound_volume', newVol.toString());
    } catch {}
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-20 right-6 w-84 sm:w-92 liquid-glass rounded-3xl shadow-2xl p-4 select-none z-50 text-slate-100 font-sans backdrop-blur-3xl border border-white/20 animate-in fade-in slide-in-from-bottom-5 zoom-in-95 duration-200 space-y-3.5"
      style={{
        boxShadow: '0 25px 60px -10px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-[10px] shadow-sm">
            🪐
          </div>
          <span className="font-bold text-xs tracking-tight text-slate-100">
            Control Center
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/10 transition"
          title="Close Controls"
        >
          <X size={14} />
        </button>
      </div>

      {/* Top 2 Big Cards: Network & Offline */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Network Status Card */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col justify-between h-22 hover:bg-slate-900/80 transition">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${isOnline ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30' : 'bg-amber-500/20 text-amber-400 border border-amber-400/30'}`}>
              <Wifi size={16} />
            </div>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </div>
          <div>
            <div className="font-semibold text-xs tracking-tight text-slate-100">Wi-Fi Network</div>
            <div className="text-[10px] text-slate-400 font-mono">
              {isOnline ? 'Connected (Local)' : 'Offline Island'}
            </div>
          </div>
        </div>

        {/* Offline Package Downloader Card */}
        <div
          onClick={handleDownload}
          className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 flex flex-col justify-between h-22 cursor-pointer hover:border-emerald-400/60 transition group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 group-hover:scale-105 transition-transform">
              <Download size={16} />
            </div>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 uppercase">
              ZIP
            </span>
          </div>
          <div>
            <div className="font-semibold text-xs tracking-tight text-emerald-200 group-hover:text-emerald-100">
              {isDownloading ? 'Bundling...' : 'Download OS'}
            </div>
            <div className="text-[10px] text-slate-300">Run 100% offline</div>
          </div>
        </div>
      </div>

      {/* Sliders: Display Brightness & Sound Volume */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
        {/* Display Brightness */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] text-slate-300 font-medium">
            <span className="flex items-center space-x-1.5">
              <SunMedium size={13} className="text-amber-400" />
              <span>Display Brightness</span>
            </span>
            <span className="text-slate-400 font-mono text-[10px]">{Math.round(brightness * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={brightness}
            onChange={(e) => onBrightnessChange(parseFloat(e.target.value))}
            className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Audio Volume */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-[11px] text-slate-300 font-medium">
            <span className="flex items-center space-x-1.5">
              {isMuted || soundVolume === 0 ? (
                <VolumeX size={13} className="text-rose-400" />
              ) : (
                <Volume2 size={13} className="text-emerald-400" />
              )}
              <span>System Sound</span>
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {isMuted ? 'Muted' : `${Math.round(soundVolume * 100)}%`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : soundVolume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Quick Action Toggles */}
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 transition group"
        >
          {theme === 'dark' ? (
            <Moon size={16} className="text-sky-400 mb-1 group-hover:scale-110 transition-transform" />
          ) : (
            <Sun size={16} className="text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[10px] text-slate-300 capitalize">{theme}</span>
        </button>

        {/* Wallpaper Picker */}
        <button
          onClick={() => {
            onOpenWallpaperModal();
            onClose();
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 transition group"
        >
          <Palette size={16} className="text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] text-slate-300">Wallpaper</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={handleToggleFullscreen}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 transition group"
        >
          {isFullscreen ? (
            <Minimize2 size={16} className="text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
          ) : (
            <Maximize2 size={16} className="text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[10px] text-slate-300">{isFullscreen ? 'Windowed' : 'Fullscreen'}</span>
        </button>
      </div>

      {/* System Telemetry Bar */}
      <div className="px-3 py-2 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center space-x-1.5 text-emerald-400">
          <Cpu size={11} />
          <span>VM Kernel 0.1.0</span>
        </span>
        <span className="text-sky-400">{windows.length} apps active</span>
      </div>
    </div>
  );
};
