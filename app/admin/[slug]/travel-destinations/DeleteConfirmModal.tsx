"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  XMarkIcon,
  MapPinIcon,
  TrashIcon as TrashIconSolid,
  GlobeAmericasIcon,
} from '@heroicons/react/24/solid';
import {
  ExclamationCircleIcon,
  MapPinIcon as MapPinIconOutline,
  ChevronDownIcon,
  TagIcon,
  DocumentTextIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';

// --- Types and Interfaces ---
// These types are consistent with the Prisma schema and the user's code.
interface Destination {
  id: string;
  name: string;
  slug: string;
  description?: string;
  country?: string;
  continent?: string;
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
  localization?: any;
  attributes?: any;
  children?: Destination[];
}

// --- Helper Functions for Tree Structure and Dropdown ---

/**
 * Builds a tree structure from a flat list of destinations.
 * This is necessary for the `flattenDestinations` helper to work correctly.
 * @param destinations A flat array of Destination objects.
 * @returns A tree-like array of Destination objects.
 */
const buildDestinationTree = (destinations: Destination[]): Destination[] => {
  const destinationMap: { [key: string]: Destination } = {};
  const tree: Destination[] = [];
  destinations.forEach(d => {
    destinationMap[d.id] = { ...d, children: [] };
  });

  destinations.forEach(d => {
    if (d.parentId && destinationMap[d.parentId]) {
      destinationMap[d.parentId].children?.push(destinationMap[d.id]);
    } else {
      tree.push(destinationMap[d.id]);
    }
  });

  // Sort top-level nodes and their children for a cleaner UI
  const sortTree = (nodes: Destination[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(node => {
      if (node.children) {
        sortTree(node.children);
      }
    });
  };
  sortTree(tree);

  return tree;
};

/**
 * Recursively creates a flattened list of destinations with indentation for a dropdown.
 * This helper function prevents a destination from being its own parent or a descendant's parent.
 * @param destinations The array of destinations to flatten.
 * @param excludeId The ID of the destination being edited, to exclude it and its children.
 * @param indent The indentation string to apply to each destination name.
 * @param list The list to append to (used for recursion).
 * @returns A flattened, indented list of destinations.
 */
const flattenDestinations = (destinations: Destination[], excludeId: string | null = null, indent = '', list: { id: string; name: string }[] = []) => {
  destinations.forEach(destination => {
    if (destination.id === excludeId) {
      return;
    }

    list.push({ id: destination.id, name: `${indent}${destination.name}` });

    if (destination.children && destination.children.length > 0) {
      flattenDestinations(destination.children, excludeId, `${indent}— `, list);
    }
  });
  return list;
};


// --- Component: Destination Form Modal (for Create & Edit) ---
interface DestinationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  destination: Destination | null;
  allDestinations: Destination[];
}

export function DestinationFormModal({ isOpen, onClose, onSuccess, destination, allDestinations }: DestinationFormModalProps) {
  const isEditing = !!destination;
  const [formData, setFormData] = useState<Omit<Destination, 'id' | 'createdAt' | 'updatedAt' | 'children' | 'localization' | 'attributes'>>(() => ({
    name: destination?.name || '',
    slug: destination?.slug || '',
    description: destination?.description || '',
    country: destination?.country || '',
    continent: destination?.continent || '',
    latitude: destination?.latitude || 0,
    longitude: destination?.longitude || 0,
    seoTitle: destination?.seoTitle || '',
    seoDescription: destination?.seoDescription || '',
    metaKeywords: destination?.metaKeywords || [],
    sortOrder: destination?.sortOrder || 0,
    visible: destination?.visible || true,
    status: destination?.status || 'draft',
    parentId: destination?.parentId || null,
    createdBy: destination?.createdBy || '',
    updatedBy: destination?.updatedBy || '',
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the dropdown options to avoid unnecessary recalculations
  const parentOptions = useMemo(() => {
    const destinationTree = buildDestinationTree(allDestinations);
    return flattenDestinations(destinationTree, destination?.id || null);
  }, [allDestinations, destination?.id]);
  
  // Helper to find a destination by its ID from the flat list
  const findDestinationById = (id: string | null) => {
    return allDestinations.find(d => d.id === id);
  };

  // Effect to handle changes in the parentId
  useEffect(() => {
    const parent = findDestinationById(formData.parentId);
    if (parent) {
      // If a parent is selected, automatically populate continent and country
      setFormData(prev => ({
        ...prev,
        continent: parent.continent || '',
        country: parent.country || ''
      }));
    } else {
      // If no parent is selected, clear the fields
      setFormData(prev => ({
        ...prev,
        continent: '',
        country: ''
      }));
    }
  }, [formData.parentId, allDestinations]);

  useEffect(() => {
    if (isEditing && destination) {
      setFormData({
        name: destination.name,
        slug: destination.slug,
        description: destination.description || '',
        country: destination.country || '',
        continent: destination.continent || '',
        latitude: destination.latitude || 0,
        longitude: destination.longitude || 0,
        seoTitle: destination.seoTitle || '',
        seoDescription: destination.seoDescription || '',
        metaKeywords: destination.metaKeywords || [],
        sortOrder: destination.sortOrder || 0,
        visible: destination.visible,
        status: destination.status,
        parentId: destination.parentId || null,
        createdBy: destination.createdBy || '',
        updatedBy: destination.updatedBy || '',
      });
    }
  }, [destination, isEditing]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0);
    setFormData(prev => ({ ...prev, metaKeywords: keywords }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation check: ensure required fields are not empty
    if (!formData.name || !formData.description) {
        setError("Please fill out all required fields: Name, and Description.");
        setLoading(false);
        return;
    }

    const apiEndpoint = isEditing ? `/api/admin/destinations/${destination?.id}` : '/api/admin/destinations';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      onSuccess();
    } catch (err: any) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} destination: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl transform transition-all scale-100 opacity-100 animate-fade-in">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
              <MapPinIcon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Destination' : 'Create New Destination'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl mb-4" role="alert">
            <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Destination Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIconOutline className="w-5 h-5 text-gray-400" />
                </div>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Slug</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TagIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input type="text" id="slug" name="slug" value={formData.slug} onChange={handleChange} required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
              </div>
            </div>
            <div className="relative md:col-span-2">
              <label htmlFor="parentId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Parent Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                </div>
                <select id="parentId" name="parentId" value={formData.parentId || ''} onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-colors">
                  <option value="">No Parent (Top-Level)</option>
                  {parentOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label htmlFor="continent" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Continent</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GlobeAmericasIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input type="text" id="continent" name="continent" value={formData.continent} disabled
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-colors" />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="country" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Country</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIconOutline className="w-5 h-5 text-gray-400" />
                </div>
                <input type="text" id="country" name="country" value={formData.country} disabled
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-colors" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                <DocumentTextIcon className="w-5 h-5 text-gray-400" />
              </div>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label htmlFor="seoTitle" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">SEO Title</label>
              <input type="text" id="seoTitle" name="seoTitle" value={formData.seoTitle} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div className="relative">
              <label htmlFor="seoDescription" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">SEO Description</label>
              <input type="text" id="seoDescription" name="seoDescription" value={formData.seoDescription} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
          </div>

          <div>
            <label htmlFor="metaKeywords" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Meta Keywords (comma separated)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TagIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input type="text" id="metaKeywords" name="metaKeywords" placeholder="e.g., adventure, travel, safari" value={formData.metaKeywords.join(', ')} onChange={handleKeywordsChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label htmlFor="sortOrder" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Sort Order</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HashtagIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input type="number" id="sortOrder" name="sortOrder" value={formData.sortOrder} onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <div className="relative">
                <select id="status" name="status" value={formData.status} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-colors">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="visible" className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="visible" name="visible" checked={formData.visible} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-gray-300">Visible on Frontend</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-full shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 text-sm font-semibold text-white rounded-full shadow-lg transition-all transform hover:scale-105 ${loading ? 'bg-indigo-400' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
            >
              {loading ? 'Saving...' : isEditing ? 'Update Destination' : 'Create Destination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Component: Delete Confirmation Modal ---
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  destination: Destination;
}

export function DeleteConfirmModal({ isOpen, onClose, onSuccess, destination }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/destinations/${destination.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      onSuccess();
    } catch (err: any) {
      setError(`Failed to delete destination: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-100 opacity-100 animate-fade-in">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300">
              <TrashIconSolid className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Confirm Deletion
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl mb-4" role="alert">
            <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="mt-4 text-gray-700 dark:text-gray-300">
          <p className="text-lg">Are you sure you want to delete the destination: <span className="font-bold text-red-600 dark:text-red-400">{destination.name}</span>?</p>
          <p className="mt-2 text-sm text-red-500 dark:text-red-400">This action cannot be undone.</p>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-full shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className={`px-6 py-2.5 text-sm font-semibold text-white rounded-full shadow-lg transition-all transform hover:scale-105 ${loading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'}`}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
