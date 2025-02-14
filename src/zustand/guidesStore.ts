import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type State = {
  entityBlockId?: number | null;
  progressableId?: number | null;
  progressableType?: string;
};

type Actions = {
  setGuidesData: (data: State) => void;
  clearGuidesData: () => void;
};

const initialState: State = {
  entityBlockId: null,
  progressableId: null,
  progressableType: '',
};

export const useGuidesStore = create<State & Actions>()(
  persist(
    immer((set) => ({
      ...initialState,
      setGuidesData: (data: State) =>
        set((state) => {
          const { entityBlockId, progressableType, progressableId } = data;
          state.entityBlockId = entityBlockId;
          state.progressableType = progressableType;
          state.progressableId = progressableId;
        }),
      clearGuidesData: () => set(initialState),
    })),
    {
      name: 'crms-guides',
      partialize: (state) => ({
        entityBlockId: state.entityBlockId,
        progressableId: state.progressableId,
        progressableType: state.progressableType,
      }),
    }
  )
);
