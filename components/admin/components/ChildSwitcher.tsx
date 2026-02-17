'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

interface Child {
  id: string;
  name: string;
  avatar?: string;
  gradeLevel: string;
}

interface ChildSwitcherProps {
  childrenList: Child[];
  selectedChild: Child;
  onChildChange: (child: Child) => void;
}

export default function ChildSwitcher({ childrenList, selectedChild, onChildChange }: ChildSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (child: Child) => {
    onChildChange(child);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-[240px] relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full cursor-pointer rounded-2xl bg-white py-3 pl-4 pr-10 text-left border border-slate-200 shadow-sm hover:border-indigo-300 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
      >
        <span className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex-shrink-0 overflow-hidden relative">
            {selectedChild.avatar ? (
              <Image 
                src={selectedChild.avatar} 
                alt={selectedChild.name} 
                fill 
                className="object-cover"
              />
            ) : (
              <span className="flex items-center justify-center h-full w-full text-indigo-600 font-bold text-xs">
                {selectedChild.name.charAt(0)}
              </span>
            )}
          </div>
          <span className="block truncate font-bold text-slate-900">
            {selectedChild.name}
          </span>
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white py-2 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-100">
          <ul className="divide-y divide-slate-50">
            {childrenList.map((child) => {
              const isSelected = child.id === selectedChild.id;
              return (
                <li
                  key={child.id}
                  onClick={() => handleSelect(child)}
                  className={`relative cursor-pointer select-none py-3 pl-10 pr-4 transition-colors hover:bg-indigo-50 ${
                    isSelected ? 'text-indigo-900 bg-indigo-50/50' : 'text-slate-900'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`block truncate ${isSelected ? 'font-bold' : 'font-medium'}`}>
                      {child.name}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      {child.gradeLevel}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}