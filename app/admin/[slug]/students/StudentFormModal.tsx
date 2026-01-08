'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon, UserCircleIcon, PhoneIcon, MapPinIcon, AcademicCapIcon, UserGroupIcon, TagIcon } from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// Assuming StudentType, ParentOption, AcademicLevelOption, StudentLevelStatusOption
// are imported from StudentsClient.tsx or a shared types file.
// Redefining here for completeness, but in a real app, import them.
export type AcademicLevelOption = {
  id: string;
  name: string; // e.g., "Junior (Playgroup)", "Senior (Grade 1-3)"
  sortOrder?: number;
};

export type ClassRoomOption = {
  id: string;
  name: string; // e.g., "Room A", "Room B"
};

// NEW: Type for StudentLevelStatus
export type StudentLevelStatusOption = {
  value: 'JUNIOR' | 'SENIOR' | 'SOPHOMORE' | 'FRESHMAN'; // Match your Prisma enum
  label: string;
};

export type StudentType = {
  id: string;
  userId: string;
  loginCode?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profilePicture?: string;
  phone?: string;
  bio?: string;
  address?: string;
  companyId?: string;
  parentId?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  academicRecords: {
    academicLevelId: string;
    academicLevelName: string;
    classRoomId?: string | null;
    classRoomName?: string | null;
    year?: string | null;
    term?: string | null | undefined;
    session?: string | null | undefined;
    levelStatus?: 'JUNIOR' | 'SENIOR' | 'JUNIOR' | 'SENIOR' | 'SOPHOMORE' | 'FRESHMAN' | null | undefined;
  }[];
  // academicLevels: AcademicLevelOption[]; // CHANGED: Now an array of academic levels
  // classRooms: ClassRoomOption[]; // NEW: Now an array of class rooms
  // levelStatus?: 'JUNIOR' | 'SENIOR' | 'SOPHOMORE' | 'FRESHMAN' | null; // ADDED: levelStatus field
  totalCourses: number;
  completedCourses: number;
  certificatesEarned: number;
  averageProgress: number;
  totalAssignmentSubmissions: number; // Renamed
  totalAttendanceRecords: number;
  totalExamSubmissions: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ParentOption = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loginCode?: string;
};

// interface StudentFormModalProps {
//   isOpen: boolean;
//   initialData?: StudentType | null;
//   onClose: () => void;
//   onSave: (data: Omit<StudentType, 'id' | 'userId' | 'loginCode' | 'totalCourses' | 'completedCourses' | 'certificatesEarned' | 'averageProgress' | 'totalAssignmentSubmissions' | 'totalAttendanceRecords' | 'totalExamSubmissions' | 'createdAt' | 'updatedAt' | 'parentName' | 'parentEmail' | 'parentPhone' | 'academicLevels' | 'levelStatus'> & { id?: string; userId?: string; parentId?: string | null; academicLevelId?: string | null; levelStatus?: StudentType['levelStatus'] }) => Promise<void>;
//   isLoading: boolean;
//   companyId: string;
//   allParents: ParentOption[];
//   allAcademicLevels: AcademicLevelOption[];
//   allStudentLevelStatusOptions: StudentLevelStatusOption[]; // NEW PROP
// }

// StudentFormModal.tsx

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<StudentType, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'academicLevels' | 'loginCode' | 'totalCourses' | 'completedCourses' | 'certificatesEarned' | 'averageProgress' | 'totalAssignmentSubmissions' | 'totalAttendanceRecords' | 'totalExamSubmissions' | 'parentName' | 'parentEmail' | 'parentPhone'> & {
    id?: string;
    userId?: string;
    parentId?: string | null;
    academicLevelId?: string | null;
    levelStatus?: StudentType['academicRecords'][0]['levelStatus']; // Corrected type
  }) => Promise<void>;
  initialData: StudentType | null;
  allParents: ParentOption[];
  allAcademicLevels: AcademicLevelOption[];
  allClassRooms: ClassRoomOption[];
  allStudentLevelStatusOptions: StudentLevelStatusOption[];
  companyId: string;
  isLoading: boolean;
  error: string | null;
}

// ... rest of your StudentFormModal component

const getCurrentAcademicRecord = (student?: StudentType | null) => {
  if (!student?.academicRecords?.length) return null;

  return [...student.academicRecords].sort((a, b) => {
    if (!a.year || !b.year) return 0;
    return Number(b.year) - Number(a.year);
  })[0];
};


const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, initialData, onClose, onSave, isLoading, companyId, allParents, allAcademicLevels, allClassRooms, allStudentLevelStatusOptions }) => {
  
  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    userId: initialData?.userId || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    profilePicture: initialData?.profilePicture || '',
    phone: initialData?.phone || '',
    bio: initialData?.bio || '',
    address: initialData?.address || '',
    parentId: initialData?.parentId || '',
  });


  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        userId: initialData.userId,
        // name: initialData.name,
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email,
        profilePicture: initialData.profilePicture || '',
        phone: initialData.phone || '',
        bio: initialData.bio || '',
        address: initialData.address || '',
        parentId: initialData.parentId || '',
      });
    } else {
      setFormData({
        id: '', userId: '',  firstName: '', lastName: '', email: '', profilePicture: '',
        phone: '', bio: '', address: '', parentId: ''//, academicLevelId: '', classRoomId: '', levelStatus: '' // Reset for new student
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: any = {
      ...formData,
      companyId,
    };

    if (payload.parentId === '') payload.parentId = null;

    if (!initialData) {
      // Creating student
      // payload.academicLevelId = formData.academicLevelId;
      // payload.classRoomId = formData.classRoomId || null;
    }

    // if (payload.parentId === '') {
    //   payload.parentId = null;
    // }
    // if (payload.academicLevelId === '') {
    //   payload.academicLevelId = null;
    // }
    // if (payload.classRoomId === '') {
    //   payload.classRoomId = null;
    // }
    // // Set levelStatus to null if it's an empty string
    // if (payload.levelStatus === '') {
    //   payload.levelStatus = null;
    // }

    if (!initialData) {
      delete payload.id;
      delete payload.userId;
    }

    delete payload.studentGrade; // Ensure this is removed if it's leftover from previous versions

    await onSave(payload);
  };

  if (!isOpen) return null;

  const defaultProfilePic = `https://placehold.co/100x100/E0F2F7/0288D1?text=${formData.firstName?.charAt(0) || '?'}`;

  // Filter academic levels for "Junior" and "Senior" categories
  const juniorAcademicLevels = allAcademicLevels.filter(level => level.name.toLowerCase().includes('junior') || level.name.toLowerCase().includes('playgroup') || level.name.toLowerCase().includes('kindergarten'));
  const seniorAcademicLevels = allAcademicLevels.filter(level => level.name.toLowerCase().includes('senior') || level.name.toLowerCase().includes('grade'));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
          {initialData ? `Edit Student: ${initialData.name}` : 'Add New Student'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserCircleIcon className="h-6 w-6 text-indigo-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} required
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
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AcademicCapIcon className="h-6 w-6 text-blue-500" /> Academic Overview & Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="academicLevelId" className="block text-sm font-medium text-gray-700 mb-1">
                  Student Role (Academic Level)
                </label>
                {!initialData ? (
                    <p className="text-xs text-gray-500 mb-2">
                      Assign "Junior" for playgroup/kindergarten, "Senior" for older children.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      To move a student to a new class or level, use the <strong>Promote</strong> action.
                    </p>
                  )
                }
                
                
                {!initialData && (
                  <div className="md:col-span-2 border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Initial Academic Assignment
                    </h4>

                    {/* Academic Level */}
                    <select
                      name="academicLevelId"
                      required
                      onChange={handleChange}
                      className="block w-full mb-3 px-4 py-2 border rounded-lg"
                    >
                      <option value="">-- Select Academic Level --</option>
                      {allAcademicLevels.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>

                    {/* Classroom */}
                    <select
                      name="classRoomId"
                      onChange={handleChange}
                      className="block w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">-- Select Classroom (Optional) --</option>
                      {allClassRooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {initialData && (() => {
                  const current = getCurrentAcademicRecord(initialData);

                  return (
                    <div className="md:col-span-2 bg-gray-100 p-4 rounded-lg border">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Current Academic Placement
                      </h4>

                      {current ? (
                        <div className="text-sm text-gray-800 space-y-1">
                          <p>
                            <strong>Level:</strong> {current.academicLevelName}
                          </p>
                          <p>
                            <strong>Classroom:</strong> {current.classRoomName || 'N/A'}
                          </p>
                          <p>
                            <strong>Year:</strong> {current.year || 'N/A'}
                          </p>
                          {current.levelStatus && (
                            <p>
                              <strong>Status:</strong> {current.levelStatus}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No academic record found
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        Academic changes must be done via the <strong>Promote</strong> action.
                      </p>
                    </div>
                  );
                })()}














                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select name="academicLevelId" id="academicLevelId" value={formData.academicLevelId} onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white">
                    <option value="">-- Select Role --</option>
                    {juniorAcademicLevels.length > 0 && (
                      <optgroup label="✨ Junior Levels ✨">
                        {juniorAcademicLevels.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(level => (
                          <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                      </optgroup>
                    )}
                    {seniorAcademicLevels.length > 0 && (
                      <optgroup label="🚀 Senior Levels 🚀">
                        {seniorAcademicLevels.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(level => (
                          <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                      </optgroup>
                    )}
                    {allAcademicLevels.filter(level =>
                      !(level.name.toLowerCase().includes('junior') || level.name.toLowerCase().includes('playgroup') || level.name.toLowerCase().includes('kindergarten') ||
                        level.name.toLowerCase().includes('senior') || level.name.toLowerCase().includes('grade'))
                    ).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>
              
                <label htmlFor="classRoomId" className="block text-sm font-medium text-gray-700 mb-1">
                  Classroom Assignment
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select name="classRoomId" id="classRoomId" value={formData.classRoomId} onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white">
                    <option value="">-- Select Classroom (Optional) --</option>
                    {allClassRooms.sort((a, b) => a.name.localeCompare(b.name)).map(classRoom => (
                      <option key={classRoom.id} value={classRoom.id}>{classRoom.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* NEW: Student Level Status dropdown */}
              <div>
                <label htmlFor="levelStatus" className="block text-sm font-medium text-gray-700 mb-1">Student Level Status</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="levelStatus"
                    id="levelStatus"
                    value={formData.levelStatus || ''} // Use '' for null/undefined to select default option
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
                  >
                    <option value="">-- Select Student Level Status (Optional) --</option>
                    {allStudentLevelStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" name="address" id="address" value={formData.address} onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserGroupIcon className="h-6 w-6 text-purple-500" /> Parent/Guardian Information
            </h3>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserGroupIcon className="h-5 w-5 text-gray-400" />
              </div>
              <label htmlFor="parentId" className="sr-only">Select Parent</label>
              <select name="parentId" id="parentId" value={formData.parentId} onChange={handleChange}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white">
                <option value="">-- Select Existing Parent (Optional) --</option>
                {allParents.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name} ({parent.email || parent.phone || parent.loginCode})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              If the parent is not listed, please create their profile first via the <a href="/admin/parents" className="text-indigo-600 hover:underline">Parents Management page</a>.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 border border-transparent rounded-lg text-base font-medium text-white shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
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
              ) : (initialData ? 'Save Changes' : 'Add Student')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;