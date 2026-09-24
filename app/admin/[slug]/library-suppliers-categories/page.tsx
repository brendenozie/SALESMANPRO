import CategoryManagerClient from "./CategoryManagerClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibrarySuppliersCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const categoriesRaw = await prisma.librarySupplierCategory.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
  });

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
    <CategoryManagerClient 
      initialCategories={JSON.parse(JSON.stringify(initialCategories))} 
      schoolId={companyId} 
    />
  );
}
