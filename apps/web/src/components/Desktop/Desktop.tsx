import React, { useEffect, useState, useRef } from 'react';
import {
  Code,
  Terminal,
  Folder,
  Activity,
  BookOpen,
  Trophy,
  Settings,
  Sparkles,
  RefreshCw,
  Play,
  Palette,
  ExternalLink,
  Cpu,
  HardDrive,
  Clock,
  Layers,
  ChevronRight,
  Wand2,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Sliders,
  Check,
  X,
  StickyNote,
  Copy,
  Trash2,
  Download,
} from 'lucide-react';
import { useDesktopStore, APP_REGISTRY } from '../../stores/desktopStore';
import { useVFSStore } from '../../stores/vfsStore';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { BootScreen } from './BootScreen';
import { CommandPalette } from './CommandPalette';
import { OnboardingTour } from './OnboardingTour';
import { AppId } from '../../types/desktop';
import { IBP_TIPS } from '@ibp/engine';
import { downloadOfflineBundle } from '../../utils/offlineDownloader';

export type WallpaperPresetKey =
  | 'deep-space'
  | 'cyberpunk'
  | 'aurora'
  | 'sunset'
  | 'emerald'
  | 'cosmic-violet'
  | 'minimal-obsidian';

export interface WallpaperPreset {
  name: string;
  bg: string;
  previewColor: string;
}

export const WALLPAPER_PRESETS: Record<WallpaperPresetKey, WallpaperPreset> = {
  'deep-space': {
    name: 'Deep Space',
    previewColor: '#0F172A',
    bg: `
      radial-gradient(circle at 15% 20%, rgba(37, 99, 235, 0.20) 0%, transparent 45%),
      radial-gradient(circle at 85% 75%, rgba(56, 189, 248, 0.16) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.85) 0%, #0B1120 100%)
    `,
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    previewColor: '#200A2E',
    bg: `
      radial-gradient(circle at 20% 25%, rgba(236, 72, 153, 0.22) 0%, transparent 45%),
      radial-gradient(circle at 80% 75%, rgba(139, 92, 246, 0.25) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(20, 10, 35, 0.85) 0%, #080313 100%)
    `,
  },
  aurora: {
    name: 'Aurora Borealis',
    previewColor: '#062024',
    bg: `
      radial-gradient(circle at 25% 15%, rgba(16, 185, 129, 0.22) 0%, transparent 45%),
      radial-gradient(circle at 75% 80%, rgba(14, 165, 233, 0.20) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(6, 26, 35, 0.85) 0%, #031017 100%)
    `,
  },
  sunset: {
    name: 'Midnight Sunset',
    previewColor: '#260B18',
    bg: `
      radial-gradient(circle at 20% 30%, rgba(245, 158, 11, 0.20) 0%, transparent 45%),
      radial-gradient(circle at 80% 70%, rgba(225, 29, 72, 0.20) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(28, 10, 20, 0.85) 0%, #0C040B 100%)
    `,
  },
  emerald: {
    name: 'Emerald Matrix',
    previewColor: '#051E14',
    bg: `
      radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.25) 0%, transparent 40%),
      radial-gradient(circle at 70% 80%, rgba(5, 150, 105, 0.18) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(6, 28, 18, 0.85) 0%, #030F0A 100%)
    `,
  },
  'cosmic-violet': {
    name: 'Cosmic Violet',
    previewColor: '#170B28',
    bg: `
      radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.25) 0%, transparent 45%),
      radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.20) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(18, 8, 30, 0.85) 0%, #090312 100%)
    `,
  },
  'minimal-obsidian': {
    name: 'Minimal Obsidian',
    previewColor: '#090D16',
    bg: `
      radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.95) 0%, #060911 100%)
    `,
  },
};

const SAMPLE_WALLPAPERS = [
  { name: 'Cosmic Nebula', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Cyber City', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Misty Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Minimal Waves', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80' },
];

export const Desktop: React.FC = () => {
  const { isBooted, windows, openWindow, setStartMenu } = useDesktopStore();
  const { init: initVFS, createFile } = useVFSStore();

  const [time, setTime] = useState(new Date());
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * IBP_TIPS.length));

  // Wallpaper state
  const [wallpaperType, setWallpaperType] = useState<'preset' | 'url' | 'upload'>(() => {
    try {
      return (localStorage.getItem('ibp_wallpaper_type') as any) || 'preset';
    } catch {
      return 'preset';
    }
  });

  const [presetKey, setPresetKey] = useState<WallpaperPresetKey>(() => {
    try {
      const saved = localStorage.getItem('ibp_wallpaper_preset') as WallpaperPresetKey;
      return saved && WALLPAPER_PRESETS[saved] ? saved : 'deep-space';
    } catch {
      return 'deep-space';
    }
  });

  const [customUrl, setCustomUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('ibp_wallpaper_url') || '';
    } catch {
      return '';
    }
  });

  const [customUploadData, setCustomUploadData] = useState<string>(() => {
    try {
      return localStorage.getItem('ibp_wallpaper_upload') || '';
    } catch {
      return '';
    }
  });

  const [brightness, setBrightness] = useState<number>(() => {
    try {
      const b = localStorage.getItem('ibp_wallpaper_brightness');
      return b ? parseFloat(b) : 0.85;
    } catch {
      return 0.85;
    }
  });

  const [blurAmount, setBlurAmount] = useState<number>(() => {
    try {
      const bl = localStorage.getItem('ibp_wallpaper_blur');
      return bl ? parseFloat(bl) : 0;
    } catch {
      return 0;
    }
  });

  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Sticky Notes State
  const [stickyNotes, setStickyNotes] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('ibp_desktop_notes') ||
        '🪐 Welcome to IBP OS!\n• Try Hinglish: "rakho x = 10; bolo x"\n• Open LangCraft to build your own language\n• Right click desktop to change wallpaper'
      );
    } catch {
      return 'Welcome to IBP OS!';
    }
  });
  const [isStickyNotesOpen, setIsStickyNotesOpen] = useState(true);
  const [notesCopied, setNotesCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initVFS();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // When booted, open requested app via URL param or default to Studio
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const initialApp = params.get('app') as AppId | null;
      if (initialApp && APP_REGISTRY[initialApp]) {
        openWindow(initialApp);
        return;
      }
    } catch {
      // ignore
    }
    if (isBooted && windows.length === 0) {
      openWindow('studio');
    }
  }, [isBooted]);

  const desktopShortcuts: { appId: AppId; title: string; icon: React.ReactNode; bg: string; badge?: string }[] = [
    { appId: 'studio', title: 'IBP Studio', icon: <Code size={22} className="text-white drop-shadow" />, bg: 'from-blue-600 via-sky-500 to-cyan-400', badge: 'IDE' },
    { appId: 'langcraft', title: 'LangCraft', icon: <Wand2 size={22} className="text-white drop-shadow" />, bg: 'from-purple-600 via-pink-500 to-rose-400', badge: 'Design Lang' },
    { appId: 'handbook', title: 'Learn IBP', icon: <BookOpen size={22} className="text-white drop-shadow" />, bg: 'from-cyan-600 via-teal-500 to-emerald-400', badge: 'PDF & Guide' },
    { appId: 'playground', title: 'Playground', icon: <Trophy size={22} className="text-white drop-shadow" />, bg: 'from-amber-600 via-orange-500 to-yellow-400', badge: '20 Levels' },
    { appId: 'terminal', title: 'Terminal', icon: <Terminal size={22} className="text-white drop-shadow" />, bg: 'from-emerald-700 via-teal-600 to-cyan-500', badge: 'REPL' },
    { appId: 'explorer', title: 'File Explorer', icon: <Folder size={22} className="text-white drop-shadow" />, bg: 'from-amber-700 via-amber-600 to-orange-500' },
    { appId: 'monitor', title: 'System Monitor', icon: <Activity size={22} className="text-white drop-shadow" />, bg: 'from-indigo-700 via-purple-600 to-pink-500' },
    { appId: 'settings', title: 'Settings', icon: <Settings size={22} className="text-white drop-shadow" />, bg: 'from-slate-700 via-slate-600 to-slate-500' },
  ];

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % IBP_TIPS.length);
  };

  const handleSelectPreset = (key: WallpaperPresetKey) => {
    setWallpaperType('preset');
    setPresetKey(key);
    try {
      localStorage.setItem('ibp_wallpaper_type', 'preset');
      localStorage.setItem('ibp_wallpaper_preset', key);
    } catch {
      // ignore
    }
  };

  const handleApplyCustomUrl = (url: string) => {
    setWallpaperType('url');
    setCustomUrl(url);
    try {
      localStorage.setItem('ibp_wallpaper_type', 'url');
      localStorage.setItem('ibp_wallpaper_url', url);
    } catch {
      // ignore
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Image file is too large (max 8MB). Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setWallpaperType('upload');
        setCustomUploadData(dataUrl);
        try {
          localStorage.setItem('ibp_wallpaper_type', 'upload');
          localStorage.setItem('ibp_wallpaper_upload', dataUrl);
        } catch {
          // ignore
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateBrightness = (val: number) => {
    setBrightness(val);
    try {
      localStorage.setItem('ibp_wallpaper_brightness', val.toString());
    } catch {
      // ignore
    }
  };

  const handleUpdateBlur = (val: number) => {
    setBlurAmount(val);
    try {
      localStorage.setItem('ibp_wallpaper_blur', val.toString());
    } catch {
      // ignore
    }
  };

  const handleSaveNotes = (text: string) => {
    setStickyNotes(text);
    try {
      localStorage.setItem('ibp_desktop_notes', text);
    } catch {
      // ignore
    }
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(stickyNotes);
    setNotesCopied(true);
    setTimeout(() => setNotesCopied(false), 2000);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    if (contextMenu) setContextMenu(null);
  };

  const handleQuickNewFile = async () => {
    const timestamp = Date.now().toString().slice(-4);
    const path = `IBP://USERS/guest/projects/quick_${timestamp}.ibp`;
    await createFile(
      path,
      '# Quick Starter Script\nkeep name = "Explorer"\nsay "Welcome to IBP OS, {name}!"\nshout "let\'s code something fun!"\n\nrecipe double(x) => x * 2\nsay "Double 21 is: {double(21)}"\ncelebrate\n'
    );
    openWindow('studio');
  };

  if (!isBooted) {
    return <BootScreen />;
  }

  // Calculate background style based on active wallpaper choice
  const activePreset = WALLPAPER_PRESETS[presetKey] || WALLPAPER_PRESETS['deep-space'];
  let wallpaperBg = activePreset.bg;
  let bgImageStyle: React.CSSProperties = {
    filter: `brightness(${brightness}) blur(${blurAmount}px)`,
    transition: 'filter 0.3s ease',
  };

  if (wallpaperType === 'url' && customUrl) {
    bgImageStyle.backgroundImage = `url("${customUrl}")`;
    bgImageStyle.backgroundSize = 'cover';
    bgImageStyle.backgroundPosition = 'center';
  } else if (wallpaperType === 'upload' && customUploadData) {
    bgImageStyle.backgroundImage = `url("${customUploadData}")`;
    bgImageStyle.backgroundSize = 'cover';
    bgImageStyle.backgroundPosition = 'center';
  } else {
    bgImageStyle.backgroundImage = wallpaperBg;
  }

  const hasVisibleWindows = windows.some((w) => !w.isMinimized);

  return (
    <div
      onClick={() => {
        setStartMenu(false);
        closeContextMenu();
      }}
      onContextMenu={handleContextMenu}
      className="relative w-screen h-screen overflow-hidden bg-[#060911] select-none font-sans flex flex-col justify-between"
    >
      {/* Dynamic Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none transform scale-105" style={bgImageStyle} />
      {/* Dark Ambient Vignette Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-[#060911]/90 via-transparent to-[#060911]/50" />

      {/* 1. Desktop Shortcuts Grid (Left Side) */}
      <div className="absolute inset-0 p-6 grid grid-flow-col grid-rows-6 gap-3 auto-cols-max z-10 pointer-events-none pb-20">
        {desktopShortcuts.map((sc) => (
          <button
            key={sc.appId}
            onClick={() => openWindow(sc.appId)}
            className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl p-2 hover:bg-white/5 border border-transparent hover:border-white/10 hover:shadow-2xl hover:backdrop-blur-md transition duration-200 group pointer-events-auto relative text-center"
          >
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${sc.bg} shadow-lg shadow-black/40 os-icon-spring border border-white/20 relative overflow-hidden`}>
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl pointer-events-none" />
              {sc.icon}
            </div>
            <span className="text-[11px] font-semibold text-slate-100 mt-2 drop-shadow-md truncate w-full tracking-wide">
              {sc.title}
            </span>
            {sc.badge && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/30 text-sky-200 border border-sky-400/40 backdrop-blur-md shadow-sm">
                {sc.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 2. Interactive Desktop Background Widgets (Right Side) */}
      <div
        className={`absolute top-6 right-6 max-w-sm w-full space-y-4 z-10 pointer-events-none transition-opacity duration-300 pb-20 ${
          hasVisibleWindows ? 'opacity-25 hover:opacity-100 pointer-events-auto' : 'opacity-100 pointer-events-auto'
        }`}
      >
        {/* Widget 1: Digital Clock & Date */}
        <div className="liquid-glass-card sheen-overlay p-5 rounded-3xl shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center space-x-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>IBP OS 🪐 LIQUID MICA</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-950/60 text-[10px] text-sky-300 font-mono border border-sky-500/30">
              v0.1.0 Offline Ready
            </span>
          </div>

          <div className="text-3xl font-extrabold text-slate-100 tracking-tight font-mono my-1">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-xs font-medium text-slate-400">
            {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          {/* Quick Action Buttons on Desktop */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
            <button
              onClick={() => setIsWallpaperModalOpen(true)}
              className="flex-1 flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-[11px] font-semibold transition"
            >
              <Palette size={13} />
              <span>Wallpaper</span>
            </button>
            <button
              onClick={() => openWindow('langcraft')}
              className="flex-1 flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/30 text-[11px] font-semibold transition"
            >
              <Wand2 size={13} />
              <span>LangCraft</span>
            </button>
            <button
              onClick={() => downloadOfflineBundle()}
              className="flex-1 flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/30 text-[11px] font-semibold transition"
              title="Download Offline Edition (ZIP)"
            >
              <Download size={13} />
              <span>Offline</span>
            </button>
          </div>
        </div>

        {/* Widget 2: Desktop Scratchpad / Sticky Notes */}
        <div className="liquid-glass-card sheen-overlay p-4 rounded-3xl shadow-xl backdrop-blur-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
              <StickyNote size={14} />
              <span>DESKTOP SCRATCHPAD</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleCopyNotes}
                className="p-1 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg transition"
                title="Copy Notes"
              >
                {notesCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
              <button
                onClick={() => handleSaveNotes('')}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                title="Clear Notes"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <textarea
            value={stickyNotes}
            onChange={(e) => handleSaveNotes(e.target.value)}
            rows={3}
            spellCheck={false}
            className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
            placeholder="Type quick thoughts, code ideas, or to-dos..."
          />
        </div>

        {/* Widget 3: Language Tip of the Day */}
        <div className="liquid-glass-card sheen-overlay p-4 rounded-3xl shadow-xl backdrop-blur-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-400">
              <Sparkles size={14} />
              <span>LANGUAGE TIP OF THE DAY</span>
            </div>
            <button
              onClick={handleNextTip}
              className="p-1 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded transition"
              title="Next Tip"
            >
              <RefreshCw size={12} />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            {IBP_TIPS[tipIndex]}
          </p>
        </div>
      </div>

      {/* 3. Floating Windows Workspace */}
      <div className="relative flex-1 overflow-hidden pointer-events-none z-20">
        {windows.map((win) => (
          <div key={win.id} className="pointer-events-auto">
            <Window window={win} />
          </div>
        ))}
      </div>

      {/* 4. Desktop Right-Click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-60 liquid-glass rounded-2xl shadow-2xl p-2 backdrop-blur-2xl text-xs text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
            IBP OS Workspace
          </div>
          <button
            onClick={() => {
              openWindow('studio');
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-sky-600/30 hover:text-sky-300 transition text-left"
          >
            <Code size={14} className="text-sky-400" />
            <span>Open IBP Studio</span>
          </button>
          <button
            onClick={() => {
              openWindow('langcraft');
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-purple-600/30 hover:text-purple-300 transition text-left"
          >
            <Wand2 size={14} className="text-purple-400" />
            <span>LangCraft (Design Language)</span>
          </button>
          <button
            onClick={() => {
              openWindow('terminal');
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-emerald-600/30 hover:text-emerald-300 transition text-left"
          >
            <Terminal size={14} className="text-emerald-400" />
            <span>Open Terminal</span>
          </button>
          <button
            onClick={() => {
              openWindow('handbook');
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-cyan-600/30 hover:text-cyan-300 transition text-left"
          >
            <BookOpen size={14} className="text-cyan-400" />
            <span>Learn IBP (Handbook & PDF)</span>
          </button>
          <button
            onClick={() => {
              openWindow('playground');
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-yellow-600/30 hover:text-yellow-300 transition text-left"
          >
            <Trophy size={14} className="text-yellow-400" />
            <span>Challenges Playground</span>
          </button>

          <div className="border-t border-slate-800 my-1" />

          <button
            onClick={() => {
              downloadOfflineBundle();
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-emerald-600/30 hover:text-emerald-300 transition text-left"
          >
            <Download size={14} className="text-emerald-400" />
            <span>Download Offline OS (ZIP)</span>
          </button>
          <button
            onClick={() => {
              setIsWallpaperModalOpen(true);
              closeContextMenu();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-purple-600/30 hover:text-purple-300 transition text-left"
          >
            <Palette size={14} className="text-purple-400" />
            <span>Customize Wallpaper...</span>
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-slate-200 transition text-left"
          >
            <RefreshCw size={14} className="text-slate-400" />
            <span>Refresh Workspace</span>
          </button>
        </div>
      )}

      {/* 5. Custom Wallpaper Modal / Dialog */}
      {isWallpaperModalOpen && (
        <div
          onClick={() => setIsWallpaperModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="liquid-glass rounded-3xl shadow-2xl max-w-xl w-full p-6 text-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/40">
                  <Palette size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Customize Desktop Wallpaper</h3>
                  <p className="text-[11px] text-slate-400">Choose preset themes, paste image URLs, or upload your own wallpaper</p>
                </div>
              </div>
              <button
                onClick={() => setIsWallpaperModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setWallpaperType('preset')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  wallpaperType === 'preset' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Presets & Gradients
              </button>
              <button
                onClick={() => setWallpaperType('url')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  wallpaperType === 'url' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Custom URL
              </button>
              <button
                onClick={() => setWallpaperType('upload')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  wallpaperType === 'upload' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Upload Image
              </button>
            </div>

            {/* Presets Grid */}
            {wallpaperType === 'preset' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                {Object.entries(WALLPAPER_PRESETS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectPreset(key as WallpaperPresetKey)}
                    className={`flex flex-col items-center p-3 rounded-xl border transition text-left relative group ${
                      presetKey === key
                        ? 'border-purple-400 bg-purple-950/30 shadow-md shadow-purple-950/50'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded-lg border border-slate-700/60 mb-2 shadow-inner"
                      style={{ background: item.bg }}
                    />
                    <span className="text-[11px] font-semibold text-slate-200 truncate w-full text-center">
                      {item.name}
                    </span>
                    {presetKey === key && (
                      <span className="absolute top-2 right-2 p-1 bg-purple-500 text-white rounded-full">
                        <Check size={10} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Custom URL Input */}
            {wallpaperType === 'url' && (
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Paste any direct image URL (JPEG, PNG, WebP):</span>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => handleApplyCustomUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-sky-300 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Or Pick a Curated Landscape:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {SAMPLE_WALLPAPERS.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => handleApplyCustomUrl(s.url)}
                        className="flex items-center space-x-2 p-2 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-xs text-left transition"
                      >
                        <ImageIcon size={14} className="text-purple-400" />
                        <span className="truncate text-slate-300">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Upload File */}
            {wallpaperType === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-purple-400/80 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-900/60 transition group space-y-2"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Click to upload custom image from PC</span>
                    <span className="text-[10px] text-slate-500">Supports PNG, JPG, WebP, SVG (saved locally)</span>
                  </div>
                </div>

                {customUploadData && (
                  <div className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1.5">
                      <Check size={14} />
                      <span>Custom uploaded image is active!</span>
                    </span>
                    <button
                      onClick={() => {
                        setCustomUploadData('');
                        setWallpaperType('preset');
                        try {
                          localStorage.removeItem('ibp_wallpaper_upload');
                        } catch {}
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Brightness & Blur Controls */}
            <div className="pt-3 border-t border-slate-800/90 grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Wallpaper Brightness</span>
                  <span>{Math.round(brightness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={brightness}
                  onChange={(e) => handleUpdateBrightness(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Wallpaper Blur</span>
                  <span>{blurAmount}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={blurAmount}
                  onChange={(e) => handleUpdateBlur(parseInt(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsWallpaperModalOpen(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/40 transition"
              >
                Apply & Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Taskbar */}
      <div className="relative z-40">
        <Taskbar />
        <StartMenu />
      </div>

      {/* 7. Global Modals */}
      <CommandPalette />
      <OnboardingTour />
    </div>
  );
};
