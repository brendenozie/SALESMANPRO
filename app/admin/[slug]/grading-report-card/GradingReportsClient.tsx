"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  AcademicCapIcon, 
  DocumentCheckIcon, 
  ArrowDownTrayIcon, 
  PrinterIcon,
  CheckBadgeIcon,
  TrophyIcon,
  StarIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon
} from "@heroicons/react/24/outline";

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

  // Fetch report cards when classroom or term changes
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

  // Filtered list by search
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return reportCards;
    const term = searchTerm.toLowerCase();
    return reportCards.filter((rc) => {
      const fullName = `${rc.student.firstName} ${rc.student.lastName}`.toLowerCase();
      const adm = (rc.student.admissionNumber || "").toLowerCase();
      return fullName.includes(term) || adm.includes(term);
    });
  }, [reportCards, searchTerm]);

  // Calculated overview stats
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
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12 print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-purple-500 rounded-full" />
              <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Academic Certification</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Center.</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Live computed academic report cards and transcripts.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Term Selector */}
            {initialTerms.length > 0 && (
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-purple-500 transition-all"
              >
                {initialTerms.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all font-bold text-xs"
            >
              <PrinterIcon className="h-4 w-4" /> Print Overview
            </button>
            <button
              onClick={() => {
                if (reportCards.length > 0) setSelectedReportCard(reportCards[0]);
              }}
              disabled={reportCards.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-purple-900/40 disabled:opacity-50"
            >
              <CheckBadgeIcon className="h-4 w-4 stroke-[2.5px]" /> View Transcript
            </button>
          </div>
        </header>

        {/* Academic Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 print:hidden">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Class Average Score</p>
            <h3 className="text-3xl font-black text-white mt-1">
              {stats.classAverage > 0 ? `${stats.classAverage}%` : "--"}
            </h3>
            <p className="mt-4 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
              Based on {reportCards.length} student records
            </p>
            <AcademicCapIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-white/5 group-hover:text-purple-500/10 transition-colors" />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grading Progress</p>
            <h3 className="text-3xl font-black text-white mt-1">{stats.progress}%</h3>
            <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-500"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Performer</p>
            <h3 className="text-3xl font-black text-white mt-1 italic truncate">
              {stats.topPerformer
                ? `${stats.topPerformer.student.firstName} ${stats.topPerformer.student.lastName}`
                : "No data"}
            </h3>
            <p className="mt-4 text-[10px] text-purple-400 font-bold uppercase tracking-widest">
              {stats.topPerformer ? `${stats.topPerformer.overallAverage}% (${stats.topPerformer.overallLetterGrade})` : "Pending grades"}
            </p>
          </div>
        </div>

        {/* Student Grading List */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] overflow-hidden">
          {/* Classrooms Filter Bar */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
            <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
              {initialClassrooms.length === 0 ? (
                <span className="px-4 py-1.5 text-xs text-slate-500">No classrooms configured</span>
              ) : (
                initialClassrooms.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClassroomId(c.id)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                      selectedClassroomId === c.id
                        ? "bg-purple-600 text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {c.name}
                  </button>
                ))
              )}
            </div>
            <div className="relative w-full md:w-80">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student by name or admission..."
                className="w-full bg-black/40 border border-slate-800 rounded-xl py-2 pl-12 pr-4 text-xs text-slate-200 outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Student Detail</th>
                  <th className="p-6">Overall Score</th>
                  <th className="p-6">Letter Grade</th>
                  <th className="p-6">Class Rank</th>
                  <th className="p-6">Absences</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 text-sm">
                      Calculating report cards from authoritative records...
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
                    <tr key={stu.student.id} className="group hover:bg-purple-500/[0.02] transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                            {stu.student.firstName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-tight">
                              {stu.student.firstName} {stu.student.lastName}
                            </p>
                            <p className="text-[10px] font-mono text-slate-600 mt-0.5">
                              {stu.student.admissionNumber || stu.student.id.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-sm font-black text-white italic">{stu.overallAverage}%</p>
                      </td>
                      <td className="p-6">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border ${
                          stu.overallLetterGrade.startsWith('A')
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : stu.overallLetterGrade.startsWith('B')
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {stu.overallLetterGrade}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <TrophyIcon
                            className={`h-4 w-4 ${
                              stu.classRank && stu.classRank <= 3 ? "text-amber-400" : "text-slate-600"
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-300">
                            {stu.classRank ? `#${stu.classRank}` : "--"}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-xs text-slate-400 font-mono">
                        {stu.totalAbsences} days
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedReportCard(stu)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-purple-600 text-white rounded-xl text-[10px] font-bold uppercase transition-all shadow-md"
                          >
                            <DocumentCheckIcon className="h-3.5 w-3.5" /> Report Card
                          </button>
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

      {/* INDIVIDUAL REPORT CARD MODAL / PRINTABLE TRANSCRIPT */}
      {selectedReportCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-white text-slate-900 w-full max-w-3xl rounded-3xl p-8 shadow-2xl my-8 print:p-0 print:m-0 print:shadow-none">
            {/* Modal Actions */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Official Report Card Transcript
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all"
                >
                  <PrinterIcon className="h-4 w-4" /> Print
                </button>
                <button
                  onClick={() => setSelectedReportCard(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="py-6 space-y-6">
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-6">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  Academic Progress Report Card
                </h2>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  {selectedReportCard.term.name} • {selectedReportCard.term.year}
                </p>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-bold block text-[10px]">Student Name</span>
                  <span className="font-bold text-slate-800">
                    {selectedReportCard.student.firstName} {selectedReportCard.student.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block text-[10px]">Admission No.</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedReportCard.student.admissionNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block text-[10px]">Classroom</span>
                  <span className="font-bold text-slate-800">
                    {selectedReportCard.student.currentClass || "Primary"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block text-[10px]">Class Rank</span>
                  <span className="font-bold text-indigo-600">
                    {selectedReportCard.classRank ? `#${selectedReportCard.classRank}` : "--"}
                  </span>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3">Subject</th>
                      <th className="py-3 text-center">Assignments</th>
                      <th className="py-3 text-center">Exams</th>
                      <th className="py-3 text-center">Score</th>
                      <th className="py-3 text-center">Grade</th>
                      <th className="py-3">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReportCard.subjects.map((sub, idx) => (
                      <tr key={idx} className="py-3">
                        <td className="py-3 font-bold text-slate-800">{sub.courseName}</td>
                        <td className="py-3 text-center font-mono">{sub.assignments}</td>
                        <td className="py-3 text-center font-mono">{sub.exams}</td>
                        <td className="py-3 text-center font-mono font-bold text-slate-900">{sub.averageScore}%</td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 rounded font-black text-[11px] bg-slate-100 text-slate-800">
                            {sub.letterGrade}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 italic">
                          {sub.teacherComment || "Satisfactory academic progress."}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Bar */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4 text-xs font-bold text-indigo-900">
                <div>
                  <span>Overall Average: </span>
                  <span className="text-lg font-black text-indigo-600">{selectedReportCard.overallAverage}%</span>
                </div>
                <div>
                  <span>Overall Letter Grade: </span>
                  <span className="text-lg font-black text-indigo-600">{selectedReportCard.overallLetterGrade}</span>
                </div>
                <div>
                  <span>Recorded Absences: </span>
                  <span className="text-slate-700">{selectedReportCard.totalAbsences} days</span>
                </div>
              </div>

              {/* Comments & Signatures */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <h4 className="font-bold uppercase text-[10px] text-slate-400 mb-1">Principal's Remarks</h4>
                  <p className="text-slate-700 italic bg-slate-50 p-3 rounded-xl">
                    {selectedReportCard.principalComment ||
                      "Good academic effort displayed this term. Commended for participation."}
                  </p>
                </div>
                <div className="flex flex-col justify-end items-end pr-4">
                  <div className="w-48 border-b border-slate-400 pb-1 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Principal Signature</span>
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