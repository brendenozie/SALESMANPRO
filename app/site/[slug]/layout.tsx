import { notFound } from 'next/navigation';
import prisma from '../../../server/db/prismadb';
import { ReactNode } from 'react';
import { StoreContextProvider,} from '../../../contexts/StoreContext';

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
import { StoreForm } from '../../../types/typings';

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
      socialLinks: true,
      policies: true,
      faqs: true,
      testimonials: true,
      heroSlides: true,
      promotions: true,
      seo: true,

      // Now singular, not array:
      analyticsConfig: true,
      paymentSettings: true,
      shippingSettings: true,

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
    },
  });

  console.log(raw);

  if (!raw) return notFound();

  // ── Map the Prisma object into your StoreForm shape ──
    const storeFormData: StoreForm = {
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      domain: raw.domain ?? "",
      tagline: raw.tagline ?? "",
      description: raw.description ?? "",
      category: raw.category,
      logoUrl: raw.logoUrl ?? "",
      bannerUrl: raw.bannerUrl ?? "",
      contactEmail: raw.contactEmail ?? "",
      contactPhone: raw.contactPhone ?? "",
      address: raw.address ?? "",
      geoLocation:
        typeof raw.geoLocation === "string"
          ? JSON.parse(raw.geoLocation)
          : raw.geoLocation,
  
      openingHours:
        typeof raw.openingHours === "string"
          ? JSON.parse(raw.openingHours)
          : raw.openingHours,
  
      socialLinks: raw.socialLinks.map((s) => ({
        id: s.id,
        channel: s.channel,
        url: s.url,
      })),
  
      policies: raw.policies.map((p) => ({
        id: p.id,
        type: p.type,
        title: p.title ?? undefined,
        content: p.content,
      })),
  
      faqs: raw.faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        order: f.order,
      })),
  
      testimonials: raw.testimonials.map((t) => ({
        id: t.id,
        author: t.author,
        quote: t.quote,
        rating: t.rating ?? undefined,
        avatarUrl: t.avatarUrl ?? undefined,
        order: t.order,
      })),
  
      heroSlides: raw.heroSlides.map((h) => ({
        id: h.id,
        imageUrl: h.imageUrl,
        headline: h.headline ?? "",
        subline: h.subline ?? "",
        ctaText: h.ctaText ?? "",
        ctaLink: h.ctaLink ?? "",
        order: h.order,
      })),
  
      promotions: raw.promotions.map((p) => ({
        id: p.id,
        code: p.code ?? undefined,
        title: p.title,
        description: p.description ?? "",
        startsAt: p.startsAt?.toISOString() ?? undefined,
        endsAt: p.endsAt?.toISOString() ?? undefined,
        bannerUrl: p.bannerUrl ?? "",
      })),
  
      // ── ONE‐TO‐ONE: seo (always object for Record<string, any>) ──
      seo: raw.seo
        ? {
            id: raw.seo.id,
            title: raw.seo.title,
            description: raw.seo.description,
            keywords: raw.seo.keywords,
          }
        : {},
  
      // ── ONE‐TO‐ONE: analyticsConfig (or undefined) ──
      analyticsConfig: raw.analyticsConfig
        ? {
            id: raw.analyticsConfig.id,
            googleTag: raw.analyticsConfig.googleTag ?? "",
            facebookTag: raw.analyticsConfig.facebookTag ?? "",
            // companyId: store.analyticsConfig.companyId,
          }
        : {},
  
      // ── ONE‐TO‐ONE: paymentSettings (or undefined) ──
      paymentSettings: raw.paymentSettings
        ? {
            id: raw.paymentSettings.id,
            stripeKey: raw.paymentSettings.stripeKey ?? "",
            paypalKey: raw.paymentSettings.paypalKey ?? "",
            mpesaShortcode: raw.paymentSettings.mpesaShortcode ?? "",
            mpesaConsumerKey: raw.paymentSettings.mpesaConsumerKey ?? "",
            mpesaConsumerSecret: raw.paymentSettings.mpesaConsumerSecret ?? "",
            mpesaCallbackUrl: raw.paymentSettings.mpesaCallbackUrl ?? "",
            // companyId: store.paymentSettings.companyId,
          }
        : {},
  
      // ── ONE‐TO‐ONE: shippingSettings (or undefined) ──
      shippingSettings: raw.shippingSettings
        ? {
            id: raw.shippingSettings.id,
            carrierName: raw.shippingSettings.carrierName ?? "",
            trackingUrl: raw.shippingSettings.trackingUrl ?? "",
            regions: raw.shippingSettings.regions ?? [],
            enablePickup: raw.shippingSettings.enablePickup ?? false,
            pickupInstructions: raw.shippingSettings.pickupInstructions ?? "",
            // companyId: store.shippingSettings.companyId,
          }
        : {},
  
      // ── JUNCTION TABLE: StoreCategory[] ──
      storeCategories: raw.StoreCategory.map((sc) => ({
        id: sc.categoryId,
        name: sc.displayName ?? sc.category.name,
        icon: sc.icon ?? undefined,
        items: Array.isArray(sc.items)
          ? sc.items
          : typeof sc.items === "string"
          ? JSON.parse(sc.items)
          : [],
        sortOrder: sc.sortOrder,
        visible: sc.visible,
      })),
  
      awards: Array.isArray(raw.awards) ? raw.awards : typeof raw.awards === "string" ? JSON.parse(raw.awards) : undefined,
      metrics: Array.isArray(raw.metrics) ? raw.metrics : typeof raw.metrics === "string" ? JSON.parse(raw.metrics) : undefined,
      stats: Array.isArray(raw.stats) ? raw.stats : typeof raw.stats === "string" ? JSON.parse(raw.stats) : undefined,
      
      themeSettings:
        typeof raw.themeSettings === "string"
          ? JSON.parse(raw.themeSettings)
          : raw.themeSettings ?? undefined,
    };

  const type = (storeFormData?.category ?? 'default').toLowerCase();

  const renderWithLayout = (LayoutComponent: React.ComponentType<{ params: { storeFormData: StoreForm }; children: ReactNode }>) => (
    <StoreContextProvider initialStore={storeFormData}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <LayoutComponent params={{ storeFormData }}>{children}</LayoutComponent>
      </div>
    </StoreContextProvider>
  );

  switch (type) {

    case 'e-commerce':
    case 'ecommerce':
      return renderWithLayout(EcommerceLayout);

    case 'services':
    case 'service provider':
      return renderWithLayout(ServicesLayout);

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
