// app/teacher/[educatorId]/academic-levels/[academicLevelId]/reports/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  ClipboardDocumentListIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// --- Type Definitions for Frontend ---
interface GradeReportData {
  id: string;
  score: number;
  gradeValue: string | null;
  gradeStatus: 'PASSED' | 'FAILED' | 'PENDING' | null;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  examId: string | null;
  examTitle: string | null;
  examType: string | null;
}

interface StudentOption {
  id: string;
  name: string;
  email: string;
}

interface CourseOption {
  id: string;
  title: string;
}

interface ExamOption {
  id: string;
  title: string;
  examType: string;
  courseId: string;
  courseTitle: string;
}

interface AcademicLevelInfo {
  id: string;
  name: string;
  description: string | null;
}

interface PageProps {
  params: Promise<{
    slug: string; // teacherId
    classId: string; // The ID of the academic level/class
  }>;
}

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function ClassReportsPage({ params }: PageProps) {

  const { slug, classId } = await params;

  const educatorId = slug;
  const academicLevelId  = classId;

  const [grades, setGrades] = useState<GradeReportData[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [exams, setExams] = useState<ExamOption[]>([]);// All exams for filtering
  const [academicLevelInfo, setAcademicLevelInfo] = useState<AcademicLevelInfo | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all necessary data
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Academic Level Info (assuming you have an API for this, e.g., /api/academic-levels/[id])
      // If not, you might need to add one or pass it as a prop from a parent page.
      // For now, let's mock it or assume it's fetched.
      const academicLevelRes = await fetch(`${apiBaserUrl}/teacher/academic-levels?teacherId=${educatorId}`);
      if (academicLevelRes.ok) {
        setAcademicLevelInfo(await academicLevelRes.json());
      } else {
        console.warn(`Could not fetch academic level info for ${academicLevelId}`);
        setAcademicLevelInfo({ id: academicLevelId, name: `${academicLevelId}`, description: null }); // Fallback
      }

      // Fetch Grades
      const gradesUrl = new URL(`${apiBaserUrl}/teacher/academic-levels/${academicLevelId}/grades`);
      gradesUrl.searchParams.append('teacherId', educatorId);
      if (selectedCourse !== 'all') gradesUrl.searchParams.append('courseId', selectedCourse);
      if (selectedStudent !== 'all') gradesUrl.searchParams.append('studentId', selectedStudent);
      if (selectedExam !== 'all') gradesUrl.searchParams.append('examId', selectedExam);

      const gradesRes = await fetch(gradesUrl.toString());
      if (!gradesRes.ok) throw new Error(`Failed to fetch grades: ${gradesRes.statusText}`);
      setGrades(await gradesRes.json());

      // Fetch Students for this academic level
      const studentsRes = await fetch(`${apiBaserUrl}/teacher/academic-levels/${academicLevelId}/students?teacherId=${educatorId}`);
      if (!studentsRes.ok) throw new Error(`Failed to fetch students: ${studentsRes.statusText}`);
      setStudents(await studentsRes.json());

      // Fetch Courses for this academic level
      const coursesRes = await fetch(`${apiBaserUrl}/teacher/academic-levels/${academicLevelId}/courses?teacherId=${educatorId}`);
      if (!coursesRes.ok) throw new Error(`Failed to fetch courses: ${coursesRes.statusText}`);
      setCourses(await coursesRes.json());

      // Fetch Exams for this academic level
      const examsRes = await fetch(`${apiBaserUrl}/teacher/academic-levels/${academicLevelId}/exams?teacherId=${educatorId}`);
      if (!examsRes.ok) throw new Error(`Failed to fetch exams: ${examsRes.statusText}`);
      setExams(await examsRes.json());

    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }, [academicLevelId, educatorId, selectedCourse, selectedStudent, selectedExam]); // Re-fetch on filter change

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Filter grades further by search term on the client-side
  const filteredGrades = useMemo(() => {
    return grades.filter(grade =>
      grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grade.examTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grade.comments || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.gradeValue?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [grades, searchTerm]);

  // Group grades by student for display in the table
  const gradesByStudent = useMemo(() => {
    const grouped: { [studentId: string]: { student: StudentOption; grades: GradeReportData[] } } = {};
    filteredGrades.forEach(grade => {
      if (!grouped[grade.studentId]) {
        grouped[grade.studentId] = {
          student: { id: grade.studentId, name: grade.studentName, email: grade.studentEmail },
          grades: [],
        };
      }
      grouped[grade.studentId].grades.push(grade);
    });
    // Sort students by name
    return Object.values(grouped).sort((a, b) => a.student.name.localeCompare(b.student.name));
  }, [filteredGrades]);

  // Calculate overall class average
  const overallClassAverage = useMemo(() => {
    if (grades.length === 0) return 'N/A';
    const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);
    return (totalScore / grades.length).toFixed(2);
  }, [grades]);

  // Calculate average score per student
  const getStudentAverage = useCallback((studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) return 'N/A';
    const totalScore = studentGrades.reduce((sum, grade) => sum + grade.score, 0);
    return (totalScore / studentGrades.length).toFixed(2);
  }, [grades]);

  // Calculate average score per course
  const getCourseAverage = useCallback((courseId: string) => {
    const courseGrades = grades.filter(g => g.courseId === courseId);
    if (courseGrades.length === 0) return 'N/A';
    const totalScore = courseGrades.reduce((sum, grade) => sum + grade.score, 0);
    return (totalScore / courseGrades.length).toFixed(2);
  }, [grades]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-700">
        <div className="text-xl font-semibold flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-xl">
          <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Loading class report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <ExclamationCircleIcon className="h-20 w-20 text-red-500 mb-6" />
        <h2 className="text-3xl font-extrabold text-red-800 mb-4">Error Loading Report</h2>
        <p className="text-red-700 mb-8 max-w-md">{error}</p>
        <button
          onClick={fetchReportData}
          className={`inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg shadow-md
                      hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
        >
          <span className="fas fa-sync-alt"></span> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 font-inter text-gray-800">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-gray-200 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className={`p-3 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              aria-label="Back to previous page"
            >
              <ArrowLeftIcon className="h-7 w-7" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Grade Report for <span className="text-indigo-600">{academicLevelInfo?.name || 'Loading...'}</span>
              </h1>
              <p className="text-md text-gray-600 mt-2">Detailed performance overview for your class.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200">
            <ChartBarIcon className="h-6 w-6 text-gray-500" />
            <span className="font-semibold text-lg text-gray-700">Overall Class Avg: {overallClassAverage}</span>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="relative col-span-full md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search student, course, or exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">All Exams</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title} ({exam.courseTitle})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grades Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Student Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Avg
                </th>
                {courses.map(course => (
                  <th key={course.id} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                    {course.title}
                    <div className="text-gray-400 font-normal normal-case text-xxs">Class Avg: {getCourseAverage(course.id)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gradesByStudent.length === 0 ? (
                <tr>
                  <td colSpan={courses.length + 2} className="px-6 py-10 text-center text-gray-500">
                    <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    No grade records found for this academic level or matching your filters.
                  </td>
                </tr>
              ) : (
                gradesByStudent.map(({ student, grades: studentGrades }) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {student.name}
                      </div>
                      <p className="text-xs text-gray-500 ml-7">{student.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold">
                      {getStudentAverage(student.id)}
                    </td>
                    {courses.map(course => {
                      const gradeForCourse = studentGrades.find(g => g.courseId === course.id);
                      return (
                        <td key={`${student.id}-${course.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-center border-l border-gray-200">
                          {gradeForCourse ? (
                            <div className="flex flex-col items-center">
                              <span className="font-semibold text-gray-800">{gradeForCourse.score}</span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1
                                ${gradeForCourse.gradeStatus === 'PASSED' ? 'bg-green-100 text-green-800' :
                                  gradeForCourse.gradeStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'}`}>
                                {gradeForCourse.gradeValue || gradeForCourse.gradeStatus || 'N/A'}
                              </span>
                              {gradeForCourse.examTitle && (
                                <span className="text-xxs text-gray-500 mt-0.5">({gradeForCourse.examTitle})</span>
                              )}
                              {gradeForCourse.comments && (
                                <p className="text-xxs text-gray-600 italic mt-1 max-w-[150px] truncate" title={gradeForCourse.comments}>
                                  "{gradeForCourse.comments}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
