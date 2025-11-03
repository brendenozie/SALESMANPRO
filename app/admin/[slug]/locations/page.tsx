"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { LocationFormModal } from "./LocationForm"; // Adjust import path
import { DeleteConfirmModal } from "./DeleteForm"; // Adjust import path
import { PlusIcon } from "@heroicons/react/24/solid";
import {
  BuildingLibraryIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  GlobeAltIcon,
  MapIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  SquaresPlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";


const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// --- Types: matches API response exactly ---
interface Location {
  id: string;             // companyLocation.id
  locationId: string;     // base location.id
  parentId: string | null;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  imageUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  capacity?: number | null;
  openHours?: string | null;
  status: "active" | "inactive" | "draft";
  sortOrder: number;
  visible: boolean;
  children?: Location[];
}


// --- Build tree from flat array ---
// const buildLocationTree = (locations: Location[]): Location[] => {
//   const map: Record<string, Location> = {};
//   const roots: Location[] = [];

//   locations.forEach((loc) => {
//     map[loc.id] = { ...loc, children: [] };
//   });

//   locations.forEach((loc) => {
//     if (loc.parentId && map[loc.parentId]) {
//       map[loc.parentId].children?.push(map[loc.id]);
//       map[loc.parentId].children?.sort((a, b) =>
//         a.name.localeCompare(b.name)
//       );
//     } else {
//       roots.push(map[loc.id]);
//     }
//   });

//   roots.sort((a, b) => a.name.localeCompare(b.name));
//   return roots;
// };

const buildLocationTree = (locations: Location[]): Location[] => {
  const map: Record<string, Location> = {};
  const roots: Location[] = [];

  // Build map keyed by locationId (not companyLocation.id)
  locations.length > 0 && locations.forEach((loc) => {
    map[loc.locationId] = { ...loc, children: [] };
  });

  locations.length > 0 && locations.forEach((loc) => {
    if (loc.parentId && map[loc.parentId]) {
      // attach child to parent using parentId (base location id)
      map[loc.parentId].children?.push(map[loc.locationId]);
      map[loc.parentId].children?.sort((a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)
      );
    } else {
      roots.push(map[loc.locationId]);
    }
  });

  // Sort roots as well
  roots.sort(
    (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)
  );

  return roots;
};


interface PageProps {
  params:Promise<{ slug: string }> // Assuming this page might still get a slug, though not used for global locations
}

export default async function LocationManagementPage({params}:PageProps) {

  const { slug: companyId } = await params;
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [parentForNewLocation, setParentForNewLocation] =
    useState<Location | null>(null);

  // Derive tree
  const locationTree = useMemo(() => buildLocationTree(locations), [locations]);

  // Fetch
 const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/locationsv2?companyId=${companyId}`,
        { 
          integrity: "same-origin",
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP error: ${res.status}`);
      }

      const result = await res.json();
      console.log(result);
      const data: Location[] = result.data.data || []; // <-- FIX: pick data array
      setLocations(data);
    } catch (err: any) {
      setError(`Failed to fetch locations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Handlers
  const handleOpenCreateModal = (parent: Location | null = null) => {
    setSelectedLocation(null);
    setParentForNewLocation(parent);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (location: Location) => {
    setSelectedLocation(location);
    setParentForNewLocation(null);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedLocation(null);
    setParentForNewLocation(null);
    setError(null);
  };

  const handleSuccess = () => {
    fetchLocations();
    handleCloseModals();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader
          count={locations.length}
          onAddNew={() => handleOpenCreateModal()}
        />

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow my-4"
            role="alert"
          >
            <p className="font-bold">An Error Occurred</p>
            <p>{error}</p>
          </div>
        )}

        <main className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          {loading ? (
            <div className="text-center py-12 text-slate-500">
              Loading Locations...
            </div>
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

      {/* Modals */}
      {isFormModalOpen && (
        <LocationFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleSuccess}
          location={selectedLocation}
          parent={parentForNewLocation}
          allLocations={locations}
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

// --- Header ---
function DashboardHeader({
  count,
  onAddNew,
}: {
  count: number;
  onAddNew: () => void;
}) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Location Management
        </h1>
        <p className="text-slate-500 mt-1">{count} locations in the database</p>
      </div>
      <button
        onClick={onAddNew}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
      >
        <PlusIcon className="w-6 h-6" />
        Add New Location
      </button>
    </header>
  );
}

// --- Tree View ---
function LocationTreeView({
  nodes,
  onEdit,
  onDelete,
  onAddChild,
}: {
  nodes: Location[];
  onEdit: (loc: Location) => void;
  onDelete: (loc: Location) => void;
  onAddChild: (parent: Location) => void;
}) {
  return (
    <div className="space-y-2">
      {nodes.map((n) => (
        <LocationNode
          key={n.id}
          node={n}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}

// --- Node ---
function LocationNode({
  node,
  onEdit,
  onDelete,
  onAddChild,
  level = 0,
}: {
  node: Location;
  onEdit: (loc: Location) => void;
  onDelete: (loc: Location) => void;
  onAddChild: (parent: Location) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;
  const icon =
    level === 0 ? (
      <GlobeAltIcon className="w-6 h-6 text-blue-500" />
    ) : level === 1 ? (
      <MapIcon className="w-6 h-6 text-green-500" />
    ) : (
      <BuildingLibraryIcon className="w-6 h-6 text-purple-500" />
    );

  return (
    <div>
      <div className="flex items-center bg-slate-50 hover:bg-slate-100 rounded-lg p-2">
        <div
          style={{ paddingLeft: `${level * 24}px` }}
          className="flex-grow flex items-center gap-3"
        >
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-full hover:bg-slate-200"
            >
              {expanded ? (
                <ChevronDoubleDownIcon className="w-6 h-6" />
              ) : (
                <ChevronDoubleUpIcon className="w-6 h-6" />
              )}
            </button>
          ) : (
            <span className="w-6 h-6 inline-block" />
          )}
          {icon}
          <span className="font-medium">{node.name}</span>
          <span className="text-xs text-slate-400">({node.slug})</span>
          {node.status !== "active" && (
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                node.status === "inactive"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {node.status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddChild(node)}
            className="p-2 rounded-md text-slate-500 hover:bg-green-100 hover:text-green-600"
          >
            <PlusCircleIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => onEdit(node)}
            className="p-2 rounded-md text-slate-500 hover:bg-blue-100 hover:text-blue-600"
          >
            <PencilSquareIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => onDelete(node)}
            className="p-2 rounded-md text-slate-500 hover:bg-red-100 hover:text-red-600"
          >
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="mt-1 space-y-1">
          {node.children?.map((c) => (
            <LocationNode
              key={c.id}
              node={c}
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

// --- Empty ---
function EmptyState({ onAddNew }: { onAddNew: () => void }) {
  return (
    <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-lg">
      <GlobeAltIcon className="w-10 h-10 mx-auto text-slate-300" />
      <h3 className="mt-4 text-xl font-semibold text-slate-800">
        No Locations Found
      </h3>
      <p className="mt-1 text-slate-500">
        Get started by creating your first top-level location.
      </p>
      <button
        onClick={onAddNew}
        className="mt-6 flex items-center gap-2 mx-auto px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
      >
        <SquaresPlusIcon className="w-6 h-6" />
        Create First Location
      </button>
    </div>
  );
}
