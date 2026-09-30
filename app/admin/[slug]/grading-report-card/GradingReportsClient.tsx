"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  AcademicCapIcon, 
  DocumentCheckIcon, 
  PrinterIcon,
  CheckBadgeIcon,
  TrophyIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

// --- INTERFACES[cite: 2] ---
interface ClassroomOption {
  id: string;
  name: string;
}

interface TermOption {
  id: string;
  name: string;
}

interface SubjectGrade {
  courseId: string;
  courseName: string;
  assignments: number;
  exams: number;
  averageScore: number;
  letterGrade: string;
  teacherComment?: string;
}

interface ReportCardItem {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    currentClass?: string;
  };
  term: { id: string; name: string; year: string };
  subjects: SubjectGrade[];
  overallAverage: number;
  overallLetterGrade: string;
  totalAbsences: number;
  classRank: number | null;
  principalComment?: string;
  generatedAt: string | Date;
}

interface GradingReportsClientProps {
  companyId: string;
  slug: string;
  initialClassrooms: ClassroomOption[];
  initialTerms: TermOption[];
}

export default function GradingReportsClient({
  companyId,
  slug,
  initialClassrooms = [],
  initialTerms = [],
}: GradingReportsClientProps) {
  // --- STATE & DATA FETCHING[cite: 2] ---
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(
    initialClassrooms[0]?.id || ""
  );
  const [selectedTermId, setSelectedTermId] = useState<string>(
    initialTerms[0]?.id || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportCards, setReportCards] = useState<ReportCardItem[]>([]);
  const [selectedReportCard, setSelectedReportCard] = useState<ReportCardItem | null>(null);

  const fetchReportCards = useCallback(async () => {
    if (!selectedClassroomId || !selectedTermId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/report-card/bulk?classroomId=${encodeURIComponent(
          selectedClassroomId
        )}&termId=${encodeURIComponent(selectedTermId)}&companyId=${encodeURIComponent(
          companyId
        )}`
      );
      if (res.ok) {
        const json = await res.json();
        const cards: ReportCardItem[] = json.data?.reportCards || [];
        setReportCards(cards);
      } else {
        setReportCards([]);
      }
    } catch (err) {
      console.error("Failed to fetch report cards:", err);
      setReportCards([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClassroomId, selectedTermId, companyId]);

  useEffect(() => {
    fetchReportCards();
  }, [fetchReportCards]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return reportCards;
    const term = searchTerm.toLowerCase();
    return reportCards.filter((rc) => {
      const fullName = `${rc.student.firstName} ${rc.student.lastName}`.toLowerCase();
      const adm = (rc.student.admissionNumber || "").toLowerCase();
      return fullName.includes(term) || adm.includes(term);
    });
  }, [reportCards, searchTerm]);

  const stats = useMemo(() => {
    if (reportCards.length === 0) {
      return { classAverage: 0, progress: 0, topPerformer: null };
    }
    const totalScore = reportCards.reduce((acc, curr) => acc + curr.overallAverage, 0);
    const avg = Math.round((totalScore / reportCards.length) * 10) / 10;
    const completed = reportCards.filter((rc) => rc.subjects.length > 0).length;
    const progressPct = Math.round((completed / reportCards.length) * 100);
    const top = [...reportCards].sort((a, b) => b.overallAverage - a.overallAverage)[0] || null;

    return {
      classAverage: avg,
      progress: progressPct,
      topPerformer: top,
    };
  }, [reportCards]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-4 sm:p-6 lg:p-10 font-sans transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 lg:mb-12 print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-purple-600 dark:bg-purple-500 rounded-full" />
              <span className="text-purple-700 dark:text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Academic Certification</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-500">Center.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Live computed academic report cards and transcripts.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {initialTerms.length > 0 && (
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="flex-1 lg:flex-none min-w-[140px] px-4 py-3 lg:py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm lg:text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-sm"
              >
                {initialTerms.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}

            <button
              onClick={handlePrint}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 lg:py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-sm lg:text-xs shadow-sm"
            >
              <PrinterIcon className="h-5 w-5 lg:h-4 lg:w-4" /> <span className="hidden sm:inline">Print Overview</span>
            </button>
            <button
              onClick={() => {
                if (reportCards.length > 0) setSelectedReportCard(reportCards[0]);
              }}
              disabled={reportCards.length === 0}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 lg:py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm lg:text-xs transition-all shadow-md shadow-purple-600/20 dark:shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckBadgeIcon className="h-5 w-5 lg:h-4 lg:w-4 stroke-[2.5px]" /> <span className="hidden sm:inline">View Transcript</span>
            </button>
          </div>
        </header>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-10 print:hidden">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-3xl relative overflow-hidden group shadow-sm dark:shadow-none hover:shadow-md transition-shadow">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Class Average</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.classAverage > 0 ? `${stats.classAverage}%` : "--"}
            </h3>
            <p className="mt-4 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">
              Based on {reportCards.length} records
            </p>
            <AcademicCapIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-slate-50 dark:text-white/5 group-hover:text-purple-100 dark:group-hover:text-purple-500/10 transition-colors" />
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-3xl shadow-sm dark:shadow-none">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Grading Progress</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.progress}%</h3>
            <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-700 ease-out"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-3xl shadow-sm dark:shadow-none">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Top Performer</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 italic truncate">
              {stats.topPerformer
                ? `${stats.topPerformer.student.firstName} ${stats.topPerformer.student.lastName}`
                : "No data"}
            </h3>
            <p className="mt-4 text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest">
              {stats.topPerformer ? `${stats.topPerformer.overallAverage}% (${stats.topPerformer.overallLetterGrade})` : "Pending grades"}
            </p>
          </div>
        </div>

        {/* Student Grading Datagrid */}
        <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-3xl lg:rounded-[3rem] overflow-hidden shadow-xl dark:shadow-none">
          
          {/* Controls Bar */}
          <div className="p-4 lg:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 print:hidden">
            
            {/* Scrollable Classroom Pills */}
            <div className="flex gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black/40 overflow-x-auto w-full md:w-auto pb-2 md:pb-1.5 scrollbar-hide">
              {initialClassrooms.length === 0 ? (
                <span className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">No classrooms configured</span>
              ) : (
                initialClassrooms.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClassroomId(c.id)}
                    className={`px-4 py-2 md:py-1.5 rounded-lg text-xs md:text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                      selectedClassroomId === c.id
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {c.name}
                  </button>
                ))
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <MagnifyingGlassIcon className="h-5 w-5 md:h-4 md:w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student by name..."
                className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl py-3 md:py-2 pl-12 pr-4 text-sm md:text-xs text-slate-900 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm dark:shadow-none"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-500 tracking-widest border-b border-slate-200 dark:border-slate-800/50 bg-white dark:bg-transparent">
                  <th className="p-4 lg:p-6">Student Detail</th>
                  <th className="p-4 lg:p-6">Overall Score</th>
                  <th className="p-4 lg:p-6">Letter Grade</th>
                  <th className="p-4 lg:p-6">Class Rank</th>
                  <th className="p-4 lg:p-6">Absences</th>
                  <th className="p-4 lg:p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-transparent">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 text-sm">
                      <div className="animate-pulse">Syncing authoritative records...</div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 text-sm">
                      {initialClassrooms.length === 0
                        ? "Please configure classrooms to view report cards."
                        : "No students or grade records found for this class and term."}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu) => (
                    <tr key={stu.student.id} className="group hover:bg-slate-50 dark:hover:bg-purple-500/[0.02] transition-colors">
                      <td className="p-4 lg:p-6">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="h-10 w-10 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs uppercase border border-slate-200 dark:border-transparent">
                            {stu.student.firstName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                              {stu.student.firstName} {stu.student.lastName}
                            </p>
                            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-500 mt-0.5 truncate">
                              {stu.student.admissionNumber || stu.student.id.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 lg:p-6">
                        <p className="text-sm font-black text-slate-900 dark:text-white italic">{stu.overallAverage}%</p>
                      </td>
                      <td className="p-4 lg:p-6">
                        <span className={`px-2.5 py-1.5 rounded-lg text-xs font-black uppercase border ${
                          stu.overallLetterGrade.startsWith('A')
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                            : stu.overallLetterGrade.startsWith('B')
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                        }`}>
                          {stu.overallLetterGrade}
                        </span>
                      </td>
                      <td className="p-4 lg:p-6">
                        <div className="flex items-center gap-2">
                          <TrophyIcon
                            className={`h-5 w-5 lg:h-4 lg:w-4 ${
                              stu.classRank && stu.classRank <= 3 ? "text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-slate-600"
                            }`}
                          />
                          <span className="text-sm lg:text-xs font-bold text-slate-700 dark:text-slate-300">
                            {stu.classRank ? `#${stu.classRank}` : "--"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 lg:p-6 text-sm lg:text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {stu.totalAbsences} days
                      </td>
                      <td className="p-4 lg:p-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedReportCard(stu)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-purple-600 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl text-xs font-bold uppercase transition-all shadow-sm"
                            title="Preview transcript modal"
                          >
                            <DocumentCheckIcon className="h-4 w-4" /> <span className="hidden sm:inline">View</span>
                          </button>

                          <a
                            href={`/api/documents/student-report/${stu.student.id}:${stu.term.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold transition-all shadow-sm"
                            title="Generate Official Vector PDF Report Card"
                          >
                            <PrinterIcon className="h-4 w-4" />
                          </a>

                          <a
                            href={`/api/documents/student-report/${stu.student.id}:${stu.term.id}/pdf?download=true`}
                            className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm"
                            title="Download Report Card PDF"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL REPORT CARD MODAL[cite: 2] */}
      {selectedReportCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto print:bg-white print:p-0 print:block">
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-3xl rounded-[2rem] p-6 sm:p-8 shadow-2xl my-8 border border-slate-100 dark:border-slate-800 print:border-none print:shadow-none print:m-0 print:p-0 print:max-w-none">
            
            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 gap-4 print:hidden">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Official Report Card Transcript
              </span>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <a
                  href={`/api/documents/student-report/${selectedReportCard.student.id}:${selectedReportCard.term.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none justify-center px-4 py-3 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all"
                >
                  <PrinterIcon className="h-4 w-4" /> Print / View PDF
                </a>
                <a
                  href={`/api/documents/student-report/${selectedReportCard.student.id}:${selectedReportCard.term.id}/pdf?download=true`}
                  className="flex-1 sm:flex-none justify-center px-4 py-3 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" /> Download PDF
                </a>
                <button
                  onClick={() => setSelectedReportCard(null)}
                  className="p-3 sm:p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="py-6 space-y-6 print:text-black">
              
              {/* Header */}
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-6 print:border-black">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase print:text-black">
                  Academic Progress Report Card
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2 print:text-gray-800">
                  {selectedReportCard.term.name} • {selectedReportCard.term.year}
                </p>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl text-sm sm:text-xs print:bg-transparent print:border print:border-black print:p-2">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 uppercase font-bold block text-[10px] print:text-gray-600">Student Name</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200 print:text-black">
                    {selectedReportCard.student.firstName} {selectedReportCard.student.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 uppercase font-bold block text-[10px] print:text-gray-600">Admission No.</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-200 print:text-black">
                    {selectedReportCard.student.admissionNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 uppercase font-bold block text-[10px] print:text-gray-600">Classroom</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200 print:text-black">
                    {selectedReportCard.student.currentClass || "Primary"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 uppercase font-bold block text-[10px] print:text-gray-600">Class Rank</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 print:text-black">
                    {selectedReportCard.classRank ? `#${selectedReportCard.classRank}` : "--"}
                  </span>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm sm:text-xs print:text-[11px] min-w-[500px]">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] print:border-black print:text-black">
                      <th className="py-3 px-2">Subject</th>
                      <th className="py-3 text-center">Assignments</th>
                      <th className="py-3 text-center">Exams</th>
                      <th className="py-3 text-center">Score</th>
                      <th className="py-3 text-center">Grade</th>
                      <th className="py-3 px-2">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-black">
                    {selectedReportCard.subjects.map((sub, idx) => (
                      <tr key={idx} className="py-3 print:border-b print:border-gray-300">
                        <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-200 print:text-black">{sub.courseName}</td>
                        <td className="py-3 text-center font-mono text-slate-600 dark:text-slate-400 print:text-black">{sub.assignments}</td>
                        <td className="py-3 text-center font-mono text-slate-600 dark:text-slate-400 print:text-black">{sub.exams}</td>
                        <td className="py-3 text-center font-mono font-bold text-slate-900 dark:text-white print:text-black">{sub.averageScore}%</td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-1 sm:py-0.5 rounded font-black text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 print:bg-transparent print:border print:border-black print:text-black">
                            {sub.letterGrade}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-600 dark:text-slate-400 italic print:text-black">
                          {sub.teacherComment || "Satisfactory academic progress."}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Bar */}
              <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4 text-sm sm:text-xs font-bold text-indigo-900 dark:text-indigo-200 print:bg-transparent print:border-black print:text-black">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-indigo-700/70 dark:text-indigo-300/70 print:text-black">Overall Average:</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 print:text-black">{selectedReportCard.overallAverage}%</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-indigo-700/70 dark:text-indigo-300/70 print:text-black">Overall Grade:</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 print:text-black">{selectedReportCard.overallLetterGrade}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-indigo-700/70 dark:text-indigo-300/70 print:text-black">Recorded Absences:</span>
                  <span className="text-base text-slate-700 dark:text-slate-300 print:text-black">{selectedReportCard.totalAbsences} days</span>
                </div>
              </div>

              {/* Comments & Signatures */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm sm:text-xs print:border-black print:text-black">
                <div>
                  <h4 className="font-bold uppercase text-[10px] text-slate-400 dark:text-slate-500 mb-2 print:text-gray-600">Principal's Remarks</h4>
                  <p className="text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl print:bg-transparent print:p-0">
                    {selectedReportCard.principalComment ||
                      "Good academic effort displayed this term. Commended for participation."}
                  </p>
                </div>
                <div className="flex flex-col justify-end items-start md:items-end md:pr-4 pt-8 md:pt-0">
                  <div className="w-full sm:w-56 border-b border-slate-300 dark:border-slate-600 print:border-black pb-1 text-center">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold print:text-gray-600">Principal Signature & Stamp</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}