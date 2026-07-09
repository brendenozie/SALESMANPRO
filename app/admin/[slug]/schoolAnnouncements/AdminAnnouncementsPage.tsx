// app/admin/[slug]/announcements/AdminAnnouncementsPage.tsx
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  MegaphoneIcon, 
  CalendarDaysIcon, 
  PlusCircleIcon, 
  PencilIcon, 
  MagnifyingGlassIcon, 
  TrashIcon, 
  ArchiveBoxIcon, 
  ArrowPathIcon, 
  BellAlertIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Type Definitions (Exported for the Server Component) ---
export type AnnouncementData = {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  publishedAt: string; 
  expiresAt: string | null; 
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

export type AcademicLevelOption = { id: string; name: string };
export type CourseOption = { id: string; title: string };
export type EducatorOption = { id: string; name: string; email: string };
export type StudentOption = { id: string; name: string; email: string };
export type DepartmentOption = { id: string; name: string };
export type ParentOption = { id: string; name: string; email: string };
export type AuthorOption = { id: string; name: string; email: string };

// --- Display Labels Mapping ---
const TYPE_LABELS: Record<AnnouncementData['type'], string> = {
  GENERAL: '📢 General News',
  ACADEMIC: '🎓 Learning & Classes',
  EVENT: '🎉 Campus Event',
  HOLIDAY: '🏖️ School Holiday',
  ALERT: '🚨 Urgent Alert',
  NEWS: '📰 Newsletter',
  POLICY_UPDATE: '📜 Rule & Policy Change',
  FEEDBACK: '💬 Feedback Request',
  SURVEY: '📝 Quick Survey',
  OTHER: '✨ Other Update',
};

const AUDIENCE_LABELS: Record<AnnouncementData['audience'], string> = {
  ALL: '🌍 Everyone',
  ACADEMIC_LEVEL: '🏫 Specific Grades / Levels',
  COURSE: '📖 Particular Courses',
  EDUCATOR: '👩‍🏫 Teachers & Faculty',
  STUDENT: '🎒 Students Only',
  DEPARTMENT: '🏢 Staff Departments',
  STAFF: '💼 All School Staff',
  PARENT: '👨‍👩‍👦 Parents & Guardians',
};

const STATUS_LABELS: Record<AnnouncementData['status'], string> = {
  PENDING: '⏳ Saved as Draft',
  PUBLISHED: '✅ Live & Visible',
  ARCHIVED: '📁 Put Away / Archived',
};

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
}

// --- Dynamic Checkbox Grid For Target Selections ---
interface TargetSelectorProps {
  title: string;
  placeholder: string;
  options: Array<{ id: string; primary: string; secondary?: string }>;
  selectedIds: string[];
  onChange: (nextIds: string[]) => void;
}

const TargetSelector: React.FC<TargetSelectorProps> = ({ title, placeholder, options, selectedIds, onChange }) => {
  const [search, setSearch] = useState('');
  
  const filtered = useMemo(() => {
    return options.filter(opt => 
      opt.primary.toLowerCase().includes(search.toLowerCase()) || 
      (opt.secondary && opt.secondary.toLowerCase().includes(search.toLowerCase()))
    );
  }, [options, search]);

  return (
    <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <span>{title}</span>
          <span className="text-red-500">*</span>
        </label>
        <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
          {selectedIds.length} selected
        </span>
      </div>
      
      <div className="relative">
        <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-500 col-span-2 py-2 text-center">No matching options found.</p>
        ) : (
          filtered.map(opt => {
            const isChecked = selectedIds.includes(opt.id);
            return (
              <label 
                key={opt.id} 
                className={`flex items-start space-x-2 p-2 rounded-lg border cursor-pointer transition-all select-none ${
                  isChecked 
                    ? 'bg-indigo-50 border-indigo-300 shadow-sm' 
                    : 'bg-white border-gray-200 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const next = isChecked 
                      ? selectedIds.filter(id => id !== opt.id)
                      : [...selectedIds, opt.id];
                    onChange(next);
                  }}
                  className="mt-0.5 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <div className="text-xs">
                  <p className="font-semibold text-gray-800">{opt.primary}</p>
                  {opt.secondary && <p className="text-gray-500 font-normal truncate max-w-[220px]">{opt.secondary}</p>}
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};

// --- Form Dialog Layer Modal ---
type AnnouncementFormModalProps = {
  announcementData: AnnouncementData | null;
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
  const [localWarning, setLocalWarning] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<AnnouncementData, 'authorName' | 'authorEmail' | 'companyName' | 'createdAt' | 'updatedAt'>>(
    announcementData || {
      id: '',
      title: '',
      summary: null,
      content: null,
      publishedAt: new Date().toISOString().split('T')[0], 
      expiresAt: null,
      authorId: '', 
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetError();
    setLocalWarning(null);

    if (!formData.title?.trim()) {
      setLocalWarning("Please write a headline or title for this announcement.");
      return;
    }
    if (!formData.publishedAt) {
      setLocalWarning("Please pick a date for when this announcement should be live.");
      return;
    }
    if (!formData.authorId) {
      setLocalWarning("Please assign an official author name to this announcement.");
      return;
    }

    const publishedDate = new Date(formData.publishedAt);
    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt);
      if (expiryDate <= publishedDate) {
        setLocalWarning("The hide/expiry date must be a future day after the launch date.");
        return;
      }
    }

    if (formData.audience === 'ACADEMIC_LEVEL' && formData.targetAcademicLevelIds.length === 0) {
      setLocalWarning("Please select at least one grade/academic level from the list below.");
      return;
    }
    if (formData.audience === 'COURSE' && formData.targetCourseIds.length === 0) {
      setLocalWarning("Please select at least one course from the checklist below.");
      return;
    }
    if (formData.audience === 'EDUCATOR' && formData.targetEducatorIds.length === 0) {
      setLocalWarning("Please choose at least one teacher or educator to receive this.");
      return;
    }
    if (formData.audience === 'STUDENT' && formData.targetStudentIds.length === 0) {
      setLocalWarning("Please choose at least one student recipient from the directory grid.");
      return;
    }
    if (formData.audience === 'DEPARTMENT' && formData.targetDepartmentIds.length === 0) {
      setLocalWarning("Please select at least one office staff department group.");
      return;
    }
    if (formData.audience === 'PARENT' && formData.targetParentIds.length === 0) {
      setLocalWarning("Please mark at least one parent or guardian recipient.");
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 border-b pb-3 border-gray-100">
          {formData.id ? `✏️ Edit: ${announcementData?.title}` : '📢 Write a New Announcement'}
        </h2>

        {(error || localWarning) && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-xl mb-5 flex items-start justify-between gap-2 text-sm shadow-xs">
            <div className="flex gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{localWarning || error}</span>
            </div>
            <button type="button" onClick={() => { resetError(); setLocalWarning(null); }} className="text-amber-700 hover:text-amber-950">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">Headline / Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Campus Library Hours Extended"
                className="block w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="summary" className="block text-sm font-semibold text-gray-700 mb-1">Short Summary</label>
              <input type="text" name="summary" id="summary" value={formData.summary || ''} onChange={handleChange} placeholder="A brief context sentence shown in notification logs..."
                className="block w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-1">Full Announcement Details</label>
              <textarea name="content" id="content" value={formData.content || ''} onChange={handleChange} rows={4} placeholder="Type the complete detailed message block here..."
                className="block w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>

            <div>
              <label htmlFor="publishedAt" className="block text-sm font-semibold text-gray-700 mb-1">Launch Date <span className="text-red-500">*</span></label>
              <input type="date" name="publishedAt" id="publishedAt" value={formData.publishedAt.split('T')[0]} onChange={handleChange} required
                className="block w-full px-4 py-2 border border-gray-300 rounded-xl bg-white" />
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-semibold text-gray-700 mb-1">Automatic Hide Date</label>
              <input type="date" name="expiresAt" id="expiresAt" value={formData.expiresAt ? formData.expiresAt.split('T')[0] : ''} onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-xl bg-white" />
            </div>

            <div>
              <label htmlFor="authorId" className="block text-sm font-semibold text-gray-700 mb-1">Sender Profile / Author <span className="text-red-500">*</span></label>
              <select name="authorId" id="authorId" value={formData.authorId} onChange={handleChange} required
                className="block w-full px-4 py-2 border border-gray-300 rounded-xl bg-white cursor-pointer"
              >
                <option value="">-- Choose Author --</option>
                {allAuthors.map(author => (
                  <option key={author.id} value={author.id}>{author.name} ({author.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-1">Publish Status <span className="text-red-500">*</span></label>
              <select name="status" id="status" value={formData.status} onChange={handleChange} required
                className="block w-full px-4 py-2 border border-gray-300 rounded-xl bg-white cursor-pointer"
              >
                <option value="PENDING">⏳ Save as Rough Draft</option>
                <option value="PUBLISHED">🚀 Publish Immediately (Live)</option>
                <option value="ARCHIVED">📁 Put Direct Into Archive</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-1">Category Type <span className="text-red-500">*</span></label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} required
                className="block w-full px-4 py-2 border border-gray-300 rounded-xl bg-white cursor-pointer"
              >
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-semibold text-gray-700 mb-1">Who Should See This? <span className="text-red-500">*</span></label>
              <select name="audience" id="audience" value={formData.audience} onChange={handleChange} required
                className="block w-full px-4 py-2 border border-gray-300 rounded-xl bg-white cursor-pointer"
              >
                {Object.entries(AUDIENCE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Target Filter Checkbox Lists */}
          {formData.audience === 'ACADEMIC_LEVEL' && (
            <TargetSelector
              title="Target Grade / Academic Levels"
              placeholder="Search grade groups..."
              options={allAcademicLevels.map(l => ({ id: l.id, primary: l.name }))}
              selectedIds={formData.targetAcademicLevelIds}
              onChange={(ids) => setFormData(p => ({ ...p, targetAcademicLevelIds: ids }))}
            />
          )}

          {formData.audience === 'COURSE' && (
            <TargetSelector
              title="Target Learning Courses / Subjects"
              placeholder="Search course titles..."
              options={allCourses.map(c => ({ id: c.id, primary: c.title }))}
              selectedIds={formData.targetCourseIds}
              onChange={(ids) => setFormData(p => ({ ...p, targetCourseIds: ids }))}
            />
          )}

          {formData.audience === 'EDUCATOR' && (
            <TargetSelector
              title="Target Teachers / Staff Faculty"
              placeholder="Search educators by name or email..."
              options={allEducators.map(e => ({ id: e.id, primary: e.name, secondary: e.email }))}
              selectedIds={formData.targetEducatorIds}
              onChange={(ids) => setFormData(p => ({ ...p, targetEducatorIds: ids }))}
            />
          )}

          {formData.audience === 'STUDENT' && (
            <TargetSelector
              title="Target Specific Students"
              placeholder="Search students directory..."
              options={allStudents.map(s => ({ id: s.id, primary: s.name, secondary: s.email }))}
              selectedIds={formData.targetStudentIds}
              onChange={(ids) => setFormData(p => ({ ...p, targetStudentIds: ids }))}
            />
          )}

          {formData.audience === 'DEPARTMENT' && (
            <TargetSelector
              title="Target Operational Departments"
              placeholder="Search office teams..."
              options={allDepartments.map(d => ({ id: d.id, primary: d.name }))}
              selectedIds={formData.targetDepartmentIds}
              onChange={(ids) => setFormData(p => ({ ...p, targetDepartmentIds: ids }))}
            />
          )}

          {formData.audience === 'PARENT' && (
            <TargetSelector
              title="Target Parents & Family Guardians"
              placeholder="Search family contacts..."
              options={allParents.map(p => ({ id: p.id, primary: p.name, secondary: p.email }))}
              selectedIds={formData.targetParentIds}
              onChange={(ids) => setFormData(p => ({ ...p, targetParentIds: ids }))}
            />
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition-colors text-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (formData.id ? 'Save Updates' : 'Publish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Admin Announcements Dashboard Screen ---
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
}: AdminAnnouncementsPageProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>(initialAnnouncements);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAudience, setFilterAudience] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementData | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/announcements?companyId=${encodeURIComponent(companyId)}`);
      if (res.ok) {
        const payload = await res.json();
        const data = (payload?.data || payload) as AnnouncementData[];
        setAnnouncements(data.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
      } else {
        let errMsg = "Could not successfully retrieve announcements.";
        try {
          const errorData = await res.json();
          errMsg = errorData?.message || errMsg;
        } catch { /* ignored */ }
        setError(errMsg);
      }
    } catch (err: any) {
      setError(err.message || "A networking hitch happened while talking to the server.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
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
    }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [announcements, searchTerm, filterAudience, filterStatus, filterType]);

  const activeCount = announcements.filter(a => a.status === 'PUBLISHED' && (!a.expiresAt || new Date(a.expiresAt) > new Date())).length;
  const draftCount = announcements.filter(a => a.status === 'PENDING').length;
  const archivedCount = announcements.filter(a => a.status === 'ARCHIVED' || (a.expiresAt && new Date(a.expiresAt) <= new Date())).length;
  const urgentAlertCount = announcements.filter(a => a.type === 'ALERT' && a.status === 'PUBLISHED' && (!a.expiresAt || new Date(a.expiresAt) > new Date())).length;

  const getStatusStyle = (status: AnnouncementData['status']) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'ARCHIVED': return 'bg-slate-100 text-slate-700 border border-slate-200';
      default: return 'bg-blue-50 text-blue-700 border border-blue-200';
    }
  };

  const handleSaveAnnouncement = async (announcementData: Omit<AnnouncementData, 'authorName' | 'authorEmail' | 'companyName' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    const method = announcementData.id ? 'PATCH' : 'POST';
    const url = announcementData.id ? `${apiBaseUrl}/admin/announcements/${announcementData.id}` : `${apiBaseUrl}/admin/announcements`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...announcementData,
          publishedAt: new Date(announcementData.publishedAt).toISOString(),
          expiresAt: announcementData.expiresAt ? new Date(announcementData.expiresAt).toISOString() : null,
        }),
      });

      if (res.ok) {
        await fetchAnnouncements(); 
        setShowFormModal(false);
        setEditingAnnouncement(null);
      } else {
        let errMsg = "Failed to successfully write updates.";
        try {
          const errorData = await res.json();
          errMsg = errorData?.message || errMsg;
        } catch { /* safe catch */ }
        setError(errMsg);
      }
    } catch (err: any) {
      setError(err.message || "A networking connection issue occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const CONFIRMED_DeleteAnnouncement = async (announcementId: string) => {
    setIsLoading(true);
    setError(null);
    setPendingDeleteId(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/announcements/${announcementId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAnnouncements();
      } else {
        let errMsg = "Failed to remove the selected item.";
        try {
          const errorData = await res.json();
          errMsg = errorData?.message || errMsg;
        } catch { /* safe catch */ }
        setError(errMsg);
      }
    } catch (err: any) {
      setError(err.message || "Network link failure during removal.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnnouncementStatus = async (announcementId: string, newStatus: AnnouncementData['status']) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/announcements/${announcementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchAnnouncements();
      } else {
        let errMsg = "Could not modify state.";
        try {
          const errorData = await res.json();
          errMsg = errorData?.message || errMsg;
        } catch { /* safe catch */ }
        setError(errMsg);
      }
    } catch (err: any) {
      setError(err.message || "Network error processing status change.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50 min-h-screen text-slate-800">
      
      {/* Dynamic Screen Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            School Announcements Manager 📢
          </h1>
          <p className="text-sm text-slate-500 mt-1">Broadcast targeted campus feeds, policy notifications, and dashboard updates.</p>
        </div>
        <div className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
          <span>{today}</span>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-blue-100 bg-white flex items-center">
          <div className="p-3 bg-blue-50 rounded-xl mr-4"><MegaphoneIcon className="h-6 w-6 text-blue-600" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Feeds</p>
            <h2 className="text-2xl font-black text-slate-800">{activeCount}</h2>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-rose-100 bg-white flex items-center">
          <div className="p-3 bg-rose-50 rounded-xl mr-4"><BellAlertIcon className="h-6 w-6 text-rose-600" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Urgent Alerts</p>
            <h2 className="text-2xl font-black text-slate-800">{urgentAlertCount}</h2>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-amber-100 bg-white flex items-center">
          <div className="p-3 bg-amber-50 rounded-xl mr-4"><ExclamationTriangleIcon className="h-6 w-6 text-amber-600" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Draft Status</p>
            <h2 className="text-2xl font-black text-slate-800">{draftCount}</h2>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center">
          <div className="p-3 bg-slate-50 rounded-xl mr-4"><ArchiveBoxIcon className="h-6 w-6 text-slate-500" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Archived Rows</p>
            <h2 className="text-2xl font-black text-slate-800">{archivedCount}</h2>
          </div>
        </div>
      </div>

      {/* Dashboard Matrix Grid */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4 border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">📋 All Broadcast Entries</h3>
            <p className="text-xs text-slate-400">Filter notifications down or tap action triggers below.</p>
          </div>
          <button
            onClick={() => { setEditingAnnouncement(null); setShowFormModal(true); setError(null); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs font-semibold text-sm transition-colors cursor-pointer"
          >
            <PlusCircleIcon className="h-5 w-5" /> Write New Announcement
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl mb-5 flex items-center justify-between text-sm shadow-xs">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900 font-bold">dismiss</button>
          </div>
        )}

        {/* Filtering Options Control Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title, body, or sender..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm placeholder-slate-400 bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)} className="block w-full py-2 px-3 border border-slate-300 bg-white rounded-xl text-sm cursor-pointer">
              <option value="All">🌍 All Audiences</option>
              {uniqueAudiences.map(aud => <option key={aud} value={aud}>{AUDIENCE_LABELS[aud] || aud}</option>)}
            </select>
          </div>
          <div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="block w-full py-2 px-3 border border-slate-300 bg-white rounded-xl text-sm cursor-pointer">
              <option value="All">🔖 All Categories</option>
              {uniqueTypes.map(t => <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>)}
            </select>
          </div>
          <div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="block w-full py-2 px-3 border border-slate-300 bg-white rounded-xl text-sm cursor-pointer">
              <option value="All">🚦 All States</option>
              {uniqueStatuses.map(st => <option key={st} value={st}>{STATUS_LABELS[st] || st}</option>)}
            </select>
          </div>
        </div>

        {/* Content Table Container */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 text-slate-400">
              <MegaphoneIcon className="h-10 w-10 mx-auto opacity-20 mb-2" />
              <p className="text-sm">No matches found for your active filters.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Announcement Title & Summary</th>
                  <th className="px-6 py-3.5">Who Sees This?</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Launch Date</th>
                  <th className="px-6 py-3.5">Hides After</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="relative px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-sm font-medium">
                {filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start max-w-sm">
                        {announcement.type === 'ALERT' && announcement.status === 'PUBLISHED' && (
                          <BellAlertIcon className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0 mt-0.5 animate-bounce" />
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{announcement.title}</p>
                          {announcement.summary && <p className="text-xs text-slate-400 font-normal mt-0.5 truncate">{announcement.summary}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        {AUDIENCE_LABELS[announcement.audience] || announcement.audience}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {TYPE_LABELS[announcement.type] || announcement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-normal">
                      {new Date(announcement.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-normal">
                      {announcement.expiresAt ? new Date(announcement.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '♾️ Keeps showing'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 text-xs leading-5 font-bold rounded-full ${getStatusStyle(announcement.status)}`}>
                        {STATUS_LABELS[announcement.status] || announcement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingAnnouncement(announcement); setShowFormModal(true); setError(null); }}
                          className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        
                        {announcement.status === 'PUBLISHED' && (
                          <button onClick={() => updateAnnouncementStatus(announcement.id, 'ARCHIVED')} className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                            <ArchiveBoxIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        {announcement.status === 'ARCHIVED' && (
                          <button onClick={() => updateAnnouncementStatus(announcement.id, 'PUBLISHED')} className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        {announcement.status === 'PENDING' && (
                          <button onClick={() => updateAnnouncementStatus(announcement.id, 'PUBLISHED')} className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button onClick={() => setPendingDeleteId(announcement.id)} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
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

      {/* Confirmation Modal Overlay */}
      {pendingDeleteId && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">⚠️ Remove permanently?</h3>
            <p className="text-slate-500 text-sm mb-5 leading-relaxed">
              This completely removes this announcement. Recipients will lose visibility on their mobile or web workspace interfaces instantly.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPendingDeleteId(null)} className="px-4 py-2 text-sm font-medium border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={() => CONFIRMED_DeleteAnnouncement(pendingDeleteId)} className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Multipurpose Context Modal Layer */}
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
        />
      )}
    </div>
  );
}