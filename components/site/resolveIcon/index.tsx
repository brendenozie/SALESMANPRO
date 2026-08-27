import {
  SparklesIcon,
  ShieldCheckIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

// ✅ Accept both FC and ForwardRefExoticComponent
type IconComponent =
  | React.FC<React.SVGProps<SVGSVGElement>>
  | React.ForwardRefExoticComponent<
      React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
    >;

const iconMap: Record<string, IconComponent> = {
  sparkles: SparklesIcon,
  shield: ShieldCheckIcon,
  // add more mappings
};

export function resolveIcon(name?: string): IconComponent {
  if (!name) return TagIcon; // fallback if empty/undefined
  return iconMap[name.toLowerCase()] || TagIcon;
}
