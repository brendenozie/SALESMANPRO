import { StoreForm, HeroSlide } from '@/types/typings';
import { CompiledWebsiteConfig } from '@/types/website-builder';

/**
 * Bridges website builder configuration and section edits into StoreForm.
 * This guarantees that all 56 themes—whether they read from StoreContext,
 * direct pageData props, or section-specific props—seamlessly reflect live
 * user edits, Mascot AI updates, and published store configurations.
 */
export function applyWebsiteConfigToStoreData(
  baseStoreData: StoreForm,
  config?: CompiledWebsiteConfig | any | null,
  pageSlug: string = 'home'
): StoreForm {
  if (!config) return baseStoreData;

  // Deep clone base structure to prevent mutating original references
  const data: StoreForm = {
    ...baseStoreData,
    themeSettings: { ...(baseStoreData.themeSettings || {}) },
    heroSlides: baseStoreData.heroSlides
      ? baseStoreData.heroSlides.map((s) => ({ ...s }))
      : [],
    CoreValues: baseStoreData.CoreValues
      ? baseStoreData.CoreValues.map((v) => ({ ...v }))
      : [],
    testimonials: baseStoreData.testimonials
      ? baseStoreData.testimonials.map((t) => ({ ...t }))
      : [],
    faqs: baseStoreData.faqs
      ? baseStoreData.faqs.map((f) => ({ ...f }))
      : [],
    promotions: baseStoreData.promotions
      ? baseStoreData.promotions.map((p) => ({ ...p }))
      : [],
  };

  // 1. Theme & styling overrides
  if (config.theme) {
    data.themeSettings = {
      ...(data.themeSettings || {}),
      primaryColor: config.theme.primaryColor || data.themeSettings?.primaryColor,
      secondaryColor: config.theme.secondaryColor || data.themeSettings?.secondaryColor,
      fontFamily: config.theme.headingFont || data.themeSettings?.fontFamily,
    };
  }

  // 2. Component overrides (Header, Footer, Brand, Hero)
  const ov = config.componentOverrides || {};
  const headerBrand =
    ov['Header.brandName'] ||
    ov['Header.storeName'] ||
    ov['header.brandName'] ||
    ov['header.storeName'] ||
    ov['header.title'];
  if (headerBrand) data.name = headerBrand;

  const headerLogo = ov['Header.logoUrl'] || ov['header.logoUrl'];
  if (headerLogo) data.logoUrl = headerLogo;

  const footerBio = ov['Footer.bio'] || ov['footer.bio'] || ov['footer.description'];
  if (footerBio) data.description = footerBio;

  const footerPhone = ov['Footer.contactPhone'] || ov['footer.contactPhone'] || ov['footer.phone'];
  if (footerPhone) (data as any).contactPhone = footerPhone;

  const footerEmail = ov['Footer.contactEmail'] || ov['footer.contactEmail'] || ov['footer.email'];
  if (footerEmail) (data as any).contactEmail = footerEmail;

  const footerAddr = ov['Footer.address'] || ov['footer.address'];
  if (footerAddr) (data as any).address = footerAddr;

  const announcement = ov['Header.announcementText'] || ov['header.announcementText'];
  if (announcement) (data as any).tagline = announcement;

  // Ensure at least one hero slide exists
  if (!data.heroSlides || data.heroSlides.length === 0) {
    data.heroSlides = [
      {
        id: 'slide-1',
        imageUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670',
        headline: data.name ? `Welcome to ${data.name}` : 'Experience Excellence',
        subline: data.description || 'Discover premium products and exceptional service.',
        type: null,
        companyId: (data as any).companyId || '',
        productImageUrl: null,
        ctaText: 'Explore Now',
        ctaLink: '/products',
        videoLink: null,
        badgeText: 'Featured',
        price: null,
        endsAt: null,
        order: 0,
        iconKey: null,
        backgroundColor: null,
        textColor: null,
        stats: null,
      },
    ];
  }

  // Apply hero overrides from componentOverrides if present
  const heroHeadlineOv =
    ov['hero.headline'] ||
    ov['hero.title'] ||
    ov['Hero.headline'] ||
    ov['HeroSlider.headline'] ||
    ov['hero-slider.headline'] ||
    ov['RestaurantHero.headline'];
  if (heroHeadlineOv && data.heroSlides[0]) {
    data.heroSlides[0].headline = heroHeadlineOv;
  }

  const heroSublineOv =
    ov['hero.subline'] ||
    ov['hero.description'] ||
    ov['Hero.subline'] ||
    ov['HeroSlider.subline'] ||
    ov['hero-slider.subline'] ||
    ov['RestaurantHero.subline'];
  if (heroSublineOv && data.heroSlides[0]) {
    data.heroSlides[0].subline = heroSublineOv;
  }

  const heroCtaTextOv =
    ov['hero.ctaText'] ||
    ov['Hero.ctaText'] ||
    ov['HeroSlider.ctaText'] ||
    ov['hero-slider.ctaText'];
  if (heroCtaTextOv && data.heroSlides[0]) {
    data.heroSlides[0].ctaText = heroCtaTextOv;
  }

  const heroCtaLinkOv =
    ov['hero.ctaLink'] ||
    ov['Hero.ctaLink'] ||
    ov['HeroSlider.ctaLink'] ||
    ov['hero-slider.ctaLink'];
  if (heroCtaLinkOv && data.heroSlides[0]) {
    data.heroSlides[0].ctaLink = heroCtaLinkOv;
  }

  const heroImageUrlOv =
    ov['hero.imageUrl'] ||
    ov['Hero.imageUrl'] ||
    ov['HeroSlider.imageUrl'] ||
    ov['hero-slider.imageUrl'];
  if (heroImageUrlOv && data.heroSlides[0]) {
    data.heroSlides[0].imageUrl = heroImageUrlOv;
  }

  // 3. Find active page sections
  const activePage = (config.pages || []).find(
    (p: any) => (p.isHomepage && (pageSlug === 'home' || pageSlug === '' || !pageSlug)) || p.slug === pageSlug
  );
  const sections = activePage?.sections || (config as any).sections || [];
  (data as any).sections = sections;
  (data as any).websiteConfig = config;
  (data as any).componentOverrides = ov;

  // 4. Map structured section contents into theme-expected store data properties
  for (const sec of sections) {
    if (!sec || !sec.content || typeof sec.content !== 'object') continue;
    const key = `${sec.type || ''} ${sec.id || ''} ${sec.component || ''}`.toLowerCase();
    const c = sec.content;

    // --- HERO SECTION ---
    if (key.includes('hero')) {
      (data as any).heroConfig = c;

      if (Array.isArray(c.slides) && c.slides.length > 0) {
        data.heroSlides = c.slides.map((s: any, idx: number) => ({
          id: s.id || `slide-${idx + 1}`,
          imageUrl: s.imageUrl || data.bannerUrl || data.heroSlides[0]?.imageUrl,
          headline: s.headline || s.title || data.heroSlides[0]?.headline || 'Welcome',
          subline: s.subline || s.eyebrow || s.description || '',
          badgeText: s.badgeText || '',
          ctaText: s.ctaText || s.primaryButtonText || 'Shop Now',
          ctaLink: s.ctaLink || s.primaryButtonUrl || '/products',
        }));
      } else if (Array.isArray(c.heroSlides) && c.heroSlides.length > 0) {
        data.heroSlides = c.heroSlides.map((s: any, idx: number) => ({
          id: s.id || `slide-${idx + 1}`,
          imageUrl: s.imageUrl || data.bannerUrl || data.heroSlides[0]?.imageUrl,
          headline: s.headline || s.title || 'Welcome',
          subline: s.subline || s.eyebrow || s.description || '',
          badgeText: s.badgeText || '',
          ctaText: s.ctaText || s.primaryButtonText || 'Shop Now',
          ctaLink: s.ctaLink || s.primaryButtonUrl || '/products',
        }));
      } else if (c.headline || c.title || c.subline || c.description || c.ctaText || c.imageUrl) {
        // Direct hero properties on section content (Standard Mascot AI / Studio edit format)
        if (!data.heroSlides || data.heroSlides.length === 0) {
          data.heroSlides = [{} as any];
        }
        data.heroSlides[0] = {
          ...data.heroSlides[0],
          id: data.heroSlides[0].id || 'slide-1',
          headline: c.headline || c.title || data.heroSlides[0].headline,
          subline: c.subline || c.eyebrow || c.description || data.heroSlides[0].subline,
          ctaText: c.ctaText || c.primaryButtonText || data.heroSlides[0].ctaText || 'Shop Now',
          ctaLink: c.ctaLink || c.primaryButtonUrl || data.heroSlides[0].ctaLink || '/products',
          imageUrl: c.imageUrl || data.heroSlides[0].imageUrl,
          badgeText: c.badgeText || data.heroSlides[0].badgeText,
        };
      }

      // Propagate synthesized heroSlides onto section.content so direct child reads find it
      c.heroSlides = data.heroSlides;
    }

    // --- FEATURES / CORE VALUES / WHY US / METRICS ---
    else if (
      key.includes('feature') ||
      key.includes('value') ||
      key.includes('why') ||
      key.includes('metric')
    ) {
      const rawItems = c.items || c.features || c.values || c.coreValues;
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const normalized = rawItems.map((item: any, idx: number) => ({
          id: item.id || `val-${idx + 1}`,
          title: item.title || item.headline || item.name || `Feature ${idx + 1}`,
          description: item.description || item.subline || item.text || '',
          icon: item.icon,
        }));
        data.CoreValues = normalized;
        (data as any).features = normalized;
        (data as any).values = normalized;
        c.features = normalized;
        c.values = normalized;
        c.items = normalized;
      }
    }

    // --- TESTIMONIALS / REVIEWS ---
    else if (key.includes('testimonial') || key.includes('review')) {
      const rawItems = c.items || c.testimonials || c.reviews;
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const normalized = rawItems.map((t: any, idx: number) => ({
          id: t.id || `test-${idx + 1}`,
          name: t.name || t.author || `Customer ${idx + 1}`,
          quote: t.quote || t.content || t.text || t.description || '',
          role: t.role || t.title || 'Verified Customer',
          avatar: t.avatar || t.imageUrl || t.image || null,
          rating: t.rating || 5,
        }));
        data.testimonials = normalized;
        (data as any).reviews = normalized;
        c.testimonials = normalized;
        c.reviews = normalized;
        c.items = normalized;
      }
    }

    // --- FAQS ---
    else if (key.includes('faq')) {
      const rawItems = c.items || c.faqs || c.questions;
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const normalized = rawItems.map((f: any, idx: number) => ({
          id: f.id || `faq-${idx + 1}`,
          question: f.question || f.title || f.q || '',
          answer: f.answer || f.description || f.content || f.a || '',
        }));
        data.faqs = normalized;
        c.faqs = normalized;
        c.items = normalized;
      }
    }

    // --- ABOUT / STORY / FOUNDER ---
    else if (key.includes('about') || key.includes('story') || key.includes('founder')) {
      if (c.description || c.story || c.bio) {
        data.description = c.description || c.story || c.bio;
      }
      if (c.aboutImageUrl || c.imageUrl) {
        (data as any).aboutImageUrl = c.aboutImageUrl || c.imageUrl;
      }
      if (c.founderName || c.ownerName) {
        (data as any).founderName = c.founderName || c.ownerName;
      }
      if (c.founderQuote) {
        (data as any).founderQuote = c.founderQuote;
      }
      if (c.founderImage) {
        (data as any).founderImage = c.founderImage;
      }
    }

    // --- PROMOTIONS / BANNER / DEALS ---
    else if (key.includes('promo') || key.includes('banner') || key.includes('deal')) {
      const rawItems = c.items || c.promotions || c.deals;
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        data.promotions = rawItems;
        c.promotions = rawItems;
      }
      if (c.imageUrl) data.bannerUrl = c.imageUrl;
      if (c.title || c.headline) {
        (data as any).promoHeadline = c.title || c.headline;
      }
    }

    // --- CONTACT / LOCATION ---
    else if (key.includes('contact') || key.includes('location')) {
      if (c.phone) (data as any).contactPhone = c.phone;
      if (c.email) (data as any).contactEmail = c.email;
      if (c.address) (data as any).address = c.address;
    }
  }

  return data;
}
