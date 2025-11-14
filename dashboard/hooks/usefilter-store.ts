// hooks/use-filter-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SortOrder = 'asc' | 'desc';

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface FilterState {
  search: string;
  sortOrder: SortOrder;
  dateRange?: DateRange;
  customFilters: Record<string, any>;
}

interface FilterStore extends FilterState {
  setSearch: (search: string) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setDateRange: (dateRange: DateRange) => void;
  setCustomFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
  setNamespace: (namespace: string) => void;
  currentNamespace: string;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      // Initial state
      search: '',
      sortOrder: 'asc',
      dateRange: undefined,
      customFilters: {},
      currentNamespace: 'global',
      
      // Actions
      setSearch: (search: string) => set({ search }),
      
      setSortOrder: (sortOrder: SortOrder) => set({ sortOrder }),
      
      setDateRange: (dateRange: DateRange) => set({ dateRange }),
      
      setCustomFilters: (customFilters: Record<string, any>) => 
        set({ customFilters }),
      
      clearFilters: () => set({ 
        search: '', 
        sortOrder: 'asc',
        dateRange: undefined,
        customFilters: {}
      }),
      
      setNamespace: (namespace: string) => {
        set({ currentNamespace: namespace });
      },
    }),
    {
      name: 'filter-store',
      partialize: (state) => ({
        sortOrder: state.sortOrder,
      }),
    }
  )
);