import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon, HomeIcon,
  BookOpenIcon,
  CogIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  XMarkIcon,
  Bars3BottomLeftIcon, MagnifyingGlassCircleIcon} from "@heroicons/react/24/outline";
 import dynamic from "next/dynamic";
import AcademicCapIcon from "@heroicons/react/24/solid/AcademicCapIcon";
 
 // Import ApexCharts only on client-side (disable SSR)
 const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

const reportData = [
  { id: 1, title: "Overall Student Performance", value: "85%", color: "bg-blue-500" },
  { id: 2, title: "Assignments Submitted", value: "92%", color: "bg-green-500" },
  { id: 3, title: "Average Attendance", value: "78%", color: "bg-yellow-500" },
  { id: 4, title: "Pending Assignments", value: "12", color: "bg-red-500" },
];

const performanceChartOptions = {
  chart: { type: "line" },
  series: [{ name: "Performance", data: [80, 82, 85, 87, 90, 85, 88] }],
  xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"] },
};

export default function StudentAttendance() {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [chartOptions, setChartOptions] = useState<ApexCharts.ApexOptions>();
  
    useEffect(() => {
      setChartOptions({
        chart: { type: "line" },
        series: [{ name: "Performance", data: [80, 82, 85, 87, 90, 85, 88] }],
        xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"] },
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
                      <ClipboardDocumentIcon className="w-8 h-8 text-blue-500 mr-2" /> Reports & Analytics
                    </motion.h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                      {reportData.map((report) => (
                        <motion.div
                          key={report.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-6 text-white shadow-xl rounded-xl ${report.color} transition-all flex flex-col items-center`}
                        >
                          <h2 className="text-lg font-semibold">{report.title}</h2>
                          <p className="text-3xl font-extrabold mt-2">{report.value}</p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-900 shadow-xl rounded-xl mt-8 w-full max-w-4xl">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <ChartBarIcon className="w-6 h-6 text-blue-500 mr-2" /> Performance Over Time
                      </h3>
                      {chartOptions && (
                        <ApexCharts options={chartOptions} series={chartOptions.series} type="line" height={300} />
                      )}
                      {/* <ApexCharts options={performanceChartOptions} series={performanceChartOptions.series} type="line" height={300} /> */}
                    </div>
                  </div>
              </main>
            </div>
          </div>
        </div>
    
  );
}
