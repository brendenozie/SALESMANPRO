"use client";

import React, { useState } from "react";
import { SECTION_REGISTRY, SectionType, RegistryComponentItem } from "@/types/website-builder";
import {
  XMarkIcon,
  SparklesIcon,
  Squares2X2Icon,
  ArrowTrendingUpIcon,
  FolderIcon,
  TagIcon,
  PhotoIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  MapPinIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

interface SectionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (sectionType: SectionType) => void;
}

const iconComponentMap: Record<string, React.ElementType> = {
  SparklesIcon,
  Squares2X2Icon,
  ArrowTrendingUpIcon,
  FolderIcon,
  TagIcon,
  PhotoIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  MapPinIcon,
  PaperAirplaneIcon,
};

const CATEGORIES = [
  { key: "all", label: "All Sections" },
  { key: "hero", label: "Hero & Banners" },
  { key: "commerce", label: "Commerce & Products" },
  { key: "content", label: "Content & Narrative" },
  { key: "social_proof", label: "Social Proof & Reviews" },
  { key: "contact", label: "Contact & Touchpoints" },
];

export default function SectionPickerModal({
  isOpen,
  onClose,
  onSelectSection,
}: SectionPickerModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (!isOpen) return null;

  const registryItems = Object.values(SECTION_REGISTRY);
  const filteredItems = selectedCategory === "all"
    ? registryItems
    : registryItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              Add a New Section
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Select a commerce-aware component to insert into your page.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 p-3 px-6 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/50 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
                selectedCategory === cat.key
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Component Catalog Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item: RegistryComponentItem) => {
            const Icon = iconComponentMap[item.icon] || SparklesIcon;
            return (
              <div
                key={item.type}
                onClick={() => {
                  onSelectSection(item.type);
                  onClose();
                }}
                className="group relative flex flex-col justify-between p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-rose-500 dark:hover:border-rose-500 hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer"
              >
                <div>
                  <div className="p-3 w-fit rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-rose-500">
                  <span>+ Insert Section</span>
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                    {item.category.replace("_", " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
