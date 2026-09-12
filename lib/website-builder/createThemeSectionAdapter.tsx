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

  return (
    <>
      {sections.map((section, index) => {
        if (section.visible === false || section.isVisible === false) {
          return null;
        }
        if (renderSection) {
          const content = renderSection(section, index);
          if (!content) return null;
          return (
            <div
              key={section.id || index}
              id={`section-${section.id}`}
              data-editor-section={section.id}
              data-editor-component={section.component || section.name || section.id}
            >
              {content}
            </div>
          );
        }
        if (sectionMap) {
          const secId = (section.id || '').toLowerCase();
          const secType = (section.type || '').toLowerCase();
          const secComp = (section.component || '').toLowerCase();

          let matchedKey = Object.keys(sectionMap).find((k) => {
            const lk = k.toLowerCase();
            return lk === secId || lk === secType || secId.startsWith(lk) || lk === secComp;
          });

          if (!matchedKey) {
            matchedKey = Object.keys(sectionMap).find((k) => {
              const lk = k.toLowerCase();
              return secId.includes(lk) || secComp.includes(lk);
            });
          }

          const content = matchedKey ? sectionMap[matchedKey] : null;
          if (!content) return null;

          return (
            <div
              key={section.id || index}
              id={`section-${section.id}`}
              data-editor-section={section.id}
              data-editor-component={section.component || section.name || matchedKey}
            >
              {content}
            </div>
          );
        }
        return null;
      })}
    </>
  );
}
