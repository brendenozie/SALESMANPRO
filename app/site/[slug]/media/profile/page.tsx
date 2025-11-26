// Functional profile page with ISR support - media
import { Suspense } from 'react';
import ProfilePageWrapper from '@/components/profile/ProfilePageWrapper';
import { Metadata, ResolvingMetadata } from 'next';
import { getProfileData } from '@/components/profile/ProfilePageWrapper';

// ISR revalidation time (5 minutes)
export const revalidate = 300;

// Dynamic params
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const company = await getProfileData(slug);
  
  if (!company) {
    return {
      title: 'Profile Not Found',
    };
  }

  return {
    title: `${company.name} - Profile`,
    description: company.description || company.tagline || `Profile page for ${company.name}`,
    openGraph: {
      title: company.name,
      description: company.description || '',
      images: company.logoUrl ? [company.logoUrl] : [],
    },
  };
}

function ProfileLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
}

export default async function ProfilePage({ params }: PageProps) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfilePageWrapper slug={slug} vertical="media" />
    </Suspense>
  );
}
