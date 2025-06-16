
// app/admin/[slug]/page.tsx
import { redirect } from 'next/navigation';
import { getAuthSession } from '../../../lib/auth';
import prisma from '@/server/db/prismadb';
import { normalizeCategory } from '@/utils/normalizeCategory';
import EcomDashboardClient, { DashboardData } from '@/components/admin/EcomDashboardClient';
import RealEstateDashboardClient from '@/components/admin/RealEstateDashboardClient';
// import ServicesDashboardClient from '@/components/admin/ServicesDashboardClient';
import AutomotiveDashboardClient from '@/components/admin/AutomotiveDashboardClient';
import BlogDashboardClient from '@/components/admin/BlogDashboardClient';
import DirectoryDashboardClient from '@/components/admin/DirectoryDashboardClient';
import EducationDashboardClient from '@/components/admin/EducationDashboardClient';
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
import PrincipalDashboard from '@/components/admin/PrincipalDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({ params }: { params: { slug: string } }) {
  const session = await getAuthSession();
  // if (!session?.user?.id || session.user.role?.toLowerCase() !== 'admin') redirect('/');

  // 1. Fetch store data for category
  const store = await prisma.company.findUnique({
    where: { id: params.slug },
    select: { category: true },
  });

  if (!store) throw new Error('Store not found');

  const categoryKey = normalizeCategory(store.category);

  // 2. Fetch dashboard metrics
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/${params.slug}`,
    { cache: 'no-store' }
  );

  if (!res.ok) throw new Error('Failed to load dashboard data');

  const data = (await res.json()) as DashboardData;

  // 3. Render appropriate client component per category
  switch (categoryKey) {
    case 'e-commerce':
      return <EcomDashboardClient {...data} />; //session={session} 
    case 'real estate':
      return <RealEstateDashboardClient  />;//{...data} session={session}
    case 'service provider':
      return <ServiceProviderDashboard />
    case 'booking & appointments':
      return <BookingAppointmentsDashboard />; // {...data} session={session} 
    case 'portfolio & personal branding':
      return <PortfolioDashboardClient  />; // {...data} session={session} TODO: Replace with <PortfolioDashboardClient />
    case 'blog & content':
      return <BlogDashboardClient />; //  {...data} session={session} TODO: Replace with <BlogDashboardClient />
    case 'directory & listings':
      return <DirectoryDashboardClient/>; //  {...data} session={session}  TODO: Replace with <DirectoryDashboardClient />
    case 'educational & online courses':
      return <EducationDashboardClient/>; // {...data} session={session}  TODO: Replace with <EducationDashboardClient />
    case 'nonprofit & community':
      return <NonprofitDashboardClient/>; //  {...data} session={session} TODO: Replace with <NonprofitDashboardClient />
    case 'restaurant & food delivery':
      return <RestaurantDashboardClient />; //  {...data} session={session} TODO: Replace with <RestaurantDashboardClient />
    case 'event & ticketing':
      return <EventDashboardClient />; //  {...data} session={session} TODO: Replace with <EventDashboardClient />
    case 'healthcare & clinics':
      return <HealthcareDashboardClient />; // {...data} session={session}  TODO: Replace with <HealthcareDashboardClient />
    case 'saas & web apps':
      return <SaaSDashboardClient/>; //  {...data} session={session} TODO: Replace with <SaaSDashboardClient />
    case 'media & entertainment':
      return <MediaDashboardClient/>; //  {...data} session={session}  TODO: Replace with <MediaDashboardClient />
    case 'finance & legal':
      return <FinanceDashboardClient/>; //  {...data} session={session}  TODO: Replace with <FinanceDashboardClient />
    case 'automotive':
      return <AutomotiveDashboardClient />; //  {...data} session={session} TODO: Replace with <AutomotiveDashboardClient />
    case 'travel & tourism':
      return <TravelDashboardClient/>; //  {...data} session={session}  TODO: Replace with <TravelDashboardClient />
    case 'fitness & wellness':
      return <FitnessDashboardClient/>; //  {...data} session={session} TODO: Replace with <FitnessDashboardClient />
    case 'marketplace':
      return <MarketplaceDashboard />; //  {...data} session={session}
    case 'tutors':
    case 'lecturer':
    case 'teacher':
      return <TutorDashboard />; //  {...data} session={session}
    case 'students':
    case 'pupils':
      return <StudentDashboard />; //  {...data} session={session}
    case 'head teacher':
    case 'school head':
      return <PrincipalDashboard />; //  {...data} session={session}
    default:
      return <UncategorizedDashboard />; // {...data} session={session} 
  }
  
}

