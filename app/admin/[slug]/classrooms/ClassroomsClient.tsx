"use client";

import React, { useState, useMemo, useCallback } from 'react';
import {
  HomeModernIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  XMarkIcon,
  SparklesIcon,
  Squares2X2Icon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export type ClassroomType = {
  id: string;
  name: string;
  capacity?: number;
  academicLevelId: string;
  academicLevel?: {
    id: string;
    name: string;
  };
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
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<ClassroomType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Field Local State
  const [formName, setFormName] = useState('');
  const [formCapacity, setFormCapacity] = useState('');
  const [formLevelId, setFormLevelId] = useState('');

  const fetchClassrooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/classrooms?companyId=${companyId}`);
      if (res.ok) {
        const json = await res.json();
        setClassrooms(json.data || json);
      }
    } catch (err) {
      setError("Failed to refresh classrooms collection.");
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, companyId]);

  // Combined Search and Level filter mapping logic
  const filteredClassrooms = useMemo(() => {
    return classrooms.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      // Explicit string comparison matching target academicLevelId
      const matchesLevel = selectedLevelFilter === 'ALL' || c.academicLevelId === selectedLevelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [classrooms, searchTerm, selectedLevelFilter]);

  // Context-aware form initialization
  const openFormModal = (classroom: ClassroomType | null = null) => {
    setError(null);
    if (classroom) {
      setEditingClassroom(classroom);
      setFormName(classroom.name);
      setFormCapacity(classroom.capacity?.toString() || '');
      setFormLevelId(classroom.academicLevelId);
    } else {
      setEditingClassroom(null);
      setFormName('');
      setFormCapacity('');
      // Smart Auto-align: Match current tab filter if it's a specific level, otherwise fallback to first index
      if (selectedLevelFilter !== 'ALL') {
        setFormLevelId(selectedLevelFilter);
      } else {
        setFormLevelId(academicLevels[0]?.id || '');
      }
    }
    setShowFormModal(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formLevelId) {
      setError("Please input workspace room tag signature and assign an academic level.");
      return;
    }

    setIsLoading(true);
    const payload = {
      ...(editingClassroom?.id && { id: editingClassroom.id }),
      name: formName,
      capacity: formCapacity ? parseInt(formCapacity, 10) : undefined,
      academicLevelId: formLevelId,
      companyId
    };

    const method = editingClassroom?.id ? 'PATCH' : 'POST';
    const url = editingClassroom?.id ? `${apiBaseUrl}/admin/classrooms/${editingClassroom.id}` : `${apiBaseUrl}/admin/classrooms`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchClassrooms();
        setShowFormModal(false);
      } else {
        const errData = await res.json();
        setError(errData.message || "Ecosystem execution synchronization error.");
      }
    } catch (err) {
      setError("Network interaction failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm complete decommissioning of selected room module?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/classrooms/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchClassrooms();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1329] p-4 sm:p-6 md:p-10 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Visual Premium Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 p-6 sm:p-8 rounded-[2rem] shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-500/10">
              <HomeModernIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-white">Workspace Units</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Organize physical assets, classroom capacity allocations, and division streams</p>
            </div>
          </div>
          <button
            onClick={() => openFormModal(null)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] w-full md:w-auto text-sm shrink-0"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" />
            Provision New Room
          </button>
        </header>

        {/* Console Filters & Level Tab Grouping Controls */}
        <section className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white dark:bg-slate-800/20 p-4 border border-slate-200/50 dark:border-slate-800 rounded-2xl">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Lookup explicit identifier..." 
                className="pl-12 w-full py-3.5 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-800 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Level Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedLevelFilter('ALL')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedLevelFilter === 'ALL'
                    ? 'bg-slate-900 dark:bg-slate-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                All Metrics
              </button>
              {academicLevels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevelFilter(lvl.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedLevelFilter === lvl.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {lvl.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Display Layout */}
        <main>
          {filteredClassrooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClassrooms.map((cls) => (
                <div 
                  key={cls.id}
                  className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* Top Row Meta Tags */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                        {cls.academicLevel?.name || 'Unassigned Tier'}
                      </span>
                      <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <UserGroupIcon className="h-4 w-4" />
                        <span className="text-xs font-black">{cls.capacity || 'Max Capacity'}</span>
                      </div>
                    </div>

                    {/* Room Body Signature */}
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Unit Module Reference: <span className="font-mono">{cls.id.slice(0, 8)}</span>
                    </p>
                  </div>

                  {/* Operational Management Row */}
                  <div className="flex items-center justify-end gap-1.5 border-t border-slate-50 dark:border-slate-700/40 pt-4 mt-6">
                    <button 
                      onClick={() => openFormModal(cls)}
                      className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"
                      title="Edit Architecture"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cls.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                      title="Decommission Module"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] shadow-sm">
              <Squares2X2Icon className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Classrooms Resolved</h3>
              <p className="text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-1 text-sm">Modify search strings or change parameters to update your tracking configuration.</p>
            </div>
          )}
        </main>

        {/* --- DYNAMIC PROVISIONING MODAL DIALOG --- */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-2xl overflow-hidden">
              
              {/* Header Interface */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex items-center gap-2.5">
                  <SparklesIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-black text-slate-800 dark:text-white">
                    {editingClassroom ? "Update Room Asset" : "Allocate New Unit"}
                  </h2>
                </div>
                <button 
                  onClick={() => setShowFormModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Functional Payload Form */}
              <form onSubmit={handleSaveSubmit}>
                <div className="p-6 space-y-4">
                  {error && (
                    <div className="p-3.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold border border-red-100 dark:border-red-500/20">
                      {error}
                    </div>
                  )}

                  {/* Input Room Title */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Room Assignment Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stream Alpha / Laboratory Block A"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Form Dropdown Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Academic Category Stream</label>
                    <div className="relative">
                      <select
                        value={formLevelId}
                        onChange={(e) => setFormLevelId(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm text-slate-800 dark:text-white appearance-none"
                      >
                        {academicLevels.map((lvl) => (
                          <option key={lvl.id} value={lvl.id} className="text-slate-900 dark:text-slate-900">
                            {lvl.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Parameter */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Target Capacity Bound (Optional)</label>
                    <input
                      type="number"
                      placeholder="Leave blank for unlimited capacity"
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Foot Action Controls */}
                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowFormModal(false)} 
                    className="px-5 py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-95 disabled:opacity-50 text-sm"
                  >
                    {isLoading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                    Save Structure Configurations
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}