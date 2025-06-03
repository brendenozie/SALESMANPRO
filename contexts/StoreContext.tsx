// contexts/StoreContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { StoreForm } from '../types/typings';

const StoreContext = createContext<StoreForm | null>(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

export const StoreContextProvider = ({
  children,
  initialStore,
}: {
  children: React.ReactNode;
  initialStore: StoreForm;
}) => {
  return (
    <StoreContext.Provider value={initialStore}>
      {children}
    </StoreContext.Provider>
  );
};
