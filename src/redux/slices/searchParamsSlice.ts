import { createSlice } from '@reduxjs/toolkit';

const initialState: string = '';

export const searchParamsSlice = createSlice({
  name: 'searchParams',
  initialState,
  reducers: {
    changeSearchParams: (_, action) => {
      return action?.payload;
    },
  },
});

export const { changeSearchParams } = searchParamsSlice.actions;

export default searchParamsSlice.reducer;
