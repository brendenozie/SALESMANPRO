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
  Bars3BottomLeftIcon,  } from "@heroicons/react/24/outline";

const coursesData = [
  { id: 1, name: "DIT 506 DESKTOP PHOTOGRAPHY", instructor: "Dr. John Doe", progress: 75 },
  { id: 2, name: "DIT 304 COMPUTER PRINCIPLES", instructor: "Prof. Jane Smith", progress: 60 },
  { id: 3, name: "DIT 501 FUNDAMENTAL ORGANIZATION", instructor: "Dr. Emily White", progress: 90 },
  { id: 4, name: "DIT 502 ECOMMERCE", instructor: "Dr. Mark Brown", progress: 45 },
  // { id: 5, name: "Biology", instructor: "Dr. Sarah Green", progress: 80 },
];

export default function StudentCourses() {
  const [courses, setCourses] = useState(coursesData);
const [attendance, setAttendance] = useState<any>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">🎓 Student Portal</h2>
                <button className="lg:hidden text-gray-600 dark:text-white" onClick={() => setIsSidebarOpen(false)}>
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-4">
                {[
                  { name: "Dashboard", icon: HomeIcon },
                  { name: "Courses", icon: BookOpenIcon },
                  { name: "Attendance", icon: ClipboardDocumentIcon },
                  { name: "Settings", icon: CogIcon },
                ].map(({ name, icon: Icon }) => (
                  <motion.a
                    key={name}
                    href={`/student/${name.toLowerCase()}`}
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
                    Welcome Back 👋
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
                <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-50 to-green-100 p-6">
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-3xl font-bold text-gray-900 mb-6 flex items-center"
                  >
                    <BookOpenIcon className="w-8 h-8 text-green-500 mr-2" /> Your Courses
                  </motion.h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                    {courses.map((course) => (
                      <motion.div
                        key={course.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white shadow-xl p-6 rounded-xl flex flex-col items-start space-y-4 transition-all"
                      >
                        <div className="flex justify-between items-center w-full">
                          <h2 className="text-xl font-semibold text-gray-800">{course.name}</h2>
                          <AcademicCapIcon className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="text-gray-600">Instructor: {course.instructor}</p>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-gray-700 text-sm">Progress: {course.progress}%</p>
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
