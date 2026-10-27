'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TableCellsIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  QrCodeIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

interface RestaurantArea {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  tablesCount?: number;
}

interface RestaurantTable {
  id: string;
  companyId: string;
  areaId?: string | null;
  areaName?: string;
  tableNumber: string;
  name?: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILL_PRINTED' | 'CLEANING';
  isActive: boolean;
  qrCode?: string;
  currentOrderId?: string;
}

interface Props {
  companyId: string;
  companySlug: string;
  companyName: string;
}

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  AVAILABLE: {
    label: 'Available',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  OCCUPIED: {
    label: 'Occupied',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-500 animate-pulse',
  },
  RESERVED: {
    label: 'Reserved',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    dot: 'bg-sky-500',
  },
  BILL_PRINTED: {
    label: 'Bill Printed',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    dot: 'bg-indigo-500',
  },
  CLEANING: {
    label: 'Cleaning',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-500',
  },
};

export default function FloorPlanManagementClient({ companyId, companySlug, companyName }: Props) {
  const [areas, setAreas] = useState<RestaurantArea[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAreaFilter, setActiveAreaFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [editingArea, setEditingArea] = useState<RestaurantArea | null>(null);
  const [qrModalTable, setQrModalTable] = useState<RestaurantTable | null>(null);

  // Form states - Table
  const [formTableNumber, setFormTableNumber] = useState('');
  const [formTableName, setFormTableName] = useState('');
  const [formCapacity, setFormCapacity] = useState(4);
  const [formAreaId, setFormAreaId] = useState('');
  const [formStatus, setFormStatus] = useState<'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING'>('AVAILABLE');
  const [formStationType, setFormStationType] = useState<'BAR' | 'TABLE' | 'BOOTH'>('TABLE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states - Batch Generator
  const [batchPrefix, setBatchPrefix] = useState('BAR-');
  const [batchCount, setBatchCount] = useState(10);
  const [batchCapacity, setBatchCapacity] = useState(1);
  const [batchAreaId, setBatchAreaId] = useState('');

  // Form states - Area
  const [formAreaName, setFormAreaName] = useState('');
  const [formAreaDesc, setFormAreaDesc] = useState('');
  const [formAreaSort, setFormAreaSort] = useState(0);

  // Notification banner
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Load data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [areasRes, tablesRes] = await Promise.all([
        fetch(`/api/pos/restaurant/areas?companyId=${encodeURIComponent(companyId)}`),
        fetch(`/api/pos/restaurant/tables?companyId=${encodeURIComponent(companyId)}`),
      ]);

      const areasJson = await areasRes.json();
      const tablesJson = await tablesRes.json();

      if (areasJson.success && Array.isArray(areasJson.data)) {
        setAreas(areasJson.data);
        if (areasJson.data.length > 0 && !batchAreaId) {
          const barArea = areasJson.data.find((a: RestaurantArea) => a.name.toLowerCase().includes('bar'));
          setBatchAreaId(barArea ? barArea.id : areasJson.data[0].id);
        }
      }
      if (tablesJson.success && Array.isArray(tablesJson.data)) {
        setTables(tablesJson.data);
      }
    } catch (e: any) {
      console.error('Error fetching tables & areas:', e);
      showToast('error', 'Failed to load floor plan data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  // Filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchesArea = activeAreaFilter === 'all' || t.areaId === activeAreaFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.tableNumber.toLowerCase().includes(q) ||
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.areaName && t.areaName.toLowerCase().includes(q));
      return matchesArea && matchesSearch;
    });
  }, [tables, activeAreaFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalTables = tables.length;
    const barStools = tables.filter(
      (t) =>
        t.tableNumber.toLowerCase().startsWith('bar') ||
        (t.name && t.name.toLowerCase().includes('bar')) ||
        (t.areaName && t.areaName.toLowerCase().includes('bar')) ||
        t.capacity === 1
    ).length;
    const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity || 0), 0);
    const occupied = tables.filter((t) => t.status === 'OCCUPIED').length;
    return { totalTables, barStools, totalCapacity, occupied };
  }, [tables]);

  // Open modal for new table
  const handleOpenNewTable = (prefillType?: 'BAR' | 'TABLE') => {
    setEditingTable(null);
    if (prefillType === 'BAR') {
      const nextNum = tables.filter((t) => t.tableNumber.startsWith('BAR')).length + 1;
      setFormTableNumber(`BAR-${nextNum}`);
      setFormTableName(`Bar Counter Stool ${nextNum}`);
      setFormCapacity(1);
      setFormStationType('BAR');
      const barArea = areas.find((a) => a.name.toLowerCase().includes('bar'));
      setFormAreaId(barArea ? barArea.id : areas[0]?.id || '');
    } else {
      const nextNum = tables.filter((t) => !t.tableNumber.startsWith('BAR')).length + 1;
      setFormTableNumber(`T-${nextNum}`);
      setFormTableName(`Dining Table ${nextNum}`);
      setFormCapacity(4);
      setFormStationType('TABLE');
      const mainArea = areas.find((a) => !a.name.toLowerCase().includes('bar'));
      setFormAreaId(mainArea ? mainArea.id : areas[0]?.id || '');
    }
    setFormStatus('AVAILABLE');
    setShowTableModal(true);
  };

  // Open modal for editing table
  const handleOpenEditTable = (t: RestaurantTable) => {
    setEditingTable(t);
    setFormTableNumber(t.tableNumber);
    setFormTableName(t.name || `Table ${t.tableNumber}`);
    setFormCapacity(t.capacity || 4);
    setFormAreaId(t.areaId || '');
    setFormStatus((t.status as any) || 'AVAILABLE');
    setFormStationType(
      t.tableNumber.toLowerCase().includes('bar') || t.capacity === 1
        ? 'BAR'
        : t.capacity >= 6
        ? 'BOOTH'
        : 'TABLE'
    );
    setShowTableModal(true);
  };

  // Submit table creation or edit
  const handleSubmitTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTableNumber.trim()) {
      return showToast('error', 'Table / Stool number is required');
    }

    setIsSubmitting(true);
    try {
      if (editingTable) {
        // Update table
        const res = await fetch('/api/pos/restaurant/tables', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId,
            tableId: editingTable.id,
            tableNumber: formTableNumber.trim(),
            name: formTableName.trim() || undefined,
            capacity: Number(formCapacity) || 1,
            areaId: formAreaId || null,
            status: formStatus,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update table');
        showToast('success', `Station ${formTableNumber} updated successfully`);
      } else {
        // Create table
        const res = await fetch('/api/pos/restaurant/tables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId,
            tableNumber: formTableNumber.trim(),
            name: formTableName.trim() || undefined,
            capacity: Number(formCapacity) || 1,
            areaId: formAreaId || undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create table');
        showToast('success', `Station ${formTableNumber} added successfully`);
      }
      setShowTableModal(false);
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete table
  const handleDeleteTable = async (t: RestaurantTable) => {
    if (!confirm(`Are you sure you want to remove ${t.name || t.tableNumber}?`)) return;
    try {
      const res = await fetch(
        `/api/pos/restaurant/tables?companyId=${encodeURIComponent(companyId)}&tableId=${encodeURIComponent(t.id)}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete table');
      showToast('success', `${t.tableNumber} deleted`);
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete');
    }
  };

  // Quick Status change
  const handleQuickStatus = async (tableId: string, status: string) => {
    try {
      const res = await fetch('/api/pos/restaurant/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, tableId, status }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('success', `Status updated to ${status}`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit batch generator
  const handleBatchGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchCount <= 0 || batchCount > 50) {
      return showToast('error', 'Count must be between 1 and 50');
    }

    setIsSubmitting(true);
    try {
      const batchItems = [];
      const prefixClean = batchPrefix.trim();
      const isBar = prefixClean.toLowerCase().includes('bar');

      for (let i = 1; i <= batchCount; i++) {
        const num = `${prefixClean}${i}`;
        batchItems.push({
          tableNumber: num,
          name: isBar ? `Bar Stool ${i}` : `Table ${i}`,
          capacity: Number(batchCapacity) || (isBar ? 1 : 4),
          areaId: batchAreaId || undefined,
        });
      }

      const res = await fetch('/api/pos/restaurant/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          batch: batchItems,
          areaId: batchAreaId || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed batch generation');

      showToast('success', `Generated ${batchItems.length} stations successfully!`);
      setShowBatchModal(false);
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'Batch creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Area Create / Edit
  const handleOpenAreaModal = (area?: RestaurantArea) => {
    if (area) {
      setEditingArea(area);
      setFormAreaName(area.name);
      setFormAreaDesc(area.description || '');
      setFormAreaSort(area.sortOrder || 0);
    } else {
      setEditingArea(null);
      setFormAreaName('');
      setFormAreaDesc('');
      setFormAreaSort(areas.length + 1);
    }
    setShowAreaModal(true);
  };

  const handleSubmitArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAreaName.trim()) return showToast('error', 'Area name is required');

    setIsSubmitting(true);
    try {
      if (editingArea) {
        const res = await fetch('/api/pos/restaurant/areas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId,
            areaId: editingArea.id,
            name: formAreaName.trim(),
            description: formAreaDesc.trim() || undefined,
            sortOrder: Number(formAreaSort) || 0,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update area');
        showToast('success', `Area "${formAreaName}" updated`);
      } else {
        const res = await fetch('/api/pos/restaurant/areas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId,
            name: formAreaName.trim(),
            description: formAreaDesc.trim() || undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create area');
        showToast('success', `Area "${formAreaName}" created`);
      }
      setShowAreaModal(false);
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'Area operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArea = async (area: RestaurantArea) => {
    if (!confirm(`Are you sure you want to delete the "${area.name}" section? Tables in this section will be unassigned.`)) {
      return;
    }
    try {
      const res = await fetch(
        `/api/pos/restaurant/areas?companyId=${encodeURIComponent(companyId)}&areaId=${encodeURIComponent(area.id)}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete area');
      showToast('success', `Section "${area.name}" deleted`);
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete area');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-500/40'
              : 'bg-rose-950 text-rose-200 border-rose-500/40'
          }`}
        >
          {toast.type === 'success' ? <CheckIcon className="w-5 h-5 text-emerald-400" /> : <XMarkIcon className="w-5 h-5 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              <BuildingStorefrontIcon className="w-4 h-4" />
              <span>{companyName} &bull; Restaurant Floor Management</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Floor Plan, Tables & Bar Stations
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Configure dining tables, bar counters, lounges, and patio seating. Changes sync instantly to POS terminals and KDS tickets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/admin/${companySlug}/pos`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
              title="Open POS Terminal floor view"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-teal-400" />
              <span>Open POS Floor</span>
            </Link>

            <button
              onClick={() => setShowBatchModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 font-bold text-xs border border-indigo-700/40 transition"
              title="Batch generate tables or bar stools"
            >
              <SparklesIcon className="w-4 h-4 text-indigo-400" />
              <span>Batch Generator</span>
            </button>

            <button
              onClick={() => handleOpenNewTable('BAR')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition"
            >
              <PlusIcon className="w-4 h-4" />
              <span>+ Add Bar Stool</span>
            </button>

            <button
              onClick={() => handleOpenNewTable('TABLE')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              <PlusIcon className="w-4 h-4" />
              <span>+ Add Table</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Stations</span>
              <TableCellsIcon className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.totalTables}</div>
            <div className="text-xs text-slate-500 mt-1">Configured for ordering</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Bar Seats</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Stools & Bars
              </span>
            </div>
            <div className="text-3xl font-black text-amber-400">{stats.barStools}</div>
            <div className="text-xs text-slate-500 mt-1">Bar counter positions</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Guest Capacity</span>
              <UserGroupIcon className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-black text-teal-400">{stats.totalCapacity}</div>
            <div className="text-xs text-slate-500 mt-1">Total seats available</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Currently Occupied</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="text-3xl font-black text-white">{stats.occupied}</div>
            <div className="text-xs text-slate-500 mt-1">Active seated orders</div>
          </div>
        </div>

        {/* SECTION MANAGEMENT / AREAS */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span>Dining & Bar Sections</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                {areas.length} Areas
              </span>
            </h2>
            <button
              onClick={() => handleOpenAreaModal()}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition"
            >
              <PlusIcon className="w-4 h-4" />
              <span>+ Add Section (e.g. Patio, Rooftop Bar)</span>
            </button>
          </div>

          {/* Area Filter Tabs with Inline Edit */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => setActiveAreaFilter('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                activeAreaFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>All Areas</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30">
                {tables.length}
              </span>
            </button>

            {areas.map((area) => {
              const count = tables.filter((t) => t.areaId === area.id).length;
              const isSelected = activeAreaFilter === area.id;
              const isBar = area.name.toLowerCase().includes('bar');

              return (
                <div
                  key={area.id}
                  className={`flex items-center rounded-2xl border text-xs font-bold transition overflow-hidden ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <button
                    onClick={() => setActiveAreaFilter(area.id)}
                    className="px-4 py-2 flex items-center gap-2 text-left"
                  >
                    {isBar ? <span className="text-amber-400 font-mono">🍸</span> : null}
                    <span>{area.name}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30">
                      {count}
                    </span>
                  </button>

                  <button
                    onClick={() => handleOpenAreaModal(area)}
                    className="p-2 hover:bg-black/20 text-slate-400 hover:text-white transition"
                    title={`Edit ${area.name}`}
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                  </button>

                  {areas.length > 1 && (
                    <button
                      onClick={() => handleDeleteArea(area)}
                      className="p-2 hover:bg-rose-500/20 text-rose-400 transition"
                      title={`Delete ${area.name}`}
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by table #, name, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-2xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Refresh"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* TABLES & BAR GRID */}
        {loading ? (
          <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <ArrowPathIcon className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm font-semibold">Loading floor plan layout...</p>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="p-16 border border-dashed border-slate-800 rounded-3xl text-center space-y-4">
            <TableCellsIcon className="w-12 h-12 text-slate-600 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-white">No stations found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No tables or bar stations match your search query.'
                  : 'Get started by creating your first dining table or bar counter stool.'}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => handleOpenNewTable('BAR')}
                className="px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                + Add Bar Stool
              </button>
              <button
                onClick={() => handleOpenNewTable('TABLE')}
                className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                + Add Table
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTables.map((t) => {
              const isBar =
                t.tableNumber.toLowerCase().startsWith('bar') ||
                (t.name && t.name.toLowerCase().includes('bar')) ||
                (t.areaName && t.areaName.toLowerCase().includes('bar')) ||
                t.capacity === 1;

              const statusStyle = STATUS_CONFIG[t.status] || STATUS_CONFIG.AVAILABLE;

              return (
                <div
                  key={t.id}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-xl"
                >
                  {/* Card Top: Number, Area Badge, and Station Icon */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xl font-black text-white tracking-tight">
                            {t.tableNumber}
                          </span>
                          {isBar && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Bar
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-slate-300 truncate max-w-[180px] mt-0.5">
                          {t.name || `Table ${t.tableNumber}`}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setQrModalTable(t)}
                          className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                          title="Generate Table QR Code"
                        >
                          <QrCodeIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditTable(t)}
                          className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                          title="Edit Station"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteTable(t)}
                          className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Station"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Area & Capacity Details */}
                    <div className="flex items-center justify-between text-xs py-2 border-y border-slate-800/80 my-3">
                      <div className="flex items-center gap-1 text-slate-400">
                        <UserGroupIcon className="w-4 h-4 text-slate-500" />
                        <span>
                          <strong className="text-white">{t.capacity || 1}</strong> {t.capacity === 1 ? 'Guest' : 'Guests'}
                        </span>
                      </div>

                      <span className="text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-lg text-[11px]">
                        {t.areaName || 'Main Dining'}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom: Status Pill with Quick Dropdown */}
                  <div className="pt-2 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle.badge}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                      <span>{statusStyle.label}</span>
                    </span>

                    {/* Quick status reset / toggle */}
                    <div className="flex items-center gap-1">
                      {t.status !== 'AVAILABLE' && (
                        <button
                          onClick={() => handleQuickStatus(t.id, 'AVAILABLE')}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition"
                          title="Release table / Mark Available"
                        >
                          Mark Free
                        </button>
                      )}
                      {t.status === 'AVAILABLE' && (
                        <button
                          onClick={() => handleQuickStatus(t.id, 'RESERVED')}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                          title="Reserve Table"
                        >
                          Reserve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT TABLE */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <TableCellsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingTable ? `Edit Station ${editingTable.tableNumber}` : 'Add Table or Bar Station'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure station identification and capacity
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTableModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTable} className="space-y-4">
              {/* Type Switcher Chips */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Station Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'BAR', label: 'Bar Stool / Seat', defaultCap: 1, prefix: 'BAR-' },
                    { id: 'TABLE', label: 'Standard Table', defaultCap: 4, prefix: 'T-' },
                    { id: 'BOOTH', label: 'Booth / VIP', defaultCap: 6, prefix: 'VIP-' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setFormStationType(cat.id as any);
                        if (!editingTable) {
                          setFormCapacity(cat.defaultCap);
                          if (!formTableNumber || formTableNumber.includes('-')) {
                            const count = tables.filter((t) => t.tableNumber.startsWith(cat.prefix)).length + 1;
                            setFormTableNumber(`${cat.prefix}${count}`);
                            setFormTableName(
                              cat.id === 'BAR' ? `Bar Stool ${count}` : cat.id === 'BOOTH' ? `Booth ${count}` : `Table ${count}`
                            );
                          }
                        }
                      }}
                      className={`p-2.5 rounded-2xl text-xs font-bold border transition text-center ${
                        formStationType === cat.id
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Station Number & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Station Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BAR-1, T-5"
                    value={formTableNumber}
                    onChange={(e) => setFormTableNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Display / Receipt Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Bar Counter Stool 1"
                  value={formTableName}
                  onChange={(e) => setFormTableName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Section Assignment */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Assigned Section / Area
                </label>
                <select
                  value={formAreaId}
                  onChange={(e) => setFormAreaId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- No Section (Default) --</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Selector (in edit mode) */}
              {editingTable && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Current Occupancy Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="BILL_PRINTED">Bill Printed</option>
                    <option value="CLEANING">Cleaning</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
                >
                  {isSubmitting ? 'Saving...' : editingTable ? 'Update Station' : 'Create Station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BATCH GENERATOR */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Batch Station Generator</h3>
                  <p className="text-xs text-slate-400">
                    Quickly generate rows of bar stools, patio tables, or dining seats
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBatchGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Station Prefix
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BAR-, T-, PATIO-"
                    value={batchPrefix}
                    onChange={(e) => setBatchPrefix(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Quantity to Create (1-50)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Seat Capacity per Station
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={batchCapacity}
                    onChange={(e) => setBatchCapacity(Number(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Target Section / Area
                  </label>
                  <select
                    value={batchAreaId}
                    onChange={(e) => setBatchAreaId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview Box */}
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl text-xs space-y-1">
                <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Preview Generated IDs:
                </span>
                <p className="text-indigo-400 font-mono">
                  {batchPrefix}1, {batchPrefix}2, {batchPrefix}3 ... {batchPrefix}
                  {batchCount}
                </p>
                <p className="text-slate-500">
                  {batchCount} stations with {batchCapacity} {batchCapacity === 1 ? 'seat' : 'seats'} each.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-amber-600/20"
                >
                  {isSubmitting ? 'Generating...' : `Generate ${batchCount} Stations`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT AREA */}
      {showAreaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <BuildingStorefrontIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingArea ? `Edit Section "${editingArea.name}"` : 'Add Dining / Bar Section'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Group tables into logical floor zones
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAreaModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitArea} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bar & Lounge, Rooftop Patio, VIP Room"
                  value={formAreaName}
                  onChange={(e) => setFormAreaName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. High-top stools, craft cocktail bar and lounge"
                  value={formAreaDesc}
                  onChange={(e) => setFormAreaDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Display Sort Order
                </label>
                <input
                  type="number"
                  value={formAreaSort}
                  onChange={(e) => setFormAreaSort(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAreaModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
                >
                  {isSubmitting ? 'Saving...' : editingArea ? 'Update Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: QR CODE PREVIEW */}
      {qrModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-center space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-base">
                Table QR Code &bull; {qrModalTable.tableNumber}
              </h4>
              <button
                onClick={() => setQrModalTable(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-inner mx-auto w-fit">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `https://salesmanpro.store/menu?table=${qrModalTable.tableNumber}&store=${companySlug}`
                )}`}
                alt={`QR code for ${qrModalTable.tableNumber}`}
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div>
              <h5 className="font-bold text-white text-lg">
                {qrModalTable.name || `Table ${qrModalTable.tableNumber}`}
              </h5>
              <p className="text-xs text-slate-400 mt-1">
                Scan to browse menu and order directly from this station.
              </p>
              <div className="mt-2 text-[11px] font-mono text-indigo-400 break-all bg-slate-950 p-2 rounded-xl">
                https://salesmanpro.store/menu?table={qrModalTable.tableNumber}&store={companySlug}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
              >
                Print QR Sticker
              </button>
              <button
                onClick={() => setQrModalTable(null)}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
