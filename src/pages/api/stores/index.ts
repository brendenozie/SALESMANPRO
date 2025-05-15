// pages/api/stores.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/server/db/prismadb';

type StorePayload = {
  name: string;
  slug: string;
  domain?: string;
  tagline?: string;
  description?: string;
  category: string;
  logoUrl?: string;
  bannerUrl: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  geoLocation?: { lat: number; lng: number };
  openingHours?: Record<string, string>;
  socialLinks?: { channel: string; url: string }[];
  policies?: { type: string; title?: string; content: string }[];
  faqs?: { question: string; answer: string; order?: number }[];
  testimonials?: { author: string; quote: string; avatarUrl?: string; rating?: number; order?: number }[];
  heroSlides?: { imageUrl: string; headline: string; subline?: string; ctaText?: string; ctaLink?: string; order?: number }[];
  promotions?: { title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string }[];
  themeSettings?: Record<string, any>;
  seo?: { title?: string; description?: string; keywords?: string[] };
  analyticsConfig?: { googleTag?: string; facebookTag?: string };
  paymentSettings?: { stripeKey?: string; paypalKey?: string };
  shippingSettings?: { carrierName?: string; trackingUrl?: string };
  storeCategories?: { id: string; displayName?: string; sortOrder?: number; visible?: boolean }[];
};

type ErrorResponse = { field: string; message: string }[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { method, query, body } = req;
  const userId = query.ownerId as string | undefined;

  if (req.method === 'GET') {
    // Fetch all stores
    const where = userId ? { userId: userId } : {};

    const stores = await prisma.company.findMany({
      where,
      include: {
        socialLinks: true,
        policies: true,
        faqs: true,
        testimonials: true,
        heroSlides: true,
        promotions: true,
        seo: true,
        // analyticsConfig: true,
        // paymentSettings: true,
        // shippingSettings: true,
        // storeCategory: {
        //   include: { category: true }
        // }
      }
    });
    return res.status(200).json(stores);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const errors: ErrorResponse = [];

  // Required string fields Validation
  const requiredFields = ['name', 'slug', 'category', 'contactEmail', 'bannerUrl'] as const;
  for (const field of requiredFields) {
    const val = body[field];
    if (typeof val !== 'string' || !val.trim()) {
      errors.push({ field, message: `${field} is required and must be a non-empty string.` });
    }
  }

  // Email format
  if (
    body.contactEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactEmail)
  ) {
    errors.push({ field: 'contactEmail', message: 'Invalid email address.' });
  }

  // URL fields
  const urlFields: Array<keyof StorePayload> = ['bannerUrl', 'logoUrl', 'domain'];
  for (const field of urlFields) {
    const val = body[field];
    if (val) {
      try {
        if (typeof val === 'string') {
          new URL(val);
        } else {
          errors.push({ field, message: `${field} must be a valid URL.` });
        }
      } catch {
        errors.push({ field, message: `${field} must be a valid URL.` });
      }
    }
  }

  // geoLocation
  if (body.geoLocation) {
    const { lat, lng } = body.geoLocation as any;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      errors.push({ field: 'geoLocation', message: 'geoLocation.lat and lng must be numbers.' });
    }
  }

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  // Build data payload
  const data: any = {
    name: body.name!.trim(),
    slug: body.slug!.trim(),
    domain: body.domain?.trim(),
    tagline: body.tagline?.trim(),
    description: body.description?.trim(),
    category: body.category!.trim(),
    logoUrl: body.logoUrl?.trim(),
    bannerUrl: body.bannerUrl!.trim(),
    contactEmail: body.contactEmail!.trim(),
    contactPhone: body.contactPhone?.trim(),
    address: body.address?.trim(),
    geoLocation: body.geoLocation || undefined,
    openingHours: body.openingHours || undefined,
    themeSettings: body.themeSettings || undefined,
    user: { connect: { id: body.userId!.trim() } },
    // Nested creates
    socialLinks: body.socialLinks ? { create: body.socialLinks } : undefined,
    policies: body.policies ? { create: body.policies } : undefined,
    faqs: body.faqs ? { create: body.faqs } : undefined,
    testimonials: body.testimonials ? { create: body.testimonials } : undefined,
    heroSlides: body.heroSlides ? { create: body.heroSlides } : undefined,
    promotions: body.promotions ? { create: body.promotions.map(( p : any ) => ({
      title: p.title,
      description: p.description,
      startsAt: p.startsAt ? new Date(p.startsAt) : undefined,
      endsAt: p.endsAt ? new Date(p.endsAt) : undefined,
      bannerUrl: p.bannerUrl,
      // order: p.order
    })) } : undefined,
    seo: body.seo ? { create: body.seo } : undefined,
    AnalyticsConfig: body.analyticsConfig ? { create: body.analyticsConfig } : undefined,
    PaymentSettings: body.paymentSettings ? { create: body.paymentSettings } : undefined,
    ShippingSettings: body.shippingSettings ? { create: body.shippingSettings } : undefined,
    StoreCategory: body.storeCategories ? {
      create: body.storeCategories.map(( sc : any) => ({
        category: { connect: { id: sc.id } },
        displayName: sc.displayName,
        sortOrder: sc.sortOrder,
        visible: sc.visible
      }))
    } : undefined,
  };

  try {
    const store = await prisma.company.create({ data });
    return res.status(201).json(store);
  } catch (error) {
    console.error('Store creation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
