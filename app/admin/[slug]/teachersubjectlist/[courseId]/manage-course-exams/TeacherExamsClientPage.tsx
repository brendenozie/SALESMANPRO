'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, PlusIcon, PencilIcon, 
  TrashIcon, BookOpenIcon, ClipboardDocumentCheckIcon,
  CheckCircleIcon, ClockIcon, XMarkIcon, ArrowLeftIcon,
  CalendarDaysIcon, MapPinIcon, DocumentTextIcon,
  InformationCircleIcon, BeakerIcon
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
  const [exams, setExams] = useState(initialExams || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);

  // --- 100% PRESERVED FORM STATE ---
  const initialFormState = {
    id: '',
    title: '',
    description: '',
    courseId: courseId,
    classroomId: classroomId || null,
    createdByEducatorId: educatorId,
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
    type: 'UNIT_TEST',
    totalPoints: 100,
    isPublished: false,
    isOnline: false,
    durationMinutes: 60,
    autoGrade: false,
    companyId: companyId,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (editingExam) {
      setFormData({
        ...editingExam,
        courseId: editingExam.courseId || courseId,
        classroomId: editingExam.classroomId || classroomId,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [editingExam, isModalOpen]);

  // --- LOGIC & FILTERING ---
  const stats = useMemo(() => [
    { label: 'Total Exams', value: exams.length, icon: BeakerIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Published', value: exams.filter((e: any) => e.isPublished).length, icon: CheckCircleIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Drafts', value: exams.filter((e: any) => !e.isPublished).length, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
  ], [exams]);

  const filteredExams = exams.filter((exam: any) =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // --- PRESERVED VALIDATION LOGIC ---
  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.type || formData.totalPoints === null) {
      alert("Please fill all required fields: Title, Date, Type, and Total Points.");
      return;
    }
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (formData.startTime && !timeRegex.test(formData.startTime)) {
        alert("Start Time must be in HH:MM (24-hour) format.");
        return;
    }
    if (formData.endTime && !timeRegex.test(formData.endTime)) {
        alert("End Time must be in HH:MM (24-hour) format.");
        return;
    }
    if (formData.startTime && formData.endTime) {
        const start = new Date(`1970-01-01T${formData.startTime}:00Z`);
        const end = new Date(`1970-01-01T${formData.endTime}:00Z`);
        if (start >= end) {
            alert("Start time must be before end time.");
            return;
        }
    }
    // console.log("Saving Exam:", formData);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFDFF] p-6 lg:p-10 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-5">
            <button 
              onClick={() => router.back()} 
              className="mt-1 p-3 bg-white hover:bg-slate-50 rounded-2xl shadow-sm border border-slate-200 transition-all group"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
            </button>
            <div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 block">Course Management</span>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                {courseDetails?.title || 'Exams'}
              </h1>
            </div>
          </div>
          <button 
            onClick={() => { setEditingExam(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all font-bold"
          >
            <PlusIcon className="h-5 w-5 stroke-[3px]" />
            New Assessment
          </button>
        </header>

        {/* --- STATS DASHBOARD --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow"
            >
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full max-w-md group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Find an exam..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-semibold text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="px-10 py-6">Identity & Schedule</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-center">Responses</th>
                  <th className="px-10 py-6 text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExams.map((exam: any) => (
                  <tr key={exam.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="px-10 py-7">
                      <div className="font-black text-slate-800 text-xl mb-1.5 group-hover:text-indigo-600 transition-colors">{exam.title}</div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                          <CalendarDaysIcon className="h-3.5 w-3.5" />
                          {new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        {exam.startTime && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                            <ClockIcon className="h-3.5 w-3.5" />
                            {exam.startTime}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        exam.isPublished ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${exam.isPublished ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {exam.isPublished ? 'Live' : 'Draft'}
                      </div>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <span className="text-2xl font-black text-slate-300 group-hover:text-slate-900 transition-colors">
                        {exam.submissionCount || 0}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex justify-end gap-3">
                        {/* RESTORED: Core Path Links */}
                        <Link 
                          href={`/admin/${companyId}/teachersubjectlist/${courseId}/manage-course-exams/${exam.id}/questions`}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all font-bold text-xs"
                        >
                          <BookOpenIcon className="h-4 w-4 stroke-[2.5px]" />
                          Questions
                        </Link>
                        <Link 
                          href={`/admin/${companyId}/teachersubjectlist/${courseId}/manage-course-exams/${exam.id}/submissions`}
                          className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          title="View Submissions"
                        >
                          <ClipboardDocumentCheckIcon className="h-6 w-6" />
                        </Link>
                        <button 
                          onClick={() => { setEditingExam(exam); setIsModalOpen(true); }}
                          className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                        >
                          <PencilIcon className="h-6 w-6" />
                        </button>
                        <button className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                          <TrashIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL DESIGN UPDATE --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-3xl shadow-3xl relative my-auto"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                <XMarkIcon className="h-6 w-6" />
              </button>
              
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {editingExam ? 'Modify Assessment' : 'New Assessment'}
                </h2>
                <p className="text-slate-400 font-bold mt-2">Classroom: {courseDetails?.title || 'Current'}</p>
              </div>
              
              <form onSubmit={validateAndSubmit} className="space-y-8">
                {/* Section 1: Core Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Exam Title</label>
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title} 
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-lg" 
                      placeholder="Enter a descriptive title..." 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Context & Instructions</label>
                    <textarea 
                      name="description"
                      value={formData.description || ''} 
                      onChange={handleChange}
                      placeholder="Add a brief description for this exam..."
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none transition-all resize-none h-24 font-semibold" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Assigned Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Assessment Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold appearance-none">
                      <option value="QUIZ text-slate-900">Quiz</option>
                      <option value="UNIT_TEST">Unit Test</option>
                      <option value="MIDTERM">Midterm</option>
                      <option value="FINAL">Final</option>
                      <option value="PRACTICE">Practice</option>
                    </select>
                  </div>
                </div>

                {/* Section 2: Logistics Grid */}
                <div className="bg-indigo-50/50 p-8 rounded-[2rem] grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2">Start</label>
                    <input type="time" name="startTime" value={formData.startTime || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white border-none rounded-xl outline-none font-bold shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2">End</label>
                    <input type="time" name="endTime" value={formData.endTime || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white border-none rounded-xl outline-none font-bold shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2">Points</label>
                    <input type="number" name="totalPoints" value={formData.totalPoints} onChange={handleChange} className="w-full px-4 py-3 bg-white border-none rounded-xl outline-none font-bold shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2">Duration (m)</label>
                    <input type="number" name="durationMinutes" value={formData.durationMinutes || 0} onChange={handleChange} className="w-full px-4 py-3 bg-white border-none rounded-xl outline-none font-bold shadow-sm" />
                  </div>
                </div>

                {/* Section 3: Toggles & Meta */}
                <div className="space-y-4">
                   <div className="flex flex-wrap gap-4">
                      <label className="flex-1 flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors group">
                        <span className="text-sm font-bold text-slate-700">Digital / Online Format</span>
                        <input type="checkbox" name="isOnline" checked={formData.isOnline} onChange={handleChange} className="w-6 h-6 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500 transition-all" />
                      </label>
                      
                      {formData.isOnline && (
                        <label className="flex-1 flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                          <span className="text-sm font-bold text-slate-700">Automated Grading</span>
                          <input type="checkbox" name="autoGrade" checked={formData.autoGrade} onChange={handleChange} className="w-6 h-6 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500" />
                        </label>
                      )}
                   </div>

                   <label className="flex items-center justify-between p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl cursor-pointer">
                      <div className="flex items-center gap-3 text-emerald-700">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span className="text-sm font-black uppercase tracking-widest">Publish Immediately</span>
                      </div>
                      <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} className="w-6 h-6 rounded-lg border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
                   </label>
                </div>

                {/* Section 4: Extra Details */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Location / Venue</label>
                    <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold" placeholder="e.g. Science Lab B" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Private Teacher Notes</label>
                    <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all h-20 font-semibold" />
                  </div>
                </div>

                {/* --- 100% PRESERVED HIDDEN FIELDS --- */}
                <input type="hidden" name="courseId" value={courseId} />
                <input type="hidden" name="classroomId" value={classroomId || ''} />
                <input type="hidden" name="createdByEducatorId" value={educatorId} />
                <input type="hidden" name="companyId" value={companyId} />

                <div className="flex items-center justify-end gap-6 pt-6 border-t border-slate-50">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-900 transition-colors">Discard</button>
                  <button type="submit" className="px-12 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:translate-y-[-2px] active:translate-y-0 transition-all">
                    {editingExam ? 'Update Details' : 'Finalize Exam'}
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