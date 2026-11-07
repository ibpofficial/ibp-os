import { create } from 'zustand';
import { AppId, WindowState } from '../types/desktop';

export const APP_REGISTRY: Record<AppId, { title: string; icon: string; defaultWidth: number; defaultHeight: number }> = {
  studio: { title: 'IBP Studio', icon: 'Code', defaultWidth: 1050, defaultHeight: 680 },
  terminal: { title: 'Terminal', icon: 'Terminal', defaultWidth: 720, defaultHeight: 460 },
  explorer: { title: 'File Explorer', icon: 'Folder', defaultWidth: 800, defaultHeight: 520 },
  monitor: { title: 'System Monitor', icon: 'Activity', defaultWidth: 640, defaultHeight: 440 },
  handbook: { title: 'IBP Handbook', icon: 'BookOpen', defaultWidth: 880, defaultHeight: 600 },
  playground: { title: 'Playground', icon: 'Trophy', defaultWidth: 1000, defaultHeight: 650 },
  settings: { title: 'Settings', icon: 'Settings', defaultWidth: 600, defaultHeight: 450 },
};

interface DesktopStore {
  isBooted: boolean;
  currentUser: string;
  theme: 'dark' | 'light';
  windows: WindowState[];
  activeWindowId: string | null;
  topZIndex: number;
  isStartMenuOpen: boolean;
  isCommandPaletteOpen: boolean;
  onboardingStep: number; // 0 = off, 1..4 = active steps

  setBooted: (val: boolean) => void;
  setUser: (user: string) => void;
  toggleTheme: () => void;
  toggleStartMenu: () => void;
  setStartMenu: (val: boolean) => void;
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
  isBooted: false,
  currentUser: 'guest',
  theme: 'dark',
  windows: [],
  activeWindowId: null,
  topZIndex: 10,
  isStartMenuOpen: false,
  isCommandPaletteOpen: false,
  onboardingStep: 0,

  setBooted: (val) => set({ isBooted: val }),
  setUser: (user) => set({ currentUser: user }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  toggleStartMenu: () => set((s) => ({ isStartMenuOpen: !s.isStartMenuOpen })),
  setStartMenu: (val) => set({ isStartMenuOpen: val }),
  setCommandPalette: (val) => set({ isCommandPaletteOpen: val }),
  setOnboardingStep: (step) => set({ onboardingStep: step }),

  openWindow: (appId, params) => {
    const s = get();
    // Check if single-instance app is already open
    const existing = s.windows.find((w) => w.appId === appId);
    if (existing) {
      if (existing.isMinimized) {
        set((state) => ({
          windows: state.windows.map((w) => (w.id === existing.id ? { ...w, isMinimized: false } : w)),
        }));
      }
      get().focusWindow(existing.id);
      return existing.id;
    }

    const def = APP_REGISTRY[appId];
    const newZ = s.topZIndex + 1;
    const windowCount = s.windows.length;
    const offsetX = 50 + (windowCount % 8) * 28;
    const offsetY = 50 + (windowCount % 8) * 28;

    const newWindow: WindowState = {
      id: `${appId}-${Date.now()}`,
      appId,
      title: def.title,
      icon: def.icon,
      isMinimized: false,
      isMaximized: false,
      zIndex: newZ,
      x: offsetX,
      y: offsetY,
      width: def.defaultWidth,
      height: def.defaultHeight,
      params,
    };

    set((state) => ({
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
      topZIndex: newZ,
      isStartMenuOpen: false,
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
      windows: state.windows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)),
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
