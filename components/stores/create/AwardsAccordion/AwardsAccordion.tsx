'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  PlusCircleIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Award } from '../../../../types/typings';

interface Props {
  awards: Award[] | null;
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Award, value: any) => void;
  onRemove: (index: number) => void;
}

const ICON_OPTIONS = [
  { name: 'Gold Trophy', url: 'https://img.icons8.com/color/96/000000/trophy.png' },
  { name: 'Medal', url: 'https://img.icons8.com/color/96/medal.png' },
  { name: 'Crown', url: 'https://img.icons8.com/color/96/000000/crown.png' },
  { name: 'Star Badge', url: 'https://img.icons8.com/color/96/000000/filled-star.png' },
  { name: 'Diamond', url: 'https://img.icons8.com/color/96/000000/diamond.png' },
  { name: 'Certificate', url: 'https://img.icons8.com/color/96/certificate.png' },
  { name: 'Trophy Cup', url: 'https://img.icons8.com/color/96/000000/prize.png' },
  { name: 'Achievement', url: 'https://img.icons8.com/color/96/trophy--v1.png' },
];

const isFilled = (award: Award) => award.name.trim() && award.iconUrl.trim();

export const AwardsAccordion: React.FC<Props> = ({
  awards,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [open, setOpen] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const canAdd =
    awards?.length === 0 || (awards && isFilled(awards[awards.length - 1]));

  useEffect(() => {
    if (!awards?.length) onAdd();
  }, [awards, onAdd]);

  const filteredIcons = ICON_OPTIONS.filter((icon) =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-4 sm:px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-300 text-white focus:outline-none"
        aria-expanded={open}
      >
        <div className="flex items-center space-x-3">
          <TrophyIcon className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Awards</h3>
        </div>
        {open ? (
          <ChevronUpIcon className="h-5 w-5" />
        ) : (
          <ChevronDownIcon className="h-5 w-5" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="px-4 sm:px-6 py-6 space-y-6"
          >
            {/* Empty State */}
            {(!awards || awards.length === 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg py-8"
              >
                <TrophyIcon className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
                <p className="font-medium">No awards yet!</p>
                <p className="text-sm mb-3">
                  Start by adding your first recognition or achievement.
                </p>
                <button
                  onClick={onAdd}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                  <span>Add Award</span>
                </button>
              </motion.div>
            )}

            {/* Awards Grid */}
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {awards &&
                awards.map((award, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="relative bg-yellow-50 rounded-xl border border-yellow-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition"
                  >
                    <TrophyIcon className="absolute top-2 right-2 h-10 w-10 text-yellow-300 opacity-10" />

                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-yellow-800">
                        Award {idx + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemove(idx)}
                        aria-label="Remove award"
                        className="text-red-500 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-300 rounded-md p-1"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Award Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Best Seller 2023"
                          value={award.name}
                          onChange={(e) =>
                            onUpdate(idx, 'name', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition"
                        />
                        {!award.name && (
                          <p className="text-xs text-red-500 mt-1">
                            Please enter an award name
                          </p>
                        )}
                      </div>

                      {/* Icon Selector (Modal Trigger) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Award Icon
                        </label>
                        <button
                          onClick={() => setSelectedIndex(idx)}
                          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
                        >
                          <span>
                            {award.iconUrl
                              ? ICON_OPTIONS.find(
                                  (icon) => icon.url === award.iconUrl
                                )?.name || 'Custom Icon'
                              : 'Select an Icon'}
                          </span>
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        </button>
                        {award.iconUrl && (
                          <img
                            src={award.iconUrl}
                            alt="icon preview"
                            className="h-12 w-12 mt-3 rounded object-contain"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

              {/* Add New */}
              {awards && (
                <div
                  onClick={canAdd ? onAdd : undefined}
                  className={`flex flex-col justify-center items-center border-2 border-dashed border-yellow-300 rounded-lg p-8 cursor-pointer hover:bg-yellow-50 transition ${
                    !canAdd && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <PlusCircleIcon className="h-8 w-8 text-yellow-500" />
                  <span className="mt-2 text-yellow-700 font-medium">
                    Add New Award
                  </span>
                </div>
              )}
            </motion.div>

            {/* Tip */}
            <div className="text-sm text-gray-600 italic text-center sm:text-left">
              🏆 Tip: Choose a fun icon or upload a custom one to personalize awards.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Select an Award Icon
                </h4>
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* Icons Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto">
                {filteredIcons.map((icon) => (
                  <div
                    key={icon.url}
                    onClick={() => {
                      onUpdate(selectedIndex!, 'iconUrl', icon.url);
                      setSelectedIndex(null);
                      setSearch('');
                    }}
                    className="flex flex-col items-center p-3 border rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition cursor-pointer"
                  >
                    <img
                      src={icon.url}
                      alt={icon.name}
                      className="h-16 w-16 object-contain"
                    />
                    <p className="text-sm text-gray-600 mt-2 text-center truncate">
                      {icon.name}
                    </p>
                  </div>
                ))}
              </div>

              {filteredIcons.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No icons found for “{search}”.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
