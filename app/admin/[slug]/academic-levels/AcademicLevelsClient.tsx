'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AcademicCapIcon, // For overall academic levels
  PlusCircleIcon, // For add academic level
  PencilIcon, // For edit
  TrashIcon, // For delete
  MagnifyingGlassIcon, // For search
  CalendarDaysIcon, // For date
  TagIcon, // For individual academic level
  XMarkIcon, // For error close button
} from '@heroicons/react/24/outline';

import AcademicLevelFormModal from './AcademicLevelFormModal'; // Import the new modal component

// --- Type Definitions (matching API response) ---
export type AcademicLevelType = {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

interface AcademicLevelsClientProps {
  initialAcademicLevels: AcademicLevelType[];
  companyId: string;
  apiUrl: string;
}

export default function AcademicLevelsClient({ initialAcademicLevels, companyId, apiUrl }: AcademicLevelsClientProps) {
  const [academicLevels, setAcademicLevels] = useState<AcademicLevelType[]>(initialAcademicLevels);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAcademicLevel, setEditingAcademicLevel] = useState<AcademicLevelType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // --- Data Fetching and Management ---
  const fetchAcademicLevels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`);
      if (res.ok) {
        const data: AcademicLevelType[] = await res.json();
        setAcademicLevels(data.sort((a, b) => a.sortOrder - b.sortOrder)); // Ensure sorted by sortOrder
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch academic levels.");
        setAcademicLevels(initialAcademicLevels); // Fallback to initial data on client-side fetch error
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching academic levels.");
      setAcademicLevels(initialAcademicLevels); // Fallback to initial data on network error
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, companyId, initialAcademicLevels]);

  useEffect(() => {
    // If initial data from server is empty, try fetching on client side
    if (initialAcademicLevels.length === 0) {
      fetchAcademicLevels();
    }
  }, [fetchAcademicLevels, initialAcademicLevels]);


  const filteredAcademicLevels = useMemo(() => {
    return academicLevels.filter(level => {
      const matchesSearch = (level.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (level.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (level.sortOrder.toString().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [academicLevels, searchTerm]);

  // --- API Interaction Functions ---
  const handleSaveAcademicLevel = async (academicLevelData: Omit<AcademicLevelType, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    setIsLoading(true);
    setError(null);
    
    const method = academicLevelData.id ? 'PATCH' : 'POST';

    try {

      const url = academicLevelData.id ? `${apiUrl}/admin/academic-levels/${academicLevelData.id}` : `${apiUrl}/admin/academic-levels`;

      const payload = {
        ...academicLevelData,
        companyId: companyId, // Ensure companyId is always included
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchAcademicLevels(); // Re-fetch to get the latest data
        setShowFormModal(false);
        setEditingAcademicLevel(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${method === 'POST' ? 'add' : 'update'} academic level.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'adding' : 'updating'} academic level.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAcademicLevel = async (academicLevelId: string) => {
    if (!confirm("Are you sure you want to delete this academic level? This action cannot be undone and may affect linked student and teacher records.")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/academic-levels/${academicLevelId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchAcademicLevels();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete academic level.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting academic level.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calculated Stats ---
  const totalAcademicLevels = academicLevels.length;


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-teal-50 to-cyan-50 min-h-screen font-sans antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <AcademicCapIcon className="h-10 w-10 text-cyan-600" />
            Academic Levels Management
          </h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl">
            Define and manage the different academic levels (e.g., grades, years) within your institution.
          </p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-cyan-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading data...
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
          <div>
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <TagIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Academic Levels</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalAcademicLevels}</h2>
          </div>
        </div>
        {/* You can add more relevant stats here, e.g., total students across all levels, if you fetch that data */}
      </div>

      {/* Academic Levels List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <TagIcon className="h-6 w-6 text-indigo-500" /> All Academic Levels
          </h3>
          <button
            onClick={() => { setEditingAcademicLevel(null); setShowFormModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow-md
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-base font-medium"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Level
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-grow mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
          />
        </div>

        {/* Academic Levels Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="relative px-6 py-3 rounded-tr-lg">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAcademicLevels.length > 0 ? (
                filteredAcademicLevels.map((level) => (
                  <tr key={level.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <TagIcon className="h-5 w-5 text-indigo-500" />
                        {level.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {level.description || 'No description provided.'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {level.sortOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(level.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingAcademicLevel(level); setShowFormModal(true); }}
                          className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200"
                          title="Edit Academic Level"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAcademicLevel(level.id)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors duration-200"
                          title="Delete Academic Level"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <TagIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No academic levels found matching your criteria.</p>
                    <p className="text-sm mt-2">Try adjusting your search or add a new academic level.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <AcademicLevelFormModal
          academicLevelData={editingAcademicLevel}
          onClose={() => { setShowFormModal(false); setEditingAcademicLevel(null); }}
          onSave={handleSaveAcademicLevel}
          isLoading={isLoading}
          companyId={companyId}
        />
      )}
    </div>
  );
}
