"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { BuildingLibraryIcon, ChevronDoubleDownIcon, ChevronDoubleUpIcon, GlobeAltIcon, MapIcon, PencilSquareIcon, SquaresPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DestinationFormModal, DeleteConfirmModal, Destination } from './DestinationFormModal'; // Assuming modals are now in a single file for cleaner import

import { useParams } from 'next/navigation';

const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- Types and Interfaces ---
// Ensure this Destination interface matches your Prisma Destination model exactly
// interface Destination {
//   id: string;
//   name: string;
//   slug: string;
//   description?: string;
//   country?: string;
//   latitude?: number;
//   longitude?: number;
//   seoTitle?: string;
//   seoDescription?: string;
//   metaKeywords: string[];
//   sortOrder: number;
//   visible: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
//   createdBy?: string;
//   updatedBy?: string;
//   status: 'active' | 'inactive' | 'draft';
//   parentId: string | null; // This now refers to a Location's ID
//   localization?: any; // Prisma.JsonValue
//   attributes?: any; // Prisma.JsonValue
//   children?: Destination[]; // This is for client-side tree building if needed, but not in the new model
// }

// Interface for Location
interface Location {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  children?: Location[];
}


interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper Function to Build the Tree ---
/**
 * Builds a hierarchical tree structure from a flat list of destinations.
 * NOTE: This function is kept for a potential destination-only tree view.
 * If a Location-Destination tree is needed, a new helper would be required.
 * @param destinations A flat array of destinations.
 * @returns An array of top-level destination nodes with their children nested.
 */
const buildDestinationTree = (destinations: Destination[]): Destination[] => {
  const destinationMap: { [key: string]: Destination } = {};
  const tree: Destination[] = [];

  // First, map all destinations by their ID and initialize children array
  destinations?.forEach(destination => {
    destinationMap[destination.id] = { ...destination, children: [] };
  });

  // Then, build the tree structure by assigning children to their parents
  destinations?.forEach(destination => {
    if (destination.parentId && destinationMap[destination.parentId]) {
      // This logic assumes a Destination can be a child of another Destination,
      // which is no longer the case per the user's latest request.
      // This helper may be updated or replaced if the UI needs to reflect the Location -> Destination hierarchy.
      destinationMap[destination.parentId].children?.push(destinationMap[destination.id]);
      // Sort children for consistent display
      destinationMap[destination.parentId].children?.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      tree.push(destinationMap[destination.id]);
    }
  });
  // Sort top-level nodes
  tree.sort((a, b) => a.name.localeCompare(b.name));
  return tree;
};


// Main Enhanced Destination Management Component
export default function DestinationManagementPage() {
  
  const params = useParams();
  const slug = params.slug as string;

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modals and forms
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  // The tree view is still based on the destination hierarchy
  const destinationTree = useMemo(() => buildDestinationTree(destinations), [destinations]);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [destinationsResponse, locationsResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/destinations?companyId=${slug}`,{ credentials: 'include' }),
        fetch(`${apiBaseUrl}/admin/locationsv2?companyId=${slug}`,{ credentials: 'include' })
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

      console.log("Fetched Destinations:", destinationsData);
      console.log("Fetched Locations:", locationsData);

      setDestinations(destinationsData || []);
      setLocations(locationsData || []);
    } catch (err: any) {
      setError(`Failed to fetch data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Action Handlers ---
  const handleOpenCreateModal = () => {
    setSelectedDestination(null); // Clear selected destination for create operation
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (destination: Destination) => {
    setSelectedDestination(destination); // Set destination for edit operation
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (destination: Destination) => {
    setSelectedDestination(destination); // Set destination for delete operation
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedDestination(null);
    setError(null); // Clear errors when closing a modal
  };

  const handleSuccess = () => {
    fetchData(); // Re-fetch all data after successful CRUD operation
    handleCloseModals(); // Close the modal
  };

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader count={destinations.length} onAddNew={handleOpenCreateModal} />

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow my-4" role="alert">
            <p className="font-bold">An Error Occurred</p>
            <p>{error}</p>
          </div>
        )}

        <main className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading Destinations...</div>
          ) : destinationTree.length === 0 ? (
            <EmptyState onAddNew={handleOpenCreateModal} />
          ) : (
            <DestinationTreeView
              nodes={destinationTree}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
          )}
        </main>
      </div>

      {/* Modals are mounted here */}
      {isFormModalOpen && (
        <DestinationFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleSuccess}
          destination={selectedDestination}
          allLocations={locations} // Pass all locations for parent dropdown
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
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Destination Management</h1>
        <p className="text-slate-500 mt-1">{count} destinations in the database</p>
      </div>
      <button
        onClick={onAddNew}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
      >
        <PlusIcon className='w-6 h-6' />
        Add New Destination
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
  const [isExpanded, setIsExpanded] = useState(level < 1); // Auto-expand top levels

  const hasChildren = node.children && node.children.length > 0;
  // Using the same icon logic as the original component
  const locationTypeIcon = level === 0 ? <GlobeAltIcon className='w-6 h-6 text-blue-500' /> : level === 1 ? <MapIcon className="text-green-500 w-6 h-6" /> : <BuildingLibraryIcon className="text-purple-500 w-6 h-6" />;

  return (
    <div>
      <div className="flex items-center bg-slate-50 hover:bg-slate-100 rounded-lg p-2 transition-colors duration-150">
        <div style={{ paddingLeft: `${level * 24}px` }} className="flex-grow flex items-center gap-3">
          {hasChildren ? (
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-full hover:bg-slate-200">
              {isExpanded ? <ChevronDoubleDownIcon className='w-6 h-6' /> : <ChevronDoubleUpIcon className='w-6 h-6' />}
            </button>
          ) : (
            <span className="w-6 h-6 inline-block"></span> // Placeholder for alignment
          )}
          {locationTypeIcon}
          <span className="font-medium text-slate-800">{node.name}</span>
          <span className="text-xs text-slate-400">({node.slug})</span>
          {node.status !== 'active' && (
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${node.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
              {node.status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(node)} title="Edit" className="p-2 rounded-md text-slate-500 hover:bg-blue-100 hover:text-blue-600">
            <PencilSquareIcon className='w-6 h-6' />
          </button>
          <button onClick={() => onDelete(node)} title="Delete" className="p-2 rounded-md text-slate-500 hover:bg-red-100 hover:text-red-600">
            <TrashIcon className='w-6 h-6' />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
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
      )}
    </div>
  );
}


// --- Component: Empty State ---
function EmptyState({ onAddNew }: { onAddNew: () => void }) {
  return (
    <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-lg">
      <GlobeAltIcon className='w-10 h-10 mx-auto text-slate-300' />
      <h3 className="mt-4 text-xl font-semibold text-slate-800">No Destinations Found</h3>
      <p className="mt-1 text-slate-500">Get started by creating your first top-level destination.</p>
      <button
        onClick={onAddNew}
        className="mt-6 flex items-center gap-2 mx-auto px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
      >
        <SquaresPlusIcon className='w-6 h-6'/>
        Create First Destination
      </button>
    </div>
  );
}
