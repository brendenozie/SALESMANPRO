'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  AcademicCapIcon,
  UserGroupIcon,
  StarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// --- Interfaces ---
interface GradeReportData {
  id: string; score: number; gradeValue: string | null;
  gradeStatus: 'PASSED' | 'FAILED' | 'PENDING' | null;
  comments: string | null; studentId: string; studentName: string;
  studentEmail: string; courseId: string; courseTitle: string;
  examTitle: string | null;
}
interface StudentOption { id: string; name: string; email: string; }
interface CourseOption { id: string; title: string; }
interface ExamOption { id: string; title: string; courseTitle: string; }
interface AcademicLevelInfo { id: string; name: string; description: string | null; }

interface ClientProps {
  academicLevelId: string;
  classId: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

export default function ClassReportsClient({ academicLevelId, classId }: ClientProps) {
  const [grades, setGrades] = useState<GradeReportData[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [academicLevelInfo, setAcademicLevelInfo] = useState<AcademicLevelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const educatorId = ""; // Assume context provides this

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const levelRes = await fetch(`${apiBaseUrl}/api/teacher/academic-levels?teacherId=${educatorId}&academicLevelId=${academicLevelId}&classId=${classId}`, { credentials: 'include' });
      if (levelRes.ok) setAcademicLevelInfo((await levelRes.json()).data);

      const gradesUrl = new URL(`${apiBaseUrl}/api/teacher/academic-levels/${academicLevelId}/grades`, window.location.origin);
      gradesUrl.searchParams.append('teacherId', educatorId);
      if (selectedCourse !== 'all') gradesUrl.searchParams.append('courseId', selectedCourse);
      if (selectedStudent !== 'all') gradesUrl.searchParams.append('studentId', selectedStudent);
      if (selectedExam !== 'all') gradesUrl.searchParams.append('examId', selectedExam);

      const gradesRes = await fetch(gradesUrl.toString(), { credentials: 'include' });
      if (!gradesRes.ok) throw new Error("Failed to fetch grades");
      setGrades((await gradesRes.json()).data);

      const [stuRes, couRes, exRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/teacher/academic-levels/${academicLevelId}/students?teacherId=${educatorId}&classId=${classId}`, { credentials: 'include' }),
        fetch(`${apiBaseUrl}/api/teacher/academic-levels/${academicLevelId}/courses?teacherId=${educatorId}&classId=${classId}`, { credentials: 'include' }),
        fetch(`${apiBaseUrl}/api/teacher/academic-levels/${academicLevelId}/exams?teacherId=${educatorId}&classId=${classId}`, { credentials: 'include' }),
      ]);

      if (stuRes.ok) setStudents((await stuRes.json()).data);
      if (couRes.ok) setCourses((await couRes.json()).data);
      if (exRes.ok) setExams((await exRes.json()).data);
    } catch (err: any) {
      setError(err.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }, [academicLevelId, educatorId, classId, selectedCourse, selectedStudent, selectedExam]);

  useEffect(() => { fetchReportData(); }, [fetchReportData]);

  const filteredGrades = useMemo(() => {
    return grades.filter(grade =>
      grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [grades, searchTerm]);

  const gradesByStudent = useMemo(() => {
    const grouped: { [key: string]: { student: StudentOption; grades: GradeReportData[] } } = {};
    filteredGrades.forEach(grade => {
      if (!grouped[grade.studentId]) {
        grouped[grade.studentId] = {
          student: { id: grade.studentId, name: grade.studentName, email: grade.studentEmail },
          grades: [],
        };
      }
      grouped[grade.studentId].grades.push(grade);
    });
    return Object.values(grouped).sort((a, b) => a.student.name.localeCompare(b.student.name));
  }, [filteredGrades]);

  const stats = useMemo(() => {
    const avg = grades.length ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1) : '0';
    const passRate = grades.length ? ((grades.filter(g => g.gradeStatus === 'PASSED').length / grades.length) * 100).toFixed(0) : '0';
    return { avg, passRate, totalStudents: students.length };
  }, [grades, students]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-medium animate-pulse">Generating Insights...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()} 
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Class Performance</h1>
              <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">{academicLevelInfo?.name || 'Academic Report'}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-100">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Overall Average', value: `${stats.avg}%`, icon: ChartBarIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Pass Rate', value: `${stats.passRate}%`, icon: StarIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Students Enrolled', value: stats.totalStudents, icon: UserGroupIcon, color: 'text-sky-600', bg: 'bg-sky-50' },
          ].map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              key={item.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5"
            >
              <div className={`p-4 rounded-2xl ${item.bg}`}>
                <item.icon className={`h-7 w-7 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                <p className="text-2xl font-black text-slate-900">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Toolbar */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-2 mb-8 flex flex-col lg:flex-row gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" placeholder="Search student or course..." 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 font-medium"
            />
          </div>
          <div className="h-10 w-px bg-slate-100 hidden lg:block self-center" />
          <div className="flex flex-wrap items-center gap-2 p-1">
            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-1 border border-slate-100">
              <FunnelIcon className="h-4 w-4 text-slate-400" />
              <select 
                value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 py-2 cursor-pointer"
              >
                <option value="all">All Courses</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            {/* Repeat for other selects if needed */}
          </div>
        </section>

        {/* Data Table */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Student Identity</span>
                  </th>
                  <th className="px-6 py-5 text-center">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Avg. Score</span>
                  </th>
                  {courses.map(course => (
                    <th key={course.id} className="px-6 py-5 text-center min-w-[140px]">
                      <span className="text-xs font-bold text-slate-700 block">{course.title}</span>
                      <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                        AVG: {grades.filter(g => g.courseId === course.id).length ? (grades.filter(g => g.courseId === course.id).reduce((s, g) => s + g.score, 0) / grades.filter(g => g.courseId === course.id).length).toFixed(0) : '-'}%
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {gradesByStudent.map(({ student, grades: studentGrades }, idx) => {
                    const studentAvg = studentGrades.length ? (studentGrades.reduce((s, g) => s + g.score, 0) / studentGrades.length).toFixed(0) : '0';
                    return (
                      <motion.tr 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                        key={student.id} className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{student.name}</p>
                              <p className="text-xs text-slate-400 font-medium">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${getScoreColor(Number(studentAvg))}`}>
                            {studentAvg}%
                          </div>
                        </td>
                        {courses.map(course => {
                          const grade = studentGrades.find(g => g.courseId === course.id);
                          return (
                            <td key={course.id} className="px-6 py-5">
                              {grade ? (
                                <div className="text-center">
                                  <span className="text-sm font-bold text-slate-700">{grade.score}</span>
                                  <div className={`text-[10px] font-black mt-1 uppercase ${grade.gradeStatus === 'PASSED' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {grade.gradeValue || '-'}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <div className="h-1 w-4 bg-slate-100 rounded-full" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {gradesByStudent.length === 0 && (
            <div className="py-20 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No results found</h3>
              <p className="text-slate-500">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}