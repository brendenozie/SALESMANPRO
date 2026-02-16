'use client';
import React, { useState } from 'react';
import { FunnelIcon, MagnifyingGlassIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function AssignmentsClientPage({ initialAssignments }: any) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = initialAssignments.filter((a: any) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.childName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === 'all' || a.status === filter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'overdue': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by subject or child..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {['all', 'pending', 'overdue', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
                filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid gap-4">
        {filtered.map((assignment: any) => (
          <div 
            key={assignment.id} 
            className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${assignment.status === 'overdue' ? 'bg-rose-100' : 'bg-indigo-50'}`}>
                <CalendarIcon className={`h-6 w-6 ${assignment.status === 'overdue' ? 'text-rose-600' : 'text-indigo-600'}`} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">{assignment.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">{assignment.subject}</span>
                  <span className="text-slate-300">•</span>
                  <p className="text-sm text-slate-500 font-medium">{assignment.childName}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
              <div className="text-left md:text-right">
                <p className="text-xs text-slate-400 font-medium">Due Date</p>
                <p className="text-sm font-bold text-slate-700">
                  {new Date(assignment.dueDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              
              <div className={`px-4 py-1.5 rounded-full border text-xs font-bold capitalize ${getStatusStyle(assignment.status)}`}>
                {assignment.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}