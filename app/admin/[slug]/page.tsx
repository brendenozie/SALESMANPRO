import { redirect } from 'next/navigation';
import { getAuthSession } from '../../../lib/auth';
import prisma from '@/server/db/prismadb';
import { normalizeCategory } from '@/utils/normalizeCategory';
import { cookies } from 'next/headers';

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


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
      announcements: [
        { id: 1, text: '📢 Midterm exams begin next Monday.', type: 'info' },
        { id: 2, text: '🧪 Science fair projects due Friday. Submit early!', type: 'warning' },
        { id: 3, text: '📌 New cafeteria schedule published. Check details.', type: 'info' },
      ],
      recentStaffMessages: [
        { id: 'mock1', name: 'Mrs. Owino', message: 'Submitted report on 10A performance.', time: '10:30 AM' },
        { id: 'mock2', name: 'Mr. Kiptoo', message: 'Requesting projector for staff meeting.', time: 'Yesterday' },
        { id: 'mock3', name: 'Ms. Cherono', message: 'New student registration complete.', time: '2 hours ago' },
      ],
      performanceOverviewData: {
        series: [{ name: "Student Performance", data: [85, 88, 90, 87, 89, 91, 92] }, { name: "Teacher Effectiveness", data: [78, 80, 82, 85, 83, 86, 88] }],
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      },
      attendanceInsightsData: {
        series: [45, 30, 15, 10],
        labels: ["Students", "Teachers", "Staff", "Other"],
      },
    };
  }
  // Tutor
  return {
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
  // if (categoryKey === 'delivery & logistics') return `${apiBaseUrl}/admin/dashboard/directory/${companyId}`;
  if (
    [
      'ecommerce', 'e-commerce', 'shoes store', 'directory & listings', 'marketplace',  
      'fashion shop', 'furniture shop'
    ].includes(categoryKey)
  ) return `${apiBaseUrl}/admin/dashboard/ecommerce/${companyId}`;
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

  try {
    const session = await getAuthSession();
    const cookiesHeader = (await cookies()).toString();
    const { slug } = await params;

    if (!session) redirect('/login');

    const userRole = session.user?.role?.toUpperCase() || 'ADMIN';

    if (!session?.user?.id || !allowedRoles.includes(userRole)) redirect('/');

    const companyId =
      ['STUDENT', 'EDUCATOR', 'JUNIOR', 'SENIOR', 'SCHOOL_DRIVER', 'PARENT'].includes(userRole)
        ? session.user.id
        : slug;
    const currentUserId = session.user.id;

    // Company fetch (simulate loading)
    isLoading = true;
    // const [company] = await Promise.all([
    //   prisma.company.findUnique({
    //     where: { id: companyId },
    //     select: { category: true },
    //   })
    // ]);
    
    // 4. Cached company fetch using the page strategy
    const company = await findCompanyCached(companyId, "page");
    
    isLoading = false;

    if (
      userRole !== 'STUDENT' && !company && !['EDUCATOR', 'JUNIOR', 'SENIOR', 'SCHOOL_DRIVER', 'PARENT'].includes(userRole)
    ) {
      redirect('/dashboard');
    }

    const categoryKey = normalizeCategory(company?.category || userRole);

    // console.log("[AdminDashboardPage] Rendering dashboard for companyId:", companyId, "categoryKey:", categoryKey, "userRole:", userRole);

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
        const res = await fetch(
          `${apiBaseUrl}/admin/dashboard/student/${slug}?userId=${encodeURIComponent(currentUserId)}`,
          { cache: 'no-store', headers: { cookie: cookiesHeader } }
        );
        isLoading = false;
        if (res.ok) {
          const data = (await res.json()).data;
            // console.log("[AdminDashboardPage] Raw Student API response:", data);
            studentDashboardData = data;
          // const parsed = StudentDashboardSchema.safeParse(data);
          // if (!parsed.success) {
          //   error = 'Student dashboard data is invalid!';
          //   logError(error, parsed.error);
          //   studentDashboardData = getFallbackDashboardData('student');
          // } else {
          //   studentDashboardData = parsed.data;
          // }
        } else {
          error = `Failed to fetch student dashboard data: ${res.statusText}`;
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
          const res = await fetch(
            `${apiBaseUrl}/admin/dashboard/parent/${slug}?userId=${encodeURIComponent(currentUserId)}`,
            { 
              cache: 'no-store', 
              headers: { cookie: cookiesHeader } 
            }
          );

          if (res.ok) {
            const responseJson = await res.json();
            const data = responseJson.data;
            
            // console.log("[AdminDashboardPage] New Parent API response:", data);
            parentDashboardData = data;

            // 2. Mapping the new API response to the ParentDashboard props
            // Since our API returns a list of children, we'll focus on the first child 
            // for the main dashboard view, or you can iterate if desired.
            // const primaryChild = data.children[0]; 

            // parentDashboardData = {
            //   studentName: primaryChild?.name || "Student",
            //   studentGradeLevel: primaryChild?.gradeLevel || "N/A",
            //   classroomName: primaryChild?.roomName || "Unassigned",
            //   studentStats: [
            //     { 
            //       title: 'Assignments Due', 
            //       value: primaryChild?.totalPendingTasks || 0, 
            //       description: 'Across all subjects', 
            //       color: 'border-purple-100' 
            //     },
            //     { 
            //       title: 'Recent Grade', 
            //       value: primaryChild?.recentGrade || 'N/A', 
            //       description: 'Latest performance', 
            //       color: 'border-blue-100' 
            //     },
            //     { 
            //       title: 'Attendance', 
            //       value: primaryChild?.lastAttendance || 'No Data', 
            //       description: 'Last recorded status', 
            //       color: 'border-yellow-100' 
            //     }
            //   ],
            //   // These will be populated by the classroom courses link in our detailed API
            //   upcomingAssignments: primaryChild?.upcomingAssignments || [],
            //   myCourses: primaryChild?.courses || [],
            //   personalTimetable: primaryChild?.timetable || [],
            //   studentAnnouncements: data.stats?.announcements || []
            // };

          } else {
            error = `Failed to fetch parent dashboard: ${res.statusText}`;
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
            adminSlug={slug}
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
          const res = await fetch(
            `${apiBaseUrl}/admin/dashboard/principle/${slug}?userId=${encodeURIComponent(currentUserId)}&companyId=${encodeURIComponent(companyId)}`,
            { cache: 'no-store', headers: { cookie: cookiesHeader } }
          );

          isLoading = false;

          if (res.ok) {
            const jsonResponse =( await res.json());
            
            // console.log("[AdminDashboardPage] Raw Principal API response:", jsonResponse);
            // Validate against the new schema (validating the nested 'data' property)
            const parsed = PrincipalDashboardSchema.safeParse(jsonResponse.data);

            if (!parsed.success) {
              error = 'Principal dashboard data validation failed!';
              logError(error, parsed.error);
              // It's helpful to see exactly what failed in development
              // console.error("Zod Issues:", parsed.error.format()); 
              principalDashboardData = getFallbackDashboardData('principal');

            } else {
              // --- Data Transformation Layer ---
              principalDashboardData = {
                ...parsed.data,
                // Map Prisma Announcement types to UI types (info/warning/error)
                announcements: parsed.data.announcements?.map((a: any) => ({
                  id: a.id,
                  text: a.summary || a.title, // Use summary as display text
                  type: (a.type === 'ALERT' || a.type === 'POLICY_UPDATE') ? 'warning' : 'info'
                })) || [],
                
                // Ensure recentStaffMessages has a fallback if the API returns null
                recentStaffMessages: parsed.data.recentStaffMessages || [],
                
                // trendData and impactReport are passed through as-is from the validated schema
              };

              // console.log("[AdminDashboardPage] Successfully synced Principal Analytics:", {
              //   trendPoints: principalDashboardData.trendData.series[0].data.length,
              //   volatilityCount: principalDashboardData.impactReport.length
              // });
            }
          } else {
            error = `Principal API Error: ${res.status} ${res.statusText}`;
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
            // {...principalDashboardData}
            data={principalDashboardData}
            // companyId={companyId}
            // currentUserId={currentUserId}
          />
        );
      } else {
        // Tutor Dashboard (runtime validation omitted for brevity)
        let tutorDashboardData: any;
        try {
          isLoading = true;
          const res = await fetch(
            `${apiBaseUrl}/admin/dashboard/educator/${slug}?userId=${encodeURIComponent(currentUserId)}`,
            { cache: 'no-store', headers: { cookie: cookiesHeader } }
          );
          isLoading = false;
          if (res.ok) {
            let resData = await res.json();
            // console.log("[AdminDashboardPage] Raw Tutor API response:", resData);
            tutorDashboardData = resData.data; // Assuming API returns { data: { ...tutorDashboardData } }
          } else {
            error = `Failed to fetch tutor dashboard data: ${res.statusText}`;
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
            // {...tutorDashboardData}
            data={tutorDashboardData}
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

      const apiBaseUrl = getDashboardapiBaseUrl(categoryKey, companyId);

      if (apiBaseUrl) {
        try {

          isLoading = true;

          const res = await fetch(apiBaseUrl, {
            cache: 'no-store',
            headers: { cookie: cookiesHeader },
          });

          isLoading = false;

          if (res.ok) {
            dashboardCategoryData = (await res.json()).data;
          } else {
            error = `Failed to fetch dashboard data for category "${categoryKey}": ${res.statusText}`;
            logError(error);
          }
          
        } catch (err) {
          error = `Dashboard category fetch error for "${categoryKey}"`;
          logError(error, err);
        }
      }

      if (isLoading) return <LoadingDashboard />;
      // if (error) return <ErrorDashboard error={error} />;
      return (
        <DashboardComponent
          {...(dashboardCategoryData ? { ...dashboardCategoryData, slug: companyId } : {})}
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