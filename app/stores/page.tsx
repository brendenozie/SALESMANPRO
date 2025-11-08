'use client';

import React, { useState, useMemo } from 'react';
// 1. Import hooks for URL state management
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  BuildingStorefrontIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import StoreCard from '@/components/stores/StoreCard';
import useSWR, { mutate } from 'swr';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

const fetcher = (url: string) => fetch(url, { credentials: 'include' })
.then(async res => 
    {
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        let resJson = await res.json();

        return resJson.data;
    }   
);

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  category?: string;
}

// A component for the custom confirmation dialog.
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-6 bg-white w-96 max-w-full m-4 shadow-xl rounded-lg text-center transform transition-all">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl leading-6 font-bold text-gray-900">{title}</h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">{message}</p>
                </div>
                <div className="mt-5 flex justify-center space-x-4">
                    <button type="button" onClick={onCancel} className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:text-sm">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// A component for the animated loading state.
const SkeletonCard = () => (
    <div className="relative flex flex-col justify-between bg-white rounded-lg shadow-md animate-pulse p-6">
        <div className="w-full h-40 bg-gray-300 rounded-t-lg mb-4"></div>
        <div className="space-y-2">
            <div className="h-6 bg-gray-300 rounded-md w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded-md"></div>
            <div className="h-4 bg-gray-300 rounded-md w-5/6"></div>
        </div>
        <div className="flex justify-end mt-4">
            <div className="h-6 w-16 bg-gray-300 rounded-md mr-2"></div>
            <div className="h-6 w-16 bg-gray-300 rounded-md"></div>
        </div>
    </div>
);

// A component for a visually engaging empty state.
const EmptyState = ({ title, message, buttonText, onButtonClick }: { title: string; message: string; buttonText: string; onButtonClick: () => void; }) => (
    <div className="text-center py-20 px-4 sm:px-6 lg:px-8">
        <BuildingStorefrontIcon className="mx-auto h-20 w-20 text-gray-400" />
        <h3 className="mt-4 text-2xl font-medium text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-6">
            <button type="button" onClick={onButtonClick} className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
                <BuildingStorefrontIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
                {buttonText}
            </button>
        </div>
    </div>
);

// A component for the pagination controls (Updated to be a controlled component).
    
const PaginationControls = ({ page, totalPages, onPageChange } : {
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
}) => (
    <div className="mt-12 flex justify-center items-center space-x-6">
        <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-3 flex items-center rounded-full text-indigo-600 hover:bg-indigo-50 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed transition duration-150 transform hover:scale-[1.05]"
        >
            <ArrowLeftCircleIcon className="h-7 w-7" />
            <span className='ml-2 text-base font-semibold hidden sm:inline'>Previous</span>
        </button>
        <span className="text-lg font-semibold text-gray-700 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
            Page {page} of {totalPages}
        </span>
        <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-3 flex items-center rounded-full text-indigo-600 hover:bg-indigo-50 disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed transition duration-150 transform hover:scale-[1.05]"
        >
             <span className='mr-2 text-base font-semibold hidden sm:inline'>Next</span>
            <ArrowRightCircleIcon className="h-7 w-7" />
        </button>
    </div>
);


export default function StoresPage() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: session, status } = useSession();
    const [store, setStore] = useState<Store | null>(null);
    
    // 2. Initialize hooks to read from and write to the URL
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 3. Read page number from URL. The URL is now the single source of truth.
    // We parse it and provide a fallback of '1'.
    const page = parseInt(searchParams.get('page') || '1', 10);

    const { data: stores = [], error, isLoading } = useSWR<Store[]>(
        session?.user?.id ? `${apiBaseUrl}/stores?userId=${session.user.id}` : null,
        fetcher
    );

    const pageSize = 12;
    const totalPages = useMemo(() => Math.ceil(stores.length / pageSize), [stores, pageSize]);
    const paginatedStores = useMemo(() => {
        const start = (page - 1) * pageSize;
        return stores.length > 0 && stores?.slice(start, start + pageSize);
    }, [stores, page, pageSize]);

    // 4. Create a handler that updates the URL when the page changes
    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(newPage));
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleEdit = (id: string) => router.push(`/stores/${id}/edit`);

    const handleDeleteClick = (storeToDelete: Store) => {
        setStore(storeToDelete);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!store) return;
        setIsModalOpen(false);
        setIsDeleting(true);
        try {
            const res = await fetch(`${apiBaseUrl}/stores/${store.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            mutate(`${apiBaseUrl}/stores?userId=${session?.user?.id}`);
        } catch (err) {
            console.error('Failed to delete store:', err);
        } finally {
            setIsDeleting(false);
            setStore(null);
        }
    };

    const handleCreate = () => router.push(`/stores/create`);
    const isAuthLoading = status === 'loading';

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-8">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800">Your Stores</h1>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition"
                    >
                        <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                        Create New Store
                    </button>
                </header>

                {isAuthLoading ? (
                    <p className="p-8 text-center">Checking session…</p>
                ) : !session ? (
                    <p className="p-8 text-center">Please sign in to manage your stores.</p>
                ) : error ? (
                    <p className="p-8 text-center text-red-600">Failed to load stores.</p>
                ) : isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(pageSize)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : stores.length === 0 ? (
                    <EmptyState
                        title="No Stores Found"
                        message="It looks like you haven't created any stores yet. Get started by creating one!"
                        buttonText="Create Your First Store"
                        onButtonClick={handleCreate}
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedStores && paginatedStores?.map(store => (
                                <StoreCard
                                    key={store.id}
                                    {...store}
                                    onEdit={handleEdit}
                                    // Pass a function that captures the specific store for deletion
                                    onDelete={() => handleDeleteClick(store)}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <PaginationControls
                                page={page}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                title="Confirm Deletion"
                message="Are you sure you want to delete this store? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </>
    );
}