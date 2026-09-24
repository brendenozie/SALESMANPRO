import IssuanceRecordsClient from "./IssuanceRecordsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LibraryIssuancePage({ params }: PageProps) {
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

  const [initialRecords, books, members] = await Promise.all([
    prisma.libraryIssuance.findMany({
      where: { companyId },
      include: {
        book: true,
        libraryMember: {
          include: {
            student: true,
            educator: { include: { user: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.libraryBook.findMany({
      where: { companyId },
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { title: "asc" },
    }),
    prisma.libraryMember.findMany({
      where: { companyId },
      include: {
        student: true,
        educator: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <IssuanceRecordsClient 
      initialRecords={JSON.parse(JSON.stringify(initialRecords))} 
      books={JSON.parse(JSON.stringify(books))} 
      members={JSON.parse(JSON.stringify(members))} 
      schoolId={companyId} 
    />
  );
}