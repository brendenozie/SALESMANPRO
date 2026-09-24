import LibraryReturnsPageClient from "./LibraryReturnsPageClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibraryReturnsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const raw = await prisma.libraryIssuance.findMany({
    where: { companyId, status: "RETURNED" },
    include: {
      book: true,
      libraryMember: {
        include: {
          student: true,
          educator: { include: { user: true } },
        },
      },
    },
    orderBy: { returnDate: "desc" },
    take: 50,
  });

  const initialHistory = raw.map((iss) => {
    const member = iss.libraryMember;
    const memberName = member?.student
      ? `${member.student.firstName} ${member.student.lastName}`
      : member?.educator?.user?.name || "Library Member";

    return {
      id: iss.id,
      bookTitle: iss.book?.title || "Unknown Book",
      member: memberName,
      returnDate: iss.returnDate ? iss.returnDate.toISOString() : new Date().toISOString(),
      condition: iss.isDamaged ? "Damaged" : "Good",
    };
  });

  return <LibraryReturnsPageClient schoolId={companyId} initialHistory={JSON.parse(JSON.stringify(initialHistory))} />;
}
