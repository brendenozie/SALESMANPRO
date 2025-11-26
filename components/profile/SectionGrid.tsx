// components/profile/SectionGrid.tsx
// Shared section grid layout component
'use client';

import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface SectionGridProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  showViewAll?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  className?: string;
}

export default function SectionGrid({
  title,
  subtitle,
  children,
  columns = 3,
  showViewAll = false,
  viewAllHref,
  viewAllLabel = 'View all',
  onViewAll,
  className = '',
}: SectionGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <section className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {showViewAll && (
          viewAllHref ? (
            <a
              href={viewAllHref}
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:gap-2 transition-all"
            >
              {viewAllLabel}
              <ChevronRightIcon className="w-4 h-4" />
            </a>
          ) : onViewAll ? (
            <button
              onClick={onViewAll}
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:gap-2 transition-all"
            >
              {viewAllLabel}
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          ) : null
        )}
      </div>

      {/* Grid */}
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {children}
      </div>
    </section>
  );
}

// ============================================================================
// SECTION HIGHLIGHTS
// ============================================================================

interface HighlightItemProps {
  title: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
}

interface SectionHighlightsProps {
  title: string;
  subtitle?: string;
  highlights: HighlightItemProps[];
  className?: string;
}

export function SectionHighlights({
  title,
  subtitle,
  highlights,
  className = '',
}: SectionHighlightsProps) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <section className={`${className}`}>
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {highlights.map((item, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            {item.icon && (
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                {/* Simple icon placeholder - in production, use a proper icon mapping */}
                <span className="text-xl">{item.icon}</span>
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
            {item.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// CORE VALUES SECTION
// ============================================================================

interface CoreValue {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
}

interface CoreValuesSectionProps {
  title?: string;
  values: CoreValue[];
  className?: string;
}

export function CoreValuesSection({
  title = 'Our Core Values',
  values,
  className = '',
}: CoreValuesSectionProps) {
  if (!values || values.length === 0) return null;

  return (
    <section className={`${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((value) => (
          <div
            key={value.id}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center"
          >
            {value.icon && (
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-2xl">
                {value.icon}
              </div>
            )}
            <h3 className="font-semibold text-gray-900 dark:text-white">{value.title}</h3>
            {value.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// STATS SECTION
// ============================================================================

interface StatItem {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
}

interface StatsSectionProps {
  stats: StatItem[];
  className?: string;
}

export function StatsSection({ stats, className = '' }: StatsSectionProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <section className={`bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">
              {stat.prefix}{stat.value}{stat.suffix}
            </div>
            <div className="mt-2 text-indigo-100">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
