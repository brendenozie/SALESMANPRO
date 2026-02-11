"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UsersIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  ClockIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  ChatBubbleBottomCenterTextIcon,
  PencilSquareIcon,
  Bars3BottomLeftIcon,
  RocketLaunchIcon,
  ClipboardDocumentListIcon,
  ArrowDownCircleIcon,
  CheckCircleIcon,
  MapPinIcon,
  FingerPrintIcon,
  ArrowUpCircleIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

// --- Sample Dashboard Data ---
const teacherName = "Alex Johnson";
const teacherRole = "Mathematics Lead • Grade 8";

const teacherStats = [
  { title: 'Total Students', icon: <UsersIcon className="h-6 w-6 text-blue-600" />, value: '180', color: 'bg-blue-50' },
  { title: 'Assignments Due', icon: <ClipboardDocumentCheckIcon className="h-6 w-6 text-purple-600" />, value: '7', color: 'bg-purple-50' },
  { title: 'Unread Messages', icon: <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-green-600" />, value: '4', color: 'bg-green-50' },
  { title: 'Today\'s Classes', icon: <ClockIcon className="h-6 w-6 text-yellow-600" />, value: '3', color: 'bg-yellow-50' },
];

const quickActions = [
  { label: 'Mark Attendance', icon: <UsersIcon className="h-6 w-6" />, href: '#' },
  { label: 'Enter Grades', icon: <PencilSquareIcon className="h-6 w-6" />, href: '#' },
  { label: 'View Class Roster', icon: <BookOpenIcon className="h-6 w-6" />, href: '#' },
  { label: 'Send Message', icon: <PaperAirplaneIcon className="h-6 w-6" />, href: '#' },
  { label: "Create New Assignment", icon: <ClipboardDocumentListIcon className="h-6 w-6" />, href: "#/assignments/new" },
  { label: "View All Students", icon: <UsersIcon className="h-6 w-6" />, href: "#/students/all" },
  { label: "Post Announcement", icon: <MegaphoneIcon className="h-6 w-6" />, href: "#/announcements/new" },
  { label: "My Calendar", icon: <CalendarDaysIcon className="h-6 w-6" />, href: "#/calendar" },
];


const assignments = [
  { id: 1, title: 'Algebra Homework Set 2', class: 'Grade 8 Math', dueDate: 'Today', status: 'Pending Marking', color: 'bg-yellow-500' },
  { id: 2, title: 'Geometry Project Proposal', class: 'Grade 7 Math', dueDate: 'Tomorrow', status: 'Due Soon', color: 'bg-blue-500' },
  { id: 3, title: 'Calculus Quiz 1', class: 'Grade 11 Math', dueDate: 'Yesterday', status: 'Overdue', color: 'bg-red-500' },
  { id: 4, title: 'Statistics Assignment 3', class: 'Grade 9 Math', dueDate: 'July 5', status: 'Assigned', color: 'bg-green-500' },
];

const recentAnnouncements = [
  { id: 1, text: '📢 Parent-Teacher Conference sign-ups are open.', type: 'info' },
  { id: 2, text: '📅 Professional Development session on Friday, 2 PM.', type: 'info' },
  { id: 3, text: '⚠️ Please submit Q2 grades by EOD Tuesday.', type: 'warning' },
];

const studentParentMessages = [
  { id: 1, sender: 'Student: Jane (G7)', message: 'Can you clarify question 5 on the homework?', time: '10:15 AM' },
  { id: 2, sender: 'Parent: Mr. Smith', message: 'Requesting a meeting regarding John\'s progress.', time: 'Yesterday' },
  { id: 3, sender: 'Student: Mark (G8)', message: 'I missed class. What did I miss?', time: '9:00 AM' },
];

const myClasses = [
  { id: 1, name: 'Grade 7 Mathematics', students: 35, schedule: 'Mon, Wed, Fri - 9:00 AM' },
  { id: 2, name: 'Grade 8 Mathematics', students: 30, schedule: 'Tue, Thu - 10:30 AM' },
  { id: 3, name: 'Grade 9 Algebra', students: 28, schedule: 'Mon, Wed - 1:00 PM' },
];

const personalTimetable = [
  { time: '8:00 - 8:45 AM', event: 'Prep Period', location: 'Office' },
  { time: '9:00 - 9:45 AM', event: 'Grade 7 Math', location: 'Room 101' },
  { time: '10:00 - 10:45 AM', event: 'Grade 8 Math', location: 'Room 102' },
  { time: '11:00 - 11:45 AM', event: 'Recess Duty', location: 'Playground' },
  { time: '1:00 - 1:45 PM', event: 'Grade 9 Algebra', location: 'Room 103' },
];


// --- Type Definitions for Props ---
export type PrincipalStat = {
  title: string;
  value: string;
  description: string;
  color: string; // Tailwind bg-color class
};

export type QuickAction = {
  label: string;
  href: string;
};

export type Announcement = {
  id: number;
  text: string;
  type: 'info' | 'warning';
};

export type RecentStaffMessage = {
  id: string;
  name: string;
  message: string;
  time: string;
};

export type PerformanceOverviewData = {
  series: { name: string; data: number[] }[];
  categories: string[];
};

export type AttendanceInsightsData = {
  series: number[];
  labels: string[];
};

export interface PrincipalDashboardData {
  principalStats: PrincipalStat[];
  quickActions: QuickAction[];
  announcements: Announcement[];
  recentStaffMessages: RecentStaffMessage[];
  performanceOverviewData: PerformanceOverviewData;
  attendanceInsightsData: AttendanceInsightsData;
}

export type TutorDashboardData = {
  tutorStats: { title: string; value: string; description: string; color: string }[];
  coursesTaught: { id: string; title: string; totalStudents: number }[];
  recentSubmissions: { studentName: string; assignment: string; status: string; submissionDate: string }[];
  pendingGrading: { id: string; assignment: string; student: string }[];
  // Add other tutor-specific data fields as needed
};

interface PrincipalDashboardProps extends TutorDashboardData {
  companyId: string; // Pass companyId for dynamic links
  currentUserId: string; // Pass currentUserId for dynamic links
}


// --- Upload Helper ---
export async function uploadFiles(
  apiBaseUrl: string,
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    const res = await fetch(
      `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
    );

    if (!res.ok) throw new Error(`Failed to get signed URL`);
    const { uploadUrl, publicUrl, key, contentType } = await res.json();

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100), file);
      };
      xhr.onload = () => xhr.status === 200 ? resolve() : reject();
      xhr.onerror = () => reject();
      xhr.send(file);
    });

    return { url: publicUrl, key, contentType };
  });

  return Promise.all(uploads);
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";


// --- MAIN COMPONENT ---
export default function StaffDashboard({ companyId, currentUserId }: PrincipalDashboardProps) {
  const router = useRouter();
  
  // Dashboard & Attendance States
  const [attendanceStatus, setAttendanceStatus] = useState<"NOT_STARTED" | "CLOCKED_IN" | "CLOCKED_OUT">("NOT_STARTED");
  const [lastTime, setLastTime] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  
  // Scanner States
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "verifying" | "success">("idle");
  const [streamActive, setStreamActive] = useState(false);

    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
  // 1. Initial Status Check
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/attendance/status?userId=${currentUserId}`);
        const data = await res.json();
        if (data.success) {
          setAttendanceStatus(data.data.attendanceStatus);
          setLastTime(data.data.record?.checkInTime || data.data.record?.checkOutTime);
        }
      } catch (err) { console.error("Status Sync Error"); }
    };
    fetchStatus();
  }, [currentUserId]);

  // 2. Camera Controls
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

  // 3. Handle Verification Logic
  const handleVerify = async () => {
    setScanStatus("verifying");
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        context?.drawImage(videoRef.current, 0, 0, 400, 400);
        const imageData = canvasRef.current.toDataURL("image/jpeg");

        const type = attendanceStatus === "NOT_STARTED" ? "IN" : "OUT";

        let finalImageUrl = "";
        
        if (imageData) {
          setIsUploading(true);
          try {
            const fileType = imageData.startsWith('data:video/') ? 'video' : 'image';
            const blob = await fetch(imageData).then(res => res.blob());
            const file = new File([blob], `attendance_${Date.now()}.${fileType === 'image' ? 'jpg' : 'mp4'}`, { type: fileType === 'image' ? 'image/jpeg' : 'video/mp4' });
            const [uploadResult] = await uploadFiles(apiBaseUrl, [file], fileType, (p) => setUploadProgress(p));
            
            if (fileType === 'image') finalImageUrl = uploadResult.url;
            
          } catch (err) {
            alert("Upload failed");
            setIsUploading(false);
            return;
          }
          setIsUploading(false);
        }

        const res = await fetch("/api/attendance/clock-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            companyId,
            type,
            imageUrl: finalImageUrl,
            coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }
          }),
        });

        if (res.ok) {
          setScanStatus("success");
          setTimeout(() => {
            setShowScanner(false);
            window.location.reload(); // Refresh to update dashboard state
          }, 2000);
        } else {
          setScanStatus("idle");
          alert("Verification failed. Please try again.");
        }
      }
    }, () => {
      setScanStatus("idle");
      alert("Location access required for clock-in.");
    });
  };

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* --- DASHBOARD HEADER --- */}
      <header className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {teacherName} <span className="text-indigo-600">📚</span>
            </h1>
            <p className="text-slate-500 font-medium">{teacherRole} • {todayStr}</p>
          </div>

          {/* ATTENDANCE QUICK WIDGET */}
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
                className={`ml-4 px-5 py-2.5 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-md ${
                  attendanceStatus === "CLOCKED_IN" ? "bg-orange-500 hover:bg-orange-600" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {attendanceStatus === "NOT_STARTED" ? "Clock In" : "Clock Out"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teacherStats.map((stat, i) => (
              <div key={i} className={`p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md ${stat.color}`}>
                <div className="bg-white/80 w-10 h-10 rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  {stat.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-5 text-gray-800 flex items-center gap-2">
              <RocketLaunchIcon className="h-5 w-5 text-red-500" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <a
                  key={idx}
                  href={action.href}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                  <div className="text-indigo-500 mb-2">{action.icon}</div>
                  <span className="text-center text-sm font-medium">{action.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* ASSIGNMENTS TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Bars3BottomLeftIcon className="h-5 w-5 text-indigo-500" /> Current Assignments
              </h3>
              <button className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Assignment</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.class} • Due {item.dueDate}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.color}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-200">
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          <div className="bg-indigo-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
            <RocketLaunchIcon className="absolute -right-4 -bottom-4 h-32 w-32 text-indigo-800/50 rotate-12" />
            <h4 className="text-xl font-bold mb-2">New Feature!</h4>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">You can now track student progress in real-time using our new analytics module.</p>
            <button className="bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">Explore</button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <MegaphoneIcon className="h-5 w-5 text-orange-500" /> Announcements
             </h3>
             <div className="space-y-4">
                <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-xl">
                  <p className="text-sm font-bold text-orange-900">Final Exams Prep</p>
                  <p className="text-xs text-orange-700 mt-1">Please update your study guides by Friday EOD.</p>
                </div>
             </div>
          </div>

          
          {/* Recent Announcements */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <MegaphoneIcon className="h-5 w-5 text-orange-500" /> Recent Announcements
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {recentAnnouncements.map((note) => (
                <li key={note.id} className={`flex items-start gap-3 p-3 rounded-lg
                                  ${note.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-blue-50 border-l-4 border-blue-400'}`}>
                  <span className="mt-0.5">{note.type === 'warning' ? '⚠️' : '📢'}</span>
                  <span>{note.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Student & Parent Messages */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-lime-600" /> Student & Parent Messages
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {studentParentMessages.map((msg) => (
                <li key={msg.id} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {msg.sender.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-semibold text-gray-800">{msg.sender.split(':')[0]}</span> {/* Display only name */}
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-snug">{msg.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* My Classes */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5 text-teal-500" /> My Classes
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {myClasses.map((cl) => (
                <li key={cl.id} className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-800">{cl.name}</span>
                  <span className="text-xs text-gray-600">Students: {cl.students}</span>
                  <span className="text-xs text-gray-500 mt-1">{cl.schedule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Personal Timetable (Today's Schedule) */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-red-500" /> Today's Timetable
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {personalTimetable.map((slot, idx) => (
                <li key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{slot.time}</span>
                    <span className="text-gray-700 text-sm">{slot.event}</span>
                  </div>
                  <span className="text-xs text-gray-500">{slot.location}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>

      {/* --- BIOMETRIC SCANNER OVERLAY --- */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowScanner(false)} />
          
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-300">
            {/* Modal Close */}
            <button 
              onClick={() => setShowScanner(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-slate-500" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">
                Identity Verification
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-1">
                {attendanceStatus === "NOT_STARTED" ? "Clocking In" : "Clocking Out"} for {todayStr}
              </p>
            </div>

            {/* Video Feed Container */}
            <div className="relative flex justify-center mb-10">
              <div className={`absolute -inset-4 rounded-full blur-2xl transition-all duration-700 ${
                scanStatus === 'success' ? 'bg-emerald-400/20' : 'bg-indigo-400/20'
              } ${scanStatus === 'verifying' ? 'animate-pulse' : ''}`} />
              
              <div className={`relative w-64 h-64 rounded-full p-2 bg-white shadow-xl transition-all duration-500 border-2 ${
                scanStatus === 'success' ? 'border-emerald-500' : 'border-slate-100'
              }`}>
                <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-50">
                  {!streamActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-20">
                      <ArrowDownCircleIcon className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                  )}
                  
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className={`w-full h-full object-cover grayscale-[20%] transition-all duration-700 ${scanStatus === 'success' ? 'scale-110 opacity-50 blur-sm' : 'scale-100'}`}
                  />
                  
                  <canvas ref={canvasRef} width="400" height="400" className="hidden" />

                  {/* Corner Viewfinders */}
                  <div className="absolute inset-10 border-2 border-white/20 rounded-3xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500" />
                  </div>

                  {/* Scan Line */}
                  {scanStatus === 'verifying' && (
                    <div className="absolute inset-0 z-10 overflow-hidden">
                      <div className="w-full h-[2px] bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-scan-move" />
                    </div>
                  )}

                  {/* Success Overlay */}
                  {scanStatus === 'success' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-50/40 backdrop-blur-sm z-30">
                      <CheckCircleIcon className="w-16 h-16 text-emerald-500 animate-bounce" />
                      <span className="mt-2 font-bold text-emerald-700">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Badge */}
              <div className="absolute -bottom-2 bg-white px-4 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2">
                <MapPinIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-black text-slate-700 tracking-widest uppercase">Office Geofence Active</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-4">
              <button
                onClick={handleVerify}
                disabled={scanStatus !== "idle" || !streamActive}
                className={`w-full py-5 rounded-3xl font-bold text-lg transition-all transform active:scale-[0.98] shadow-xl flex items-center justify-center gap-3 ${
                  scanStatus === 'success' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-900 text-white hover:bg-black disabled:bg-slate-200 disabled:text-slate-400'
                }`}
              >
                {scanStatus === "verifying" ? (
                  <>
                    <ArrowDownCircleIcon className="w-6 h-6 animate-spin" />
                    Authenticating...
                  </>
                ) : scanStatus === "success" ? (
                    "Success! Redirecting..."
                ) : (
                  <>
                    <FingerPrintIcon className="w-6 h-6" />
                    Confirm Biometrics
                  </>
                )}
              </button>

              <button 
                onClick={startCamera}
                className="w-full py-2 flex items-center justify-center gap-2 text-slate-400 text-sm font-bold hover:text-indigo-600 transition-colors"
              >
                <ArrowUpCircleIcon className="w-4 h-4" />
                Retry Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Animation Styles */}
      <style jsx global>{`
        @keyframes scan-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(256px); }
        }
        .animate-scan-move {
          animation: scan-move 2s linear infinite;
        }
      `}</style>
    </div>
  );
}