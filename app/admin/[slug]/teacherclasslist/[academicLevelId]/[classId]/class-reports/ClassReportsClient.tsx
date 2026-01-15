// app/teacher/[educatorId]/academic-levels/[academicLevelId]/reports/ClassReportsClient.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  ClipboardDocumentListIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// --- Interfaces (Same as original) ---
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

  const educatorId = "";

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Academic Level Info
      const levelRes = await fetch(`${apiBaseUrl}/api/teacher/academic-levels?teacherId=${educatorId}&academicLevelId=${academicLevelId}&classId=${classId}`,{credentials:'include'});
      if (levelRes.ok) setAcademicLevelInfo((await levelRes.json()).data);

      // 2. Fetch Grades with filters
      const gradesUrl = new URL(`${apiBaseUrl}/api/teacher/academic-levels/${academicLevelId}/grades`, window.location.origin);
      gradesUrl.searchParams.append('teacherId', educatorId);
      if (selectedCourse !== 'all') gradesUrl.searchParams.append('courseId', selectedCourse);
      if (selectedStudent !== 'all') gradesUrl.searchParams.append('studentId', selectedStudent);
      if (selectedExam !== 'all') gradesUrl.searchParams.append('examId', selectedExam);

      const gradesRes = await fetch(gradesUrl.toString(),{credentials:'include'});
      if (!gradesRes.ok) throw new Error("Failed to fetch grades");
      setGrades((await gradesRes.json()).data);

      // 3. Concurrent fetches for options
      const [stuRes, couRes, exRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/teacher/academic-levels/${academicLevelId}/students?teacherId=${educatorId}&classId=${classId}`,{credentials:'include'}),
        fetch(`${apiBaseUrl}/api/teacher/academic-levels/${academicLevelId}/courses?teacherId=${educatorId}&classId=${classId}`,{credentials:'include'}),
        fetch(`${apiBaseUrl}/api/teacher/academic-levels/${academicLevelId}/exams?teacherId=${educatorId}&classId=${classId}`,{credentials:'include'}),
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

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Logic: Grouping & Averages (Same as original)
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

  const overallClassAverage = useMemo(() => {
    if (grades.length === 0) return 'N/A';
    return (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(2);
  }, [grades]);

  const getStudentAverage = (id: string) => {
    const sGrades = grades.filter(g => g.studentId === id);
    return sGrades.length ? (sGrades.reduce((s, g) => s + g.score, 0) / sGrades.length).toFixed(2) : 'N/A';
  };

  const getCourseAverage = (id: string) => {
    const cGrades = grades.filter(g => g.courseId === id);
    return cGrades.length ? (cGrades.reduce((s, g) => s + g.score, 0) / cGrades.length).toFixed(2) : 'N/A';
  };

  if (loading) return <div className="p-20 text-center">Loading Report...</div>;
//   if (error) return <div className="p-20 text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold">Report: {academicLevelInfo?.name}</h1>
            </div>
            <div className="bg-indigo-50 px-4 py-2 rounded-lg text-indigo-700 font-bold">
                Class Avg: {overallClassAverage}
            </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input 
                className="border p-2 rounded" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
            />
            <select className="border p-2 rounded" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                <option value="all">All Courses</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <select className="border p-2 rounded" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                <option value="all">All Students</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="border p-2 rounded" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                <option value="all">All Exams</option>
                {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
            </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Avg</th>
                {courses.map(course => (
                  <th key={course.id} className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                    {course.title}
                    <div className="text-[10px] text-gray-400 font-normal">Avg: {getCourseAverage(course.id)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {gradesByStudent.map(({ student, grades: studentGrades }) => (
                    <tr key={student.id}>
                        <td className="px-6 py-4">
                            <div className="font-bold">{student.name}</div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600">{getStudentAverage(student.id)}</td>
                        {courses.map(course => {
                            const grade = studentGrades.find(g => g.courseId === course.id);
                            return (
                                <td key={course.id} className="px-6 py-4 text-center">
                                    {grade ? (
                                        <div>
                                            <span className="font-bold">{grade.score}</span>
                                            <div className={`text-[10px] ${grade.gradeStatus === 'PASSED' ? 'text-green-600' : 'text-red-600'}`}>
                                                {grade.gradeValue}
                                            </div>
                                        </div>
                                    ) : <span className="text-gray-300">-</span>}
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}