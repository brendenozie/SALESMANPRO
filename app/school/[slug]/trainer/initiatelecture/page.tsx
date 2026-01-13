"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpenIcon, AcademicCapIcon,HomeIcon,
  CogIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
  Bars3BottomLeftIcon,  UserGroupIcon} from "@heroicons/react/24/outline";
import ChartBarIcon from "@heroicons/react/24/solid/ChartBarIcon";


const coursesData = [
  { id: 1, name: "Mathematics", students: 30, assignments: 5 },
  { id: 2, name: "Physics", students: 25, assignments: 3 },
  { id: 3, name: "Computer Science", students: 40, assignments: 8 },
  { id: 4, name: "Chemistry", students: 20, assignments: 4 },
  { id: 5, name: "Biology", students: 35, assignments: 6 },
];

export default function StudentCourses() {
  const [courses, setCourses] = useState(coursesData);
const [attendance, setAttendance] = useState<any>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDescription, setLectureDescription] = useState("http://xzy93ad.com/lecture");
  const [startTime, setStartTime] = useState("");

  const handleStartLecture = () => {
    alert(`Lecture "${lectureTitle}"http://xzy93ad.com/lecture has started!`);
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
    
              <main>
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-lg"
                  >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">
                      Initiate a Lecture
                    </h1>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Lecture Title"
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:border-gray-600"
                      />
                      <input
                        placeholder="http://xzy93ad.com/lecture"
                        value={lectureDescription}
                        onChange={(e) => setLectureDescription(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:border-gray-600"
                      />
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full p-3 rounded-lg border dark:border-gray-600"
                      />
                      <button onClick={handleStartLecture} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg">
                        Start Lecture
                      </button>
                    </div>
                  </motion.div>
                </div>
              </main>
            </div>
          </div>
        </div>
  );
}
