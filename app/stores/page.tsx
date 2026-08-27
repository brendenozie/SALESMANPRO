'use client';

import React, { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR, { mutate } from 'swr';
import {
  BuildingStorefrontIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

// Assuming these are imported from your components directory
import PricingSection from './PricingSection';
import StoreCard from '@/components/stores/StoreCard';

// --- Fetcher Definition ---
const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Network response was not ok');
  const resJson = await res.json();
  return resJson.data;
};

// --- Store Interface ---
interface Store {
  id: string;
  name: string;
  slug: string;
  domain: string;
  companyId: string;
  subscriptionStatus: string;
  description?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  category?: string;
}

// ------------------------------------------------------------------
// --- 1. REUSABLE SUB-COMPONENTS ---
// ------------------------------------------------------------------

const ConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  isProcessing 
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void;
  isProcessing: boolean;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative p-6 bg-white dark:bg-slate-900 w-full max-w-sm shadow-2xl rounded-2xl text-center border border-slate-100 dark:border-slate-800"
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/30 mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-rose-600 dark:text-rose-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
        <div className="mt-6 flex justify-center space-x-3">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-semibold text-white shadow-md shadow-rose-600/10 text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6 overflow-hidden">
    <div className="w-full h-36 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4 animate-pulse" />
    <div className="space-y-3 flex-1">
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 animate-pulse" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6 animate-pulse" />
    </div>
    <div className="flex justify-end mt-6 space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800/40">
      <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
      <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
    </div>
  </div>
);

const EmptyState = ({ title, message, buttonText, onButtonClick }: { title: string; message: string; buttonText: string; onButtonClick: () => void; }) => (
  <div className="text-center py-20 px-4 max-w-md mx-auto col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center">
    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-2xl mb-4">
      <BuildingStorefrontIcon className="h-12 w-12" />
    </div>
    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
    <button 
      type="button" 
      onClick={onButtonClick} 
      className="mt-6 inline-flex items-center px-5 py-3 font-bold rounded-xl text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-500/10 active:scale-98 transition-all duration-200 text-sm"
    >
      <PlusIcon className="-ml-1 mr-2 h-4 w-4 stroke-[2.5]" aria-hidden="true" />
      {buttonText}
    </button>
  </div>
);
    
const PaginationControls = ({ page, totalPages, onPageChange } : {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}) => (
  <div className="mt-16 flex justify-center items-center gap-2">
    <button
      onClick={() => onPageChange(page - 1)}
      disabled={page <= 1}
      className="p-2.5 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
    >
      <ArrowLeftIcon className="h-4 w-4 stroke-[2.5]" />
    </button>
    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      Page {page} <span className="text-slate-400 font-normal">/</span> {totalPages}
    </span>
    <button
      onClick={() => onPageChange(page + 1)}
      disabled={page >= totalPages}
      className="p-2.5 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
    >
      <ArrowRightIcon className="h-4 w-4 stroke-[2.5]" />
    </button>
  </div>
);

// ------------------------------------------------------------------
// --- 2. PRICING MODAL CONTAINER ---
// ------------------------------------------------------------------

const PricingModal = ({ isOpen, onClose, companyId, email, category, onSubscriptionSuccess }: { 
  isOpen: boolean, 
  onClose: () => void, 
  companyId: string | null,
  email: string,
  category: string,
  onSubscriptionSuccess: () => void
}) => {
  return (
    <AnimatePresence>
      {isOpen && companyId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md overflow-y-auto h-full w-full flex justify-center z-40 p-3 sm:p-6"
        >
          <motion.div
            initial={{ y: "30px", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "30px", opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative bg-slate-50 dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-7xl my-auto border border-slate-200 dark:border-slate-800"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-50 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
            >
              <XMarkIcon className="h-5 w-5 stroke-[2.5]" />
            </button>
            <div className="overflow-y-auto h-full max-h-[calc(100vh-6rem)] rounded-2xl">
              <PricingSection 
                companyId={companyId} 
                email={email}
                category={category}
                onSubscriptionSuccess={onSubscriptionSuccess}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ------------------------------------------------------------------
// --- 3. MAIN STORES DASHBOARD ENGINE ---
// ------------------------------------------------------------------

// --- 3. MAIN STORES DASHBOARD ENGINE ---
// ------------------------------------------------------------------

export default function StoresPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // --- STATE PRESERVATION: Handle pagination memory ---
  const pageParam = searchParams.get('page');
  const page = parseInt(pageParam || '1', 10);
    
  // Check if we are currently processing a token login
  const isProcessingToken = searchParams.has('auth_token');

  // --- Auth & Loading Pipeline ---
  
  // 1. If loading natively OR if we are unauthenticated but currently processing a token, show loading.
  const isAuthLoading = status === 'loading' || (status === 'unauthenticated' && isProcessingToken);

  // 2. Only redirect if genuinely unauthenticated AND no token is present
  if (status === 'unauthenticated' && !isProcessingToken) {
    if (typeof window !== 'undefined') {
      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const callbackUrl = `${window.location.origin}${pathname}${queryString}`;
      
      const authUrl = new URL("https://auth.salesmanpro.site/signin");
      authUrl.searchParams.set("callbackUrl", callbackUrl);
      
      window.location.href = authUrl.toString();
    }
    return null;
  }

  useEffect(() => {
    // If the user navigates here without a page parameter, check if they had one previously
    if (!pageParam) {
      const savedPage = sessionStorage.getItem('storesLastPage');
      if (savedPage && savedPage !== '1') {
        router.replace(`${pathname}?page=${savedPage}`);
      }
    } else {
      // Always save the current valid page state
      sessionStorage.setItem('storesLastPage', pageParam);
    }
  }, [pageParam, pathname, router]);

  // --- SWR Data Fetching Engine ---
  // Don't fetch if we don't have a user ID yet
  const { 
    data: stores = [], 
    error: storesError, 
    isLoading: isStoresLoading 
  } = useSWR<Store[]>(
    session?.user?.id ? `/api/stores` : null,
    fetcher
  );

  // --- Restore Scroll Position after Data Load ---
  useLayoutEffect(() => {
    if (!isStoresLoading && stores.length > 0) {
      const savedScroll = sessionStorage.getItem('storesScrollY');
      if (savedScroll) {
        window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
        sessionStorage.removeItem('storesScrollY'); // Clear it after use
      }
    }
  }, [isStoresLoading, stores.length]);

  // --- Pagination Logic ---
  const pageSize = 12;
  const totalPages = useMemo(() => Math.ceil(stores.length / pageSize) || 1, [stores.length, pageSize]);
  const paginatedStores = useMemo(() => {
    const start = (page - 1) * pageSize;
    return stores.slice(start, start + pageSize);
  }, [stores, page, pageSize]);

  // --- Core Actions ---
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleEdit = (id: string) => {
    // Save exactly where the user is physically looking before they leave
    sessionStorage.setItem('storesScrollY', window.scrollY.toString());
    
    // Construct a return URL so the edit page knows where to send them back
    const currentUrl = encodeURIComponent(`${pathname}?${searchParams.toString()}`);
    router.push(`/stores/${id}/edit?returnUrl=${currentUrl}`);
  };

  const handleDeleteClick = (store: Store) => {
    setStoreToDelete(store);
    setIsDeleteModalOpen(true);
  };

  const handleManageSubscription = (id: string, category: string) => {
    setSelectedCompanyId(id);
    setSelectedCategory(category);
    setIsPricingModalOpen(true);
  };

  const handleSubscriptionSuccess = () => {
    setIsPricingModalOpen(false);
    mutate(`/api/stores`);
  };

  const confirmDelete = async () => {
    if (!storeToDelete) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/stores/${storeToDelete.id}`, { method: 'DELETE' });
      await mutate(`/api/stores`);
      
      // Edge case: If they delete the last item on a page, drop them back a page
      if (paginatedStores.length === 1 && page > 1) {
        handlePageChange(page - 1);
      }
    } catch (err) {
      console.error('Failed to delete store:', err);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setStoreToDelete(null);
    }
  };

  const handleCreate = () => router.push(`/stores/create`);

  const isLoading = isAuthLoading || isStoresLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 transition-colors duration-300">
        <header className="max-w-7xl mx-auto flex items-center justify-between mb-10 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <div className="h-9 bg-slate-200 dark:bg-slate-800 w-44 rounded-lg animate-pulse" />
            <div className="h-5 bg-slate-200 dark:bg-slate-800 w-64 rounded-md animate-pulse" />
          </div>
          <div className="h-12 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </header>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (storesError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="max-w-md p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <ExclamationTriangleIcon className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Synchronization Failed</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            We encountered a data retrieval fault while processing your branches. Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  // --- Primary App Stream Layout ---
  return (
    <>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 p-4 sm:p-8 md:p-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Hub Header */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Your Stores
              </h1>
              <p className="mt-1 text-sm md:text-base text-slate-500 dark:text-slate-400">
                Configure, manage metrics, or instantiate fresh cloud ecommerce branch operations.
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white px-5 py-3 rounded-xl font-bold shadow-md shadow-orange-500/10 active:scale-[0.98] transform transition-all duration-200 mt-4 sm:mt-0 text-sm"
            >
              <PlusIcon className="h-4 w-4 stroke-[2.5]" />
              <span>Create New Store</span>
            </button>
          </header>

          {/* Core Content Layout Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:grid-cols-2 lg:gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.04 } }
            }}
          >
            {stores.length === 0 ? (
              <EmptyState
                title="No Active Stores Detected"
                message="Your portfolio doesn't contain any cloud branch architectures yet. Deploy an environment to get configured."
                buttonText="Deploy First Store Instance"
                onButtonClick={handleCreate}
              />
            ) : (
              paginatedStores.map(store => {
                const isActive = store.subscriptionStatus === "ACTIVE";
                
                return (
                  <motion.div
                    key={store.id}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <StoreCard
                      {...store}
                      isActive={isActive}
                      onEdit={isActive ? () => handleEdit(store.slug) : undefined}
                      onDelete={isActive ? () => handleDeleteClick(store) : undefined}
                      onManageSubscription={!isActive ? () => handleManageSubscription(store.id || store.slug, store.category || '') : undefined}
                    />
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Modular Nav Pagination Footprint */}
          {totalPages > 1 && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
      
      {/* Destruction Intercept Drawer */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Destroy Branch Instance"
        message={`Are you certain you want to destroy "${storeToDelete?.name}"? All associated persistent application assets will clear.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isProcessing={isDeleting}
      />

      {/* Subscription Checkout Gateway Modal Overlay */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        companyId={selectedCompanyId}
        email={session?.user?.email || ''}
        category={selectedCategory}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />
    </>
  );
}