import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Desktop: collapsed / expanded
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Mobile: drawer open / closed (not persisted)
  mobileOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // ── Desktop ────────────────────────────────────────────────────────────
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // ── Mobile ─────────────────────────────────────────────────────────────
      mobileOpen: false,
      openMobileSidebar: () => set({ mobileOpen: true }),
      closeMobileSidebar: () => set({ mobileOpen: false }),
    }),
    {
      name: 'ui-storage',
      // Only persist desktop preference, never the mobile drawer state
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
