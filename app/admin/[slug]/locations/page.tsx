// app/admin/locations/page.tsx (or wherever your page file is located)
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LocationFormModal } from './LocationForm'; // Adjust import path
import { DeleteConfirmModal } from './DeleteForm'; // Adjust import path
import { PlusIcon } from '@heroicons/react/24/solid';
import { BuildingLibraryIcon, ChevronDoubleDownIcon, ChevronDoubleUpIcon, GlobeAltIcon, MapIcon, PencilSquareIcon, PlusCircleIcon, SquaresPlusIcon, TrashIcon } from '@heroicons/react/24/outline';

// --- Types and Interfaces ---
// Ensure this Location interface matches your Prisma Location model exactly
interface Location {
  id: string;
  name: string;
  slug: string;
  description?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords: string[];
  sortOrder: number;
  visible: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  status: 'active' | 'inactive' | 'draft';
  parentId: string | null;
  localization?: any; // Prisma.JsonValue
  attributes?: any; // Prisma.JsonValue
  children?: Location[]; // Added for client-side tree building
}

interface PageProps {
  params: { slug: string; }; // Assuming this page might still get a slug, though not used for global locations
}

// --- Helper Function to Build the Tree ---
const buildLocationTree = (locations: Location[]): Location[] => {
  const locationMap: { [key: string]: Location } = {};
  const tree: Location[] = [];

  // First, map all locations by their ID and initialize children array
  locations.forEach(location => {
    locationMap[location.id] = { ...location, children: [] };
  });

  // Then, build the tree structure
  locations.forEach(location => {
    if (location.parentId && locationMap[location.parentId]) {
      locationMap[location.parentId].children?.push(locationMap[location.id]);
      // Sort children for consistent display
      locationMap[location.parentId].children?.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      tree.push(locationMap[location.id]);
    }
  });
  // Sort top-level nodes
  tree.sort((a, b) => a.name.localeCompare(b.name));
  return tree;
};


// Main Enhanced Location Management Component
export default function LocationManagementPage({ params }: PageProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modals and forms
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [parentForNewLocation, setParentForNewLocation] = useState<Location | null>(null);

  // Derive the tree structure from the flat list of locations
  const locationTree = useMemo(() => buildLocationTree(locations), [locations]);

  // --- Data Fetching ---
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/locations'); // Correct API endpoint for global locations
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setLocations(data.data || []); // Assuming API returns { data: [...] }
    } catch (err: any) {
      setError(`Failed to fetch locations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // --- Action Handlers ---
  const handleOpenCreateModal = (parent: Location | null = null) => {
    setSelectedLocation(null); // Clear selected location for create operation
    setParentForNewLocation(parent); // Set parent if adding a child
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (location: Location) => {
    setSelectedLocation(location); // Set location for edit operation
    setParentForNewLocation(null); // Clear parent for edit operation
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (location: Location) => {
    setSelectedLocation(location); // Set location for delete operation
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedLocation(null);
    setParentForNewLocation(null);
    setError(null); // Clear errors when closing a modal
  };

  const handleSuccess = () => {
    fetchLocations(); // Re-fetch all locations after successful CRUD operation
    handleCloseModals(); // Close the modal
  };

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader count={locations.length} onAddNew={() => handleOpenCreateModal()} />

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow my-4" role="alert">
            <p className="font-bold">An Error Occurred</p>
            <p>{error}</p>
          </div>
        )}

        <main className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading Locations...</div>
          ) : locationTree.length === 0 ? (
            <EmptyState onAddNew={() => handleOpenCreateModal()} />
          ) : (
            <LocationTreeView
              nodes={locationTree}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              onAddChild={handleOpenCreateModal}
            />
          )}
        </main>
      </div>

      {/* Modals are mounted here */}
      {isFormModalOpen && (
        <LocationFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleSuccess}
          location={selectedLocation}
          parent={parentForNewLocation}
          allLocations={locations} // Pass all locations for parent dropdown
        />
      )}

      {isDeleteModalOpen && selectedLocation && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleSuccess}
          location={selectedLocation}
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
        <h1 className="text-3xl font-bold text-slate-900">Location Management</h1>
        <p className="text-slate-500 mt-1">{count} locations in the database</p>
      </div>
      <button
        onClick={onAddNew}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
      >
        <PlusIcon className='w-6 h-6' />
        Add New Location
      </button>
    </header>
  );
}


// --- Component: Location Tree View ---
function LocationTreeView({ nodes, onEdit, onDelete, onAddChild }: { nodes: Location[], onEdit: (loc: Location) => void, onDelete: (loc: Location) => void, onAddChild: (parent: Location) => void }) {
  return (
    <div className="space-y-2">
      {nodes.map(node => (
        <LocationNode
          key={node.id}
          node={node}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}


// --- Component: Individual Location Node ---
function LocationNode({ node, onEdit, onDelete, onAddChild, level = 0 }: { node: Location, onEdit: (loc: Location) => void, onDelete: (loc: Location) => void, onAddChild: (parent: Location) => void, level?: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 1); // Auto-expand top levels

  const hasChildren = node.children && node.children.length > 0;
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
          <button onClick={() => onAddChild(node)} title="Add Child" className="p-2 rounded-md text-slate-500 hover:bg-green-100 hover:text-green-600">
            <PlusCircleIcon className='w-6 h-6' />
          </button>
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
            <LocationNode
              key={childNode.id}
              node={childNode}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
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
      <h3 className="mt-4 text-xl font-semibold text-slate-800">No Locations Found</h3>
      <p className="mt-1 text-slate-500">Get started by creating your first top-level location (e.g., a continent or country).</p>
      <button
        onClick={onAddNew}
        className="mt-6 flex items-center gap-2 mx-auto px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
      >
        <SquaresPlusIcon className='w-6 h-6'/> {/* Changed to w-6 h-6 for consistency */}
        Create First Location
      </button>
    </div>
  );
}
