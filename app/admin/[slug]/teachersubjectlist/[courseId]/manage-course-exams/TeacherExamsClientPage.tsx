'use client';

import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, PlusIcon, PencilIcon, 
  TrashIcon, BookOpenIcon, ClipboardDocumentCheckIcon,
  CheckCircleIcon, ClockIcon, XMarkIcon, ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeacherExamsClientPage({ 
  initialExams, 
  courseDetails,
  companyId, 
  courseId, 
  classroomId,
  educatorId 
}: any) {
  const router = useRouter();
  const [exams, setExams] = useState(initialExams);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);

  // Stats - Scoped to this specific class
  const stats = useMemo(() => [
    { label: 'Class Exams', value: exams.length, icon: ClipboardDocumentCheckIcon, color: 'text-indigo-600' },
    { label: 'Active/Published', value: exams.filter((e: any) => e.isPublished).length, icon: CheckCircleIcon, color: 'text-emerald-600' },
    { label: 'Pending Results', value: exams.filter((e: any) => !e.isPublished).length, icon: ClockIcon, color: 'text-amber-600' },
  ], [exams]);

  const filteredExams = exams.filter((exam: any) =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200">
              <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Exams: {courseDetails?.title || 'Course'}</h1>
              <p className="text-slate-500 text-sm">Manage assessments for this specific classroom</p>
            </div>
          </div>
          <button 
            onClick={() => { setEditingExam(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all font-bold"
          >
            <PlusIcon className="h-5 w-5" />
            New Exam
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Exam Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/30">
            <div className="relative max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search exams by title..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Exam Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Submissions</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExams.map((exam: any) => (
                <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{exam.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {new Date(exam.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      exam.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {exam.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-600">
                    {exam.submissionCount || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/educator/${companyId}/exams/${exam.id}/questions`}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Manage Questions"
                      >
                        <BookOpenIcon className="h-5 w-5" />
                      </Link>
                      <button 
                        onClick={() => { setEditingExam(exam); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative border border-slate-100"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingExam ? 'Update Exam' : 'Create New Exam'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">Configure your assessment details</p>
              </div>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Exam Title</label>
                  <input 
                    type="text" 
                    defaultValue={editingExam?.title} 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300" 
                    placeholder="e.g. Unit 3 Geometry Quiz" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date</label>
                    <input type="date" defaultValue={editingExam?.date} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Max Points</label>
                    <input type="number" defaultValue={editingExam?.totalPoints || 100} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>

                {/* Hidden fields ensured by the context */}
                <input type="hidden" name="courseId" value={courseId} />
                <input type="hidden" name="classroomId" value={classroomId || ''} />
                <input type="hidden" name="educatorId" value={educatorId} />

                <div className="flex items-center justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                  <button type="submit" className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                    {editingExam ? 'Save Changes' : 'Create Exam'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}