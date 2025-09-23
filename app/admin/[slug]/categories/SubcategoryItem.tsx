import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Subcategory } from './CategoryManagerClient'; // Import type
import { ISubcategory } from '@/types/typings';

interface SubcategoryItemProps {
  subcategory: ISubcategory;
  onEditSubcategory: (sub: ISubcategory) => void;
  onDeleteSubcategory: () => Promise<void>;
}

const SubcategoryItem: React.FC<SubcategoryItemProps> = ({ subcategory, onEditSubcategory, onDeleteSubcategory }) => {
  return (
    <li className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 transition-all duration-200 ease-in-out hover:bg-gray-100 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-gray-600 text-sm">{subcategory.name}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${subcategory.visible ? 'bg-indigo-100 text-indigo-800' : 'bg-red-100 text-red-800'}`}>
          {subcategory.visible ? 'Visible' : 'Hidden'}
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onEditSubcategory(subcategory)}
          className="p-1 rounded-full text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200"
          title="Edit Subcategory"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={onDeleteSubcategory}
          className="p-1 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
          title="Delete Subcategory"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
};

export default SubcategoryItem;
