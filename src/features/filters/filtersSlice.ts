// src/features/filters/filtersSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SortOption = 'priceAsc' | 'priceDesc' | 'rating' | null;

interface FiltersState {
  search: string;
  category: string | null;
  sortBy: SortOption;
}

const initialState: FiltersState = {
  search: '',
  category: null,
  sortBy: null,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setCategory(state, action: PayloadAction<string | null>) {
      state.category = action.payload;
    },
    setSortBy(state, action: PayloadAction<SortOption>) {
      state.sortBy = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const { setSearch, setCategory, setSortBy, resetFilters } =
  filtersSlice.actions;

export default filtersSlice.reducer;