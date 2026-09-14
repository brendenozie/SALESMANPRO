'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
  ClockIcon,
  TagIcon,
  Squares2X2Icon,
  ArrowUturnLeftIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { EditableElement, useEditableContent } from '@/contexts/EditableContentContext';

export interface UniversalFeaturesSectionProps {
  features?: Array<{
    id?: number | string;
    title: string;
    description: string;
    icon?: any;
    iconName?: string;
  }>;
  items?: any[];
  badges?: any[];
  themeSettings?: any;
  componentKey?: string;
  sectionId?: string;
  badgeText?: string;
  title?: string;
  description?: string;
  badge?: string;
  defaultCategoryName?: string;
}

const DEFAULT_FEATURES = [
  {
    id: 1,
    title: 'Fast Doorstep Delivery',
    description: 'Get your orders delivered to your doorstep at the earliest with priority tracking.',
    icon: ClockIcon,
  },
  {
    id: 2,
    title: 'Best Prices & Offers',
    description: 'Direct wholesale rates and exclusive member cashback on verified quality products.',
    icon: TagIcon,
  },
  {
    id: 3,
    title: 'Wide Premium Selection',
    description: 'Carefully curated catalog featuring top-tier collections across all categories.',
    icon: Squares2X2Icon,
  },
  {
    id: 4,
    title: 'Easy Returns & Support',
    description: 'Hassle-free 30-day returns and dedicated 24/7 client care for complete peace of mind.',
    icon: ArrowUturnLeftIcon,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 14,
    },
  },
};

const iconMap: Record<string, React.ElementType> = {
  clock: ClockIcon,
  tag: TagIcon,
  squares: Squares2X2Icon,
  return: ArrowUturnLeftIcon,
  shield: ShieldCheckIcon,
  sparkles: SparklesIcon,
  truck: TruckIcon,
};

export default function UniversalFeaturesSection({
  features,
  items,
  badges,
  themeSettings = {},
  componentKey = 'FeaturesSection',
  sectionId = 'features',
  badgeText: propBadgeText,
  title: propTitle,
  description: propDescription,
  badge: propBadge,
}: UniversalFeaturesSectionProps) {
  const { getOverride } = useEditableContent();

  const primary = themeSettings?.primaryColor || '#10B981';
  const secondary = themeSettings?.secondaryColor || '#059669';

  // Resolve active list of features from props, items, badges, or defaults
  const activeFeatures =
    features && features.length > 0
      ? features
      : items && items.length > 0
      ? items
      : badges && badges.length > 0
      ? badges
      : DEFAULT_FEATURES;

  const sectionPrefix = `home.${sectionId}.${componentKey}`;

  // Live element overrides
  const badgeText = getOverride(`${sectionPrefix}.badgeText`, propBadgeText || 'Why Customers Choose Us');
  const title = getOverride(`${sectionPrefix}.title`, propTitle || 'Engineered For Excellence');
  const description = getOverride(
    `${sectionPrefix}.description`,
    propDescription || 'Every order is backed by our full authenticity guarantee, priority dispatch, and hassle-free returns.'
  );
  const latencyBadge = getOverride(`${sectionPrefix}.badge`, propBadge || 'Instant Dispatch');

  const resolveFeatureIcon = (feature: any, idx: number): React.ElementType => {
    if (feature.icon && (typeof feature.icon === 'function' || typeof feature.icon === 'object')) {
      return feature.icon;
    }
    if (feature.iconName && iconMap[feature.iconName.toLowerCase()]) {
      return iconMap[feature.iconName.toLowerCase()];
    }
    const defaultIcons = [ClockIcon, TagIcon, Squares2X2Icon, ArrowUturnLeftIcon];
    return defaultIcons[idx % defaultIcons.length];
  };

  return (
    <section className="py-14 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 border-y border-zinc-100 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <EditableElement
              targetId={`${sectionPrefix}.badgeText`}
              componentKey={componentKey}
              elementKey="badgeText"
              label="Eyebrow Badge"
              type="text"
              defaultValue={propBadgeText || 'Why Customers Choose Us'}
              inline
            >
              {(val) => (
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${primary}15`,
                    color: primary,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
                  {val ?? badgeText}
                </div>
              )}
            </EditableElement>

            <EditableElement
              targetId={`${sectionPrefix}.title`}
              componentKey={componentKey}
              elementKey="title"
              label="Section Heading"
              type="text"
              defaultValue={propTitle || 'Engineered For Excellence'}
            >
              {(val) => (
                <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {val ?? title}
                </h2>
              )}
            </EditableElement>

            <EditableElement
              targetId={`${sectionPrefix}.description`}
              componentKey={componentKey}
              elementKey="description"
              label="Section Description"
              type="textarea"
              defaultValue={
                propDescription ||
                'Every order is backed by our full authenticity guarantee, priority dispatch, and hassle-free returns.'
              }
            >
              {(val) => (
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {val ?? description}
                </p>
              )}
            </EditableElement>
          </div>

          <EditableElement
            targetId={`${sectionPrefix}.badge`}
            componentKey={componentKey}
            elementKey="badge"
            label="Highlight Badge"
            type="text"
            defaultValue={propBadge || 'Instant Dispatch'}
            inline
          >
            {(val) => (
              <div className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800/80 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm self-start md:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {val ?? latencyBadge}
              </div>
            )}
          </EditableElement>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {activeFeatures.map((feature, idx) => {
            const Icon = resolveFeatureIcon(feature, idx);
            const itemKey = `${sectionPrefix}.items.${idx}`;

            const itemTitle = getOverride(`${itemKey}.title`, feature.title);
            const itemDesc = getOverride(`${itemKey}.description`, feature.description);

            return (
              <motion.div
                key={feature.id || idx}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${primary}12`,
                    color: primary,
                  }}
                >
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>

                <div className="space-y-2">
                  <EditableElement
                    targetId={`${itemKey}.title`}
                    componentKey={componentKey}
                    elementKey={`items.${idx}.title`}
                    label={`Feature ${idx + 1} Title`}
                    type="text"
                    defaultValue={feature.title}
                  >
                    {(val) => (
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors duration-200">
                        {val ?? itemTitle}
                      </h3>
                    )}
                  </EditableElement>

                  <EditableElement
                    targetId={`${itemKey}.description`}
                    componentKey={componentKey}
                    elementKey={`items.${idx}.description`}
                    label={`Feature ${idx + 1} Description`}
                    type="textarea"
                    defaultValue={feature.description}
                  >
                    {(val) => (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {val ?? itemDesc}
                      </p>
                    )}
                  </EditableElement>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
