import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import taskIdReducer from './slices/taskIdSlice';
import queryFiltersReducer from './slices/queryFilters';
import searchParamsReducer from './slices/searchParamsSlice';
import profilePageReducer from './slices/profilePageSlice';
import editsReudcer from './slices/editsSlice';

const taskIdConfig = {
  key: 'task-id',
  storage,
  whitelist: ['taskId'],
};

const persistedTaskIdReducer = persistReducer(taskIdConfig, taskIdReducer);

export const store = configureStore({
  reducer: {
    taskId: persistedTaskIdReducer,
    queryFilters: queryFiltersReducer,
    searchParams: searchParamsReducer,
    profilePage: profilePageReducer,
    edits: editsReudcer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: true,
});

export type IRootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default persistStore(store);
