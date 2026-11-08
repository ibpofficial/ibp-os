import { describe, it, expect, beforeEach } from 'vitest';
import { useDesktopStore } from '../src/stores/desktopStore';

describe('Desktop Store & Window Manager', () => {
  beforeEach(() => {
    useDesktopStore.setState({
      windows: [],
      activeWindowId: null,
      topZIndex: 10,
      isBooted: false,
      isStartMenuOpen: false,
      isCommandPaletteOpen: false,
    });
  });

  it('handles boot sequence state', () => {
    const store = useDesktopStore.getState();
    expect(store.isBooted).toBe(false);

    store.setBooted(true);
    expect(useDesktopStore.getState().isBooted).toBe(true);
  });

  it('opens and manages windows with proper z-indexing', () => {
    const store = useDesktopStore.getState();
    const studioId = store.openWindow('studio');

    let state = useDesktopStore.getState();
    expect(state.windows).toHaveLength(1);
    expect(state.activeWindowId).toBe(studioId);
    expect(state.windows[0].title).toBe('IBP Studio');

    const terminalId = store.openWindow('terminal');
    state = useDesktopStore.getState();
    expect(state.windows).toHaveLength(2);
    expect(state.activeWindowId).toBe(terminalId);
    expect(state.windows[1].zIndex).toBeGreaterThan(state.windows[0].zIndex);
  });

  it('minimizes, maximizes and closes windows', () => {
    const store = useDesktopStore.getState();
    const winId = store.openWindow('explorer');

    // Windows open maximized by default for full-screen immersive OS experience
    expect(useDesktopStore.getState().windows[0].isMaximized).toBe(true);

    store.minimizeWindow(winId);
    expect(useDesktopStore.getState().windows[0].isMinimized).toBe(true);

    store.focusWindow(winId);
    expect(useDesktopStore.getState().windows[0].isMinimized).toBe(false);

    // Toggling maximize restores window to floating size
    store.maximizeWindow(winId);
    expect(useDesktopStore.getState().windows[0].isMaximized).toBe(false);

    // Toggling again maximizes back to full screen
    store.maximizeWindow(winId);
    expect(useDesktopStore.getState().windows[0].isMaximized).toBe(true);

    store.closeWindow(winId);
    expect(useDesktopStore.getState().windows).toHaveLength(0);
  });
});

