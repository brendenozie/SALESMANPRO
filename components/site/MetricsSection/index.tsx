'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';

/**
 * MetricCard: Refactored into a "Modular Component" design.
 * Features: Obsidian glass, corner reticles, and monospaced "Unit" IDs.
 */
const MetricCard = ({
  title,
  description,
  Icon,
  index,
}: {
  title: string;
  description: string;
  Icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative p-8 bg-zinc-900 border border-white/5 hover:border-red-600/40 transition-all duration-300"
    >
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-red-600/50 group-hover:w-8 group-hover:h-8 transition-all" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-zinc-800" />

      {/* Background Index Number */}
      <span className="absolute top-4 right-6 font-mono text-4xl font-black text-white/[0.03] group-hover:text-red-600/10 transition-colors select-none">
        0{index + 1}
      </span>

      {/* Icon with "Power Glow" */}
      <div className="relative mb-8 inline-block">
        <div className="absolute inset-0 bg-red-600 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
        <div className="relative z-10 p-4 bg-black border border-white/10 text-red-600 skew-x-[-10deg] group-hover:bg-red-600 group-hover:text-white transition-all">
          <Icon className="w-10 h-10 skew-x-[10deg]" />
        </div>
      </div>

      {/* Content */}
      <div className="text-left">
        <h3 className="text-xl font-black italic text-white uppercase tracking-tighter mb-3 group-hover:text-red-500 transition-colors">
          {title}
        </h3>
        <p className="text-zinc-500 text-sm font-medium leading-relaxed font-mono uppercase tracking-tight group-hover:text-zinc-300 transition-colors">
          {description}
        </p>
      </div>

      {/* System Status Line */}
      <div className="mt-6 flex items-center gap-2">
        <div className="h-1 w-8 bg-red-600" />
        <div className="h-[1px] flex-1 bg-white/5" />
        <span className="font-mono text-[9px] text-zinc-600 group-hover:text-red-600 transition-colors">
          PROTOCOL_READY
        </span>
      </div>
    </motion.div>
  );
};

interface MetricCardProps {
  coreValues: ICoreValue[];
}

export default function MetricsSection({ coreValues }: MetricCardProps) {
  const defaultValues = [
    { id: '1', title: 'Secure Payment', description: 'Encrypted Transaction Tunnels', icon: 'ShieldCheckIcon' },
    { id: '2', title: '24/7 Support', description: 'Constant Neural Link Support', icon: 'PhoneIcon' },
    { id: '3', title: 'Fast Delivery', description: 'Supersonic Logistic Deployment', icon: 'TruckIcon' },
  ];

  const coreValuesToUse = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative py-32 bg-black overflow-hidden">
      {/* HUD Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
      
      {/* Vertical Data Path Lines */}
      <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-red-600/20 to-transparent hidden lg:block" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        {/* Header Section */}
        <div className="mb-20 text-center lg:text-left flex flex-col lg:flex-row items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/20 text-red-500 font-mono text-[10px] tracking-[0.3em] uppercase mb-6"
            >
              <div className="w-1.5 h-1.5 bg-red-600 animate-pulse" />
              Operational_Foundations
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">
              WHY JOIN THE <span className="text-red-600">EMPIRE?</span>
            </h2>
          </div>

          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest max-w-xs text-right hidden lg:block">
            System uptime 99.9% // All security protocols active // Global delivery networks engaged.
          </p>
        </div>

        {/* Modular Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-white/5">
          {coreValuesToUse.map((value, idx) => {
            const iconKey = (value.icon ?? 'SparklesIcon') as string;
            const Icon = ((OutlineIcons as any)[iconKey] || OutlineIcons.SparklesIcon);

            return (
              <MetricCard
                key={value.id}
                title={value.title}
                description={value.description || ''}
                Icon={Icon}
                index={idx}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}