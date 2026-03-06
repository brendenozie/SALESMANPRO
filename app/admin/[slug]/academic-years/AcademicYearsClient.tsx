"use client";

import React, { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { 
  CalendarDaysIcon, PlusIcon, PencilSquareIcon, CheckCircleIcon, 
  ChevronDownIcon, ChevronUpIcon, HashtagIcon, CalendarIcon, 
  ArrowPathIcon, AcademicCapIcon, TrashIcon
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeSolid } from "@heroicons/react/24/solid";

export default function AcademicYearsClient({ years, companyId }: any) {
  const [data, setData] = useState(years);
  const [isPending, startTransition] = useTransition();
  
  // Year Form State
  const [editingYearId, setEditingYearId] = useState<string | null>(null);
  const [yearForm, setYearForm] = useState({ name: "", startDate: "", endDate: "" });
  
  // Term Management State
  const [expandedYearId, setExpandedYearId] = useState<string | null>(null);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [termForm, setTermForm] = useState({ 
    name: "", 
    startDate: "", 
    endDate: "", 
    termNumber: "" 
  });

  
  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // --- DELETE LOGIC ---
  const handleDeleteYear = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }

    const res = await fetch(`/api/admin/academic-years/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) {
      startTransition(() => {
        setData(data.filter((y: any) => y.id !== id));
        setConfirmDeleteId(null);
      });
      toast.success("Academic year removed");
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

    const res = await fetch(`/api/admin/academic-terms/${termId}`, { method: "DELETE" });
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
      toast.success("Term deleted");
    } else {
      setConfirmDeleteId(null);
    }
  };
  
  // --- Academic Year Logic ---
  const handleYearSubmit = async () => {
    if (!yearForm.name || !yearForm.startDate || !yearForm.endDate) {
      return toast.error("Please fill all year fields");
    }

    const isEditing = !!editingYearId;
    const res = await fetch(isEditing ? `/api/admin/academic-years/${editingYearId}` : `/api/admin/academic-years`, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...yearForm, companyId }),
    });
    
    const result = await res.json();
    if (result.success) {
      toast.success(isEditing ? "Year updated" : "Year created");
      startTransition(() => {
        setData(isEditing 
          ? data.map((y: any) => (y.id === editingYearId ? { ...result.data, terms: y.terms } : y))
          : [{ ...result.data, terms: [] }, ...data]
        );
        setYearForm({ name: "", startDate: "", endDate: "" });
        setEditingYearId(null);
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
      toast.success("Active session updated");
    }
  };

  // --- Term Logic ---
  const handleTermSubmit = async (yearId: string) => {
    // Check all fields required by your Prisma Term model
    if (!termForm.name || !termForm.termNumber || !termForm.startDate || !termForm.endDate) {
      return toast.error("Please fill all term fields including dates");
    }

    const isEditing = !!editingTermId;
    const res = await fetch(isEditing ? `/api/admin/academic-terms/${editingTermId}` : `/api/admin/academic-terms`, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...termForm, 
        termNumber: parseInt(termForm.termNumber), 
        academicYearId: yearId, 
        companyId 
      }),
    });
    
    const result = await res.json();
    if (result.success) {
      startTransition(() => {
        setData(data.map((year: any) => {
          if (year.id === yearId) {
            const updatedTerms = isEditing 
              ? year.terms.map((t: any) => t.id === editingTermId ? result.data : t)
              : [...(year.terms || []), result.data];
            return { ...year, terms: updatedTerms.sort((a: any, b: any) => a.termNumber - b.termNumber) };
          }
          return year;
        }));
        setTermForm({ name: "", startDate: "", endDate: "", termNumber: "" });
        setEditingTermId(null);
      });
      toast.success("Term saved successfully");
    }
  };

  const toggleTermActive = async (yearId: string, termId: string) => {
    const res = await fetch(`/api/admin/academic-terms/${termId}/activate`, {
      method: "PUT",
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
      toast.success("Term activated");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">School Calendar</h1>
              <p className="text-slate-500 font-medium tracking-tight">Manage academic sessions and sequential terms</p>
            </div>
          </div>
        </header>

        {/* Year Form */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">
              {editingYearId ? "Modify Academic Year" : "New Academic Session"}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Session Name</label>
              <input
                value={yearForm.name}
                onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                placeholder="e.g. 2025/2026 Session"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
              <input
                type="date"
                value={yearForm.startDate}
                onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">End Date</label>
              <input
                type="date"
                value={yearForm.endDate}
                onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleYearSubmit}
              disabled={isPending}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PlusIcon className="w-5 h-5 stroke-[3]" />}
              {editingYearId ? "Save Changes" : "Create Academic Year"}
            </button>
            {editingYearId && (
              <button onClick={() => { setEditingYearId(null); setYearForm({name:"", startDate:"", endDate:""}); }} className="text-slate-400 hover:text-slate-600 font-bold px-4">
                Cancel
              </button>
            )}
          </div>
        </section>

        {/* List */}
        <div className="space-y-6">
          {data && data.length > 0 && data.map((year: any) => (
            <div 
              key={year.id} 
              className={`bg-white rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${
                year.isActive ? 'border-indigo-500 shadow-2xl shadow-indigo-100/50' : 'border-transparent shadow-md hover:shadow-lg'
              }`}
            >
              <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`p-5 rounded-[1.5rem] ${year.isActive ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-100'}`}>
                    <CalendarIcon className={`w-8 h-8 ${year.isActive ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-black text-slate-800">{year.name}</h3>
                      {year.isActive && (
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm shadow-emerald-200">
                          Active Now
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 font-bold flex items-center gap-2 italic">
                      {new Date(year.startDate).toDateString()} — {new Date(year.endDate).toDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Delete Year Button */}
                  <button
                    onClick={() => handleDeleteYear(year.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                      confirmDeleteId === year.id 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    {confirmDeleteId === year.id ? 'Confirm?' : <TrashIcon className="w-6 h-6" />}
                  </button>

                  {!year.isActive && (
                    <button 
                      onClick={() => toggleYearActive(year.id)}
                      className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                      title="Set as Active Session"
                    >
                      <CheckCircleIcon className="w-7 h-7" />
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingYearId(year.id); setYearForm({ name: year.name, startDate: year.startDate.split('T')[0], endDate: year.endDate.split('T')[0] }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <PencilSquareIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setExpandedYearId(expandedYearId === year.id ? null : year.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm ${
                      expandedYearId === year.id ? 'bg-slate-900 text-white shadow-slate-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <HashtagIcon className="w-5 h-5" />
                    {year.terms?.length || 0} Terms
                    {expandedYearId === year.id ? <ChevronUpIcon className="w-4 h-4 ml-1" /> : <ChevronDownIcon className="w-4 h-4 ml-1" />}
                  </button>
                </div>
              </div>

              {/* Term Management Detail */}
              {expandedYearId === year.id && (
                <div className="bg-slate-50/50 border-t border-slate-100 p-8 animate-in slide-in-from-top-4 duration-300">
                  <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      
                      {/* Left: Term Form */}
                      <div className="lg:col-span-1 space-y-4">
                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Add / Edit Term</h4>
                        <input
                          placeholder="Term Name"
                          value={termForm.name}
                          onChange={(e) => setTermForm({...termForm, name: e.target.value})}
                          className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Order No."
                            value={termForm.termNumber}
                            onChange={(e) => setTermForm({...termForm, termNumber: e.target.value})}
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                          />
                          <button
                            onClick={() => handleTermSubmit(year.id)}
                            className="bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
                          >
                            {editingTermId ? "Update" : "Save"}
                          </button>
                        </div>
                        <input
                          type="date"
                          value={termForm.startDate}
                          onChange={(e) => setTermForm({...termForm, startDate: e.target.value})}
                          className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                        />
                        <input
                          type="date"
                          value={termForm.endDate}
                          onChange={(e) => setTermForm({...termForm, endDate: e.target.value})}
                          className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                        />
                        {editingTermId && (
                           <button onClick={() => { setEditingTermId(null); setTermForm({name:"", termNumber:"", startDate:"", endDate:""}); }} className="w-full text-slate-400 font-bold text-xs uppercase">Cancel Edit</button>
                        )}
                      </div>

                      {/* Right: Terms List */}
                      <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {year.terms?.map((term: any) => (
                            <div key={term.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between hover:border-indigo-200 transition-all shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${term.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                  {term.termNumber}
                                </div>
                                <div>
                                  <p className="font-black text-slate-800">{term.name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                    {new Date(term.startDate).toLocaleDateString()} — {new Date(term.endDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!term.isActive && (
                                  <button onClick={() => toggleTermActive(year.id, term.id)} className="p-2 text-slate-300 hover:text-emerald-500 transition-colors">
                                    <CheckCircleIcon className="w-6 h-6" />
                                  </button>
                                )}
                                {term.isActive && <CheckBadgeSolid className="w-6 h-6 text-emerald-500 mr-2" />}
                                {/* Delete Term Button */}
                                <button 
                                  onClick={() => handleDeleteTerm(year.id, term.id)}
                                  className={`p-2 transition-all rounded-lg ${
                                    confirmDeleteId === term.id ? 'bg-red-500 text-white' : 'text-slate-300 hover:text-red-500'
                                  }`}
                                >
                                  {confirmDeleteId === term.id ? <CheckCircleIcon className="w-5 h-5" /> : <TrashIcon className="w-5 h-5" />}
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingTermId(term.id);
                                    setTermForm({ 
                                      name: term.name, 
                                      termNumber: term.termNumber.toString(),
                                      startDate: term.startDate.split('T')[0],
                                      endDate: term.endDate.split('T')[0]
                                    });
                                  }}
                                  className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                >
                                  <PencilSquareIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}