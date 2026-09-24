import LibraryCategoriesClient from "./LibraryCategoriesClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function LibraryCategoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const raw = await prisma.libraryCategory.findMany({
    where: { companyId },
    include: {
      _count: {
        select: { libraryBooks: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const initialCategories = raw.map((c) => ({
    id: c.id,
    name: c.name,
    count: c._count?.libraryBooks || 0,
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <LibraryCategoriesClient initialCategories={JSON.parse(JSON.stringify(initialCategories))} schoolId={companyId} />;
}
