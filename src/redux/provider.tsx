'use client';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import persistor, { store } from './store';

export default function StoreProvider({ children }: any) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
