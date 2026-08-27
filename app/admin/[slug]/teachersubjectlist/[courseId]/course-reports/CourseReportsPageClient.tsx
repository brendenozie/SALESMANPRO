'use client';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowUpTrayIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function CourseEducatorDashboard({ context }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, at-risk, top-performers

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/teacher/reports/course/${context.courseId}?educatorId=${context.educatorId}`);
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (err) {
        toast.error("Failed to load academic data");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [context.courseId]);

  const students = data?.studentReports || [];
  
  const filteredStudents = students.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.admissionNumber?.includes(searchTerm);
    if (filter === 'at-risk') return matchesSearch && parseFloat(s.stats.exams.average) < 60;
    if (filter === 'top') return matchesSearch && parseFloat(s.stats.exams.average) > 85;
    return matchesSearch;
  });

  if (loading) return <div className="p-12 space-y-4">
    <div className="h-20 w-full bg-slate-100 animate-pulse rounded-3xl" />
    <div className="grid grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2.5rem]" />)}
    </div>
  </div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 space-y-10">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em]">
            <AcademicCapIcon className="h-4 w-4" />
            <span>Subject Management 2026</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {data?.courseTitle} <span className="text-indigo-200 font-light">/</span> {context.classroomId}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:shadow-md transition-all">
            <ArrowUpTrayIcon className="h-5 w-5" />
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 transition-all flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Generate Term Report
          </button>
        </div>
      </header>

      {/* QUICK STATS BENTO */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg. Mastery', value: '84%', sub: '+2.4% vs last month', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Participation', value: '92%', sub: 'High engagement', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'At Risk', value: students.filter((s:any) => parseFloat(s.stats.exams.average) < 60).length, sub: 'Needs intervention', color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Course Progress', value: '68%', sub: 'Week 12 of 18', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end gap-2 mt-2">
              <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] font-bold text-slate-400 mb-1">{stat.sub}</span>
            </div>
          </div>
        ))}
      </section>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students by name or ID..."
            className="w-full pl-16 pr-6 py-5 bg-white border-none rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-white p-1.5 rounded-3xl shadow-sm">
          {['all', 'at-risk', 'top'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filter === t ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ROSTER GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredStudents.map((student: any) => (
          <div key={student.studentId} className="group bg-white rounded-[3rem] border border-slate-200/50 p-3 hover:shadow-2xl hover:shadow-indigo-200/40 hover:-translate-y-1 transition-all duration-500">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-[2rem] bg-indigo-50 border-4 border-white shadow-inner flex items-center justify-center overflow-hidden">
                    {student.image ? <img src={student.image} className="object-cover h-full w-full" /> : <span className="text-2xl font-black text-indigo-600">{student.name[0]}</span>}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                    {parseFloat(student.stats.exams.average) > 80 ? <CheckCircleIcon className="h-6 w-6 text-emerald-500" /> : <ExclamationCircleIcon className="h-6 w-6 text-amber-500" />}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</p>
                  <p className="text-2xl font-black text-slate-900">{student.stats.exams.average}%</p>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="text-xl font-black text-slate-800 tracking-tight truncate">{student.name}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter italic">{student.admissionNumber}</p>
              </div>

              {/* PROGRESS BARS */}
              <div className="space-y-4 mb-6">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                    <span>Assignments</span>
                    <span>{student.stats.assignments.completed}/{student.stats.assignments.total}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-1000" 
                      style={{ width: `${(student.stats.assignments.completed / student.stats.assignments.total) * 100}%` }} 
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Attendance</span>
                    <span className="text-sm font-black text-slate-700">{student.stats.attendance.percentage}%</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
                   View Profile
                </button>
                <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}