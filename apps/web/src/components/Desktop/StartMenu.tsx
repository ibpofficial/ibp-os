import React, { useState } from 'react';
import {
  Code,
  Terminal,
  Folder,
  Activity,
  BookOpen,
  Trophy,
  Settings,
  Power,
  User,
  Wand2,
  Download,
  Search,
  Sparkles,
  Globe,
  Gamepad2,
  X,
} from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';
import { AppId } from '../../types/desktop';
import { downloadOfflineBundle } from '../../utils/offlineDownloader';
import { IBPOSLogoIcon } from '../Icons/OSIcons';

export const StartMenu: React.FC = () => {
  const { isStartMenuOpen, setStartMenu, openWindow, setBooted, currentUser, theme } = useDesktopStore();
  const isLight = theme === 'light';

  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isStartMenuOpen) return null;

  const handleLaunch = (appId: AppId) => {
    openWindow(appId);
    setStartMenu(false);
  };

  const handleRestart = () => {
    setStartMenu(false);
    window.location.reload();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadOfflineBundle();
    } catch (e) {
      alert('Download error: ' + String(e));
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  const apps = [
    { appId: 'studio' as AppId, title: 'IBP Studio', desc: 'Code IDE with Monaco syntax highlighting & terminal', icon: <Code size={16} /> },
    { appId: 'games' as AppId, title: 'Arcade Games', desc: 'Instant playable retro games (2048, Snake, Space)', icon: <Gamepad2 size={16} /> },
    { appId: 'browser' as AppId, title: 'Chrome Browser', desc: 'Integrated web browser & luxury shopping client', icon: <Globe size={16} /> },
    { appId: 'terminal' as AppId, title: 'Command Prompt', desc: 'CLI environment, CMD & PowerShell REPL', icon: <Terminal size={16} /> },
    { appId: 'explorer' as AppId, title: 'File Explorer', desc: 'Browse and manage virtual IBP workspace', icon: <Folder size={16} /> },
    { appId: 'langcraft' as AppId, title: 'LangCraft Studio', desc: 'Design your own custom programming language', icon: <Wand2 size={16} /> },
    { appId: 'handbook' as AppId, title: 'Learn IBP', desc: 'Interactive 12-chapter textbook & PDF export', icon: <BookOpen size={16} /> },
    { appId: 'playground' as AppId, title: 'Playground', desc: '20 progressive coding challenges & test runner', icon: <Trophy size={16} /> },
    { appId: 'monitor' as AppId, title: 'System Monitor', desc: 'Virtual machine metrics, heap & clock status', icon: <Activity size={16} /> },
    { appId: 'settings' as AppId, title: 'Settings', desc: 'Wallpapers, themes, and system preferences', icon: <Settings size={16} /> },
  ];

  const filteredApps = apps.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`fixed bottom-16 left-6 w-96 rounded-3xl p-5 select-none z-50 text-xs font-sans flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-3xl ${
        isLight
          ? 'bg-white/90 text-slate-900 border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5'
          : 'liquid-glass text-white border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
      }`}
    >
      {/* Header with IBP OS Insignia */}
      <div className="flex items-center justify-between pb-1 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <IBPOSLogoIcon size={26} />
          <div>
            <div className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>IBP OS</div>
            <div className="text-[10px] text-slate-400 font-mono">Applications & Tools</div>
          </div>
        </div>
        <button
          onClick={() => setStartMenu(false)}
          className={`p-1 rounded-lg transition ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-slate-400'}`}
        >
          <X size={14} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search apps, games, files..."
          className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs font-medium focus:outline-none transition ${
            isLight
              ? 'bg-slate-100 text-slate-900 border-slate-300 focus:bg-white focus:border-slate-400'
              : 'bg-black/40 text-slate-100 border-white/15 focus:border-white/30'
          }`}
        />
      </div>

      {/* Pinned Applications */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            All Applications ({filteredApps.length})
          </span>
          <span className="text-[10px] font-mono text-slate-500">Fast Launch</span>
        </div>

        <div className="grid grid-cols-1 gap-1 max-h-72 overflow-y-auto pr-1">
          {filteredApps.map((item) => (
            <button
              key={item.appId}
              onClick={() => handleLaunch(item.appId)}
              className={`flex items-center space-x-3 p-2 rounded-xl border transition text-left group ${
                isLight
                  ? 'hover:bg-slate-100 border-transparent hover:border-slate-200'
                  : 'hover:bg-white/10 border-transparent hover:border-white/10'
              }`}
            >
              <div
                className={`p-2 rounded-xl border transition group-hover:scale-105 ${
                  isLight
                    ? 'bg-white text-slate-800 border-slate-300 shadow-sm'
                    : 'bg-white/10 text-white border-white/15 shadow-sm'
                }`}
              >
                {item.icon}
              </div>
              <div className="flex-1 truncate">
                <div className={`font-semibold text-xs transition-colors ${isLight ? 'text-slate-900 group-hover:text-black' : 'text-slate-100 group-hover:text-white'}`}>
                  {item.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Profile & Power Footer */}
      <div className={`pt-3 border-t flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
            isLight ? 'bg-slate-200 border-slate-300 text-slate-800' : 'bg-white/10 border-white/15 text-white'
          }`}>
            <User size={14} />
          </div>
          <div>
            <div className={`font-bold text-xs capitalize ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentUser}</div>
            <div className="text-[9px] text-slate-400 font-mono">Standard User</div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`p-2 rounded-xl border transition ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
            }`}
            title="Download Offline Package (ZIP)"
          >
            <Download size={14} />
          </button>
          <button
            onClick={handleRestart}
            className={`p-2 rounded-xl border transition ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
            }`}
            title="Restart IBP OS"
          >
            <Power size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
