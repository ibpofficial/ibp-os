import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  ExternalLink,
  Search,
  Star,
  Settings,
  X,
  Plus,
  ShieldCheck,
  Globe,
  ShoppingBag,
  User,
  BookOpen,
  Code2,
} from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';

interface BrowserAppProps {
  initialUrl?: string;
}

interface Bookmark {
  title: string;
  url: string;
  icon: 'zenzy' | 'ishant' | 'google' | 'github' | 'docs' | 'globe';
}

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { title: 'Zenzy Shop', url: 'https://www.zenzy.shop/', icon: 'zenzy' },
  { title: 'Ishant Portfolio', url: 'https://ishantupadhyay.vercel.app/', icon: 'ishant' },
  { title: 'Google', url: 'https://www.google.com/webhp?igu=1', icon: 'google' },
  { title: 'GitHub', url: 'https://github.com/', icon: 'github' },
  { title: 'IBP Handbook', url: 'https://github.com/ibp-os', icon: 'docs' },
];

export const BrowserApp: React.FC<BrowserAppProps> = ({ initialUrl }) => {
  const { theme } = useDesktopStore();
  const isLight = theme === 'light';

  const defaultHomepage = 'https://www.zenzy.shop/';
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl || defaultHomepage);
  const [inputUrl, setInputUrl] = useState<string>(initialUrl || defaultHomepage);
  const [history, setHistory] = useState<string[]>([initialUrl || defaultHomepage]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [searchEngine, setSearchEngine] = useState<'google' | 'duckduckgo' | 'bing'>('google');
  const [iframeKey, setIframeKey] = useState<number>(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update if initialUrl changes
  useEffect(() => {
    if (initialUrl && initialUrl !== currentUrl) {
      navigateTo(initialUrl);
    }
  }, [initialUrl]);

  const normalizeUrl = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return 'https://www.google.com/webhp?igu=1';

    // If looks like full URL
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    // If looks like domain e.g. zenzy.shop or localhost:5173
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(trimmed)) {
      return `https://${trimmed}`;
    }

    // Otherwise treat as search query
    if (searchEngine === 'duckduckgo') {
      return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`;
    } else if (searchEngine === 'bing') {
      return `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}&igu=1`;
  };

  const navigateTo = (url: string) => {
    const finalUrl = normalizeUrl(url);
    setIsLoading(true);
    setCurrentUrl(finalUrl);
    setInputUrl(finalUrl);

    // Update history
    const nextHistory = history.slice(0, historyIdx + 1);
    nextHistory.push(finalUrl);
    setHistory(nextHistory);
    setHistoryIdx(nextHistory.length - 1);
    setIframeKey((k) => k + 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(inputUrl);
  };

  const handleBack = () => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      const url = history[prevIdx];
      setCurrentUrl(url);
      setInputUrl(url);
      setIframeKey((k) => k + 1);
    }
  };

  const handleForward = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      const url = history[nextIdx];
      setCurrentUrl(url);
      setInputUrl(url);
      setIframeKey((k) => k + 1);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((k) => k + 1);
  };

  const handleHome = () => {
    navigateTo(defaultHomepage);
  };

  const openInExternal = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  const renderBookmarkIcon = (type: string) => {
    switch (type) {
      case 'zenzy':
        return <ShoppingBag size={12} className="text-pink-400" />;
      case 'ishant':
        return <User size={12} className="text-sky-400" />;
      case 'google':
        return <Search size={12} className="text-amber-400" />;
      case 'github':
        return <Code2 size={12} className="text-purple-400" />;
      case 'docs':
        return <BookOpen size={12} className="text-emerald-400" />;
      default:
        return <Globe size={12} className="text-slate-400" />;
    }
  };

  return (
    <div className={`flex flex-col h-full w-full select-none ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#0B1120] text-slate-100'}`}>
      {/* 1. Chrome Tab Strip */}
      <div className={`flex items-center px-2 pt-1 border-b text-xs ${isLight ? 'bg-slate-200/90 border-slate-300' : 'bg-[#090D1A] border-white/10'}`}>
        {/* Active Tab */}
        <div className={`flex items-center max-w-xs space-x-2 px-3 py-1.5 rounded-t-lg font-medium shadow-sm border-t border-x ${
          isLight
            ? 'bg-white text-slate-800 border-slate-300'
            : 'bg-[#111827] text-slate-100 border-white/15'
        }`}>
          <Globe size={13} className="text-sky-400 shrink-0" />
          <span className="truncate max-w-[150px]">
            {currentUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'New Tab'}
          </span>
          <button
            onClick={() => handleHome()}
            className="hover:bg-slate-700/30 p-0.5 rounded text-slate-400 hover:text-slate-200"
          >
            <X size={11} />
          </button>
        </div>

        {/* New Tab Button */}
        <button
          onClick={() => navigateTo('https://www.google.com/webhp?igu=1')}
          className={`p-1.5 ml-1 rounded-md transition ${isLight ? 'text-slate-600 hover:bg-slate-300/80' : 'text-slate-400 hover:bg-white/10'}`}
          title="New Tab"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* 2. Navigation Bar (Back, Forward, Refresh, Omnibox, Actions) */}
      <div className={`flex items-center space-x-1.5 px-3 py-1.5 border-b text-xs ${
        isLight ? 'bg-white border-slate-300' : 'bg-[#111827] border-white/10'
      }`}>
        {/* Nav Controls */}
        <button
          onClick={handleBack}
          disabled={historyIdx <= 0}
          className={`p-1.5 rounded-lg transition ${
            historyIdx <= 0
              ? 'opacity-40 cursor-not-allowed text-slate-500'
              : isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-200 hover:bg-white/10'
          }`}
          title="Back"
        >
          <ArrowLeft size={14} />
        </button>
        <button
          onClick={handleForward}
          disabled={historyIdx >= history.length - 1}
          className={`p-1.5 rounded-lg transition ${
            historyIdx >= history.length - 1
              ? 'opacity-40 cursor-not-allowed text-slate-500'
              : isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-200 hover:bg-white/10'
          }`}
          title="Forward"
        >
          <ArrowRight size={14} />
        </button>
        <button
          onClick={handleReload}
          className={`p-1.5 rounded-lg transition ${isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-200 hover:bg-white/10'}`}
          title="Reload"
        >
          <RotateCw size={13} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={handleHome}
          className={`p-1.5 rounded-lg transition ${isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-200 hover:bg-white/10'}`}
          title="Home"
        >
          <Home size={14} />
        </button>

        {/* Omnibox / Address Bar */}
        <form onSubmit={handleFormSubmit} className="flex-1 flex items-center relative">
          <div className="absolute left-2.5 flex items-center space-x-1 pointer-events-none text-emerald-400">
            <Lock size={12} />
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Search with Google or enter URL"
            className={`w-full pl-8 pr-16 py-1 rounded-full text-xs font-mono transition focus:outline-none ${
              isLight
                ? 'bg-slate-100 text-slate-900 border border-slate-300 focus:bg-white focus:ring-1 focus:ring-sky-500'
                : 'bg-[#090D1A] text-slate-100 border border-white/15 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
            }`}
          />
          <div className="absolute right-2 flex items-center space-x-1">
            <button
              type="submit"
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow"
            >
              Go
            </button>
          </div>
        </form>

        {/* External Pop-out Button */}
        <button
          onClick={openInExternal}
          className={`p-1.5 rounded-lg transition flex items-center space-x-1 ${
            isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          title="Open in Host Browser (Recommended if site blocks iframes)"
        >
          <ExternalLink size={14} />
          <span className="text-[10px] font-medium hidden md:inline">Open in Tab</span>
        </button>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-1.5 rounded-lg transition ${
            showSettings
              ? 'bg-sky-600 text-white'
              : isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-300 hover:bg-white/10'
          }`}
          title="Browser Settings"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* 3. Bookmarks Toolbar */}
      <div className={`flex items-center space-x-2 px-3 py-1 border-b text-[11px] overflow-x-auto ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0E1526] border-white/10 text-slate-300'
      }`}>
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center space-x-1">
          <Star size={10} className="text-amber-400" />
          <span>Shortcuts:</span>
        </span>
        {DEFAULT_BOOKMARKS.map((bm) => (
          <button
            key={bm.url}
            onClick={() => navigateTo(bm.url)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md transition ${
              isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-white/10 text-slate-200'
            }`}
          >
            {renderBookmarkIcon(bm.icon)}
            <span className="truncate max-w-[120px]">{bm.title}</span>
          </button>
        ))}
      </div>

      {/* 4. Settings Dropdown / Drawer */}
      {showSettings && (
        <div className={`p-3 border-b text-xs flex flex-wrap items-center justify-between gap-3 ${
          isLight ? 'bg-white border-slate-300' : 'bg-[#131B2E] border-white/15'
        }`}>
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-slate-300">Default Search Engine:</span>
            {(['google', 'duckduckgo', 'bing'] as const).map((engine) => (
              <label key={engine} className="flex items-center space-x-1.5 cursor-pointer capitalize">
                <input
                  type="radio"
                  name="searchEngine"
                  checked={searchEngine === engine}
                  onChange={() => setSearchEngine(engine)}
                  className="accent-sky-500"
                />
                <span>{engine}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setHistory([defaultHomepage]);
                setHistoryIdx(0);
                navigateTo(defaultHomepage);
              }}
              className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px]"
            >
              Clear History & Reset
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 5. In-OS Frame / Web Content Area */}
      <div className="flex-1 relative overflow-hidden bg-white">
        {/* Helper Hint Banner */}
        <div className="absolute top-1 right-2 z-10 pointer-events-auto">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur text-[10px] text-slate-300 border border-white/15 shadow-md">
            <span>External site?</span>
            <button
              onClick={openInExternal}
              className="text-sky-400 hover:underline flex items-center space-x-0.5 font-semibold"
            >
              <span>Pop out tab</span>
              <ExternalLink size={10} />
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm pointer-events-none">
            <RotateCw size={28} className="animate-spin text-sky-400 mb-2" />
            <span className="text-xs font-mono text-slate-200">Loading {currentUrl}...</span>
          </div>
        )}

        {/* Interactive Web Page Iframe */}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={currentUrl}
          title="Inbuilt Web Browser"
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>

      {/* 6. Status Bar */}
      <div className={`px-3 py-1 border-t text-[10px] font-mono flex items-center justify-between ${
        isLight ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-[#090D1A] text-slate-400 border-white/10'
      }`}>
        <div className="flex items-center space-x-1.5 truncate">
          <ShieldCheck size={11} className="text-emerald-400 shrink-0" />
          <span className="truncate">{currentUrl}</span>
        </div>
        <span className="shrink-0 text-slate-500">Chrome Virtual Client</span>
      </div>
    </div>
  );
};
