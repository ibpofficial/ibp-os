import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Sun,
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
  Cpu,
  Monitor,
  X,
  Check,
  Power,
  SunMedium,
} from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';
import { downloadOfflineBundle } from '../../utils/offlineDownloader';
import { IBPOSLogoIcon } from '../Icons/OSIcons';

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
  const { theme, toggleTheme, windows } = useDesktopStore();
  const isLight = theme === 'light';

  const [soundVolume, setSoundVolume] = useState<number>(() => {
    try {
      const v = localStorage.getItem('ibp_sound_volume');
      return v ? parseFloat(v) : 0.85;
    } catch {
      return 0.85;
    }
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const brightnessBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  // Close on Escape key or outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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
    const clamped = Math.max(0, Math.min(1, newVol));
    setSoundVolume(clamped);
    setIsMuted(clamped === 0);
    try {
      localStorage.setItem('ibp_sound_volume', clamped.toString());
    } catch {}
  };

  const handleBrightnessSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!brightnessBarRef.current) return;
    const rect = brightnessBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0.15, Math.min(1, (e.clientX - rect.left) / rect.width));
    onBrightnessChange(parseFloat(ratio.toFixed(2)));
  };

  const handleVolumeSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    handleVolumeChange(parseFloat(ratio.toFixed(2)));
  };

  const effectiveVolume = isMuted ? 0 : soundVolume;

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      className={`fixed w-80 rounded-3xl select-none z-50 font-sans backdrop-blur-3xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-150 ${
        isLight
          ? 'bg-white/85 text-slate-900 border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5'
          : 'liquid-glass text-white border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
      }`}
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
      }}
    >
      {/* 1. Header with Refined Insignia */}
      <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
        <div className="flex items-center space-x-2.5">
          <IBPOSLogoIcon size={24} />
          <div>
            <h4 className={`text-xs font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Control Center
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">System Preferences</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-xl transition ${
            isLight
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
          title="Close (Esc)"
        >
          <X size={14} />
        </button>
      </div>

      {/* 2. Top System Cards (Clean Monochrome) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Wi-Fi Card */}
        <div
          className={`p-3 rounded-2xl border transition flex flex-col justify-between h-20 ${
            isLight
              ? 'bg-slate-100/70 border-slate-200/80'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl border ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-white/10 text-white border-white/15'}`}>
              <Wifi size={14} />
            </div>
            <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-slate-800' : 'bg-white shadow-[0_0_6px_#ffffff]'}`} />
          </div>
          <div>
            <div className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Wi-Fi</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">Local Machine</div>
          </div>
        </div>

        {/* Offline ZIP Downloader */}
        <div
          onClick={handleDownload}
          className={`p-3 rounded-2xl border transition flex flex-col justify-between h-20 cursor-pointer ${
            isLight
              ? 'bg-slate-100/70 border-slate-200/80 hover:bg-slate-200/60'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl border ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-white/10 text-white border-white/15'}`}>
              <Download size={14} />
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
              isLight ? 'bg-white text-slate-700 border-slate-300' : 'bg-white/10 text-slate-300 border-white/15'
            }`}>
              ZIP
            </span>
          </div>
          <div>
            <div className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isDownloading ? 'Bundling...' : 'Download OS'}
            </div>
            <div className="text-[10px] text-slate-400">Run Offline</div>
          </div>
        </div>
      </div>

      {/* 3. Liquid Glass Capsule Sliders: Brightness & Audio */}
      <div
        className={`p-3 rounded-2xl border space-y-2.5 ${
          isLight ? 'bg-slate-100/70 border-slate-200/80' : 'bg-white/5 border-white/10'
        }`}
      >
        {/* Brightness Capsule Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>Display Brightness</span>
            <span className="font-mono text-slate-400">{Math.round(brightness * 100)}%</span>
          </div>

          <div
            ref={brightnessBarRef}
            onClick={handleBrightnessSliderClick}
            className={`relative h-9 rounded-2xl border overflow-hidden cursor-pointer select-none transition-all ${
              isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-950/80 border-white/10'
            }`}
          >
            {/* Filled Progress */}
            <div
              style={{ width: `${Math.round(brightness * 100)}%` }}
              className={`absolute left-0 top-0 bottom-0 rounded-xl transition-all duration-75 flex items-center shadow-md ${
                isLight ? 'bg-slate-800 text-white' : 'bg-white text-slate-950'
              }`}
            />
            {/* Icon & Label Inside Slider */}
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <SunMedium size={15} className={brightness > 0.4 ? (isLight ? 'text-white' : 'text-slate-950') : 'text-slate-400'} />
              <span className={`text-[10px] font-mono font-bold ${brightness > 0.65 ? (isLight ? 'text-white' : 'text-slate-950') : 'text-slate-400'}`}>
                {Math.round(brightness * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Volume Capsule Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>Audio Output</span>
            <span className="font-mono text-slate-400">{Math.round(effectiveVolume * 100)}%</span>
          </div>

          <div
            ref={volumeBarRef}
            onClick={handleVolumeSliderClick}
            className={`relative h-9 rounded-2xl border overflow-hidden cursor-pointer select-none transition-all ${
              isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-950/80 border-white/10'
            }`}
          >
            {/* Filled Progress */}
            <div
              style={{ width: `${Math.round(effectiveVolume * 100)}%` }}
              className={`absolute left-0 top-0 bottom-0 rounded-xl transition-all duration-75 flex items-center shadow-md ${
                isLight ? 'bg-slate-800 text-white' : 'bg-white text-slate-950'
              }`}
            />
            {/* Icon & Label Inside Slider */}
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              {isMuted || effectiveVolume === 0 ? (
                <VolumeX size={15} className="text-slate-400" />
              ) : (
                <Volume2 size={15} className={effectiveVolume > 0.4 ? (isLight ? 'text-white' : 'text-slate-950') : 'text-slate-400'} />
              )}
              <span className={`text-[10px] font-mono font-bold ${effectiveVolume > 0.65 ? (isLight ? 'text-white' : 'text-slate-950') : 'text-slate-400'}`}>
                {Math.round(effectiveVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Action Buttons (Monochrome Glass Grid) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-2xl border flex items-center space-x-2 transition text-left ${
            isLight
              ? 'bg-slate-100/70 hover:bg-slate-200/70 border-slate-200 text-slate-800'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
          }`}
        >
          {isLight ? <Moon size={15} className="shrink-0" /> : <Sun size={15} className="shrink-0" />}
          <div className="truncate">
            <span className="font-bold block truncate">{isLight ? 'Dark Mode' : 'Light Mode'}</span>
            <span className="text-[10px] text-slate-400 block truncate">Theme</span>
          </div>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={handleToggleFullscreen}
          className={`p-2.5 rounded-2xl border flex items-center space-x-2 transition text-left ${
            isLight
              ? 'bg-slate-100/70 hover:bg-slate-200/70 border-slate-200 text-slate-800'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
          }`}
        >
          {isFullscreen ? <Minimize2 size={15} className="shrink-0" /> : <Maximize2 size={15} className="shrink-0" />}
          <div className="truncate">
            <span className="font-bold block truncate">{isFullscreen ? 'Windowed' : 'Fullscreen'}</span>
            <span className="text-[10px] text-slate-400 block truncate">F11 Mode</span>
          </div>
        </button>

        {/* Wallpaper Customizer */}
        <button
          onClick={() => {
            onClose();
            onOpenWallpaperModal();
          }}
          className={`p-2.5 rounded-2xl border flex items-center space-x-2 transition text-left ${
            isLight
              ? 'bg-slate-100/70 hover:bg-slate-200/70 border-slate-200 text-slate-800'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
          }`}
        >
          <Palette size={15} className="shrink-0" />
          <div className="truncate">
            <span className="font-bold block truncate">Wallpaper</span>
            <span className="text-[10px] text-slate-400 block truncate">Customizer</span>
          </div>
        </button>

        {/* Refresh Workspace */}
        <button
          onClick={() => window.location.reload()}
          className={`p-2.5 rounded-2xl border flex items-center space-x-2 transition text-left ${
            isLight
              ? 'bg-slate-100/70 hover:bg-slate-200/70 border-slate-200 text-slate-800'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
          }`}
        >
          <RotateCcw size={15} className="shrink-0" />
          <div className="truncate">
            <span className="font-bold block truncate">Restart OS</span>
            <span className="text-[10px] text-slate-400 block truncate">Refresh</span>
          </div>
        </button>
      </div>

      {/* 5. Minimalist Footer */}
      <div className={`pt-2 border-t flex items-center justify-between text-[10px] ${isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-slate-400'}`}>
        <span className="font-mono">IBP OS v0.1.0 • Liquid Glass</span>
        <span>{windows.length} window{windows.length !== 1 ? 's' : ''} active</span>
      </div>
    </div>
  );
};
