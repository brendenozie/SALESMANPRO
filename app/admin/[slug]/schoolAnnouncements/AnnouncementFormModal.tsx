// app/admin/[slug]/announcements/AnnouncementFormModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';
import { 
  AnnouncementData, 
  AcademicLevelOption, 
  CourseOption, 
  EducatorOption, 
  StudentOption, 
  DepartmentOption, 
  ParentOption, 
  AuthorOption 
} from './AdminAnnouncementsPage';

// --- Dynamic Checkbox Grid For Target Selections ---
interface TargetSelectorProps {
  title: string;
  placeholder: string;
  options: Array<{ id: string; primary: string; secondary?: string }>;
  selectedIds: string[];
  onChange: (nextIds: string[]) => void;
}

const TargetSelector: React.FC<TargetSelectorProps> = ({ 
  title, 
  placeholder, 
  options, 
  selectedIds, 
  onChange 
}) => {
  const [search, setSearch] = useState('');
  
  const filtered = useMemo(() => {
    return options.filter(opt => 
      opt.primary.toLowerCase().includes(search.toLowerCase()) || 
      (opt.secondary && opt.secondary.toLowerCase().includes(search.toLowerCase()))
    );
  }, [options, search]);

  return (
    <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <span>{title}</span>
          <span className="text-rose-500">*</span>
        </label>
        <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full">
          {selectedIds.length} selected
        </span>
      </div>
      
      <div className="relative">
        <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-500 col-span-2 py-3 text-center">No matching options found.</p>
        ) : (
          filtered.map(opt => {
            const isChecked = selectedIds.includes(opt.id);
            return (
              <label 
                key={opt.id} 
                className={`flex items-start space-x-2.5 p-2 rounded-lg border cursor-pointer transition-all select-none ${
                  isChecked 
                    ? 'bg-indigo-50 border-indigo-300 shadow-2xs' 
                    : 'bg-white border-slate-200 hover:bg-slate-100'
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
                  className="mt-0.5 h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">{opt.primary}</p>
                  {opt.secondary && <p className="text-slate-500 font-normal truncate max-w-[220px]">{opt.secondary}</p>}
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
  currentUserId?: string;
  TYPE_LABELS?: Record<string, string>;
  AUDIENCE_LABELS?: Record<string, string>;
};

const DEFAULT_TYPE_LABELS: Record<string, string> = {
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

const DEFAULT_AUDIENCE_LABELS: Record<string, string> = {
  ALL: '🌐 Everyone (Entire School / Organization)',
  ACADEMIC_LEVEL: '🏫 Specific Grade / Academic Level',
  COURSE: '📖 Specific Course / Subject',
  EDUCATOR: '👩‍🏫 Teachers & Faculty',
  STUDENT: '🎒 Students Only',
  DEPARTMENT: '🏢 Office / Operational Department',
  STAFF: '💼 All School Staff',
  PARENT: '👨‍👩‍👦 Parents & Guardians',
};

export const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({
  announcementData,
  onClose,
  onSave,
  isLoading,
  error,
  resetError,
  companyId,
  allAcademicLevels = [],
  allCourses = [],
  allEducators = [],
  allStudents = [],
  allDepartments = [],
  allParents = [],
  allAuthors = [],
  currentUserId = '',
  TYPE_LABELS = DEFAULT_TYPE_LABELS,
  AUDIENCE_LABELS = DEFAULT_AUDIENCE_LABELS,
}) => {
  const [localWarning, setLocalWarning] = useState<string | null>(null);

  const initialFormState = {
    id: '',
    title: '',
    summary: null,
    content: null,
    publishedAt: new Date().toISOString().split('T')[0],
    expiresAt: null,
    authorId: currentUserId,
    companyId: companyId,
    status: 'PENDING' as const,
    type: 'GENERAL' as const,
    audience: 'ALL' as const,
    targetAcademicLevelIds: [],
    targetCourseIds: [],
    targetEducatorIds: [],
    targetStudentIds: [],
    targetDepartmentIds: [],
    targetParentIds: [],
  };

  const [formData, setFormData] = useState<
    Omit<AnnouncementData, 'authorName' | 'authorEmail' | 'companyName' | 'createdAt' | 'updatedAt'>
  >(announcementData || initialFormState);

  useEffect(() => {
    if (announcementData) {
      setFormData(announcementData);
    }
  }, [announcementData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value === '' ? null : value,
      };

      // Reset target selection arrays when switching audience focus
      if (name === 'audience') {
        updated.targetAcademicLevelIds = [];
        updated.targetCourseIds = [];
        updated.targetEducatorIds = [];
        updated.targetStudentIds = [];
        updated.targetDepartmentIds = [];
        updated.targetParentIds = [];
      }

      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetError();
    setLocalWarning(null);

    if (!formData.title?.trim()) {
      setLocalWarning('Please write a headline or title for this announcement.');
      return;
    }
    if (!formData.publishedAt) {
      setLocalWarning('Please pick a date for when this announcement should be live.');
      return;
    }
    if (!formData.authorId) {
      setLocalWarning('Please assign an official author name to this announcement.');
      return;
    }

    const publishedDate = new Date(formData.publishedAt);
    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt);
      if (expiryDate <= publishedDate) {
        setLocalWarning('The hide/expiry date must be a future date after the launch date.');
        return;
      }
    }

    // Validation per audience scope
    if (formData.audience === 'ACADEMIC_LEVEL' && formData.targetAcademicLevelIds.length === 0) {
      setLocalWarning('Please select at least one grade/academic level from the list below.');
      return;
    }
    if (formData.audience === 'COURSE' && formData.targetCourseIds.length === 0) {
      setLocalWarning('Please select at least one course from the checklist below.');
      return;
    }
    if (formData.audience === 'EDUCATOR' && formData.targetEducatorIds.length === 0) {
      setLocalWarning('Please choose at least one teacher or educator to receive this.');
      return;
    }
    if (formData.audience === 'STUDENT' && formData.targetStudentIds.length === 0) {
      setLocalWarning('Please choose at least one student recipient from the directory grid.');
      return;
    }
    if (formData.audience === 'DEPARTMENT' && formData.targetDepartmentIds.length === 0) {
      setLocalWarning('Please select at least one office staff department group.');
      return;
    }
    if (formData.audience === 'PARENT' && formData.targetParentIds.length === 0) {
      setLocalWarning('Please mark at least one parent or guardian recipient.');
      return;
    }

    // Sanitize output payload so non-selected target arrays are cleared
    const cleanedPayload = {
      ...formData,
      targetAcademicLevelIds: formData.audience === 'ACADEMIC_LEVEL' ? formData.targetAcademicLevelIds : [],
      targetCourseIds: formData.audience === 'COURSE' ? formData.targetCourseIds : [],
      targetEducatorIds: formData.audience === 'EDUCATOR' ? formData.targetEducatorIds : [],
      targetStudentIds: formData.audience === 'STUDENT' ? formData.targetStudentIds : [],
      targetDepartmentIds: formData.audience === 'DEPARTMENT' ? formData.targetDepartmentIds : [],
      targetParentIds: formData.audience === 'PARENT' ? formData.targetParentIds : [],
    };

    onSave(cleanedPayload);
  };

  const formattedPublishDate = formData.publishedAt ? formData.publishedAt.split('T')[0] : '';
  const formattedExpiryDate = formData.expiresAt ? formData.expiresAt.split('T')[0] : '';

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 border-b pb-3 border-slate-100">
          {formData.id ? `✏️ Edit: ${announcementData?.title || 'Announcement'}` : '📢 Write a New Announcement'}
        </h2>

        {(error || localWarning) && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-xl mb-5 flex items-start justify-between gap-2 text-sm shadow-xs">
            <div className="flex gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{localWarning || error}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                resetError();
                setLocalWarning(null);
              }}
              className="text-amber-700 hover:text-amber-950 p-0.5 rounded-md hover:bg-amber-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1">
                Headline / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Campus Library Hours Extended"
                className="block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="summary" className="block text-sm font-semibold text-slate-700 mb-1">
                Short Summary
              </label>
              <input
                type="text"
                name="summary"
                id="summary"
                value={formData.summary || ''}
                onChange={handleChange}
                placeholder="A brief context sentence shown in notification logs..."
                className="block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-semibold text-slate-700 mb-1">
                Full Announcement Details
              </label>
              <textarea
                name="content"
                id="content"
                value={formData.content || ''}
                onChange={handleChange}
                rows={4}
                placeholder="Type the complete detailed message block here..."
                className="block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="publishedAt" className="block text-sm font-semibold text-slate-700 mb-1">
                Launch Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="publishedAt"
                id="publishedAt"
                value={formattedPublishDate}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-semibold text-slate-700 mb-1">
                Automatic Hide Date
              </label>
              <input
                type="date"
                name="expiresAt"
                id="expiresAt"
                value={formattedExpiryDate}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="authorId" className="block text-sm font-semibold text-slate-700 mb-1">
                Sender Profile / Author <span className="text-rose-500">*</span>
              </label>
              <select
                name="authorId"
                id="authorId"
                value={formData.authorId}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-slate-300 rounded-xl bg-white cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Choose Author --</option>
                {allAuthors && allAuthors.length > 0 && allAuthors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name} ({author.email || 'No Email'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-1">
                Publish Status <span className="text-rose-500">*</span>
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-slate-300 rounded-xl bg-white cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="PENDING">⏳ Save as Rough Draft</option>
                <option value="PUBLISHED">🚀 Publish Immediately (Live)</option>
                <option value="ARCHIVED">📁 Put Direct Into Archive</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-slate-700 mb-1">
                Category Type <span className="text-rose-500">*</span>
              </label>
              <select
                name="type"
                id="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-slate-300 rounded-xl bg-white cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-semibold text-slate-700 mb-1">
                Who Should See This? <span className="text-rose-500">*</span>
              </label>
              <select
                name="audience"
                id="audience"
                value={formData.audience}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-slate-300 rounded-xl bg-white cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.entries(AUDIENCE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Audience Selectors */}
          {formData.audience === 'ACADEMIC_LEVEL' && (
            <TargetSelector
              title="Target Grade / Academic Levels"
              placeholder="Search grade groups..."
              options={allAcademicLevels.map((l) => ({ id: l.id, primary: l.name || '' }))}
              selectedIds={formData.targetAcademicLevelIds}
              onChange={(ids) => setFormData((p) => ({ ...p, targetAcademicLevelIds: ids }))}
            />
          )}

          {formData.audience === 'COURSE' && (
            <TargetSelector
              title="Target Learning Courses / Subjects"
              placeholder="Search course titles..."
              options={allCourses.map((c) => ({ id: c.id, primary: c.title || '' }))}
              selectedIds={formData.targetCourseIds}
              onChange={(ids) => setFormData((p) => ({ ...p, targetCourseIds: ids }))}
            />
          )}

          {formData.audience === 'EDUCATOR' && (
            <TargetSelector
              title="Target Teachers / Staff Faculty"
              placeholder="Search educators by name or email..."
              options={allEducators.map((e) => ({
                id: e.id,
                primary: e.name || '',
                secondary: e.email,
              }))}
              selectedIds={formData.targetEducatorIds}
              onChange={(ids) => setFormData((p) => ({ ...p, targetEducatorIds: ids }))}
            />
          )}

          {formData.audience === 'STUDENT' && (
            <TargetSelector
              title="Target Specific Students"
              placeholder="Search students directory..."
              options={allStudents.map((s) => ({
                id: s.id,
                primary: s.name || '',
                secondary: s.email,
              }))}
              selectedIds={formData.targetStudentIds}
              onChange={(ids) => setFormData((p) => ({ ...p, targetStudentIds: ids }))}
            />
          )}

          {formData.audience === 'DEPARTMENT' && (
            <TargetSelector
              title="Target Operational Departments"
              placeholder="Search office teams..."
              options={allDepartments.map((d) => ({ id: d.id, primary: d.name || '' }))}
              selectedIds={formData.targetDepartmentIds}
              onChange={(ids) => setFormData((p) => ({ ...p, targetDepartmentIds: ids }))}
            />
          )}

          {formData.audience === 'PARENT' && (
            <TargetSelector
              title="Target Parents & Family Guardians"
              placeholder="Search family contacts..."
              options={allParents.map((p) => ({
                id: p.id,
                primary: p.name || '',
                secondary: p.email,
              }))}
              selectedIds={formData.targetParentIds}
              onChange={(ids) => setFormData((p) => ({ ...p, targetParentIds: ids }))}
            />
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors text-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : formData.id ? (
                'Save Updates'
              ) : (
                'Publish'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};