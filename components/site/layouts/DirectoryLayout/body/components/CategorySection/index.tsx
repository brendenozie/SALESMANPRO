import React from 'react'
import {
  PencilIcon,
  ChartBarIcon,
  BoltIcon,
  CurrencyDollarIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline'

const categories = [
  { name: 'Design', Icon: PencilIcon },
  { name: 'Analyst', Icon: ChartBarIcon },
  { name: 'Electrician', Icon: BoltIcon },
  { name: 'Finance', Icon: CurrencyDollarIcon },
  { name: 'Technology', Icon: CodeBracketIcon },
  { name: 'Engineering', Icon: Cog6ToothIcon },
  { name: 'Marketing', Icon: MegaphoneIcon },
  { name: 'Programmer', Icon: ComputerDesktopIcon },
]

export default function CategorySection() {
  return (
    <section className="container mx-auto px-6 py-12">
      <h2 className="text-3xl font-semibold mb-8">
        Explore by <span className="text-blue-500">category</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map(({ name, Icon }) => (
          <div
            key={name}
            className="flex items-center space-x-4 border border-gray-200 rounded-lg p-5 hover:shadow-lg transition"
          >
            <Icon className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="font-medium">{name}</h3>
              <p className="text-sm text-gray-500">235 Jobs Available</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
