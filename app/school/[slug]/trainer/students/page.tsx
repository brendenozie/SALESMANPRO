"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon, HomeIcon,
  BookOpenIcon,
  CogIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
  Bars3BottomLeftIcon, MagnifyingGlassCircleIcon,
  AcademicCapIcon,
  ChartBarIcon} from "@heroicons/react/24/outline";

const studentsData = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", course: "DIT 502 ECOMMERCE", progress: 85 },
  { id: 2, name: "Bob Smith", email: "bob@example.com", course: "DIT 506 DESKTOP PHOTOGRAPHY", progress: 78 },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", course: "DIT 304 COMPUTER PRINCIPLES", progress: 92 },
  { id: 4, name: "David Lee", email: "david@example.com", course: "DIT 501 FUNDAMENTAL ORGANIZATION", progress: 70 },
  { id: 5, name: "Emma Wilson", email: "emma@example.com", course: "DIT 502 ECOMMERCE", progress: 88 },
];

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState<any>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [students, setStudents] = useState(studentsData);
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const today = new Date().getDate();

  const markAttendance = (day:any) => {
    setAttendance((prev:any) => ({
      ...prev,
      [day]: prev[day] === "present" ? "absent" : "present",
    }));
  };

  return (
      <div className={`${darkMode ? "dark" : ""}`}>
          <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-black transition-all duration-500">
            
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-md z-10 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
    
            <div className="hidden lg:flex w-64 bg-white dark:bg-gray-900 shadow-xl z-20 flex-col p-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">📚 Lecturer Portal</h2>
                <button className="lg:hidden text-gray-600 dark:text-white" onClick={() => setIsSidebarOpen(false)}>
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-4">
                {[{ name: "Dashboard", icon: HomeIcon },
                  { name: "Courses", icon: BookOpenIcon },
                  { name: "Students", icon: AcademicCapIcon },
                  { name: "Reports", icon: ChartBarIcon },
                  { name: "Settings", icon: CogIcon }].map(({ name, icon: Icon }) => (
                  <motion.a
                    key={name}
                    href={`/lecturer/${name.toLowerCase()}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 px-5 py-4 rounded-xl text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 hover:bg-indigo-500 hover:text-white transition-all shadow-md"
                  >
                    <Icon className="w-5 h-5" />
                    {name}
                  </motion.a>
                ))}
              </nav>
            </div>
    
            <div className="flex-1 flex flex-col">
              <header className="flex justify-between items-center p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg ">
                <button className="lg:hidden text-gray-600 dark:text-white" onClick={() => setIsSidebarOpen(true)}>
                  <Bars3BottomLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Welcome Back, Professor 👨‍🏫
                  </h1>
                <div className="flex items-center gap-4">
                  <button className="text-gray-600 dark:text-white hover:text-indigo-500 transition" onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                  </button>
                  <motion.button whileTap={{ scale: 0.8 }} className="relative text-gray-600 dark:text-white hover:text-indigo-500 transition">
                    <BellIcon className="w-6 h-6" />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  </motion.button>
                  <button className="text-gray-600 dark:text-white hover:text-indigo-500 transition">
                    <UserCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </header>
    
              <main className="p-8">
                 <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-3xl font-bold text-gray-900 mb-6 flex items-center"
      >
        <UserCircleIcon className="w-8 h-8 text-blue-500 mr-2" /> Your Students
      </motion.h1>
      <div className="w-full max-w-4xl mb-6 flex items-center bg-white p-4 rounded-lg shadow-md">
        <MagnifyingGlassCircleIcon className="w-6 h-6 text-gray-500 mr-3" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full focus:outline-none text-gray-700"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {filteredStudents.map((student) => (
          <motion.div
            key={student.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white shadow-xl p-6 rounded-xl flex flex-col items-start space-y-4 transition-all"
          >
            <div className="flex justify-between items-center w-full">
              <h2 className="text-xl font-semibold text-gray-800">{student.name}</h2>
            </div>
            <p className="text-gray-600">Email: {student.email}</p>
            <p className="text-gray-600">Course: {student.course}</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full"
                style={{ width: `${student.progress}%` }}
              ></div>
            </div>
            <p className="text-gray-700 text-sm">Attendance: {student.progress}%</p>
          </motion.div>
        ))}
      </div>
    </div>
              </main>
            </div>
          </div>
        </div>
    
  );
}
