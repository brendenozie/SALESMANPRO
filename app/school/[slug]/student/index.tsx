import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HomeIcon,
  BookOpenIcon,
  CogIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
  Bars3BottomLeftIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";

// Import ApexCharts only on client-side (disable SSR)
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StudentDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const gpaChartOptions = {
    chart: { type: "line" as "line" },
    series: [{ name: "GPA", data: [3.2, 3.4, 3.5, 3.7, 3.9, 4.0] }],
    xaxis: {
      categories: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"],
    },
  };

  const [chartOptions, setChartOptions] = useState<ApexCharts.ApexOptions>();

  useEffect(() => {
    setChartOptions({
      chart: { type: "line" as "line" },
      series: [{ name: "GPA", data: [3.2, 3.4, 3.5, 3.7, 3.9, 4.0] }],
      xaxis: {
        categories: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"],
      },
    });
  }, []);

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
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              🎓 Student Portal
            </h2>
            <button
              className="lg:hidden text-gray-600 dark:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="space-y-4">
            {[
              { name: "Dashboard", icon: HomeIcon },
              { name: "Units", icon: BookOpenIcon },
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
            <button
              className="lg:hidden text-gray-600 dark:text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Bars3BottomLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              Welcome Back 👋
            </h1>
            <div className="flex items-center gap-4">
              <button
                className="text-gray-600 dark:text-white hover:text-indigo-500 transition"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? (
                  <SunIcon className="w-6 h-6" />
                ) : (
                  <MoonIcon className="w-6 h-6" />
                )}
              </button>
              <motion.button
                whileTap={{ scale: 0.8 }}
                className="relative text-gray-600 dark:text-white hover:text-indigo-500 transition"
              >
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </motion.button>
              <button className="text-gray-600 dark:text-white hover:text-indigo-500 transition">
                <UserCircleIcon className="w-6 h-6" />
              </button>
            </div>
          </header>

          <main className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Total Units", value: 5 },
                { label: "Attendance", value: "92%" },
                { label: "Pending Assignments", value: 3 },
                { label: "GPA", value: "3.8" },
                { label: "Tuition Balance", value: "1,200" },
                { label: "Next Class", value: "DIT 504 - TUITION Blk 1 - RM1 - 10:00 AM" },
              ].map(({ label, value }, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-2xl rounded-2xl p-6 transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                  </h3>
                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {value}
                  </p>
                </motion.div>
              ))}
            </div>
            {/* GPA Chart */}
            <div className="p-6 bg-white dark:bg-gray-900 shadow-md rounded-xl mt-8">
              <h3 className="text-lg font-semibold mb-3">GPA Progress</h3>
              {chartOptions && (
                <ApexCharts
                  options={chartOptions}
                  series={chartOptions.series}
                  type="line"
                  height={250}
                />
              )}

              {/* <ApexCharts options={gpaChartOptions} series={gpaChartOptions.series} type="line" height={250} /> */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
