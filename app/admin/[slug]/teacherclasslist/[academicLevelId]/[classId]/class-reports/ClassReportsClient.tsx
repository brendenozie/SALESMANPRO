'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  ArrowDownTrayIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  ChartPieIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

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

// --- New Helper for Trend Visualization ---
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - ((val - min) / range) * 100
  }));

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <svg viewBox="0 0 100 100" className={`h-8 w-16 ${color} opacity-80`} preserveAspectRatio="none">
      <path d={pathData} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

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
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // --- 1. Distribution Logic ---
  const distributionData = useMemo(() => {
    const counts = { high: 0, mid: 0, low: 0 };
    grades.forEach(g => {
      if (g.score >= 80) counts.high++;
      else if (g.score >= 50) counts.mid++;
      else counts.low++;
    });
    const total = grades.length || 1;
    return [
      { label: '80-100%', count: counts.high, color: 'bg-emerald-500', width: (counts.high / total) * 100 },
      { label: '50-79%', count: counts.mid, color: 'bg-amber-400', width: (counts.mid / total) * 100 },
      { label: '< 50%', count: counts.low, color: 'bg-rose-500', width: (counts.low / total) * 100 },
    ];
  }, [grades]);

  // --- 2. Enhanced Export Function ---
  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    // Simulating file generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Logic for actual CSV generation would go here
    setIsExporting(false);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

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
  
    // Mocking trend data (In a real app, you'd fetch this from a 'previousReport' API)
    const trendData = [65, 68, 72, 70, 75, 78]; // Historic class averages
    const previousAvg = trendData[trendData.length - 2];
    const currentAvg = Number(stats.avg);
    const delta = currentAvg - previousAvg;

    // const insights = useMemo(() => {
    // if (grades.length === 0) return null;

    // // Logic for Top Performer
    // const sortedByAvg = [...gradesByStudent].sort((a, b) =>
    //   Number(getStudentAverage(b.student.id)) - Number(getStudentAverage(a.student.id))
    // );

    // // Logic for "At Risk" (Score below 50 in any course)
    // const atRisk = gradesByStudent.filter(({ grades: sGrades }) =>
    //   sGrades.some(g => g.score < 50) ); return { 
    //     star: sortedByAvg[0], atRiskCount: atRisk.length, criticalStudent: atRisk[0] 
    //   }; 
    // }, [gradesByStudent]);

    const getStudentAverage = (studentId: string) => {
      const studentGrades = gradesByStudent.find(s => s.student.id === studentId)?.grades || [];
      if (studentGrades.length === 0) return '0';
      const avg = studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length;
      return avg.toFixed(1);
    }

    const insights = useMemo(() => {
      if (grades.length === 0) return null;

      // Logic for Top Performer
      const sortedByAvg = [...gradesByStudent].sort((a, b) => 
        Number(getStudentAverage(b.student.id)) - Number(getStudentAverage(a.student.id))
      );

      // Logic for "At Risk" (Score below 50 in any course)
      const atRisk = gradesByStudent.filter(({ grades: sGrades }) => 
        sGrades.some(g => g.score < 50)
      );

      return {
        star: sortedByAvg[0],
        atRiskCount: atRisk.length,
        criticalStudent: atRisk[0]
      };
    }, [gradesByStudent]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Updated Navigation with Export Feedback */}
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
                    
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm
                ${exportSuccess 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
            >
              {isExporting ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : exportSuccess ? (
                <CheckCircleIcon className="h-4 w-4" />
              ) : (
                <ArrowDownTrayIcon className="h-4 w-4" />
              )}
              {isExporting ? 'Generating...' : exportSuccess ? 'Downloaded' : 'Export Data'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* --- 3. New Distribution Chart Component --- */}
        <section className="mb-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ChartPieIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Grade Distribution</h3>
              </div>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"/> Excellent</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"/> Average</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"/> Critical</span>
              </div>
            </div>

            {/* The Heat-Bar */}
            <div className="relative h-12 w-full bg-slate-100 rounded-2xl overflow-hidden flex shadow-inner">
              {distributionData.map((segment, i) => (
                <motion.div
                  key={segment.label}
                  initial={{ width: 0 }}
                  animate={{ width: `${segment.width}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: i * 0.2 }}
                  className={`${segment.color} h-full relative group cursor-help`}
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                    {segment.label}: {segment.count} students
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 mt-4">
              {distributionData.map((segment) => (
                <div key={segment.label} className="text-center">
                  <p className="text-lg font-black text-slate-900">{segment.width.toFixed(0)}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{segment.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group"
          >
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Class Average</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-slate-900">{stats.avg}%</p>
                  <span className={`text-xs font-bold flex items-center ${delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* The Sparkline Trend Indicator */}
            <div className="flex flex-col items-end gap-1">
              <Sparkline data={trendData} color={delta >= 0 ? 'text-emerald-400' : 'text-rose-400'} />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Last 6 Months</span>
            </div>
          </motion.div>
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

        <section
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 no-print">
          {/* Success Insight */}
          <div
            className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[2rem] text-white shadow-lg shadow-emerald-100 flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <StarIcon className="h-5 w-5 text-emerald-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Top Performer</span>
              </div>
              <h3 className="text-xl font-bold">{insights?.star?.student.name}</h3>
              <p className="text-emerald-100 text-sm mt-1">Maintaining a class-leading
                {getStudentAverage(insights?.star?.student.id || '')}% average.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md text-2xl font-black">
              🏆
            </div>
            {/* Decorative background shape */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </div>

          {/* Intervention Insight */}
          <div
            className="bg-white p-6 rounded-[2rem] border border-rose-100 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-2 text-rose-500">
                <ExclamationCircleIcon className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Intervention Required</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{insights?.atRiskCount} Students at Risk</h3>
              <p className="text-slate-500 text-sm mt-1">
                {insights?.criticalStudent?.student.name} and others are falling below passing thresholds.
              </p>
            </div>
            <button
              className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">
              View List
            </button>
          </div>
          </section>

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
            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-1 border border-slate-100">
              <FunnelIcon className="h-4 w-4 text-slate-400" />
              <select
                value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 py-2 cursor-pointer"
              >
                <option value="all">All Students</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-1 border border-slate-100">
              <FunnelIcon className="h-4 w-4 text-slate-400" />
              <select 
                value={selectedExam} onChange={e => setSelectedExam(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 py-2 cursor-pointer"
              >
                <option value="all">All Exams</option>
                {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title} ({ex.courseTitle})</option>)}
              </select>
            </div>
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
      {/* STYLE */}

    </div>
  );
}