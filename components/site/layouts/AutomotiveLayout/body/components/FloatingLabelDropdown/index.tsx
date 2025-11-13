// components/FloatingLabelDropdown.tsx

"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useClickOutside } from "@/lib/hooks/useClickOutside";

// interface Option {
//   id: string;
//   name: string;
// }

interface FloatingLabelDropdownProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  options: any[] | undefined;
  selectedValue: any | null;
  onSelect: (value: any | null) => void;
  className?: string;
}

export default function FloatingLabelDropdown({ id, label, icon, options, selectedValue, onSelect, className }: FloatingLabelDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const hasValue = selectedValue !== null;

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef} >
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="peer w-full text-left rounded-lg bg-white/10 px-4 pt-6 pb-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-between"
      >
        <span className={!hasValue ? "text-transparent" : "text-white"}>
          {selectedValue?.name || "Placeholder"}
        </span>
        <ChevronDownIcon className={`h-5 w-5 text-gray-300 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-300 pointer-events-none flex items-center gap-2
          ${hasValue || isOpen
            ? 'top-2 text-xs text-blue-300'
            : 'top-1/2 -translate-y-1/2 text-base text-gray-300'
          }`
        }
      >
        {icon}
        {label}
      </label>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden z-20"
          >
            {options?.map((option) => (
              <li
                key={option.id}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className="px-4 py-3 text-white hover:bg-blue-600 cursor-pointer transition-colors"
              >
                {option.name || option.displayName}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}