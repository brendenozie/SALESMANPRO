'use client';

import React, { useState, useEffect } from 'react';
import {
  PresentationChartLineIcon,
  PlusCircleIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
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

export const MetricsAccordion: React.FC<MetricsAccordionProps> = ({ metrics, onAdd, onUpdate, onRemove }) => {
  const [open, setOpen] = useState(true);

  // Auto-add initial metric if none
  useEffect(() => {
    if (metrics?.length === 0) onAdd();
  }, [metrics, onAdd]);

  // Determine if next can be added
  const canAddNew = metrics?.every(m => m.label.trim() && m.value !== null);

  return (
    <section className="max-w-4xl mx-auto overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
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
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics && metrics.map((metric, idx) => (
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
                  <label htmlFor={`label-${idx}`} className="block text-sm font-medium text-gray-700">
                    Label
                  </label>
                  <input
                    id={`label-${idx}`}
                    type="text"
                    value={metric.label}
                    placeholder="e.g. Sales"
                    onChange={e => onUpdate(idx, 'label', e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-400 focus:border-purple-400 transition"
                  />
                </div>

                {/* Value */}
                <div className="mb-4">
                  <label htmlFor={`value-${idx}`} className="block text-sm font-medium text-gray-700">
                    Value
                  </label>
                  <input
                    id={`value-${idx}`}
                    type="number"
                    value={metric.value ?? ''}
                    placeholder="e.g. 1000"
                    onChange={e => onUpdate(idx, 'value', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-400 focus:border-purple-400 transition"
                  />
                </div>

                {/* Icon URL */}
                <div className="mb-4">
                  <label htmlFor={`icon-${idx}`} className="block text-sm font-medium text-gray-700">
                    Icon URL (optional)
                  </label>
                  <input
                    id={`icon-${idx}`}
                    type="text"
                    value={metric.iconUrl || ''}
                    placeholder="https://..."
                    onChange={e => onUpdate(idx, 'iconUrl', e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-400 focus:border-purple-400 transition"
                  />
                </div>

                {/* Icon Preview */}
                {metric.iconUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={metric.iconUrl}
                      alt={`${metric.label} icon`}
                      className="h-10 w-10 object-contain rounded border border-gray-300"
                    />
                    <span className="text-sm text-gray-500">Preview</span>
                  </div>
                )}
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

          {/* Tip */}
          <p className="text-sm text-gray-500 text-center">
            💡 Tip: Use icons from{' '}
            <a href="https://icons8.com/icons" target="_blank" rel="noreferrer" className="text-indigo-600 underline">
              Icons8
            </a>{' '}
            to enhance visual appeal.
          </p>
        </div>
      )}
    </section>
  );
};
