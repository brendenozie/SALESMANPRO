// app/admin/[slug]/reports/page.tsx
import React from "react";
// import { Props } from "react-apexcharts";
import AdminReportsPageClient,{ OverallStats, StudentPerformanceData, StaffReportsData, AcademicReportsData, UpcomingEventsSummaryItem }  from "./AdminReportsPageClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

// --- Helper function to generate sample data (for fallback) ---
const generateSampleReportData = (): {
  sampleOverallStats: OverallStats;
  sampleStudentPerformanceData: StudentPerformanceData;
  sampleStaffReportsData: StaffReportsData;
  sampleAcademicReportsData: AcademicReportsData;
  sampleUpcomingEventsSummary: UpcomingEventsSummaryItem[];
} => {
  const sampleOverallStats: OverallStats = {
    totalStudents: '1,245',
    totalTeachers: '86',
    totalClasses: '55',
    averageAttendance: '92.5%',
  };

  const sampleStudentPerformanceData: StudentPerformanceData = {
    gradeDistribution: [
      { label: 'A', value: 300 },
      { label: 'B', value: 500 },
      { label: 'C', value: 350 },
      { label: 'D', value: 70 },
      { label: 'F', value: 25 },
    ],
    attendanceTrend: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      data: [90, 91, 92, 93, 92, 94, 93],
    },
    topPerformingGrades: [
      { grade: 'Grade 8', avgGPA: 3.9 },
      { grade: 'Grade 10', avgGPA: 3.7 },
      { grade: 'Grade 7', avgGPA: 3.6 },
    ],
    lowPerformingStudents: [
      { name: 'Student A', grade: '9', gpa: 1.8 },
      { name: 'Student B', grade: '7', gpa: 2.1 },
    ]
  };

  const sampleStaffReportsData: StaffReportsData = {
    teachersByDepartment: [
      { department: 'Math', count: 15 },
      { department: 'English', count: 12 },
      { department: 'Science', count: 18 },
      { department: 'Social Studies', count: 10 },
      { department: 'Arts', count: 8 },
    ],
    teacherActivity: {
      labels: ['Reports', 'Meetings', 'Grading', 'Planning'],
      data: [30, 20, 45, 35]
    }
  };

  const sampleAcademicReportsData: AcademicReportsData = {
    classEnrollmentDistribution: [
      { size: '1-15', count: 10 },
      { size: '16-25', count: 30 },
      { size: '26-35', count: 15 },
    ],
    coursePopularity: [
      { course: 'Algebra I', enrollments: 120 },
      { course: 'Literary Analysis', enrollments: 105 },
      { course: 'Biology', enrollments: 130 },
      { course: 'Introduction to Programming', enrollments: 80 },
    ]
  };

  const sampleUpcomingEventsSummary: UpcomingEventsSummaryItem[] = [
    { type: 'ACADEMIC', count: 3, nextDate: 'July 15' },
    { type: 'HOLIDAY', count: 1, nextDate: 'Aug 1' },
    { type: 'MEETING', count: 5, nextDate: 'July 28' },
  ];

  return {
    sampleOverallStats,
    sampleStudentPerformanceData,
    sampleStaffReportsData,
    sampleAcademicReportsData,
    sampleUpcomingEventsSummary,
  };
};


/**
 * This is a **Server Component**. It fetches all the data
 * at request‐time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function AdminReportsPage({ params }: PageProps) {
  const { slug : companyId } = await params;

  let overallStats: OverallStats | null = null;
  let studentPerformanceData: StudentPerformanceData | null = null;
  let staffReportsData: StaffReportsData | null = null;
  let academicReportsData: AcademicReportsData | null = null;
  let upcomingEventsSummary: UpcomingEventsSummaryItem[] = [];
  let fetchError: boolean = false;

  try {
    const reportsRes = await fetch(
      `${apiBaseUrl}/school-reports?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 } } // equivalent to SSR on every request
    );

    if (reportsRes.ok) {
      const data = await reportsRes.json();
      overallStats = data.overallStats;
      studentPerformanceData = data.studentPerformanceData;
      staffReportsData = data.staffReportsData;
      academicReportsData = data.academicReportsData;
      upcomingEventsSummary = data.upcomingEventsSummary;
    } else {
      console.error(`[AdminReportsPage] Failed to fetch reports: ${reportsRes.status} ${reportsRes.statusText}`);
      fetchError = true;
    }

  } catch (err: any) {
    console.error("AdminReportsPage-fetch error:", err.message);
    fetchError = true;
  }

  // If any fetch failed or data is missing, use sample data as fallback
  if (fetchError || !overallStats || !studentPerformanceData || !staffReportsData || !academicReportsData || !upcomingEventsSummary) {
    // console.log("[AdminReportsPage] Using sample data as fallback for reports.");
    const sampleData = generateSampleReportData();
    overallStats = sampleData.sampleOverallStats;
    studentPerformanceData = sampleData.sampleStudentPerformanceData;
    staffReportsData = sampleData.sampleStaffReportsData;
    academicReportsData = sampleData.sampleAcademicReportsData;
    upcomingEventsSummary = sampleData.sampleUpcomingEventsSummary;
  }


  return (
    <AdminReportsPageClient
      overallStats={overallStats}
      studentPerformanceData={studentPerformanceData}
      staffReportsData={staffReportsData}
      academicReportsData={academicReportsData}
      upcomingEventsSummary={upcomingEventsSummary}
    />
  );
}
