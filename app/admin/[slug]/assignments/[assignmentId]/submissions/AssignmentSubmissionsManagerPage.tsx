'use client';

import React, { useState, useMemo } from 'react';
import { 
  ArrowDownTrayIcon, 
  CheckBadgeIcon, 
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  InboxIcon
} from '@heroicons/react/24/outline';
import GradingSidebar from './GradingSidebar';

export default function AssignmentSubmissionsManager({ assignment, initialSubmissions }: any) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);

  // Stats calculation
  const stats = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter((s: any) => s.score === null).length,
    late: submissions.filter((s: any) => s.status === 'Late').length
  }), [submissions]);

  const openGradingSidebar = (submission: any) => {
    setSelectedSub(submission);
    setIsSidebarOpen(true);
  };

  const handleRefreshData = (updatedSub: any) => {
    setSubmissions((prev: any) => 
      prev.map((s: any) => s.id === updatedSub.id ? { ...s, ...updatedSub } : s)
    );
  };

  const filteredSubmissions = submissions.filter((s: any) => {
    const matchesSearch = 
      s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentEmail?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'All') return matchesSearch;
    if (filter === 'Graded') return matchesSearch && s.score !== null;
    if (filter === 'Pending') return matchesSearch && s.score === null;
    return matchesSearch && s.status === filter;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{assignment.title}</h1>
          <p className="text-gray-500 mt-1">
            Deadline: <span className="font-medium text-gray-700">{new Date(assignment.dueDate).toLocaleString()}</span>
          </p>
        </div>
        <div className="bg-indigo-100 px-4 py-2 rounded-lg border border-indigo-200">
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Max Score</p>
          <p className="text-xl font-black text-indigo-900">{assignment.totalPoints} pts</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Submissions" value={stats.total} color="indigo" />
        <StatCard title="Pending Review" value={stats.pending} color="yellow" />
        <StatCard title="Late Submissions" value={stats.late} color="red" />
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Submissions</option>
          <option value="Pending">Pending Grade</option>
          <option value="Graded">Already Graded</option>
          <option value="Late">Late Only</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredSubmissions.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubmissions.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{sub.studentName}</span>
                      <span className="text-xs text-gray-400">{sub.studentEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                    <span className="block text-[10px] text-gray-400">
                      {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={sub.status} isGraded={sub.score !== null} />
                  </td>
                  <td className="px-6 py-4">
                    {sub.score !== null ? (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                        {sub.score} / {assignment.totalPoints}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-sm italic">Not reviewed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <a 
                        href={sub.fileUrl} 
                        download
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </a>
                      <button 
                        onClick={() => openGradingSidebar(sub)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                        title="Edit Grade"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <InboxIcon className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No submissions found</p>
            <p className="text-sm">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

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

// --- Helper Sub-components ---

function StatCard({ title, value, color }: any) {
  const colors: any = {
    indigo: "border-indigo-500 text-indigo-600",
    yellow: "border-yellow-500 text-yellow-600",
    red: "border-red-500 text-red-600",
  };
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${colors[color]}`}>
      <p className="text-sm text-gray-500 font-semibold">{title}</p>
      <p className="text-3xl font-black mt-1 text-gray-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status, isGraded }: { status: string, isGraded: boolean }) {
  if (isGraded) {
    return (
      <span className="flex items-center gap-1.5 text-blue-600 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
        <CheckBadgeIcon className="h-3.5 w-3.5" /> Graded
      </span>
    );
  }
  return status === 'Late' ? (
    <span className="flex items-center gap-1.5 text-red-600 text-[10px] font-black uppercase tracking-widest bg-red-50 px-2 py-1 rounded">
      <ExclamationCircleIcon className="h-3.5 w-3.5" /> Late
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-gray-500 text-[10px] font-black uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
      Submitted
    </span>
  );
}