import { create } from 'zustand';
import { AppId, WindowState } from '../types/desktop';

export const APP_REGISTRY: Record<AppId, { title: string; icon: string; defaultWidth: number; defaultHeight: number }> = {
  studio: { title: 'IBP Studio', icon: 'Code', defaultWidth: 1050, defaultHeight: 680 },
  terminal: { title: 'Terminal', icon: 'Terminal', defaultWidth: 720, defaultHeight: 460 },
  explorer: { title: 'File Explorer', icon: 'Folder', defaultWidth: 800, defaultHeight: 520 },
  monitor: { title: 'System Monitor', icon: 'Activity', defaultWidth: 640, defaultHeight: 440 },
  handbook: { title: 'Learn IBP (Handbook & PDF)', icon: 'BookOpen', defaultWidth: 960, defaultHeight: 640 },
  playground: { title: 'Playground', icon: 'Trophy', defaultWidth: 1000, defaultHeight: 650 },
  settings: { title: 'Settings', icon: 'Settings', defaultWidth: 600, defaultHeight: 450 },
  langcraft: { title: 'LangCraft (Language Designer)', icon: 'Wand2', defaultWidth: 980, defaultHeight: 640 },
  browser: { title: 'Chrome', icon: 'Globe', defaultWidth: 1060, defaultHeight: 680 },
  games: { title: 'Arcade Games', icon: 'Gamepad2', defaultWidth: 1050, defaultHeight: 680 },
};

interface DesktopStore {
  isBooted: boolean;
  currentUser: string;
  theme: 'dark' | 'light';
  windows: WindowState[];
  activeWindowId: string | null;
  topZIndex: number;
  isStartMenuOpen: boolean;
  isControlCenterOpen: boolean;
  isCommandPaletteOpen: boolean;
  onboardingStep: number; // 0 = off, 1..4 = active steps

  setBooted: (val: boolean) => void;
  setUser: (user: string) => void;
  toggleTheme: () => void;
  toggleStartMenu: () => void;
  setStartMenu: (val: boolean) => void;
  toggleControlCenter: () => void;
  setControlCenter: (val: boolean) => void;
  setCommandPalette: (val: boolean) => void;
  setOnboardingStep: (step: number) => void;

  openWindow: (appId: AppId, params?: Record<string, any>) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowBounds: (id: string, bounds: Partial<{ x: number; y: number; width: number; height: number }>) => void;
}

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  isBooted: true,
  currentUser: 'guest',
  theme: 'dark',
  windows: [],
  activeWindowId: null,
  topZIndex: 10,
  isStartMenuOpen: false,
  isControlCenterOpen: false,
  isCommandPaletteOpen: false,
  onboardingStep: 0,

  setBooted: (val) => set({ isBooted: val }),
  setUser: (user) => set({ currentUser: user }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  toggleStartMenu: () => set((s) => ({ isStartMenuOpen: !s.isStartMenuOpen, isControlCenterOpen: false })),
  setStartMenu: (val) => set({ isStartMenuOpen: val }),
  toggleControlCenter: () => set((s) => ({ isControlCenterOpen: !s.isControlCenterOpen, isStartMenuOpen: false })),
  setControlCenter: (val) => set({ isControlCenterOpen: val }),
  setCommandPalette: (val) => set({ isCommandPaletteOpen: val }),
  setOnboardingStep: (step) => set({ onboardingStep: step }),

  openWindow: (appId, params) => {
    const s = get();
    // Check if single-instance app is already open
    const existing = s.windows.find((w) => w.appId === appId);
    if (existing) {
      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === existing.id
            ? {
                ...w,
                isMinimized: false,
                isMaximized: w.isMaximized,
                ...(params ? { params: { ...w.params, ...params }, title: params.title || w.title } : {}),
              }
            : w
        ),
      }));
      get().focusWindow(existing.id);
      return existing.id;
    }

    const def = APP_REGISTRY[appId] || {
      title: 'App',
      icon: 'Square',
      defaultWidth: 1050,
      defaultHeight: 680,
    };
    const newZ = s.topZIndex + 1;
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;

    const floatW = Math.min(def.defaultWidth || 1040, Math.max(760, screenW - 160));
    const floatH = Math.min(def.defaultHeight || 660, Math.max(480, screenH - 150));
    const floatX = Math.max(24, Math.round((screenW - floatW) / 2));
    const floatY = Math.max(24, Math.round((screenH - floatH) / 2) - 20);

    const newWindow: WindowState = {
      id: `${appId}-${Date.now()}`,
      appId,
      title: params?.title || def.title,
      icon: def.icon,
      isMinimized: false,
      isMaximized: true, // ALL WINDOWS OPEN IN FULL SCREEN MODE
      zIndex: newZ,
      x: floatX,
      y: floatY,
      width: floatW,
      height: floatH,
      params,
    };

    set((state) => ({
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
      topZIndex: newZ,
      isStartMenuOpen: false,
      isControlCenterOpen: false,
    }));

    return newWindow.id;
  },

  closeWindow: (id) => {
    set((state) => {
      const remaining = state.windows.filter((w) => w.id !== id);
      const nextActive = remaining.length > 0 ? remaining[remaining.length - 1].id : null;
      return {
        windows: remaining,
        activeWindowId: nextActive,
      };
    });
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    }));
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w;
        const willMaximize = !w.isMaximized;
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 1280;
        const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;
        const def = APP_REGISTRY[w.appId] || { defaultWidth: 1040, defaultHeight: 660 };
        const floatW = Math.min(def.defaultWidth || 1040, Math.max(760, screenW - 160));
        const floatH = Math.min(def.defaultHeight || 660, Math.max(480, screenH - 150));
        const floatX = Math.max(24, Math.round((screenW - floatW) / 2));
        const floatY = Math.max(24, Math.round((screenH - floatH) / 2) - 20);

        return {
          ...w,
          isMaximized: willMaximize,
          // When restoring (un-maximizing), ensure it has a centered floating smaller frame
          ...(!willMaximize && (w.width >= screenW || w.x <= 0)
            ? { x: floatX, y: floatY, width: floatW, height: floatH }
            : {}),
        };
      }),
    }));
  },

  focusWindow: (id) => {
    const s = get();
    const newZ = s.topZIndex + 1;
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w)),
      activeWindowId: id,
      topZIndex: newZ,
      isStartMenuOpen: false,
    }));
  },

  updateWindowBounds: (id, bounds) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, ...bounds } : w)),
    }));
  },
}));

