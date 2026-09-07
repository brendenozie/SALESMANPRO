"use client";

import React from "react";
import { ThemeTokens, SectionStyle } from "@/types/website-builder";
import {
  TruckIcon,
  ShieldCheckIcon,
  PhoneIcon,
  ArrowPathIcon,
  SparklesIcon,
  HeartIcon,
  BanknotesIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

interface FeatureBadgeItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface FeaturesBadgesProps {
  content: {
    badges?: FeatureBadgeItem[];
  };
  styles?: SectionStyle;
  theme: ThemeTokens;
}

const iconMap: Record<string, React.ElementType> = {
  truck: TruckIcon,
  shield: ShieldCheckIcon,
  phone: PhoneIcon,
  refresh: ArrowPathIcon,
  sparkles: SparklesIcon,
  heart: HeartIcon,
  currency: BanknotesIcon,
  tag: TagIcon,
};

export default function FeaturesBadgesSection({
  content,
  styles = {},
  theme,
}: FeaturesBadgesProps) {
  const badges = content.badges?.length ? content.badges : [];

  return (
    <section
      className="py-10 sm:py-12 border-y border-zinc-200/80 dark:border-zinc-800/80"
      style={{
        backgroundColor: styles.backgroundColor || "#F8FAFC",
        color: styles.textColor || undefined,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {badges.map((badge) => {
            const IconComponent = iconMap[badge.icon] || ShieldCheckIcon;
            return (
              <div key={badge.id} className="flex items-start gap-4">
                <div
                  className="p-3 rounded-2xl shrink-0 transition-transform hover:scale-105"
                  style={{
                    backgroundColor: `${theme.primaryColor}1A`,
                    color: theme.primaryColor,
                  }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
