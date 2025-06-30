'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarDaysIcon, // For date
  ClipboardDocumentCheckIcon, // Main icon for exams
  MagnifyingGlassIcon, // For search
  UsersIcon, // For teachers/students count
  BookOpenIcon, // For class icon
  ChartBarIcon, // For results/progress
  ExclamationTriangleIcon, // For upcoming/due soon
  PencilIcon, // For edit
  TrashIcon, // For delete
  PlusCircleIcon, // For add exam
  TrophyIcon, // For average score
  ClockIcon, // For time
  MapPinIcon, // For location
  CheckCircleIcon, // For published results
} from '@heroicons/react/24/outline';

// Sample Data (Simplified and combined for admin view)
const allClassesForAdmin = [
  { id: 'CL101', name: 'Grade 7 Mathematics', teacherId: 'T001', teacherName: 'Mr. John Doe', totalStudents: 35 },
  { id: 'CL102', name: 'Grade 8 English Language', teacherId: 'T002', teacherName: 'Mrs. Jane Smith', totalStudents: 30 },
  { id: 'CL103', name: 'Grade 9 Algebra', teacherId: 'T001', teacherName: 'Mr. John Doe', totalStudents: 28 },
  { id: 'CL104', name: 'Grade 10 Geometry', teacherId: 'T001', teacherName: 'Mr. John Doe', totalStudents: 22 },
  { id: 'CL105', name: 'Grade 8 Science', teacherId: 'T003', teacherName: 'Ms. Emily White', totalStudents: 32 },
  { id: 'CL106', name: 'Grade 11 Physics', teacherId: 'T006', teacherName: 'Dr. Anne Ndugu', totalStudents: 20 },
];

const allSchoolExamsRaw = [
  {
    id: 'EXM001',
    name: 'Mathematics Midterm Exam',
    classId: 'CL103',
    date: '2025-07-07',
    time: '9:00 AM - 10:30 AM',
    location: 'School Hall A',
    notes: 'Covers Chapters 1-5. Bring pencils and calculator.',
    type: 'Midterm', // Midterm, Final, Unit Test, Quiz
    status: 'Upcoming', // Upcoming, Completed
    averageScore: null,
    totalPoints: 100,
    isResultsPublished: false,
  },
  {
    id: 'EXM002',
    name: 'English Essay Final Draft Submission',
    classId: 'CL102',
    date: '2025-07-05',
    time: '4:00 PM',
    location: 'Online Submission',
    notes: 'Submission deadline via LMS.',
    type: 'Essay',
    status: 'Upcoming',
    averageScore: null,
    totalPoints: 50,
    isResultsPublished: false,
  },
  {
    id: 'EXM003',
    name: 'Science Unit 2 Test',
    classId: 'CL105',
    date: '2025-06-25', // Past date
    time: '11:00 AM - 12:00 PM',
    location: 'Lab 2',
    notes: 'Covering cell biology and photosynthesis.',
    type: 'Unit Test',
    status: 'Completed',
    averageScore: 78.5,
    totalPoints: 100,
    isResultsPublished: true,
  },
  {
    id: 'EXM004',
    name: 'History Pop Quiz - WWI',
    classId: 'CL104',
    date: '2025-06-20', // Past date
    time: 'During Class',
    location: 'Room 203',
    notes: 'Short quiz on causes of WWI.',
    type: 'Quiz',
    status: 'Completed',
    averageScore: 92.0,
    totalPoints: 10,
    isResultsPublished: true,
  },
  {
    id: 'EXM005',
    name: 'Physical Education Midterm Practical',
    classId: 'CL101', // Example for Grade 7 Math's PE class
    date: '2025-07-12',
    time: '1:00 PM - 2:00 PM',
    location: 'Gymnasium',
    notes: 'Practical assessment of fitness and skills.',
    type: 'Midterm',
    status: 'Upcoming',
    averageScore: null,
    totalPoints: 100,
    isResultsPublished: false,
  },
  {
    id: 'EXM006',
    name: 'Physics Final Exam',
    classId: 'CL106',
    date: '2025-07-18',
    time: '10:00 AM - 12:00 PM',
    location: 'Lecture Hall 1',
    notes: 'Comprehensive exam covering all topics.',
    type: 'Final',
    status: 'Upcoming',
    averageScore: null,
    totalPoints: 100,
    isResultsPublished: false,
  },
];

export default function AdminExamsOverviewPage() {
  const [exams, setExams] = useState(allSchoolExamsRaw);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterTeacher, setFilterTeacher] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamData | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Enhance exams with class and teacher info
  const enhancedExams = useMemo(() => {
    return exams.map(exam => {
      const classInfo = allClassesForAdmin.find(cls => cls.id === exam.classId);
      return {
        ...exam,
        className: classInfo ? classInfo.name : 'Unknown Class',
        teacherName: classInfo ? classInfo.teacherName : 'Unknown Teacher',
      };
    });
  }, [exams]);

  const uniqueClasses = useMemo(() => Array.from(new Set(allClassesForAdmin.map(cls => JSON.stringify({ id: cls.id, name: cls.name })))).map(str => JSON.parse(str)).sort((a, b) => a.name.localeCompare(b.name)), []);
  
  const uniqueTeachers = useMemo(() => Array.from(new Set(allClassesForAdmin.map(cls => cls.teacherName))).sort(), []);
  
  const uniqueTypes = useMemo(() => Array.from(new Set(enhancedExams.map(e => e.type))).sort(), [enhancedExams]);
  
  const uniqueStatuses = useMemo(() => Array.from(new Set(enhancedExams.map(e => e.status))).sort(), [enhancedExams]);


  const filteredExams = enhancedExams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exam.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exam.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exam.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || exam.classId === filterClass;
    const matchesTeacher = filterTeacher === 'All' || exam.teacherName === filterTeacher;
    const matchesType = filterType === 'All' || exam.type === filterType;
    const matchesStatus = filterStatus === 'All' || exam.status === filterStatus;

    return matchesSearch && matchesClass && matchesTeacher && matchesType && matchesStatus;
  }).sort((a, b) => {
    // Sort upcoming exams first by date (ascending), then completed exams by date (descending)
    if (a.status === 'Upcoming' && b.status !== 'Upcoming') return -1;
    if (a.status !== 'Upcoming' && b.status === 'Upcoming') return 1;
    if (a.status === 'Upcoming' && b.status === 'Upcoming') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });


  // Calculate overview stats
  const totalExams = enhancedExams.length;
  const upcomingExamsCount = enhancedExams.filter(e => e.status === 'Upcoming').length;
  const completedExamsCount = enhancedExams.filter(e => e.status === 'Completed').length;
  const resultsPublishedCount = enhancedExams.filter(e => e.isResultsPublished).length;

  // Calculate overall average score for completed exams where results are published
  const gradedExams = enhancedExams.filter(e => e.status === 'Completed' && e.averageScore !== null && e.totalPoints > 0);
  const overallSchoolExamAverage = useMemo(() => {
    if (gradedExams.length === 0) return 'N/A';
    // Sum of weighted average scores (averageScore is already a percentage for each exam)
    const totalWeightedScore = gradedExams.reduce((sum, exam) => sum + (((exam.averageScore ?? 0) * exam.totalPoints) / 100), 0);
    
    const totalPossiblePoints = gradedExams.reduce((sum, exam) => sum + exam.totalPoints, 0);

    return totalPossiblePoints > 0 ? ((totalWeightedScore / totalPossiblePoints) * 100).toFixed(1) + '%' : 'N/A';
  }, [gradedExams]);


  // Helper for status badge colors
  const getExamStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper for grade color based on average score
  const getGradeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-blue-100 text-blue-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // Event handlers
  type ExamData = {
    id: string;
    name: string;
    classId: string;
    date: string;
    time: string;
    location: string;
    notes: string;
    type: string;
    totalPoints: number;
    status: string;
    averageScore: number | null;
    isResultsPublished: boolean;
  };

  const handleAddNewExam = (newExamData: Omit<ExamData, 'id'>) => {
    const newId = `EXM${String(exams.length + 1).padStart(3, '0')}`; // Simple ID generation
    setExams([...exams, { id: newId, ...newExamData }]);
    setShowFormModal(false);
  };

  const handleEditExam = (updatedExamData: ExamData) => {
    setExams(exams.map(exam => exam.id === updatedExamData.id ? updatedExamData : exam));
    setShowFormModal(false);
    setEditingExam(null);
  };

  const handleDeleteExam = (examId: string) => {
    if (confirm("Are you sure you want to delete this exam? This action cannot be undone.")) { // Use custom modal in real app
      setExams(exams.filter(exam => exam.id !== examId));
    }
  };

  const toggleResultsPublished = (examId: string, currentStatus: boolean) => {
    setExams(prev => prev.map(exam =>
      exam.id === examId ? { ...exam, isResultsPublished: !currentStatus } : exam
    ));
  };


  // --- Exam Form Modal ---
  type ExamFormModalProps = {
    examData: ExamData | null;
    onClose: () => void;
    onSave: (data: ExamData) => void;
    isEdit?: boolean;
  };

  const ExamFormModal: React.FC<ExamFormModalProps> = ({ examData, onClose, onSave, isEdit = false }) => {
    const [formData, setFormData] = useState(
      examData ||
      {
        id: '',
        name: '',
        classId: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        notes: '',
        type: 'Unit Test',
        totalPoints: 100,
        status: 'Upcoming',
        averageScore: null,
        isResultsPublished: false,
      }
    );

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { name, value, type } = e.target;
      if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{isEdit ? `Edit Exam: ${formData.name}` : 'Add New Exam'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Exam Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700">Class</label>
              <select name="classId" id="classId" value={formData.classId} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="">-- Select Class --</option>
                {allClassesForAdmin.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name} ({cls.teacherName})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                <input type="text" name="time" id="time" value={formData.time} onChange={handleChange} placeholder="e.g., 9:00 AM - 10:30 AM"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
              </div>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Exam Type</label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="">-- Select Type --</option>
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
                <option value="Unit Test">Unit Test</option>
                <option value="Quiz">Quiz</option>
                <option value="Practical">Practical</option>
                <option value="Essay">Essay Submission</option>
              </select>
            </div>
            <div>
              <label htmlFor="totalPoints" className="block text-sm font-medium text-gray-700">Total Points</label>
              <input type="number" name="totalPoints" id="totalPoints" value={formData.totalPoints} onChange={handleChange} min="0" required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Instructions for Students)</label>
              <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            {isEdit && (
              <>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" id="status" value={formData.status} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                {formData.status === 'Completed' && (
                  <>
                    <div>
                      <label htmlFor="averageScore" className="block text-sm font-medium text-gray-700">Average Score (%)</label>
                      <input type="number" name="averageScore" id="averageScore" value={formData.averageScore || ''} onChange={handleChange} min="0" max="100" step="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
                    </div>
                    <div className="flex items-center col-span-2">
                      <input type="checkbox" name="isResultsPublished" id="isResultsPublished" checked={formData.isResultsPublished} onChange={handleChange}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                      <label htmlFor="isResultsPublished" className="ml-2 block text-sm font-medium text-gray-700">Publish Results to Students</label>
                    </div>
                  </>
                )}
              </>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {isEdit ? 'Save Changes' : 'Add Exam'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // --- End Modal Component ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Exams Management
            <span className="ml-2 text-teal-600 text-base sm:text-xl">📊</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Oversee and manage all school examinations.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClipboardDocumentCheckIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalExams}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ExclamationTriangleIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Exams</p>
              <h2 className="text-3xl font-bold text-gray-800">{upcomingExamsCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ChartBarIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Exams</p>
              <h2 className="text-3xl font-bold text-gray-800">{completedExamsCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <TrophyIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">School Average</p>
              <h2 className="text-3xl font-bold text-gray-800">{overallSchoolExamAverage}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* All Exams List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-500" /> All School Exams
          </h3>
          <button
            onClick={() => { setEditingExam(null); setShowFormModal(true); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Exam
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by exam name, class, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Teachers</option>
              {uniqueTeachers.map(teacher => (
                <option key={teacher} value={teacher}>{teacher}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Exams Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class (Teacher)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <tr key={exam.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.className} <br />
                      <span className="text-xs text-gray-400">({exam.teacherName})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(exam.date).toLocaleDateString()} <br />
                      <span className="text-xs text-gray-400">({exam.time})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800`}>
                            {exam.type}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.averageScore !== null ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeColor(exam.averageScore)}`}>
                          {exam.averageScore}%
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getExamStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {exam.status === 'Completed' && (
                        <button
                          onClick={() => toggleResultsPublished(exam.id, exam.isResultsPublished)}
                          className={`flex items-center gap-1 text-xs font-medium
                            ${exam.isResultsPublished ? 'text-green-600 hover:text-green-800' : 'text-gray-500 hover:text-gray-700'}`}
                          title={exam.isResultsPublished ? 'Results Published' : 'Publish Results'}
                        >
                          {exam.isResultsPublished ? <CheckCircleIcon className="h-4 w-4" /> : <ClockIcon className="h-4 w-4" />}
                          {exam.isResultsPublished ? 'Published' : 'Unpublished'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingExam(exam); setShowFormModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Exam"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete Exam"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
      {showFormModal && <ExamFormModal examData={editingExam} onClose={() => setShowFormModal(false)} onSave={editingExam ? handleEditExam : (data) => handleAddNewExam(data)} isEdit={!!editingExam} />}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">No exams found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && <ExamFormModal examData={editingExam} onClose={() => setShowFormModal(false)} onSave={editingExam ? handleEditExam : handleAddNewExam} isEdit={!!editingExam} />}
    </div>
  );
}
