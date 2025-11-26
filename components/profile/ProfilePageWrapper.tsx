// components/profile/ProfilePageWrapper.tsx
// Server-side wrapper for profile pages with ISR support
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { findCompanyCached, pageDataInclude } from '@/lib/company-fetcher';
import ProfilePage from './ProfilePage';

interface ProfilePageWrapperProps {
  slug: string;
  vertical: string;
}

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

export async function getProfileData(slug: string) {
  const hdrs = await headers();
  const requestedHost = hdrs.get("x-requested-host");
  const requestedSubdomain = hdrs.get("x-requested-subdomain");

  const raw = await findCompanyCached(
    slug,
    requestedHost,
    requestedSubdomain,
    pageDataInclude()
  );

  return raw;
}

export default async function ProfilePageWrapper({ slug, vertical }: ProfilePageWrapperProps) {
  const company = await getProfileData(slug);

  if (!company) {
    notFound();
  }

  // Transform company data to initial profile format for client component
  const initialProfile = {
    profile: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      tagline: company.tagline,
      description: company.description,
      logoUrl: company.logoUrl,
      bannerUrl: company.bannerUrl,
      videoUrl: company.videoUrl,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      address: company.address,
      geoLocation: company.geoLocation as Record<string, number> | null,
      openingHours: company.openingHours as Record<string, unknown> | null,
      currency: company.currency,
      locale: company.locale,
      category: company.category,
      variant: company.variant,
      themeSettings: company.themeSettings as Record<string, unknown> | null,
      pricingTiers: company.pricingTiers as unknown[],
      awards: company.awards as unknown[] | null,
      metrics: company.metrics as unknown[] | null,
      stats: company.stats as unknown[] | null,
      highlights: company.highlights as unknown[] | null,
      founderName: company.founderName,
      founderQuote: company.founderQuote,
      founderImage: company.founderImage,
      partnerLogos: company.partnerLogos as unknown[] | null,
      sectionSubtitle: company.sectionSubtitle,
      sectionTitle: company.sectionTitle,
      sectionDescription: company.sectionDescription,
      createdAt: company.createdAt?.toISOString() || '',
      updatedAt: company.updatedAt?.toISOString() || '',
      seo: (company as any).SEO ? {
        id: (company as any).SEO.id,
        title: (company as any).SEO.title,
        description: (company as any).SEO.description,
        keywords: (company as any).SEO.keywords || [],
      } : null,
      socialLinks: ((company as any).socialLinks || []).map((link: any) => ({
        id: link.id,
        channel: link.channel || '',
        url: link.url,
      })),
      coreValues: ((company as any).CoreValues || []).map((value: any) => ({
        id: value.id,
        title: value.title,
        description: value.description,
        icon: value.icon,
      })),
      storeCategories: ((company as any).StoreCategory || []).map((sc: any) => ({
        id: sc.id,
        displayName: sc.displayName,
        icon: sc.icon,
        sortOrder: sc.sortOrder,
        visible: sc.visible,
        category: sc.category ? {
          id: sc.category.id,
          name: sc.category.name,
          slug: sc.category.slug,
          image: sc.category.image,
          icon: sc.category.icon,
        } : null,
      })),
      locations: ((company as any).CompanyLocation || []).map((cl: any) => ({
        id: cl.id,
        isPrimary: cl.isPrimary,
        location: cl.location ? {
          id: cl.location.id,
          name: cl.location.name,
          slug: cl.location.slug,
          parentId: cl.location.parentId,
          address: cl.location.address,
          city: cl.location.city,
          state: cl.location.state,
          country: cl.location.country,
          latitude: cl.location.latitude,
          longitude: cl.location.longitude,
        } : null,
      })),
    },
    team: {
      experts: (company as any).Expert || [],
      doctors: (company as any).Doctor || [],
      writers: (company as any).Writer || [],
      educators: (company as any).educators || [],
      salesAgents: (company as any).salesAgents || [],
    },
    faqs: ((company as any).faqs || []).map((faq: any) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      order: faq.order || 0,
    })),
  };

  return <ProfilePage slug={slug} vertical={vertical} initialProfile={initialProfile} />;
}
