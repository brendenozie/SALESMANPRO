'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  PuzzlePieceIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { clientFetchJson } from '@/lib/api/clientFetch';

export interface ActivityTypeItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  ageMin?: number | null;
  ageMax?: number | null;
  _count?: { activities: number };
}

export interface ActivityItem {
  id: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  activityTypeId: string;
  activityType?: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    color?: string | null;
  };
  durationMin?: number | null;
  points?: number | null;
  isPublished: boolean;
  ageGroup?: string | null;
  tags: string[];
  createdAt: string;
  _count?: {
    assignments?: number;
  };
}

interface AdminActivitiesClientProps {
  initialActivities: ActivityItem[];
  activityTypes: ActivityTypeItem[];
  companyId: string;
  schoolSlug: string;
  initialTypeFilter?: string;
}

export default function AdminActivitiesClient({
  initialActivities,
  activityTypes,
  companyId,
  schoolSlug,
  initialTypeFilter = 'ALL',
}: AdminActivitiesClientProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [types, setTypes] = useState<ActivityTypeItem[]>(activityTypes);
  const [selectedType, setSelectedType] = useState<string>(initialTypeFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formTypeId, setFormTypeId] = useState('');
  const [formDuration, setFormDuration] = useState('15');
  const [formPoints, setFormPoints] = useState('10');
  const [formAgeGroup, setFormAgeGroup] = useState('EARLY_YEARS');
  const [formIsPublished, setFormIsPublished] = useState(true);

  const refreshActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const typeParam = selectedType && selectedType !== 'ALL' ? `&type=${encodeURIComponent(selectedType)}` : '';
      const res = await clientFetchJson<any>(
        `/api/admin/activities?companyId=${encodeURIComponent(companyId)}${typeParam}`
      );
      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          setActivities(res.data);
        } else if (Array.isArray(res.data.activities)) {
          setActivities(res.data.activities);
        }
      } else {
        setError(res.message || 'Failed to refresh activities');
      }
    } catch (err: any) {
      setError(err.message || 'Error refreshing activities');
    } finally {
      setIsLoading(false);
    }
  }, [companyId, selectedType]);

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.activityType?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === 'ALL' ||
        a.activityTypeId === selectedType ||
        a.activityType?.slug === selectedType;

      return matchesSearch && matchesType;
    });
  }, [activities, searchTerm, selectedType]);

  const openCreateModal = () => {
    setEditingActivity(null);
    setFormTitle('');
    setFormDescription('');
    setFormInstructions('');
    setFormTypeId(types[0]?.id || '');
    setFormDuration('15');
    setFormPoints('10');
    setFormAgeGroup('EARLY_YEARS');
    setFormIsPublished(true);
    setShowModal(true);
  };

  const openEditModal = (activity: ActivityItem) => {
    setEditingActivity(activity);
    setFormTitle(activity.title);
    setFormDescription(activity.description || '');
    setFormInstructions(activity.instructions || '');
    setFormTypeId(activity.activityTypeId);
    setFormDuration(activity.durationMin?.toString() || '15');
    setFormPoints(activity.points?.toString() || '10');
    setFormAgeGroup(activity.ageGroup || 'EARLY_YEARS');
    setFormIsPublished(activity.isPublished);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formTypeId) {
      setError('Title and Activity Type are required.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        instructions: formInstructions.trim() || null,
        activityTypeId: formTypeId,
        durationMin: parseInt(formDuration, 10) || 15,
        points: parseInt(formPoints, 10) || 10,
        ageGroup: formAgeGroup,
        isPublished: formIsPublished,
        companyId,
      };

      const url = editingActivity
        ? `/api/admin/activities/${editingActivity.id}`
        : '/api/admin/activities';

      const method = editingActivity ? 'PATCH' : 'POST';

      const res = await clientFetchJson(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setShowModal(false);
        await refreshActivities();
      } else {
        setError(res.message || 'Failed to save activity');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving activity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity? All student attempts will be removed.')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await clientFetchJson(`/api/admin/activities/${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        await refreshActivities();
      } else {
        setError(res.message || 'Failed to delete activity');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting activity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (activity: ActivityItem) => {
    try {
      const res = await clientFetchJson(`/api/admin/activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !activity.isPublished }),
      });
      if (res.success) {
        await refreshActivities();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle publish status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <PuzzlePieceIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Activities & Early Learning Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Curate, assign, and track engaging interactive play and learning modules for students
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href={`/admin/${schoolSlug}/play/drawing`}
            target="_blank"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium transition"
          >
            <PlayIcon className="h-4 w-4 text-emerald-600" />
            Pupil Play Mode
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 opacity-60" />
          </Link>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <PlusIcon className="h-4 w-4 stroke-[3]" />
            New Activity
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      {/* Type Pill Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            selectedType === 'ALL'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Types ({activities.length})
        </button>
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.slug || t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedType === t.slug || selectedType === t.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>{t.icon || '🎯'}</span>
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search activities by title, description, or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-white focus:outline-none"
        />
      </div>

      {/* Activity Grid */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <PuzzlePieceIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No activities found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchTerm ? 'Try adjusting your search filter.' : 'Click "New Activity" above to create your first activity.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredActivities.map((act) => (
            <div
              key={act.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <span>{act.activityType?.icon || '🎯'}</span>
                    <span>{act.activityType?.name || 'General Activity'}</span>
                  </span>
                  <button
                    onClick={() => handleTogglePublish(act)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition ${
                      act.isPublished
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}
                  >
                    {act.isPublished ? (
                      <>
                        <CheckCircleIcon className="h-3.5 w-3.5" /> Published
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-3.5 w-3.5" /> Draft
                      </>
                    )}
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{act.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {act.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span>⏱ {act.durationMin || 15} mins</span>
                  <span>⭐ {act.points || 10} pts</span>
                  <span>👶 {act.ageGroup?.replace('_', ' ') || 'All Ages'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openEditModal(act)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition"
                  title="Edit Activity"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(act.id)}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                  title="Delete Activity"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingActivity ? 'Edit Activity' : 'Create New Activity'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Colorful Safari Animals"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Activity Type *
                </label>
                <select
                  value={formTypeId}
                  onChange={(e) => setFormTypeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon || '🎯'} {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief summary of what pupils will do..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formPoints}
                    onChange={(e) => setFormPoints(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Age Group
                </label>
                <select
                  value={formAgeGroup}
                  onChange={(e) => setFormAgeGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                >
                  <option value="PLAYGROUP">Playgroup (Age 2-3)</option>
                  <option value="EARLY_YEARS">Early Years / Pre-K (Age 3-5)</option>
                  <option value="PRIMARY">Primary Grade 1-3 (Age 6-8)</option>
                  <option value="ALL_AGES">All Ages</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="formIsPublished"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                <label htmlFor="formIsPublished" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Publish immediately (accessible to pupils)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingActivity ? 'Save Changes' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
