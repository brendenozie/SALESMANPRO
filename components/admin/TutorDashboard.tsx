"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UsersIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  PencilSquareIcon,
  Bars3BottomLeftIcon,
  RocketLaunchIcon,
  ArrowDownCircleIcon,
  CheckCircleIcon,
  MapPinIcon,
  FingerPrintIcon,
  ArrowUpCircleIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

// --- Type Definitions ---

export interface StaffDashboardProps {
  companyId?: string; // Optional if derived from backend
  currentUserId: string;
  data: {
    teacherName: string;
    teacherRole: string;
    teacherStats: { title: string; value: string; color: string }[];
    assignments: { 
      id: string; 
      title: string; 
      class: string; 
      dueDate: string; 
      status: string; 
      color: string 
    }[];
    recentAnnouncements: { 
      id: string; 
      text: string; 
      type: 'warning' | 'info' 
    }[];
    myClasses: { 
      id: string; 
      name: string; 
      students: number; 
      schedule: string 
    }[];
  };
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// --- MAIN COMPONENT ---
export default function StaffDashboard({ companyId, currentUserId, data }: StaffDashboardProps) {
  const router = useRouter();
  console.log("[StaffDashboard] Received data:", data);
  const { teacherName, teacherRole, teacherStats, assignments, recentAnnouncements, myClasses } = data;

  // Attendance & Scanner States
  const [attendanceStatus, setAttendanceStatus] = useState<"NOT_STARTED" | "CLOCKED_IN" | "CLOCKED_OUT">("NOT_STARTED");
  const [lastTime, setLastTime] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "verifying" | "success">("idle");
  const [streamActive, setStreamActive] = useState(false);

  // Quick Actions (Static UI helpers)
  const quickActions = [
    { label: 'Mark Attendance', icon: <UsersIcon className="h-6 w-6" />, href: '#' },
    { label: 'Enter Grades', icon: <PencilSquareIcon className="h-6 w-6" />, href: '#' },
    { label: 'Post Announcement', icon: <MegaphoneIcon className="h-6 w-6" />, href: "#" },
    { label: 'My Calendar', icon: <CalendarDaysIcon className="h-6 w-6" />, href: "#" },
  ];

  // Sync Attendance Status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/attendance/status?userId=${currentUserId}`);
        const result = await res.json();
        if (result.success) {
          setAttendanceStatus(result.data.attendanceStatus);
          setLastTime(result.data.record?.checkInTime || result.data.record?.checkOutTime);
        }
      } catch (err) { console.error("Status Sync Error"); }
    };
    fetchStatus();
  }, [currentUserId]);

  // Camera Logic
  const startCamera = async () => {
    setScanStatus("idle");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 400, height: 400 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) { alert("Camera access denied"); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      setStreamActive(false);
    }
  };

  useEffect(() => {
    if (showScanner) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [showScanner]);

  const handleVerify = async () => {
    setScanStatus("verifying");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        context?.drawImage(videoRef.current, 0, 0, 400, 400);
        const type = attendanceStatus === "NOT_STARTED" ? "IN" : "OUT";

        const res = await fetch("/api/attendance/clock-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            companyId,
            type,
            coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }
          }),
        });

        if (res.ok) {
          setScanStatus("success");
          setTimeout(() => {
            setShowScanner(false);
            window.location.reload();
          }, 2000);
        } else {
          setScanStatus("idle");
          alert("Verification failed.");
        }
      }
    }, () => {
      setScanStatus("idle");
      alert("Location access required.");
    });
  };

  const getStatIcon = (title: string) => {
    if (title.includes('Students')) return <UsersIcon className="h-6 w-6 text-blue-600" />;
    if (title.includes('Assignments')) return <ClipboardDocumentCheckIcon className="h-6 w-6 text-purple-600" />;
    if (title.includes('Classes')) return <ClockIcon className="h-6 w-6 text-yellow-600" />;
    return <AcademicCapIcon className="h-6 w-6 text-indigo-600" />;
  };

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {teacherName} <span className="text-indigo-600">📚</span>
            </h1>
            <p className="text-slate-500 font-medium">{teacherRole} • {todayStr}</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-2 pr-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`p-3 rounded-xl ${attendanceStatus === 'CLOCKED_IN' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
              <ClockIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Status</p>
              <p className="text-sm font-bold text-slate-700">
                {attendanceStatus === "NOT_STARTED" && "Not Clocked In"}
                {attendanceStatus === "CLOCKED_IN" && `Active since ${new Date(lastTime!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                {attendanceStatus === "CLOCKED_OUT" && "Shift Completed"}
              </p>
            </div>
            {attendanceStatus !== "CLOCKED_OUT" && (
              <button 
                onClick={() => setShowScanner(true)}
                className={`ml-4 px-5 py-2.5 rounded-xl font-bold text-white transition-all shadow-md ${
                  attendanceStatus === "CLOCKED_IN" ? "bg-orange-500 hover:bg-orange-600" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {attendanceStatus === "NOT_STARTED" ? "Clock In" : "Clock Out"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          {/* LIVE STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {teacherStats.map((stat, i) => (
              <div key={i} className={`p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md ${stat.color}`}>
                <div className="bg-white/80 w-10 h-10 rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  {getStatIcon(stat.title)}
                </div>
                <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* QUICK ACTIONS */}
          {/* <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-5 text-gray-800 flex items-center gap-2">
              <RocketLaunchIcon className="h-5 w-5 text-red-500" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <a key={idx} href={action.href} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors">
                  <div className="text-indigo-500 mb-2">{action.icon}</div>
                  <span className="text-center text-sm font-medium text-gray-700">{action.label}</span>
                </a>
              ))}
            </div>
          </div> */}

          {/* LIVE ASSIGNMENTS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bars3BottomLeftIcon className="h-5 w-5 text-indigo-500" /> Recent Assignments
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Assignment</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.class} • Due {item.dueDate}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white ${item.color}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {assignments.length === 0 && (
                    <tr><td colSpan={2} className="p-10 text-center text-slate-400">No active assignments found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          {/* ANNOUNCEMENTS */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <MegaphoneIcon className="h-5 w-5 text-orange-500" /> Announcements
            </h3>
            <ul className="space-y-3">
              {recentAnnouncements.map((note) => (
                <li key={note.id} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${note.type === 'warning' ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-400'}`}>
                  <span className="text-sm text-gray-700">{note.text}</span>
                </li>
              ))}
              {recentAnnouncements.length === 0 && <p className="text-xs text-slate-400">No new announcements.</p>}
            </ul>
          </div>

          {/* MY CLASSES */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5 text-teal-500" /> My Courses
            </h3>
            <ul className="space-y-3">
              {myClasses.map((cl) => (
                <li key={cl.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="block font-semibold text-gray-800">{cl.name}</span>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{cl.students} Students</span>
                    <span className="italic">{cl.schedule}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* --- SCANNER MODAL --- */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowScanner(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-8">
            <button onClick={() => setShowScanner(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full">
              <XMarkIcon className="h-5 w-5 text-slate-500" />
            </button>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">Identity Verification</h2>
              <p className="text-slate-500 text-sm">{attendanceStatus === "NOT_STARTED" ? "Clocking In" : "Clocking Out"}</p>
            </div>
            <div className="relative flex justify-center mb-10">
              <div className="relative w-64 h-64 rounded-full p-2 bg-white shadow-xl border-2 border-slate-100 overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-full" />
                <canvas ref={canvasRef} className="hidden" />
                {scanStatus === 'verifying' && (
                   <div className="absolute inset-0 z-10 overflow-hidden">
                    <div className="w-full h-[2px] bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-scan-move" />
                  </div>
                )}
                {scanStatus === 'success' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-50/40 backdrop-blur-sm">
                    <CheckCircleIcon className="w-16 h-16 text-emerald-500" />
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleVerify}
              disabled={scanStatus !== "idle" || !streamActive}
              className="w-full py-5 rounded-3xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 bg-slate-900 text-white disabled:bg-slate-200"
            >
              {scanStatus === "verifying" ? "Authenticating..." : "Confirm Biometrics"}
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scan-move { 0% { transform: translateY(0); } 100% { transform: translateY(256px); } }
        .animate-scan-move { animation: scan-move 2s linear infinite; }
      `}</style>
    </div>
  );
}