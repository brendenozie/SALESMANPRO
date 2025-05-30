'use client';

import React, { useEffect } from 'react';
import { Stat } from '../../../../types/typings';
import { TrashIcon, PlusIcon, ClipboardIcon } from '@heroicons/react/24/outline';

interface Props {
  stats: Stat[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Stat, value: any) => void;
  onRemove: (index: number) => void;
}

export const StatsAccordion: React.FC<Props> = ({ stats, onAdd, onUpdate, onRemove }) => {
  // Ensure there's at least one form ready on initial render
  useEffect(() => {
    if (stats.length === 0) {
      onAdd();
    }
  }, [stats, onAdd]);

  // Disable "Add" unless all stats are filled (label and value)
  const canAddNew = stats.every(stat => stat.label.trim() && stat.value.toString().trim());

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-800">
          <ClipboardIcon className="h-6 w-6 text-emerald-500" />
          Stats
        </h2>
        <button
          type="button"
          onClick={onAdd}
          disabled={!canAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Stat
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="relative p-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition"
          >
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              title="Remove stat"
              disabled={stats.length === 1} // Prevent removing last one
            >
              <TrashIcon className="h-5 w-5" />
            </button>

            {/* Label */}
            <div className="mb-4">
              <label htmlFor={`label-${i}`} className="block text-sm font-medium text-gray-700">
                Label
              </label>
              <input
                id={`label-${i}`}
                type="text"
                placeholder="e.g. Founded"
                value={stat.label}
                onChange={(e) => onUpdate(i, 'label', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {/* Value */}
            <div className="mb-4">
              <label htmlFor={`value-${i}`} className="block text-sm font-medium text-gray-700">
                Value
              </label>
              <input
                id={`value-${i}`}
                type="text"
                placeholder="e.g. 2019"
                value={stat.value as string}
                onChange={(e) => onUpdate(i, 'value', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {/* Icon URL */}
            <div className="mb-4">
              <label htmlFor={`icon-${i}`} className="block text-sm font-medium text-gray-700">
                Icon URL
              </label>
              <input
                id={`icon-${i}`}
                type="text"
                placeholder="https://..."
                value={stat.iconUrl ?? ''}
                onChange={(e) => onUpdate(i, 'iconUrl', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {/* Preview */}
            {stat.iconUrl && (
              <div className="mt-2">
                <img
                  src={stat.iconUrl}
                  alt={`${stat.label} icon`}
                  className="h-10 w-10 object-contain rounded border border-gray-200"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Helper Text */}
      <div className="text-sm text-gray-600 mt-4">
        Start by entering at least one stat. You can only add another once all existing fields are filled.
      </div>
    </div>
  );
};
