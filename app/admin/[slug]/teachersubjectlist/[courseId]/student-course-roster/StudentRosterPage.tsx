'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentCheckIcon, 
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon, StarIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function CourseEducatorRoster({ context }: any) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        // Fetching specifically via the Course ID
        // const res = await fetch(`/api/teacher/courses/${context.courseId}/enrolled-students?educatorId=${context.educatorId}&`,{  });
        const query = new URLSearchParams({
          educatorId: context.educatorId,
          scheduleId: context.scheduleId,
          date: new Date().toISOString() // API requires a date, even if just for context
        }).toString();

        const res = await fetch(`/api/teacher/courses/${context.courseId}/enrolled-students?${query}`);
        const result = await res.json();
        
        if (result.success) {
          setStudents(result.data.students);
        }
      } catch (err) {
        toast.error("Failed to load course roster");
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
      
      {/* HEADER: Subject Focus */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2">
            <BookOpenIcon className="h-4 w-4" />
            <span>Course Educator Console</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {/* {context.courseTitle} */}
          </h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
             <BeakerIcon className="h-5 w-5 text-slate-400" />
             Roster 
             {/* for Section: <span className="text-slate-900">{context.classroomId}</span> */}
          </p>
        </div>

        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-100 transition-all">
                <ClipboardDocumentCheckIcon className="h-5 w-5" />
                Export Gradebook
            </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative group">
          <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search students in this course..."
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {/* ROSTER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
            [1,2,3].map(i => <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-[2.5rem]" />)
        ) : filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-[2.5rem] border border-slate-200/60 p-2 hover:border-indigo-400 hover:shadow-2xl transition-all group">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl font-black text-indigo-600 overflow-hidden border border-white">
                    {student.image ? <img src={student.image} className="h-full w-full object-cover" alt="" /> : student.name[0]}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Current Grade</span>
                    <span className="text-xl font-black text-indigo-600">A-</span> {/* Placeholder for Grade logic */}
                  </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-800 truncate">{student.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{student.admissionNumber}</p>
                </div>

                {/* COURSE SPECIFIC METRICS */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Labs/Assig.</p>
                    <p className="text-sm font-bold text-slate-700">12 / 14</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Participation</p>
                    <div className="flex text-amber-400">
                      {[1,2,3,4].map(i => <StarIcon key={i} className="h-3 w-3" />)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                    <button 
                      title="Send Feedback"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-xs"
                    >
                        <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
                        Feedback
                    </button>
                    <button 
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition-all font-bold text-xs"
                    >
                        <AcademicCapIcon className="h-4 w-4" />
                        Grades
                    </button>
                </div>
            </div>

            <button className="w-full py-4 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 border-t border-slate-50">
                View Subject Performance History
                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}