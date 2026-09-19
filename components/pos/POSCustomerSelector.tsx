'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UserIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { POSCustomerRecord, POSCustomer } from '@/types/pos';

export type { POSCustomerRecord, POSCustomer };

export interface POSCustomerSelectorProps {
  companyId: string;
  currentCustomer?: POSCustomerRecord | null;
  selectedCustomer?: POSCustomerRecord | null;
  onSelectCustomer: (customer: POSCustomerRecord | null) => void;
  required?: boolean;
}

export default function POSCustomerSelector({
  companyId,
  currentCustomer,
  selectedCustomer,
  onSelectCustomer,
  required = false,
}: POSCustomerSelectorProps) {
  const activeCustomer = currentCustomer ?? selectedCustomer ?? null;
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'create'>('search');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<POSCustomerRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Create state
  const [createName, setCreateName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createAddress, setCreateAddress] = useState('');
  const [createNotes, setCreateNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [duplicateMatch, setDuplicateMatch] = useState<POSCustomerRecord | null>(null);

  // Debounced search
  useEffect(() => {
    if (!modalOpen || activeTab !== 'search') return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/pos/customers?companyId=${encodeURIComponent(companyId)}&query=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setSearchResults(data.data || []);
        }
      } catch (err) {
        console.error('Failed to search customers:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, modalOpen, activeTab, companyId]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      setCreateError('Customer name is required');
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    setDuplicateMatch(null);

    try {
      const res = await fetch('/api/pos/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          name: createName.trim(),
          phone: createPhone.trim() || undefined,
          email: createEmail.trim() || undefined,
          address: createAddress.trim() || undefined,
          notes: createNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to create customer');
      }

      if (data.data?.duplicate) {
        setDuplicateMatch(data.data.customer);
        setCreateError(data.message || 'A customer with these details already exists.');
        return;
      }

      // Auto-select newly created customer
      onSelectCustomer(data.data.customer);
      setModalOpen(false);
      resetCreateForm();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create customer');
    } finally {
      setIsCreating(false);
    }
  };

  const resetCreateForm = () => {
    setCreateName('');
    setCreatePhone('');
    setCreateEmail('');
    setCreateAddress('');
    setCreateNotes('');
    setCreateError(null);
    setDuplicateMatch(null);
  };

  const openSearch = () => {
    setActiveTab('search');
    setModalOpen(true);
  };

  const openCreate = () => {
    resetCreateForm();
    setActiveTab('create');
    setModalOpen(true);
  };

  return (
    <div className="w-full">
      {/* Current Customer Context Banner */}
      <div
        className={`w-full py-2 px-4 rounded-xl flex items-center justify-between border transition-all ${
          activeCustomer
            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
            : required
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 animate-pulse'
            : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              activeCustomer
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : required
                ? 'bg-amber-500 text-white'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <UserIcon className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            {activeCustomer ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {activeCustomer.name}
                </span>
                {activeCustomer.phone && (
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 font-mono">
                    <PhoneIcon className="w-3 h-3" />
                    {activeCustomer.phone}
                  </span>
                )}
                {activeCustomer.customerNumber && (
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    #{activeCustomer.customerNumber}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  Walk-in / Anonymous Sale
                </span>
                {required && (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-3.5 h-3.5" />
                    Customer Required
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {activeCustomer ? (
            <>
              <button
                type="button"
                onClick={openSearch}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition active:scale-95 shadow-sm"
              >
                Change Customer
              </button>
              <button
                type="button"
                onClick={() => onSelectCustomer(null)}
                className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition active:scale-95"
                title="Clear customer (Walk-in)"
              >
                Clear
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={openSearch}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition active:scale-95 shadow-sm flex items-center gap-1"
              >
                <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                <span>Select Customer</span>
              </button>
              <button
                type="button"
                onClick={openCreate}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition active:scale-95 flex items-center gap-1"
              >
                <UserPlusIcon className="w-3.5 h-3.5" />
                <span>+ Add</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Customer Modal (Search & Create) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('search')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${
                    activeTab === 'search'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Search Existing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetCreateForm();
                    setActiveTab('create');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-1 ${
                    activeTab === 'create'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserPlusIcon className="w-4 h-4" />
                  <span>New Customer</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1">
              {activeTab === 'search' ? (
                <div>
                  {/* Search Input */}
                  <div className="relative mb-4">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search customer by phone, name, email, or code..."
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Search Results */}
                  <div className="space-y-2">
                    {isSearching ? (
                      <p className="text-center py-6 text-sm text-slate-500">Searching customers...</p>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((cust) => (
                        <div
                          key={cust.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between transition gap-3"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                              {cust.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 font-mono">
                              {cust.phone && <span>📞 {cust.phone}</span>}
                              {cust.email && !cust.email.includes('@pos.customer.local') && (
                                <span>✉️ {cust.email}</span>
                              )}
                              {cust.orderCount !== undefined && (
                                <span className="font-sans font-semibold text-indigo-600 dark:text-indigo-400">
                                  {cust.orderCount} past orders
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onSelectCustomer(cust);
                              setModalOpen(false);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition active:scale-95 shrink-0"
                          >
                            Select
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                          {searchQuery ? 'No existing customer found matching your search.' : 'Type to search customers'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            resetCreateForm();
                            if (searchQuery && /^\+?[\d\s-]+$/.test(searchQuery)) {
                              setCreatePhone(searchQuery.trim());
                            } else if (searchQuery) {
                              setCreateName(searchQuery.trim());
                            }
                            setActiveTab('create');
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                        >
                          <UserPlusIcon className="w-4 h-4" />
                          <span>Create New Customer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Create Customer Form */
                <form onSubmit={handleCreateCustomer} className="space-y-3">
                  {/* Duplicate Alert */}
                  {duplicateMatch && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
                        {createError}
                      </p>
                      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-amber-200 dark:border-amber-800/80">
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {duplicateMatch.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {duplicateMatch.phone} | {duplicateMatch.email}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCustomer(duplicateMatch);
                            setModalOpen(false);
                            resetCreateForm();
                          }}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                        >
                          Use This Customer
                        </button>
                      </div>
                    </div>
                  )}

                  {createError && !duplicateMatch && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-300 text-xs">
                      {createError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="e.g. John Kamau"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={createPhone}
                        onChange={(e) => setCreatePhone(e.target.value)}
                        placeholder="e.g. 0712 345 678"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="email"
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Address / Delivery Location <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={createAddress}
                      onChange={(e) => setCreateAddress(e.target.value)}
                      placeholder="e.g. Westlands, Nairobi"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Notes / Customer Preferences <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={createNotes}
                      onChange={(e) => setCreateNotes(e.target.value)}
                      placeholder="e.g. Regular client, prefers morning bookings..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('search')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                    >
                      {isCreating ? 'Saving...' : 'Save & Select Customer'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
