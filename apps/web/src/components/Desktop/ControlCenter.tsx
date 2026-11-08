import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
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
  Cpu,
  Monitor,
  X,
  Check,
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const containerRef = useRef<HTMLDivElement>(null);
  const brightnessBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  // Interactive Drag / Click for macOS Capsule Sliders
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
      className={`fixed w-80 max-h-[calc(100vh-100px)] overflow-y-auto rounded-3xl shadow-2xl p-4 select-none z-50 font-sans backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-150 space-y-3 ${
        isLight
          ? 'bg-white/95 text-slate-800 border border-slate-300/80 shadow-2xl ring-1 ring-black/5'
          : 'liquid-glass text-slate-100 border border-white/20'
      }`}
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        boxShadow: isLight
          ? '0 25px 50px -12px rgba(100, 116, 139, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.8)'
          : '0 25px 60px -10px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.15)',
      }}
    >
      {/* 1. Header (macOS Control Center Pill) */}
      <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-xs shadow-md shadow-sky-500/30">
            🪐
          </div>
          <div>
            <h4 className={`text-xs font-bold leading-tight ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
              Control Center
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">System Controls</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-xl transition ${
            isLight
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              : 'text-slate-400 hover:text-slate-100 hover:bg-white/10'
          }`}
          title="Close (Esc)"
        >
          <X size={14} />
        </button>
      </div>

      {/* 2. Top Connected Cards: Wi-Fi & Offline Downloader */}
      <div className="grid grid-cols-2 gap-2">
        {/* Wi-Fi Card */}
        <div
          className={`p-3 rounded-2xl border transition flex flex-col justify-between h-20 ${
            isLight
              ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              : 'bg-slate-900/60 border-white/10 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
              <Wifi size={15} />
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399] animate-pulse" />
          </div>
          <div>
            <div className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
              Wi-Fi
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">Local Machine</div>
          </div>
        </div>

        {/* Offline Package Downloader */}
        <div
          onClick={handleDownload}
          className={`p-3 rounded-2xl border transition flex flex-col justify-between h-20 cursor-pointer group ${
            isLight
              ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/80'
              : 'bg-emerald-950/40 border-emerald-500/30 hover:border-emerald-400/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 group-hover:scale-105 transition-transform">
              <Download size={15} />
            </div>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">
              ZIP
            </span>
          </div>
          <div>
            <div className={`text-xs font-semibold ${isLight ? 'text-emerald-900' : 'text-emerald-200'}`}>
              {isDownloading ? 'Bundling...' : 'Download OS'}
            </div>
            <div className="text-[10px] text-emerald-500/80">100% Offline</div>
          </div>
        </div>
      </div>

      {/* 3. macOS Capsule Sliders: Display Brightness & Audio */}
      <div
        className={`p-3 rounded-2xl border space-y-2.5 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-white/10'
        }`}
      >
        {/* Display Brightness Capsule Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>Display</span>
            <span className="font-mono text-[10px]">{Math.round(brightness * 100)}%</span>
          </div>

          <div
            ref={brightnessBarRef}
            onClick={handleBrightnessSliderClick}
            className="relative h-8 rounded-xl bg-slate-800/80 border border-white/10 overflow-hidden cursor-pointer select-none group"
          >
            {/* Filled Bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-400 to-amber-300 rounded-xl transition-all duration-75 flex items-center shadow-md shadow-amber-500/20"
              style={{ width: `${Math.round(brightness * 100)}%` }}
            />
            {/* Slider Icon & Label */}
            <div className="relative z-10 flex items-center justify-between h-full px-2.5 pointer-events-none">
              <div className="flex items-center space-x-1.5">
                <SunMedium size={14} className="text-slate-900" />
                <span className="text-[11px] font-semibold text-slate-900">Brightness</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Volume Capsule Slider */}
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>Sound</span>
            <span className="font-mono text-[10px]">
              {isMuted ? 'Muted' : `${Math.round(soundVolume * 100)}%`}
            </span>
          </div>

          <div
            ref={volumeBarRef}
            onClick={handleVolumeSliderClick}
            className="relative h-8 rounded-xl bg-slate-800/80 border border-white/10 overflow-hidden cursor-pointer select-none group"
          >
            {/* Filled Bar */}
            <div
              className={`absolute left-0 top-0 bottom-0 rounded-xl transition-all duration-75 flex items-center shadow-md ${
                isMuted || effectiveVolume === 0
                  ? 'bg-slate-600'
                  : 'bg-gradient-to-r from-sky-400 to-cyan-300 shadow-sky-500/20'
              }`}
              style={{ width: `${Math.round(effectiveVolume * 100)}%` }}
            />
            {/* Slider Icon & Label */}
            <div className="relative z-10 flex items-center justify-between h-full px-2.5 pointer-events-none">
              <div className="flex items-center space-x-1.5">
                {isMuted || effectiveVolume === 0 ? (
                  <VolumeX size={14} className="text-white" />
                ) : (
                  <Volume2 size={14} className="text-slate-900" />
                )}
                <span
                  className={`text-[11px] font-semibold ${
                    isMuted || effectiveVolume === 0 ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Volume
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Toggles Matrix (Theme, Wallpaper, Fullscreen) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition cursor-pointer group ${
            isLight
              ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              : 'bg-slate-900/60 border-white/10 hover:bg-slate-800/80'
          }`}
        >
          {theme === 'dark' ? (
            <Moon size={16} className="text-sky-400 mb-1 group-hover:scale-110 transition-transform" />
          ) : (
            <Sun size={16} className="text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
          )}
          <span className={`text-[10px] font-medium capitalize ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            {theme}
          </span>
        </button>

        {/* Wallpaper Picker Button */}
        <button
          onClick={() => {
            onOpenWallpaperModal();
            onClose();
          }}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition cursor-pointer group ${
            isLight
              ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              : 'bg-slate-900/60 border-white/10 hover:bg-slate-800/80'
          }`}
        >
          <Palette size={16} className="text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
          <span className={`text-[10px] font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Wallpaper
          </span>
        </button>

        {/* Fullscreen Toggle Button */}
        <button
          onClick={handleToggleFullscreen}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition cursor-pointer group ${
            isLight
              ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              : 'bg-slate-900/60 border-white/10 hover:bg-slate-800/80'
          }`}
        >
          {isFullscreen ? (
            <Minimize2 size={16} className="text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
          ) : (
            <Maximize2 size={16} className="text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
          )}
          <span className={`text-[10px] font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            {isFullscreen ? 'Windowed' : 'Fullscreen'}
          </span>
        </button>
      </div>

      {/* 5. System Spec Telemetry Pill */}
      <div
        className={`px-3 py-2 rounded-2xl border flex items-center justify-between text-[10px] font-mono ${
          isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-950/70 border-white/10 text-slate-400'
        }`}
      >
        <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
          <Cpu size={12} />
          <span>IBP Kernel 0.1.0</span>
        </span>
        <span className="text-sky-400 font-medium">{windows.length} apps active</span>
      </div>
    </div>
  );
};
