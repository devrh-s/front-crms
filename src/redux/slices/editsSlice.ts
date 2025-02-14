import { createSlice } from '@reduxjs/toolkit';

interface IEditData {
  entityBlockId?: number | null;
  countEdits?: number;
  progressableId?: number | null;
  progressableType?: string;
}

interface IEditState extends IEditData {
  addModalOpen: boolean;
}

const initialState: IEditState = {
  addModalOpen: false,
  entityBlockId: null,
  progressableId: null,
  progressableType: '',
  countEdits: 0,
};

export const editsSlice = createSlice({
  name: 'edits',
  initialState,
  reducers: {
    openAddModal: (state) => {
      state.addModalOpen = true;
    },
    closeAddModal: (state) => {
      state.addModalOpen = false;
    },
    setEditsData: (state, action: { type: string; payload: IEditData }) => {
      const { entityBlockId, progressableType, countEdits, progressableId } = action.payload;
      state.entityBlockId = entityBlockId;
      state.countEdits = countEdits;
      state.progressableType = progressableType;
      state.progressableId = progressableId;
    },
    clearEdits: () => initialState,
  },
});

export const { openAddModal, closeAddModal, setEditsData, clearEdits } = editsSlice.actions;

export default editsSlice.reducer;
