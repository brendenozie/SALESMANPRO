// File: contexts/StoreContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { StoreForm } from '../types/typings'; // Ensure StoreForm is correctly imported
import { buildTenantUrl } from '@/lib/tenant/tenant-router';

//
// 1. Define the shape of what our context will provide.
//
interface StoreContextType {
  // The full StoreForm fetched from Prisma → passed in from StoreLayout
  storeFormData: StoreForm | null;

  // Setter so that pages/children can enrich or update storeFormData
  setStoreFormData: Dispatch<SetStateAction<StoreForm | null>>;

  // The ID of the service the user clicked “Learn More” on.
  // Components can read this if they need to prefill a contact form, etc.
  inquiryServiceId: string | number | null;

  // Setter so that any child can call setInquiryServiceId(...)
  setInquiryServiceId: Dispatch<SetStateAction<string | number | null>>;

  // Add the userRole to the context type
  userRole: string;
  
  userId: string;

  // Tenant-aware URL builder
  buildUrl: (path: string, query?: Record<string, any> | string) => string;

  // Non-destructive component overrides
  componentOverrides?: Record<string, any>;
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
//    and `userRole`, then sets up local state for storeFormData & inquiryServiceId.
//
interface StoreContextProviderProps {
  children: ReactNode;
  initialStore: StoreForm | null; // The initial store data, can be null if not available
  userRole: string; // New prop for the user's role
  userId: string; // New prop for the user's ID
  componentOverrides?: Record<string, any>;
}

export function StoreContextProvider({
  children,
  initialStore,
  userRole, // Destructure userRole from props
  userId, // New prop for the user's ID
  componentOverrides = {},
}: StoreContextProviderProps) {
  const [storeFormData, setStoreFormData] = useState<StoreForm | null>(initialStore);
  const [inquiryServiceId, setInquiryServiceId] = useState<string | number | null>(null);
  const prevInitialKey = useRef<string | null>(null);

  useEffect(() => {
    if (initialStore) {
      const currentKey = `${initialStore.id || ''}:${initialStore.slug || ''}:${(initialStore as any).updatedAt || ''}`;
      if (prevInitialKey.current === currentKey) return;
      prevInitialKey.current = currentKey;
      setStoreFormData((prev) => (prev ? { ...prev, ...initialStore } : initialStore));
    }
  }, [initialStore]);

  const buildUrl = useMemo(() => {
    const slug = storeFormData?.slug || 'store';
    return (path: string, query?: Record<string, any> | string) =>
      buildTenantUrl({ slug, path, query });
  }, [storeFormData?.slug]);

  // Memoize context value to prevent unnecessary re-rendering across storefront tree
  const value = useMemo<StoreContextType>(
    () => ({
      storeFormData,
      setStoreFormData,
      inquiryServiceId,
      setInquiryServiceId,
      userRole,
      userId,
      buildUrl,
      componentOverrides,
    }),
    [storeFormData, inquiryServiceId, userRole, userId, buildUrl, componentOverrides],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/**
 * ⚡ StoreDataSync Helper
 * Allows Server-Rendered pages (like page.tsx) to seamlessly enrich StoreContext
 * with deep page data without forcing client waterfalls or unnecessary re-renders.
 */
export function StoreDataSync({ data }: { data: StoreForm | null }) {
  const { setStoreFormData } = useStoreContext();
  const prevSyncKey = useRef<string | null>(null);

  useEffect(() => {
    if (data) {
      const currentKey = `${data.id || ''}:${data.slug || ''}:${(data as any).updatedAt || ''}`;
      if (prevSyncKey.current === currentKey) return;
      prevSyncKey.current = currentKey;
      setStoreFormData((prev) => (prev ? { ...prev, ...data } : data));
    }
  }, [data, setStoreFormData]);

  return null;
}