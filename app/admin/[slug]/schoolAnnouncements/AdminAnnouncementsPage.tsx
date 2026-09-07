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
  CheckCircleIcon, 
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { AnnouncementFormModal } from './AnnouncementFormModal';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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
  currentUserId?: string;
}

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
  currentUserId,
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

  // Client-safe date formatting to prevent hydration mismatches
  const [todayDate, setTodayDate] = useState('');
  useEffect(() => {
    setTodayDate(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  // Sync initialAnnouncements if server revalidates
  useEffect(() => {
    setAnnouncements(initialAnnouncements);
  }, [initialAnnouncements]);

  // Manual refresh fallback
  const refreshAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/announcements?companyId=${encodeURIComponent(companyId)}`);
      if (res.ok) {
        const payload = await res.json();
        const data = (payload?.data?.data || payload?.data || payload) as AnnouncementData[];
        setAnnouncements(data);
      } else {
        const errorData = await res.json().catch(() => null);
        setError(errorData?.message || 'Could not retrieve announcements.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred while contacting the server.');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  // Combined Single-Pass Memoization for Metrics & Select Filters
  const {
    activeCount,
    draftCount,
    archivedCount,
    urgentAlertCount,
    uniqueAudiences,
    uniqueTypes,
    uniqueStatuses,
  } = useMemo(() => {
    const now = new Date();
    let active = 0, draft = 0, archived = 0, urgent = 0;
    const audiences = new Set<string>();
    const types = new Set<string>();
    const statuses = new Set<string>();

    for (let i = 0; i < announcements.length; i++) {
      const item = announcements[i];
      if (item.audience) audiences.add(item.audience);
      if (item.type) types.add(item.type);
      if (item.status) statuses.add(item.status);

      const isExpired = item.expiresAt ? new Date(item.expiresAt) <= now : false;

      if (item.status === 'PUBLISHED' && !isExpired) {
        active++;
        if (item.type === 'ALERT') urgent++;
      } else if (item.status === 'PENDING') {
        draft++;
      } else if (item.status === 'ARCHIVED' || isExpired) {
        archived++;
      }
    }

    return {
      activeCount: active,
      draftCount: draft,
      archivedCount: archived,
      urgentAlertCount: urgent,
      uniqueAudiences: Array.from(audiences).sort(),
      uniqueTypes: Array.from(types).sort(),
      uniqueStatuses: Array.from(statuses).sort(),
    };
  }, [announcements]);

  // Filter & Sort Logic
  const filteredAnnouncements = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return announcements
      .filter((announcement) => {
        const matchesSearch =
          !term ||
          announcement.title.toLowerCase().includes(term) ||
          (announcement.summary || '').toLowerCase().includes(term) ||
          (announcement.content || '').toLowerCase().includes(term) ||
          (announcement.authorName || '').toLowerCase().includes(term);

        const matchesAudience = filterAudience === 'All' || announcement.audience === filterAudience;
        const matchesStatus = filterStatus === 'All' || announcement.status === filterStatus;
        const matchesType = filterType === 'All' || announcement.type === filterType;

        return matchesSearch && matchesAudience && matchesStatus && matchesType;
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [announcements, searchTerm, filterAudience, filterStatus, filterType]);

  // OPTIMISTIC UI: Delete Announcement
  const handleConfirmedDelete = async (announcementId: string) => {
    setPendingDeleteId(null);
    setError(null);

    const previousState = [...announcements];
    setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));

    try {
      const res = await fetch(`${apiBaseUrl}/admin/announcements/${announcementId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete announcement.');
      }
    } catch (err: any) {
      setAnnouncements(previousState);
      setError(err.message || 'Network error during deletion.');
    }
  };

  // OPTIMISTIC UI: Status Update
  const updateAnnouncementStatus = async (announcementId: string, newStatus: AnnouncementData['status']) => {
    setError(null);
    const previousState = [...announcements];

    setAnnouncements((prev) =>
      prev.map((a) => (a.id === announcementId ? { ...a, status: newStatus } : a))
    );

    try {
      const res = await fetch(`${apiBaseUrl}/admin/announcements/${announcementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Could not update status.');
      }
    } catch (err: any) {
      setAnnouncements(previousState);
      setError(err.message || 'Status update failed.');
    }
  };

  // Save / Edit Handler
  const handleSaveAnnouncement = async (
    announcementData: Omit<AnnouncementData, 'authorName' | 'authorEmail' | 'companyName' | 'createdAt' | 'updatedAt'>
  ) => {
    setIsLoading(true);
    setError(null);

    const isEdit = Boolean(announcementData.id);
    const method = isEdit ? 'PATCH' : 'POST';
    const url = isEdit
      ? `${apiBaseUrl}/admin/announcements/${announcementData.id}`
      : `${apiBaseUrl}/admin/announcements`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...announcementData,
          authorId: announcementData.authorId || currentUserId || '',
          companyId,
          publishedAt: new Date(announcementData.publishedAt).toISOString(),
          expiresAt: announcementData.expiresAt ? new Date(announcementData.expiresAt).toISOString() : null,
        }),
      });

      if (res.ok) {
        const payload = await res.json();
        const savedItem = payload?.data || payload;

        if (savedItem && savedItem.id) {
          setAnnouncements((prev) =>
            isEdit ? prev.map((a) => (a.id === savedItem.id ? savedItem : a)) : [savedItem, ...prev]
          );
        } else {
          await refreshAnnouncements();
        }

        setShowFormModal(false);
        setEditingAnnouncement(null);
      } else {
        const errorData = await res.json().catch(() => null);
        setError(errorData?.message || 'Failed to save announcement changes.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error while saving announcement.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status: AnnouncementData['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'ARCHIVED':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      default:
        return 'bg-blue-50 text-blue-700 border border-blue-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50 min-h-screen text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            School Announcements Manager 📢
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Broadcast targeted campus feeds, policy notifications, and dashboard updates.
          </p>
        </div>
        <div className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
          <span>{todayDate || 'Loading date...'}</span>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-blue-100 bg-white flex items-center">
          <div className="p-3 bg-blue-50 rounded-xl mr-4">
            <MegaphoneIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Feeds</p>
            <h2 className="text-2xl font-black text-slate-800">{activeCount}</h2>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-rose-100 bg-white flex items-center">
          <div className="p-3 bg-rose-50 rounded-xl mr-4">
            <BellAlertIcon className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Urgent Alerts</p>
            <h2 className="text-2xl font-black text-slate-800">{urgentAlertCount}</h2>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-amber-100 bg-white flex items-center">
          <div className="p-3 bg-amber-50 rounded-xl mr-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Draft Status</p>
            <h2 className="text-2xl font-black text-slate-800">{draftCount}</h2>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center">
          <div className="p-3 bg-slate-50 rounded-xl mr-4">
            <ArchiveBoxIcon className="h-6 w-6 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Archived Rows</p>
            <h2 className="text-2xl font-black text-slate-800">{archivedCount}</h2>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4 border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">📋 All Broadcast Entries</h3>
            <p className="text-xs text-slate-400">Filter notifications down or tap action triggers below.</p>
          </div>
          <button
            onClick={() => {
              setEditingAnnouncement(null);
              setShowFormModal(true);
              setError(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs font-semibold text-sm transition-colors cursor-pointer"
          >
            <PlusCircleIcon className="h-5 w-5" /> Write New Announcement
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl mb-5 flex items-center justify-between text-sm shadow-xs">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900 font-bold cursor-pointer">
              dismiss
            </button>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title, body, or sender..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="block w-full py-2 px-3 border border-slate-300 bg-white rounded-xl text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">🌍 All Audiences</option>
              {uniqueAudiences.map((aud) => (
                <option key={aud} value={aud}>
                  {AUDIENCE_LABELS[aud as keyof typeof AUDIENCE_LABELS] || aud}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-slate-300 bg-white rounded-xl text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">🔖 All Categories</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t as keyof typeof TYPE_LABELS] || t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-slate-300 bg-white rounded-xl text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">🚦 All States</option>
              {uniqueStatuses.map((st) => (
                <option key={st} value={st}>
                  {STATUS_LABELS[st as keyof typeof STATUS_LABELS] || st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Table */}
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
                          {announcement.summary && (
                            <p className="text-xs text-slate-400 font-normal mt-0.5 truncate">
                              {announcement.summary}
                            </p>
                          )}
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
                      {new Date(announcement.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-normal">
                      {announcement.expiresAt
                        ? new Date(announcement.expiresAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '♾️ Keeps showing'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 text-xs leading-5 font-bold rounded-full ${getStatusStyle(
                          announcement.status
                        )}`}
                      >
                        {STATUS_LABELS[announcement.status] || announcement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingAnnouncement(announcement);
                            setShowFormModal(true);
                            setError(null);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>

                        {announcement.status === 'PUBLISHED' && (
                          <button
                            onClick={() => updateAnnouncementStatus(announcement.id, 'ARCHIVED')}
                            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Archive announcement"
                          >
                            <ArchiveBoxIcon className="h-4 w-4" />
                          </button>
                        )}

                        {announcement.status === 'ARCHIVED' && (
                          <button
                            onClick={() => updateAnnouncementStatus(announcement.id, 'PUBLISHED')}
                            className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Publish announcement"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}

                        {announcement.status === 'PENDING' && (
                          <button
                            onClick={() => updateAnnouncementStatus(announcement.id, 'PUBLISHED')}
                            className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Approve & Publish"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setPendingDeleteId(announcement.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete announcement"
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

      {/* Confirmation Modal */}
      {pendingDeleteId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-100 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">⚠️ Remove permanently?</h3>
            <p className="text-slate-500 text-sm mb-5 leading-relaxed">
              This completely removes this announcement. Recipients will lose visibility on their mobile or web
              workspace interfaces instantly.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="px-4 py-2 text-sm font-medium border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmedDelete(pendingDeleteId)}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-sm cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal Layer */}
      {showFormModal && (
        <AnnouncementFormModal
          announcementData={editingAnnouncement}
          onClose={() => {
            setShowFormModal(false);
            setEditingAnnouncement(null);
            setError(null);
          }}
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