import { getAuthSession } from "@/lib/auth";
import TermsManagerClient from "./TermsManagerClient";
import { findCompanyCached } from "@/lib/company-fetcher";
import { serverFetch } from "@/lib/api/serverFetch";

export type Term = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type AcademicYear = {
  id: string;
  name: string;
  yearStart: string;
  yearEnd: string;
  isActive: boolean;
  terms: Term[];
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  const yearsRes = await serverFetch<AcademicYear[]>(
    `/api/admin/academic-years?companyId=${encodeURIComponent(companyId)}`
  );

  const years: AcademicYear[] = Array.isArray(yearsRes.data) ? yearsRes.data : [];

  return <TermsManagerClient years={years} companyId={companyId} />;
}