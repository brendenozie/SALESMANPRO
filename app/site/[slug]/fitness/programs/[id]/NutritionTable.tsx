"use client";

import React from 'react';
import { BeakerIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export function NutritionTable() {
  const nutritionData = [
    { label: 'Protein (Whey Isolate)', amount: '24g', dv: '48%' },
    { label: 'BCAAs (2:1:1 Ratio)', amount: '5.5g', dv: '†' },
    { label: 'Glutamine & Precursors', amount: '4g', dv: '†' },
    { label: 'Total Carbohydrates', amount: '3g', dv: '1%' },
    { label: 'Magnesium Citrate', amount: '150mg', dv: '35%' },
  ];

  return (
    <section className="py-24 px-6 lg:px-20 border-t border-zinc-100 dark:border-zinc-900">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-20">
        
        {/* Left: The Facts Table */}
        <div className="lg:col-span-7">
          <div className="p-10 rounded-[3rem] bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-10 flex items-center gap-3">
              <BeakerIcon className="w-5 h-5 text-emerald-500" /> Bio-Available Composition
            </h4>

            <div className="space-y-1">
              {nutritionData.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-6 border-b border-zinc-200 dark:border-zinc-800 last:border-0 group">
                  <div>
                    <p className="text-sm font-black dark:text-white group-hover:text-amber-500 transition-colors">{item.label}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Per Serving (32g)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black dark:text-white">{item.amount}</p>
                    <p className="text-[10px] font-black text-zinc-400 uppercase">% Daily Value</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-3 p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
              <InformationCircleIcon className="w-5 h-5 text-zinc-400" />
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
                † Daily Value not established. Percent Daily Values are based on a 2,000 calorie diet.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Ingredient Quality Badges */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <h4 className="text-2xl font-bold dark:text-white mb-8 tracking-tight">Pure Source <br/> Guarantee</h4>
          <div className="space-y-6">
            {[
              { title: 'Cold-Pressed Extraction', desc: 'Preserves the structural integrity of every peptide.' },
              { title: 'Zero Artificial Fillers', desc: 'No maltodextrin, aspartame, or synthetic dyes.' },
              { title: 'Nairobi Lab Verified', desc: 'Batch-tested for purity in our local facilities.' }
            ].map((feature, i) => (
              <div key={i} className="flex gap-5">
                <CheckCircleIcon className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h5 className="text-sm font-black uppercase tracking-widest dark:text-white mb-1">{feature.title}</h5>
                  <p className="text-xs text-zinc-500 leading-relaxed font-light">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}