'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PresentationChartLineIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type Metric = {
  label: string;
  value: number | null;
  iconUrl?: string;
};

type MetricsAccordionProps = {
  metrics: Metric[] | null;
  onAdd: () => void;
  onUpdate: (idx: number, field: keyof Metric, value: any) => void;
  onRemove: (idx: number) => void;
};

const presetIcons = [
  { name: 'Sales', url: 'https://img.icons8.com/color/96/sales-performance.png' },
  { name: 'Revenue', url: 'https://img.icons8.com/color/96/money-bag.png' },
  { name: 'Growth', url: 'https://img.icons8.com/color/96/increase.png' },
  { name: 'Users', url: 'https://img.icons8.com/color/96/group.png' },
  { name: 'Profit', url: 'https://img.icons8.com/color/96/profit.png' },
  { name: 'Target', url: 'https://img.icons8.com/color/96/goal.png' },
  { name: 'Analytics', url: 'https://img.icons8.com/color/96/combo-chart.png' },
];

export const MetricsAccordion: React.FC<MetricsAccordionProps> = ({
  metrics,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [open, setOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMetricIndex, setActiveMetricIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!metrics || metrics.length === 0) onAdd();
  }, [metrics, onAdd]);

  const canAddNew = metrics?.every((m) => m.label.trim() && m.value !== null);

  const filteredIcons = presetIcons.filter((icon) =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  const openIconModal = (idx: number) => {
    setActiveMetricIndex(idx);
    setModalOpen(true);
  };

  const selectIcon = (url: string) => {
    if (activeMetricIndex !== null) {
      onUpdate(activeMetricIndex, 'iconUrl', url);
    }
    setModalOpen(false);
    setActiveMetricIndex(null);
  };

  return (
    <section className="max-w-4xl mx-auto w-full border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden shadow-sm transition-colors duration-200">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-5 sm:px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100/70 dark:hover:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-expanded={open}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
            <PresentationChartLineIcon className="h-5 w-5" />
          </div>
          <h2 className="text-md font-semibold text-zinc-800 dark:text-zinc-100">Key Performance Metrics</h2>
        </div>
        <div className="text-zinc-400 dark:text-zinc-500">
          {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="p-5 sm:p-6 space-y-6">
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics &&
                  metrics.map((metric, idx) => (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 sm:p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                    >
                      {/* Section Management Ribbon */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                          Data Point #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemove(idx)}
                          disabled={metrics.length === 1}
                          aria-label="Remove metric"
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-0 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-150"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Stacked Inputs */}
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor={`label-${idx}`}
                            className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5"
                          >
                            Metric Title
                          </label>
                          <input
                            id={`label-${idx}`}
                            type="text"
                            value={metric.label}
                            placeholder="e.g. Active Subscribers"
                            onChange={(e) => onUpdate(idx, 'label', e.target.value)}
                            className="w-full text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`value-${idx}`}
                            className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5"
                          >
                            Numerical Value
                          </label>
                          <input
                            id={`value-${idx}`}
                            type="number"
                            value={metric.value ?? ''}
                            placeholder="e.g. 14250"
                            onChange={(e) => onUpdate(idx, 'value', e.target.value === '' ? null : parseFloat(e.target.value))}
                            className="w-full text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all"
                          />
                        </div>

                        {/* Icon Visual Selection Wrapper */}
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Representative Badge
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openIconModal(idx)}
                              className="flex-1 flex items-center justify-between text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                              <span className="truncate">
                                {metric.iconUrl
                                  ? presetIcons.find((icon) => icon.url === metric.iconUrl)?.name || 'Custom Icon'
                                  : 'Assign stylized icon...'}
                              </span>
                              <ChevronDownIcon className="h-4 w-4 text-zinc-400 flex-shrink-0 ml-2" />
                            </button>

                            <div className="flex-shrink-0 flex items-center justify-center h-9 w-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5">
                              {metric.iconUrl ? (
                                <img
                                  src={metric.iconUrl}
                                  alt="Selected representation"
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <div className="h-full w-full border border-dashed border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-950" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                {/* Grid Slot Add Placeholder */}
                {metrics && (
                  <button
                    type="button"
                    onClick={canAddNew ? onAdd : undefined}
                    disabled={!canAddNew}
                    className={`flex flex-col justify-center items-center border-2 border-dashed rounded-xl p-6 transition-all min-h-[220px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                      canAddNew
                        ? 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 text-zinc-400 hover:text-indigo-500 dark:text-zinc-600 dark:hover:text-indigo-400'
                        : 'border-zinc-100 dark:border-zinc-900 opacity-40 cursor-not-allowed text-zinc-300 dark:text-zinc-700'
                    }`}
                  >
                    <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-2">
                      <PlusIcon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">Add Metric Field</span>
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Fixed Overlaid Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Soft Backdrop Tint */}
            <motion.div
              className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
            />

            {/* Container Interface */}
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              {/* Header Box */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-md font-semibold text-zinc-800 dark:text-zinc-100">Select Metric Badge</h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Form & Navigation Area */}
              <div className="p-6 space-y-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                  <input
                    type="text"
                    placeholder="Search available dashboard items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-sm pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Scroll Box Area */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto pr-1">
                  {filteredIcons.length > 0 ? (
                    filteredIcons.map((icon) => (
                      <button
                        type="button"
                        key={icon.url}
                        onClick={() => selectIcon(icon.url)}
                        className="group flex flex-col items-center p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-50/50 dark:hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] dark:hover:bg-indigo-500/[0.02] transition text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <div className="h-12 w-12 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-150">
                          <img
                            src={icon.url}
                            alt={icon.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-2.5 max-w-full truncate">
                          {icon.name}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center col-span-full py-10">
                      <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        No metric icons found matching &ldquo;{search}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};