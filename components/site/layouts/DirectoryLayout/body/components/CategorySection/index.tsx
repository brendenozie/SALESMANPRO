'use client';

import React from 'react';
import {
  PencilIcon,
  ChartBarIcon,
  BoltIcon,
  CurrencyDollarIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

const categories = [
  { name: 'Design', Icon: PencilIcon },
  { name: 'Analyst', Icon: ChartBarIcon },
  { name: 'Electrician', Icon: BoltIcon },
  { name: 'Finance', Icon: CurrencyDollarIcon },
  { name: 'Technology', Icon: CodeBracketIcon },
  { name: 'Engineering', Icon: Cog6ToothIcon },
  { name: 'Marketing', Icon: MegaphoneIcon },
  { name: 'Programmer', Icon: ComputerDesktopIcon },
];

export default function CategorySection() {
  return (
    <section className="container mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Explore by <span className="text-blue-600">Category</span>
        </h2>
        <p className="mt-2 text-gray-500 text-lg">
          Browse jobs by industry specialization
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {categories.map(({ name, Icon }) => (
          <div
            key={name}
            className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{name}</h3>
                <p className="text-sm text-gray-500">235 Jobs Available</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
