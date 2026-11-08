import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  ExternalLink,
  Search,
  Settings,
  X,
  Plus,
  Globe,
  ShoppingBag,
  User,
  BookOpen,
  Code2,
  Check,
  ShoppingCart,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
  CreditCard,
  SlidersHorizontal,
} from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';

interface BrowserAppProps {
  initialUrl?: string;
}

interface ProductItem {
  id: string;
  name: string;
  category: 'Hoodies' | 'Tees' | 'Cargos' | 'Outerwear' | 'Footwear';
  priceUsd: number;
  priceInr: number;
  tag: string;
  color: string;
  imageBg: string;
  description: string;
}

const ZENZY_PRODUCTS: ProductItem[] = [
  {
    id: 'z-hoodie-1',
    name: 'Cyber Matrix 500GSM Heavyweight Hoodie',
    category: 'Hoodies',
    priceUsd: 140,
    priceInr: 5299,
    tag: 'BESTSELLER',
    color: 'Onyx Black',
    imageBg: 'from-zinc-900 via-stone-900 to-black',
    description: 'Custom milled 500 GSM loopback French terry with double-layered hood and dropped shoulders.',
  },
  {
    id: 'z-tee-1',
    name: 'Zenzy Boxy Drop-Shoulder Mineral Tee',
    category: 'Tees',
    priceUsd: 65,
    priceInr: 2499,
    tag: 'NEW DROP',
    color: 'Acid Mineral Grey',
    imageBg: 'from-slate-800 via-zinc-800 to-neutral-900',
    description: 'Garment dyed heavyweight 280 GSM cotton jersey with reinforced ribbed collar.',
  },
  {
    id: 'z-cargo-1',
    name: 'Obsidian Multi-Pocket Tactical Cargo',
    category: 'Cargos',
    priceUsd: 125,
    priceInr: 4899,
    tag: 'TRENDING',
    color: 'Obsidian',
    imageBg: 'from-stone-900 via-zinc-900 to-slate-950',
    description: 'Constructed from durable ripstop cotton with articulated knee gussets and 8 utility compartments.',
  },
  {
    id: 'z-jacket-1',
    name: 'Liquid Chrome Reflective Windbreaker',
    category: 'Outerwear',
    priceUsd: 175,
    priceInr: 6799,
    tag: 'LIMITED DROP',
    color: 'Metallic Silver',
    imageBg: 'from-slate-700 via-zinc-800 to-slate-900',
    description: 'Weather-resistant technical shell featuring 3M reflective accents and waterproof taped zips.',
  },
  {
    id: 'z-sneaker-1',
    name: 'Genesis Monogram Chunky Sneaker',
    category: 'Footwear',
    priceUsd: 190,
    priceInr: 7499,
    tag: 'HOT',
    color: 'Bone White / Slate',
    imageBg: 'from-neutral-800 via-stone-800 to-zinc-900',
    description: 'Sculpted EVA midsole with tumbled Italian calfskin leather overlays and cushioned memory foam insole.',
  },
  {
    id: 'z-crew-1',
    name: 'Acid Wash Raw-Edge Oversized Crewneck',
    category: 'Hoodies',
    priceUsd: 110,
    priceInr: 4199,
    tag: 'CLASSIC',
    color: 'Vintage Wash Olive',
    imageBg: 'from-emerald-950 via-zinc-900 to-neutral-900',
    description: 'Vintage mineral washed 420 GSM fleece with raw hem detailing and subtle tone-on-tone embroidery.',
  },
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
  const [iframeKey, setIframeKey] = useState<number>(0);

  // View mode: 'auto' detects iframes that are blocked (zenzy, vercel) and renders the rich client
  const [viewMode, setViewMode] = useState<'auto' | 'iframe'>('auto');

  // Zenzy Store Interactive States
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cartItems, setCartItems] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Sync with initialUrl changes
  useEffect(() => {
    if (initialUrl && initialUrl !== currentUrl) {
      navigateTo(initialUrl);
    }
  }, [initialUrl]);

  const normalizeUrl = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return 'https://www.google.com/webhp?igu=1';

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(trimmed)) {
      return `https://${trimmed}`;
    }

    return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}&igu=1`;
  };

  const navigateTo = (url: string) => {
    const finalUrl = normalizeUrl(url);
    setIsLoading(true);
    setCurrentUrl(finalUrl);
    setInputUrl(finalUrl);

    const nextHistory = history.slice(0, historyIdx + 1);
    nextHistory.push(finalUrl);
    setHistory(nextHistory);
    setHistoryIdx(nextHistory.length - 1);
    setIframeKey((k) => k + 1);

    setTimeout(() => setIsLoading(false), 400);
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
    setTimeout(() => setIsLoading(false), 500);
  };

  const openInExternal = (targetUrl?: string) => {
    window.open(targetUrl || currentUrl, '_blank', 'noopener,noreferrer');
  };

  // Determine site type for smart rendering without broken iframe sad face
  const isZenzy = currentUrl.toLowerCase().includes('zenzy');
  const isIshant = currentUrl.toLowerCase().includes('ishant');

  const addToCart = (product: ProductItem) => {
    const price = currency === 'INR' ? product.priceInr : product.priceUsd;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price, qty: 1 }];
    });
    setAddedToast(product.name);
    setTimeout(() => setAddedToast(null), 2500);
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.qty, 0);
  const totalCartPrice = cartItems.reduce((acc, curr) => acc + curr.price * curr.qty, 0);

  const filteredProducts =
    activeCategory === 'All'
      ? ZENZY_PRODUCTS
      : ZENZY_PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div
      className={`flex flex-col h-full w-full select-none overflow-hidden ${
        isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#0B101D] text-slate-100'
      }`}
    >
      {/* ============================================================== */}
      {/* ULTRA-COMPACT UNIFIED CHROME HEADER (Tab + Nav in minimal rows) */}
      {/* ============================================================== */}
      <div
        className={`flex items-center justify-between px-2 pt-1 pb-0.5 border-b text-xs shrink-0 select-none ${
          isLight ? 'bg-slate-200/90 border-slate-300' : 'bg-[#080D19] border-white/10'
        }`}
      >
        {/* Left: Active Chrome Tab */}
        <div className="flex items-center space-x-1.5 overflow-hidden">
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-t-lg font-medium shadow-sm border-t border-x transition-all ${
              isLight
                ? 'bg-white text-slate-800 border-slate-300'
                : 'bg-[#101726] text-slate-100 border-white/15'
            }`}
          >
            {isZenzy ? (
              <ShoppingBag size={13} className="text-pink-400 shrink-0" />
            ) : isIshant ? (
              <User size={13} className="text-sky-400 shrink-0" />
            ) : (
              <Globe size={13} className="text-sky-400 shrink-0" />
            )}
            <span className="truncate max-w-[130px] font-sans font-semibold text-[11px]">
              {isZenzy
                ? 'Zenzy Luxury Shop'
                : isIshant
                ? 'Ishant Portfolio'
                : currentUrl.replace(/^https?:\/\//i, '').split('/')[0] || 'Chrome Tab'}
            </span>
            <button
              onClick={() => navigateTo('https://www.google.com/webhp?igu=1')}
              className="p-0.5 rounded hover:bg-white/15 text-slate-400 hover:text-white"
            >
              <X size={11} />
            </button>
          </div>

          <button
            onClick={() => navigateTo('https://www.google.com/webhp?igu=1')}
            className={`p-1 rounded-md transition ${
              isLight ? 'text-slate-600 hover:bg-slate-300/80' : 'text-slate-400 hover:bg-white/10'
            }`}
            title="New Tab"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Right: Quick Shortcuts Pills in the Tab Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
          <button
            onClick={() => navigateTo('https://www.zenzy.shop/')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition ${
              isZenzy
                ? 'bg-pink-600/30 text-pink-300 border border-pink-500/40'
                : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag size={10} className="text-pink-400" />
            <span>Zenzy</span>
          </button>

          <button
            onClick={() => navigateTo('https://ishantupadhyay.vercel.app/')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition ${
              isIshant
                ? 'bg-sky-600/30 text-sky-300 border border-sky-500/40'
                : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={10} className="text-sky-400" />
            <span>Ishant</span>
          </button>

          <button
            onClick={() => navigateTo('https://www.google.com/webhp?igu=1')}
            className="flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold hover:bg-white/10 text-slate-400 hover:text-slate-200"
          >
            <Search size={10} className="text-amber-400" />
            <span>Google</span>
          </button>

          <button
            onClick={() => navigateTo('https://github.com/')}
            className="flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold hover:bg-white/10 text-slate-400 hover:text-slate-200"
          >
            <Code2 size={10} className="text-purple-400" />
            <span>GitHub</span>
          </button>
        </div>
      </div>

      {/* Row 2: Streamlined Omnibox & Navigation Bar */}
      <div
        className={`flex items-center space-x-1 px-2.5 py-1 border-b text-xs shrink-0 ${
          isLight ? 'bg-white border-slate-300' : 'bg-[#101726] border-white/10'
        }`}
      >
        {/* Navigation Buttons */}
        <button
          onClick={handleBack}
          disabled={historyIdx <= 0}
          className={`p-1 rounded-md transition ${
            historyIdx <= 0
              ? 'opacity-30 cursor-not-allowed text-slate-500'
              : isLight
              ? 'text-slate-700 hover:bg-slate-200'
              : 'text-slate-200 hover:bg-white/10'
          }`}
          title="Back"
        >
          <ArrowLeft size={13} />
        </button>

        <button
          onClick={handleForward}
          disabled={historyIdx >= history.length - 1}
          className={`p-1 rounded-md transition ${
            historyIdx >= history.length - 1
              ? 'opacity-30 cursor-not-allowed text-slate-500'
              : isLight
              ? 'text-slate-700 hover:bg-slate-200'
              : 'text-slate-200 hover:bg-white/10'
          }`}
          title="Forward"
        >
          <ArrowRight size={13} />
        </button>

        <button
          onClick={handleReload}
          className={`p-1 rounded-md transition ${
            isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-200 hover:bg-white/10'
          }`}
          title="Reload"
        >
          <RotateCw size={12} className={isLoading ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={() => navigateTo(defaultHomepage)}
          className={`p-1 rounded-md transition ${
            isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-200 hover:bg-white/10'
          }`}
          title="Zenzy Home"
        >
          <Home size={13} />
        </button>

        {/* Omnibox / Address Bar */}
        <form onSubmit={handleFormSubmit} className="flex-1 flex items-center relative">
          <div className="absolute left-2.5 flex items-center space-x-1 pointer-events-none text-emerald-400">
            <Lock size={11} />
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Search with Google or enter URL"
            className={`w-full pl-7 pr-14 py-1 rounded-full text-xs font-mono transition focus:outline-none ${
              isLight
                ? 'bg-slate-100 text-slate-900 border border-slate-300 focus:bg-white focus:ring-1 focus:ring-sky-500'
                : 'bg-[#080D19] text-slate-100 border border-white/15 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
            }`}
          />
          <div className="absolute right-1 flex items-center space-x-1">
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
          onClick={() => openInExternal()}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-[11px] shadow-sm transition shrink-0"
          title="Open currently loaded website in host browser tab"
        >
          <span>Open in Tab</span>
          <ExternalLink size={11} />
        </button>
      </div>

      {/* ============================================================== */}
      {/* MAIN VIEWPORT (Rich interactive mode or Sandboxed iframe)     */}
      {/* ============================================================== */}
      <div className="flex-1 relative overflow-auto bg-slate-950">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm pointer-events-none">
            <RotateCw size={24} className="animate-spin text-sky-400 mb-2" />
            <span className="text-xs font-mono text-slate-200">Connecting to {currentUrl}...</span>
          </div>
        )}

        {/* 1. ZENZY SHOP INTERACTIVE STOREFRONT */}
        {isZenzy && viewMode === 'auto' ? (
          <div className="min-h-full bg-stone-950 text-slate-100 font-sans flex flex-col justify-between">
            {/* Top Announcement Bar */}
            <div className="bg-gradient-to-r from-stone-900 via-neutral-900 to-stone-900 border-b border-white/10 px-4 py-1.5 text-center text-[11px] text-stone-300 font-mono tracking-wider flex items-center justify-center space-x-3">
              <span>✦ OFFICIAL ZENZY STORE — SPRING DROP 2026</span>
              <span className="hidden md:inline text-pink-400 font-semibold">• USE CODE "IBPOS" FOR 20% OFF</span>
              <button
                onClick={() => openInExternal('https://www.zenzy.shop/')}
                className="underline hover:text-white text-sky-400 inline-flex items-center space-x-0.5 ml-2 font-sans"
              >
                <span>Live Store ↗</span>
              </button>
            </div>

            {/* Zenzy Navbar */}
            <div className="sticky top-0 z-20 bg-stone-950/90 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <span className="text-xl font-black tracking-widest text-white uppercase italic">
                  ZENZY<span className="text-pink-500">.</span>
                </span>

                {/* Categories */}
                <div className="hidden md:flex items-center space-x-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  {['All', 'Hoodies', 'Tees', 'Cargos', 'Outerwear', 'Footwear'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`transition pb-0.5 ${
                        activeCategory === cat
                          ? 'text-white border-b-2 border-pink-500'
                          : 'hover:text-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions: Currency + Cart */}
              <div className="flex items-center space-x-3 text-xs">
                {/* Currency Switcher */}
                <div className="flex items-center bg-stone-900 border border-white/15 rounded-lg p-0.5 text-[11px]">
                  <button
                    onClick={() => setCurrency('INR')}
                    className={`px-2 py-0.5 rounded font-mono font-bold transition ${
                      currency === 'INR' ? 'bg-pink-600 text-white' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    INR ₹
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-2 py-0.5 rounded font-mono font-bold transition ${
                      currency === 'USD' ? 'bg-pink-600 text-white' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    USD $
                  </button>
                </div>

                {/* Cart Button */}
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/20 text-stone-200 shadow-sm transition"
                >
                  <ShoppingCart size={14} className="text-pink-400" />
                  <span className="font-semibold">Bag</span>
                  {totalCartCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {totalCartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Added to Bag Toast Notification */}
            {addedToast && (
              <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
                <Check size={14} />
                <span>Added to Bag: {addedToast}</span>
              </div>
            )}

            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 px-6 py-10 md:py-14 border-b border-white/5">
              <div className="max-w-4xl mx-auto text-center space-y-3">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-mono tracking-widest uppercase">
                  <Sparkles size={11} />
                  <span>Curated Streetwear // Season 2026</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                  Heavyweight Fabrics. Architectural Cuts.
                </h1>
                <p className="text-stone-400 text-xs md:text-sm max-w-xl mx-auto font-light">
                  Designed for those who understand modern aesthetics. Milled with premium organic French terry and raw washed finishes.
                </p>
                <div className="pt-2 flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setActiveCategory('Hoodies')}
                    className="px-5 py-2 rounded-xl bg-white text-stone-950 font-bold text-xs uppercase tracking-wider hover:bg-stone-200 transition shadow-lg"
                  >
                    Shop Hoodies
                  </button>
                  <button
                    onClick={() => openInExternal('https://www.zenzy.shop/')}
                    className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition inline-flex items-center space-x-1.5"
                  >
                    <span>Visit Live Store</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Catalog Grid */}
            <div className="max-w-6xl mx-auto w-full px-6 py-8 flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold uppercase tracking-wider text-white">
                  {activeCategory === 'All' ? 'All Collections' : activeCategory} ({filteredProducts.length})
                </h2>
                <span className="text-xs text-stone-500 font-mono">Free Worldwide Shipping on ₹3,999+</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-stone-900/60 rounded-2xl border border-white/10 hover:border-pink-500/40 p-4 transition duration-200 group flex flex-col justify-between shadow-xl"
                  >
                    <div>
                      {/* Visual Mockup Box */}
                      <div
                        className={`h-48 rounded-xl bg-gradient-to-tr ${prod.imageBg} border border-white/5 relative overflow-hidden flex flex-col justify-between p-3 mb-3.5`}
                      >
                        <span className="self-start text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/70 text-pink-400 border border-pink-500/30">
                          {prod.tag}
                        </span>

                        <div className="text-center my-auto">
                          <ShoppingBag size={48} className="mx-auto text-stone-400/50 group-hover:text-pink-400/80 transition-transform duration-300 group-hover:scale-110" />
                          <span className="text-[11px] font-mono text-stone-300 block mt-2 font-medium">
                            {prod.color}
                          </span>
                        </div>

                        <span className="self-end text-[10px] font-mono text-stone-400 bg-stone-950/80 px-2 py-0.5 rounded">
                          {prod.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-white group-hover:text-pink-300 transition">
                        {prod.name}
                      </h3>
                      <p className="text-stone-400 text-xs mt-1 line-clamp-2 font-light">
                        {prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-stone-500 block leading-none">Price</span>
                        <span className="font-mono font-bold text-base text-white">
                          {currency === 'INR' ? `₹${prod.priceInr.toLocaleString()}` : `$${prod.priceUsd}`}
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(prod)}
                        className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 transition active:scale-95"
                      >
                        <Plus size={13} />
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Drawer / Slide-out */}
            {isCartOpen && (
              <div className="fixed inset-y-0 right-0 w-80 bg-stone-900 border-l border-white/20 shadow-2xl z-50 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <ShoppingBag size={18} className="text-pink-400" />
                      <h3 className="font-bold text-sm text-white uppercase tracking-wider">Your Bag</h3>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="p-1 rounded-md hover:bg-white/10 text-stone-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="py-16 text-center text-stone-400 space-y-2">
                      <ShoppingBag size={36} className="mx-auto text-stone-600" />
                      <p className="text-xs">Your shopping bag is empty.</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="text-pink-400 text-xs font-semibold underline"
                      >
                        Browse Collections
                      </button>
                    </div>
                  ) : (
                    <div className="py-3 space-y-3 max-h-[60vh] overflow-y-auto">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-stone-950 p-2.5 rounded-xl border border-white/10 flex items-center justify-between text-xs"
                        >
                          <div className="truncate max-w-[170px]">
                            <div className="font-bold text-white truncate">{item.name}</div>
                            <div className="text-stone-400 font-mono text-[11px]">
                              {currency === 'INR' ? `₹${item.price.toLocaleString()}` : `$${item.price}`} × {item.qty}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-pink-400">
                            {currency === 'INR'
                              ? `₹${(item.price * item.qty).toLocaleString()}`
                              : `$${item.price * item.qty}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between font-mono text-sm">
                      <span className="text-stone-400">Subtotal:</span>
                      <span className="font-bold text-white">
                        {currency === 'INR' ? `₹${totalCartPrice.toLocaleString()}` : `$${totalCartPrice}`}
                      </span>
                    </div>

                    <button
                      onClick={() => openInExternal('https://www.zenzy.shop/')}
                      className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition"
                    >
                      <CreditCard size={14} />
                      <span>Checkout on Live Store ↗</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="bg-stone-950 border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 space-y-2 sm:space-y-0">
              <span className="font-mono">© 2026 ZENZY STUDIOS. All Rights Reserved.</span>
              <div className="flex items-center space-x-4">
                <button onClick={() => openInExternal('https://www.zenzy.shop/')} className="hover:text-pink-400 flex items-center space-x-1">
                  <span>Visit zenzy.shop</span>
                  <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </div>
        ) : isIshant && viewMode === 'auto' ? (
          /* 2. ISHANT UPADHYAY INTERACTIVE PORTFOLIO */
          <div className="min-h-full bg-[#0A0F1D] text-slate-100 font-sans p-6 md:p-12 flex flex-col justify-between">
            <div className="max-w-4xl mx-auto w-full space-y-8">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                    IU
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-white">Ishant Upadhyay</h2>
                    <span className="text-xs text-sky-400 font-mono">Systems Engineer & Creative Architect</span>
                  </div>
                </div>

                <button
                  onClick={() => openInExternal('https://ishantupadhyay.vercel.app/')}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow"
                >
                  <span>Open Live Portfolio</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              {/* Hero */}
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono">
                  <Sparkles size={11} />
                  <span>Interactive Developer Profile</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  Building Next-Gen Systems, Operating Systems & Digital Experiences.
                </h1>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl">
                  Specialized in full-stack architecture, distributed tooling, browser-based operating environments (IBP OS), and modern high-concurrency systems.
                </p>
              </div>

              {/* Tech Stack */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">Technical Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'TypeScript',
                    'React',
                    'Vite',
                    'Next.js',
                    'Python',
                    'Node.js',
                    'TailwindCSS',
                    'Zustand',
                    'VFS Architecture',
                    'Cloud Platforms',
                    'Modern Web APIs',
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects Grid */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">Featured Creations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 hover:border-sky-500/40 transition">
                    <h4 className="font-bold text-white text-base">IBP Operating System</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      A complete in-browser OS featuring Monaco code editor, native VFS, resizable multi-window desktop, offline packaging, and custom language runtimes.
                    </p>
                    <span className="inline-block mt-3 text-[11px] font-mono text-sky-400">Active Environment</span>
                  </div>

                  <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 hover:border-pink-500/40 transition">
                    <h4 className="font-bold text-white text-base">Zenzy Streetwear Brand</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      High-end luxury streetwear e-commerce platform featuring heavyweight fabrics, bespoke drops, and modern digital retail experience.
                    </p>
                    <button
                      onClick={() => navigateTo('https://www.zenzy.shop/')}
                      className="inline-flex items-center space-x-1 mt-3 text-[11px] font-mono text-pink-400 hover:underline"
                    >
                      <span>Explore Zenzy Store →</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="max-w-4xl mx-auto w-full pt-8 mt-8 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">ishantupadhyay.vercel.app</span>
              <button
                onClick={() => openInExternal('https://ishantupadhyay.vercel.app/')}
                className="text-sky-400 hover:underline flex items-center space-x-1"
              >
                <span>Launch Host Page</span>
                <ExternalLink size={10} />
              </button>
            </div>
          </div>
        ) : (
          /* 3. STANDARD BROWSER IFRAME WITH SMART FALLBACK BANNER */
          <div className="w-full h-full flex flex-col">
            {/* Embedded Sandbox Notice */}
            <div className="bg-slate-900/90 border-b border-white/10 px-3 py-1 flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center space-x-1.5 truncate">
                <Globe size={11} className="text-sky-400 shrink-0" />
                <span className="truncate">Navigated to: {currentUrl}</span>
              </span>
              <button
                onClick={() => openInExternal()}
                className="text-sky-400 hover:underline flex items-center space-x-1 shrink-0 font-medium ml-2"
              >
                <span>External site? Pop out ↗</span>
              </button>
            </div>

            {/* Sandboxed Iframe */}
            <iframe
              key={iframeKey}
              src={currentUrl}
              title="Browser Web View"
              onLoad={() => setIsLoading(false)}
              className="flex-1 w-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        )}
      </div>
    </div>
  );
};
