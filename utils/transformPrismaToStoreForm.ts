
import { StoreForm, Location, CompanyLocationType } from '../types/typings'; // Ensure Location and CompanyLocationType are imported

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
    geoLocation: typeof raw.geoLocation === 'string'
      ? JSON.parse(raw.geoLocation)
      : raw.geoLocation,
    openingHours: typeof raw.openingHours === 'string'
      ? JSON.parse(raw.openingHours)
      : raw.openingHours,
    socialLinks: raw.socialLinks.map((s: any) => ({
      id: s.id,
      channel: s.channel,
      url: s.url,
    })),
    policies: raw.policies.map((p: any) => ({
      id: p.id,
      type: p.type,
      title: p.title ?? undefined,
      content: p.content,
    })),
    faqs: raw.faqs.map((f: any) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      order: f.order,
    })),
    testimonials: raw.testimonials.map((t: any) => ({
      id: t.id,
      author: t.author,
      quote: t.quote,
      rating: t.rating ?? undefined,
      avatarUrl: t.avatarUrl ?? undefined,
      order: t.order,
    })),
    heroSlides: raw.heroSlides.map((h: any) => ({
      id: h.id,
      imageUrl: h.imageUrl,
      headline: h.headline ?? '',
      subline: h.subline ?? '',
      ctaText: h.ctaText ?? '',
      ctaLink: h.ctaLink ?? '',
      order: h.order,
    })),
    promotions: raw.promotions.map((p: any) => ({
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
    storeCategories: raw.StoreCategory.map((sc: any) => ({
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
    marketplaceListings: raw.marketplaceListings.map((m: any) => ({
      id: m.id,
      title: m.title,
      name: m.name,
      description: m.description ?? '',
      finalPrice: m.finalPrice ?? 0,
      images: Array.isArray(m.images)
        ? m.images.filter((img: any): img is string => typeof img === 'string' && img !== null)
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
            ? m.product.color.filter((c: any): c is string => typeof c === 'string' && c !== null)
            : [],
          size: Array.isArray(m.product.size)
            ? m.product.size.filter((s: any): s is string => typeof s === 'string' && s !== null)
            : [],
        }
        : undefined,
    })),

    currency: raw.currency ?? 'KES',
    locale: raw.locale ?? 'en-US',
    blogs: Array.isArray(raw.blogs) ? raw.blogs.map((b: any) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      content: b.content,
      coverImage: b.coverImage ?? '',
      categories: b.categories ?? [],
      tags: b.tags ?? [],
      author: b.author ? {
        name: b.author.name,
        profileImage: b.author.profileImage,
      } : undefined,
      status: b.status,
      publishedAt: b.publishedAt,
    })) : [],

    pageSections: Array.isArray(raw.PageSection) ? raw.PageSection : [],
    appPromos: Array.isArray(raw.appPromos) ? raw.appPromos : [],
    events: Array.isArray(raw.events) ? raw.events : [],
    collections: Array.isArray(raw.Collection) ? raw.Collection : [],
    announcements: Array.isArray(raw.Announcement) ? raw.Announcement : [],

    awards: Array.isArray(raw.awards) ? raw.awards : typeof raw.awards === 'string' ? JSON.parse(raw.awards) : [],
    metrics: Array.isArray(raw.metrics) ? raw.metrics : typeof raw.metrics === 'string' ? JSON.parse(raw.metrics) : [],
    stats: Array.isArray(raw.stats) ? raw.stats : typeof raw.stats === 'string' ? JSON.parse(raw.stats) : [],

    themeSettings: typeof raw.themeSettings === 'string'
      ? JSON.parse(raw.themeSettings)
      : raw.themeSettings ?? {},

    pricingTiers: Array.isArray(raw.pricingTiers)
      ? raw.pricingTiers
      : typeof raw.pricingTiers === 'string'
        ? JSON.parse(raw.pricingTiers)
        : [],

    writers: Array.isArray(raw.Writer)
      ? raw.Writer
      : [],
    agents: Array.isArray(raw.salesAgents)
      ? raw.salesAgents
      : [],
    // Correctly map the Doctor array to the doctors key
    doctors: Array.isArray(raw.Doctor)
      ? raw.Doctor.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.User.name, // Assuming the doctor's name is on a nested User object
          subtitle: doctor.specialty,
          imageUrl: doctor.profilePicture,
          specializations: [], // Assuming no specializations array on the doctor object
        }))
      : [],
    podcasts: Array.isArray(raw.Podcast)
      ? raw.Podcast
      : [],
    // Correctly map the services array to the services key
    services: Array.isArray(raw.services)
      ? raw.services.map((service: any) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        icon: 'StethoscopeIcon' // You might need a way to map icons from your data
      }))
      : [],
    companyLocations: Array.isArray(raw.CompanyLocation)
      ? raw.CompanyLocation.map((cl: CompanyLocationType & { location: Location }) => ({
        id: cl.location.id,
        name: cl.displayName ?? cl.location.name,
        slug: cl.location.slug,
        description: cl.location.description,
        addressLine1: cl.addressLine1Override ?? cl.location.addressLine1,
        addressLine2: cl.addressLine2Override ?? cl.location.addressLine2,
        city: cl.cityOverride ?? cl.location.city,
        state: cl.stateOverride ?? cl.location.state,
        postalCode: cl.postalCodeOverride ?? cl.location.postalCode,
        country: cl.countryOverride ?? cl.location.country,
        latitude: cl.latitudeOverride ?? cl.location.latitude,
        longitude: cl.longitudeOverride ?? cl.location.longitude,
        seoTitle: cl.location.seoTitle,
        seoDescription: cl.location.seoDescription,
        metaKeywords: cl.location.metaKeywords,
        sortOrder: cl.sortOrder ?? cl.location.sortOrder,
        visible: cl.visible ?? cl.location.visible,
        createdAt: cl.location.createdAt,
        updatedAt: cl.location.updatedAt,
        createdBy: cl.location.createdBy,
        updatedBy: cl.location.updatedBy,
        status: cl.location.status,
        parentId: cl.location.parentId,
        children: cl.location.children,
        localization: cl.location.localization,
        attributes: cl.location.attributes,
      }))
      : [],
    courses: [],
  };
}
