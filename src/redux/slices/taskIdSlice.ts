import { createSlice } from '@reduxjs/toolkit';

export const taskIdSlice = createSlice({
  name: 'id',
  initialState: {
    taskId: null,
  },
  reducers: {
    setTaskId: (state, action) => {
      state.taskId = action.payload;
    },
    clearTaskId: (state) => {
      state.taskId = null;
    },
  },
});

export const { setTaskId, clearTaskId } = taskIdSlice.actions;

export default taskIdSlice.reducer;
