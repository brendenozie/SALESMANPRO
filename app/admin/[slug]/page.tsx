// app/admin/[slug]/page.tsx
import { redirect } from 'next/navigation';
import { getAuthSession } from '../../../lib/auth';
import prisma from '@/server/db/prismadb';
import { normalizeCategory } from '@/utils/normalizeCategory';
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
import TutorDashboard from '@/components/admin/TutorDashboard';
import StudentDashboard from '@/components/admin/StudentDashboard';
import UncategorizedDashboard from '../../../components/admin/AdminDashClient';
import PrincipalDashboard, { PrincipalDashboardData } from '@/components/admin/PrincipalDashboard'; // Import the new type

export const dynamic = 'force-dynamic';

// IMPORTANT: In a real application, the currentUserId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_USER_ID = "USR001"; // Replace with a real user ID from your DB for testing

export default async function AdminDashboardPage({ params }: { params: { slug: string } }) {
  const session = await getAuthSession();
  // if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') redirect('/');

  // 1. Fetch store data for category
  const companyId = params.slug;
  const currentUserId = MOCK_CURRENT_USER_ID; // Get current user ID from session in real app

  const store = await prisma.company.findUnique({
    where: { id: companyId },
    select: { category: true },
  });

  if (!store) throw new Error('Store not found');

  const categoryKey = normalizeCategory(store.category);

  // 2. Fetch dashboard metrics
  let dashboardData: DashboardData | null = null;
  let principalDashboardData: PrincipalDashboardData | null = null;
  let fetchError: boolean = false;

  try {
    // Fetch general dashboard data (if needed for other dashboards)
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

    // Fetch Principal-specific dashboard data if the category matches
    if (categoryKey === 'educational & online courses' || categoryKey === 'head teacher' || categoryKey === 'school head') {
      const principalRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/principal?companyId=${encodeURIComponent(companyId)}&userId=${encodeURIComponent(currentUserId)}`,
        { cache: 'no-store' }
      );
      if (principalRes.ok) {
        principalDashboardData = (await principalRes.json()) as PrincipalDashboardData;
      } else {
        console.error(`[AdminDashboardPage] Failed to fetch principal dashboard data: ${principalRes.status} ${principalRes.statusText}`);
        fetchError = true; // Mark as error even if only principal data fails
      }
    }

  } catch (err: any) {
    console.error("AdminDashboardPage-fetch error:", err.message);
    fetchError = true;
  }

  // Fallback for general dashboard data if fetch failed
  if (!dashboardData || fetchError) { // Re-check fetchError after all fetches
    console.warn("Using fallback data for general dashboard.");
    dashboardData = {
      clientData: { newClients: 0 },
      inventoryData: { lowStock: 0 },
      agentData: { topAgent: '', topAgentSales: 0 },
      communicationData: { today: 0 },
      orderData: { completedToday: 0 },
      salesData: {
        todaySales: 0,
        monthlyTargetProgress: 0,
        leadsConverted: 0,
        demosConducted: 0,
        commissionEarned: 0,
      },
      taskData: { tasks: [] },
    };
  }

  // Fallback for principal dashboard data if fetch failed or not applicable
  if (!principalDashboardData && (categoryKey === 'educational & online courses' || categoryKey === 'head teacher' || categoryKey === 'school head')) {
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
  }


  // 3. Render appropriate client component per category
  switch (categoryKey) {
    case 'e-commerce':
      return <EcomDashboardClient {...(dashboardData as DashboardData)} />;
    case 'real estate':
      return <RealEstateDashboardClient />;
    case 'service provider':
      return <ServiceProviderDashboard />
    case 'booking & appointments':
      return <BookingAppointmentsDashboard />;
    case 'portfolio & personal branding':
      return <PortfolioDashboardClient />;
    case 'blog & content':
      return <BlogDashboardClient />;
    case 'directory & listings':
      return <DirectoryDashboardClient/>;
    case 'nonprofit & community':
      return <NonprofitDashboardClient/>;
    case 'restaurant & food delivery':
      return <RestaurantDashboardClient />;
    case 'event & ticketing':
      return <EventDashboardClient />;
    case 'healthcare & clinics':
      return <HealthcareDashboardClient />;
    case 'saas & web apps':
      return <SaaSDashboardClient/>;
    case 'media & entertainment':
      return <MediaDashboardClient/>;
    case 'finance & legal':
      return <FinanceDashboardClient/>;
    case 'automotive':
      return <AutomotiveDashboardClient />;
    case 'travel & tourism':
      return <TravelDashboardClient/>;
    case 'fitness & wellness':
      return <FitnessDashboardClient/>;
    case 'marketplace':
      return <MarketplaceDashboard />;
    case 'tutors':
    case 'lecturer':
    case 'teacher':
      return <TutorDashboard />;
    case 'students':
    case 'pupils':
      return <StudentDashboard />;
    case 'educational & online courses':
    case 'head teacher':
    case 'school head':
      return <PrincipalDashboard {...(principalDashboardData as PrincipalDashboardData)} companyId={companyId} currentUserId={currentUserId} />;
    default:
      return <UncategorizedDashboard/>; // {...(dashboardData as DashboardData)} 
  }
}
