'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';
import { useEditableContent, EditableElement } from '@/contexts/EditableContentContext';

// --- Improved Metric Card ---
const MetricCard = ({
  title,
  description,
  iconName,
  index,
  primaryColor
}: {
  title: string;
  description: string;
  iconName: string;
  index: number;
  primaryColor: string;
}) => {
  // Safe Icon Resolution
  const Icon = (OutlineIcons as any)[iconName] || OutlineIcons.SparklesIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      viewport={{ once: true }}
      className="group relative p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 shadow-xl shadow-black/5 backdrop-blur-sm transition-all duration-500 hover:border-transparent"
    >
      {/* Dynamic Glow Effect (Dark Mode only) */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-[2.5rem] blur-2xl" 
        style={{ backgroundColor: primaryColor }}
      />

      {/* Decorative Index Overlay */}
      <span className="absolute top-6 right-8 text-7xl font-black opacity-[0.03] dark:opacity-[0.07] italic select-none tracking-tighter transition-all group-hover:opacity-[0.1] group-hover:-translate-y-2">
        {index + 1}
      </span>

      <div className="relative z-10 flex flex-col items-start text-left">
        {/* Icon Container */}
        <div 
          className="p-4 rounded-2xl mb-8 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 shadow-lg shadow-black/5"
          style={{ 
            backgroundColor: `${primaryColor}15`, 
            color: primaryColor,
            boxShadow: `0 0 20px ${primaryColor}10` 
          }}
        >
          <Icon className="w-10 h-10" strokeWidth={1.5} />
        </div>

        <EditableElement
          targetId={`home.metrics.items.${index}.title`}
          componentKey="MetricsSection"
          elementKey="title"
          label={`Metric ${index + 1} Title`}
          defaultValue={title}
        >
          {(val) => (
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight uppercase">
              {val}
            </h3>
          )}
        </EditableElement>
        
        <EditableElement
          targetId={`home.metrics.items.${index}.description`}
          componentKey="MetricsSection"
          elementKey="description"
          label={`Metric ${index + 1} Description`}
          type="textarea"
          defaultValue={description}
        >
          {(val) => (
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-sm font-medium">
              {val}
            </p>
          )}
        </EditableElement>
      </div>

      {/* Animated Accent Border */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 w-0 group-hover:w-1/2 transition-all duration-700 rounded-full"
        style={{ backgroundColor: primaryColor }}
      />
    </motion.div>
  );
};

interface MetricsSectionProps {
  coreValues?: ICoreValue[];
}

export default function MetricsSection({ coreValues }: MetricsSectionProps) {
  const store = useStoreContext();
  const themeSettings = store?.storeFormData?.themeSettings;
  const primaryColor = themeSettings?.primaryColor || '#ef4444';

  const defaultValues: ICoreValue[] = [
    {
      id: '1',
      title: 'Global Shipping',
      description: 'Expedited delivery to over 50 countries with real-time tracking.',
      icon: 'GlobeAmericasIcon',
    },
    {
      id: '2',
      title: 'Authenticity Guaranteed',
      description: 'Every pair is verified by our experts before it reaches your door.',
      icon: 'ShieldCheckIcon',
    },
    {
      id: '3',
      title: 'Flexible Returns',
      description: 'Not the perfect fit? Return or exchange within 30 days, no questions asked.',
      icon: 'ArrowPathRoundedSquareIcon',
    },
  ];

  const data = coreValues && coreValues.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative py-28 bg-gray-50 dark:bg-black overflow-hidden transition-colors duration-500">
      {/* Technical Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.15] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`,
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="h-[2px] w-12" style={{ backgroundColor: primaryColor }} />
              <EditableElement
                targetId="home.metrics.badge"
                componentKey="MetricsSection"
                elementKey="badge"
                label="Metrics Badge"
                defaultValue="The Standard"
                inline
              >
                {(val) => (
                  <span className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: primaryColor }}>
                    {val}
                  </span>
                )}
              </EditableElement>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <EditableElement
                targetId="home.metrics.title"
                componentKey="MetricsSection"
                elementKey="title"
                label="Metrics Title"
                defaultValue="Engineered for Excellence."
              >
                {(val) => (
                  <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[0.9] italic uppercase">
                    {val}
                  </h2>
                )}
              </EditableElement>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="lg:max-w-sm pb-2"
          >
            <EditableElement
              targetId="home.metrics.description"
              componentKey="MetricsSection"
              elementKey="description"
              label="Metrics Description"
              type="textarea"
              defaultValue="We deliver a premium service ecosystem tailored for the modern athlete and sneaker enthusiast."
            >
              {(val) => (
                <p className="text-gray-500 dark:text-zinc-400 text-lg font-medium leading-relaxed">
                  {val}
                </p>
              )}
            </EditableElement>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {data.map((value, idx) => (
            <MetricCard
              key={value.id}
              index={idx}
              title={value.title}
              description={value.description || ''}
              iconName={value.icon || 'SparklesIcon'}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}