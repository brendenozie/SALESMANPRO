'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserPlusIcon, 
  EnvelopeIcon, 
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  IdentificationIcon,
  ArrowUpRightIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon, SparklesIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function StudentRosterPage({ context }: any) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const query = new URLSearchParams({
          educatorId: context.educatorId,
          scheduleId: context.scheduleId,
          date: new Date().toISOString() // API requires a date, even if just for context
        }).toString();

        const res = await fetch(`/api/teacher/courses/${context.courseId}/enrolled-students?${query}`);
        const result = await res.json();
        
        if (result.success) {
          // Map API data to UI structure
          setStudents(result.data.students);
        }
      } catch (err) {
        toast.error("Failed to load student roster");
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, [context.courseId]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8">
      
      {/* HEADER: Course & Classroom Identity */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2">
            <SparklesIcon className="h-4 w-4" />
            <span>Classroom Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {context.courseTitle}
          </h1>
          <div className="flex gap-4 mt-2">
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <IdentificationIcon className="h-5 w-5 text-slate-400" />
              Room: <span className="text-slate-900">{context.classroomId}</span>
            </p>
            <p className="text-slate-500 font-medium flex items-center gap-2 border-l pl-4">
              <UserCircleIcon className="h-5 w-5 text-slate-400" />
              Lead: <span className="text-slate-900">{context.educatorName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold hover:bg-slate-50 shadow-sm transition-all">
                Batch Actions
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all">
                <UserPlusIcon className="h-5 w-5" />
                Enroll Student
            </button>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow group">
          <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search by name, ID, or email..."
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium text-slate-700"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ROSTER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
            [1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-[2.5rem]" />)
        ) : filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-[2.5rem] border border-slate-200/60 p-2 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-20 w-20 bg-gradient-to-tr from-slate-100 to-indigo-50 rounded-[1.8rem] flex items-center justify-center text-3xl font-black text-indigo-600 overflow-hidden border border-white">
                    {student.image ? (
                        <img src={student.image} className="h-full w-full object-cover" alt={student.name} />
                    ) : student.name[0]}
                  </div>
                  <div className="flex gap-1">
                    <button className="p-3 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded-2xl transition-all">
                        <EnvelopeIcon className="h-6 w-6" />
                    </button>
                    <button className="p-3 hover:bg-slate-50 text-slate-400 rounded-2xl transition-all">
                        <EllipsisHorizontalIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                            {student.name}
                        </h3>
                        {student.levelStatus === 'ACTIVE' && (
                            <CheckBadgeIcon className="h-5 w-5 text-emerald-500" title="Officially Enrolled" />
                        )}
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">
                        ID: <span className="text-slate-600">{student.admissionNumber || 'PENDING'}</span>
                    </p>
                </div>

                {/* ACADEMIC SNAPSHOT */}
                <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-nowrap">Academic Level</span>
                        <span className="text-sm font-bold text-slate-700">{student.levelStatus || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</span>
                        <span className="text-xs font-medium text-slate-500 truncate w-full">{student.email || 'No email'}</span>
                    </div>
                </div>
            </div>

            <button 
              onClick={() => window.location.href = `/admin/students/${student.id}`}
              className="w-full bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white py-4 rounded-b-[2rem] font-bold text-slate-500 transition-all text-sm flex items-center justify-center gap-2"
            >
                Manage Student Profile
                <ArrowUpRightIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
           <AcademicCapIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500 font-bold">No students found matching those criteria.</p>
        </div>
      )}
    </div>
  );
}