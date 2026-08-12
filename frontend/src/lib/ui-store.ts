import { create } from 'zustand';

export type BoardViewType = 'kanban' | 'calendar' | 'table' | 'analytics';

interface UIState {
  activeCardId: string | null;
  activeView: BoardViewType;
  isCommandPaletteOpen: boolean;
  isSidebarCollapsed: boolean;
  isCreateBoardOpen: boolean;
  isFilterOpen: boolean;
  isAiModalOpen: boolean;

  setActiveCardId: (id: string | null) => void;
  setActiveView: (view: BoardViewType) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCreateBoardOpen: (open: boolean) => void;
  setFilterOpen: (open: boolean) => void;
  setAiModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeCardId: null,
  activeView: 'kanban',
  isCommandPaletteOpen: false,
  isSidebarCollapsed: false,
  isCreateBoardOpen: false,
  isFilterOpen: false,
  isAiModalOpen: false,

  setActiveCardId: (id) => set({ activeCardId: id }),
  setActiveView: (view) => set({ activeView: view }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setCreateBoardOpen: (open) => set({ isCreateBoardOpen: open }),
  setFilterOpen: (open) => set({ isFilterOpen: open }),
  setAiModalOpen: (open) => set({ isAiModalOpen: open }),
}));
