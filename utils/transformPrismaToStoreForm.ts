import { StoreForm, ILocation, ICompanyLocation } from "../types/typings"; // Ensure Location and CompanyLocationType are imported

// A safe utility to convert a Date or a string into an ISO string
function safeDateToString(
  date: Date | string | null | undefined,
): string | undefined {
  if (!date) {
    return undefined;
  }
  // If it's already a string, return it.
  if (typeof date === "string") {
    return date;
  }
  // If it has toISOString, it's a Date object.
  if (typeof date.toISOString === "function") {
    return date.toISOString();
  }
  // Otherwise, we can't be sure what it is.
  return undefined;
}

export function transformCompanyToStoreForm(raw: any): StoreForm {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    hasWebsite: raw.hasWebsite,
    domain: raw.domain ?? "",
    tagline: raw.tagline ?? "",
    description: raw.description ?? "",
    category: raw.category,
    variant: raw.variant ?? "",
    logoUrl: raw.logoUrl ?? "",
    bannerUrl: raw.bannerUrl ?? "",
    videoUrl: raw.videoUrl ?? "",
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
    socialLinks: raw.socialLinks?.map((s: any) => ({
      id: s.id,
      channel: s.channel,
      url: s.url,
    })),
    policies: raw.policies?.map((p: any) => ({
      id: p.id,
      type: p.type,
      title: p.title ?? undefined,
      content: p.content,
    })),
    faqs: raw.faqs?.map((f: any) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      order: f.order,
    })),
    testimonials: raw.testimonials?.map((t: any) => ({
      id: t.id,
      author: t.author,
      quote: t.quote,
      rating: t.rating ?? undefined,
      avatarUrl: t.avatarUrl ?? undefined,
      order: t.order,
    })),
    heroSlides: raw.heroSlides?.map((h: any) => ({
      id: h.id ?? "",
      imageUrl: h.imageUrl ?? "",
      productImageUrl: h.productImageUrl ?? "",
      headline: h.headline ?? "",
      subline: h.subline ?? "",
      badgeText: h.badgeText ?? "",
      ctaText: h.ctaText ?? "",
      ctaLink: h.ctaLink ?? "",
      order: h.order ?? 0,
      type: h.type ?? "image",
      videoLink: h.videoLink ?? "",
    })),
    promotions: raw.promotions?.map((p: any) => ({
      id: p.id,
      code: p.code ?? undefined,
      title: p.title,
      description: p.description ?? "",
      startsAt: safeDateToString(p.startsAt), //?.toISOString() ?? undefined,
      endsAt: safeDateToString(p.endsAt), //?.toISOString() ?? undefined,
      bannerUrl: p.bannerUrl ?? "",
      ctaText: p.ctaText ?? "",
      ctaLink: p.ctaLink ?? "",

      // New fields for richer site promotion
      featureImage1: p.featureImage1 ?? "",
      featureImage2: p.featureImage2 ?? "",
      featureImage3: p.featureImage3 ?? "",

      perks: p.perks ?? [],
      trustLogos: p.trustLogos ?? [],
      themePrimary: p.themePrimary ?? "",
    })),
    seo: raw.SEO
      ? {
          id: String(raw.SEO.id),
          title: raw.SEO.title ?? null,
          description: raw.SEO.description ?? null,
          keywords: Array.isArray(raw.SEO.keywords) ? raw.SEO.keywords : [],
        }
      : null,
    analyticsConfig: raw.AnalyticsConfig
      ? {
          id: String(raw.AnalyticsConfig.id),
          googleTag: raw.AnalyticsConfig.googleTag ?? "G-JQJSSHQD25",
          facebookTag: raw.AnalyticsConfig.facebookTag ?? null,
          hotjarSiteId: raw.AnalyticsConfig.hotjarSiteId ?? null,
          isActive:
            typeof raw.AnalyticsConfig.isActive === "boolean"
              ? raw.AnalyticsConfig.isActive
              : false,
        }
      : null,
    paymentSettings: raw.PaymentSettings
      ? ({
          id: String(raw.PaymentSettings.id),
          // legacy keys (kept for reference)
          // stripeKey: raw.PaymentSettings.stripeKey ?? null,
          // paypalKey: raw.PaymentSettings.paypalKey ?? null,
          // mpesa
          mpesaShortcode: raw.PaymentSettings.mpesaShortcode ?? null,
          mpesaPasskey: raw.PaymentSettings.mpesaPasskey ?? null,
          mpesaConsumerKey: raw.PaymentSettings.mpesaConsumerKey ?? null,
          mpesaConsumerSecret: raw.PaymentSettings.mpesaConsumerSecret ?? null,
          mpesaCallbackUrl: raw.PaymentSettings.mpesaCallbackUrl ?? null,

          // stripe
          isStripeEnabled: raw.PaymentSettings.isStripeEnabled ?? false,
          stripePublishableKey:
            raw.PaymentSettings.stripePublishableKey ?? null,
          stripeSecretKey: raw.PaymentSettings.stripeSecretKey ?? null,

          // paypal
          isPaypalEnabled: raw.PaymentSettings.isPaypalEnabled ?? false,
          paypalClientId: raw.PaymentSettings.paypalClientId ?? null,
          paypalSecret: raw.PaymentSettings.paypalSecret ?? null,

          // mpesa toggle (fixed typo)
          isMpesaEnabled: raw.PaymentSettings.isMpesaEnabled ?? false,

          // other providers
          isPaystackEnabled: raw.PaymentSettings.isPaystackEnabled ?? false,
          paystackPublicKey: raw.PaymentSettings.paystackPublicKey ?? null,
          paystackSecretKey: raw.PaymentSettings.paystackSecretKey ?? null,

          isGhubaEnabled: raw.PaymentSettings.isGhubaEnabled ?? false,
          ghubaMerchantId: raw.PaymentSettings.ghubaMerchantId ?? null,
          ghubaApiKey: raw.PaymentSettings.ghubaApiKey ?? null,
          ghubaSecret_tag: raw.PaymentSettings.ghubaSecret_tag ?? null,

          // any additional unknown keys are preserved by spreading (if present)
          ...raw.PaymentSettings,
        } as any)
      : null,
    shippingSettings: raw.ShippingSettings
      ? {
          id: String(raw.ShippingSettings.id),
          carrierName: raw.ShippingSettings.carrierName ?? null,
          trackingUrl: raw.ShippingSettings.trackingUrl ?? null,
          regions: raw.ShippingSettings.regions ?? [],
          enablePickup:
            typeof raw.ShippingSettings.enablePickup === "boolean"
              ? raw.ShippingSettings.enablePickup
              : null,
          pickupInstructions: raw.ShippingSettings.pickupInstructions ?? null,
          standardRate:
            typeof raw.ShippingSettings.standardRate === "number"
              ? raw.ShippingSettings.standardRate
              : null,
          expressRate:
            typeof raw.ShippingSettings.expressRate === "number"
              ? raw.ShippingSettings.expressRate
              : null,
        }
      : null,
    StoreCategory: raw.StoreCategory?.map((sc: any) => ({
      id: sc.categoryId,
      displayName: sc.displayName ?? sc.category.name,
      image: sc.image ?? sc.category?.image ?? undefined,
      icon: sc.icon ?? undefined,
      subcategories: Array.isArray(sc.subcategories)
        ? sc.subcategories
        : typeof sc.subcategories === "string"
          ? JSON.parse(sc.subcategories)
          : [],
      sortOrder: sc.sortOrder,
      visible: sc.visible,
    })),
    marketplaceListings: raw.marketplaceListings?.map((m: any) => ({
      id: m.id,
      title: m.title,
      name: m.name,
      description: m.description ?? "",
      finalPrice: m.finalPrice ?? 0,
      type: m.type,
      images: Array.isArray(m.images) ? m.images : [],
      videos: Array.isArray(m.videos) ? m.videos : [],
      isAvailable: m.isAvailable,
      isFeatured: m.isFeatured,
      option: m.option,
      product: m.product
        ? {
            id: m.product.id,
            name: m.product.name,
            description: m.product.description ?? "",
            brand: m.product.brand ?? undefined,
            color: Array.isArray(m.product.color)
              ? m.product.color.filter(
                  (c: any): c is string => typeof c === "string" && c !== null,
                )
              : [],
            size: Array.isArray(m.product.size)
              ? m.product.size.filter(
                  (s: any): s is string => typeof s === "string" && s !== null,
                )
              : [],
          }
        : undefined,
      sellingPrice: m.sellingPrice ?? 0,
      pricingTiers: Array.isArray(m.pricingTiers) ? m.pricingTiers : [],
      listingMarketStatus: m.listingMarketStatus,
      listingSystemStatus: m.listingSystemStatus,
      listingTransactionType: m.listingTransactionType,
    })),

    currency: raw.currency ?? "KES",
    locale: raw.locale ?? "en-US",
    blogs: Array.isArray(raw.blogs)
      ? raw.blogs.map((b: any) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          content: b.content,
          coverImage: b.coverImage ?? "",
          categories: b.categories ?? [],
          tags: b.tags ?? [],
          author: b.author
            ? {
                name: b.author.name,
                profileImage: b.author.profileImage,
              }
            : undefined,
          status: b.status,
          publishedAt: b.publishedAt,
        }))
      : [],

    pageSections: Array.isArray(raw.PageSection) ? raw.PageSection : [],
    appPromos: Array.isArray(raw.appPromos) ? raw.appPromos : [],
    events: Array.isArray(raw.events) ? raw.events : [],
    projects: Array.isArray(raw.projects) ? raw.projects : [],

    awards: Array.isArray(raw.awards)
      ? raw.awards
      : typeof raw.awards === "string"
        ? JSON.parse(raw.awards)
        : [],
    metrics: Array.isArray(raw.metrics)
      ? raw.metrics
      : typeof raw.metrics === "string"
        ? JSON.parse(raw.metrics)
        : [],
    stats: Array.isArray(raw.stats)
      ? raw.stats
      : typeof raw.stats === "string"
        ? JSON.parse(raw.stats)
        : [],

    themeSettings:
      typeof raw.themeSettings === "string"
        ? JSON.parse(raw.themeSettings)
        : (raw.themeSettings ?? {}),

    pricingTiers: Array.isArray(raw.pricingTiers)
      ? raw.pricingTiers
      : typeof raw.pricingTiers === "string"
        ? JSON.parse(raw.pricingTiers)
        : [],

    Writer: Array.isArray(raw.Writer) ? raw.Writer : [],
    salesAgents: Array.isArray(raw.salesAgents) ? raw.salesAgents : [],
    // Correctly map the Doctor array to the doctors key
    Doctor: Array.isArray(raw.Doctor)
      ? raw.Doctor.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.User.name, // Assuming the doctor's name is on a nested User object
          subtitle: doctor.specialty,
          imageUrl: doctor.profilePicture,
          specializations: [], // Assuming no specializations array on the doctor object
        }))
      : [],
    Expert: Array.isArray(raw.Expert)
      ? raw.Expert.map((expert: any) => ({
          id: expert.id,
          name: expert.user.name, // Assuming the expert's name is on a nested user object
          subtitle: expert.specialty ?? "", // Assuming there's a specialty field
          img: expert.user.image ?? "/images/default-expert.jpg", // Fallback to a default image if none provided
          bio: expert.bio ?? "", // Assuming there's a bio field

          // linkedin: expert.linkedin ?? '', // Assuming there's a linkedin field
          email: expert.email ?? "", // Assuming there's an email field
          specializations: expert.specializations ?? [], // Assuming there's a specializations array
          role: expert.role ?? "", // Assuming there's a role field
          // Add other fields as necessary
        }))
      : [],
    Educator: Array.isArray(raw.educators)
      ? raw.educators.map((educator: any) => ({
          id: educator.id,
          name: educator.user?.name ?? "", // comes from related User
          subtitle: educator.specialty ?? "", // Prisma has single specialty
          imageUrl: educator.photoUrl ?? educator.profilePicture ?? null,
          certifications: educator.certifications ?? [], // array of strings
          status: educator.status ?? "ACTIVE", // enum value
          companyId: educator.companyId ?? null, // keep reference if needed
          phone: educator.phone ?? null, // optional
          bio: educator.bio ?? null, // optional
          address: educator.address ?? null, // optional
        }))
      : [],
    Podcast: Array.isArray(raw.Podcast) ? raw.Podcast : [],
    // Correctly map the services array to the services key
    services: Array.isArray(raw.services)
      ? raw.services.map((service: any) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          icon: "StethoscopeIcon", // You might need a way to map icons from your data
        }))
      : [],
    CompanyLocation: Array.isArray(raw.CompanyLocation)
      ? raw.CompanyLocation.map(
          (cl: ICompanyLocation & { location: ILocation }) => ({
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
          }),
        )
      : [],
    courses: Array.isArray(raw.courses) ? raw.courses : [],
    companyCategoryId: null,
    site: null,
    userId: null,
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    sEOId: null,
    settings: null,
    packages: Array.isArray(raw.Package) ? raw.Package : [],
    Announcement: Array.isArray(raw.Announcement) ? raw.Announcement : [],
    Collection: Array.isArray(raw.Collection) ? raw.Collection : [],
    CoreValues: Array.isArray(raw.CoreValues)
      ? raw.CoreValues
      : typeof raw.CoreValues === "string"
        ? JSON.parse(raw.CoreValues)
        : [],
    destinations: Array.isArray(raw.Destination)
      ? raw.Destination.map((d: any) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          country: d.country,
          continent: d.continent,
          description: d.description,
          longDescription: d.longDescription ?? "",
          images: Array.isArray(d.images) ? d.images : [],
          bannerImage: d.bannerImage,
          activities: Array.isArray(d.activities) ? d.activities : [],
          bestTimeToVisit: d.bestTimeToVisit ?? "",
          averageRating: d.averageRating ?? null,
          published: d.published ?? false,
        }))
      : [],

    // ✅ Add TourPackages
    tourPackages: Array.isArray(raw.TourPackage)
      ? raw.TourPackage.map((tp: any) => ({
          id: tp.id,
          name: tp.name,
          slug: tp.slug,
          description: tp.description,
          longDescription: tp.longDescription ?? "",
          duration: tp.duration,
          price: tp.price,
          status: tp.status,
          imageUrl: tp.imageUrl,
          images: Array.isArray(tp.images) ? tp.images : [],
          destinations:
            tp.destinations?.map((d: any) => ({
              id: d.id,
              name: d.name,
              slug: d.slug,
              country: d.country,
            })) ?? [],
        }))
      : [],

    partnerLogos:
      Array.isArray(raw.partnerLogos) && raw.partnerLogos.length > 0
        ? raw.partnerLogos
        : [
            {
              id: "default",
              imageUrl:
                "https://placehold.co/160x40/ffffff/000000?text=Logo+Placeholder",
            },
            {
              id: "default2",
              imageUrl:
                "https://placehold.co/160x40/ffffff/000000?text=Logo+Placeholder",
            },
            {
              id: "default3",
              imageUrl:
                "https://placehold.co/160x40/ffffff/000000?text=Logo+Placeholder",
            },
            {
              id: "default4",
              imageUrl:
                "https://placehold.co/160x40/ffffff/000000?text=Logo+Placeholder",
            },
            {
              id: "default5",
              imageUrl:
                "https://placehold.co/160x40/ffffff/000000?text=Logo+Placeholder",
            },
            {
              id: "default6",
              imageUrl:
                "https://placehold.co/160x40/ffffff/000000?text=Logo+Placeholder",
            },
            {
              id: "default7",
              imageUrl:
                "https://placehold.co/160x40/ffffff/000000?text=Logo+Placeholder",
            },
          ],
    founderQuote: raw.founderQuote ?? null,
    founderName: raw.founderName ?? null,
    founderImage: raw.founderImage ?? null,

    sectionSubtitle: raw.sectionSubtitle ?? "Trusted Worldwide",
    sectionDescription:
      raw.sectionDescription ?? "Empowering Success Through Proven Expertise",
    sectionTitle: raw.sectionTitle ?? "Why Choose Our Consultancy Services",

    galleries: raw.galleries
      ? raw.galleries.map((g: any) => ({
          id: g.id,
          title: g.title,
          description: g.description,
          items: Array.isArray(g.items) ? g.items : [],
        }))
      : [],

  };
}
