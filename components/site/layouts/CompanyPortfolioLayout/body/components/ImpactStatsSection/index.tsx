'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  CurrencyDollarIcon, 
  GlobeAsiaAustraliaIcon, 
  ShieldCheckIcon, 
  CpuChipIcon,
  ChartBarIcon,
  BriefcaseIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';

// --- TYPES & INTERFACES ---
export interface Stat {
  id?: string;
  label: string;
  value: number | string;
  icon?: string | null;
  suffix?: string | null;
  prefix?: string | null;
  order?: number;
}

export interface Metric {
  id?: string;
  value: any;
  unit?: string | null;
  label: string;
  icon?: string | null;
  order?: number;
}

export interface Award {
  id?: string;
  name: string;
  organization?: string | null;
  year?: number | null;
  category?: string | null;
  iconUrl?: string; // Mapped to icon string if used
  order?: number;
}

interface ComponentProps {
  pagedata?: {
    name?: string;
    stats?: Stat[] | null;
    metrics?: Metric[] | null;
    awards?: Award[] | null;
  };
}

interface UnifiedMetric {
  id: string;
  value: string;
  label: string;
  order: number;
  Icon: React.ElementType<React.SVGProps<SVGSVGElement>>;
}

// --- ICON REGISTRY ---
const iconMap: Record<string, React.ElementType<React.SVGProps<SVGSVGElement>>> = {
  CurrencyDollarIcon,
  GlobeAsiaAustraliaIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ChartBarIcon,
  BriefcaseIcon,
  TrophyIcon,
  StarIcon
};

const defaultIcons = [CurrencyDollarIcon, GlobeAsiaAustraliaIcon, CpuChipIcon, ShieldCheckIcon];

// --- FALLBACK STATIC DATA ---
const fallbackPerformanceMetrics: UnifiedMetric[] = [
  { id: 'gt-metric-1', value: "$480M+", label: "Settled Transactional Cleared Value", order: 1, Icon: CurrencyDollarIcon },
  { id: 'gt-metric-2', value: "14", label: "Active Sovereign Corridors", order: 2, Icon: GlobeAsiaAustraliaIcon },
  { id: 'gt-metric-3', value: "99.84%", label: "On-Time Operational Fulfillment", order: 3, Icon: CpuChipIcon },
  { id: 'gt-metric-4', value: "Tier-1", label: "Regulatory Audit Classification", order: 4, Icon: ShieldCheckIcon },
];

// --- ANIMATION VARIANTS ---
const gridContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const metricTileVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// --- DATA CARD COMPONENT ---
const MetricTile = ({ metric }: { metric: UnifiedMetric }) => {
  const IconComponent = metric.Icon;

  return (
    <motion.div
      variants={metricTileVariants}
      className="group relative bg-zinc-900/20 backdrop-blur-sm border border-zinc-900 rounded-xl p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:bg-zinc-900/40 hover:border-zinc-800 w-full"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900/80 text-zinc-500 group-hover:text-amber-500 transition-colors duration-300 shadow-inner">
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="font-mono text-[10px] tracking-widest text-zinc-600 select-none">
            // SYS_0{metric.order}
          </span>
        </div>

        <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight leading-none break-words">
          {metric.value}
        </h3>
      </div>
      
      <p className="mt-4 text-xs font-medium tracking-wide text-zinc-400 border-t border-zinc-900 pt-4 group-hover:text-zinc-300 transition-colors">
        {metric.label}
      </p>
    </motion.div>
  );
};

// --- MAIN DASHBOARD SECTION ---
export default function PerformanceMetricsDashboard({ pagedata }: ComponentProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const sectionTitle = "Institutional Volume & Performance";
  const firmName = pagedata?.name || "Trading Limited"; 

  // --- 1. NORMALIZATION & AGGREGATION PIPELINE ---
  // Convert all distinct data types into a universally parsable format
  const normalizedMetrics = (pagedata?.metrics || []).map(m => ({
    id: m.id,
    value: `${m.value || ''}${m.unit || ''}`.trim(),
    label: m.label,
    icon: m.icon,
    order: m.order ?? 99
  }));

  const normalizedStats = (pagedata?.stats || []).map(s => ({
    id: s.id,
    value: `${s.prefix || ''}${s.value || ''}${s.suffix || ''}`.trim(),
    label: s.label,
    icon: s.icon,
    order: s.order ?? 99
  }));

  const normalizedAwards = (pagedata?.awards || []).map(a => ({
    id: a.id,
    value: a.name,
    // Combine available contextual data for the sub-label
    label: [a.category, a.organization, a.year].filter(Boolean).join(' • ') || 'Industry Recognition',
    icon: 'TrophyIcon', 
    order: a.order ?? 99
  }));

  // --- 2. MERGE & CAP PIPELINE ---
  // Pool them all together, sort by order, and take the top 4
  const pooledData = [...normalizedMetrics, ...normalizedStats, ...normalizedAwards]
    .sort((a, b) => a.order - b.order)
    .slice(0, 4);

  // --- 3. FINAL MAP TO COMPONENT PROPS ---
  const finalMetrics: UnifiedMetric[] = pooledData.length > 0 
    ? pooledData.map((item, index) => {
        const iconKey = item.icon || '';
        const SelectedIcon = iconMap[iconKey] || defaultIcons[index % defaultIcons.length];
        return {
          id: item.id || `pooled-${index}`,
          value: item.value,
          label: item.label,
          order: item.order !== 99 ? item.order : (index + 1),
          Icon: SelectedIcon
        };
      })
    : fallbackPerformanceMetrics;

  // --- 4. DYNAMIC GRID ARCHITECTURE ---
  // If we only have 1 or 2 items TOTAL, scale the grid classes to fill the space cleanly
  const itemCount = finalMetrics.length;
  let dynamicGridClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"; // Default 4 items
  let containerWidth = "max-w-7xl";

  if (itemCount === 1) {
    dynamicGridClass = "grid-cols-1";
    containerWidth = "max-w-3xl"; // Keeps a single item from looking awkwardly wide
  } else if (itemCount === 2) {
    dynamicGridClass = "grid-cols-1 sm:grid-cols-2";
    containerWidth = "max-w-4xl";
  } else if (itemCount === 3) {
    dynamicGridClass = "grid-cols-1 sm:grid-cols-3";
    containerWidth = "max-w-6xl";
  }

  return (
    <section id="performance-ledger" className="py-24 md:py-32 bg-zinc-950 text-white font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-x-0 bottom-1/4 h-[1px] bg-zinc-900" />
        <div className="absolute left-1/4 inset-y-0 w-[1px] bg-zinc-900 hidden lg:block" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start mb-20">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-500 mb-3">
              Audited Capital Realization
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight uppercase leading-none">
              {sectionTitle}
            </h2>
          </div>
          
          <div className="lg:col-span-7 lg:border-l lg:border-zinc-900 lg:pl-10">
            <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed text-justify">
              The continuous scale of our processing network relies entirely upon automated compliance checking, multi-asset security vaults, and precision timing. These verified ledgers map the continuous operational throughput generated under the direction of **{firmName}**.
            </p>
          </div>
        </div>

        {/* Quant Matrix Grid - Centered & Dynamically Sized */}
        <div className={`mx-auto w-full ${containerWidth}`}>
          <motion.div 
            ref={ref} 
            variants={gridContainerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className={`grid gap-4 ${dynamicGridClass}`}
          >
            {finalMetrics.map((metric) => (
              <MetricTile key={metric.id} metric={metric} />
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}