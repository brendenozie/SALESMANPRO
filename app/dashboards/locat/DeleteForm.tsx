"use client";

import { BellAlertIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

// --- Type Definitions ---
interface Location {
  id: string;
  name: string;
  children?: Location[];
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  location: Location | null;
}


// --- The Enhanced Delete Confirmation Modal Component ---
export function DeleteConfirmModal({ isOpen, onClose, onSuccess, location }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state every time the modal opens
      setLoading(false);
      setError(null);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/locations/${location.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
      });

      if (!response.ok) {
        const errData = await response.json();
        // Provide a more user-friendly error message
        if (response.status === 409) { // 409 Conflict is a good status for this case
            throw new Error(errData.message || 'Cannot delete this location because it has children. Please re-assign or delete the child locations first.');
        }
        throw new Error(errData.message || 'Failed to delete location.');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !location) return null;

  const hasChildren = location.children && location.children.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <BellAlertIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Delete Location
            </h3>
            <div className="mt-2 text-sm text-slate-500 space-y-2">
              <p>
                Are you sure you want to permanently delete <strong className="text-slate-700">"{location.name}"</strong>?
              </p>
              {hasChildren && (
                 <p className="p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
                   <strong>Warning:</strong> This location has child items. You may need to delete them first.
                 </p>
              )}
              <p>This action cannot be undone.</p>
            </div>

            {error && (
              <div className="mt-4 w-full text-left bg-red-100 border border-red-200 text-sm text-red-800 p-3 rounded-md" role="alert">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        <footer className="flex justify-end gap-3 px-6 py-4 bg-slate-50/50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || hasChildren}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </footer>
      </div>
    </div>
  );
}