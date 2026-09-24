"use client";

import React, { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { 
  CalendarDaysIcon, PlusIcon, PencilSquareIcon, CheckCircleIcon, 
  ChevronDownIcon, ChevronUpIcon, HashtagIcon, CalendarIcon, 
  ArrowPathIcon, AcademicCapIcon, TrashIcon, XMarkIcon, FunnelIcon
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeSolid } from "@heroicons/react/24/solid";

interface AcademicYearsClientProps {
  years: any[];
  companyId: string;
}

export default function AcademicYearsClient({ years, companyId }: AcademicYearsClientProps) {
  const [data, setData] = useState(years);
  const [isPending, startTransition] = useTransition();
  
  // Modals & Forms State
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [activeYearIdForTerm, setActiveYearIdForTerm] = useState<string | null>(null);

  const [editingYearId, setEditingYearId] = useState<string | null>(null);
  const [yearForm, setYearForm] = useState({ name: "", startDate: "", endDate: "" });
  
  const [expandedYearId, setExpandedYearId] = useState<string | null>(null);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [termForm, setTermForm] = useState({ 
    name: "", 
    startDate: "", 
    endDate: "", 
    termNumber: "" 
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // --- DELETE LOGIC ---
  const handleDeleteYear = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }

    const res = await fetch(`/api/admin/academic-years/${id}?companyId=${encodeURIComponent(companyId)}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) {
      startTransition(() => {
        setData(data.filter((y: any) => y.id !== id));
        setConfirmDeleteId(null);
      });
      toast.success("Academic year removed successfully");
    } else {
      toast.error(result.message || "Could not delete year");
      setConfirmDeleteId(null);
    }
  };

  const handleDeleteTerm = async (yearId: string, termId: string) => {
    if (confirmDeleteId !== termId) {
      setConfirmDeleteId(termId);
      return;
    }

    const res = await fetch(`/api/admin/academic-terms/${termId}?companyId=${encodeURIComponent(companyId)}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) {
      startTransition(() => {
        setData(data.map((year: any) => {
          if (year.id === yearId) {
            return { ...year, terms: year.terms.filter((t: any) => t.id !== termId) };
          }
          return year;
        }));
        setConfirmDeleteId(null);
      });
      toast.success("Term deleted successfully");
    } else {
      toast.error(result.message || "Could not delete term");
      setConfirmDeleteId(null);
    }
  };
  
  // --- YEAR ACTIONS ---
  const openNewYearModal = () => {
    setEditingYearId(null);
    setYearForm({ name: "", startDate: "", endDate: "" });
    setIsYearModalOpen(true);
  };

  const openEditYearModal = (year: any) => {
    setEditingYearId(year.id);
    setYearForm({ 
      name: year.name, 
      startDate: year.startDate.split('T')[0], 
      endDate: year.endDate.split('T')[0] 
    });
    setIsYearModalOpen(true);
  };

  const handleYearSubmit = async () => {
    if (!yearForm.name || !yearForm.startDate || !yearForm.endDate) {
      return toast.error("Please fill all session fields");
    }

    const isEditing = !!editingYearId;
    const res = await fetch(isEditing ? `/api/admin/academic-years/${editingYearId}` : `/api/admin/academic-years`, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...yearForm, companyId }),
    });
    
    const result = await res.json();
    if (result.success) {
      toast.success(isEditing ? "Academic year updated" : "Academic year created");
      startTransition(() => {
        setData(isEditing 
          ? data.map((y: any) => (y.id === editingYearId ? { ...result.data, terms: y.terms } : y))
          : [{ ...result.data, terms: [] }, ...data]
        );
        setIsYearModalOpen(false);
      });
    }
  };

  const toggleYearActive = async (yearId: string) => {
    const res = await fetch(`/api/admin/academic-years/${yearId}/activate`, {
      method: "PATCH",
      body: JSON.stringify({ companyId })
    });
    const result = await res.json();
    if (result.success) {
      startTransition(() => {
        setData(data.map((y: any) => ({ ...y, isActive: y.id === yearId })));
      });
      toast.success("Active session shifted successfully");
    }
  };

  // --- TERM ACTIONS ---
  const openNewTermModal = (yearId: string) => {
    setActiveYearIdForTerm(yearId);
    setEditingTermId(null);
    setTermForm({ name: "", startDate: "", endDate: "", termNumber: "" });
    setIsTermModalOpen(true);
  };

  const openEditTermModal = (yearId: string, term: any) => {
    setActiveYearIdForTerm(yearId);
    setEditingTermId(term.id);
    setTermForm({ 
      name: term.name, 
      termNumber: term.termNumber.toString(),
      startDate: term.startDate.split('T')[0],
      endDate: term.endDate.split('T')[0]
    });
    setIsTermModalOpen(true);
  };

  const handleTermSubmit = async () => {
    if (!termForm.name || !termForm.termNumber || !termForm.startDate || !termForm.endDate) {
      return toast.error("Please provide all term parameters");
    }

    const isEditing = !!editingTermId;
    const res = await fetch(isEditing ? `/api/admin/academic-terms/${editingTermId}` : `/api/admin/academic-terms`, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...termForm, 
        termNumber: parseInt(termForm.termNumber), 
        academicYearId: activeYearIdForTerm, 
        companyId 
      }),
    });
    
    const result = await res.json();
    if (result.success) {
      startTransition(() => {
        setData(data.map((year: any) => {
          if (year.id === activeYearIdForTerm) {
            const updatedTerms = isEditing 
              ? year.terms.map((t: any) => t.id === editingTermId ? result.data : t)
              : [...(year.terms || []), result.data];
            return { ...year, terms: updatedTerms.sort((a: any, b: any) => a.termNumber - b.termNumber) };
          }
          return year;
        }));
        setIsTermModalOpen(false);
      });
      toast.success("Term structure saved setup");
    }
  };

  const toggleTermActive = async (yearId: string, termId: string) => {
    const res = await fetch(`/api/admin/academic-terms/${termId}/activate`, {
      method: "PATCH",
      body: JSON.stringify({ companyId, academicYearId: yearId })
    });

    const result = await res.json();
    if (result.success) {
      startTransition(() => {
        setData(data.map((year: any) => {
          if (year.id === yearId) {
            return {
              ...year,
              terms: year.terms.map((t: any) => ({ ...t, isActive: t.id === termId }))
            };
          }
          return year;
        }));
      });
      toast.success("Term operationalized");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1329] p-4 sm:p-6 md:p-10 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Dynamic Header */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 p-6 rounded-3xl shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-3.5 rounded-2xl shadow-xl shadow-indigo-500/20">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-white">Academic Sessions</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Configure school years and sequence timeline milestones</p>
            </div>
          </div>
          <button
            onClick={openNewYearModal}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] w-full sm:w-auto text-sm"
          >
            <PlusIcon className="w-5 h-5 stroke-[3]" />
            New Academic Year
          </button>
        </header>

        {/* Sessions Matrix Grid */}
        <div className="space-y-6">
          {data && data.length > 0 ? (
            data.map((year: any) => (
              <div 
                key={year.id} 
                className={`bg-white dark:bg-slate-800/70 border rounded-[2rem] transition-all duration-300 overflow-hidden ${
                  year.isActive 
                    ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-xl' 
                    : 'border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Main Configuration Card Header */}
                <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className={`p-4 rounded-2xl hidden sm:block ${year.isActive ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <CalendarIcon className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{year.name}</h3>
                        {year.isActive && (
                          <span className="bg-emerald-500 dark:bg-emerald-500/10 text-white dark:text-emerald-400 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            Active Session
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 dark:text-slate-400 font-semibold text-sm flex items-center gap-2 flex-wrap">
                        <span>{new Date(year.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                        <span>{new Date(year.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-700/40 pt-4 lg:pt-0 lg:border-t-0 justify-end">
                    {!year.isActive && (
                      <button 
                        onClick={() => toggleYearActive(year.id)}
                        className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
                        title="Set as Active Session"
                      >
                        <CheckCircleIcon className="w-6 h-6" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditYearModal(year)}
                      className="p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
                      title="Edit Session Details"
                    >
                      <PencilSquareIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleDeleteYear(year.id)}
                      className={`flex items-center justify-center p-3 rounded-xl font-bold transition-all ${
                        confirmDeleteId === year.id 
                        ? 'bg-red-500 text-white animate-pulse px-4' 
                        : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                      }`}
                      title="Remove Session"
                    >
                      {confirmDeleteId === year.id ? <span className="text-xs uppercase">Confirm?</span> : <TrashIcon className="w-6 h-6" />}
                    </button>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

                    <button
                      onClick={() => setExpandedYearId(expandedYearId === year.id ? null : year.id)}
                      className={`flex items-center justify-between gap-3 px-5 py-3 rounded-xl font-bold transition-all text-sm w-full sm:w-auto ${
                        expandedYearId === year.id 
                          ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <HashtagIcon className="w-4 h-4" />
                        {year.terms?.length || 0} Terms Included
                      </span>
                      {expandedYearId === year.id ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms Sub-Console Accordion */}
                {expandedYearId === year.id && (
                  <div className="bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in-50 duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h4 className="text-sm font-black dark:text-slate-200 uppercase tracking-wider">Operational Terms Sequence</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Timeline segments structured within this specific workspace environment</p>
                      </div>
                      <button
                        onClick={() => openNewTermModal(year.id)}
                        className="flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 px-4 py-2.5 rounded-xl font-bold text-xs text-indigo-600 dark:text-indigo-400 shadow-sm transition-all active:scale-95"
                      >
                        <PlusIcon className="w-4 h-4 stroke-[3]" />
                        Append Term
                      </button>
                    </div>

                    {year.terms && year.terms.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {year.terms.map((term: any) => (
                          <div 
                            key={term.id} 
                            className={`bg-white dark:bg-slate-800/90 border p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.01] transition-all shadow-sm group ${
                              term.isActive ? 'border-emerald-500/40 dark:border-emerald-500/30 ring-1 ring-emerald-500/20' : 'border-slate-100 dark:border-slate-700/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${term.isActive ? 'bg-emerald-500 dark:bg-emerald-500/10 text-white dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                  {term.termNumber}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{term.name}</p>
                                  <p className="text-[11px] text-slate-400 font-medium uppercase mt-0.5 tracking-wider">
                                    {new Date(term.startDate).toLocaleDateString(undefined, {dateStyle: 'short'})} – {new Date(term.endDate).toLocaleDateString(undefined, {dateStyle: 'short'})}
                                  </p>
                                </div>
                              </div>
                              {term.isActive && <CheckBadgeSolid className="w-5 h-5 text-emerald-500 shrink-0" />}
                            </div>

                            <div className="flex items-center justify-end gap-1 border-t border-slate-50 dark:border-slate-700/30 pt-3 mt-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              {!term.isActive && (
                                <button onClick={() => toggleTermActive(year.id, term.id)} className="p-2 text-slate-400 hover:text-emerald-500 rounded-lg dark:hover:bg-emerald-500/10 transition-colors" title="Activate Term">
                                  <CheckCircleIcon className="w-5 h-5" />
                                </button>
                              )}
                              <button onClick={() => openEditTermModal(year.id, term)} className="p-2 text-slate-400 hover:text-indigo-500 rounded-lg dark:hover:bg-indigo-500/10 transition-colors" title="Edit Term">
                                <PencilSquareIcon className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteTerm(year.id, term.id)}
                                className={`p-2 rounded-lg transition-all ${confirmDeleteId === term.id ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-red-500 dark:hover:bg-red-500/10'}`}
                                title="Delete Term"
                              >
                                {confirmDeleteId === term.id ? <CheckCircleIcon className="w-5 h-5 animate-pulse" /> : <TrashIcon className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-transparent">
                        <FunnelIcon className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                        <p className="text-sm text-slate-400 font-medium">No operational term structures tracked for this workspace session.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] shadow-sm">
              <CalendarDaysIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No Calendars Available</h3>
              <p className="text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-1 text-sm">Deploy dynamic configurations by assigning your school ecosystem's primary milestone dates.</p>
            </div>
          )}
        </div>

        {/* --- MODAL 1: ACADEMIC YEAR FORM --- */}
        {isYearModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-2xl overflow-hidden transform transition-all scale-100">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex items-center gap-2.5">
                  <CalendarDaysIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-black text-slate-800 dark:text-white">
                    {editingYearId ? "Modify Configuration" : "New Academic Session"}
                  </h2>
                </div>
                <button onClick={() => setIsYearModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Session Target Identity</label>
                  <input
                    value={yearForm.name}
                    onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                    placeholder="e.g. 2026/2027 Session Architecture"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm text-slate-800 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Inception Start Date</label>
                    <input
                      type="date"
                      value={yearForm.startDate}
                      onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Termination End Date</label>
                    <input
                      type="date"
                      value={yearForm.endDate}
                      onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-end gap-3">
                <button onClick={() => setIsYearModalOpen(false)} className="px-5 py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm">Cancel</button>
                <button
                  onClick={handleYearSubmit}
                  disabled={isPending}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-95 disabled:opacity-50 text-sm"
                >
                  {isPending ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                  Save Workspace Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL 2: TERM SETUP FORM --- */}
        {isTermModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-2xl overflow-hidden transform transition-all scale-100">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex items-center gap-2.5">
                  <HashtagIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-black text-slate-800 dark:text-white">
                    {editingTermId ? "Alter Academic Term" : "Append Term Object"}
                  </h2>
                </div>
                <button onClick={() => setIsTermModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Term Signature</label>
                    <input
                      placeholder="e.g. Fall Semester / Term 1"
                      value={termForm.name}
                      onChange={(e) => setTermForm({...termForm, name: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="col-span-1 space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Sequence</label>
                    <input
                      type="number"
                      placeholder="e.g. 1"
                      value={termForm.termNumber}
                      onChange={(e) => setTermForm({...termForm, termNumber: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm text-center text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Term Start Date</label>
                    <input
                      type="date"
                      value={termForm.startDate}
                      onChange={(e) => setTermForm({...termForm, startDate: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Term End Date</label>
                    <input
                      type="date"
                      value={termForm.endDate}
                      onChange={(e) => setTermForm({...termForm, endDate: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-end gap-3">
                <button onClick={() => setIsTermModalOpen(false)} className="px-5 py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm">Cancel</button>
                <button
                  onClick={handleTermSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-95 text-sm"
                >
                  Confirm Segment Layout
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}