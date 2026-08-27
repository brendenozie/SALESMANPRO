"use client";

import { useState, useRef } from "react";
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
  Bars3BottomLeftIcon, } from "@heroicons/react/24/outline";

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState<Record<number, "present" | "absent">>({});
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
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

  const startCamera = () => {
    setCameraActive(true);
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 200, 150);
      }
      setCapturedImage(canvasRef.current.toDataURL("image/png"));
      stopCamera();
    }
  };

  const stopCamera = () => {
    setCameraActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
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
        
                  <main className="p-8">
                    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                      <motion.h1 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-3xl font-bold text-gray-900 mb-6"
                      >
                        📅 Student Attendance Tracker
                      </motion.h1>
                      
                      <div className="grid grid-cols-7 gap-4 bg-white shadow-xl p-6 rounded-xl">
                        {days.map((day) => (
                          <motion.div
                            key={day}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-4 w-16 h-16 flex items-center justify-center rounded-xl text-lg font-semibold transition-all cursor-pointer 
                              ${attendance[day] === "present" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"} 
                              ${day === today ? "border-4 border-blue-500" : ""}`}
                            onClick={() => markAttendance(day)}
                          >
                            {day}
                            {attendance[day] === "present" ? (
                              <CheckCircleIcon className="w-5 h-5 text-white ml-1" />
                            ) : (
                              <XCircleIcon className="w-5 h-5 text-red-500 ml-1" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={startCamera} 
                        className="mt-6 bg-indigo-500 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-600 transition"
                      >
                        Take Photo
                      </button>
                      
                      {cameraActive && (
                        <div className="mt-4 flex flex-col items-center">
                          <video ref={videoRef} autoPlay className="w-64 h-48 rounded-lg shadow" />
                          <button 
                            onClick={capturePhoto} 
                            className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                          >
                            Capture Photo
                          </button>
                        </div>
                      )}
                      
                      {capturedImage && (
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold">Captured Photo:</h3>
                          <img src={capturedImage} alt="Attendance" className="w-40 h-30 rounded-lg shadow-lg" />
                        </div>
                      )}
                      
                      <canvas ref={canvasRef} className="hidden" width="200" height="150" />
                    </div>
                  </main>
                </div>
              </div>
            </div>
  );
}
