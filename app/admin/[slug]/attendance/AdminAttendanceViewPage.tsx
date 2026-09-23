"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarDaysIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownCircleIcon,
  AcademicCapIcon,
  BookOpenIcon,
  EyeIcon,
  SparklesIcon,
  CheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

export interface StudentAttendanceItem {
  id: string;
  name: string;
  admissionNumber: string;
  classroomId: string | null;
  classroomName: string;
  academicLevelName: string;
  avatar: string | null;
  attendanceRecordId: string | null;
  status: "PRESENT" | "ABSENT" | "TARDY" | "EXCUSED" | "UNMARKED";
  reason: string;
  updatedAt: string | null;
}

interface Props {
  companyId: string;
  initialDate: string;
  initialClassrooms: Array<{ id: string; name: string }>;
  initialStudents: StudentAttendanceItem[];
  initialStats: {
    total: number;
    present: number;
    absent: number;
    tardy: number;
    excused: number;
    unmarked: number;
    rate: number;
  };
}

export default function AdminAttendanceViewPage({
  companyId,
  initialDate,
  initialClassrooms,
  initialStudents,
  initialStats,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [students, setStudents] = useState<StudentAttendanceItem[]>(initialStudents);
  const [classrooms] = useState(initialClassrooms);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassroomId, setSelectedClassroomId] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDate, setIsLoadingDate] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch data when date changes
  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    setIsLoadingDate(true);
    try {
      const res = await fetch(
        `/api/admin/attendance?companyId=${encodeURIComponent(companyId)}&date=${encodeURIComponent(newDate)}${selectedClassroomId !== "All" ? `&classroomId=${encodeURIComponent(selectedClassroomId)}` : ""}`
      );
      if (res.ok) {
        const json = await res.json();
        if (json.data?.students) {
          setStudents(json.data.students);
          setHasUnsavedChanges(false);
        }
      } else {
        toast.error("Failed to load attendance for selected date");
      }
    } catch (err) {
      toast.error("Error communicating with attendance server");
    } finally {
      setIsLoadingDate(false);
    }
  };

  // Quick mark a single student
  const handleSetStatus = (
    studentId: string,
    newStatus: "PRESENT" | "ABSENT" | "TARDY" | "EXCUSED"
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
    setHasUnsavedChanges(true);
  };

  // Mark all currently visible students as PRESENT
  const handleMarkAllPresent = () => {
    setStudents((prev) =>
      prev.map((s) => {
        if (
          (selectedClassroomId === "All" || s.classroomId === selectedClassroomId) &&
          s.status === "UNMARKED"
        ) {
          return { ...s, status: "PRESENT" };
        }
        return s;
      })
    );
    setHasUnsavedChanges(true);
    toast.success("Unmarked students set to Present!");
  };

  // Save all modified attendance records to database
  const handleSaveAttendance = async () => {
    const toSave = students
      .filter((s) => s.status !== "UNMARKED")
      .map((s) => ({
        studentId: s.id,
        status: s.status,
        reason: s.reason,
        classroomId: s.classroomId,
      }));

    if (toSave.length === 0) {
      toast("No attendance marked to save.", { icon: "ℹ️" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          date: selectedDate,
          records: toSave,
        }),
      });

      if (res.ok) {
        toast.success(`Successfully saved ${toSave.length} attendance records!`);
        setHasUnsavedChanges(false);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to save attendance.");
      }
    } catch (e) {
      toast.error("Network error saving attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass =
        selectedClassroomId === "All" || s.classroomId === selectedClassroomId;
      const matchStatus =
        selectedStatus === "All" || s.status === selectedStatus;
      return matchSearch && matchClass && matchStatus;
    });
  }, [students, searchTerm, selectedClassroomId, selectedStatus]);

  // Dynamic live stats computed from current student state
  const liveStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let tardy = 0;
    let excused = 0;
    let unmarked = 0;

    for (const s of students) {
      if (s.status === "PRESENT") present++;
      else if (s.status === "ABSENT") absent++;
      else if (s.status === "TARDY") tardy++;
      else if (s.status === "EXCUSED") excused++;
      else unmarked++;
    }

    const marked = present + absent + tardy + excused;
    const rate = marked > 0 ? Math.round(((present + tardy) / marked) * 100) : 0;

    return { total: students.length, present, absent, tardy, excused, unmarked, rate };
  }, [students]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "ABSENT":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "TARDY":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "EXCUSED":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
      default:
        return "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-400/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-200 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Daily Operations
              </span>
              {hasUnsavedChanges && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full animate-pulse">
                  Unsaved Changes
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Student Attendance Register
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Record daily classroom roll-call, mark absences, and monitor live attendance rates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <CalendarDaysIcon className="h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleMarkAllPresent}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition shadow-sm flex items-center gap-1.5"
            >
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              Mark All Present
            </button>

            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{liveStats.total}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Present</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{liveStats.present}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">Absent</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{liveStats.absent}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">Tardy</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{liveStats.tardy}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-sky-500 uppercase tracking-wider">Excused</p>
            <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{liveStats.excused}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">Presence Rate</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{liveStats.rate}%</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or admission #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="All">All Classrooms</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="TARDY">Tardy</option>
              <option value="EXCUSED">Excused</option>
              <option value="UNMARKED">Unmarked</option>
            </select>
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {isLoadingDate ? (
            <div className="p-12 text-center text-slate-400">
              <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
              Loading student register...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No students found matching current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Admission #</th>
                    <th className="py-3.5 px-4">Classroom</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Quick Roll-Call Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredStudents.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-xs">
                            {s.avatar ? (
                              <img
                                src={s.avatar}
                                alt={s.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              s.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              {s.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {s.academicLevelName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                        {s.admissionNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {s.classroomName}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                            s.status
                          )}`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleSetStatus(s.id, "PRESENT")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                              s.status === "PRESENT"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            Present
                          </button>

                          <button
                            onClick={() => handleSetStatus(s.id, "ABSENT")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                              s.status === "ABSENT"
                                ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                                : "bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            Absent
                          </button>

                          <button
                            onClick={() => handleSetStatus(s.id, "TARDY")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                              s.status === "TARDY"
                                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                                : "bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/30 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            Tardy
                          </button>

                          <button
                            onClick={() => handleSetStatus(s.id, "EXCUSED")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                              s.status === "EXCUSED"
                                ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                                : "bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-sky-950/30 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}