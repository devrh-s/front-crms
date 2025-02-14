import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { getPermissionNames } from '@/lib/helpers';

type LoginBase = {
  token: string;
  isAdmin: boolean;
  permissions: Array<IPermission>;
};

type State = {
  permissionNames: Array<string> | null;
  token: string | null;
  isAdmin: boolean;
  permissions: Array<IPermission> | null;
  loading: boolean;
  isAuthorized: boolean;
  error: string | null;
};

type Actions = {
  login: (base: LoginBase) => void;
  setError: (error: string) => void;
  setToken: (token: string) => void;
  setPermissions: (permissions: Array<IPermission>) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};

const initialState: State = {
  token: null,
  loading: false,
  error: null,
  isAdmin: false,
  isAuthorized: false,
  permissions: null,
  permissionNames: null,
};

export const useAuthStore = create<State & Actions>()(
  persist(
    immer((set) => ({
      ...initialState,
      setToken: (token: string) =>
        set((state) => {
          state.token = token;
        }),
      setError: (error: string) =>
        set((state) => {
          state.error = error;
          state.loading = false;
        }),
      setPermissions: (permissions: Array<IPermission>) =>
        set((state) => {
          state.permissions = permissions;
          state.permissionNames = Array.from(new Set(getPermissionNames(permissions)));
        }),
      setLoading: (loading: boolean) =>
        set((state) => {
          state.loading = loading;
        }),
      login: (base: LoginBase) =>
        set((state) => {
          const { token, isAdmin, permissions } = base;
          state.token = token;
          state.isAdmin = isAdmin;
          state.permissions = permissions;
          state.isAuthorized = true;
          state.loading = false;
          state.permissionNames = Array.from(new Set(getPermissionNames(permissions)));
        }),
      logout: () => set(initialState),
    })),
    {
      name: 'crms-auth',
      partialize: (state) => ({
        token: state.token,
        isAdmin: state.isAdmin,
        permissions: state.permissions,
        permissionNames: state.permissionNames,
      }),
      onRehydrateStorage: () => {
        return (_: any, error) => {
          if (error) {
            console.log('an error happened during hydration', error);
          }
        };
      },
    }
  )
);
