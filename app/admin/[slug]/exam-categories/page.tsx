import ExamCategoriesClient from "./ExamCategoriesClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

export default async function ExamCategoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  let initialCategories: any[] = [];
  try {
    initialCategories = await prisma.examCategory.findMany({
      where: { companyId },
      include: {
        company: true,
        _count: { select: { exams: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("[ExamCategoriesPage] Failed to load exam categories", err);
  }

  return (
    <ExamCategoriesClient 
      initialData={JSON.parse(JSON.stringify(initialCategories))} 
      schoolId={companyId} 
    />
  );
}