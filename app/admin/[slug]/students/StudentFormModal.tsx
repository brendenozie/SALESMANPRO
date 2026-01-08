'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  XMarkIcon, 
  UserCircleIcon, 
  PhoneIcon, 
  MapPinIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  TagIcon,
  EnvelopeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// --- Types ---
export type AcademicLevelOption = {
  id: string;
  name: string;
  sortOrder?: number;
};

export type ClassRoomOption = {
  id: string;
  name: string;
};

export type StudentLevelStatusOption = {
  value: 'FRESHMAN' | 'SOPHOMORE' | 'JUNIOR' | 'SENIOR';
  label: string;
};

export type ParentOption = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loginCode?: string;
};

export type StudentType = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  phone?: string;
  bio?: string;
  address?: string;
  parentId?: string;
  academicRecords: {
    academicLevelId: string;
    academicLevelName: string;
    classRoomId?: string | null;
    classRoomName?: string | null;
    year?: string | null;
    term?: string | null;
    levelStatus?: StudentLevelStatusOption['value'] | null;
  }[];
};

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData: StudentType | null;
  allParents: ParentOption[];
  allAcademicLevels: AcademicLevelOption[];
  allClassRooms: ClassRoomOption[];
  allStudentLevelStatusOptions: StudentLevelStatusOption[];
  companyId: string;
  isLoading: boolean;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({ 
  isOpen, 
  initialData, 
  onClose, 
  onSave, 
  isLoading, 
  companyId, 
  allParents, 
  allAcademicLevels, 
  allClassRooms, 
  allStudentLevelStatusOptions 
}) => {
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: '',
    phone: '',
    bio: '',
    address: '',
    parentId: '',
    academicLevelId: '',
    classRoomId: '',
    levelStatus: '',
    year: new Date().getFullYear().toString(),
    term: ''
  });

  useEffect(() => {
    if (initialData) {
      const current = initialData.academicRecords?.[0] || {};
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        profilePicture: initialData.profilePicture || '',
        phone: initialData.phone || '',
        bio: initialData.bio || '',
        address: initialData.address || '',
        parentId: initialData.parentId || '',
        academicLevelId: current.academicLevelId || '',
        classRoomId: current.classRoomId || '',
        levelStatus: current.levelStatus || '',
        year: current.year || new Date().getFullYear().toString(),
        term: current.term || ''
      });
    } else {
      setFormData({
        firstName: '', lastName: '', email: '', profilePicture: '',
        phone: '', bio: '', address: '', parentId: '',
        academicLevelId: '', classRoomId: '', levelStatus: '',
        year: new Date().getFullYear().toString(), term: ''
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean data: convert empty strings to null for optional relations
    const payload = {
      ...formData,
      id: initialData?.id || undefined,
      companyId,
      parentId: formData.parentId || null,
      academicLevelId: formData.academicLevelId || null,
      classRoomId: formData.classRoomId || null,
      levelStatus: formData.levelStatus || null,
    };

    await onSave(payload);
  };

  if (!isOpen) return null;

  const defaultProfilePic = `https://placehold.co/100x100/6366f1/ffffff?text=${formData.firstName?.charAt(0) || 'S'}`;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Student Profile' : 'Register New Student'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details below to manage student information.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Section 1: Personal Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <UserCircleIcon className="h-5 w-5 text-indigo-600" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">First Name *</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Last Name *</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address *</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bio / Notes</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none" placeholder="Additional information about the student..." />
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Image
                    className="h-20 w-20 rounded-full object-cover border-2 border-indigo-200 shadow-md"
                    src={formData.profilePicture || defaultProfilePic}
                    alt="Profile Preview"
                    width={80}
                    height={80}
                    loader={loader}
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = defaultProfilePic;
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                  <input type="url" name="profilePicture" id="profilePicture" value={formData.profilePicture} onChange={handleChange}
                    placeholder="https://example.com/pic.jpg"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Academic Info (Conditional) */}
          <section className="space-y-4 bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5 text-indigo-600" /> Academic Placement
            </h3>
            
            {!initialData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Academic Level *</label>
                  <select name="academicLevelId" value={formData.academicLevelId} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
                    <option value="">Select Level</option>
                    {allAcademicLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Classroom (Optional)</label>
                  <select name="classRoomId" value={formData.classRoomId} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
                    <option value="">No Assignment</option>
                    {allClassRooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Level Status</label>
                  <select name="levelStatus" value={formData.levelStatus} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
                    <option value="">Select Status</option>
                    {allStudentLevelStatusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-indigo-200">
                <InformationCircleIcon className="h-5 w-5 text-indigo-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Academic records are managed via Promotions</p>
                  <p className="text-xs text-gray-500 mt-1">To change this student's grade or classroom, please use the "Promote" button in the student list.</p>
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Contacts & Parent */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-indigo-600" /> Contact & Guardian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="+1..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Assign Parent</label>
                <select name="parentId" value={formData.parentId} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
                  <option value="">No Parent Assigned</option>
                  {allParents.map(parent => (
                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Home Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none" />
              </div>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? 'Processing...' : initialData ? 'Update Student' : 'Create Student'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFormModal;