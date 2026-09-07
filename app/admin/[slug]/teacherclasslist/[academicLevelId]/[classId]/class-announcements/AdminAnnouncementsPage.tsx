'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  MegaphoneIcon, // General announcements icon
  CalendarDaysIcon, // For date
  PlusCircleIcon, // For add announcement
  PencilIcon, // For edit
  MagnifyingGlassIcon, // For search
  TrashIcon, // For delete
  ArchiveBoxIcon, // For archive
  ArrowPathIcon, // For unarchive
  BellAlertIcon, // For urgent
  UsersIcon, // For audience
  ClockIcon, // For publish date
  XMarkIcon, // For closing modals/errors
  CheckCircleIcon, // For published status
  ExclamationTriangleIcon, // For pending status
} from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// --- Type Definitions (Aligned with Announcement API Response) ---
export type AnnouncementData = {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  publishedAt: string; // ISO string
  expiresAt: string | null; // ISO string
  authorId: string;
  authorName: string;
  authorEmail: string;
  companyId: string;
  companyName: string;
  status: 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
  type: 'GENERAL' | 'ACADEMIC' | 'EVENT' | 'HOLIDAY' | 'ALERT' | 'NEWS' | 'POLICY_UPDATE' | 'FEEDBACK' | 'SURVEY' | 'OTHER';
  audience: 'ALL' | 'ACADEMIC_LEVEL' | 'COURSE' | 'EDUCATOR' | 'STUDENT' | 'DEPARTMENT' | 'STAFF' | 'PARENT';
  targetAcademicLevelIds: string[];
  targetCourseIds: string[];
  targetEducatorIds: string[];
  targetStudentIds: string[];
  targetDepartmentIds: string[];
  targetParentIds: string[];
  createdAt: string;
  updatedAt: string;
};

// Types for Audience Selection Dropdowns
export type AcademicLevelOption = { id: string; name: string };
export type CourseOption = { id: string; title: string };
export type EducatorOption = { id: string; name: string; email: string };
export type StudentOption = { id: string; name: string; email: string };
export type DepartmentOption = { id: string; name: string };
export type ParentOption = { id: string; name: string; email: string };
export type AuthorOption = { id: string; name: string; email: string }; // Users who can be authors

interface AdminAnnouncementsPageProps {
  initialAnnouncements: AnnouncementData[];
  allAcademicLevels: AcademicLevelOption[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allStudents: StudentOption[];
  allDepartments: DepartmentOption[];
  allParents: ParentOption[];
  allAuthors: AuthorOption[];
  companyId: string;
  academicLevelId: string;
  classId: string;
}

// --- Announcement Form Modal Component ---
type AnnouncementFormModalProps = {
  announcementData: AnnouncementData | null; // Null for new announcement
  onClose: () => void;
  onSave: (data: Omit<AnnouncementData, 'authorName' | 'authorEmail' | 'companyName' | 'createdAt' | 'updatedAt'>) => void;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
  companyId: string;
  allAcademicLevels: AcademicLevelOption[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allStudents: StudentOption[];
  allDepartments: DepartmentOption[];
  allParents: ParentOption[];
  allAuthors: AuthorOption[];
  academicLevelId: string;
  classId: string;
};

const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({
  announcementData,
  onClose,
  onSave,
  isLoading,
  error,
  resetError,
  companyId,
  allAcademicLevels,
  allCourses,
  allEducators,
  allStudents,
  allDepartments,
  allParents,
  allAuthors,
}) => {
  const [formData, setFormData] = useState<Omit<AnnouncementData, 'authorName' | 'authorEmail' | 'companyName' | 'createdAt' | 'updatedAt'>>(
    announcementData || {
      id: '',
      title: '',
      summary: null,
      content: null,
      publishedAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      expiresAt: null,
      authorId: '', // Should be pre-filled with current user's ID in a real app
      companyId: companyId,
      status: 'PENDING',
      type: 'GENERAL',
      audience: 'ALL',
      targetAcademicLevelIds: [],
      targetCourseIds: [],
      targetEducatorIds: [],
      targetStudentIds: [],
      targetDepartmentIds: [],
      targetParentIds: [],
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setFormData(prev => ({ ...prev, [name]: selectedValues }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetError(); // Clear any previous errors

    // Basic client-side validation
    if (!formData.title || !formData.publishedAt || !formData.authorId || !formData.status || !formData.type || !formData.audience) {
      alert("Please fill all required fields: Title, Publish Date, Author, Status, Type, and Audience.");
      return;
    }

    // Validate publish/expiry dates
    const publishedDate = new Date(formData.publishedAt);
    if (isNaN(publishedDate.getTime())) {
      alert("Invalid Publish Date format.");
      return;
    }
    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt);
      if (isNaN(expiryDate.getTime())) {
        alert("Invalid Expiry Date format.");
        return;
      }
      if (expiryDate <= publishedDate) {
        alert("Expiry Date must be after Publish Date.");
        return;
      }
    }

    // Validate audience-specific selections
    switch (formData.audience) {
      case 'ACADEMIC_LEVEL':
        if (formData.targetAcademicLevelIds.length === 0) {
          alert("Please select at least one Academic Level for this audience type.");
          return;
        }
        break;
      case 'COURSE':
        if (formData.targetCourseIds.length === 0) {
          alert("Please select at least one Course for this audience type.");
          return;
        }
        break;
      case 'EDUCATOR':
        if (formData.targetEducatorIds.length === 0) {
          alert("Please select at least one Educator for this audience type.");
          return;
        }
        break;
      case 'STUDENT':
        if (formData.targetStudentIds.length === 0) {
          alert("Please select at least one Student for this audience type.");
          return;
        }
        break;
      case 'DEPARTMENT':
        if (formData.targetDepartmentIds.length === 0) {
          alert("Please select at least one Department for this audience type.");
          return;
        }
        break;
      case 'PARENT':
        if (formData.targetParentIds.length === 0) {
          alert("Please select at least one Parent for this audience type.");
          return;
        }
        break;
      // For 'ALL' and 'STAFF', no specific target IDs are required here
    }

    onSave(formData);
  };

  const isEdit = !!announcementData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
          {isEdit ? `Edit Announcement: ${announcementData?.title}` : 'Create New Announcement'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 flex items-center justify-between">
            <span className="block sm:inline">{error}</span>
            <button onClick={resetError} className="text-red-500 hover:text-red-800 focus:outline-none">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">Summary (Optional)</label>
              <input type="text" name="summary" id="summary" value={formData.summary || ''} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea name="content" id="content" value={formData.content || ''} onChange={handleChange} rows={4}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
            </div>

            <div>
              <label htmlFor="publishedAt" className="block text-sm font-medium text-gray-700 mb-1">Publish Date <span className="text-red-500">*</span></label>
              <input type="date" name="publishedAt" id="publishedAt" value={formData.publishedAt.split('T')[0]} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
              <input type="date" name="expiresAt" id="expiresAt" value={formData.expiresAt ? formData.expiresAt.split('T')[0] : ''} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div>
              <label htmlFor="authorId" className="block text-sm font-medium text-gray-700 mb-1">Author <span className="text-red-500">*</span></label>
              <select name="authorId" id="authorId" value={formData.authorId} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="">-- Select Author --</option>
                {allAuthors.map(author => (
                  <option key={author.id} value={author.id}>{author.name} ({author.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
              <select name="status" id="status" value={formData.status} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="PENDING">Pending</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Announcement Type <span className="text-red-500">*</span></label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="">-- Select Type --</option>
                <option value="GENERAL">General</option>
                <option value="ACADEMIC">Academic</option>
                <option value="EVENT">Event</option>
                <option value="HOLIDAY">Holiday</option>
                <option value="ALERT">Alert</option>
                <option value="NEWS">News</option>
                <option value="POLICY_UPDATE">Policy Update</option>
                <option value="FEEDBACK">Feedback</option>
                <option value="SURVEY">Survey</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">Audience <span className="text-red-500">*</span></label>
              <select name="audience" id="audience" value={formData.audience} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="">-- Select Audience --</option>
                <option value="ALL">All Users</option>
                <option value="ACADEMIC_LEVEL">Academic Level(s)</option>
                <option value="COURSE">Course(s)</option>
                <option value="EDUCATOR">Educator(s)</option>
                <option value="STUDENT">Student(s)</option>
                <option value="DEPARTMENT">Department(s)</option>
                <option value="STAFF">Staff Only</option>
                <option value="PARENT">Parent(s)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Audience Selection Fields */}
          {formData.audience === 'ACADEMIC_LEVEL' && (
            <div className="md:col-span-2">
              <label htmlFor="targetAcademicLevelIds" className="block text-sm font-medium text-gray-700 mb-1">Target Academic Level(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetAcademicLevelIds" id="targetAcademicLevelIds" value={formData.targetAcademicLevelIds} onChange={handleMultiSelectChange} required={formData.audience === 'ACADEMIC_LEVEL'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
              >
                {allAcademicLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
            </div>
          )}

          {formData.audience === 'COURSE' && (
            <div className="md:col-span-2">
              <label htmlFor="targetCourseIds" className="block text-sm font-medium text-gray-700 mb-1">Target Course(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetCourseIds" id="targetCourseIds" value={formData.targetCourseIds} onChange={handleMultiSelectChange} required={formData.audience === 'COURSE'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
              >
                {allCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
            </div>
          )}

          {formData.audience === 'EDUCATOR' && (
            <div className="md:col-span-2">
              <label htmlFor="targetEducatorIds" className="block text-sm font-medium text-gray-700 mb-1">Target Educator(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetEducatorIds" id="targetEducatorIds" value={formData.targetEducatorIds} onChange={handleMultiSelectChange} required={formData.audience === 'EDUCATOR'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
              >
                {allEducators.map(educator => (
                  <option key={educator.id} value={educator.id}>{educator.name} ({educator.email})</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
            </div>
          )}

          {formData.audience === 'STUDENT' && (
            <div className="md:col-span-2">
              <label htmlFor="targetStudentIds" className="block text-sm font-medium text-gray-700 mb-1">Target Student(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetStudentIds" id="targetStudentIds" value={formData.targetStudentIds} onChange={handleMultiSelectChange} required={formData.audience === 'STUDENT'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
              >
                {allStudents.map(student => (
                  <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
            </div>
          )}

          {formData.audience === 'DEPARTMENT' && (
            <div className="md:col-span-2">
              <label htmlFor="targetDepartmentIds" className="block text-sm font-medium text-gray-700 mb-1">Target Department(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetDepartmentIds" id="targetDepartmentIds" value={formData.targetDepartmentIds} onChange={handleMultiSelectChange} required={formData.audience === 'DEPARTMENT'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
              >
                {allDepartments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
            </div>
          )}

          {formData.audience === 'PARENT' && (
            <div className="md:col-span-2">
              <label htmlFor="targetParentIds" className="block text-sm font-medium text-gray-700 mb-1">Target Parent(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetParentIds" id="targetParentIds" value={formData.targetParentIds} onChange={handleMultiSelectChange} required={formData.audience === 'PARENT'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
              >
                {allParents.map(parent => (
                  <option key={parent.id} value={parent.id}>{parent.name} ({parent.email})</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
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
              ) : (isEdit ? 'Save Changes' : 'Publish Announcement')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main AdminAnnouncementsPage Component ---
export default function AdminAnnouncementsPage({
  initialAnnouncements,
  allAcademicLevels,
  allCourses,
  allEducators,
  allStudents,
  allDepartments,
  allParents,
  allAuthors,
  companyId,
  academicLevelId,
  classId,
}: AdminAnnouncementsPageProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>(initialAnnouncements);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAudience, setFilterAudience] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementData | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For API operations
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Fetch announcements from API
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/announcements?companyId=${encodeURIComponent(companyId)}`, {
        next: { revalidate: 60 },
        credentials: 'include'
      });
      if (res.ok) {
        const data: AnnouncementData[] = (await res.json()).data;
        setAnnouncements(data.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
      } else {
        const errorData = (await res.json()).data;
        setError(errorData.message || "Failed to fetch announcements.");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching announcements.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    // Only fetch if initial data is empty (meaning server fetch failed or was empty)
    if (initialAnnouncements.length === 0 && !isLoading && !error) {
      fetchAnnouncements();
    }
  }, [initialAnnouncements, isLoading, error, fetchAnnouncements]);


  const uniqueAudiences = useMemo(() => Array.from(new Set(announcements.map(a => a.audience))).sort(), [announcements]);
  const uniqueTypes = useMemo(() => Array.from(new Set(announcements.map(a => a.type))).sort(), [announcements]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(announcements.map(a => a.status))).sort(), [announcements]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(announcement => {
      const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (announcement.summary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (announcement.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            announcement.authorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAudience = filterAudience === 'All' || announcement.audience === filterAudience;
      const matchesStatus = filterStatus === 'All' || announcement.status === filterStatus;
      const matchesType = filterType === 'All' || announcement.type === filterType;

      return matchesSearch && matchesAudience && matchesStatus && matchesType;
    }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()); // Sort by most recent publish date
  }, [announcements, searchTerm, filterAudience, filterStatus, filterType]);


  const activeAnnouncementsCount = announcements.filter(a => a.status === 'PUBLISHED' && (!a.expiresAt || new Date(a.expiresAt) > new Date())).length;
  const pendingAnnouncementsCount = announcements.filter(a => a.status === 'PENDING').length;
  const archivedAnnouncementsCount = announcements.filter(a => a.status === 'ARCHIVED' || (a.expiresAt && new Date(a.expiresAt) <= new Date())).length; // Also count expired as archived
  // For 'urgent', you'd need a field like `isUrgent` in your model, or a specific type like 'ALERT'
  const alertAnnouncementsCount = announcements.filter(a => a.type === 'ALERT' && a.status === 'PUBLISHED' && (!a.expiresAt || new Date(a.expiresAt) > new Date())).length;


  // Helper for status badge color
  const getStatusColor = (status: AnnouncementData['status']) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // API Call handlers
  const handleSaveAnnouncement = async (announcementData: Omit<AnnouncementData, 'authorName' | 'authorEmail' | 'companyName' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    const method = announcementData.id ? 'PATCH' : 'POST';
    const url = announcementData.id ? `${apiBaseUrl}/announcements/${announcementData.id}` : `${apiBaseUrl}/announcements`;

    try {
      const res = await fetch(url, {
        method: method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...announcementData,
          // Ensure dates are ISO strings for API
          publishedAt: new Date(announcementData.publishedAt).toISOString(),
          expiresAt: announcementData.expiresAt ? new Date(announcementData.expiresAt).toISOString() : null,
        }),
      });

      if (res.ok) {
        await fetchAnnouncements(); // Re-fetch all announcements to update the list
        setShowFormModal(false);
        setEditingAnnouncement(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${method === 'POST' ? 'create' : 'update'} announcement.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'creating' : 'updating'} announcement.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) { // Replace with custom modal
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/announcements/${announcementId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        await fetchAnnouncements();
      } else {
        const errorData = (await res.json()).data;
        setError(errorData.message || "Failed to delete announcement.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting announcement.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnnouncementStatus = async (announcementId: string, newStatus: AnnouncementData['status']) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/announcements/${announcementId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchAnnouncements();
      } else {
        const errorData = (await res.json()).data;
        setError(errorData.message || "Failed to update announcement status.");
      }
    } catch (err: any) {
      setError(err.message || "Network error updating announcement status.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Announcements Management
            <span className="ml-2 text-red-600 text-base sm:text-xl">📢</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Create, edit, and manage school-wide announcements.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <MegaphoneIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Announcements</p>
              <h2 className="text-3xl font-bold text-gray-800">{activeAnnouncementsCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-red-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <BellAlertIcon className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Alerts (Urgent)</p>
              <h2 className="text-3xl font-bold text-gray-800">{alertAnnouncementsCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ExclamationTriangleIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Announcements</p>
              <h2 className="text-3xl font-bold text-gray-800">{pendingAnnouncementsCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-gray-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ArchiveBoxIcon className="h-7 w-7 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Archived/Expired</p>
              <h2 className="text-3xl font-bold text-gray-800">{archivedAnnouncementsCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MegaphoneIcon className="h-5 w-5 text-indigo-500" /> All Announcements
          </h3>
          <button
            onClick={() => { setEditingAnnouncement(null); setShowFormModal(true); setError(null); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Create New Announcement
          </button>
        </div>

        {/* Loading and Error Indicators */}
        {isLoading && (
          <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading announcements...
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

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, summary, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Audiences</option>
              {uniqueAudiences.map(audience => (
                <option key={audience} value={audience}>{audience.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Announcements Table */}
        <div className="overflow-x-auto">
          {filteredAnnouncements.length === 0 && !isLoading && (
            <div className="text-center py-10 text-gray-500">
              No announcements found matching your criteria.
            </div>
          )}
          {filteredAnnouncements.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {announcement.type === 'ALERT' && announcement.status === 'PUBLISHED' && (
                          <BellAlertIcon className="h-4 w-4 text-red-500 mr-2" title="Urgent Alert" />
                        )}
                        <div>
                          {announcement.title}
                          <p className="text-xs text-gray-500 mt-1">{announcement.summary}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                            {announcement.audience.replace(/_/g, ' ')}
                        </span>
                        {/* Optionally show specific targets if audience is not ALL */}
                        {announcement.audience === 'ACADEMIC_LEVEL' && announcement.targetAcademicLevelIds.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                                ({announcement.targetAcademicLevelIds.map(id => allAcademicLevels.find(al => al.id === id)?.name || id).join(', ')})
                            </p>
                        )}
                        {announcement.audience === 'COURSE' && announcement.targetCourseIds.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                                ({announcement.targetCourseIds.map(id => allCourses.find(c => c.id === id)?.title || id).join(', ')})
                            </p>
                        )}
                        {announcement.audience === 'EDUCATOR' && announcement.targetEducatorIds.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                                ({announcement.targetEducatorIds.map(id => allEducators.find(e => e.id === id)?.name || id).join(', ')})
                            </p>
                        )}
                        {announcement.audience === 'STUDENT' && announcement.targetStudentIds.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                                ({announcement.targetStudentIds.map(id => allStudents.find(s => s.id === id)?.name || id).join(', ')})
                            </p>
                        )}
                        {announcement.audience === 'DEPARTMENT' && announcement.targetDepartmentIds.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                                ({announcement.targetDepartmentIds.map(id => allDepartments.find(d => d.id === id)?.name || id).join(', ')})
                            </p>
                        )}
                        {announcement.audience === 'PARENT' && announcement.targetParentIds.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                                ({announcement.targetParentIds.map(id => allParents.find(p => p.id === id)?.name || id).join(', ')})
                            </p>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                            {announcement.type.replace(/_/g, ' ')}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(announcement.publishedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {announcement.expiresAt ? new Date(announcement.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(announcement.status)}`}>
                        {announcement.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingAnnouncement(announcement); setShowFormModal(true); setError(null); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Announcement"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {announcement.status === 'PUBLISHED' && (
                          <button
                            onClick={() => updateAnnouncementStatus(announcement.id, 'ARCHIVED')}
                            className="text-red-600 hover:text-red-800 flex items-center"
                            title="Archive Announcement"
                          >
                            <ArchiveBoxIcon className="h-4 w-4" />
                          </button>
                        )}
                        {announcement.status === 'ARCHIVED' && (
                          <button
                            onClick={() => updateAnnouncementStatus(announcement.id, 'PUBLISHED')}
                            className="text-green-600 hover:text-green-800 flex items-center"
                            title="Reactivate Announcement"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                         {announcement.status === 'PENDING' && (
                          <button
                            onClick={() => updateAnnouncementStatus(announcement.id, 'PUBLISHED')}
                            className="text-green-600 hover:text-green-800 flex items-center"
                            title="Publish Announcement"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="text-gray-400 hover:text-gray-600 flex items-center"
                          title="Delete Announcement"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <AnnouncementFormModal
          announcementData={editingAnnouncement}
          onClose={() => { setShowFormModal(false); setEditingAnnouncement(null); setError(null); }}
          onSave={handleSaveAnnouncement}
          isLoading={isLoading}
          error={error}
          resetError={() => setError(null)}
          companyId={companyId}
          allAcademicLevels={allAcademicLevels}
          allCourses={allCourses}
          allEducators={allEducators}
          allStudents={allStudents}
          allDepartments={allDepartments}
          allParents={allParents}
          allAuthors={allAuthors}
          academicLevelId={academicLevelId}
          classId={classId}
        />
      )}
    </div>
  );
}
