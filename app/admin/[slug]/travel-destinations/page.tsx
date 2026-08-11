"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  PlusIcon, 
  GlobeAltIcon, 
  MapIcon, 
  BuildingLibraryIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  SquaresPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

import { DestinationFormModal, DeleteConfirmModal, Destination } from './DestinationFormModal';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

interface Location {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  children?: Location[];
}

// --- Hierarchical Tree Builder ---
const buildDestinationTree = (destinations: Destination[]): Destination[] => {
  const destinationMap: { [key: string]: Destination } = {};
  const tree: Destination[] = [];

  destinations?.forEach(destination => {
    destinationMap[destination.id] = { ...destination, children: [] };
  });

  destinations?.forEach(destination => {
    if (destination.parentId && destinationMap[destination.parentId]) {
      destinationMap[destination.parentId].children?.push(destinationMap[destination.id]);
      destinationMap[destination.parentId].children?.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      tree.push(destinationMap[destination.id]);
    }
  });

  tree.sort((a, b) => a.name.localeCompare(b.name));
  return tree;
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DestinationManagementPage({ params }: PageProps) {
  const { slug } = await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & configuration state states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const destinationTree = useMemo(() => buildDestinationTree(destinations), [destinations]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [destinationsResponse, locationsResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/destinations?companyId=${companyId}`, { credentials: 'include' }),
        fetch(`${apiBaseUrl}/admin/locationsv2?companyId=${companyId}`, { credentials: 'include' })
      ]);

      if (!destinationsResponse.ok) {
        const errorData = (await destinationsResponse.json()).data;
        throw new Error(errorData.error || `HTTP error! Status: ${destinationsResponse.status}`);
      }
      if (!locationsResponse.ok) {
        const errorData = (await locationsResponse.json()).data;
        throw new Error(errorData.error || `HTTP error! Status: ${locationsResponse.status}`);
      }

      const destinationsData = (await destinationsResponse.json()).data.data;
      const locationsData = (await locationsResponse.json()).data.data;

      setDestinations(destinationsData || []);
      setLocations(locationsData || []);
    } catch (err: any) {
      setError(`Failed to fetch data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreateModal = () => {
    setSelectedDestination(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedDestination(null);
    setError(null);
  };

  const handleSuccess = () => {
    fetchData();
    handleCloseModals();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Main Dashboard Control Banner */}
        <DashboardHeader count={destinations.length} onAddNew={handleOpenCreateModal} />

        {/* Global Error Notice Overlay */}
        {error && (
          <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-4 rounded-2xl backdrop-blur-md shadow-sm" role="alert">
            <ExclamationTriangleIcon className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <p className="font-bold text-sm">System Pipeline Exception</p>
              <p className="text-xs opacity-90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Primary Operational Console view */}
        <main className="bg-white/80 border border-slate-200/80 p-4 sm:p-6 rounded-[28px] shadow-sm backdrop-blur-md dark:bg-slate-900/70 dark:border-slate-800/80">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <svg className="animate-spin h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Syncing structural nodes...</span>
            </div>
          ) : destinationTree.length === 0 ? (
            <EmptyState onAddNew={handleOpenCreateModal} />
          ) : (
            <div>
              <div className="mb-4 px-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <span>Architecture Structure Matrix</span>
                <span>Actions Scope</span>
              </div>
              <DestinationTreeView
                nodes={destinationTree}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals Mounting Sandbox */}
      {isFormModalOpen && (
        <DestinationFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleSuccess}
          destination={selectedDestination}
          allLocations={locations}
        />
      )}

      {isDeleteModalOpen && selectedDestination && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleSuccess}
          destination={selectedDestination}
        />
      )}
    </div>
  );
}

// --- Component: Dashboard Header ---
function DashboardHeader({ count, onAddNew }: { count: number, onAddNew: () => void }) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-200/60 bg-white/60 dark:border-slate-800/50 dark:bg-slate-900/40 rounded-[28px] p-6 backdrop-blur-md">
      <div>
        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
          Geographical Nodes
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          System currently managing <span className="font-bold text-indigo-600 dark:text-indigo-400">{count} active bound destinations</span>
        </p>
      </div>
      <button
        onClick={onAddNew}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-all duration-200"
      >
        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
        Create New Node
      </button>
    </header>
  );
}

// --- Component: Destination Tree View ---
function DestinationTreeView({ nodes, onEdit, onDelete }: { nodes: Destination[], onEdit: (loc: Destination) => void, onDelete: (loc: Destination) => void }) {
  return (
    <div className="space-y-2">
      {nodes.map(node => (
        <DestinationNode
          key={node.id}
          node={node}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// --- Component: Individual Destination Node ---
function DestinationNode({ node, onEdit, onDelete, level = 0 }: { node: Destination, onEdit: (loc: Destination) => void, onDelete: (loc: Destination) => void, level?: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;

  // Level-dependent geometric representation assets
  const locationTypeIcon = level === 0 
    ? <GlobeAltIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> 
    : level === 1 
      ? <MapIcon className="text-emerald-500 dark:text-emerald-400 w-4 h-4" /> 
      : <BuildingLibraryIcon className="text-amber-500 dark:text-amber-400 w-4 h-4" />;

  const getStatusChipStyle = (status: string) => {
    return status === 'inactive'
      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  };

  return (
    <div className="w-full">
      <div 
        className={`flex items-center justify-between rounded-xl p-2.5 transition-all duration-200 border border-transparent hover:bg-slate-50 dark:hover:bg-slate-950/60 group ${
          isExpanded && hasChildren ? 'bg-slate-50/50 dark:bg-slate-950/20' : ''
        }`}
      >
        {/* Geometric Nesting Alignment */}
        <div className="flex items-center min-w-0 flex-1" style={{ paddingLeft: `${level * 20}px` }}>
          <div className="w-6 h-6 flex items-center justify-center shrink-0 mr-1">
            {hasChildren ? (
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="p-1 rounded-md text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                {isExpanded ? <ChevronDownIcon className="w-3.5 h-3.5" /> : <ChevronUpIcon className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            )}
          </div>
          
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shrink-0">
              {locationTypeIcon}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                {node.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate sm:mt-0.5">
                /{node.slug}
              </span>
            </div>
          </div>

          {/* Visibility and Metadata Tags */}
          {node.status !== 'active' && (
            <span className={`ml-3 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 ${getStatusChipStyle(node.status)}`}>
              {node.status}
            </span>
          )}
        </div>

        {/* Context Interaction Toolbelt */}
        <div className="flex items-center gap-1 ml-4 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(node)} 
            title="Edit settings" 
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white hover:text-slate-900 shadow-none hover:shadow-sm border border-transparent hover:border-slate-200/60 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-700 transition-all"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(node)} 
            title="Purge node record" 
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-all"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nested Level Processing Recursion */}
      {hasChildren && isExpanded && (
        <div className="mt-1 relative before:absolute before:left-[11px] before:top-0 before:bottom-3 before:w-[1px] before:bg-slate-200/60 dark:before:bg-slate-800/60">
          <div className="space-y-1">
            {node.children?.map(childNode => (
              <DestinationNode
                key={childNode.id}
                node={childNode}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Component: Empty State ---
function EmptyState({ onAddNew }: { onAddNew: () => void }) {
  return (
    <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-3xl dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/10">
      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-600">
        <SquaresPlusIcon className="w-6 h-6" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">Structural Node Layout Empty</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
        Your catalog framework does not have top-level tracking configurations loaded yet.
      </p>
      <button
        onClick={onAddNew}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all"
      >
        <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
        Bind Primary Destination
      </button>
    </div>
  );
}