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
import { StoreForm } from '../types/typings'; // Ensure StoreForm is correctly imported

//
// 1. Define the shape of what our context will provide.
//
interface StoreContextType {
  // The full StoreForm fetched from Prisma → passed in from StoreLayout
  storeFormData: StoreForm | null;

  // The ID of the service the user clicked “Learn More” on.
  // Components can read this if they need to prefill a contact form, etc.
  inquiryServiceId: string | number | null;

  // Setter so that any child can call setInquiryServiceId(...)
  setInquiryServiceId: Dispatch<SetStateAction<string | number | null>>;

  // Add the userRole to the context type
  userRole: string;
  
  userId: string;
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
//    and `userRole`, then sets up local state for inquiryServiceId so that children can read/set it.
//
interface StoreContextProviderProps {
  children: ReactNode;
  initialStore: StoreForm | null; // The initial store data, can be null if not available
  userRole: string; // New prop for the user's role
  userId: string; // New prop for the user's ID
}

export function StoreContextProvider({
  children,
  initialStore,
  userRole, // Destructure userRole from props
  userId, // New prop for the user's ID
}: StoreContextProviderProps) {
  // Local piece of state to track which service the user last clicked “Learn More” on.
  const [inquiryServiceId, setInquiryServiceId] = useState<string | number | null>(null);

  // Build the object we’ll hand out via context
  const value: StoreContextType = {
    storeFormData: initialStore,
    inquiryServiceId,
    setInquiryServiceId,
    userRole, // Include userRole in the context value
    userId
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}