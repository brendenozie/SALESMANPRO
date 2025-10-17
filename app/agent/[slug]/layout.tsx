"use client";

// app/[slug]/layout.tsx
import prisma from '@/server/db/prismadb';
import { StoreContextProvider } from '@/contexts/StoreContext';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { StoreForm } from '@/types/typings';

export default async function StoreLayout({
  params,
  children,
}: {
  params: { slug: string };
  children: ReactNode;
}) {
  // ✅ Fetch the store (tenant) data
  // const raw = await prisma.company.findUnique({
  //   where: { slug: String(params?.slug) },
    // include: {
    //   marketplaceListings: {
    //     take: 8,
    //     select: {
    //       id: true,
    //       title: true,
    //       finalPrice: true,
    //       images: true,
    //     },
    //   },
    //   StoreCategory: {
    //     orderBy: { sortOrder: 'asc' },
    //     include: {
    //       category: {
    //         select: {
    //           id: true,
    //           name: true,
    //           slug: true,
    //           image: true,
    //           icon: true,
    //         },
    //       },
    //     },
    //   },
    //   socialLinks: true,
    //   policies: true,
    //   faqs: true,
    //   testimonials: true,
    //   heroSlides: true,
    //   promotions: true,
    // },
  // });

  // if (!raw) return notFound();

  // ✅ Normalize Prisma result into StoreForm structure
  // const store: StoreForm = {
  //   id: raw.id,
  //   name: raw.name,
  //   slug: raw.slug,
  //   description: raw.description ?? undefined,
  //   category: raw.category,
  //   logoUrl: raw.logoUrl ?? undefined,
  //   bannerUrl: raw.bannerUrl ?? undefined,
  //   contactEmail: raw.contactEmail ?? undefined,
  //   contactPhone: raw.contactPhone ?? undefined,
  //   address: raw.address ?? undefined,
  //   themeSettings: raw.themeSettings,

  //   StoreCategory: raw.StoreCategory?.map((sc) => ({
  //     id: sc.category.id,
  //     name: sc.displayName || sc.category.name,
  //     imageUrl: sc.category.image ?? '/placeholder.png',
  //     slug: sc.category.slug,
  //     icon: sc.icon ?? sc.category.icon ?? undefined,
  //   })) ?? [],

  //   socialLinks: raw.socialLinks?.map((s) => ({
  //     channel: s.channel,
  //     url: s.url,
  //   })) ?? [],

  //   policies: raw.policies?.map((p) => ({
  //     type: p.type,
  //     title: p.title ?? undefined,
  //     content: p.content ?? '',
  //   })) ?? [],

  //   faqs: raw.faqs?.map((f) => ({
  //     question: f.question,
  //     answer: f.answer,
  //   })) ?? [],

  //   testimonials: raw.testimonials?.map((t) => ({
  //     author: t.author,
  //     quote: t.quote,
  //     avatarUrl: t.avatarUrl ?? '/avatar-placeholder.png',
  //     rating: t.rating ?? 0,
  //   })) ?? [],

  //   heroSlides: raw.heroSlides?.map((b) => ({
  //     imageUrl: b.imageUrl ?? '/banner-placeholder.png',
  //     headline: b.headline ?? undefined,
  //     subline: b.subline ?? undefined,
  //     ctaText: b.ctaText ?? undefined,
  //     ctaLink: b.ctaLink ?? undefined,
  //   })) ?? [],

  //   promotions: raw.Promotion?.map((p) => ({
  //     code: p.code ?? undefined,
  //     title: p.title,
  //     description: p.description ?? undefined,
  //     startsAt: p.startsAt ? p.startsAt.toISOString() : undefined,
  //     endsAt: p.endsAt ? p.endsAt.toISOString() : undefined,
  //     bannerUrl: p.bannerUrl ?? '/banner-placeholder.png',
  //   })) ?? [],

  //   products: raw.marketplaceListings?.map((p) => ({
  //     id: p.id,
  //     name: p.title,
  //     price: p.finalPrice ?? 0,
  //     imageUrl:
  //       Array.isArray(p.images) && p.images.length > 0
  //         ? typeof p.images[0] === 'string'
  //           ? p.images[0]
  //           : (p.images[0] as { url: string }).url
  //         : '/placeholder.png',
  //   })) ?? [],
  // };

  // ✅ Provide store context to all children routes/pages
  return (
    // <StoreContextProvider
    //   initialStore={store}
    //   userRole={''}
    //   userId={''}
    // >
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        {/* Future: <Header store={store} /> */}
        {children}
        {/* Future: <Footer store={store} /> */}
      </div>
    // {/* </StoreContextProvider> */}
  );
}
