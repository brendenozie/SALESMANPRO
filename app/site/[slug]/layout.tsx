// app/[slug]/layout.tsx
import { notFound } from 'next/navigation';
import prisma from '../../../server/db/prismadb';
import { ReactNode } from 'react';
import { useStore, StoreContextProvider, Store } from '../../../contexts/StoreContext';
import Header from '@/components/site/header/Header';
import Footer from '@/components/site/footer/Footer';

export const dynamic = 'force-dynamic'; // always fetch fresh

// Generate per‐store metadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
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

  return (
    <StoreContextProvider initialStore={store}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <Header store={store} />
        {children}
        <Footer store={store} />
      </div>
    </StoreContextProvider>
  );
}
