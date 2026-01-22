'use client';

import React, { useState } from 'react';
import { 
  ArrowDownTrayIcon, 
  CheckBadgeIcon, 
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import GradingSidebar from './GradingSidebar';

export default function AssignmentSubmissionsManager({ assignment, initialSubmissions, companyId }: any) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);

  const openGradingSidebar = (submission: any) => {
    setSelectedSub(submission);
    setIsSidebarOpen(true);
  };

  const handleRefreshData = (updatedSub: any) => {
    setSubmissions((prev: any) => 
      prev.map((s: any) => s.id === updatedSub.id ? { ...s, ...updatedSub } : s)
    );
  };

  const filtered = submissions.filter((s: any) => {
    const matchesSearch = s.studentName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
        <p className="text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
          <p className="text-sm text-gray-500 font-medium">Total Submissions</p>
          <p className="text-2xl font-bold">{submissions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 font-medium">Pending Review</p>
          <p className="text-2xl font-bold">{submissions.filter((s:any) => !s.score).length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-gray-500 font-medium">Late Submissions</p>
          <p className="text-2xl font-bold">{submissions.filter((s:any) => s.status === 'Late').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="bg-white border px-4 py-2.5 rounded-lg outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Submitted">On Time</option>
          <option value="Late">Late</option>
        </select>
      </div>

      {/* Submission Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold">Student</th>
              <th className="px-6 py-4 text-sm font-semibold">Submission Date</th>
              <th className="px-6 py-4 text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-sm font-semibold">Grade</th>
              <th className="px-6 py-4 text-sm font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((sub: any) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{sub.studentName}</p>
                  <p className="text-xs text-gray-500">{sub.studentEmail}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(sub.submittedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  {sub.status === 'Late' ? (
                    <span className="flex items-center gap-1 text-red-600 text-xs font-bold uppercase">
                      <ExclamationCircleIcon className="h-4 w-4" /> Late
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold uppercase">
                      <CheckBadgeIcon className="h-4 w-4" /> On Time
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {sub.score !== null ? (
                    <span className="font-bold text-gray-900">{sub.score} / {assignment.totalPoints}</span>
                  ) : (
                    <span className="text-gray-400 italic">Not graded</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <a 
                      href={sub.fileUrl} 
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      title="Download File"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </a>
                    <button 
                      onClick={() => openGradingSidebar(sub)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Grade Assignment"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add the Sidebar Component at the bottom of the return */}
      <GradingSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        submission={selectedSub}
        totalPoints={assignment.totalPoints}
        onSuccess={handleRefreshData}
      />
    </div>
  );
}