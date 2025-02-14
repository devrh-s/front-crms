import { createSlice } from '@reduxjs/toolkit';

interface IQueryFilters {
  [page: string]: {
    name: string;
    value: any;
  };
}

const initialState: IQueryFilters = {};

export const queryFiltersSlice = createSlice({
  name: 'queryFilters',
  initialState,
  reducers: {
    addQueryFilters: (state, action) => {
      const { page, name, value } = action?.payload;
      state[page] = {
        name,
        value,
      };
    },
    clearQueryFilters: (state) => (state = {}),
  },
});

export const { addQueryFilters, clearQueryFilters } = queryFiltersSlice.actions;

export default queryFiltersSlice.reducer;
