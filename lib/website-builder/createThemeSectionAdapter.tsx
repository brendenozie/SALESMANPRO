import React from 'react';

export interface ThemeSectionContainerProps {
  sections?: any[];
  renderSection?: (section: any, index: number) => React.ReactNode;
  fallback?: React.ReactNode;
  staticFallback?: React.ReactNode;
  sectionMap?: Record<string, React.ReactNode>;
}

/**
 * ThemeSectionContainer
 * 
 * An architecture-first adapter that connects a theme's authentic components
 * to the canonical tenant section lifecycle (order, visibility, duplication, deletion)
 * while preserving the theme's authentic composition, props, and styling.
 * 
 * If pageData.sections is present, sections are rendered in dynamic order, skipping
 * any sections marked visible === false.
 * If pageData.sections is absent or empty, the authentic static fallback is rendered.
 */
export function ThemeSectionContainer({
  sections,
  renderSection,
  fallback,
  staticFallback,
  sectionMap,
}: ThemeSectionContainerProps) {
  const actualFallback = fallback ?? staticFallback;

  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return <>{actualFallback}</>;
  }

  const normalizeSectionContent = (sec: any) => {
    if (!sec || !sec.content || typeof sec.content !== 'object' || Array.isArray(sec.content)) return;
    const c = sec.content;
    if (c.slides && !c.heroSlides) c.heroSlides = c.slides;
    if ((c.headline || c.title) && !c.heroSlides) {
      c.heroSlides = [
        {
          id: 'slide-1',
          headline: c.headline || c.title,
          subline: c.subline || c.eyebrow || c.description || '',
          badgeText: c.badgeText || '',
          ctaText: c.ctaText || c.primaryButtonText || 'Shop Now',
          ctaLink: c.ctaLink || c.primaryButtonUrl || '/products',
          imageUrl: c.imageUrl,
        },
      ];
    }
    if (c.items && !c.features) c.features = c.items;
    if (c.items && !c.testimonials) c.testimonials = c.items;
    if (c.items && !c.faqs) c.faqs = c.items;
  };

  const enhanceElement = (content: React.ReactNode, section: any, index: number, matchedKey?: string) => {
    if (!React.isValidElement(content)) return content;

    const childProps = (content.props as any) || {};
    const c = section.content && typeof section.content === 'object' && !Array.isArray(section.content)
      ? section.content
      : {};

    const mergedStoreFormData = childProps.storeFormData
      ? {
          ...childProps.storeFormData,
          ...c,
          ...(c.features || c.items ? { CoreValues: c.features || c.items, features: c.features || c.items } : {}),
          ...(c.testimonials || c.items ? { testimonials: c.testimonials || c.items } : {}),
          ...(c.faqs || c.items ? { faqs: c.faqs || c.items } : {}),
          ...(c.heroSlides || c.slides ? { heroSlides: c.heroSlides || c.slides } : {}),
        }
      : undefined;

    const injections: Record<string, any> = {
      sectionId: section.id,
      sectionType: section.type,
      sectionContent: section.content,
      ...c,
    };

    if (mergedStoreFormData) injections.storeFormData = mergedStoreFormData;
    if (c.heroSlides || c.slides) {
      injections.heroSlides = c.heroSlides || c.slides;
    }
    if (c.features || c.items) {
      injections.features = c.features || c.items;
      injections.CoreValues = c.features || c.items;
    }
    if (c.testimonials || c.items) {
      injections.testimonials = c.testimonials || c.items;
    }
    if (c.faqs || c.items) {
      injections.faqs = c.faqs || c.items;
    }
    if (c.promotions || c.items) {
      injections.promotions = c.promotions || c.items;
    }

    const enhanced = React.cloneElement(content as React.ReactElement<any>, injections);

    if (enhanced.props?.['data-editor-section']) {
      return React.cloneElement(enhanced, {
        key: section.id || index,
      });
    }

    const domId = (section.id || '').startsWith('section-') ? section.id : `section-${section.id || index}`;

    return (
      <div
        key={section.id || index}
        id={domId}
        data-editor-section={section.id}
        data-editor-component={section.component || section.name || matchedKey || section.id}
      >
        {enhanced}
      </div>
    );
  };

  const renderedElements = sections
    .map((section, index) => {
      if (section.visible === false || section.isVisible === false) {
        return null;
      }
      normalizeSectionContent(section);

      if (renderSection) {
        const content = renderSection(section, index);
        if (!content) return null;
        return enhanceElement(content, section, index);
      }
      if (sectionMap) {
        const secId = (section.id || '').toLowerCase();
        const secType = (section.type || '').toLowerCase();
        const secComp = (section.component || '').toLowerCase();
        const secName = (section.name || '').toLowerCase();

        const cleanSecId = secId.replace(/^sec-/, '').replace(/^[a-z0-9]+-/, '');

        const normalizeStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const normId = normalizeStr(secId);
        const normCleanId = normalizeStr(cleanSecId);
        const normComp = normalizeStr(secComp);
        const normType = normalizeStr(secType);
        const normName = normalizeStr(secName);

        // Stage 1: Direct case-insensitive match
        let matchedKey = Object.keys(sectionMap).find((k) => {
          const lk = k.toLowerCase();
          return (
            lk === secId ||
            lk === cleanSecId ||
            lk === secType ||
            lk === secComp ||
            secId.startsWith(lk) ||
            cleanSecId.startsWith(lk) ||
            lk.startsWith(cleanSecId)
          );
        });

        // Stage 2: Substring direct match
        if (!matchedKey) {
          matchedKey = Object.keys(sectionMap).find((k) => {
            const lk = k.toLowerCase();
            return (
              secId.includes(lk) ||
              cleanSecId.includes(lk) ||
              secComp.includes(lk) ||
              lk.includes(secComp) ||
              secName.includes(lk)
            );
          });
        }

        // Stage 3: Normalized alphanumeric match (ignores hyphens, casing, underscores)
        if (!matchedKey) {
          matchedKey = Object.keys(sectionMap).find((k) => {
            const normKey = normalizeStr(k);
            if (!normKey) return false;
            return (
              normKey === normId ||
              normKey === normCleanId ||
              normKey === normComp ||
              normKey === normType ||
              normKey === normName ||
              normId.includes(normKey) ||
              normKey.includes(normCleanId) ||
              normComp.includes(normKey) ||
              normKey.includes(normComp) ||
              normName.includes(normKey)
            );
          });
        }

        const rawContent = matchedKey ? sectionMap[matchedKey] : null;
        if (!rawContent) return null;

        const content = typeof rawContent === 'function' ? (rawContent as any)(section, index) : rawContent;
        if (!content) return null;

        return enhanceElement(content, section, index, matchedKey);
      }
      return null;
    })
    .filter(Boolean);

  if (renderedElements.length === 0 && actualFallback) {
    return <>{actualFallback}</>;
  }

  return <>{renderedElements}</>;
}
