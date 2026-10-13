"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyWebsiteConfigToStoreData = void 0;
/**
 * Bridges website builder configuration and section edits into StoreForm.
 * This guarantees that all 56 themes—whether they read from StoreContext,
 * direct pageData props, or section-specific props—seamlessly reflect live
 * user edits, Mascot AI updates, and published store configurations.
 */
function applyWebsiteConfigToStoreData(baseStoreData, config, pageSlug = 'home') {
    if (!config)
        return baseStoreData;
    // Deep clone base structure to prevent mutating original references
    const data = {
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
    const headerBrand = ov['Header.brandName'] ||
        ov['Header.storeName'] ||
        ov['header.brandName'] ||
        ov['header.storeName'] ||
        ov['header.title'];
    if (headerBrand)
        data.name = headerBrand;
    const headerLogo = ov['Header.logoUrl'] || ov['header.logoUrl'];
    if (headerLogo)
        data.logoUrl = headerLogo;
    const footerBio = ov['Footer.bio'] || ov['footer.bio'] || ov['footer.description'];
    if (footerBio)
        data.description = footerBio;
    const footerPhone = ov['Footer.contactPhone'] || ov['footer.contactPhone'] || ov['footer.phone'];
    if (footerPhone)
        data.contactPhone = footerPhone;
    const footerEmail = ov['Footer.contactEmail'] || ov['footer.contactEmail'] || ov['footer.email'];
    if (footerEmail)
        data.contactEmail = footerEmail;
    const footerAddr = ov['Footer.address'] || ov['footer.address'];
    if (footerAddr)
        data.address = footerAddr;
    const announcement = ov['Header.announcementText'] || ov['header.announcementText'];
    if (announcement)
        data.tagline = announcement;
    // Ensure at least one hero slide exists
    if (!data.heroSlides || data.heroSlides.length === 0) {
        data.heroSlides = [
            {
                id: 'slide-1',
                imageUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670',
                headline: data.name ? `Welcome to ${data.name}` : 'Experience Excellence',
                subline: data.description || 'Discover premium products and exceptional service.',
                type: null,
                companyId: data.companyId || '',
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
    // Apply hero overrides from componentOverrides across all slides
    for (let idx = 0; idx < data.heroSlides.length; idx++) {
        const s = data.heroSlides[idx];
        const headline = ov[`home.hero-slider.slides.${idx}.headline`] ||
            ov[`slides.${idx}.headline`] ||
            ov[`HeroSlider.slide${idx}.headline`] ||
            ov[`HeroSlider.slide-${idx}.headline`] ||
            (idx === 0
                ? ov['hero.headline'] ||
                    ov['hero.title'] ||
                    ov['Hero.headline'] ||
                    ov['HeroSlider.headline'] ||
                    ov['hero-slider.headline'] ||
                    ov['RestaurantHero.headline']
                : undefined);
        if (headline)
            s.headline = headline;
        const subline = ov[`home.hero-slider.slides.${idx}.subline`] ||
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
                    ov['RestaurantHero.subline']
                : undefined);
        if (subline)
            s.subline = subline;
        const ctaText = ov[`home.hero-slider.slides.${idx}.ctaText`] ||
            ov[`slides.${idx}.ctaText`] ||
            ov[`HeroSlider.slide${idx}.ctaText`] ||
            ov[`HeroSlider.slide-${idx}.ctaText`] ||
            (idx === 0
                ? ov['hero.ctaText'] ||
                    ov['Hero.ctaText'] ||
                    ov['HeroSlider.ctaText'] ||
                    ov['hero-slider.ctaText']
                : undefined);
        if (ctaText)
            s.ctaText = ctaText;
        const ctaLink = ov[`home.hero-slider.slides.${idx}.ctaLink`] ||
            ov[`slides.${idx}.ctaLink`] ||
            ov[`HeroSlider.slide${idx}.ctaLink`] ||
            ov[`HeroSlider.slide-${idx}.ctaLink`] ||
            (idx === 0
                ? ov['hero.ctaLink'] ||
                    ov['Hero.ctaLink'] ||
                    ov['HeroSlider.ctaLink'] ||
                    ov['hero-slider.ctaLink']
                : undefined);
        if (ctaLink)
            s.ctaLink = ctaLink;
        const imageUrl = ov[`home.hero-slider.slides.${idx}.imageUrl`] ||
            ov[`slides.${idx}.imageUrl`] ||
            ov[`HeroSlider.slide${idx}.imageUrl`] ||
            ov[`HeroSlider.slide-${idx}.imageUrl`] ||
            (idx === 0
                ? ov['hero.imageUrl'] ||
                    ov['Hero.imageUrl'] ||
                    ov['HeroSlider.imageUrl'] ||
                    ov['hero-slider.imageUrl']
                : undefined);
        if (imageUrl)
            s.imageUrl = imageUrl;
    }
    // 3. Find active page sections
    const activePage = (config.pages || []).find((p) => (p.isHomepage && (pageSlug === 'home' || pageSlug === '' || !pageSlug)) || p.slug === pageSlug);
    const sections = activePage?.sections || config.sections || [];
    data.sections = sections;
    data.websiteConfig = config;
    data.componentOverrides = ov;
    // 4. Map structured section contents into theme-expected store data properties
    for (const sec of sections) {
        if (!sec || !sec.content || typeof sec.content !== 'object')
            continue;
        const key = `${sec.type || ''} ${sec.id || ''} ${sec.component || ''}`.toLowerCase();
        const c = sec.content;
        // --- HERO SECTION ---
        if (key.includes('hero')) {
            data.heroConfig = c;
            if (Array.isArray(c.slides) && c.slides.length > 0) {
                data.heroSlides = c.slides.map((s, idx) => ({
                    id: s.id || `slide-${idx + 1}`,
                    imageUrl: s.imageUrl || data.bannerUrl || data.heroSlides[0]?.imageUrl,
                    headline: s.headline || s.title || data.heroSlides[0]?.headline || 'Welcome',
                    subline: s.subline || s.eyebrow || s.description || '',
                    badgeText: s.badgeText || '',
                    ctaText: s.ctaText || s.primaryButtonText || 'Shop Now',
                    ctaLink: s.ctaLink || s.primaryButtonUrl || '/products',
                }));
            }
            else if (Array.isArray(c.heroSlides) && c.heroSlides.length > 0) {
                data.heroSlides = c.heroSlides.map((s, idx) => ({
                    id: s.id || `slide-${idx + 1}`,
                    imageUrl: s.imageUrl || data.bannerUrl || data.heroSlides[0]?.imageUrl,
                    headline: s.headline || s.title || 'Welcome',
                    subline: s.subline || s.eyebrow || s.description || '',
                    badgeText: s.badgeText || '',
                    ctaText: s.ctaText || s.primaryButtonText || 'Shop Now',
                    ctaLink: s.ctaLink || s.primaryButtonUrl || '/products',
                }));
            }
            else if (c.headline || c.title || c.subline || c.description || c.ctaText || c.imageUrl) {
                // Direct hero properties on section content (Standard Mascot AI / Studio edit format)
                if (!data.heroSlides || data.heroSlides.length === 0) {
                    data.heroSlides = [{}];
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
        else if (key.includes('feature') ||
            key.includes('value') ||
            key.includes('why') ||
            key.includes('metric')) {
            const rawItems = c.items || c.features || c.values || c.coreValues;
            if (Array.isArray(rawItems) && rawItems.length > 0) {
                const normalized = rawItems.map((item, idx) => {
                    const titleOv = ov[`home.features.items.${idx}.title`] ||
                        ov[`features.items.${idx}.title`] ||
                        ov[`FeaturesSection.items.${idx}.title`] ||
                        ov[`CoreValues.${idx}.title`];
                    const descOv = ov[`home.features.items.${idx}.description`] ||
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
                data.features = normalized;
                data.values = normalized;
                c.features = normalized;
                c.values = normalized;
                c.items = normalized;
            }
        }
        // --- TESTIMONIALS / REVIEWS ---
        else if (key.includes('testimonial') || key.includes('review')) {
            const rawItems = c.items || c.testimonials || c.reviews;
            if (Array.isArray(rawItems) && rawItems.length > 0) {
                const normalized = rawItems.map((t, idx) => {
                    const quoteOv = ov[`home.testimonials.items.${idx}.quote`] ||
                        ov[`testimonials.${idx}.quote`] ||
                        ov[`testimonials.${idx}.content`];
                    const nameOv = ov[`home.testimonials.items.${idx}.name`] ||
                        ov[`testimonials.${idx}.name`] ||
                        ov[`testimonials.${idx}.author`];
                    const roleOv = ov[`home.testimonials.items.${idx}.role`] ||
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
                data.reviews = normalized;
                c.testimonials = normalized;
                c.reviews = normalized;
                c.items = normalized;
            }
        }
        // --- FAQS ---
        else if (key.includes('faq')) {
            const rawItems = c.items || c.faqs || c.questions;
            if (Array.isArray(rawItems) && rawItems.length > 0) {
                const normalized = rawItems.map((f, idx) => {
                    const qOv = ov[`home.faqs.items.${idx}.question`] ||
                        ov[`faqs.${idx}.question`] ||
                        ov[`faqs.${idx}.q`];
                    const aOv = ov[`home.faqs.items.${idx}.answer`] ||
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
                data.aboutImageUrl = c.aboutImageUrl || c.imageUrl;
            }
            if (c.founderName || c.ownerName) {
                data.founderName = c.founderName || c.ownerName;
            }
            if (c.founderQuote) {
                data.founderQuote = c.founderQuote;
            }
            if (c.founderImage) {
                data.founderImage = c.founderImage;
            }
        }
        // --- PROMOTIONS / BANNER / DEALS ---
        else if (key.includes('promo') || key.includes('banner') || key.includes('deal')) {
            const rawItems = c.items || c.promotions || c.deals || data.promotions || [];
            const basePromos = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems : (data.promotions || []);
            if (basePromos.length > 0) {
                const reconciled = basePromos.map((p, idx) => {
                    const titleOv = ov[`home.promo-section.promotions.${idx}.title`] ||
                        ov[`promotions.${idx}.title`] ||
                        ov[`PromoSection.promotions.${idx}.title`];
                    const descOv = ov[`home.promo-section.promotions.${idx}.description`] ||
                        ov[`promotions.${idx}.description`] ||
                        ov[`PromoSection.promotions.${idx}.description`];
                    const bannerOv = ov[`home.promo-section.promotions.${idx}.bannerUrl`] ||
                        ov[`promotions.${idx}.bannerUrl`] ||
                        ov[`PromoSection.promotions.${idx}.bannerUrl`];
                    const ctaTextOv = ov[`home.promo-section.promotions.${idx}.ctaText`] ||
                        ov[`promotions.${idx}.ctaText`] ||
                        ov[`PromoSection.promotions.${idx}.ctaText`];
                    const ctaLinkOv = ov[`home.promo-section.promotions.${idx}.ctaLink`] ||
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
            if (c.imageUrl)
                data.bannerUrl = c.imageUrl;
            if (c.title || c.headline) {
                data.promoHeadline = c.title || c.headline;
            }
        }
        // --- CONTACT / LOCATION ---
        else if (key.includes('contact') || key.includes('location')) {
            if (c.phone)
                data.contactPhone = c.phone;
            if (c.email)
                data.contactEmail = c.email;
            if (c.address)
                data.address = c.address;
        }
    }
    return data;
}
exports.applyWebsiteConfigToStoreData = applyWebsiteConfigToStoreData;
