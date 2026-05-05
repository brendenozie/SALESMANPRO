'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon,
  MagnifyingGlassIcon, BuildingStorefrontIcon,
  ArrowTopRightOnSquareIcon, PhotoIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

export default function MarketplaceManagementClient({ initialListings, initialMeta }: { initialListings: any[], initialMeta: any }) {
  const [listings, setListings] = useState(initialListings);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialMeta?.hasMore ?? true);
  const [isLoading, setIsLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  // The "Sentinel" Ref: When this element is visible, we fetch more.
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  // Fetch Logic
  const fetchListings = async (isNewSearch = false) => {
    setIsLoading(true);
    const currentPage = isNewSearch ? 1 : page;
    
    try {
      const query = new URLSearchParams({
        limit: '12',
        page: currentPage.toString(),
        filter,
        search
      });

      const res = await fetch(`/api/admin/marketplace-gh?${query.toString()}`);
      const json = await res.json();
      const newResults = json.data.results || [];

      if (isNewSearch) {
        setListings(newResults);
      } else {
        setListings(prev => [...prev, ...newResults]);
      }

      setHasMore(json.data.meta.hasMore);
    } catch (err) {
      toast.error("Failed to load more listings");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch on page change (Infinite Scroll)
  useEffect(() => {
    if (page > 1) fetchListings();
  }, [page]);

  // Reset and fetch when filter or search changes
  useEffect(() => {
    setPage(1);
    fetchListings(true);
  }, [filter, search]);

  const updateStatus = async (id: string, updates: any) => {
    const toastId = toast.loading("Updating...");
    try {
      const res = await fetch(`/api/admin/marketplace-gh/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setListings(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
      toast.success("Updated", { id: toastId });
    } catch (err) {
      toast.error("Update failed", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-10">
      <Toaster position="bottom-center" />

      {/* --- Dashboard Header --- */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
         <div>
           <div className="flex items-center gap-2 mb-2">
             <BuildingStorefrontIcon className="w-6 h-6 text-indigo-600" />
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Marketplace Control</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ghuba Listings</h1>
         </div>

         <div className="flex flex-wrap items-center gap-3">
           {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                 filter === f 
                 ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105' 
                 : 'bg-white text-slate-500 hover:bg-slate-50'
               }`}
             >
               {f}
             </button>
           ))}
         </div>
       </div>

      <div className="relative max-w-xl mb-8">
        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search products..." 
          className="w-full pl-14 pr-6 py-4 bg-white border border-white rounded-[2rem] shadow-sm outline-none"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {listings.map((listing, index) => {
          const isLast = listings.length === index + 1;
          return (
          <div key={listing.id} ref={isLast ? lastElementRef : null} className="group relative bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
            
            {/* Image Preview & Badges */}
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
              {listing.images?.[0] ? (
                <img 
                  src={listing.images[0]?.url || listing.images[0]} 
                  alt={listing.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300">
                  <PhotoIcon className="w-12 h-12" />
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                  listing.ghubaStatus === 'APPROVED' ? 'bg-emerald-500 text-white border-emerald-400' :
                  listing.ghubaStatus === 'PENDING' ? 'bg-amber-400 text-white border-amber-300' :
                  'bg-rose-500 text-white border-rose-400'
                }`}>
                  {listing.ghubaStatus}
                </span>
                {!listing.showOnGhuba && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-slate-900 text-white border border-slate-700 flex items-center gap-1">
                    <EyeSlashIcon className="w-3 h-3" /> Hidden
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-slate-800 text-lg line-clamp-1">{listing.name}</h3>
                <p className="font-black text-indigo-600">KES {listing.sellingPrice.toLocaleString()}</p>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                  {listing.company?.name?.charAt(0)}
                </div>
                <p className="text-xs font-bold text-slate-500">{listing.company?.name || 'Individual Seller'}</p>
              </div>

              {/* Action Rows */}
              <div className="grid grid-cols-2 gap-3">
                {/* Status Toggle */}
                {listing.ghubaStatus !== 'APPROVED' ? (
                  <button 
                    onClick={() => updateStatus(listing.id, { ghubaStatus: 'APPROVED', ghubaAdminApproved: true, showOnGhuba: true })}
                    className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-[11px] font-black hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                  >
                    <CheckCircleIcon className="w-4 h-4" /> Approve
                  </button>
                ) : (
                  <button 
                    onClick={() => updateStatus(listing.id, { ghubaStatus: 'REJECTED', ghubaAdminApproved: false, showOnGhuba: false })}
                    className="flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-700 rounded-2xl text-[11px] font-black hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                  >
                    <XCircleIcon className="w-4 h-4" /> Reject
                  </button>
                )}

                {/* Visibility Toggle */}
                <button 
                  onClick={() => updateStatus(listing.id, { showOnGhuba: !listing.showOnGhuba })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[11px] font-black transition-all active:scale-95 ${
                    listing.showOnGhuba 
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                  }`}
                >
                  {listing.showOnGhuba ? (
                    <><EyeSlashIcon className="w-4 h-4" /> Hide</>
                  ) : (
                    <><EyeIcon className="w-4 h-4" /> Show</>
                  )}
                </button>
              </div>
            </div>

            {/* Subtle Footer Link */}
            <div className="px-6 py-4 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                ID: {listing.id.slice(-6)}
              </span>
              <a href={`/marketplace/product/${listing.id}`} target="_blank" className="p-2 hover:bg-white rounded-lg transition text-slate-400 hover:text-indigo-600">
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

            // <div 
            //   key={listing.id} 
            //   ref={isLast ? lastElementRef : null}
            //   className="bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-sm overflow-hidden"
            // >
            //    {/* ... Listing Card Content ... */}
            //    <div className="relative h-48 w-full bg-slate-100">
            //       <img src={listing.images?.[0]?.url || listing.images?.[0] || '/placeholder.png'} alt="" className="w-full h-full object-cover" />
            //    </div>
            //    <div className="p-6">
            //       <h3 className="font-black text-slate-800 text-lg mb-4">{listing.name}</h3>
            //       {/* Action buttons same as before */}
            //       <div className="grid grid-cols-2 gap-3">
            //         <button onClick={() => updateStatus(listing.id, { showOnGhuba: !listing.showOnGhuba })} className="py-3 bg-slate-100 rounded-xl font-bold text-xs">
            //           {listing.showOnGhuba ? 'Hide' : 'Show'}
            //         </button>
            //       </div>
            //    </div>
            // </div>
          );
        })}
      </div>

      {/* Loading States */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <ArrowPathIcon className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      )}

      {!hasMore && listings.length > 0 && (
        <p className="text-center text-slate-400 font-bold mt-10 text-xs uppercase tracking-widest">End of Catalog</p>
      )}
    </div>
  );
}
