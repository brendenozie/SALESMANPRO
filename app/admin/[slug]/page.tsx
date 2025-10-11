import { redirect } from 'next/navigation';
import { getAuthSession } from '../../../lib/auth';
import prisma from '@/server/db/prismadb';
import { normalizeCategory } from '@/utils/normalizeCategory';
import { cookies } from 'next/headers';

// Dashboard client imports
import EcomDashboardClient, { DashboardData } from '@/components/admin/EcomDashboardClient';
import RealEstateDashboardClient from '@/components/admin/RealEstateDashboardClient';
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
import ServiceProviderDashboard, { ServiceProviderDashboardData } from '@/components/admin/ServiceProviderDashboard';
import BookingAppointmentsDashboard from '@/components/admin/BookingAppointmentsDashboard';
import TutorDashboard, { TutorDashboardData } from '@/components/admin/TutorDashboard';
import StudentDashboard, { StudentDashboardData } from '@/components/admin/StudentDashboard';
import PrincipalDashboard, { PrincipalDashboardData } from '@/components/admin/PrincipalDashboard';
import UncategorizedDashboard from '@/components/admin/AdminDashClient';
import PlaygroupDashboard from '@/components/admin/PlaygroupDashboard';

export const dynamic = 'force-dynamic';

// Role and category mappings
const allowedRoles = [
  'ADMIN', 'STUDENT', 'EDUCATOR', 'CONSUMER', 'JUNIOR', 'SENIOR',
  'TEACHER', 'LECTURER', 'TUTOR', 'HEAD_TEACHER', 'PRINCIPAL', 'HEAD_OF_SCHOOL',
  'SCHOOL_HEAD', 'EDUCATIONAL_ADMIN', 'EDUCATIONAL_LEADER', 'EDUCATIONAL_MANAGER',
  'EDUCATIONAL_COORDINATOR', 'EDUCATIONAL_DIRECTOR', 'EDUCATIONAL_SUPERVISOR',
  'EDUCATIONAL_ADMINISTRATOR', 'EDUCATIONAL_OFFICER'
];

const dashboardCategoryMapping: Record<string, string> = {
  'e-commerce': 'EcomDashboardClient',
  'ecommerce': 'EcomDashboardClient',
  'shoes store': 'EcomDashboardClient',
  'real estate': 'RealEstateDashboardClient',
  'service provider': 'ServiceProviderDashboard',
  'booking & appointments': 'BookingAppointmentsDashboard',
  'portfolio & personal branding': 'PortfolioDashboardClient',
  'blog & content': 'BlogDashboardClient',
  'directory & listings': 'EcomDashboardClient',
  'nonprofit & community': 'NonprofitDashboardClient',
  'restaurant & food delivery': 'RestaurantDashboardClient',
  'event & ticketing': 'EventDashboardClient',
  'healthcare & clinics': 'HealthcareDashboardClient',
  'saas & web apps': 'SaaSDashboardClient',
  'dashboards': 'SaaSDashboardClient',
  'media & entertainment': 'MediaDashboardClient',
  'finance & legal': 'FinanceDashboardClient',
  'automotive': 'AutomotiveDashboardClient',
  'travel & tourism': 'TravelDashboardClient',
  'fitness & wellness': 'FitnessDashboardClient',
  'marketplace': 'EcomDashboardClient'
};

const educatorRoles = [
  'EDUCATOR', 'TEACHER', 'LECTURER', 'TUTOR', 'HEAD_TEACHER', 'PRINCIPAL',
  'HEAD_OF_SCHOOL', 'SCHOOL_HEAD', 'EDUCATIONAL_ADMIN', 'EDUCATIONAL_LEADER',
  'EDUCATIONAL_MANAGER', 'EDUCATIONAL_COORDINATOR', 'EDUCATIONAL_DIRECTOR',
  'EDUCATIONAL_SUPERVISOR', 'EDUCATIONAL_ADMINISTRATOR', 'EDUCATIONAL_OFFICER'
];

// Fallback Data
const fallbackStudentDashboardData: StudentDashboardData = {
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

const fallbackPrincipalDashboardData: PrincipalDashboardData = {
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

const fallbackTutorDashboardData: TutorDashboardData = {
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

// Utility for API endpoints
function getDashboardApiUrl(categoryKey: string, companyId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (categoryKey === 'service provider') return `${baseUrl}/admin/dashboard/serviceprovider/${companyId}`;
  if (
    [
      'ecommerce', 'e-commerce', 'shoes store', 'directory & listings', 'marketplace',
      'real estate', 'booking & appointments', 'portfolio & personal branding', 'blog & content',
      'nonprofit & community', 'restaurant & food delivery', 'event & ticketing',
      'healthcare & clinics', 'media & entertainment', 'finance & legal', 'automotive',
      'travel & tourism', 'fitness & wellness'
    ].includes(categoryKey)
  ) return `${baseUrl}/admin/dashboard/ecommerce/${companyId}`;
  return null;
}

export default async function AdminDashboardPage({ params }: { params: { slug: string } }) {
  const session = await getAuthSession();
  const cookiesHeader = (await cookies()).toString();
  const { slug } = params;

  if (!session) redirect('/login');
  const userRole = session.user?.role?.toUpperCase() || 'ADMIN';
  if (!session?.user?.id || !allowedRoles.includes(userRole))
    redirect('/');

  // Determine companyId
  const companyId =
    ['STUDENT', 'EDUCATOR', 'JUNIOR', 'SENIOR'].includes(userRole)
      ? session.user.id
      : slug;

  const currentUserId = session.user.id;

  // Fetch company category
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { category: true },
  });

  if (
    userRole !== 'STUDENT' &&
    !company &&
    !['EDUCATOR', 'JUNIOR', 'SENIOR'].includes(userRole)
  ) {
    redirect('/dashboard');
  }

  const categoryKey = normalizeCategory(company?.category || userRole);

  let dashboardData: DashboardData | null = null;
  let serviceDashboardData: ServiceProviderDashboardData | null = null;
  let principalDashboardData: PrincipalDashboardData | null = null;
  let studentDashboardData: StudentDashboardData | null = null;
  let tutorDashboardData: TutorDashboardData | null = null;

  // Data fetchers for role/category
  if (userRole === 'JUNIOR') {
    return <PlaygroupDashboard />;
  }

  if (userRole === 'STUDENT') {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/student?userId=${encodeURIComponent(currentUserId)}`,
        { cache: 'no-store', headers: { cookie: cookiesHeader } }
      );
      if (res.ok) {
        studentDashboardData = (await res.json()).data as StudentDashboardData;
      } else {
        studentDashboardData = fallbackStudentDashboardData;
      }
    } catch {
      studentDashboardData = fallbackStudentDashboardData;
    }
    return (
      <StudentDashboard
        {...studentDashboardData}
        companyId={companyId}
        currentUserId={currentUserId}
      />
    );
  }

  // Principal/Head Teacher roles and categories
  const isPrincipalLike =
    ['educational & online courses', 'head teacher', 'school head'].includes(categoryKey) ||
    [
      'PRINCIPAL', 'HEAD_OF_SCHOOL', 'SCHOOL_HEAD', 'EDUCATIONAL_ADMIN', 'EDUCATIONAL_LEADER',
      'EDUCATIONAL_MANAGER', 'EDUCATIONAL_COORDINATOR', 'EDUCATIONAL_DIRECTOR',
      'EDUCATIONAL_SUPERVISOR', 'EDUCATIONAL_ADMINISTRATOR', 'EDUCATIONAL_OFFICER'
    ].includes(userRole);

  if (
    educatorRoles.includes(userRole) ||
    (userRole === 'CONSUMER' && ['educational & online courses', 'head teacher', 'school head'].includes(categoryKey))
  ) {
    if (isPrincipalLike) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/principal?userId=${encodeURIComponent(currentUserId)}`,
          { cache: 'no-store' }
        );
        if (res.ok) {
          principalDashboardData = (await res.json()) as PrincipalDashboardData;
        } else {
          principalDashboardData = fallbackPrincipalDashboardData;
        }
      } catch {
        principalDashboardData = fallbackPrincipalDashboardData;
      }
      return (
        <PrincipalDashboard
          {...principalDashboardData}
          companyId={companyId}
          currentUserId={currentUserId}
        />
      );
    } else {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/tutor?userId=${encodeURIComponent(currentUserId)}`,
          { cache: 'no-store' }
        );
        if (res.ok) {
          tutorDashboardData = (await res.json()) as TutorDashboardData;
        } else {
          tutorDashboardData = fallbackTutorDashboardData;
        }
      } catch {
        tutorDashboardData = fallbackTutorDashboardData;
      }
      return (
        <TutorDashboard
          {...tutorDashboardData}
          companyId={companyId}
          currentUserId={currentUserId}
        />
      );
    }
  }

  // Other business categories
  const dashboardComponentName = dashboardCategoryMapping[categoryKey];
  let dashboardCategoryData: any = null;

  // ServiceProviderDashboard
  if (categoryKey === 'service provider') {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/serviceprovider/${companyId}`,
        { cache: 'no-store', headers: { cookie: cookiesHeader } }
      );
      if (res.ok) {
        serviceDashboardData = (await res.json()).data as ServiceProviderDashboardData;
      }
    } catch {
      // Leave serviceDashboardData as null
    }
    return (
      <ServiceProviderDashboard
        data={serviceDashboardData as ServiceProviderDashboardData}
      />
    );
  }

  // Generic mapping for categories
  if (dashboardComponentName) {
    const apiUrl = getDashboardApiUrl(categoryKey, companyId);
    if (apiUrl) {
      try {
        const res = await fetch(apiUrl, {
          cache: 'no-store',
          headers: { cookie: cookiesHeader },
        });
        if (res.ok) {
          dashboardCategoryData = (await res.json()).data;
        }
      } catch {
        dashboardCategoryData = null;
      }
    }
    // Dashboard component mapping
    const dashboardComponents: Record<string, React.ComponentType<any>> = {
      EcomDashboardClient,
      RealEstateDashboardClient,
      ServiceProviderDashboard,
      BookingAppointmentsDashboard,
      PortfolioDashboardClient,
      BlogDashboardClient,
      NonprofitDashboardClient,
      RestaurantDashboardClient,
      EventDashboardClient,
      HealthcareDashboardClient,
      SaaSDashboardClient,
      MediaDashboardClient,
      FinanceDashboardClient,
      AutomotiveDashboardClient,
      TravelDashboardClient,
      FitnessDashboardClient,
    };

    const DashboardComponent = dashboardComponents[dashboardComponentName];
    return (
      <DashboardComponent
        {...(dashboardCategoryData ? { ...dashboardCategoryData, slug: companyId } : {})}
      />
    );
  }

  // Default fallback
  return <UncategorizedDashboard />;
}