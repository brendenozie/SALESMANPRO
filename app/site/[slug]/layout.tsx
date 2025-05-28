import { notFound } from 'next/navigation';
import prisma from '../../../server/db/prismadb';
import { ReactNode } from 'react';
import { StoreContextProvider, Store } from '../../../contexts/StoreContext';

// Layout imports
import ServicesLayout from '@/components/site/layouts/ServicesLayout/ServicesLayout';
import EcommerceLayout from '@/components/site/layouts/EcommerceLayout/EcommerceLayout';
import BookingsLayout from '@/components/site/layouts/BookingsLayout/BookingsLayout';
import DefaultLayout from '@/components/site/layouts/DefaultLayout/DefaultLayout';
import RealEstateLayout from '@/components/site/layouts/RealEstateLayout/RealEstateLayout';
import PortfolioLayout from '@/components/site/layouts/PortfolioLayout/PortfolioLayout';
import BlogLayout from '@/components/site/layouts/BlogLayout/BlogLayout';
import CoursesLayout from '@/components/site/layouts/CoursesLayout/CoursesLayout';
import DirectoryLayout from '@/components/site/layouts/DirectoryLayout/DirectoryLayout';
import EventsLayout from '@/components/site/layouts/EventsLayout/EventsLayout';
import FinanceLayout from '@/components/site/layouts/FinanceLayout/FinanceLayout';
import FitnessLayout from '@/components/site/layouts/FitnessLayout/FitnessLayout';
import HealthcareLayout from '@/components/site/layouts/HealthcareLayout/HealthcareLayout';
import MarketplaceLayout from '@/components/site/layouts/MarketplaceLayout/MarketplaceLayout';
import NonprofitLayout from '@/components/site/layouts/NonprofitLayout/NonprofitLayout';
import MediaLayout from '@/components/site/layouts/MediaLayout/MediaLayout';
import TravelLayout from '@/components/site/layouts/TravelLayout/TravelLayout';
import RestaurantLayout from '@/components/site/layouts/RestaurantLayout/RestaurantLayout';
import AutomotiveLayout from '@/components/site/layouts/AutomotiveLayout/AutomotiveLayout';
import SaaSLayout from '@/components/site/layouts/SaaSLayout/SaaSLayout';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const raw = await prisma.company.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      description: true,
      logoUrl: true,
    },
  });

  if (!raw) {
    return {
      title: 'Store not found',
      description: 'We couldn’t find that store.',
    };
  }

  return {
    title: `${raw.name} – Your One-Stop Shop`,
    description: raw.description ?? 'Discover our exclusive collection of products.',
    openGraph: {
      title: `${raw.name} – Shop`,
      description: raw.description ?? '',
      images: [
        {
          url: raw.logoUrl || 'https://via.placeholder.com/1200x630?text=Store',
          width: 1200,
          height: 630,
          alt: raw.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${raw.name} – Shop`,
      description: raw.description ?? '',
      images: [raw.logoUrl || 'https://via.placeholder.com/1200x630?text=Store'],
    },
  };
}

export default async function StoreLayout({
  params,
  children,
}: {
  params: { slug: string };
  children: ReactNode;
}) {
  const raw = await prisma.company.findUnique({
    where: { slug: params.slug },
    include: {
      MarketplaceListing: {
        take: 8,
        select: { id: true, title: true, finalPrice: true, images: true },
      },
      StoreCategory: {
        orderBy: { sortOrder: 'asc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true, image: true, icon: true },
          },
        },
      },
      socialLinks: true,
      policies: true,
      faqs: true,
      testimonials: true,
      heroSlides: true,
      promotions: true,
    },
  });

  if (!raw) return notFound();

  const store: Store = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? undefined,
    category: raw.category,
    logoUrl: raw.logoUrl ?? undefined,
    bannerUrl: raw.bannerUrl ?? undefined,
    contactEmail: raw.contactEmail,
    contactPhone: raw.contactPhone ?? undefined,
    address: raw.address ?? undefined,
    themeSettings: raw.themeSettings,
    StoreCategory: raw.StoreCategory.map((sc) => ({
      id: sc.category.id,
      name: sc.displayName || sc.category.name,
      imageUrl: sc.category.image ?? '/placeholder.png',
      slug: sc.category.slug,
      icon: sc.icon ?? sc.category.icon ?? undefined,
    })),
    socialLinks: raw.socialLinks.map((s) => ({
      channel: s.channel,
      url: s.url,
    })),
    policies: raw.policies.map((p) => ({
      type: p.type,
      title: p.title ?? undefined,
      content: p.content,
    })),
    faqs: raw.faqs.map((f) => ({
      question: f.question,
      answer: f.answer,
    })),
    testimonials: raw.testimonials.map((t) => ({
      author: t.author,
      quote: t.quote,
      avatarUrl: t.avatarUrl ?? undefined,
      rating: t.rating ?? undefined,
    })),
    heroSlides: raw.heroSlides.map((b) => ({
      imageUrl: b.imageUrl,
      headline: b.headline ?? undefined,
      subline: b.subline ?? undefined,
      ctaText: b.ctaText ?? undefined,
      ctaLink: b.ctaLink ?? undefined,
    })),
    promotions: raw.promotions.map((p) => ({
      code: p.code ?? undefined,
      title: p.title,
      description: p.description ?? undefined,
      startsAt: p.startsAt?.toISOString(),
      endsAt: p.endsAt?.toISOString(),
      bannerUrl: p.bannerUrl ?? undefined,
    })),
    products: raw.MarketplaceListing.map((p) => ({
      id: p.id,
      name: p.title,
      price: p.finalPrice ?? 0,
      imageUrl:
        Array.isArray(p.images) &&
        typeof p.images[0] === 'object' &&
        p.images[0] !== null &&
        'url' in p.images[0] &&
        typeof (p.images[0] as any).url === 'string'
          ? (p.images[0] as any).url
          : '/placeholder.png',
    })),
  };

  const type = (store?.category ?? 'default').toLowerCase();

  const renderWithLayout = (LayoutComponent: React.ComponentType<{ params: { store: Store }; children: ReactNode }>) => (
    <StoreContextProvider initialStore={store}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <LayoutComponent params={{ store }}>{children}</LayoutComponent>
      </div>
    </StoreContextProvider>
  );

  switch (type) {
    case 'services':
    case 'service provider':
      return renderWithLayout(ServicesLayout);

    case 'e-commerce':
    case 'ecommerce':
      return renderWithLayout(EcommerceLayout);

    case 'bookings':
    case 'booking & appointments':
      return renderWithLayout(BookingsLayout);

    case 'real estate':
      return renderWithLayout(RealEstateLayout);

    case 'portfolio':
    case 'portfolio & personal branding':
      return renderWithLayout(PortfolioLayout);

    case 'restaurant':
    case 'restaurant & food delivery':
      return renderWithLayout(RestaurantLayout);

    case 'blog':
    case 'blog & content':
      return renderWithLayout(BlogLayout);

    case 'directory':
    case 'directory & listings':
      return renderWithLayout(DirectoryLayout);
            
    case 'educational':
    case 'educational & online courses':
    case 'courses':
      return renderWithLayout(CoursesLayout);

    case 'nonprofit':
    case 'nonprofit & community':
      return renderWithLayout(NonprofitLayout);

    case 'event':
    case 'event & ticketing':
      return renderWithLayout(EventsLayout);

    case 'healthcare':
    case 'healthcare & clinics':
      return renderWithLayout(HealthcareLayout);

    case 'saas':
    case 'saas & web apps':
      return renderWithLayout(SaaSLayout);

    case 'automotive':
    case 'automotive':
      return renderWithLayout(AutomotiveLayout);

    case 'media':
    case 'media & entertainment':
      return renderWithLayout(MediaLayout);

    case 'finance':
    case 'finance & legal':
      return renderWithLayout(FinanceLayout);

    case 'travel':
    case 'travel & tourism':
      return renderWithLayout(TravelLayout);

    case 'fitness':
    case 'fitness & wellness':
      return renderWithLayout(FitnessLayout);

    case 'marketplace':
    case 'marketplace':
      return renderWithLayout(MarketplaceLayout);

    case 'other':
    case 'Other':
      return renderWithLayout(DefaultLayout);

    default:
      return renderWithLayout(DefaultLayout);
  }
}
