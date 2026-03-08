import { create } from "zustand"

interface UIState {
  isSidebarOpen: boolean
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  toggleSearch: () => void
  setSearchOpen: (open: boolean) => void
}

type UIStore = UIState & UIActions

const initialState: UIState = {
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  isSearchOpen: false,
}

export const useUIStore = create<UIStore>()((set) => ({
  ...initialState,

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (open) =>
    set({ isSidebarOpen: open }),

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  setMobileMenuOpen: (open) =>
    set({ isMobileMenuOpen: open }),

  toggleSearch: () =>
    set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  setSearchOpen: (open) =>
    set({ isSearchOpen: open }),
}))

export default useUIStore
