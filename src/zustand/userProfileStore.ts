import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type State = {
  user: IUser | null;
  entityBlockId: number | null;
};

type Actions = {
  setUserProfile: (user: IUser) => void;
  setEntityBlockId: (entityBlockId: number) => void;
  clearUserProfile: () => void;
};

const initialState: State = {
  user: null,
  entityBlockId: null,
};

export const useUserProfileStore = create<State & Actions>()(
  persist(
    immer((set) => ({
      ...initialState,
      setUserProfile: (user: IUser) =>
        set((state) => {
          state.user = user;
        }),
      setEntityBlockId: (entityBlockId: number) =>
        set((state) => {
          state.entityBlockId = entityBlockId;
        }),
      clearUserProfile: () => set(initialState),
    })),
    {
      name: 'crms-user',
      partialize: (state) => ({
        user: state?.user?.id ?? null,
      }),
    }
  )
);
