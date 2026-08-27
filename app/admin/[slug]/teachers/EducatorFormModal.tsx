'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  XMarkIcon, 
  UserCircleIcon, 
  BriefcaseIcon, 
  PhoneIcon, 
  MapPinIcon, 
  AcademicCapIcon, 
  TagIcon,
  HomeModernIcon 
} from '@heroicons/react/24/outline';
import { ClassroomOption, EducatorType, DepartmentOption, AcademicLevelOption } from './TeachersClient';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

interface EducatorFormModalProps {
  isOpen: boolean;
  educatorData?: EducatorType | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  allDepartments: DepartmentOption[];
  allAcademicLevels: AcademicLevelOption[];
  allClassrooms: ClassroomOption[];
  isLoading: boolean;
  companyId: string;
}

const EducatorFormModal: React.FC<EducatorFormModalProps> = ({ 
  isOpen, 
  educatorData, 
  onClose, 
  onSave, 
  allDepartments, 
  allAcademicLevels, 
  allClassrooms,
  isLoading, 
  companyId 
}) => {
  const [formData, setFormData] = useState({
    id: educatorData?.id || '',
    userId: educatorData?.userId || '',
    name: educatorData?.name || '',
    email: educatorData?.email || '',
    profilePicture: educatorData?.profilePicture || '',
    phone: educatorData?.phone || '',
    bio: educatorData?.bio || '',
    address: educatorData?.address || '',
    departmentId: educatorData?.departmentId || '',
    academicLevelIds: [] as string[],
    classroomIds: [] as string[],
  });

  // 1. Initialize IDs safely by coercing all values into strings
  useEffect(() => {
    if (educatorData) {
      const levelIds = Array.from(new Set([
        ...(educatorData.academicLevels?.map(al => String(al.id)) || []),
        ...(educatorData.academicLevelAssignments?.map(a => String(a.academicLevelId)).filter(Boolean) || [])
      ]));
      
      const classRoomIds = educatorData.academicLevelAssignments?.map(a => String(a.classRoomId)).filter(Boolean) || [];

      setFormData({
        id: String(educatorData.id),
        userId: educatorData.userId ? String(educatorData.userId) : '',
        name: educatorData.name,
        email: educatorData.email,
        profilePicture: educatorData.profilePicture || '',
        phone: educatorData.phone || '',
        bio: educatorData.bio || '',
        address: educatorData.address || '',
        departmentId: educatorData.departmentId ? String(educatorData.departmentId) : '',
        academicLevelIds: levelIds,
        classroomIds: classRoomIds,
      });
    } else {
      setFormData({
        id: '', userId: '', name: '', email: '', profilePicture: '',
        phone: '', bio: '', address: '', departmentId: '',
        academicLevelIds: [], classroomIds: []
      });
    }
  }, [educatorData, isOpen]);

  /**
   * FIX: Robust filtering mapping that checks all potential property 
   * paths and coerces variables safely into strings to prevent evaluation failure.
   */
  const filteredClassrooms = useMemo(() => {
    if (!formData.academicLevelIds || formData.academicLevelIds.length === 0) return [];
    
    const selectedLevelSet = new Set(formData.academicLevelIds.map(id => String(id)));
    
    return allClassrooms.filter(room => {
      // Check every common variant of where the level relation might be stored
      const levelIdReference = room.academicLevelId || room.academicLevel?.id || (room as any).levelId;
      return levelIdReference && selectedLevelSet.has(String(levelIdReference));
    });
  }, [formData.academicLevelIds, allClassrooms]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (id: string, field: 'academicLevelIds' | 'classroomIds') => {
    const stringId = String(id);
    setFormData(prev => {
      const current = new Set(prev[field].map(item => String(item)));
      if (current.has(stringId)) {
        current.delete(stringId);
      } else {
        current.add(stringId);
      }
      const updated = Array.from(current);
      
      // Cleanup: If an academic level is unselected, strip associated classrooms
      if (field === 'academicLevelIds' && !current.has(stringId)) {
        const roomsToKeep = prev.classroomIds.filter(roomId => {
          const room = allClassrooms.find(r => String(r.id) === String(roomId));
          const levelIdReference = room?.academicLevelId || room?.academicLevel?.id || (room as any)?.levelId;
          return String(levelIdReference) !== stringId;
        });
        return { ...prev, [field]: updated, classroomIds: roomsToKeep };
      }

      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const assignments = formData.academicLevelIds.flatMap(levelId => {
      const associatedRooms = formData.classroomIds.filter(roomId => {
        const room = allClassrooms.find(r => String(r.id) === String(roomId));
        const levelIdReference = room?.academicLevelId || room?.academicLevel?.id || (room as any)?.levelId;
        return String(levelIdReference) === String(levelId);
      });

      if (associatedRooms.length > 0) {
        return associatedRooms.map(roomId => ({
          academicLevelId: levelId,
          classRoomId: roomId,
        }));
      }

      return [{
        academicLevelId: levelId,
        classRoomId: null,
      }];
    });

    const payload = {
      ...formData,
      companyId,
      departmentId: formData.departmentId || null,
      assignments,
    };

    if (!educatorData) {
      delete (payload as any).id;
      delete (payload as any).userId;
    }

    await onSave(payload);
  };

  if (!isOpen) return null;

  const defaultProfilePic = `https://placehold.co/100x100/E0E7FF/4338CA?text=${formData.name?.charAt(0) || '?'}`;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
          {educatorData ? `Edit Teacher` : 'Add New Teacher'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
        
          {/* Personal Information Section */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserCircleIcon className="h-6 w-6 text-indigo-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea name="bio" id="bio" value={formData.bio} onChange={handleChange} rows={3}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Image
                    className="h-20 w-20 rounded-full object-cover border-2 border-indigo-200 shadow-md"
                    src={formData.profilePicture || defaultProfilePic}
                    alt="Profile Preview"
                    loader={loader}
                    width={80}
                    height={80}
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
          </div>

          {/* Contact & Organizational Layout */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BriefcaseIcon className="h-6 w-6 text-green-500" /> Contact & Organization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" name="address" id="address" value={formData.address} onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select name="departmentId" id="departmentId" value={formData.departmentId} onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white">
                    <option value="">-- Select Department (Optional) --</option>
                    {allDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Tier Allocations */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TagIcon className="h-6 w-6 text-purple-500" /> Matrix Assignments
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academic Levels Selection Panel */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-purple-500" /> Academic Levels
                </label>
                <div className="border rounded-lg p-3 h-48 overflow-y-auto bg-white">
                  {allAcademicLevels.map(level => (
                    <label key={level.id} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={formData.academicLevelIds.map(String).includes(String(level.id))}
                        onChange={() => handleCheckboxChange(level.id, 'academicLevelIds')}
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-sm text-gray-700">{level.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Multi-Select Filtered Classrooms Panel */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <HomeModernIcon className="h-4 w-4 text-blue-500" /> Available Rooms
                </label>
                <div className="border rounded-lg p-3 h-48 overflow-y-auto bg-gray-50">
                  {formData.academicLevelIds.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <HomeModernIcon className="h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400">Select an academic level to view rooms</p>
                    </div>
                  ) : filteredClassrooms.length > 0 ? (
                    filteredClassrooms.map(room => {
                      const associatedLevelId = room.academicLevelId || room.academicLevel?.id || (room as any).levelId;
                      return (
                        <label key={room.id} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-blue-50 p-1.5 rounded transition-colors border border-transparent hover:border-blue-100">
                          <input 
                            type="checkbox"
                            checked={formData.classroomIds.map(String).includes(String(room.id))}
                            onChange={() => handleCheckboxChange(room.id, 'classroomIds')}
                            className="rounded text-blue-600 focus:ring-blue-500" 
                          />
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-700 font-medium">{room.name}</span>
                            <span className="text-[10px] text-indigo-500 font-semibold uppercase">
                              {allAcademicLevels.find(l => String(l.id) === String(associatedLevelId))?.name || 'Linked Tier'}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-xs text-amber-600 text-center mt-10">No rooms linked to selected levels</p>
                  )}
                </div>
              </div>
            </div>
          
            <p className="mt-3 text-xs text-gray-500">Assign all levels and classrooms this educator balances. Unchecking a level automatically removes nested room filters.</p>
          </div>

          {/* Core Submit System Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 border border-transparent rounded-lg text-base font-medium text-white shadow-md hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (educatorData ? 'Save Changes' : 'Add Teacher')}
            </button>
          </div>
    
        </form>
      </div>
    </div>
  );
};

export default EducatorFormModal;