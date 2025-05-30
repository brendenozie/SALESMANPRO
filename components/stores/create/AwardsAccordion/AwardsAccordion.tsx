
import React, { useEffect } from 'react';
import { Award } from '../../../../types/typings';
import { ItemCard } from '@/components/ItemCard ';
import { TrophyIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Props {
  awards: Award[];
  onAdd: () => void;
  onUpdate: (i: number, field: keyof Award, v: any) => void;
  onRemove: (i: number) => void;
}

const isAwardFilled = (award: Award) => award.name.trim() !== '' && award.iconUrl.trim() !== '';

export const AwardsAccordion: React.FC<Props> = ({ awards, onAdd, onUpdate, onRemove }) => {
  const canAdd = awards.length === 0 || isAwardFilled(awards[awards.length - 1]);
  const isValid = awards.every(a => a.name.trim() && a.iconUrl.trim());
  
  // Ensure there's at least one form ready on initial render
    useEffect(() => {
      if (awards.length === 0) {
        onAdd();
      }
    }, [awards, onAdd]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-800">
          <TrophyIcon className="h-6 w-6 text-yellow-500" />
          Awards
        </h2>
        <button
          type="button"
          onClick={onAdd}
          disabled={!isValid && canAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Award
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {awards.map((award, i) => (
          <ItemCard key={i} onRemove={() => onRemove(i)}>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              className="w-full mt-1 border rounded p-2"
              placeholder="Award name"
              value={award.name}
              onChange={e => onUpdate(i, 'name', e.target.value)}
            />

            <label className="block text-sm font-medium mt-3">Icon URL</label>
            <input
              type="text"
              className="w-full mt-1 border rounded p-2"
              placeholder="https://…"
              value={award.iconUrl}
              onChange={e => onUpdate(i, 'iconUrl', e.target.value)}
            />

            {award.iconUrl && (
              <img
                src={award.iconUrl}
                alt="award icon"
                className="h-12 w-12 object-contain mt-3 rounded"
              />
            )}
          </ItemCard>
        ))}
      </div>
    </div>
  );
};