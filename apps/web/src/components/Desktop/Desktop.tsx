import React, { useEffect, useState, useRef } from 'react';
import {
  Palette,
  Play,
  RefreshCw,
  Image as ImageIcon,
  Upload,
  Check,
  X,
  Download,
  Terminal as TerminalIcon,
  BookOpen,
  Code,
  Wand2,
  Globe,
  FilePlus,
  Command,
  Gamepad2,
  Folder,
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
import { downloadOfflineBundle } from '../../utils/offlineDownloader';
import {
  VSCodeStudioIcon,
  FolderUserIcon,
  LangCraftIcon,
  TerminalOSIcon,
  HandbookOSIcon,
  PlaygroundOSIcon,
  MonitorOSIcon,
  SettingsOSIcon,
  ChromeBrowserIcon,
  ZenzyShopIcon,
  IshantPortfolioIcon,
  ArcadeGamesIcon,
} from '../Icons/OSIcons';

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
  const { isBooted, windows, openWindow, setStartMenu, setControlCenter, theme } = useDesktopStore();
  const isLight = theme === 'light';
  const { init: initVFS, createFile, files, openFile } = useVFSStore();

  const [time, setTime] = useState(new Date());
  const [selectedDesktopId, setSelectedDesktopId] = useState<string | null>(null);

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
  }, [isBooted]);

  // Desktop shortcuts matching user's image (VS Code ribbon logo + Acer User Folder)
  const desktopShortcuts: {
    id: string;
    appId: AppId;
    title: string;
    params?: Record<string, any>;
    renderIcon: () => React.ReactNode;
  }[] = [
    {
      id: 'studio',
      appId: 'studio',
      title: 'Visual Studio\nCode',
      renderIcon: () => <VSCodeStudioIcon size={50} showShortcutArrow={true} />,
    },
    {
      id: 'user-files',
      appId: 'explorer',
      title: 'Acer',
      renderIcon: () => <FolderUserIcon size={50} hasUserBadge={true} />,
    },
    {
      id: 'chrome',
      appId: 'browser',
      params: { url: 'https://www.zenzy.shop/', title: 'Chrome' },
      title: 'Google\nChrome',
      renderIcon: () => <ChromeBrowserIcon size={50} showShortcutArrow={true} />,
    },
    {
      id: 'games',
      appId: 'games',
      title: 'Arcade\nGames',
      renderIcon: () => <ArcadeGamesIcon size={50} showShortcutArrow={true} />,
    },
    {
      id: 'zenzy',
      appId: 'browser',
      params: { url: 'https://www.zenzy.shop/', title: 'Zenzy Shop' },
      title: 'Zenzy\nShop',
      renderIcon: () => <ZenzyShopIcon size={50} showShortcutArrow={true} />,
    },
    {
      id: 'ishant',
      appId: 'browser',
      params: { url: 'https://ishantupadhyay.vercel.app/', title: 'Ishant Portfolio' },
      title: 'Ishant',
      renderIcon: () => <IshantPortfolioIcon size={50} showShortcutArrow={true} />,
    },
    {
      id: 'terminal',
      appId: 'terminal',
      title: 'Command\nPrompt',
      renderIcon: () => <TerminalOSIcon size={50} />,
    },
    {
      id: 'langcraft',
      appId: 'langcraft',
      title: 'LangCraft\nStudio',
      renderIcon: () => <LangCraftIcon size={50} />,
    },
    {
      id: 'handbook',
      appId: 'handbook',
      title: 'Learn IBP\n(PDF)',
      renderIcon: () => <HandbookOSIcon size={50} />,
    },
    {
      id: 'settings',
      appId: 'settings',
      title: 'Settings',
      renderIcon: () => <SettingsOSIcon size={50} />,
    },
    {
      id: 'monitor',
      appId: 'monitor',
      title: 'System\nMonitor',
      renderIcon: () => <MonitorOSIcon size={50} />,
    },
    {
      id: 'playground',
      appId: 'playground',
      title: 'Playground',
      renderIcon: () => <PlaygroundOSIcon size={50} />,
    },
  ];

  // Dynamically load any files saved to Desktop
  const desktopSavedFiles = (files || []).filter(
    (f) => !f.isFolder && f.path.startsWith('IBP://USERS/guest/Desktop')
  );

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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 230;
    const menuHeight = 310;
    // Position menu exactly at cursor, clamping smoothly only if overflowing display boundaries
    const x = e.clientX + menuWidth > window.innerWidth ? Math.max(8, window.innerWidth - menuWidth - 8) : e.clientX;
    const y = e.clientY + menuHeight > window.innerHeight ? Math.max(8, window.innerHeight - menuHeight - 8) : e.clientY;
    setContextMenu({ x, y });
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
        setControlCenter(false);
        closeContextMenu();
        setSelectedDesktopId(null);
      }}
      onContextMenu={handleContextMenu}
      className="relative w-screen h-screen overflow-hidden bg-[#060911] select-none font-sans flex flex-col justify-between"
    >
      {/* Dynamic Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none transform scale-105" style={bgImageStyle} />
      {/* Dark Ambient Vignette Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-[#060911]/80 via-transparent to-[#060911]/40" />

      {/* 1. Desktop Shortcuts Grid (Arranged cleanly with names permanently online below the icon) */}
      <div className="absolute top-6 left-6 flex flex-wrap gap-x-5 gap-y-4 max-w-[94vw] z-10 pointer-events-none pb-24">
        {desktopShortcuts.map((sc) => {
          const isSelected = selectedDesktopId === sc.id;

          return (
            <div
              key={sc.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDesktopId(sc.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                openWindow(sc.appId, sc.params);
              }}
              className={`flex flex-col items-center justify-start w-22 h-24 p-1.5 rounded-xl transition duration-150 cursor-pointer pointer-events-auto relative text-center group ${
                isSelected
                  ? 'bg-sky-500/25 border border-sky-400/60 shadow-lg backdrop-blur-sm'
                  : 'hover:bg-white/10 border border-transparent'
              }`}
            >
              {/* Authentic OS Icon */}
              <div className="transition-transform duration-150 group-hover:scale-105">
                {sc.renderIcon()}
              </div>

              {/* Icon Label Online Below (Permanently Visible, Crisp Text Shadow) */}
              <span
                className="mt-1 text-[11px] font-medium text-slate-100 text-center leading-tight whitespace-pre-line tracking-tight px-1 rounded"
                style={{
                  textShadow:
                    '0 1px 2px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9), 0 0 1px black',
                }}
              >
                {sc.title}
              </span>
            </div>
          );
        })}

        {/* Dynamically Display Any Files Saved to Desktop */}
        {desktopSavedFiles.map((file) => {
          const isSelected = selectedDesktopId === file.path;
          return (
            <div
              key={file.path}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDesktopId(file.path);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                openFile(file.path);
                openWindow('studio');
              }}
              className={`flex flex-col items-center justify-start w-22 h-24 p-1.5 rounded-xl transition duration-150 cursor-pointer pointer-events-auto relative text-center group ${
                isSelected
                  ? 'bg-sky-500/25 border border-sky-400/60 shadow-lg backdrop-blur-sm'
                  : 'hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className="transition-transform duration-150 group-hover:scale-105">
                <VSCodeStudioIcon size={48} showShortcutArrow={false} />
              </div>
              <span
                className="mt-1 text-[11px] font-medium text-slate-100 text-center leading-tight whitespace-pre-line tracking-tight px-1 rounded truncate max-w-[80px]"
                style={{
                  textShadow:
                    '0 1px 2px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9), 0 0 1px black',
                }}
              >
                {file.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Minimalist Floating Clock & System Pill (Top Right, Clean & Uncluttered) */}
      <div
        className={`absolute top-5 right-6 z-10 pointer-events-none transition-opacity duration-300 ${
          hasVisibleWindows ? 'opacity-20 hover:opacity-100 pointer-events-auto' : 'opacity-100 pointer-events-auto'
        }`}
      >
        <div className="liquid-glass px-4 py-2 rounded-2xl shadow-xl flex items-center space-x-3 text-slate-200 backdrop-blur-xl border border-white/15">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold font-mono tracking-tight text-slate-100">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="w-[1px] h-6 bg-white/15" />
          <button
            onClick={() => setIsWallpaperModalOpen(true)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-purple-300 transition pointer-events-auto"
            title="Customize Wallpaper"
          >
            <Palette size={16} />
          </button>
        </div>
      </div>

      {/* 3. Windows Workspace (Full Screen Fixed Inset-0, Zero Bottom Gap) */}
      <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
        {windows.map((win) => (
          <div key={win.id} className="pointer-events-auto w-full h-full">
            <Window window={win} />
          </div>
        ))}
      </div>

      {/* 4. Desktop Right-Click Context Menu (Opens Exactly at Cursor, Pure Liquid Glass Monochrome) */}
      {contextMenu && (
        <div
          style={{ position: 'fixed', top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
          className={`fixed z-50 w-60 rounded-2xl shadow-2xl p-1.5 backdrop-blur-3xl text-xs select-none animate-in fade-in zoom-in-95 duration-100 ${
            isLight
              ? 'bg-white/90 text-slate-900 border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5'
              : 'liquid-glass text-white border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
          }`}
        >
          <div
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b mb-1 flex items-center justify-between ${
              isLight ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-white/10'
            }`}
          >
            <span>IBP OS Workspace</span>
            <Command size={11} />
          </div>

          <button
            onClick={() => {
              openWindow('studio');
              closeContextMenu();
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition text-left ${
              isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-white/10 text-slate-200 hover:text-white'
            }`}
          >
            <Code size={14} className={isLight ? 'text-slate-700' : 'text-slate-300'} />
            <span>Open IBP Studio</span>
          </button>

          <button
            onClick={() => {
              openWindow('games');
              closeContextMenu();
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition text-left ${
              isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-white/10 text-slate-200 hover:text-white'
            }`}
          >
            <Gamepad2 size={14} className={isLight ? 'text-slate-700' : 'text-slate-300'} />
            <span>Play Arcade Games</span>
          </button>

          <button
            onClick={() => {
              openWindow('browser', { url: 'https://www.zenzy.shop/', title: 'Chrome' });
              closeContextMenu();
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition text-left ${
              isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-white/10 text-slate-200 hover:text-white'
            }`}
          >
            <Globe size={14} className={isLight ? 'text-slate-700' : 'text-slate-300'} />
            <span>Open Chrome Browser</span>
          </button>

          <button
            onClick={() => {
              openWindow('terminal');
              closeContextMenu();
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition text-left ${
              isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-white/10 text-slate-200 hover:text-white'
            }`}
          >
            <TerminalIcon size={14} className={isLight ? 'text-slate-700' : 'text-slate-300'} />
            <span>Command Prompt (CMD)</span>
          </button>

          <button
            onClick={() => {
              openWindow('explorer');
              closeContextMenu();
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition text-left ${
              isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-white/10 text-slate-200 hover:text-white'
            }`}
          >
            <Folder size={14} className={isLight ? 'text-slate-700' : 'text-slate-300'} />
            <span>File Explorer</span>
          </button>

          <button
            onClick={() => {
              handleQuickNewFile();
              closeContextMenu();
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition text-left ${
              isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-white/10 text-slate-200 hover:text-white'
            }`}
          >
            <FilePlus size={14} className={isLight ? 'text-slate-700' : 'text-slate-300'} />
            <span>New IBP Starter Script</span>
          </button>

          <div className={`border-t my-1 ${isLight ? 'border-slate-200' : 'border-white/10'}`} />

          <button
            onClick={() => {
              setIsWallpaperModalOpen(true);
              closeContextMenu();
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition text-left ${
              isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-white/10 text-slate-200 hover:text-white'
            }`}
          >
            <Palette size={14} className={isLight ? 'text-slate-700' : 'text-slate-300'} />
            <span>Personalize Wallpaper...</span>
          </button>

          <button
            onClick={() => {
              downloadOfflineBundle();
              closeContextMenu();
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition text-left ${
              isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-white/10 text-slate-200 hover:text-white'
            }`}
          >
            <Download size={14} className={isLight ? 'text-slate-700' : 'text-slate-300'} />
            <span>Download Offline OS (ZIP)</span>
          </button>

          <button
            onClick={() => {
              window.location.reload();
            }}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition text-left ${
              isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-white/10 text-slate-200 hover:text-white'
            }`}
          >
            <RefreshCw size={14} className={isLight ? 'text-slate-700' : 'text-slate-300'} />
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
            className="liquid-glass rounded-3xl shadow-2xl max-w-xl w-full p-6 text-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-3xl border border-white/20"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
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
            <div className="flex space-x-2 bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
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
                        ? 'border-purple-400 bg-purple-950/40 shadow-md shadow-purple-950/50'
                        : 'border-white/10 bg-slate-900/60 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded-lg border border-white/15 mb-2 shadow-inner"
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
                        className="flex items-center space-x-2 p-2 bg-slate-950/60 hover:bg-slate-800/80 border border-white/10 rounded-xl text-xs text-left transition"
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
                  className="border-2 border-dashed border-white/20 hover:border-purple-400/80 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-900/60 transition group space-y-2"
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
                  <div className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-white/10 rounded-xl">
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
            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
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

      {/* 6. Floating macOS Liquid Glass Dock & Control Center (Fixed overlay, Zero Space Reserved in Document Flow) */}
      <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
        <div className="pointer-events-auto">
          <Taskbar
            onOpenWallpaperModal={() => setIsWallpaperModalOpen(true)}
            brightness={brightness}
            onBrightnessChange={handleUpdateBrightness}
          />
          <StartMenu />
        </div>
      </div>

      {/* 7. Global Modals */}
      <CommandPalette />
      <OnboardingTour />
    </div>
  );
};
