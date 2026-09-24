import DriversPageClient, { Driver } from "./DriversPageClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DriversPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  // Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = slug || session?.user?.id || '';

  // Retrieve the memoized company data
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const drivers = await prisma.transportDriver.findMany({
    where: { companyId },
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedDrivers: Driver[] = drivers.map(d => ({
    id: d.id,
    name: d.user?.name || "Driver",
    email: d.user?.email || "",
    phoneNumber: d.user?.phone || "",
    licenseNumber: d.licenseNo || "",
    licenseClass: "Class A",
    rating: 5,
    loginCode: d.loginCode || "",
    licenseExpiry: d.licenseExpiry ? d.licenseExpiry.toISOString().split('T')[0] : "",
    experienceYears: d.experienceYears || 0,
    status: (d.status === 'ACTIVE' ? 'AVAILABLE' : (d.status as any)) || 'AVAILABLE',
  }));

  return (
    <DriversPageClient
      initialDrivers={JSON.parse(JSON.stringify(formattedDrivers))}
      schoolId={companyId}
    />
  );
}