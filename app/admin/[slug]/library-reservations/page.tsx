import LibraryReservationsClient from "./LibraryReservationsClient";
import { format } from "date-fns";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibraryReservationsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const rawData = await prisma.libraryReservation.findMany({
    where: { book: { companyId } },
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
  });

  const bookQueues = {};
  const initialReservations = rawData.map((res) => {
    if (!bookQueues[res.bookId]) bookQueues[res.bookId] = [];
    bookQueues[res.bookId].push(res.id);

    const member = res.libraryMember;
    const memberName = member?.student
      ? `${member.student.firstName} ${member.student.lastName}`
      : member?.educator?.user?.name || "Unknown Member";

    const isReady = res.book.status === "AVAILABLE" || res.book.status === "RESERVED";

    return {
      id: res.id,
      book: res.book.title,
      member: memberName,
      memberEmail: member?.student?.contactEmail || member?.educator?.user?.email || "",
      requestDate: format(new Date(res.createdAt), "MMM dd, yyyy"),
      status: isReady ? 'Ready' : 'Pending',
      position: bookQueues[res.bookId].indexOf(res.id) + 1,
      expectedArrival: res.book.status === "ISSUED" ? "Within 14 days" : "Check Shelves",
    };
  });

  return (
    <LibraryReservationsClient
      initialReservations={JSON.parse(JSON.stringify(initialReservations))}
      schoolId={companyId}
    />
  );
}
