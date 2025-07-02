'use client';

import React from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ChartPieIcon, // For pie/donut chart
  SparklesIcon, // For events
} from '@heroicons/react/24/outline';

// Assuming these are generic chart components you have
// They are passed the relevant data as props
import dynamic from "next/dynamic";

// Dynamic imports for ApexCharts to ensure SSR is false
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

// Import ApexOptions type for chart configuration
import type { ApexOptions } from "apexcharts";

// --- Type Definitions for Props ---
export type OverallStats = {
  totalStudents: string;
  totalTeachers: string;
  totalClasses: string;
  averageAttendance: string;
};

export type StudentPerformanceData = {
  gradeDistribution: { label: string; value: number }[];
  attendanceTrend: { labels: string[]; data: number[] };
  topPerformingGrades: { grade: string; avgGPA: number }[];
  lowPerformingStudents: { name: string; grade: string; gpa: number }[];
};

export type StaffReportsData = {
  teachersByDepartment: { department: string; count: number }[];
  teacherActivity: { labels: string[]; data: number[] };
};

export type AcademicReportsData = {
  classEnrollmentDistribution: { size: string; count: number }[];
  coursePopularity: { course: string; enrollments: number }[];
};

export type UpcomingEventsSummaryItem = {
  type: string;
  count: number;
  nextDate: string | null;
};

interface AdminReportsPageProps {
  overallStats: OverallStats;
  studentPerformanceData: StudentPerformanceData;
  staffReportsData: StaffReportsData;
  academicReportsData: AcademicReportsData;
  upcomingEventsSummary: UpcomingEventsSummaryItem[];
}

// --- Chart Components (Moved directly into this file for self-containment) ---

interface ChartTwoProps {
  seriesData: { name: string; data: number[] }[];
  categories: string[];
  title: string;
}

const ChartTwo: React.FC<ChartTwoProps> = ({ seriesData, categories, title }) => {
  const options: ApexOptions = {
    colors: ["#3C50E0", "#80CAEE", "#FFA70B", "#10B981"], // Added one more color for flexibility
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: false,
      },
      background: "transparent",
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 5,
              columnWidth: "35%",
            },
          },
          legend: {
            fontSize: "12px",
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 10,
        columnWidth: "30%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    grid: {
      strokeDashArray: 5,
      borderColor: "#E5E7EB",
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontFamily: "Satoshi",
      fontWeight: 500,
      fontSize: "14px",
      markers: {
        size: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    fill: {
      opacity: 0.9,
      colors: ["#3C50E0", "#80CAEE", "#FFA70B", "#10B981"],
    },
    tooltip: {
      theme: "light",
      style: {
        fontSize: "12px",
        fontFamily: "Satoshi",
      },
    },
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 p-8 rounded-xl shadow-xl">
      <h4 className="text-2xl font-bold text-gray-900 mb-6">{title}</h4>
      <div className="relative">
        <ApexCharts options={options} series={seriesData} type="bar" height={400} />
      </div>
    </div>
  );
};


interface ChartThreeProps {
  seriesData: number[];
  labels: string[];
  title: string;
}

const ChartThree: React.FC<ChartThreeProps> = ({ seriesData, labels, title }) => {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ["#10B981", "#375E83", "#259AE6", "#FFA70B", "#EF4444", "#8B5CF6"], // More colors for more categories
    labels: labels,
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      labels: {
        colors: "#6B7280",
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      onItemClick: {
        toggleDataSeries: true,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "18px",
              color: "#6B7280",
            },
            value: {
              show: true,
              fontSize: "16px",
              color: "#6B7280",
              formatter: (val) => `${val}`, // Changed to raw value, not percentage
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            width: "100%",
          },
          legend: {
            fontSize: "12px",
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 250,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 p-8 rounded-xl shadow-xl">
      <h4 className="text-2xl font-bold text-gray-900 mb-6">{title}</h4>
      <div className="relative mb-6">
        <ApexCharts options={options} series={seriesData} type="donut" height={320} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {labels.map((label, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-2 transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => { /* handleLegendClick(index) - if needed, implement toggling logic */ }}
          >
            <span
              className="h-4 w-4 rounded-full mb-2"
              style={{ backgroundColor: options.colors?.[index] }}
            ></span>
            <p className="text-sm font-medium text-gray-800">
              {label}
            </p>
            <p className="text-xs text-gray-500">
              {seriesData[index]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};


// --- Main AdminReportsPage Component ---
export default function AdminReportsPage({
  overallStats,
  studentPerformanceData,
  staffReportsData,
  academicReportsData,
  upcomingEventsSummary,
}: AdminReportsPageProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Admin Reports Dashboard
            <span className="ml-2 text-indigo-600 text-base sm:text-xl">📊</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Comprehensive insights for strategic decision-making.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overall School Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <UsersIcon className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <h2 className="text-3xl font-bold text-gray-800">{overallStats.totalStudents}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <BriefcaseIcon className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Teachers</p>
            <h2 className="text-3xl font-bold text-gray-800">{overallStats.totalTeachers}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <AcademicCapIcon className="h-7 w-7 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Classes</p>
            <h2 className="text-3xl font-bold text-gray-800">{overallStats.totalClasses}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <ArrowTrendingUpIcon className="h-7 w-7 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
            <h2 className="text-3xl font-bold text-gray-800">{overallStats.averageAttendance}</h2>
          </div>
        </div>
      </div>

      {/* Student Performance & Attendance Reports */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-blue-500" /> Student Performance & Attendance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Grade Distribution */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Grade Distribution</h4>
            <div className="h-48 flex items-center justify-center text-gray-400">
              <ChartThree
                title="" // Title already in h4
                seriesData={studentPerformanceData.gradeDistribution.map(d => d.value)}
                labels={studentPerformanceData.gradeDistribution.map(d => d.label)}
              />
            </div>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">View All Grades &rarr;</button>
          </div>

          {/* Attendance Trend */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Overall Attendance Trend</h4>
            <div className="h-48 flex items-center justify-center text-gray-400">
              <ApexCharts
                options={{
                  chart: {
                    type: 'line',
                    toolbar: { show: false },
                    zoom: { enabled: false },
                  },
                  colors: ["#3C50E0"],
                  xaxis: {
                    categories: studentPerformanceData.attendanceTrend.labels,
                    labels: { style: { colors: "#6B7280" } },
                  },
                  yaxis: {
                    min: 80,
                    max: 100,
                    labels: { style: { colors: "#6B7280" }, formatter: (val) => `${val}%` },
                  },
                  grid: {
                    strokeDashArray: 5,
                    borderColor: "#E5E7EB",
                  },
                  tooltip: {
                    theme: "light",
                    y: {
                      formatter: (val) => `${val}%`,
                    },
                  },
                  stroke: {
                    curve: 'smooth',
                    width: 3,
                  },
                  dataLabels: {
                    enabled: false,
                  },
                }}
                series={[{ name: "Attendance %", data: studentPerformanceData.attendanceTrend.data }]}
                type="line"
                height={192} // Adjust height to fit container
              />
            </div>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">Full Attendance Report &rarr;</button>
          </div>

          {/* Top Performing Grades */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Top Performing Grade Levels</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {studentPerformanceData.topPerformingGrades.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                  <span>{item.grade}</span>
                  <span className="font-bold text-green-700">{item.avgGPA} GPA</span>
                </li>
              ))}
            </ul>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">Details by Grade &rarr;</button>
          </div>

          {/* Low Performing Students (Mock List) */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Students Needing Support</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {studentPerformanceData.lowPerformingStudents.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm border-l-4 border-red-400">
                  <span>{item.name} (G{item.grade})</span>
                  <span className="font-bold text-red-700">{item.gpa} GPA</span>
                </li>
              ))}
            </ul>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">View All &rarr;</button>
          </div>
        </div>
      </div>

      {/* Staff & Resource Utilization Reports */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BriefcaseIcon className="h-6 w-6 text-green-500" /> Staff & Resource Utilization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Teachers by Department */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Teachers by Department</h4>
            <div className="h-48 flex items-center justify-center text-gray-400">
              <ChartThree
                title=""
                seriesData={staffReportsData.teachersByDepartment.map(d => d.count)}
                labels={staffReportsData.teachersByDepartment.map(d => d.department)}
              />
            </div>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">Full Department Breakdown &rarr;</button>
          </div>

          {/* Teacher Activity Metrics */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Teacher Activity Metrics</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {staffReportsData.teacherActivity.labels.map((label, idx) => (
                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                  <span>{label}</span>
                  <span className="font-bold text-gray-700">{staffReportsData.teacherActivity.data[idx]} items/hrs</span>
                </li>
              ))}
            </ul>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">View Detailed Activity &rarr;</button>
          </div>
        </div>
      </div>

      {/* Curriculum & Enrollment Insights Reports */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpenIcon className="h-6 w-6 text-purple-500" /> Curriculum & Enrollment Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Class Enrollment Distribution */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Class Enrollment Distribution</h4>
            <div className="h-48 flex items-center justify-center text-gray-400">
              <ChartThree
                title=""
                seriesData={academicReportsData.classEnrollmentDistribution.map(d => d.count)}
                labels={academicReportsData.classEnrollmentDistribution.map(d => d.size)}
              />
            </div>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">Class Size Details &rarr;</button>
          </div>

          {/* Course Popularity */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Top Courses by Enrollment</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {academicReportsData.coursePopularity
                .sort((a, b) => b.enrollments - a.enrollments) // Sort by enrollments
                .slice(0, 5) // Show top 5
                .map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                    <span>{item.course}</span>
                    <span className="font-bold text-indigo-700">{item.enrollments} Enrolled</span>
                  </li>
                ))}
            </ul>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">View All Course Stats &rarr;</button>
          </div>

          {/* Calendar Events Summary */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Upcoming Calendar Events Summary</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {upcomingEventsSummary.length > 0 ? (
                upcomingEventsSummary.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                    <span>{item.type.replace(/_/g, ' ')}: {item.count} upcoming</span>
                    <span className="text-gray-500">Next: {item.nextDate || 'N/A'}</span>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-500 py-2">No upcoming events found.</li>
              )}
            </ul>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">Full Calendar View &rarr;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
