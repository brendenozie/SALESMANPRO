import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import AdminPromotionsClient from '../travel-promotions/AdminPromotionsClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertiesPromotionsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, 'page');

  if (!company) {
    return <div className="p-8 text-center text-slate-500">Company not found</div>;
  }

  const companyId = company.id;

  return <AdminPromotionsClient companyId={companyId} slug={slug} />;
}
