import { redirect } from 'next/navigation';
import { getAuthSession } from '../../../lib/auth';
import prisma from '@/server/db/prismadb';
import { normalizeCategory } from '@/utils/normalizeCategory';
import { cookies, headers } from 'next/headers';
import {
  getEcommerceDashboardData,
  isEcommerceRetailCategory,
} from '@/lib/admin-dashboard-service';

import EcomDashboardClient from '@/components/admin/EcomDashboardClient';
import RealEstateDashboardClient from '@/components/admin/RealEstateDashboardClient';
import CoachDashboardClient from '@/components/admin/CoachDashboardClient';
import AutomotiveDashboardClient from '@/components/admin/AutomotiveDashboardClient';
import BlogDashboardClient from '@/components/admin/BlogDashboardClient';
import EventDashboardClient from '@/components/admin/EventDashboardClient';
import FinanceDashboardClient from '@/components/admin/FinanceDashboardClient';
import FitnessDashboardClient from '@/components/admin/FitnessDashboardClient';
import HealthcareDashboardClient from '@/components/admin/HealthcareDashboardClient';
import MediaDashboardClient from '@/components/admin/MediaDashboardClient';
import NonprofitDashboardClient from '@/components/admin/NonprofitDashboardClient';
import PortfolioDashboardClient from '@/components/admin/PortfolioDashboardClient';
import RestaurantDashboardClient from '@/components/admin/RestaurantDashboardClient';
import SaaSDashboardClient from '@/components/admin/SaaSDashboardClient';
import TravelDashboardClient from '@/components/admin/TravelDashboardClient';
import ServiceProviderDashboard from '@/components/admin/ServiceProviderDashboard';
import BookingAppointmentsDashboard from '@/components/admin/BookingAppointmentsDashboard';
import TutorDashboard from '@/components/admin/TutorDashboard';
import StudentDashboard from '@/components/admin/StudentDashboard';
import ParentDashboard from '@/components/admin/ParentDashboard';
import PrincipalDashboard from '@/components/admin/PrincipalDashboard';
import UncategorizedDashboard from '@/components/admin/AdminDashClient';
import PlaygroupDashboard from '@/components/admin/PlaygroupDashboard';
import DriverShiftClientDashboard from '@/components/admin/DriverShiftClientDashboard';
import LogisticsDashboard from '@/components/admin/LogisticsDashboard';

// zod for runtime validation
import { z } from 'zod';
import StoreDriverDashboard from '@/components/admin/StoreDriverDashboard';
import { findCompanyCached } from '@/lib/company-fetcher';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// --- Loading/Error Boundary Components ---
function LoadingDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
      <div className="animate-spin h-12 w-12 mb-4 rounded-full border-4 border-blue-200 border-t-blue-500" />
      <p>Loading dashboard, please wait...</p>
    </div>
  );
}

function ErrorDashboard({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-red-500">
      <div className="h-12 w-12 mb-4 rounded-full border-4 border-red-200 border-t-red-500" />
      <p>Dashboard Error: {error}</p>
    </div>
  );
}

// --- Centralized Dashboard Component Mapping ---
const dashboardComponents: Record<string, React.ComponentType<any>> = {
  'e-commerce': EcomDashboardClient,
  'ecommerce': EcomDashboardClient,  
  'agrovet': EcomDashboardClient,
  'baby store': EcomDashboardClient,
  'bike store': EcomDashboardClient,
  'book store': EcomDashboardClient,
  'cake store': EcomDashboardClient,
  'earphones store': EcomDashboardClient,
  'fashion shop': EcomDashboardClient,
  'flowers store': EcomDashboardClient,
  'furniture shop': EcomDashboardClient,
  'gaming store': EcomDashboardClient,
  'glasses store': EcomDashboardClient,
  'groceries store': EcomDashboardClient,
  'hardware store': EcomDashboardClient,
  'honey store': EcomDashboardClient,
  'meat store': EcomDashboardClient,
  'motorcycle store': EcomDashboardClient,
  'peanuts store': EcomDashboardClient,
  'pets store': EcomDashboardClient,
  'shoes store': EcomDashboardClient,
  'watch store': EcomDashboardClient,
  'consultant & coach': CoachDashboardClient,
  'real estate': RealEstateDashboardClient,
  'service provider': ServiceProviderDashboard,
  'booking & appointments': BookingAppointmentsDashboard,
  'portfolio & personal branding': PortfolioDashboardClient,
  'blog & content': BlogDashboardClient,
  'directory & listings': EcomDashboardClient,
  'nonprofit & community': NonprofitDashboardClient,
  'restaurant & food delivery': RestaurantDashboardClient,
  'event & ticketing': EventDashboardClient,
  'healthcare & clinics': HealthcareDashboardClient,
  'saas & web apps': SaaSDashboardClient,
  'dashboards': SaaSDashboardClient,
  'media & entertainment': MediaDashboardClient,
  'finance & legal': FinanceDashboardClient,
  'automotive': AutomotiveDashboardClient,
  'travel & tourism': TravelDashboardClient,
  'fitness & wellness': FitnessDashboardClient,
  'marketplace': EcomDashboardClient,
  'delivery & logistics': LogisticsDashboard,
};

const allowedRoles = [
  'ADMIN', 'STUDENT', 'USER', 'EDUCATOR', 'CONSUMER', 'JUNIOR', 'SENIOR',
  'TEACHER', 'LECTURER', 'TUTOR', 'HEAD_TEACHER', 'PRINCIPAL', 'HEAD_OF_SCHOOL',
  'SCHOOL_HEAD', 'EDUCATIONAL_ADMIN', 'EDUCATIONAL_LEADER', 'EDUCATIONAL_MANAGER',
  'EDUCATIONAL_COORDINATOR', 'EDUCATIONAL_DIRECTOR', 'EDUCATIONAL_SUPERVISOR',
  'EDUCATIONAL_ADMINISTRATOR', 'EDUCATIONAL_OFFICER', 'SCHOOL_DRIVER', 'PARENT',
];

const educatorRoles = [
  'EDUCATOR', 'TEACHER', 'LECTURER', 'TUTOR', 'HEAD_TEACHER', 'PRINCIPAL',
  'HEAD_OF_SCHOOL', 'SCHOOL_HEAD', 'EDUCATIONAL_ADMIN', 'EDUCATIONAL_LEADER',
  'EDUCATIONAL_MANAGER', 'EDUCATIONAL_COORDINATOR', 'EDUCATIONAL_DIRECTOR',
  'EDUCATIONAL_SUPERVISOR', 'EDUCATIONAL_ADMINISTRATOR', 'EDUCATIONAL_OFFICER'
];

// --- Fallback Data Utility ---
function getFallbackDashboardData(type: 'student' | 'principal' | 'tutor' | 'parent' | 'default') {
  if (type === 'student') {
    return {
      studentStats: [
        { title: 'Courses Enrolled', value: '5', description: 'Total active courses', color: 'bg-blue-50' },
        { title: 'Assignments Due', value: '3', description: 'Upcoming deadlines', color: 'bg-red-50' },
        { title: 'Average Grade', value: 'B+', description: 'Overall academic performance', color: 'bg-green-50' },
        { title: 'Completed Lessons', value: '45', description: 'Lessons finished this week', color: 'bg-purple-50' },
      ],
      enrolledCourses: [
        { id: 'mock-c1', title: 'Mathematics I', progress: 75 },
        { id: 'mock-c2', title: 'Physics Basics', progress: 50 },
      ],
      recentGrades: [
        { subject: 'Math', score: 88, date: '2025-06-28' },
        { subject: 'English', score: 92, date: '2025-06-25' },
      ],
      upcomingAssignments: [
        { id: 'mock-a1', title: 'Algebra Homework', dueDate: '2025-07-05', course: 'Mathematics I' },
        { id: 'mock-a2', title: 'Physics Lab Report', dueDate: '2025-07-08', course: 'Physics Basics' },
      ],
    };
  }
  if (type === 'parent') {
    return {
      stats: { totalChildren: 0, familyPendingTasks: 0, attendanceAlerts: 0 },
      children: [],
    };
  }
  if (type === 'principal') {
    return {
      principalStats: [
        { title: 'Total Students', value: '1,245', description: 'Enrolled across all grades', color: 'bg-blue-50' },
        { title: 'Total Teachers', value: '86', description: 'Full-time and part-time staff', color: 'bg-green-50' },
        { title: 'Upcoming Events', value: '3', description: 'Key events this week', color: 'bg-purple-50' },
        { title: 'Pending Approvals', value: '12', description: 'Administrative actions required', color: 'bg-yellow-50' },
      ],
      quickActions: [
        { label: 'Teacher Reports', href: `/admin/fallback-company-id/reports` },
        { label: 'Student Discipline', href: '#' },
        { label: 'Exam Timetables', href: `/admin/fallback-company-id/events` },
        { label: 'School Announcements', href: `/admin/fallback-company-id/messages` },
      ],
      spotlight: {
        student: 'Honor Roll Scholar',
        teacher: 'Senior Faculty'
      },
      trendData: {
        series: [
          { name: "Academic Excellence (Avg %)", data: [80, 82, 85, 84, 88, 90] },
          { name: "Teacher Effectiveness (Weighted %)", data: [88, 89, 90, 92, 91, 94] }
        ],
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      },
      impactReport: [
        { courseName: "Core Curriculum", change: 3.5, currentAvg: 88, keyExam: "Continuous Assessment" },
        { courseName: "STEM Programs", change: 2.1, currentAvg: 84, keyExam: "Practical Lab" }
      ],
      announcements: [
        { id: 1, text: '📢 Term curriculum schedule published.', type: 'info' },
        { id: 2, text: '🧪 Science and arts exhibition on Friday.', type: 'warning' },
      ],
      recentStaffMessages: [],
    };
  }
  // Tutor
  return {
    teacherName: 'Lead Educator',
    teacherRole: 'Teacher',
    teacherStats: [
      { title: 'Total Students', value: '120', color: 'bg-blue-50' },
      { title: 'Assignments Due', value: '15', color: 'bg-purple-50' },
      { title: "Today's Classes", value: '4', color: 'bg-yellow-50' },
    ],
    assignments: [
      { id: 'mock-a1', title: 'Algebra Problem Set', class: 'Mathematics', dueDate: 'Friday', status: 'Published', color: 'bg-emerald-500' },
    ],
    recentAnnouncements: [
      { id: 'ann-1', text: 'Faculty meeting this Friday at 3 PM', type: 'info' as const },
    ],
    myClasses: [
      { id: 'c-1', name: 'Mathematics 10A', students: 30, schedule: '08:30 - 09:30 AM' },
    ],
    tutorStats: [
      { title: 'Courses Assigned', value: '3', description: 'Currently teaching', color: 'bg-blue-50' },
      { title: 'Total Students', value: '120', description: 'Across all courses', color: 'bg-green-50' },
      { title: 'Pending Grading', value: '15', description: 'Assignments to review', color: 'bg-red-50' },
      { title: 'Upcoming Classes', value: '4', description: 'Scheduled this week', color: 'bg-purple-50' },
    ],
    coursesTaught: [
      { id: 'mock-tc1', title: 'Advanced Algebra', totalStudents: 40 },
      { id: 'mock-tc2', title: 'Introduction to Biology', totalStudents: 50 },
    ],
    recentSubmissions: [
      { studentName: 'Alice Smith', assignment: 'Essay on Photosynthesis', status: 'Submitted', submissionDate: '2025-07-01' },
      { studentName: 'Bob Johnson', assignment: 'Math Problem Set 5', status: 'Submitted', submissionDate: '2025-06-30' },
    ],
    pendingGrading: [
      { id: 'pg1', assignment: 'Physics Quiz', student: 'Charlie Brown' },
      { id: 'pg2', assignment: 'Chemistry Lab Report', student: 'Diana Prince' },
    ],
  };
}


// --- Centralized Error Handling ---
function logError(message: string, error?: unknown) {
  // You can swap out for a real logger later!
  console.error(`[AdminDashboardPage] ${message}`, error || '');
}

// --- Internal Server Fetch Utility ---
async function fetchServerInternal(path: string, cookiesHeader?: string) {
  try {
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
    const headerProto = headersList.get("x-forwarded-proto");
    let protocol = "http";
    if (headerProto) {
      protocol = headerProto;
    } else if (host && (host.includes("localhost") || host.includes("127.0.0.1") || host.includes(":3000") || host.includes(":3001"))) {
      protocol = "http";
    } else if (process.env.NODE_ENV === "production" && !host?.includes("localhost")) {
      protocol = "https";
    }
    const cleanPath = path.startsWith("http") ? path : `${protocol}://${host}${path.startsWith('/') ? path : `/${path}`}`;
    return await fetch(cleanPath, {
      cache: "no-store",
      headers: cookiesHeader ? { cookie: cookiesHeader } : undefined,
    });
  } catch (err) {
    console.error("[fetchServerInternal error]", err);
    return null;
  }
}

// --- API URL Utility ---
function getDashboardapiBaseUrl(categoryKey: string, companyId: string) {
  if (!apiBaseUrl) {
    logError('NEXT_PUBLIC_API_URL not set.');
    return null;
  }

  if (categoryKey === 'service provider') return `${apiBaseUrl}/admin/dashboard/serviceprovider/${companyId}`;
  if (categoryKey === 'booking & appointments') return `${apiBaseUrl}/admin/dashboard/booking/${companyId}`;
  if (categoryKey === 'consultant & coach') return `${apiBaseUrl}/admin/dashboard/coach/${companyId}`;
  if (categoryKey === 'real estate') return `${apiBaseUrl}/admin/dashboard/real-estate/${companyId}`;
  if (categoryKey === 'automotive') return `${apiBaseUrl}/admin/dashboard/automotive/${companyId}`;
  if (categoryKey === 'blog & content') return `${apiBaseUrl}/admin/dashboard/blog/${companyId}`;
  if (categoryKey === 'event & ticketing') return `${apiBaseUrl}/admin/dashboard/events/${companyId}`;
  if (categoryKey === 'finance & legal') return `${apiBaseUrl}/admin/dashboard/finance-legal/${companyId}`;
  if (categoryKey === 'fitness & wellness') return `${apiBaseUrl}/admin/dashboard/fitness/${companyId}`;
  if (categoryKey === 'healthcare & clinics') return `${apiBaseUrl}/admin/dashboard/healthcare/${companyId}`;
  if (categoryKey === 'media & entertainment') return `${apiBaseUrl}/admin/dashboard/media/${companyId}`;
  if (categoryKey === 'nonprofit & community') return `${apiBaseUrl}/admin/dashboard/nonprofit/${companyId}`;
  if (categoryKey === 'restaurant & food delivery') return `${apiBaseUrl}/admin/dashboard/restaurent/${companyId}`;
  if (categoryKey === 'saas & web apps' || categoryKey === 'dashboards') return `${apiBaseUrl}/admin/dashboard/saas/${companyId}`;
  if (categoryKey === 'travel & tourism') return `${apiBaseUrl}/admin/dashboard/travel/${companyId}`;
  if (categoryKey === 'portfolio & personal branding') return `${apiBaseUrl}/admin/dashboard/portfolio/${companyId}`;
  if (categoryKey === 'delivery & logistics') return `${apiBaseUrl}/admin/dashboard/logistics/${companyId}`;
  if (isEcommerceRetailCategory(categoryKey)) return `${apiBaseUrl}/admin/dashboard/ecommerce/${companyId}`;
  return null;
}

// --- Zod Schemas for Runtime Type Validation ---
const StudentDashboardSchema = z.object({
  studentStats: z.array(z.object({
    title: z.string(),
    value: z.string(),
    description: z.string(),
    color: z.string()
  })),
  enrolledCourses: z.array(z.object({
    id: z.string(),
    title: z.string(),
    progress: z.number()
  })),
  recentGrades: z.array(z.object({
    subject: z.string(),
    score: z.number(),
    date: z.string()
  })),
  upcomingAssignments: z.array(z.object({
    id: z.string(),
    title: z.string(),
    dueDate: z.string(),
    course: z.string()
  }))
});

// import { z } from "zod";

export const PrincipalDashboardSchema = z.object({
  // Top level KPI cards
  principalStats: z.array(z.object({
    title: z.string(),
    value: z.string(),
    description: z.string(),
    color: z.string()
  })),

  // Student and Teacher of the week
  spotlight: z.object({
    student: z.string(),
    teacher: z.string()
  }),

  // The main Area Chart (Academic vs Effectiveness)
  trendData: z.object({
    series: z.array(z.object({
      name: z.string(),
      data: z.array(z.number())
    })),
    categories: z.array(z.string())
  }),

  // The new Academic Volatility / Drill-down logic
  impactReport: z.array(z.object({
    courseName: z.string(),
    change: z.number(),
    currentAvg: z.number(),
    keyExam: z.string()
  })),

  // Operational items (Optional depending on if you include them in the final return)
  quickActions: z.array(z.object({
    label: z.string(),
    href: z.string()
  })).optional(),

  announcements: z.array(z.object({
    id: z.union([z.string(), z.number()]),
    text: z.string(),
    type: z.string() // 'info' | 'warning' | etc
  })).optional(),

  recentStaffMessages: z.array(z.object({
    id: z.string(),
    name: z.string(),
    message: z.string(),
    time: z.string()
  })).optional(),
});

// Infer the type for use in your React Props
export type PrincipalDashboardData = z.infer<typeof PrincipalDashboardSchema>;

// (You can add more schemas for TutorDashboard and other dashboards as needed)
interface DashboardProps {
  params: Promise<{
    slug: string;
  }>;
}

// --- Main Page with Loading/Error Boundaries, Type Validation ---
export default async function AdminDashboardPage({ params }: DashboardProps) {
  let error: string | null = null;
  let isLoading = false;

  const session = await getAuthSession();
  const cookiesHeader = (await cookies()).toString();
  const { slug } = await params;

  if (!session) redirect('/signin');

  const userRole = session.user?.role?.toUpperCase() || 'ADMIN';

  if (!session?.user?.id || !allowedRoles.includes(userRole)) redirect('/');

  const currentUserId = session.user.id;

  // Company fetch (simulate loading)
  isLoading = true;
  
  // 4. Cached company fetch using the page strategy
  const company = await findCompanyCached(slug, "page");

  const educationRolesList = [
    'STUDENT', 'EDUCATOR', 'TEACHER', 'TUTOR', 'LECTURER',
    'HEADTEACHER', 'HEAD_TEACHER', 'PRINCIPAL', 'HEAD_OF_SCHOOL',
    'SCHOOL_HEAD', 'EDUCATIONAL_ADMIN', 'EDUCATIONAL_LEADER',
    'EDUCATIONAL_MANAGER', 'EDUCATIONAL_COORDINATOR', 'EDUCATIONAL_DIRECTOR',
    'EDUCATIONAL_SUPERVISOR', 'EDUCATIONAL_ADMINISTRATOR', 'EDUCATIONAL_OFFICER',
    'JUNIOR', 'SENIOR', 'SCHOOL_DRIVER', 'PARENT'
  ];

  const companyId = company?.id || (session.user as any)?.companyId || slug;
      
  isLoading = false;

  if (
    userRole !== 'STUDENT' && !company && !educationRolesList.includes(userRole)
  ) {
    redirect('/dashboards');
  }

  try {

    const categoryKey = normalizeCategory(company?.category || userRole);

    const isPrincipalLike =
      ['educational & online courses', 'head teacher', 'school head'].includes(categoryKey) ||
      [
        'PRINCIPAL', 'HEAD_OF_SCHOOL', 'SCHOOL_HEAD', 'EDUCATIONAL_ADMIN', 'EDUCATIONAL_LEADER',
        'EDUCATIONAL_MANAGER', 'EDUCATIONAL_COORDINATOR', 'EDUCATIONAL_DIRECTOR',
        'EDUCATIONAL_SUPERVISOR', 'EDUCATIONAL_ADMINISTRATOR', 'EDUCATIONAL_OFFICER'
      ].includes(userRole);

    // --- Loading State for Playgroup ---
    if (userRole === 'JUNIOR') {
      return <PlaygroupDashboard />;
    }

    // --- Student Dashboard ---
    if (userRole === 'STUDENT' || userRole === 'SENIOR') {
      let studentDashboardData: any;
      try {
        isLoading = true;
        const res = await fetchServerInternal(
          `${apiBaseUrl}/admin/dashboard/student/${slug}?userId=${encodeURIComponent(currentUserId)}`,
          cookiesHeader
        );
        isLoading = false;
        if (res && res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const data = (await res.json()).data;
            studentDashboardData = data;
          } else {
            studentDashboardData = getFallbackDashboardData('student');
          }
        } else {
          error = `Failed to fetch student dashboard data: ${res?.statusText || 'Network Error'}`;
          logError(error);
          studentDashboardData = getFallbackDashboardData('student');
        }
      } catch (err) {
        error = 'Student dashboard fetch error';
        logError(error, err);
        studentDashboardData = getFallbackDashboardData('student');
      }
      if (isLoading) return <LoadingDashboard />;
      // if (error) return <ErrorDashboard error={error} />;
      return (
        <StudentDashboard
          {...studentDashboardData}
          companyId={companyId}
          currentUserId={currentUserId}
        />
      );
    }

    if (userRole === 'PARENT') {
        let parentDashboardData: any;
        let isLoading = true;

        try {
          // 1. Using the new optimized summary API that traverses the Classroom-Subject link
          // We pass currentUserId which is the Parent's ID
          const res = await fetchServerInternal(
            `${apiBaseUrl}/admin/dashboard/parent/${slug}?userId=${encodeURIComponent(currentUserId)}`,
            cookiesHeader
          );

          if (res && res.ok) {
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              const responseJson = await res.json();
              parentDashboardData = responseJson.data || responseJson;
            } else {
              parentDashboardData = getFallbackDashboardData('parent');
            }
          } else {
            error = `Failed to fetch parent dashboard: ${res?.statusText || 'Network Error'}`;
            logError(error);
            parentDashboardData = getFallbackDashboardData('parent');
          }
        } catch (err) {
          error = 'Parent dashboard fetch error';
          logError(err instanceof Error ? err.message : 'Unknown error');
          parentDashboardData = getFallbackDashboardData('parent');
        } finally {
          isLoading = false;
        }

        if (isLoading) return <LoadingDashboard />;

        return (
          <ParentDashboard
            rawApiData={parentDashboardData}
            adminSlug={companyId}
            // {...parentDashboardData}
            // companyId={companyId}
            // currentUserId={currentUserId}
          />
        );
      }
    // if (userRole === 'PARENT') {
    //   // For simplicity, we'll reuse the StudentDashboard with a different prop to indicate parent view
    //   let studentDashboardData: any;
    //   try {
    //     isLoading = true;
    //     const res = await fetch(
    //       `${apiBaseUrl}/admin/dashboard/parent/${slug}?userId=${encodeURIComponent(currentUserId)}&view=parent`,
    //       { cache: 'no-store', headers: { cookie: cookiesHeader } }
    //     );
    //     isLoading = false;
    //     if (res.ok) {
    //       const data = (await res.json()).data;
    //         console.log("[AdminDashboardPage] Raw Parent API response:", data);
    //         studentDashboardData = data;
    //       // You can add a separate Zod schema for parent view if the data shape differs
    //     } else {
    //       error = `Failed to fetch parent dashboard data: ${res.statusText}`;
    //       logError(error);
    //       studentDashboardData = getFallbackDashboardData('student'); // You might want a separate fallback for parents
    //     }
    //   } catch (err) {
    //     error = 'Parent dashboard fetch error';
    //     logError(error, err);
    //     studentDashboardData = getFallbackDashboardData('student');
    //   }
    //   if (isLoading) return <LoadingDashboard />;
    //   // if (error) return <ErrorDashboard error={error} />;
    //   return (
    //     <ParentDashboard
    //       {...studentDashboardData}
    //       companyId={companyId}
    //       currentUserId={currentUserId}
    //       isParentView={true} // Indicate this is a parent view for conditional rendering inside StudentDashboard
    //     />
    //   );
    // }

    if (userRole === 'SCHOOL_DRIVER') {
      return (
        <DriverShiftClientDashboard
          companyId={companyId}
          currentUserId={currentUserId}
        />
      );
    }

    if (userRole === 'STORE_DRIVER') {
      return (
        <StoreDriverDashboard
          companyId={companyId}
          currentUserId={currentUserId}
        />
      );
    }

    // --- Educator Dashboards ---
    if (
      educatorRoles.includes(userRole) ||
      (userRole === 'CONSUMER' && ['educational & online courses', 'head teacher', 'school head'].includes(categoryKey)) ||
      isPrincipalLike
    ) {
      if (isPrincipalLike) {
        let principalDashboardData: any;
        try {
          isLoading = true;
          // Note: Ensure the URL spelling matches your folder structure (principal vs principle)
          const res = await fetchServerInternal(
            `${apiBaseUrl}/admin/dashboard/principle/${slug}?userId=${encodeURIComponent(currentUserId)}&companyId=${encodeURIComponent(companyId)}`,
            cookiesHeader
          );

          isLoading = false;

          if (res && res.ok) {
            const contentType = res.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
              principalDashboardData = getFallbackDashboardData('principal');
            } else {
              const jsonResponse = await res.json();
              const parsed = PrincipalDashboardSchema.safeParse(jsonResponse.data);

              if (!parsed.success) {
                error = 'Principal dashboard data validation failed!';
                logError(error, parsed.error);
                principalDashboardData = getFallbackDashboardData('principal');
              } else {
                // --- Data Transformation Layer ---
                principalDashboardData = {
                  ...parsed.data,
                  announcements: parsed.data.announcements?.map((a: any) => ({
                    id: a.id,
                    text: a.summary || a.title,
                    type: (a.type === 'ALERT' || a.type === 'POLICY_UPDATE') ? 'warning' : 'info'
                  })) || [],
                  recentStaffMessages: parsed.data.recentStaffMessages || [],
                };
              }
            }
          } else {
            error = `Principal API Error: ${res ? `${res.status} ${res.statusText}` : 'Network Failure'}`;
            logError(error);
            principalDashboardData = getFallbackDashboardData('principal');
          }
        } catch (err) {
          error = 'Critical failure fetching Principal dashboard';
          logError(error, err);
          principalDashboardData = getFallbackDashboardData('principal');
        }

        if (isLoading) return <LoadingDashboard />;
        // if (error) return <ErrorDashboard error={error} />;
        return (
          <PrincipalDashboard
            data={principalDashboardData}
            adminSlug={slug}
          />
        );
      } else {
        // Tutor Dashboard (runtime validation omitted for brevity)
        let tutorDashboardData: any;
        try {
          isLoading = true;
          const res = await fetchServerInternal(
            `${apiBaseUrl}/admin/dashboard/educator/${slug}?userId=${encodeURIComponent(currentUserId)}`,
            cookiesHeader
          );
          isLoading = false;
          if (res && res.ok) {
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              let resData = await res.json();
              tutorDashboardData = resData.data;
            } else {
              tutorDashboardData = getFallbackDashboardData('tutor');
            }
          } else {
            error = `Failed to fetch tutor dashboard data: ${res ? res.statusText : 'Network Error'}`;
            logError(error);
            tutorDashboardData = getFallbackDashboardData('tutor');
          }
        } catch (err) {
          error = 'Tutor dashboard fetch error';
          logError(error, err);
          tutorDashboardData = getFallbackDashboardData('tutor');
        }
        
        if (isLoading) return <LoadingDashboard />;
        
        // if (error) return <ErrorDashboard error={error} />;

        return (
          <TutorDashboard
            data={tutorDashboardData}
            adminSlug={slug}
            companyId={companyId}
            currentUserId={currentUserId}
          />
        );
      }
    }

    // --- Business Category Dashboards ---
    const DashboardComponent = dashboardComponents[categoryKey];

    let dashboardCategoryData: any = null;

    if (DashboardComponent) {
      if (isEcommerceRetailCategory(categoryKey) || DashboardComponent === EcomDashboardClient) {
        dashboardCategoryData = await getEcommerceDashboardData(companyId, company);
      } else {
        const targetApiUrl = getDashboardapiBaseUrl(categoryKey, companyId);
        if (targetApiUrl) {
          try {
            isLoading = true;
            const res = await fetchServerInternal(targetApiUrl, cookiesHeader);
            isLoading = false;

            if (res && res.ok) {
              const contentType = res.headers.get("content-type") || "";
              if (contentType.includes("application/json")) {
                dashboardCategoryData = (await res.json()).data;
              }
            } else {
              error = `Failed to fetch dashboard data for category "${categoryKey}": ${res?.statusText || "Error"}`;
              logError(error);
            }
          } catch (err) {
            error = `Dashboard category fetch error for "${categoryKey}"`;
            logError(error, err);
          }
        }
      }

      if (isLoading) return <LoadingDashboard />;
      return (
        <DashboardComponent
          {...(dashboardCategoryData ? { ...dashboardCategoryData, slug: companyId } : { slug: companyId })}
        />
      );
    }

    // Default fallback
    return <UncategorizedDashboard />;
  } catch (err) {
    // Final error boundary catch
    logError('Unexpected dashboard error', err);
    return <ErrorDashboard error="Unexpected dashboard error. Please try again later." />;
  }
}