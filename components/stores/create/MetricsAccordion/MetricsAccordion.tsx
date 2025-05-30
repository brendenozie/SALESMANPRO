'use client';

import React, { useEffect } from 'react';
import { Metric } from '../../../../types/typings';
import { TrashIcon, PlusIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';

interface Props {
  metrics: Metric[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Metric, value: any) => void;
  onRemove: (index: number) => void;
}

export const MetricsAccordion: React.FC<Props> = ({ metrics, onAdd, onUpdate, onRemove }) => {
  useEffect(() => {
    if (metrics.length === 0) {
      onAdd();
    }
  }, [metrics, onAdd]);

  const canAddNew = metrics.every(metric => metric.label.trim() && metric.value !== null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-800">
          <PresentationChartLineIcon className="h-6 w-6 text-purple-500" />
          Key Metrics
        </h2>
        <button
          type="button"
          onClick={onAdd}
          disabled={!canAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Metric
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="relative p-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              title="Remove metric"
              disabled={metrics.length === 1}
            >
              <TrashIcon className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <label htmlFor={`label-${i}`} className="block text-sm font-medium text-gray-700">
                Label
              </label>
              <input
                id={`label-${i}`}
                type="text"
                placeholder="e.g. Sales"
                value={metric.label}
                onChange={(e) => onUpdate(i, 'label', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div className="mb-4">
              <label htmlFor={`value-${i}`} className="block text-sm font-medium text-gray-700">
                Value
              </label>
              <input
                id={`value-${i}`}
                type="number"
                placeholder="e.g. 1000"
                value={metric.value}
                onChange={(e) => onUpdate(i, 'value', parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div className="mb-4">
              <label htmlFor={`icon-${i}`} className="block text-sm font-medium text-gray-700">
                Icon URL
              </label>
              <input
                id={`icon-${i}`}
                type="text"
                placeholder="https://..."
                value={metric.iconUrl ?? ''}
                onChange={(e) => onUpdate(i, 'iconUrl', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {metric.iconUrl && (
              <div className="mt-2">
                <img
                  src={metric.iconUrl}
                  alt={`${metric.label} icon`}
                  className="h-10 w-10 object-contain rounded border border-gray-200"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600 mt-4">
        Add a metric only after completing the current one (label and value).
      </div>
    </div>
  );
};
