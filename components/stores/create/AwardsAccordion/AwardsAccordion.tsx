import React, { useEffect, useState } from 'react';
import { Award } from '../../../../types/typings';
import { TrophyIcon, PlusCircleIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface Props {
  awards: Award[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Award, value: any) => void;
  onRemove: (index: number) => void;
}

const isFilled = (award: Award) => award.name.trim() && award.iconUrl.trim();

export const AwardsAccordion: React.FC<Props> = ({ awards, onAdd, onUpdate, onRemove }) => {
  const [open, setOpen] = useState(true);
  const canAdd = awards.length === 0 || isFilled(awards[awards.length - 1]);

  useEffect(() => { if (!awards.length) onAdd(); }, [awards, onAdd]);

  return (
    <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-300 text-white"
      >
        <div className="flex items-center space-x-3">
          <TrophyIcon className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Awards</h3>
        </div>
        <span className="flex items-center">
          {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </span>
      </button>

      {/* Content */}
      {open && (
        <div className="px-6 py-8 space-y-6">
          {/* Awards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {awards.map((award, idx) => (
              <div key={idx} className="bg-yellow-50 rounded-lg border border-yellow-200 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-yellow-800">Award {idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="text-red-500 hover:text-red-600 focus:outline-none"
                    aria-label="Remove award"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Best Seller 2023"
                    value={award.name}
                    onChange={e => onUpdate(idx, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
                  />

                  {/* Icon URL */}
                  <label className="block text-sm font-medium text-gray-700">Icon URL</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="https://cdn.example.com/icon.png"
                      value={award.iconUrl}
                      onChange={e => onUpdate(idx, 'iconUrl', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
                    />
                    {award.iconUrl && (
                      <img src={award.iconUrl} alt="icon preview" className="h-12 w-12 object-contain rounded" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onAdd}
              disabled={!canAdd}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>Add Award</span>
            </button>
            <span className="text-sm text-gray-600 italic">
            🏆 Tip: Add icons from a CDN like <code className="bg-gray-100 px-1 rounded">https://img.icons8.com</code> to visually represent awards.
            </span>
          </div>
        </div>
      )}
    </section>
  );
};