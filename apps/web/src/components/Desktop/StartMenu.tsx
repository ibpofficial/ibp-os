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
} from 'lucide-react';
import { useDesktopStore, APP_REGISTRY } from '../../stores/desktopStore';
import { AppId } from '../../types/desktop';
import { downloadOfflineBundle } from '../../utils/offlineDownloader';

export const StartMenu: React.FC = () => {
  const { isStartMenuOpen, setStartMenu, openWindow, setBooted, currentUser } = useDesktopStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isStartMenuOpen) return null;

  const handleLaunch = (appId: AppId) => {
    openWindow(appId);
    setStartMenu(false);
  };

  const handleRestart = () => {
    setStartMenu(false);
    setBooted(false);
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
    { appId: 'studio' as AppId, title: 'IBP Studio', desc: 'Code IDE with Monaco syntax highlighting', icon: <Code size={18} className="text-sky-300" />, bg: 'from-blue-600 to-sky-500' },
    { appId: 'langcraft' as AppId, title: 'LangCraft Studio', desc: 'Design your custom programming language', icon: <Wand2 size={18} className="text-purple-200" />, bg: 'from-purple-600 to-pink-500' },
    { appId: 'handbook' as AppId, title: 'Learn IBP', desc: 'Interactive 12-chapter textbook & PDF export', icon: <BookOpen size={18} className="text-cyan-200" />, bg: 'from-cyan-600 to-teal-500' },
    { appId: 'playground' as AppId, title: 'Playground', desc: '20 progressive coding challenges & tests', icon: <Trophy size={18} className="text-yellow-200" />, bg: 'from-amber-600 to-yellow-500' },
    { appId: 'terminal' as AppId, title: 'Terminal', desc: 'CLI environment, REPL & shell tools', icon: <Terminal size={18} className="text-emerald-200" />, bg: 'from-emerald-700 to-teal-600' },
    { appId: 'explorer' as AppId, title: 'File Explorer', desc: 'Browse and manage virtual IBP filesystem', icon: <Folder size={18} className="text-amber-300" />, bg: 'from-amber-700 to-orange-600' },
    { appId: 'monitor' as AppId, title: 'System Monitor', desc: 'Virtual machine metrics, heap & clock status', icon: <Activity size={18} className="text-indigo-200" />, bg: 'from-indigo-700 to-purple-600' },
    { appId: 'settings' as AppId, title: 'Settings', desc: 'Wallpapers, themes, and system preferences', icon: <Settings size={18} className="text-slate-200" />, bg: 'from-slate-700 to-slate-600' },
  ];

  const filteredApps = apps.filter(
    (a) => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-16 left-6 w-96 liquid-glass rounded-3xl shadow-2xl p-5 select-none z-50 text-xs font-sans text-slate-100 flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type to search apps, files, or settings..."
          className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/60 font-medium"
        />
      </div>

      {/* Pinned Applications */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Pinned Applications
          </span>
          <span className="text-[10px] text-sky-400/80 font-mono">IBP Core</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-1">
          {filteredApps.map((item) => (
            <button
              key={item.appId}
              onClick={() => handleLaunch(item.appId)}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition duration-150 text-left group"
            >
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.bg} shadow-md group-hover:scale-105 transition-transform`}>
                {item.icon}
              </div>
              <div className="flex-1 truncate">
                <div className="font-semibold text-slate-100 text-xs group-hover:text-sky-300 transition-colors">
                  {item.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Offline Downloader Feature Card */}
      <div className="p-3 bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between space-x-3">
        <div className="space-y-0.5">
          <div className="text-[11px] font-bold text-emerald-300 flex items-center space-x-1.5">
            <Download size={13} />
            <span>Download Offline OS</span>
          </div>
          <div className="text-[10px] text-slate-400">Run anytime with zero internet connection</div>
        </div>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold shadow-md shadow-emerald-900/30 transition active:scale-95"
        >
          {isDownloading ? 'Bundling...' : 'Download'}
        </button>
      </div>

      {/* User Footer & Power Button */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
            {currentUser[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-100">{currentUser}</div>
            <div className="text-[10px] text-slate-400 font-mono">Operator</div>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="p-2 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 rounded-xl transition"
          title="Restart System"
        >
          <Power size={15} />
        </button>
      </div>
    </div>
  );
};
