import LibraryReportingClient from "./LibraryReportingClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";
import { startOfMonth, subMonths } from "date-fns";

export default async function LibraryReportsPage({ params }: { params: Promise<{ slug: string }> }) {
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

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));

  const [
    totalBooks,
    activeLoans,
    newMembers,
    totalFines,
    categoriesWithCount
  ] = await Promise.all([
    prisma.libraryBook.count({ where: { companyId } }).catch(() => 0),
    prisma.libraryIssuance.count({ where: { companyId, status: "ACTIVE" } }).catch(() => 0),
    prisma.libraryMember.count({ where: { companyId, createdAt: { gte: currentMonthStart } } }).catch(() => 0),
    prisma.libraryFine.aggregate({
      where: { status: "PAID", issuance: { companyId } },
      _sum: { amount: true }
    }).catch(() => ({ _sum: { amount: 0 } })),
    prisma.libraryCategory.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { books: true }
        }
      },
      take: 5
    }).catch(() => [])
  ]);

  const circulationRate = totalBooks > 0 ? ((activeLoans / totalBooks) * 100).toFixed(1) + "%" : "0%";
  const revenue = totalFines._sum?.amount ? `$${totalFines._sum.amount.toLocaleString()}` : "$0";

  const stats = {
    kpis: [
      { label: 'Circulation Rate', value: circulationRate, trend: '+0%', isPositive: true },
      { label: 'Avg. Lending Time', value: '14 Days', trend: '0 Days', isPositive: true },
      { label: 'Revenue Collected', value: revenue, trend: '+0%', isPositive: true },
      { label: 'New Members', value: String(newMembers), trend: '+0%', isPositive: true },
    ],
    categories: categoriesWithCount.map((c: any) => ({
      name: c.name,
      count: c._count.books
    })),
    trending: categoriesWithCount.slice(0, 3).map((c: any) => ({
      name: c.name,
      count: c._count.books,
      growth: '+0%'
    })),
    utilization: [30, 45, 60, 50, 70, 65, 80, 75, 85, 90]
  };

  return <LibraryReportingClient initialStats={JSON.parse(JSON.stringify(stats))} schoolId={companyId} />;
}