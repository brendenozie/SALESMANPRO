'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BriefcaseIcon, // Main icon for departments
  CalendarDaysIcon, // For date
  PlusCircleIcon, // For add department
  PencilIcon, // For edit
  MagnifyingGlassIcon, // For search
  TrashIcon, // For delete
  UsersIcon, // For teacher count
  AcademicCapIcon, // For class count
} from '@heroicons/react/24/outline';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Define the shape of department data received from API
export type DepartmentData = {
  id: string;
  name: string;
  description?: string;
  head?: { id: string; name: string; email: string } | null; // Matches API response
  educatorCount: number;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
};

// Define the shape of a possible head of department (User)
export type PossibleHead = {
  id: string;
  name: string;
  email: string;
};

interface DepartmentsPageProps {
  initialDepartments: DepartmentData[];
  possibleHeads: PossibleHead[]; // List of users who can be heads
}

export default function DepartmentsPage({ initialDepartments, possibleHeads }: DepartmentsPageProps) {
  const [departments, setDepartments] = useState<DepartmentData[]>(initialDepartments);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // --- Data Fetching and Management ---
  const fetchDepartments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/departments`);
      if (res.ok) {
        const data: DepartmentData[] = await res.json();
        setDepartments(data);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch departments.");
        // Fallback to initial data if API fails after initial load
        if (initialDepartments.length > 0) {
          setDepartments(initialDepartments);
        } else {
          // If even initial data is empty, use a small sample for display
          setDepartments(sampleDepartmentsDataFallback);
        }
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching departments.");
      // Fallback to initial data if API fails after initial load
      if (initialDepartments.length > 0) {
        setDepartments(initialDepartments);
      } else {
        // If even initial data is empty, use a small sample for display
        setDepartments(sampleDepartmentsDataFallback);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch departments on mount if initial data is empty (e.g., server fetch failed)
  useEffect(() => {
    if (initialDepartments.length === 0) {
      fetchDepartments();
    }
  }, [initialDepartments]);


  // Sample Data (Fallback for when API data is not available or empty)
  const sampleDepartmentsDataFallback: DepartmentData[] = [
    {
      id: 'D001',
      name: 'Mathematics Department',
      head: { id: 'user_mock_1', name: 'Mr. John Doe', email: 'john.doe@example.com' },
      description: 'Responsible for all mathematics curriculum and instruction from Grade 7 to 12.',
      educatorCount: 5, // Sample count
      courseCount: 12,  // Sample count
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'D002',
      name: 'English Department',
      head: { id: 'user_mock_2', name: 'Mrs. Jane Smith', email: 'jane.smith@example.com' },
      description: 'Focuses on language arts, literature, and communication skills.',
      educatorCount: 7,
      courseCount: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'D003',
      name: 'Science Department',
      head: { id: 'user_mock_3', name: 'Ms. Emily White', email: 'emily.white@example.com' },
      description: 'Covers Biology, Chemistry, and Physics curricula.',
      educatorCount: 6,
      courseCount: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];


  const filteredDepartments = useMemo(() => {
    return departments.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.head?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [departments, searchTerm]);

  const totalDepartments = departments.length;
  // These counts would ideally come from the API or be calculated on the backend
  // For now, using simplified counts based on the current `departments` state
  const totalTeachersAcrossDepartments = departments.reduce((sum, dept) => sum + (dept.educatorCount || 0), 0);
  const totalClassesAcrossDepartments = departments.reduce((sum, dept) => sum + (dept.courseCount || 0), 0);


  // Event handlers for CRUD operations via API
  const handleAddNewDepartment = async (newDeptData: { name: string; description: string; headId?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDeptData),
      });

      if (res.ok) {
        // Re-fetch all departments to get the latest data including counts
        await fetchDepartments();
        setShowFormModal(false);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to add department.");
      }
    } catch (err: any) {
      setError(err.message || "Network error adding department.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDepartment = async (updatedDeptData: { id: string; name: string; description: string; headId?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/departments/${updatedDeptData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDeptData),
      });

      if (res.ok) {
        // Re-fetch all departments to get the latest data including counts
        await fetchDepartments();
        setShowFormModal(false);
        setEditingDepartment(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to update department.");
      }
    } catch (err: any) {
      setError(err.message || "Network error updating department.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDepartment = async (deptId: string) => {
    if (!confirm("Are you sure you want to delete this department? This action cannot be undone and may affect associated teachers and classes.")) {
      return; // User cancelled
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/departments/${deptId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Re-fetch all departments to get the latest data
        await fetchDepartments();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete department.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting department.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Department Form Modal ---
  type DepartmentFormModalProps = {
    departmentData?: DepartmentData | null;
    onClose: () => void;
    onSave: (data: { id: string; name: string; description: string; headId?: string }) => void;
    isEdit?: boolean;
    possibleHeads: PossibleHead[];
  };

  const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({ departmentData, onClose, onSave, isEdit = false, possibleHeads }) => {
    const [formData, setFormData] = useState({
      id: departmentData?.id || '',
      name: departmentData?.name || '',
      description: departmentData?.description || '',
      headId: departmentData?.head?.id || '', // Use head.id for the form
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{isEdit ? `Edit Department: ${formData.name}` : 'Add New Department'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Department Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="headId" className="block text-sm font-medium text-gray-700">Head of Department (Optional)</label>
              <select name="headId" id="headId" value={formData.headId} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="">-- Select Head --</option>
                {possibleHeads.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading} // Disable button while loading
                >
                {isLoading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add Department')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // --- End Modal Component ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Departments Management
            <span className="ml-2 text-purple-600 text-base sm:text-xl">🏢</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Organize and manage the school's academic and administrative departments.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <BriefcaseIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalDepartments}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <UsersIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Teachers</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalTeachersAcrossDepartments}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <AcademicCapIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalClassesAcrossDepartments}</h2>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" onClick={() => setError(null)}><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      {/* Departments List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 text-indigo-500" /> All Departments
          </h3>
          <button
            onClick={() => { setEditingDepartment(null); setShowFormModal(true); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Department
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by department name, head, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading departments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head of Department</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept) => (
                    <tr key={dept.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.head?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.educatorCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.courseCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => { setEditingDepartment(dept); setShowFormModal(true); }}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            title="Edit Department"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            title="Delete Department"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No departments found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showFormModal && (
        <DepartmentFormModal
          departmentData={editingDepartment}
          onClose={() => setShowFormModal(false)}
          onSave={editingDepartment ? handleEditDepartment : handleAddNewDepartment}
          isEdit={!!editingDepartment}
          possibleHeads={possibleHeads} // Pass possible heads to the modal
        />
      )}
    </div>
  );
}
