'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
  TrashIcon,
  FunnelIcon,
  HashtagIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  TagIcon,
} from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';

import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import { PropertyCard } from './PropertyCard';
import { ILocation, IStoreCategory, MarketListingForm } from '@/types/typings';

interface PropertyClientPageProps {
  companyId: string;
  initialProperties: MarketListingForm[];
  initialCategories: IStoreCategory[];
  initialLocations: ILocation[];
  serverLoadError: string | null;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function PropertyClientPage({
  companyId,
  initialProperties,
  initialCategories,
  initialLocations,
  serverLoadError,
}: PropertyClientPageProps) {
  const [properties, setProperties] = useState<MarketListingForm[]>(initialProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<MarketListingForm | null>(null);
  const [showAddToMarketProductModal, setShowAddToMarketProductModal] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  // --- Logic ---
  const stats = useMemo(() => ({
    total: properties?.length,
    active: properties?.filter(p => ['active', 'published'].includes(p.status?.toLowerCase() || '')).length,
    pending: properties?.filter(p => !['active', 'published', 'sold', 'archived'].includes(p.status?.toLowerCase() || '')).length,
  }), [properties]);

  const confirmDelete = useCallback(async (propertyId: string) => {
    setIsSubmitting(true);
    const tid = toast.loading('Removing listing...');
    try {
      const res = await fetch(`${apiBaseUrl}/admin/my-market-place/${encodeURIComponent(propertyId)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast.success('Listing permanently removed', { id: tid });
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error('Could not delete listing', { id: tid });
    } finally {
      setIsSubmitting(false);
    }
  }, [apiBaseUrl]);

  const filteredProperties = useMemo(() => {
    return properties?.filter(prop => {
      const matchesSearch = prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            prop.locationName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || prop.status === filterStatus;
      const matchesType = filterType === 'All' || prop.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [properties, searchTerm, filterStatus, filterType]);

  const uniqueStatuses = useMemo(() => Array.from(new Set(properties?.map(p => p.status).filter(Boolean))), [properties]);
  const uniqueTypes = useMemo(() => Array.from(new Set(properties?.map(p => p.type).filter(Boolean))), [properties]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 pb-20">
      <Toaster position="bottom-center" />

      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 pt-12 pb-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-12 bg-indigo-500 rounded-full" />
              <span className="text-sm font-bold tracking-[0.2em] text-indigo-600 dark:text-indigo-400 uppercase">Marketplace</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-2">
              Property <span className="text-slate-400 font-light">Hub</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md text-lg">
              Manage your real estate portfolio, monitor performance, and list new properties in real-time.
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-4">
            <StatCard label="Live Units" value={stats.active} icon={<CheckBadgeIcon className="w-5 h-5 text-emerald-500" />} />
            <StatCard label="Pending" value={stats.pending} icon={<ExclamationCircleIcon className="w-5 h-5 text-amber-500" />} />
            <StatCard label="Total" value={stats.total} icon={<HashtagIcon className="w-5 h-5 text-indigo-500" />} />
          </div>
        </div>
        
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* --- FLOATING COMMAND BAR --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-white dark:border-slate-800 rounded-[2rem] shadow-2xl p-3 flex flex-col lg:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full group">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full pl-14 pr-6 py-4 bg-transparent border-none focus:ring-0 text-lg font-medium placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden lg:block" />

          <div className="flex items-center gap-2 w-full lg:w-auto px-2">
            <FilterDropdown 
              icon={<FunnelIcon className="w-4 h-4" />} 
              value={filterStatus} 
              options={uniqueStatuses} 
              onChange={setFilterStatus} 
              label="Status" 
            />
            <FilterDropdown 
              icon={<TagIcon className="w-4 h-4" />} 
              value={filterType} 
              options={uniqueTypes} 
              onChange={setFilterType} 
              label="Type" 
            />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSelectedProperty(null); setShowAddToMarketProductModal(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center"
            >
              <PlusIcon className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* --- GRID --- */}
      <main className="max-w-7xl mx-auto px-6 mt-16">
        <LayoutGroup>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence mode='popLayout'>
              {filteredProperties.map((property) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                >
                  <PropertyCard
                    property={property}
                    companyId={companyId}
                    onEdit={(p) => { setSelectedProperty(p); setShowAddToMarketProductModal(true); }}
                    onDelete={(p) => { setSelectedProperty(p); setIsDeleteModalOpen(true); }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {filteredProperties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full mb-6">
              <TagIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No listings found</h3>
            <p className="text-slate-500">We couldn't find any properties matching your current filters.</p>
            <button 
              onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterType('All'); }}
              className="mt-6 text-indigo-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* --- DELETE MODAL --- */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrashIcon className="w-32 h-32 text-red-600" />
              </div>
              <h4 className="text-3xl font-black mb-4">Are you sure?</h4>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                You are about to remove <span className="font-bold text-slate-900 dark:text-white">"{selectedProperty.name}"</span>. 
                This action is destructive and cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => confirmDelete(selectedProperty.id)}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20"
                >
                  {isSubmitting ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <TrashIcon className="w-5 h-5" />}
                  Confirm Deletion
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                >
                  Keep Property
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADD MODAL --- */}
      {showAddToMarketProductModal && (
        <AddToProductMarketModal
          showRequestProductModal={showAddToMarketProductModal}
          setShowRequestProductModal={setShowAddToMarketProductModal}
          categories={initialCategories || []}
          companyId={companyId}
          locations={initialLocations || []}
          marketListItem={selectedProperty}
        />
      )}
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-3xl flex items-center gap-4 min-w-[140px] border border-slate-100 dark:border-slate-800">
      <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{label}</p>
        <p className="text-xl font-black">{value}</p>
      </div>
    </div>
  );
}

function FilterDropdown({ icon, value, options, onChange, label, }: any) {
  return (
    <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-transparent focus-within:border-indigo-500/50 transition-all">
      <span className="text-slate-400">{icon}</span>
      <select 
        className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 cursor-pointer min-w-[80px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="All">{label}: All</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}