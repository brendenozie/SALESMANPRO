'use client';

import React from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  CalendarDaysIcon,
  HeartIcon, // Changed to BriefcaseIcon for teachers
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
  MegaphoneIcon,
  StarIcon,
  RocketLaunchIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon as ClockSolidIcon,
  BriefcaseIcon, // Added for teachers
  ArrowTrendingUpIcon, // For avg attendance
  ChartPieIcon, // For ChartThree
  SparklesIcon, // For events
} from '@heroicons/react/24/outline';

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import Link from 'next/link'; // Import Link for navigation

// Dynamic imports for ApexCharts to ensure SSR is false
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });


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

interface PrincipalDashboardProps extends PrincipalDashboardData {
  companyId: string; // Pass companyId for dynamic links
  currentUserId: string; // Pass currentUserId for dynamic links
}

// --- Chart Components (Moved here for self-containment) ---

interface ChartTwoProps {
  seriesData: { name: string; data: number[] }[];
  categories: string[];
  title: string;
}

const ChartTwo: React.FC<ChartTwoProps> = ({ seriesData, categories, title }) => {
  const options: ApexOptions = {
    colors: ["#3C50E0", "#80CAEE", "#FFA70B", "#10B981"],
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
    colors: ["#10B981", "#375E83", "#259AE6", "#FFA70B", "#EF4444", "#8B5CF6"],
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
              formatter: (val) => `${val}`,
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


// --- Main PrincipalDashboard Component ---
export default function PrincipalDashboard({
  principalStats,
  quickActions,
  announcements,
  recentStaffMessages,
  performanceOverviewData,
  attendanceInsightsData,
  companyId,
  currentUserId,
}: PrincipalDashboardProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Map icons to stat titles
  const statIcons: { [key: string]: JSX.Element } = {
    'Total Students': <UsersIcon className="h-7 w-7 text-blue-600" />,
    'Total Teachers': <BriefcaseIcon className="h-7 w-7 text-green-600" />, // Changed from HeartIcon
    'Upcoming Events': <CalendarDaysIcon className="h-7 w-7 text-purple-600" />,
    'Pending Approvals': <ClockSolidIcon className="h-7 w-7 text-yellow-600" />,
  };

  // Map colors to ring colors (for hover effect)
  const colorToRingColor: { [key: string]: string } = {
    'bg-blue-50': 'focus:ring-blue-500',
    'bg-green-50': 'focus:ring-green-500',
    'bg-purple-50': 'focus:ring-purple-500',
    'bg-yellow-50': 'focus:ring-yellow-500',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Principal's Dashboard
            <span className="ml-2 text-blue-600 text-base sm:text-xl">🎓</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Key insights and quick access for school administration.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Principal Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {principalStats.map((stat, index) => (
              <div
                key={index}
                className={`p-5 rounded-xl shadow-md border border-gray-200 transition-all duration-200 ease-in-out
                            hover:shadow-lg transform hover:-translate-y-1 cursor-pointer
                            ${stat.color} ${colorToRingColor[stat.color]}`}
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-white rounded-full shadow-sm mr-3 flex-shrink-0">
                    {statIcons[stat.title]} {/* Use dynamic icon */}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <h2 className="text-3xl font-bold text-gray-800">{stat.value}</h2>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
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
                <Link
                  key={idx}
                  href={action.href}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg text-gray-700
                             hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  <div className="text-blue-500 mb-2">
                    {action.label === 'Teacher Reports' && <BookOpenIcon className="h-6 w-6" />}
                    {action.label === 'Student Discipline' && <ClipboardDocumentCheckIcon className="h-6 w-6" />}
                    {action.label === 'Exam Timetables' && <CalendarDaysIcon className="h-6 w-6" />}
                    {action.label === 'School Announcements' && <MegaphoneIcon className="h-6 w-6" />}
                  </div>
                  <span className="text-center text-sm font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Performance Overview & Attendance Insights Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col hover:shadow-lg transition">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-indigo-500" /> Performance Overview
                </h3>
                <Link href={`/admin/${companyId}/reports`} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition">
                  View Full Report &rarr;
                </Link>
              </div>
              <div className="flex-grow min-h-[200px]">
                <ChartTwo
                  title=""
                  seriesData={performanceOverviewData.series}
                  categories={performanceOverviewData.categories}
                />
              </div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col hover:shadow-lg transition">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <ChartPieIcon className="h-5 w-5 text-teal-500" /> Attendance Insights
                </h3>
                <Link href={`/admin/${companyId}/reports`} className="text-sm text-teal-600 hover:text-teal-800 font-medium transition">
                  Detailed View &rarr;
                </Link>
              </div>
              <div className="flex-grow min-h-[200px]">
                <ChartThree
                  title=""
                  seriesData={attendanceInsightsData.series}
                  labels={attendanceInsightsData.labels}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Awards, Announcements, Messages */}
        <div className="lg:col-span-1 space-y-6">

          {/* Student/Teacher of the Week */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-xl shadow-md border border-gray-200 text-center flex flex-col items-center justify-center hover:shadow-lg transition">
              <StarIcon className="h-8 w-8 text-yellow-500 mb-2" />
              <h4 className="font-semibold text-gray-800">Student of the Week</h4>
              <p className="text-sm text-gray-600">Jane Wanjiru - Grade 8</p>
            </div>
            <div className="p-5 bg-white rounded-xl shadow-md border border-gray-200 text-center flex flex-col items-center justify-center hover:shadow-lg transition">
              <StarIcon className="h-8 w-8 text-green-500 mb-2" />
              <h4 className="font-semibold text-gray-800">Teacher of the Week</h4>
              <p className="text-sm text-gray-600">Mr. Otieno - Science Dept.</p>
            </div>
          </div>

          {/* Latest Announcements */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <MegaphoneIcon className="h-5 w-5 text-orange-500" /> Latest Announcements
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {announcements.map((note) => (
                <li key={note.id} className={`flex items-start gap-3 p-3 rounded-lg
                                  ${note.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-blue-50 border-l-4 border-blue-400'}`}>
                  <span className="mt-0.5">{note.type === 'warning' ? '⚠️' : '📢'}</span>
                  <span>{note.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Staff Messages */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-lime-600" /> Recent Staff Messages
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {recentStaffMessages.length > 0 ? (
                recentStaffMessages.map((msg) => (
                  <li key={msg.id} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {msg.name.charAt(0)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-gray-800">{msg.name}</span>
                        <span className="text-xs text-gray-400">{msg.time}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-snug">{msg.message}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-500 py-4">No recent staff messages.</li>
              )}
            </ul>
            <Link href={`/admin/${companyId}/messages`} className="mt-4 w-full text-sm text-blue-600 hover:underline block text-center">
              View All Messages &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
