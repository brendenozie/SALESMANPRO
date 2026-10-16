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

  // Ensure at least one hero slide exists IF neither data nor baseStoreData has slides
  const hasBaseHeroSlides = Array.isArray(baseStoreData.heroSlides) && baseStoreData.heroSlides.length > 0;
  if (!data.heroSlides || data.heroSlides.length === 0) {
    if (hasBaseHeroSlides) {
      data.heroSlides = baseStoreData.heroSlides.map((s) => ({ ...s }));
    } else {
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
  }

  // Apply hero overrides from componentOverrides across all slides
  for (let idx = 0; idx < data.heroSlides.length; idx++) {
    const s = data.heroSlides[idx];
    const headline =
      ov[`ghuba.home.hero.slides.${idx}.headline`] ||
      ov[`home.hero-slider.slides.${idx}.headline`] ||
      ov[`slides.${idx}.headline`] ||
      ov[`HeroSlider.slide${idx}.headline`] ||
      ov[`HeroSlider.slide-${idx}.headline`] ||
      (idx === 0
        ? ov['hero.headline'] ||
          ov['hero.title'] ||
          ov['Hero.headline'] ||
          ov['HeroSlider.headline'] ||
          ov['hero-slider.headline'] ||
          ov['RestaurantHero.headline'] ||
          ov['ghuba.home.hero.title']
        : undefined);
    if (headline) s.headline = headline;

    const subline =
      ov[`ghuba.home.hero.slides.${idx}.subline`] ||
      ov[`home.hero-slider.slides.${idx}.subline`] ||
      ov[`home.hero-slider.slides.${idx}.badgeText`] ||
      ov[`slides.${idx}.subline`] ||
      ov[`HeroSlider.slide${idx}.subline`] ||
      ov[`HeroSlider.slide-${idx}.subline`] ||
      (idx === 0
        ? ov['hero.subline'] ||
          ov['hero.description'] ||
          ov['Hero.subline'] ||
          ov['HeroSlider.subline'] ||
          ov['hero-slider.subline'] ||
          ov['RestaurantHero.subline'] ||
          ov['ghuba.home.hero.subtitle']
        : undefined);
    if (subline) s.subline = subline;

    const badgeText =
      ov[`ghuba.home.hero.slides.${idx}.badgeText`] ||
      ov[`home.hero-slider.slides.${idx}.badgeText`] ||
      ov[`slides.${idx}.badgeText`];
    if (badgeText) s.badgeText = badgeText;

    const price =
      ov[`ghuba.home.hero.slides.${idx}.price`] ||
      ov[`home.hero-slider.slides.${idx}.price`] ||
      ov[`slides.${idx}.price`];
    if (price) s.price = price;

    const productImageUrl =
      ov[`ghuba.home.hero.slides.${idx}.productImageUrl`] ||
      ov[`home.hero-slider.slides.${idx}.productImageUrl`] ||
      ov[`slides.${idx}.productImageUrl`];
    if (productImageUrl) s.productImageUrl = productImageUrl;

    const ctaText =
      ov[`ghuba.home.hero.slides.${idx}.ctaText`] ||
      ov[`home.hero-slider.slides.${idx}.ctaText`] ||
      ov[`slides.${idx}.ctaText`] ||
      ov[`HeroSlider.slide${idx}.ctaText`] ||
      ov[`HeroSlider.slide-${idx}.ctaText`] ||
      (idx === 0
        ? ov['hero.ctaText'] ||
          ov['Hero.ctaText'] ||
          ov['HeroSlider.ctaText'] ||
          ov['hero-slider.ctaText']
        : undefined);
    if (ctaText) s.ctaText = ctaText;

    const ctaLink =
      ov[`ghuba.home.hero.slides.${idx}.ctaLink`] ||
      ov[`home.hero-slider.slides.${idx}.ctaLink`] ||
      ov[`slides.${idx}.ctaLink`] ||
      ov[`HeroSlider.slide${idx}.ctaLink`] ||
      ov[`HeroSlider.slide-${idx}.ctaLink`] ||
      (idx === 0
        ? ov['hero.ctaLink'] ||
          ov['Hero.ctaLink'] ||
          ov['HeroSlider.ctaLink'] ||
          ov['hero-slider.ctaLink']
        : undefined);
    if (ctaLink) s.ctaLink = ctaLink;

    const imageUrl =
      ov[`ghuba.home.hero.slides.${idx}.imageUrl`] ||
      ov[`home.hero-slider.slides.${idx}.imageUrl`] ||
      ov[`slides.${idx}.imageUrl`] ||
      ov[`HeroSlider.slide${idx}.imageUrl`] ||
      ov[`HeroSlider.slide-${idx}.imageUrl`] ||
      (idx === 0
        ? ov['hero.imageUrl'] ||
          ov['Hero.imageUrl'] ||
          ov['HeroSlider.imageUrl'] ||
          ov['hero-slider.imageUrl']
        : undefined);
    if (imageUrl) s.imageUrl = imageUrl;
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

      const hasAuthenticDbSlides = Array.isArray(baseStoreData.heroSlides) && baseStoreData.heroSlides.length > 0;

      if (Array.isArray(c.slides) && c.slides.length > 0) {
        data.heroSlides = c.slides.map((s: any, idx: number) => {
          const dbSlide = hasAuthenticDbSlides ? baseStoreData.heroSlides[idx] : undefined;
          return {
            id: s.id || dbSlide?.id || `slide-${idx + 1}`,
            companyId: s.companyId || dbSlide?.companyId || (data as any).companyId || '',
            imageUrl: s.imageUrl || dbSlide?.imageUrl || data.bannerUrl || data.heroSlides[0]?.imageUrl,
            productImageUrl: s.productImageUrl || dbSlide?.productImageUrl || null,
            headline: s.headline || s.title || dbSlide?.headline || data.heroSlides[0]?.headline || 'Welcome',
            subline: s.subline || s.eyebrow || s.description || dbSlide?.subline || '',
            badgeText: s.badgeText || dbSlide?.badgeText || '',
            ctaText: s.ctaText || s.primaryButtonText || dbSlide?.ctaText || 'Shop Now',
            ctaLink: s.ctaLink || s.primaryButtonUrl || dbSlide?.ctaLink || '/products',
            price: s.price || dbSlide?.price || null,
            videoLink: s.videoLink || dbSlide?.videoLink || null,
            type: s.type || dbSlide?.type || 'image',
            endsAt: s.endsAt || dbSlide?.endsAt || null,
            order: s.order !== undefined ? s.order : (dbSlide?.order ?? idx),
            iconKey: s.iconKey || dbSlide?.iconKey || null,
            backgroundColor: s.backgroundColor || dbSlide?.backgroundColor || null,
            textColor: s.textColor || dbSlide?.textColor || null,
            stats: s.stats || dbSlide?.stats || null,
          };
        });
      } else if (Array.isArray(c.heroSlides) && c.heroSlides.length > 0) {
        data.heroSlides = c.heroSlides.map((s: any, idx: number) => {
          const dbSlide = hasAuthenticDbSlides ? baseStoreData.heroSlides[idx] : undefined;
          return {
            id: s.id || dbSlide?.id || `slide-${idx + 1}`,
            companyId: s.companyId || dbSlide?.companyId || (data as any).companyId || '',
            imageUrl: s.imageUrl || dbSlide?.imageUrl || data.bannerUrl || data.heroSlides[0]?.imageUrl,
            productImageUrl: s.productImageUrl || dbSlide?.productImageUrl || null,
            headline: s.headline || s.title || dbSlide?.headline || 'Welcome',
            subline: s.subline || s.eyebrow || s.description || dbSlide?.subline || '',
            badgeText: s.badgeText || dbSlide?.badgeText || '',
            ctaText: s.ctaText || s.primaryButtonText || dbSlide?.ctaText || 'Shop Now',
            ctaLink: s.ctaLink || s.primaryButtonUrl || dbSlide?.ctaLink || '/products',
            price: s.price || dbSlide?.price || null,
            videoLink: s.videoLink || dbSlide?.videoLink || null,
            type: s.type || dbSlide?.type || 'image',
            endsAt: s.endsAt || dbSlide?.endsAt || null,
            order: s.order !== undefined ? s.order : (dbSlide?.order ?? idx),
            iconKey: s.iconKey || dbSlide?.iconKey || null,
            backgroundColor: s.backgroundColor || dbSlide?.backgroundColor || null,
            textColor: s.textColor || dbSlide?.textColor || null,
            stats: s.stats || dbSlide?.stats || null,
          };
        });
      } else if (!hasAuthenticDbSlides && (c.headline || c.title || c.subline || c.description || c.ctaText || c.imageUrl)) {
        // Direct hero properties on section content (Only if store has no authentic DB slides!)
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
          productImageUrl: c.productImageUrl || data.heroSlides[0].productImageUrl || null,
          price: c.price || data.heroSlides[0].price || null,
        };
      }

      // Propagate heroSlides onto section.content so direct child reads find it
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
        const normalized = rawItems.map((item: any, idx: number) => {
          const titleOv =
            ov[`home.features.items.${idx}.title`] ||
            ov[`features.items.${idx}.title`] ||
            ov[`FeaturesSection.items.${idx}.title`] ||
            ov[`CoreValues.${idx}.title`];
          const descOv =
            ov[`home.features.items.${idx}.description`] ||
            ov[`features.items.${idx}.description`] ||
            ov[`FeaturesSection.items.${idx}.description`] ||
            ov[`CoreValues.${idx}.description`];

          return {
            id: item.id || `val-${idx + 1}`,
            title: titleOv || item.title || item.headline || item.name || `Feature ${idx + 1}`,
            description: descOv || item.description || item.subline || item.text || '',
            icon: item.icon,
          };
        });
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
        const normalized = rawItems.map((t: any, idx: number) => {
          const quoteOv =
            ov[`home.testimonials.items.${idx}.quote`] ||
            ov[`testimonials.${idx}.quote`] ||
            ov[`testimonials.${idx}.content`];
          const nameOv =
            ov[`home.testimonials.items.${idx}.name`] ||
            ov[`testimonials.${idx}.name`] ||
            ov[`testimonials.${idx}.author`];
          const roleOv =
            ov[`home.testimonials.items.${idx}.role`] ||
            ov[`testimonials.${idx}.role`];

          return {
            id: t.id || `test-${idx + 1}`,
            name: nameOv || t.name || t.author || `Customer ${idx + 1}`,
            quote: quoteOv || t.quote || t.content || t.text || t.description || '',
            role: roleOv || t.role || t.title || 'Verified Customer',
            avatar: t.avatar || t.imageUrl || t.image || null,
            rating: t.rating || 5,
          };
        });
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
        const normalized = rawItems.map((f: any, idx: number) => {
          const qOv =
            ov[`home.faqs.items.${idx}.question`] ||
            ov[`faqs.${idx}.question`] ||
            ov[`faqs.${idx}.q`];
          const aOv =
            ov[`home.faqs.items.${idx}.answer`] ||
            ov[`faqs.${idx}.answer`] ||
            ov[`faqs.${idx}.a`];

          return {
            id: f.id || `faq-${idx + 1}`,
            question: qOv || f.question || f.title || f.q || '',
            answer: aOv || f.answer || f.description || f.content || f.a || '',
          };
        });
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
      const rawItems = c.items || c.promotions || c.deals || data.promotions || [];
      const basePromos = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems : (data.promotions || []);
      if (basePromos.length > 0) {
        const reconciled = basePromos.map((p: any, idx: number) => {
          const titleOv =
            ov[`home.promo-section.promotions.${idx}.title`] ||
            ov[`promotions.${idx}.title`] ||
            ov[`PromoSection.promotions.${idx}.title`];
          const descOv =
            ov[`home.promo-section.promotions.${idx}.description`] ||
            ov[`promotions.${idx}.description`] ||
            ov[`PromoSection.promotions.${idx}.description`];
          const bannerOv =
            ov[`home.promo-section.promotions.${idx}.bannerUrl`] ||
            ov[`promotions.${idx}.bannerUrl`] ||
            ov[`PromoSection.promotions.${idx}.bannerUrl`];
          const ctaTextOv =
            ov[`home.promo-section.promotions.${idx}.ctaText`] ||
            ov[`promotions.${idx}.ctaText`] ||
            ov[`PromoSection.promotions.${idx}.ctaText`];
          const ctaLinkOv =
            ov[`home.promo-section.promotions.${idx}.ctaLink`] ||
            ov[`promotions.${idx}.ctaLink`] ||
            ov[`PromoSection.promotions.${idx}.ctaLink`];

          return {
            ...p,
            ...(titleOv ? { title: titleOv } : {}),
            ...(descOv ? { description: descOv } : {}),
            ...(bannerOv ? { bannerUrl: bannerOv } : {}),
            ...(ctaTextOv ? { ctaText: ctaTextOv } : {}),
            ...(ctaLinkOv ? { ctaLink: ctaLinkOv } : {}),
          };
        });
        data.promotions = reconciled;
        c.promotions = reconciled;
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
