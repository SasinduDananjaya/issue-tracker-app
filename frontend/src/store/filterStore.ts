import { create } from "zustand";
import type { IssueFilters } from "@/types";

type ViewMode = "kanban" | "list";

interface FilterState {
  filters: IssueFilters;
  viewMode: ViewMode;
  setFilter: (partial: Partial<IssueFilters>) => void;
  resetFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
}

const defaultFilters: IssueFilters = {};

//zustand store for issue filters and view mode - kanban or list
export const useFilterStore = create<FilterState>((set) => ({
  filters: defaultFilters,
  viewMode: "kanban",
  setFilter: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setViewMode: (viewMode) => set({ viewMode }),
}));

export const activeFilterCount = (filters: IssueFilters): number => Object.values(filters).filter((v) => v !== undefined && v !== "").length;
