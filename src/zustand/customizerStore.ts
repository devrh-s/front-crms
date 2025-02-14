import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type State = {
  sidebar: {
    width: number;
  };
};

type Actions = {
  changeSidebarWidth: (width: number) => void;
};

const initialState: State = {
  sidebar: {
    width: 286,
  },
};

export const useCustomizerStore = create<State & Actions>()(
  immer((set) => ({
    ...initialState,
    changeSidebarWidth: (width: number) =>
      set((state) => {
        state.sidebar.width = width;
      }),
  }))
);
