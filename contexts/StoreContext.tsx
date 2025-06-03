// File: contexts/StoreContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { StoreForm } from '../types/typings';

//
// 1. Define the shape of what our context will provide.
//
interface StoreContextType {
  // The full StoreForm fetched from Prisma → passed in from StoreLayout
  storeFormData: StoreForm;

  // The ID of the service the user clicked “Learn More” on.
  // Components can read this if they need to prefill a contact form, etc.
  inquiryServiceId: string | number | null;

  // Setter so that any child can call setInquiryServiceId(...)
  setInquiryServiceId: Dispatch<SetStateAction<string | number | null>>;
}

//
// 2. Create a context with that type. We start it as null, and will throw
//    if someone tries to use it outside of a Provider.
//
const StoreContext = createContext<StoreContextType | null>(null);

//
// 3. A “safe” hook to read our context value.
//
export function useStoreContext(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreContextProvider');
  }
  return context;
}

//
// 4. (Optional) If you prefer a “useStore” alias, you can keep it too.
//
export const useStore = useStoreContext;

//
// 5. The Provider component. It expects the `initialStore` (a StoreForm object)
//    and then sets up local state for inquiryServiceId so that children can read/set it.
//
export function StoreContextProvider({
  children,
  initialStore,
}: {
  children: ReactNode;
  initialStore: StoreForm;
}) {
  // Local piece of state to track which service the user last clicked “Learn More” on.
  const [inquiryServiceId, setInquiryServiceId] = useState<string | number | null>(null);

  // Build the object we’ll hand out via context
  const value: StoreContextType = {
    storeFormData: initialStore,
    inquiryServiceId,
    setInquiryServiceId,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
