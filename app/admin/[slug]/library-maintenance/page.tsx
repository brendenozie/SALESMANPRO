import MaintenanceClient from "./MaintenanceClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibraryMaintenancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const raw = await prisma.libraryBook.findMany({
    where: { companyId },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  const initialBooks = raw.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    isbn: b.isbn || "N/A",
    shelfLocation: b.shelfLocation || b.location || "Unassigned",
    integrity: b.integrity ?? 100,
    condition: b.condition || "Good",
    status: b.status,
    lastAudit: b.lastAudit ? new Date(b.lastAudit).toLocaleDateString() : new Date().toLocaleDateString(),
  }));

  return <MaintenanceClient schoolId={companyId} initialBooks={JSON.parse(JSON.stringify(initialBooks))} />;
}
