// utils/transformPrismaToStoreForm.ts
// import { Company } from '@prisma/client'; // or your generated types
import { StoreForm } from '../types/typings';

export function transformCompanyToStoreForm(raw: any): StoreForm {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    hasWebsite: raw.hasWebsite,
    domain: raw.domain ?? '',
    tagline: raw.tagline ?? '',
    description: raw.description ?? '',
    category: raw.category,
    logoUrl: raw.logoUrl ?? '',
    bannerUrl: raw.bannerUrl ?? '',
    contactEmail: raw.contactEmail ?? '',
    contactPhone: raw.contactPhone ?? '',
    address: raw.address ?? '',
    geoLocation:
      typeof raw.geoLocation === 'string'
        ? JSON.parse(raw.geoLocation)
        : raw.geoLocation,
    openingHours:
      typeof raw.openingHours === 'string'
        ? JSON.parse(raw.openingHours)
        : raw.openingHours,
    socialLinks: raw.socialLinks.map((s:any) => ({
      id: s.id,
      channel: s.channel,
      url: s.url,
    })),
    policies: raw.policies.map((p:any) => ({
      id: p.id,
      type: p.type,
      title: p.title ?? undefined,
      content: p.content,
    })),
    faqs: raw.faqs.map((f:any) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      order: f.order,
    })),
    testimonials: raw.testimonials.map((t:any) => ({
      id: t.id,
      author: t.author,
      quote: t.quote,
      rating: t.rating ?? undefined,
      avatarUrl: t.avatarUrl ?? undefined,
      order: t.order,
    })),
    heroSlides: raw.heroSlides.map((h:any) => ({
      id: h.id,
      imageUrl: h.imageUrl,
      headline: h.headline ?? '',
      subline: h.subline ?? '',
      ctaText: h.ctaText ?? '',
      ctaLink: h.ctaLink ?? '',
      order: h.order,
    })),
    promotions: raw.promotions.map((p:any) => ({
      id: p.id,
      code: p.code ?? undefined,
      title: p.title,
      description: p.description ?? '',
      startsAt: p.startsAt?.toISOString() ?? undefined,
      endsAt: p.endsAt?.toISOString() ?? undefined,
      bannerUrl: p.bannerUrl ?? '',
    })),
    seo: raw.seo
      ? {
          id: raw.seo.id,
          title: raw.seo.title,
          description: raw.seo.description,
          keywords: raw.seo.keywords,
        }
      : {},
    analyticsConfig: raw.analyticsConfig
      ? {
          id: raw.analyticsConfig.id,
          googleTag: raw.analyticsConfig.googleTag ?? '',
          facebookTag: raw.analyticsConfig.facebookTag ?? '',
        }
      : {},
    paymentSettings: raw.paymentSettings
      ? {
          id: raw.paymentSettings.id,
          stripeKey: raw.paymentSettings.stripeKey ?? '',
          paypalKey: raw.paymentSettings.paypalKey ?? '',
          mpesaShortcode: raw.paymentSettings.mpesaShortcode ?? '',
          mpesaConsumerKey: raw.paymentSettings.mpesaConsumerKey ?? '',
          mpesaConsumerSecret: raw.paymentSettings.mpesaConsumerSecret ?? '',
          mpesaCallbackUrl: raw.paymentSettings.mpesaCallbackUrl ?? '',
        }
      : {},
    shippingSettings: raw.shippingSettings
      ? {
          id: raw.shippingSettings.id,
          carrierName: raw.shippingSettings.carrierName ?? '',
          trackingUrl: raw.shippingSettings.trackingUrl ?? '',
          regions: raw.shippingSettings.regions ?? [],
          enablePickup: raw.shippingSettings.enablePickup ?? false,
          pickupInstructions: raw.shippingSettings.pickupInstructions ?? '',
        }
      : {},
    storeCategories: raw.StoreCategory.map((sc:any) => ({
      id: sc.categoryId,
      name: sc.displayName ?? sc.category.name,
      icon: sc.icon ?? undefined,
      items: Array.isArray(sc.items)
        ? sc.items
        : typeof sc.items === 'string'
        ? JSON.parse(sc.items)
        : [],
      sortOrder: sc.sortOrder,
      visible: sc.visible,
    })),
    marketplaceListings: raw.marketplaceListings.map((m:any) => ({
      id: m.id,
      title: m.title,
      name: m.name,
      description: m.description ?? '',
      finalPrice: m.finalPrice ?? 0,
      images: Array.isArray(m.images)
        ? m.images.filter((img:any): img is string => typeof img === 'string' && img !== null)
        : [],
      isAvailable: m.isAvailable,
      isFeatured: m.isFeatured,
      product: m.product
        ? {
            id: m.product.id,
            name: m.product.name,
            description: m.product.description ?? '',
            brand: m.product.brand ?? undefined,
            color: Array.isArray(m.product.color)
              ? m.product.color.filter((c:any): c is string => typeof c === 'string' && c !== null)
              : [],
            size: Array.isArray(m.product.size)
              ? m.product.size.filter((s:any): s is string => typeof s === 'string' && s !== null)
              : [],
          }
        : undefined,
    })),
    awards: Array.isArray(raw.awards) ? raw.awards : typeof raw.awards === 'string' ? JSON.parse(raw.awards) : undefined,
    metrics: Array.isArray(raw.metrics) ? raw.metrics : typeof raw.metrics === 'string' ? JSON.parse(raw.metrics) : undefined,
    stats: Array.isArray(raw.stats) ? raw.stats : typeof raw.stats === 'string' ? JSON.parse(raw.stats) : undefined,
    themeSettings:
      typeof raw.themeSettings === 'string'
        ? JSON.parse(raw.themeSettings)
        : raw.themeSettings ?? undefined,
    pricingTiers: Array.isArray(raw.pricingTiers)
      ? raw.pricingTiers
      : typeof raw.pricingTiers === 'string'
      ? JSON.parse(raw.pricingTiers)
      : [],
  };
}
