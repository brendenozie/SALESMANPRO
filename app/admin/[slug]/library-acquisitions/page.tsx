import LibraryAcquisitionsClient from "./LibraryAcquisitionsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibraryAcquisitionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const raw = await prisma.libraryAcquisition.findMany({
    where: { companyId },
    orderBy: { updatedAt: "desc" },
  });

  const initialOrders = raw.map((o) => ({
    id: o.id,
    title: o.title,
    qty: o.qty,
    cost: o.cost,
    status: o.status,
    vendor: o.vendor,
    date: new Date(o.updatedAt).toLocaleDateString(),
  }));

  return <LibraryAcquisitionsClient initialOrders={JSON.parse(JSON.stringify(initialOrders))} schoolId={companyId} />;
}
