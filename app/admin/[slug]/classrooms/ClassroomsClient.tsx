'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  HomeModernIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import ClassroomFormModal from './ClassroomFormModal';

export type ClassroomType = {
  id: string;
  name: string;
  capacity?: number;
  academicLevelId: string;
  companyId: string;
  createdAt: string;
};

export type AcademicLevelType = {
  id: string;
  name: string;
};

interface ClassroomsClientProps {
  initialClassrooms: ClassroomType[];
  academicLevels: AcademicLevelType[];
  capacity?: number;
  companyId: string;
  apiBaseUrl: string;
}

export default function ClassroomsClient({ initialClassrooms, academicLevels, companyId, apiBaseUrl }: ClassroomsClientProps) {
  const [classrooms, setClassrooms] = useState<ClassroomType[]>(initialClassrooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<ClassroomType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClassrooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/classrooms?companyId=${companyId}`);
      if (res.ok) {
        const json = await res.json();
        setClassrooms(json.data || json);
      }
    } catch (err) {
      setError("Failed to refresh classrooms.");
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, companyId]);

  const filteredClassrooms = useMemo(() => {
    return classrooms.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classrooms, searchTerm]);

  const handleSave = async (data: any) => {
    setIsLoading(true);
    const method = data.id ? 'PATCH' : 'POST';
    const url = data.id ? `${apiBaseUrl}/admin/classrooms/${data.id}` : `${apiBaseUrl}/admin/classrooms`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, companyId }),
      });

      if (res.ok) {
        await fetchClassrooms();
        setShowFormModal(false);
      } else {
        const errData = await res.json();
        setError(errData.message || "Save failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this classroom?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/classrooms/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchClassrooms();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <HomeModernIcon className="h-10 w-10 text-indigo-600" />
            Classroom Management
          </h1>
          <p className="text-gray-600">Assign students to specific rooms and manage capacities.</p>
        </div>
        <button
          onClick={() => { setEditingClassroom(null); setShowFormModal(true); }}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <PlusCircleIcon className="h-5 w-5" /> Add Classroom
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search classrooms..." 
              className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClassrooms.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{cls.name}</td>
                <td className="px-6 py-4 text-gray-600">
                  {academicLevels.find(l => l.id === cls.academicLevelId)?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 text-gray-600">{cls.capacity || 'Unlimited'}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => { setEditingClassroom(cls); setShowFormModal(true); }} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                  <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showFormModal && (
        <ClassroomFormModal
          classroomData={editingClassroom}
          academicLevels={academicLevels}
          onClose={() => setShowFormModal(false)}
          onSave={handleSave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}