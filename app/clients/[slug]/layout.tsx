// app/[slug]/layout.tsx
import prisma from '@/server/db/prismadb';
import { StoreContextProvider } from '@/contexts/StoreContext';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { StoreForm, SocialChannel, PolicyType } from '@/types/typings';
// import Header from '@/components/site/header/Header';
// import Footer from '../../components/site/footer/Footer';

export default async function StoreLayout({
  params,
  children,
}: {
  params: { slug: string };
  children: ReactNode;
}) {
  const raw = await prisma.company.findUnique({
    where: { slug: String(params?.slug) },
    include: {
      marketplaceListings: {
        take: 8,
        select: {
          id: true,
          name: true,
          finalPrice: true,
          images: true,
          // slug: true
        }
      },
      StoreCategory: {
        orderBy: { sortOrder: 'asc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              icon: true,
            }
          }
        }
      },
      socialLinks: true,
      policies: true,
      faqs: true,
      testimonials: true,
      heroSlides: true,
      promotions: true
    }
  });

  if (!raw) return notFound();

  const store = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
    category: raw.category,
    logoUrl: raw.logoUrl ?? null,
    bannerUrl: raw.bannerUrl ?? null,
    contactEmail: raw.contactEmail,
    contactPhone: raw.contactPhone ?? null,
    address: raw.address ?? null,
    themeSettings: (typeof raw.themeSettings === 'object' && raw.themeSettings !== null && !Array.isArray(raw.themeSettings))
      ? (raw.themeSettings as Record<string, any>)
      : null,
        StoreCategory: raw.StoreCategory?.map(sc => ({
          id: sc.category.id,
          categoryId: sc.categoryId ?? sc.category.id,
          name: sc.displayName || sc.category.name,
          imageUrl: sc.category.image ?? '/placeholder.png',
          slug: sc.category.slug,
          icon: sc.icon ?? sc.category.icon ?? undefined,
          sortOrder: sc.sortOrder ?? 0,
          visible: typeof sc.visible === 'boolean' ? sc.visible : true,
          subcategories: Array.isArray(sc.subcategories) ? (sc.subcategories as any[]) : [],
          allBrands: Array.isArray(sc.allBrands) ? (sc.allBrands as any[]) : []
        })),
    
        socialLinks: raw.socialLinks.map(s => ({ channel: (s.channel as unknown) as SocialChannel, url: s.url })),
        policies: raw.policies.map(p => ({ type: (p.type as unknown) as PolicyType,
                                            title: p.title ?? undefined,
                                            content: p.content })),
    // socialLinks: raw.socialLinks,
  //   // policies: raw.policies,
  //   // shippingZones: raw.shippingZones,
  //   // domain: raw.domain,
  //   // currency: raw.currency,
  //   // locale: raw.locale,
    faqs: raw.faqs.map(f => ({ question: f.question, answer: f.answer })),
    testimonials: raw.testimonials.map(t => ({
      author: null,
      quote: t.quote,
      avatarUrl: t.avatarUrl ?? undefined,
      rating: t.rating ?? undefined,
    })),
    heroSlides: raw.heroSlides.map(b => ({
      id: b.id,
      companyId: b.companyId ?? raw.id,
      imageUrl: b.imageUrl ?? null,
      order: typeof b.order === 'number' ? b.order : 0,
      productImageUrl: b.productImageUrl ?? null,
      headline: b.headline ?? null,
      subline: b.subline ?? null,
      ctaText: b.ctaText ?? null,
      ctaLink: b.ctaLink ?? null,
      active: typeof (b as any).active === 'boolean' ? (b as any).active : true,
      backgroundColor: b.backgroundColor ?? null,
      textColor: b.textColor ?? null,
      altText: (b as any).altText ?? null,
      videoLink: b.videoLink ?? null,
      badgeText: b.badgeText ?? null,
      price: typeof b.price === 'number' ? b.price : null,
      endsAt: b.endsAt ?? null,
      iconKey: b.iconKey ?? null
    })),
    promotions: raw.promotions.map(p => ({
      companyId: p.companyId ?? raw.id,
      code: p.code ?? undefined,
      title: p.title,
      description: p.description ?? undefined,
      perks: Array.isArray((p as any).perks) ? (p as any).perks : [],
      trustLogos: Array.isArray((p as any).trustLogos) ? (p as any).trustLogos : [],
      startsAt: p.startsAt ?? null,
      endsAt: p.endsAt ?? null,
      bannerUrl: p.bannerUrl ?? undefined,
    })),
    products: raw.marketplaceListings.map(p => ({
      id: p.id,
      name: p.name,
      price: p.finalPrice ?? 0,
      imageUrl: (typeof p.images[0] === 'object' && p.images[0] !== null && 'url' in p.images[0])
        ? (p.images[0] as { url: string }).url
        : '/placeholder.png',
      // slug: p.slug
    })),
  };

  return (
    <StoreContextProvider initialStore={store as unknown as StoreForm} userRole={''} userId={''}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* <Header store={store} /> */}
        {children}
        {/* <Footer store={store}/> */}
      </div>
    </StoreContextProvider>
  );
}
