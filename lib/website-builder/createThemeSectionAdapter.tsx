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

  const renderedElements = sections
    .map((section, index) => {
      if (section.visible === false || section.isVisible === false) {
        return null;
      }
      if (renderSection) {
        const content = renderSection(section, index);
        if (!content) return null;

        const enhancedContent = React.isValidElement(content)
          ? React.cloneElement(content as React.ReactElement<any>, {
              sectionId: section.id,
              sectionType: section.type,
              sectionContent: section.content,
              ...(section.content && typeof section.content === 'object' && !Array.isArray(section.content)
                ? section.content
                : {}),
            })
          : content;

        // If the rendered component already has data-editor-section, return it directly to avoid double wrappers
        if (React.isValidElement(enhancedContent) && (enhancedContent.props as any)?.['data-editor-section']) {
          return React.cloneElement(enhancedContent as React.ReactElement<any>, {
            key: section.id || index,
          });
        }

        const domId = (section.id || '').startsWith('section-') ? section.id : `section-${section.id || index}`;

        return (
          <div
            key={section.id || index}
            id={domId}
            data-editor-section={section.id}
            data-editor-component={section.component || section.name || section.id}
          >
            {enhancedContent}
          </div>
        );
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

        const enhancedContent = React.isValidElement(content)
          ? React.cloneElement(content as React.ReactElement<any>, {
              sectionId: section.id,
              sectionType: section.type,
              sectionContent: section.content,
              ...(section.content && typeof section.content === 'object' && !Array.isArray(section.content)
                ? section.content
                : {}),
            })
          : content;

        if (React.isValidElement(enhancedContent) && (enhancedContent.props as any)?.['data-editor-section']) {
          return React.cloneElement(enhancedContent as React.ReactElement<any>, {
            key: section.id || index,
          });
        }

        const domId = (section.id || '').startsWith('section-') ? section.id : `section-${section.id || index}`;

        return (
          <div
            key={section.id || index}
            id={domId}
            data-editor-section={section.id}
            data-editor-component={section.component || section.name || matchedKey}
          >
            {enhancedContent}
          </div>
        );
      }
      return null;
    })
    .filter(Boolean);

  if (renderedElements.length === 0 && actualFallback) {
    return <>{actualFallback}</>;
  }

  return <>{renderedElements}</>;
}
