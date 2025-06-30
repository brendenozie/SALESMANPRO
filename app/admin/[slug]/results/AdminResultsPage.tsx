'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarDaysIcon, // For date
  ChartBarIcon, // Main icon for results/grades
  UsersIcon, // For student count
  AcademicCapIcon, // For grade levels/overall academic
  CloudArrowUpIcon, // For publish
  CloudArrowDownIcon, // For unpublish
  EyeIcon, // For view details/report
  MagnifyingGlassIcon, // For search
  BookOpenIcon, // For class context
} from '@heroicons/react/24/outline';

// Sample Data
const allStudentsForAdmin = [
  { id: 'S001', name: 'Alice Smith', gradeLevel: '7', className: 'Grade 7 Mathematics' },
  { id: 'S002', name: 'Kevin Otieno', gradeLevel: '8', className: 'Grade 8 English Language' },
  { id: 'S003', name: 'Sarah Kimani', gradeLevel: '9', className: 'Grade 9 Algebra' },
  { id: 'S004', name: 'Michael Njoroge', gradeLevel: '8', className: 'Grade 8 English Language' },
  { id: 'S005', name: 'Fatuma Hassan', gradeLevel: '7', className: 'Grade 7 Mathematics' },
  { id: 'S010', name: 'John Doe', gradeLevel: '8', className: 'Grade 8 English Language' },
  { id: 'S011', name: 'George Kinyanjui', gradeLevel: '7', className: 'Grade 7 Mathematics' },
  { id: 'S012', name: 'Hannah Wambui', gradeLevel: '7', className: 'Grade 7 Mathematics' },
  { id: 'S013', name: 'Isaac Kipchoge', gradeLevel: '7', className: 'Grade 7 Mathematics' },
  { id: 'S014', name: 'Naomi Chebet', gradeLevel: '8', className: 'Grade 8 English Language' },
  { id: 'S015', name: 'Paul Omondi', gradeLevel: '8', className: 'Grade 8 English Language' },
  { id: 'S016', name: 'Quentin Onyango', gradeLevel: '9', className: 'Grade 9 Algebra' },
  // Adding more students for diverse data
  { id: 'S017', name: 'Rachael Moraa', gradeLevel: '9', className: 'Grade 9 Algebra' },
  { id: 'S018', name: 'Steve Mwangangi', gradeLevel: '7', className: 'Grade 7 Mathematics' },
  { id: 'S019', name: 'Tina Nyokabi', gradeLevel: '8', className: 'Grade 8 English Language' },
];

const sampleStudentOverallPerformance = [
  { studentId: 'S001', overallAverage: 91.5, gpa: 3.8, resultsStatus: 'Published' },
  { studentId: 'S002', overallAverage: 88.0, gpa: 3.5, resultsStatus: 'Published' },
  { studentId: 'S003', overallAverage: 95.0, gpa: 4.0, resultsStatus: 'Published' },
  { studentId: 'S004', overallAverage: 83.5, gpa: 3.2, resultsStatus: 'Draft' }, // Unpublished example
  { studentId: 'S005', overallAverage: 79.0, gpa: 2.8, resultsStatus: 'Published' },
  { studentId: 'S010', overallAverage: 81.2, gpa: 3.0, resultsStatus: 'Published' },
  { studentId: 'S011', overallAverage: 75.8, gpa: 2.5, resultsStatus: 'Draft' },
  { studentId: 'S012', overallAverage: 90.1, gpa: 3.7, resultsStatus: 'Published' },
  { studentId: 'S013', overallAverage: 65.0, gpa: 2.0, resultsStatus: 'Published' },
  { studentId: 'S014', overallAverage: 87.3, gpa: 3.4, resultsStatus: 'Published' },
  { studentId: 'S015', overallAverage: 89.2, gpa: 3.6, resultsStatus: 'Published' },
  { studentId: 'S016', overallAverage: 92.8, gpa: 3.9, resultsStatus: 'Published' },
  { studentId: 'S017', overallAverage: 80.5, gpa: 3.1, resultsStatus: 'Draft' },
  { studentId: 'S018', overallAverage: 70.0, gpa: 2.3, resultsStatus: 'Published' },
  { studentId: 'S019', overallAverage: 85.0, gpa: 3.3, resultsStatus: 'Published' },
];

export default function AdminResultsPage() {
  const [studentResults, setStudentResults] = useState(sampleStudentOverallPerformance);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGradeLevel, setFilterGradeLevel] = useState('All');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Enhance student results with student demographic/class info
  const enhancedStudentResults = useMemo(() => {
    return studentResults.map(result => {
      const studentInfo = allStudentsForAdmin.find(s => s.id === result.studentId);
      return {
        ...result,
        studentName: studentInfo ? studentInfo.name : 'Unknown Student',
        gradeLevel: studentInfo ? studentInfo.gradeLevel : 'N/A',
        className: studentInfo ? studentInfo.className : 'N/A', // Using primary class for simplicity
      };
    }).sort((a, b) => a.studentName.localeCompare(b.studentName)); // Sort alphabetically
  }, [studentResults]);

  const uniqueGradeLevels = useMemo(() => Array.from(new Set(allStudentsForAdmin.map(s => s.gradeLevel))).sort(), []);

  const uniqueClasses = useMemo(() => Array.from(new Set(allStudentsForAdmin.map(s => s.className))).sort(), []);

  const uniqueStatuses = useMemo(() => Array.from(new Set(enhancedStudentResults.map(r => r.resultsStatus))).sort(), [enhancedStudentResults]);

  const filteredResults = enhancedStudentResults.filter(result => {
    const matchesSearch = result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          result.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGradeLevel = filterGradeLevel === 'All' || result.gradeLevel === filterGradeLevel;
    const matchesClass = filterClass === 'All' || result.className === filterClass;
    const matchesStatus = filterStatus === 'All' || result.resultsStatus === filterStatus;
    return matchesSearch && matchesGradeLevel && matchesClass && matchesStatus;
  });

  // Calculate overview stats
  const totalStudentsWithResults = enhancedStudentResults.length;
  const publishedResultsCount = enhancedStudentResults.filter(r => r.resultsStatus === 'Published').length;
  const unpublishedResultsCount = enhancedStudentResults.filter(r => r.resultsStatus === 'Draft').length;

  const totalGpaPoints = enhancedStudentResults.reduce((sum, r) => sum + (r.gpa || 0), 0);
  const overallSchoolGpa = totalStudentsWithResults > 0 ? (totalGpaPoints / totalStudentsWithResults).toFixed(2) : 'N/A';
  const totalAverageScores = enhancedStudentResults.reduce((sum, r) => sum + (r.overallAverage || 0), 0);
  const overallSchoolAverage = totalStudentsWithResults > 0 ? (totalAverageScores / totalStudentsWithResults).toFixed(1) + '%' : 'N/A';


  // Helper for status badge colors
  const getResultsStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage === null || isNaN(percentage)) return 'bg-gray-100 text-gray-800';
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Event handlers
  const togglePublishStatus = (studentId: string, currentStatus: string) => {
    setStudentResults(prev => prev.map(result =>
      result.studentId === studentId ? { ...result, resultsStatus: currentStatus === 'Published' ? 'Draft' : 'Published' } : result
    ));
    alert(`Results for student ${studentId} ${currentStatus === 'Published' ? 'unpublished' : 'published'}.`);
  };

  const handleGenerateReport = (studentId: string) => {
    alert(`Generating academic report for student ID: ${studentId}`);
    // In a real app, this would trigger a report generation service
  };

  const handleBulkPublish = () => {
    if (confirm("Are you sure you want to PUBLISH all UNPUBLISHED results?")) {
      setStudentResults(prev => prev.map(result =>
        result.resultsStatus === 'Draft' ? { ...result, resultsStatus: 'Published' } : result
      ));
      alert("All unpublished results have been published!");
    }
  };

  const handleBulkUnpublish = () => {
    if (confirm("Are you sure you want to UNPUBLISH all PUBLISHED results? This will hide them from students.")) {
      setStudentResults(prev => prev.map(result =>
        result.resultsStatus === 'Published' ? { ...result, resultsStatus: 'Draft' } : result
      ));
      alert("All published results have been unpublished!");
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Results Overview & Management
            <span className="ml-2 text-teal-600 text-base sm:text-xl">📈</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Monitor student academic performance and manage grade publication.</p>
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
              <UsersIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Students with Results</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalStudentsWithResults}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ChartBarIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overall School Average</p>
              <h2 className="text-3xl font-bold text-gray-800">{overallSchoolAverage}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <AcademicCapIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overall School GPA</p>
              <h2 className="text-3xl font-bold text-gray-800">{overallSchoolGpa}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <CloudArrowDownIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Unpublished Results</p>
              <h2 className="text-3xl font-bold text-gray-800">{unpublishedResultsCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Student Results List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-indigo-500" /> Student Results
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleBulkPublish}
              disabled={unpublishedResultsCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm
                         hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CloudArrowUpIcon className="h-5 w-5" /> Publish All Unpublished
            </button>
            <button
              onClick={handleBulkUnpublish}
              disabled={publishedResultsCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm
                         hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CloudArrowDownIcon className="h-5 w-5" /> Unpublish All Published
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterGradeLevel}
              onChange={(e) => setFilterGradeLevel(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Grade Levels</option>
              {uniqueGradeLevels.map(level => (
                <option key={level} value={level}>Grade {level}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
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

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name (ID)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Class</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Average</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPA</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <tr key={result.studentId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.studentName} <span className="text-gray-500 text-xs">({result.studentId})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Grade {result.gradeLevel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.className}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeColor(result.overallAverage)}`}>
                        {result.overallAverage?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeColor(result.gpa * 25)}`}> {/* GPA to approx % for color */}
                        {result.gpa?.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getResultsStatusColor(result.resultsStatus)}`}>
                        {result.resultsStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleGenerateReport(result.studentId)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="Generate Report"
                        >
                          <EyeIcon className="h-4 w-4" /> Report
                        </button>
                        <button
                          onClick={() => togglePublishStatus(result.studentId, result.resultsStatus)}
                          className={`flex items-center ${result.resultsStatus === 'Published' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                          title={result.resultsStatus === 'Published' ? 'Unpublish Results' : 'Publish Results'}
                        >
                          {result.resultsStatus === 'Published' ? <CloudArrowDownIcon className="h-4 w-4" /> : <CloudArrowUpIcon className="h-4 w-4" />}
                          {result.resultsStatus === 'Published' ? 'Unpublish' : 'Publish'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No student results found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
