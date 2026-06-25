import { findCompanyCached } from '@/lib/company-fetcher';
import { notFound } from 'next/navigation';
import AboutClient from './AboutClient';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function AboutPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  
  // Note: searchParams extraction kept here if you need to pass them to the client later
  // const { page, search, category, sort } = await searchParams;
  
  const baseCompany = await findCompanyCached(slug, "page");
  if (!baseCompany) notFound();

  // Pass the fetched data down to the Client Component
  return <AboutClient baseCompany={baseCompany} />;
}