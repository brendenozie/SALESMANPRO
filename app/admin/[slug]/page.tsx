// app/admin/[slug]/page.tsx
import { redirect } from 'next/navigation';
import { getAuthSession } from '../../../lib/auth';
import prisma from '@/server/db/prismadb';
import { normalizeCategory } from '@/utils/normalizeCategory';

// Import all dashboard client components
import EcomDashboardClient, { DashboardData } from '@/components/admin/EcomDashboardClient';
import RealEstateDashboardClient from '@/components/admin/RealEstateDashboardClient';
import AutomotiveDashboardClient from '@/components/admin/AutomotiveDashboardClient';
import BlogDashboardClient from '@/components/admin/BlogDashboardClient';
import DirectoryDashboardClient from '@/components/admin/DirectoryDashboardClient';
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
import MarketplaceDashboard from '@/components/admin/MarketplaceDashboard';
import ServiceProviderDashboard from '@/components/admin/ServiceProviderDashboard';
import BookingAppointmentsDashboard from '@/components/admin/BookingAppointmentsDashboard';

// Specific educational dashboards
import TutorDashboard, { TutorDashboardData } from '@/components/admin/TutorDashboard';
import StudentDashboard, { StudentDashboardData } from '@/components/admin/StudentDashboard';
import PrincipalDashboard, { PrincipalDashboardData } from '@/components/admin/PrincipalDashboard';
import UncategorizedDashboard from '../../../components/admin/AdminDashClient'; // Assuming this is a generic fallback
import PlaygroupDashboard from '@/components/admin/PlaygroupDashboard';


export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({ params }: { params: { slug: string } }) {
  const session = await getAuthSession();
  
  if (!session) {
    redirect('/login'); // Redirect to login if no session
  }

  const userRole = session.user?.role?.toUpperCase() || 'ADMIN'; // Default to ADMIN if role is not set

  console.log(userRole);

  // 1. Authentication and Authorization Check
  // Allow 'ADMIN', 'STUDENT', and 'EDUCATOR' roles to access admin dashboards
  if (!session?.user?.id ||
      (session.user.role?.toLowerCase() !== 'admin' &&
       session.user.role?.toLowerCase() !== 'student' &&
       session.user.role?.toLowerCase() !== 'educator'&&
       session.user.role?.toLowerCase() !== 'consumer'&&
       session.user.role?.toLowerCase() !== 'junior'&&
       session.user.role?.toLowerCase() !== 'senior')) {
    redirect('/'); // Redirect if not authorized
  }

  const companyId = userRole === 'STUDENT' || userRole === 'EDUCATOR'  || userRole === 'JUNIOR'  || userRole === 'SENIOR' ? session.user.id : params.slug; // Use user ID for student/educator, company ID for admin


  const currentUserId = session.user.id; // Get current user ID from session

  // 2. Fetch company category
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { category: true },
  });

  if (userRole !== 'STUDENT' && !company && userRole !== 'EDUCATOR' && userRole !== 'JUNIOR' && userRole !== 'SENIOR') {
    // If company not found, redirect to a generic dashboard or error page
    // console.error(`Company with ID ${companyId} not found.`);
    redirect('/dashboard'); // Or show a 404 page
  }

  const categoryKey = normalizeCategory(company?.category || userRole); // Normalize category for consistent handling

  // 3. Fetch Dashboard Metrics based on Role and Category
  let dashboardData: DashboardData | null = null; // General dashboard data
  let principalDashboardData: PrincipalDashboardData | null = null; // For Principal/Head Teacher
  let studentDashboardData: StudentDashboardData | null = null; // For Students
  let tutorDashboardData: TutorDashboardData | null = null; // For Tutors/Teachers/Lecturers
  let fetchError: boolean = false;

  try {

    // Fetch role-specific data
    if (userRole === 'STUDENT') {
      const studentRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/student?userId=${encodeURIComponent(currentUserId)}`,
        { cache: 'no-store' }
      );
      if (studentRes.ok) {
        studentDashboardData = (await studentRes.json()) as StudentDashboardData;
      } else {
        console.error(`[AdminDashboardPage] Failed to fetch student dashboard data: ${studentRes.status} ${studentRes.statusText}`);
        fetchError = true;
      }
    } else if (userRole === 'EDUCATOR' || userRole === 'TEACHER' || userRole === 'LECTURER' || userRole === 'TUTOR' || userRole === 'HEAD_TEACHER' || 
        userRole == 'PRINCIPAL' || userRole === 'HEAD_OF_SCHOOL' || userRole === 'SCHOOL_HEAD' || userRole === 'EDUCATIONAL_ADMIN' || userRole === 'EDUCATIONAL_LEADER' ||
        userRole === 'EDUCATIONAL_MANAGER' || userRole === 'EDUCATIONAL_COORDINATOR' || userRole === 'EDUCATIONAL_DIRECTOR' || userRole === 'EDUCATIONAL_SUPERVISOR' || userRole === 'EDUCATIONAL_ADMINISTRATOR' ||
        userRole === 'EDUCATIONAL_OFFICER' || userRole === 'EDUCATIONAL_OFFICER' || userRole === 'CONSUMER' && company?.category == 'educational & online courses'
    ) {
      // Check if this educator is a Principal/Head Teacher based on company category
      if (categoryKey === 'educational & online courses' || categoryKey === 'head teacher'  || categoryKey === 'consumer' || categoryKey === 'school head') {
        const principalRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/principal?userId=${encodeURIComponent(currentUserId)}`,
          { cache: 'no-store' }
        );
        if (principalRes.ok) {
          principalDashboardData = (await principalRes.json()) as PrincipalDashboardData;
        } else {
          console.error(`[AdminDashboardPage] Failed to fetch principal dashboard data: ${principalRes.status} ${principalRes.statusText}`);
          fetchError = true;
        }
      } else {
        // Otherwise, fetch general tutor/teacher data
        const tutorRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/tutor?userId=${encodeURIComponent(currentUserId)}`,
          { cache: 'no-store' }
        );
        if (tutorRes.ok) {
          tutorDashboardData = (await tutorRes.json()) as TutorDashboardData;
        } else {
          console.error(`[AdminDashboardPage] Failed to fetch tutor dashboard data: ${tutorRes.status} ${tutorRes.statusText}`);
          fetchError = true;
        }
      }
    }else {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/${companyId}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        dashboardData = (await res.json()) as DashboardData;
      } else {
        console.error(`[AdminDashboardPage] Failed to fetch general dashboard data: ${res.status} ${res.statusText}`);
        fetchError = true;
      }
    }


  } catch (err: any) {
    console.error("AdminDashboardPage-fetch error:", err.message);
    fetchError = true;
  }

  // 4. Fallback Data (if fetch failed) - Keep existing fallbacks and add new ones
  if (!dashboardData || fetchError) {
    console.warn("Using fallback data for general dashboard.");
    dashboardData = {
      clientData: { newClients: 0 }, inventoryData: { lowStock: 0 },
      agentData: { topAgent: '', topAgentSales: 0 }, communicationData: { today: 0 },
      orderData: { completedToday: 0 }, salesData: { todaySales: 0, monthlyTargetProgress: 0, leadsConverted: 0, demosConducted: 0, commissionEarned: 0, },
      taskData: { tasks: [] },
    };
  }

  if (userRole === 'STUDENT' && !studentDashboardData) {
    console.warn("Using fallback data for Student Dashboard.");
    studentDashboardData = {
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

  if (userRole === 'EDUCATOR' && !principalDashboardData && !tutorDashboardData || userRole === 'CONSUMER' && (categoryKey === 'educational & online courses' || categoryKey === 'head teacher' || categoryKey === 'school head')) {
    // Fallback for Principal Dashboard (if applicable and failed)
    if (categoryKey === 'educational & online courses' || categoryKey === 'head teacher' || categoryKey === 'school head') {
      console.warn("Using fallback data for Principal Dashboard.");
      principalDashboardData = {
        principalStats: [
          { title: 'Total Students', value: '1,245', description: 'Enrolled across all grades', color: 'bg-blue-50' },
          { title: 'Total Teachers', value: '86', description: 'Full-time and part-time staff', color: 'bg-green-50' },
          { title: 'Upcoming Events', value: '3', description: 'Key events this week', color: 'bg-purple-50' },
          { title: 'Pending Approvals', value: '12', description: 'Administrative actions required', color: 'bg-yellow-50' },
        ],
        quickActions: [
          { label: 'Teacher Reports', href: `/admin/${companyId}/reports` },
          { label: 'Student Discipline', href: '#' },
          { label: 'Exam Timetables', href: `/admin/${companyId}/events` },
          { label: 'School Announcements', href: `/admin/${companyId}/messages` },
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
    } else { // Fallback for Tutor Dashboard (if applicable and failed)
      console.warn("Using fallback data for Tutor Dashboard.");
      tutorDashboardData = {
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
  }

  // 5. Render appropriate client component based on user role and category
  if (userRole === 'JUNIOR') {
    return <PlaygroupDashboard/>
  } 
  else if (userRole === 'EDUCATOR') {    

    return <StudentDashboard {...(studentDashboardData as StudentDashboardData)} 
                      companyId={companyId} currentUserId={currentUserId} />;

  } else if (userRole === 'EDUCATOR' || userRole === 'TEACHER' || userRole === 'LECTURER' || userRole === 'TUTOR' || userRole === 'HEAD_TEACHER' ||
      userRole == 'PRINCIPAL' || userRole === 'HEAD_OF_SCHOOL' || userRole === 'SCHOOL_HEAD' || userRole === 'EDUCATIONAL_ADMIN' || userRole === 'EDUCATIONAL_LEADER' ||
      userRole === 'EDUCATIONAL_MANAGER' || userRole === 'EDUCATIONAL_COORDINATOR' || userRole === 'EDUCATIONAL_DIRECTOR' || userRole === 'EDUCATIONAL_SUPERVISOR' || userRole === 'EDUCATIONAL_ADMINISTRATOR' ||
      userRole === 'EDUCATIONAL_OFFICER' || userRole === 'EDUCATIONAL_OFFICER' || userRole === 'CONSUMER' && (categoryKey === 'educational & online courses' || categoryKey === 'head teacher' || categoryKey === 'school head')
  ) {
    if (categoryKey === 'educational & online courses' || categoryKey === 'head teacher' || categoryKey === 'school head' || userRole === 'PRINCIPAL' || userRole === 'HEAD_OF_SCHOOL' || userRole === 'SCHOOL_HEAD'
        || userRole === 'EDUCATIONAL_ADMIN' || userRole === 'EDUCATIONAL_LEADER' || userRole === 'EDUCATIONAL_MANAGER' || userRole === 'EDUCATIONAL_COORDINATOR' || 
        userRole === 'EDUCATIONAL_DIRECTOR' || userRole === 'EDUCATIONAL_SUPERVISOR' || userRole === 'EDUCATIONAL_ADMINISTRATOR' || userRole === 'EDUCATIONAL_OFFICER' || 
        userRole === 'CONSUMER' && (categoryKey === 'educational & online courses' || categoryKey === 'head teacher' || 
          categoryKey === 'school head')
    ) {
      return <PrincipalDashboard {...(principalDashboardData as PrincipalDashboardData)} companyId={companyId} currentUserId={currentUserId} />;
    } else {
      // Default for other educators (teachers, lecturers, tutors)
      return <TutorDashboard {...(tutorDashboardData as TutorDashboardData)} companyId={companyId} currentUserId={currentUserId} />;
    }
  } else {
    // Fallback for other roles (e.g., ADMIN, or other business categories)
    switch (categoryKey) {
      case 'e-commerce':
        return <EcomDashboardClient {...(dashboardData as DashboardData)} />;
      case 'real estate':
        return <RealEstateDashboardClient />;
      case 'service provider':
        return <ServiceProviderDashboard />;
      case 'booking & appointments':
        return <BookingAppointmentsDashboard />;
      case 'portfolio & personal branding':
        return <PortfolioDashboardClient />;
      case 'blog & content':
        return <BlogDashboardClient />;
      case 'directory & listings':
        return <DirectoryDashboardClient />;
      case 'nonprofit & community':
        return <NonprofitDashboardClient />;
      case 'restaurant & food delivery':
        return <RestaurantDashboardClient />;
      case 'event & ticketing':
        return <EventDashboardClient />;
      case 'healthcare & clinics':
        return <HealthcareDashboardClient />;
      case 'saas & web apps':
        return <SaaSDashboardClient />;
      case 'media & entertainment':
        return <MediaDashboardClient />;
      case 'finance & legal':
        return <FinanceDashboardClient />;
      case 'automotive':
        return <AutomotiveDashboardClient />;
      case 'travel & tourism':
        return <TravelDashboardClient />;
      case 'fitness & wellness':
        return <FitnessDashboardClient />;
      case 'marketplace':
        return <MarketplaceDashboard />;
        
      default:
        return <UncategorizedDashboard />;
    }
  }
}