import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PencilIcon, TrashIcon, PlusCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid'; // For drag handle

import SubcategoryItem from './SubcategoryItem';
import { StoreCategory, Subcategory } from './CategoryManagerClient'; // Import types

interface CategoryCardProps {
  category: StoreCategory;
  onEditCategory: (category: StoreCategory) => void;
  onDeleteCategory: (id: string) => Promise<void>;
  onAddSubcategory: (parentId: string) => void;
  onEditSubcategory: (sub: Subcategory) => void;
  onDeleteSubcategory: (parentId: string, subId: string) => Promise<void>;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEditCategory,
  onDeleteCategory,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0px 8px 20px rgba(0, 0, 0, 0.2)' : '0px 2px 5px rgba(0, 0, 0, 0.05)',
  };

  const [isSubcategoriesOpen, setIsSubcategoriesOpen] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 transition-all duration-200 ease-in-out hover:shadow-lg"
    >
      {/* Category Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4 flex-grow">
          <button
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors duration-200"
            title="Drag to reorder category"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="text-4xl leading-none">{category.icon || '📦'}</span>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-900">{category.displayName}</h3>
            <p className="text-sm text-gray-500">
              {category.items.length} Subcategories
              <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-semibold ${category.visible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {category.visible ? 'Visible' : 'Hidden'}
              </span>
            </p>
          </div>
        </div>

        {/* Category Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEditCategory(category)}
            className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200"
            title="Edit Category"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors duration-200"
            title="Delete Category"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onAddSubcategory(category.id)}
            className="p-2 rounded-full text-green-600 hover:bg-green-50 hover:text-green-800 transition-colors duration-200"
            title="Add Subcategory"
          >
            <PlusCircleIcon className="h-5 w-5" />
          </button>
          {category.items.length > 0 && (
            <button
              onClick={() => setIsSubcategoriesOpen(!isSubcategoriesOpen)}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              title={isSubcategoriesOpen ? 'Collapse Subcategories' : 'Expand Subcategories'}
            >
              {isSubcategoriesOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Subcategories List (Collapsible) */}
      {category.items.length > 0 && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSubcategoriesOpen ? 'max-h-screen opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <h4 className="text-md font-semibold text-gray-700 mb-3 ml-12 border-b border-gray-100 pb-2">Subcategories:</h4>
          <ul className="ml-12 space-y-2">
            {category.items.sort((a, b) => a.sortOrder - b.sortOrder).map(sub => (
              <SubcategoryItem
                key={sub.id}
                subcategory={sub}
                onEditSubcategory={onEditSubcategory}
                onDeleteSubcategory={() => onDeleteSubcategory(category.id, sub.id)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
