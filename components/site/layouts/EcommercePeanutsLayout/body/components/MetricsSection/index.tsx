'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';

const MetricCard = ({
  title,
  description,
  Icon,
  index
}: {
  title: string;
  description: string;
  Icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative group p-8 rounded-[2.5rem] bg-white border border-stone-100 shadow-[0_10px_30px_rgba(62,39,35,0.04)] hover:shadow-[0_20px_50px_rgba(139,69,19,0.12)] transition-all duration-500 overflow-hidden"
    >
      {/* Decorative background shape */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-stone-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 flex items-center justify-center rounded-3xl bg-[#FAF7F2] text-[#8B4513] mb-6 group-hover:bg-[#3E2723] group-hover:text-white transition-colors duration-500">
          <Icon className="w-10 h-10 stroke-[1.5]" />
        </div>
        
        <h3 className="text-xl font-black text-[#3E2723] mb-3 tracking-tight">
          {title}
        </h3>
        
        <p className="text-stone-500 text-sm font-medium leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default function MetricsSection({ coreValues }: { coreValues: ICoreValue[] }) {
  const { storeFormData } = useStoreContext();
  
  const DefaultValues = [
    {
      id: '1',
      title: 'Secure Checkout',
      description: 'Encrypted transactions for every jar of goodness.',
      icon: 'ShieldCheckIcon',
    },
    {
      id: '2',
      title: 'Human Support',
      description: 'Our peanut experts are here to help, day or night.',
      icon: 'ChatBubbleLeftRightIcon',
    },
    {
      id: '3',
      title: 'Flash Shipping',
      description: 'Roasted yesterday, at your doorstep tomorrow.',
      icon: 'TruckIcon',
    },
  ];

  const values = coreValues?.length > 0 ? coreValues : DefaultValues;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Organic background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#F3A852_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.15] [mask-image:linear-gradient(to_bottom,white,transparent,white)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[#8B4513] font-black uppercase tracking-[0.3em] text-[10px]"
          >
            The Peanut Way
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-[#3E2723] mt-4 mb-6 tracking-tighter"
          >
            Why our pantry <br />
            <span className="text-[#F3A852]">hits different.</span>
          </motion.h2>
          <p className="text-stone-500 font-medium">
            We’ve obsessed over every detail of the journey, from the farm to your morning toast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, idx) => {
            const iconKey = (value.icon ?? 'SparklesIcon') as string;
            const Icon = ((OutlineIcons as any)[iconKey] || OutlineIcons.SparklesIcon);
            
            return (
              <MetricCard
                key={value.id}
                index={idx}
                title={value.title}
                description={value.description || ''}
                Icon={Icon}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}