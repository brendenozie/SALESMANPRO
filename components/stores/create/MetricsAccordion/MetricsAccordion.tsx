'use client';

import React, { useState, useEffect } from 'react';
import {
  PresentationChartLineIcon,
  PlusCircleIcon,
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

// Example preset icons (you can extend or fetch dynamically)
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
    if (metrics?.length === 0) onAdd();
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
    <section className="max-w-4xl mx-auto overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
      >
        <div className="flex items-center space-x-3">
          <PresentationChartLineIcon className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Key Metrics</h2>
        </div>
        {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>

      {/* Accordion Content */}
      {open && (
        <div className="px-6 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics &&
              metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="relative bg-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition"
                >
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    disabled={metrics.length === 1}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 focus:outline-none disabled:opacity-40"
                    title="Remove metric"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>

                  {/* Label */}
                  <div className="mb-4">
                    <label
                      htmlFor={`label-${idx}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Label
                    </label>
                    <input
                      id={`label-${idx}`}
                      type="text"
                      value={metric.label}
                      placeholder="e.g. Sales"
                      onChange={(e) => onUpdate(idx, 'label', e.target.value)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-400 focus:border-purple-400 transition"
                    />
                  </div>

                  {/* Value */}
                  <div className="mb-4">
                    <label
                      htmlFor={`value-${idx}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Value
                    </label>
                    <input
                      id={`value-${idx}`}
                      type="number"
                      value={metric.value ?? ''}
                      placeholder="e.g. 1000"
                      onChange={(e) => onUpdate(idx, 'value', parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-400 focus:border-purple-400 transition"
                    />
                  </div>

                  {/* Icon Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Icon</label>
                    <div className="mt-2 flex items-center gap-4">
                      {metric.iconUrl ? (
                        <img
                          src={metric.iconUrl}
                          alt="Selected icon"
                          className="h-10 w-10 rounded border border-gray-300 object-contain"
                        />
                      ) : (
                        <div className="h-10 w-10 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-sm">
                          No Icon
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => openIconModal(idx)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                      >
                        Choose Icon
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Add Metric */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onAdd}
              disabled={!canAddNew}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Add Metric
            </button>
          </div>
        </div>
      )}

      {/* Icon Selector Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative animate-fadeIn">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Select an Icon</h3>

            {/* Search */}
            <div className="flex items-center border rounded-lg px-3 py-2 mb-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {filteredIcons.length > 0 ? (
                filteredIcons.map((icon) => (
                  <button
                    key={icon.url}
                    onClick={() => selectIcon(icon.url)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-indigo-50 hover:border-indigo-300 transition"
                  >
                    <img
                      src={icon.url}
                      alt={icon.name}
                      className="h-14 w-14 object-contain"
                    />
                    <span className="text-xs text-gray-600">{icon.name}</span>
                  </button>
                ))
              ) : (
                <p className="text-center col-span-full text-gray-500">No icons found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
