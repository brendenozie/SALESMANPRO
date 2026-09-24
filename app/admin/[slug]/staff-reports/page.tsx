import StaffReportsClient from "./StaffReportsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StaffReportsSSRPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  return (
    <StaffReportsClient companyId={companyId} />
  );
}