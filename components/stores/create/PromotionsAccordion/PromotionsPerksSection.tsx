"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  StarIcon,
  GiftIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UsersIcon,
  GlobeAltIcon,
  TagIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  DevicePhoneMobileIcon,
  CubeIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  CloudIcon,
} from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { IPromotion } from "@/types/typings";

// --- Icon Map (extend as needed) ---
type HeroIconComponent = React.ComponentType<{ className?: string }>;

const heroicons: { [key: string]: HeroIconComponent } = {
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  StarIcon,
  GiftIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UsersIcon,
  GlobeAltIcon,
  TagIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  DevicePhoneMobileIcon,
  CubeIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  CloudIcon,
};

// --- Modal Picker Component ---
const IconPickerModal = ({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (iconName: string) => void; }) => {
  const [search, setSearch] = useState("");

  const icons = useMemo(() => {
    return Object.entries(heroicons).filter(([name]) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full p-6 overflow-y-auto max-h-[80vh]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choose an Icon
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search icons..."
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {icons.map(([name, Icon]) => (
                <button
                  key={name}
                  onClick={() => {
                    onSelect(name);
                    onClose();
                  }}
                  className="flex flex-col items-center p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
                >
                  <Icon className="h-6 w-6 text-indigo-600 mb-1" />
                  <span className="text-xs truncate text-gray-700 dark:text-gray-300">
                    {name.replace("Icon", "")}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Utility to render Heroicons dynamically ---
const getHeroIconComponent = (name: string, className = "h-6 w-6 text-indigo-500") => {
  const Icon = heroicons[name];
  return Icon ? <Icon className={className} /> : <SparklesIcon className={className} />;
};

// --- Main Section ---
export const PerksAndTrustSection = ({
  promo,
  idx,
  onAddPerk,
  onRemovePerk,
  onUpdatePerk,
  onAddTrustLogo,
  onRemoveTrustLogo,
  onUpdateTrustLogo,
}: {
  promo: IPromotion;
  idx: number;
  onAddPerk: (index: number) => void;
  onRemovePerk: (index: number, perkIndex: number) => void;
  onUpdatePerk: (index: number, perkIndex: number, field: 'id' | 'icon' | 'label', value: string) => void;
  onAddTrustLogo: (index: number) => void;
  onRemoveTrustLogo: (index: number, logoIndex: number) => void;
  onUpdateTrustLogo: (index: number, logoIndex: number, field: 'id' | 'url', value: string) => void;
}) => {
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [activePerkIndex, setActivePerkIndex] = useState<number | null>(null);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* --- Perks --- */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Perks</h3>
        <div className="space-y-3">
          {(promo.perks || []).map((perk, pIdx) => (
            <motion.div
              key={perk.id || pIdx}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => {
                  setActivePerkIndex(pIdx);
                  setIconModalOpen(true);
                }}
                className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
                title="Choose Icon"
              >
                {getHeroIconComponent(perk.icon, "h-5 w-5 text-indigo-600")}
              </button>

              <input
                value={perk.label}
                onChange={(e) => onUpdatePerk(idx, pIdx, "label", e.target.value)}
                placeholder="e.g., Free Shipping"
                className="flex-1 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />

              <button
                onClick={() => onRemovePerk(idx, pIdx)}
                className="text-red-500 hover:text-red-600 p-1"
                title="Remove"
              >
                ✕
              </button>
            </motion.div>
          ))}
          <button
            onClick={() => onAddPerk(idx)}
            className="w-full text-indigo-600 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 py-2 rounded-md transition"
          >
            + Add Perk
          </button>
        </div>
      </div>

      {/* --- Trust Logos --- */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Trust Logos</h3>
        <div className="space-y-3">
          {(promo.trustLogos || []).map((logo, lIdx) => (
            <motion.div
              key={logo.id || lIdx}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <input
                value={logo.url}
                onChange={(e) => onUpdateTrustLogo(idx, lIdx, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {logo.url && (
                <img
                  src={logo.url}
                  alt="Trust Logo"
                  className="h-8 w-8 rounded-md object-contain"
                />
              )}
              <button
                onClick={() => onRemoveTrustLogo(idx, lIdx)}
                className="text-red-500 hover:text-red-600 p-1"
                title="Remove"
              >
                ✕
              </button>
            </motion.div>
          ))}
          <button
            onClick={() => onAddTrustLogo(idx)}
            className="w-full text-indigo-600 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 py-2 rounded-md transition"
          >
            + Add Logo
          </button>
        </div>
      </div>

      {/* --- Icon Modal --- */}
      <IconPickerModal
        open={iconModalOpen}
        onClose={() => setIconModalOpen(false)}
        onSelect={(iconName) => {
          if (activePerkIndex !== null) {
            onUpdatePerk(idx, activePerkIndex, "icon", iconName);
            setActivePerkIndex(null);
          }
        }}
      />
    </div>
  );
};
