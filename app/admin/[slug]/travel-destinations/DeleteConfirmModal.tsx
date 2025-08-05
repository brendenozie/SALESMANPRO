"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

// --- Types and Interfaces (Copied from DestinationManagementPage) ---
interface Destination {
  id: string;
  name: string;
  slug: string;
  description?: string;
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
  children?: Destination[]; // Added for client-side tree building
}

// --- Helper Function to Build a Flat List of Locations for the Parent Dropdown ---
/**
 * Recursively creates a flattened list of destinations with indentation for a dropdown.
 * This helper function prevents a destination from being its own parent or a descendant's parent.
 * @param destinations The array of destinations to flatten.
 * @param parentId The ID of the destination being edited, to exclude it and its children.
 * @param indent The indentation string to apply to each destination name.
 * @param list The list to append to (used for recursion).
 * @returns A flattened, indented list of destinations.
 */
const flattenDestinations = (destinations: Destination[], excludeId: string | null = null, indent = '', list: { id: string; name: string }[] = []) => {
    destinations.forEach(destination => {
        // Exclude the current node and its children from the parent selection list
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


// --- Component: Delete Confirmation Modal ---
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  destination: Destination; // Must be an object for deletion
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Confirm Deletion
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow my-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="mt-4 text-gray-700">
          <p>Are you sure you want to delete the destination: <span className="font-semibold">{destination.name}</span>?</p>
          <p className="mt-2 text-sm text-red-500">This action cannot be undone.</p>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${loading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}`}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
