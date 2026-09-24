import LibrarySuppliersClient from "./LibrarySuppliersClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibrarySuppliersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const [suppliersRaw, categoriesRaw] = await Promise.all([
    prisma.librarySupplier.findMany({
      where: { companyId },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.librarySupplierCategory.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    }),
  ]);

  const initialSuppliers = suppliersRaw.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone || "N/A",
    category: s.category?.name || "General",
    contact: s.contactEmail,
    leadTime: s.leadTime || "7 Days",
    status: s.status || "Active",
    reliability: s.reliability ?? 100,
  }));

  const initialCategories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    phone: "N/A",
    category: c.name,
    contact: "",
    leadTime: "7 Days",
    status: "Active",
    reliability: 100,
  }));

  return (
    <LibrarySuppliersClient 
      initialSuppliers={JSON.parse(JSON.stringify(initialSuppliers))} 
      initialCategories={JSON.parse(JSON.stringify(initialCategories))}
      schoolId={companyId} 
    />
  );
}
