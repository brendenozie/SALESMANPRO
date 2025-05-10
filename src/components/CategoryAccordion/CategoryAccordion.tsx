import React, { useState, useMemo } from 'react';


interface Category {
  id: string | number;
  name: string;
}

interface BasicForm {
  storeCategories?: Category[];
}

interface CategoryAccordionProps {
  availableCategories: Category[];
  form: BasicForm;
  handleCategoryToggle: (category: Category) => void;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({ availableCategories, form, handleCategoryToggle }) => {
  const [search, setSearch] = useState('');

  // Filter categories based on search
  const filtered = useMemo(
    () => availableCategories.filter(cat => cat.name.toLowerCase().includes(search.toLowerCase())),
    [search, availableCategories]
  );

  const selectedCount = form.storeCategories?.length || 0;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Select your Product Categories</h2>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {filtered.map(cat => {
          const isSelected = form.storeCategories?.some(c => c.id === cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryToggle(cat)}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full border transition-all duration-200 focus:outline-none
                ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
            >
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="mt-4 text-center text-gray-500">No categories match "{search}".</p>
      )}
    </div>
  );
};

export default CategoryAccordion;
