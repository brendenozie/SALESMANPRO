"use client";

import React, { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { 
  CalendarDaysIcon, 
  PlusIcon, 
  PencilSquareIcon, 
  CheckCircleIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  HashtagIcon,
  CalendarIcon,
  CheckBadgeIcon,
  TrashIcon,
  ArrowPathIcon,
  AcademicCapIcon
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

  // --- Academic Year Logic ---
  const handleYearSubmit = async () => {
    if (!yearForm.name || !yearForm.startDate || !yearForm.endDate) {
      return toast.error("Please fill all year fields");
    }

    startTransition(async () => {
      const isEditing = !!editingYearId;
      const res = await fetch(isEditing ? `/api/academic-years/${editingYearId}` : `/api/academic-years`, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...yearForm, companyId }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(isEditing ? "Year updated" : "Year created");
        setData(isEditing 
          ? data.map((y: any) => (y.id === editingYearId ? { ...result.data, terms: y.terms } : y))
          : [result.data, ...data]
        );
        setYearForm({ name: "", startDate: "", endDate: "" });
        setEditingYearId(null);
      }
    });
  };

  // --- Term Logic ---
  const handleTermSubmit = async (yearId: string) => {
    if (!termForm.name || !termForm.termNumber) return toast.error("Missing term details");

    startTransition(async () => {
      const isEditing = !!editingTermId;
      const res = await fetch(isEditing ? `/api/terms/${editingTermId}` : `/api/terms`, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...termForm, academicYearId: yearId, companyId }),
      });
      const result = await res.json();
      if (result.success) {
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
        toast.success("Term saved successfully");
      }
    });
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
              <p className="text-slate-500 font-medium">Manage academic sessions and terms</p>
            </div>
          </div>
          
          {/* Quick Year Toggle (Active Badge) */}
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">System Live</span>
          </div>
        </header>

        {/* Academic Year Form Card */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">
              {editingYearId ? "Modify Academic Year" : "New Academic Session"}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 ml-1">Session Name</label>
              <input
                value={yearForm.name}
                onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                placeholder="e.g. 2025/2026 Session"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 ml-1">Start Date</label>
              <input
                type="date"
                value={yearForm.startDate}
                onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 ml-1">End Date</label>
              <input
                type="date"
                value={yearForm.endDate}
                onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
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

        {/* Academic Years List */}
        <div className="space-y-6">
          {data.map((year: any) => (
            <div 
              key={year.id} 
              className={`bg-white rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${
                year.isActive ? 'border-indigo-500 shadow-2xl shadow-indigo-100/50' : 'border-transparent shadow-md'
              }`}
            >
              {/* Year Card Header */}
              <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className={`p-4 rounded-2xl ${year.isActive ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                    <CalendarIcon className={`w-8 h-8 ${year.isActive ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-black text-slate-800">{year.name}</h3>
                      {year.isActive && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 font-semibold flex items-center gap-2">
                      {new Date(year.startDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                      <span className="text-slate-300">→</span>
                      {new Date(year.endDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setEditingYearId(year.id); setYearForm({ name: year.name, startDate: year.startDate.split('T')[0], endDate: year.endDate.split('T')[0] }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <PencilSquareIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setExpandedYearId(expandedYearId === year.id ? null : year.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                      expandedYearId === year.id 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <HashtagIcon className="w-5 h-5" />
                    {year.terms?.length || 0} Terms
                    {expandedYearId === year.id ? <ChevronUpIcon className="w-4 h-4 ml-2" /> : <ChevronDownIcon className="w-4 h-4 ml-2" />}
                  </button>
                </div>
              </div>

              {/* Terms Detail Section */}
              {expandedYearId === year.id && (
                <div className="bg-slate-50/80 border-t border-slate-100 p-8 animate-in slide-in-from-top-4 duration-300">
                  <div className="max-w-4xl">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Term Management</h4>
                    
                    {/* Term Creation Form */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
                      <div className="md:col-span-2">
                        <input
                          placeholder="Term Name (e.g. Fall Semester)"
                          value={termForm.name}
                          onChange={(e) => setTermForm({...termForm, name: e.target.value})}
                          className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        />
                      </div>
                      <input
                        type="number"
                        placeholder="No."
                        value={termForm.termNumber}
                        onChange={(e) => setTermForm({...termForm, termNumber: e.target.value})}
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-center"
                      />
                      <div className="md:col-span-2 flex gap-2">
                        <button
                          onClick={() => handleTermSubmit(year.id)}
                          className="flex-1 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                        >
                          <PlusIcon className="w-5 h-5 stroke-[3]" />
                          {editingTermId ? "Update" : "Add"}
                        </button>
                        {editingTermId && (
                           <button onClick={() => setEditingTermId(null)} className="p-4 text-slate-400 hover:text-slate-600">
                             <ArrowPathIcon className="w-6 h-6" />
                           </button>
                        )}
                      </div>
                    </div>

                    {/* Terms List */}
                    <div className="grid grid-cols-1 gap-4">
                      {year.terms?.map((term: any) => (
                        <div key={term.id} className="group bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                              term.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {term.termNumber}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-lg">{term.name}</p>
                              <p className="text-sm font-medium text-slate-400 italic">Sequential Term Order</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {term.isActive ? (
                              <div className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase mr-4">
                                <CheckBadgeSolid className="w-6 h-6" />
                                Active
                              </div>
                            ) : (
                              <button className="text-sm font-bold text-slate-400 hover:text-indigo-600 px-4 py-2 hover:bg-indigo-50 rounded-xl transition-all">
                                Set Active
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setEditingTermId(term.id);
                                setTermForm({ 
                                  name: term.name, 
                                  termNumber: term.termNumber.toString(),
                                  startDate: "", // Add if your model requires
                                  endDate: "" 
                                });
                              }}
                              className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
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