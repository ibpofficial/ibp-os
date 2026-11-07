import { create } from 'zustand';
import { defaultVFS, VFSNode } from '@ibp/vfs';

export interface OpenTab {
  path: string;
  name: string;
  content: string;
  isDirty: boolean;
}

interface VFSStore {
  isInitialized: boolean;
  activeFilePath: string | null;
  openTabs: OpenTab[];
  files: VFSNode[];

  init: () => Promise<void>;
  refreshFiles: () => Promise<void>;
  openFile: (path: string) => Promise<void>;
  closeTab: (path: string) => void;
  updateTabContent: (path: string, newContent: string) => void;
  saveActiveFile: () => Promise<void>;
  createFile: (path: string, initialContent?: string) => Promise<void>;
  createFolder: (path: string) => Promise<void>;
  deleteNode: (path: string) => Promise<void>;
  renameNode: (oldPath: string, newPath: string) => Promise<void>;
}

export const useVFSStore = create<VFSStore>((set, get) => ({
  isInitialized: false,
  activeFilePath: null,
  openTabs: [],
  files: [],

  init: async () => {
    if (get().isInitialized) return;
    await defaultVFS.init(true);
    const files = await defaultVFS.getAllFiles();
    set({ isInitialized: true, files });

    // Open default welcome.ibp
    const defaultWelcome = 'IBP://USERS/guest/projects/welcome.ibp';
    if (await defaultVFS.exists(defaultWelcome)) {
      await get().openFile(defaultWelcome);
    }
  },

  refreshFiles: async () => {
    const files = await defaultVFS.getAllFiles();
    set({ files });
  },

  openFile: async (path: string) => {
    const s = get();
    const existing = s.openTabs.find((t) => t.path === path);
    if (existing) {
      set({ activeFilePath: path });
      return;
    }

    try {
      const content = await defaultVFS.readFile(path);
      const name = defaultVFS.getBasename(path);
      const newTab: OpenTab = { path, name, content, isDirty: false };
      set((state) => ({
        openTabs: [...state.openTabs, newTab],
        activeFilePath: path,
      }));
    } catch (err) {
      console.error(`Failed to open file ${path}:`, err);
    }
  },

  closeTab: (path: string) => {
    set((state) => {
      const remaining = state.openTabs.filter((t) => t.path !== path);
      let nextActive = state.activeFilePath;
      if (state.activeFilePath === path) {
        nextActive = remaining.length > 0 ? remaining[remaining.length - 1].path : null;
      }
      return {
        openTabs: remaining,
        activeFilePath: nextActive,
      };
    });
  },

  updateTabContent: (path: string, newContent: string) => {
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.path === path ? { ...t, content: newContent, isDirty: true } : t
      ),
    }));
  },

  saveActiveFile: async () => {
    const { activeFilePath, openTabs } = get();
    if (!activeFilePath) return;
    const tab = openTabs.find((t) => t.path === activeFilePath);
    if (!tab) return;

    await defaultVFS.writeFile(tab.path, tab.content);
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.path === tab.path ? { ...t, isDirty: false } : t
      ),
    }));
    await get().refreshFiles();
  },

  createFile: async (path: string, initialContent = '') => {
    await defaultVFS.writeFile(path, initialContent);
    await get().refreshFiles();
    await get().openFile(path);
  },

  createFolder: async (path: string) => {
    await defaultVFS.createFolder(path);
    await get().refreshFiles();
  },

  deleteNode: async (path: string) => {
    await defaultVFS.deleteFile(path);
    get().closeTab(path);
    await get().refreshFiles();
  },

  renameNode: async (oldPath: string, newPath: string) => {
    await defaultVFS.rename(oldPath, newPath);
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.path === oldPath
          ? { ...t, path: newPath, name: defaultVFS.getBasename(newPath) }
          : t
      ),
      activeFilePath: state.activeFilePath === oldPath ? newPath : state.activeFilePath,
    }));
    await get().refreshFiles();
  },
}));
