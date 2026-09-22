'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image'; // For profile pictures
import {
  UsersIcon,
  UserGroupIcon, // For overall parents
  UserPlusIcon, // For add parent
  PencilIcon, // For edit
  TrashIcon, // For delete
  MagnifyingGlassIcon, // For search
  CalendarDaysIcon, // For date
  PhoneIcon, // For phone
  EnvelopeIcon, // For email
  MapPinIcon, // For address
  KeyIcon,
  XMarkIcon, // For login code
} from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/solid'; // Using solid for a stronger icon for overall parents

import ParentFormModal from './ParentFormModal'; // Import the new modal component
import { clientFetchJson } from '@/lib/api/clientFetch';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// --- Type Definitions (matching API response) ---
export type ParentType = {
  id: string;
  userId: string;
  loginCode: string; // Unique generated number for parent login
  name: string;
  email: string;
  profilePicture?: string;
  phone?: string;
  bio?: string;
  address?: string;
  companyId?: string;
  totalChildren: number; // From _count.children
  createdAt: string;
  updatedAt: string;
};

interface ParentsClientProps {
  initialParents: ParentType[];
  companyId: string;
  apiBaseUrl: string;
}

export default function ParentsClient({ initialParents, companyId, apiBaseUrl }: ParentsClientProps) {
  const [parents, setParents] = useState<ParentType[]>(initialParents || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // --- Data Fetching and Management ---
  const fetchParents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await clientFetchJson<ParentType[]>(
        `/api/admin/parents?companyId=${encodeURIComponent(companyId)}`
      );
      if (res.ok && Array.isArray(res.data)) {
        setParents(res.data);
      } else {
        setError(res.error || res.message || "Failed to fetch parents.");
        setParents(initialParents || []);
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching parents.");
      setParents(initialParents || []);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, initialParents]);

  useEffect(() => {
    // If initial data from server is empty, try fetching on client side
    if (!initialParents || initialParents.length === 0) {
      fetchParents();
    }
  }, [fetchParents, initialParents]);


  const filteredParents = useMemo(() => {
    return (parents || []).filter(parent => {
      const matchesSearch = (parent.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (parent.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (parent.loginCode?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (parent.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (parent.address?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (parent.bio?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
      return matchesSearch;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Sort alphabetically by name
  }, [parents, searchTerm]);


  // --- API Interaction Functions ---
  const handleSaveParent = async (parentData: Omit<ParentType, 'id' | 'userId' | 'loginCode' | 'totalChildren' | 'createdAt' | 'updatedAt'> & { id?: string; userId?: string }) => {
    setIsLoading(true);
    setError(null);
    const method = parentData.id ? 'PATCH' : 'POST';
    try {
      const url = parentData.id ? `/api/admin/parents/${parentData.id}` : `/api/admin/parents`;

      const payload = {
        ...parentData,
        companyId: companyId, // Ensure companyId is always included for new parents
      };

      const res = await clientFetchJson(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.success) {
        await fetchParents(); // Re-fetch to get the latest data
        setShowFormModal(false);
        setEditingParent(null);
      } else {
        setError(res.message || `Failed to ${method === 'POST' ? 'add' : 'update'} parent.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'adding' : 'updating'} parent.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteParent = async (parentId: string) => {
    if (!confirm("Are you sure you want to delete this parent? This action cannot be undone and may affect linked student records.")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await clientFetchJson(`/api/admin/parents/${parentId}`, {
        method: 'DELETE',
      });

      if (res.success) {
        await fetchParents();
      } else {
        setError(res.message || "Failed to delete parent.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting parent.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calculated Stats ---
  const totalParents = parents.length;
  const totalChildrenAcrossParents = parents.reduce((sum, p) => sum + p.totalChildren, 0);
  const avgChildrenPerParent = totalParents > 0 ? (totalChildrenAcrossParents / totalParents).toFixed(1) : '0';


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen font-sans antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <UserGroupIcon className="h-10 w-10 text-pink-600" />
            Parents Management
          </h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl">
            Efficiently manage all parent/guardian profiles and their associated children.
          </p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-pink-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Parents</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalParents}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <UsersIcon className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Children Managed</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalChildrenAcrossParents}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <AcademicCapIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Children per Parent</p>
            <h2 className="text-3xl font-bold text-gray-800">{avgChildrenPerParent}</h2>
          </div>
        </div>
      </div>

      {/* Parents List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-indigo-500" /> All Parents
          </h3>
          <button
            onClick={() => { setEditingParent(null); setShowFormModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow-md
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-base font-medium"
          >
            <UserPlusIcon className="h-5 w-5" /> Add New Parent
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone, or login code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            />
          </div>
        </div>

        {/* Parents Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Parent</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Code</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children</th>
                <th scope="col" className="relative px-6 py-3 rounded-tr-lg">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParents.length > 0 ? (
                filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <Image
                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            src={parent.profilePicture || `https://placehold.co/100x100/FCE7F3/D946EF?text=${parent.name?.charAt(0) || '?'}`}
                            alt={parent.name || 'Parent Avatar'}
                            width={40}
                            loader={loader}
                            height={40}
                            onError={(e) => {
                              (e.target as HTMLImageElement).onerror = null;
                              (e.target as HTMLImageElement).src = `https://placehold.co/100x100/FCE7F3/D946EF?text=${parent.name?.charAt(0) || '?'}`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{parent.name}</div>
                          <div className="text-xs text-gray-500">{parent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-pink-700">
                      <div className="flex items-center gap-1">
                        <KeyIcon className="h-4 w-4 text-pink-500" /> {parent.loginCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parent.phone && (
                        <div className="flex items-center gap-1">
                          <PhoneIcon className="h-4 w-4 text-gray-400" /> {parent.phone}
                        </div>
                      )}
                      {parent.address && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400" /> {parent.address}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium flex items-center gap-1">
                        <UsersIcon className="h-4 w-4 text-gray-500" /> {parent.totalChildren}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Joined: {new Date(parent.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingParent(parent); setShowFormModal(true); }}
                          className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200"
                          title="Edit Parent"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteParent(parent.id)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors duration-200"
                          title="Delete Parent"
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
                    <UserGroupIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No parents found matching your criteria.</p>
                    <p className="text-sm mt-2">Try adjusting your search or add a new parent.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <ParentFormModal
          parentData={editingParent}
          onClose={() => { setShowFormModal(false); setEditingParent(null); }}
          onSave={handleSaveParent}
          isLoading={isLoading}
          companyId={companyId}
        />
      )}
    </div>
  );
}
