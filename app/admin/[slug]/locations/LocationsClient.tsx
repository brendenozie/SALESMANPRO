"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { LocationFormModal } from "./LocationForm"; 
import { DeleteConfirmModal } from "./DeleteForm"; 
import {
  BuildingLibraryIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  MapIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  FolderPlusIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

interface Location {
  id: string;
  locationId: string;
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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

const buildLocationTree = (locations: Location[]): Location[] => {
  const map: Record<string, Location> = {};
  const roots: Location[] = [];

  if (!locations || locations.length === 0) return [];

  locations.forEach((loc) => {
    map[loc.locationId] = { ...loc, children: [] };
  });

  locations.forEach((loc) => {
    if (loc.parentId && map[loc.parentId]) {
      map[loc.parentId].children?.push(map[loc.locationId]);
      map[loc.parentId].children?.sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)
      );
    } else if (!loc.parentId) {
      roots.push(map[loc.locationId]);
    }
  });

  roots.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
  return roots;
};

interface LocationsClientProps {
  initialLocations: Location[];
  companyId: string;
}

export default function LocationsClient({ initialLocations, companyId }: LocationsClientProps) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [loading, setLoading] = useState(!initialLocations?.length);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [parentForNewLocation, setParentForNewLocation] = useState<Location | null>(null);

  const locationTree = useMemo(() => buildLocationTree(locations), [locations]);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/locationsv2?companyId=${companyId}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const result = await res.json();
      setLocations(result.data?.data || result.data || []);
    } catch (err: any) {
      setError(`Failed to live-sync your locations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (initialLocations && initialLocations.length > 0) {
      setLocations(initialLocations);
      setLoading(false);
    } else {
      fetchLocations();
    }
  }, [initialLocations, fetchLocations]);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Location Workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your network hierarchy across <span className="font-semibold text-indigo-600 dark:text-indigo-400">{locations.length}</span> physical hubs.
          </p>
        </div>
        <button
          onClick={() => handleOpenCreateModal(null)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold text-sm transition-all shadow-md active:scale-95"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          Add Hub Location
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
          <p className="font-semibold">Sync Interrupted</p>
          <p className="opacity-90">{error}</p>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/50 shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Assembling structure...</p>
          </div>
        ) : locationTree.length === 0 ? (
          <div className="text-center py-20 px-4 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-4">
              <MapPinIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No nodes established</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Create your foundational root zone coordinates to unlock inventory and workspace routing.
            </p>
            <button
              onClick={() => handleOpenCreateModal(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition shadow-sm"
            >
              <PlusIcon className="w-4 h-4 stroke-[2.5]" />
              Establish First Root
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-3">
            <LocationTreeView
              nodes={locationTree}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              onAddChild={handleOpenCreateModal}
            />
          </div>
        )}
      </div>

      {/* Forms Framework modals */}
      {isFormModalOpen && (
        <LocationFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={() => { fetchLocations(); setIsFormModalOpen(false); }}
          location={selectedLocation}
          parent={parentForNewLocation}
          allLocations={locations}
        />
      )}

      {isDeleteModalOpen && selectedLocation && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={() => { fetchLocations(); setIsDeleteModalOpen(false); }}
          location={selectedLocation}
        />
      )}
    </div>
  );
}

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
      {nodes.map((node) => (
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const nodeIcons = [
    <GlobeAltIcon key="0" className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
    <MapIcon key="1" className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
    <BuildingLibraryIcon key="2" className="w-5 h-5 text-violet-500 dark:text-violet-400" />,
  ];
  const renderedIcon = nodeIcons[Math.min(level, nodeIcons.length - 1)];

  return (
    <div className="group relative">
      <div 
        className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 border border-slate-200/40 dark:border-slate-800/20 transition-all duration-200"
        style={{ marginLeft: `${typeof window !== 'undefined' && window.innerWidth > 640 ? level * 20 : 0}px` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
            >
              {expanded ? <ChevronDownIcon className="w-4 h-4 stroke-[2.5]" /> : <ChevronRightIcon className="w-4 h-4 stroke-[2.5]" />}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
          )}

          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            {renderedIcon}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{node.name}</span>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">/{node.slug}</span>
            </div>
            {node.city && (
              <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{node.city}{node.country ? `, ${node.country}` : ''}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${
              node.status === "active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                : node.status === "inactive"
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
            }`}
          >
            {node.status}
          </span>

          {/* Desktop Controls (Hidden on Mobile viewports) */}
          <div className="hidden md:flex items-center gap-0.5 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 p-1 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
            <button
              onClick={() => onAddChild(node)}
              className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition"
              title="Add nested subunit"
            >
              <FolderPlusIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(node)}
              className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition"
              title="Modify Node"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(node)}
              className="p-1.5 rounded-md text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
              title="Remove Node"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Utility Actions Button */}
          <div className="relative md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
            {mobileMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMobileMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-20 p-1 py-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <button
                    onClick={() => { onAddChild(node); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg"
                  >
                    <FolderPlusIcon className="w-4 h-4" /> Add Subunit
                  </button>
                  <button
                    onClick={() => { onEdit(node); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg"
                  >
                    <PencilSquareIcon className="w-4 h-4" /> Edit Details
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                  <button
                    onClick={() => { onDelete(node); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                  >
                    <TrashIcon className="w-4 h-4" /> Delete Location
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="mt-1 relative">
          {/* Subtle vertical connector guide line for nesting visualization */}
          <div 
            className="hidden sm:block absolute left-0 top-0 bottom-3 w-px bg-slate-200 dark:bg-slate-800"
            style={{ marginLeft: `${level * 20 + 12}px` }}
          />
          <div className="space-y-1">
            {node.children?.map((child) => (
              <LocationNode
                key={child.id}
                node={child}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}