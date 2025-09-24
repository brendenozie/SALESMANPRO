import { useReducer, useMemo } from 'react';
import { IProductCategory, IStoreCategory, ISubcategory } from '@/types/typings'; // Adjust path
import { STORE_CATEGORY_MAP } from "@/constant/STORE_CATEGORY_MAP"; // Adjust path

// ✅ STEP 1: DEFINE REDUCER TYPES, STATE, AND ACTIONS
// ==========================================================

// State is an object map for O(1) lookups: { [categoryId]: IStoreCategory }
type SelectedState = Record<string, IStoreCategory>;

// Define all possible actions for type safety
export type CategoryAction =
  | { type: 'TOGGLE_PARENT'; payload: { parent: IProductCategory } }
  | { type: 'TOGGLE_SUB'; payload: { parentId: string; subcategory: ISubcategory; parentData: IProductCategory } }
  | { type: 'TOGGLE_BRAND'; payload: { parentId: string; brand: string; parentData: IProductCategory } }
  | { type: 'BULK_UPDATE'; payload: { ids: Set<string>; availableForContext: IProductCategory[] } };

// Helper to create a new, empty parent entry in the selection state
const createEmptyParent = (parentData: IProductCategory): IStoreCategory => ({
    id: "", // This would be the DB record ID, empty for new selections
    categoryId: parentData.id,
    displayName: parentData.name,
    icon: parentData.icon,
    subcategories: [],
    allBrands: [],
    sortOrder: 0,
    visible: false,
});

// ✅ STEP 2: CREATE THE REDUCER FUNCTION
// ======================================

export function categoryReducer(state: SelectedState, action: CategoryAction): SelectedState {
  // Always work with a mutable copy within the reducer
  const newState = { ...state };

  switch (action.type) {
    case 'TOGGLE_PARENT': {
      const { parent } = action.payload;
      if (newState[parent.id]) {
        // Parent exists, so remove it (deselect)
        delete newState[parent.id];
      } else {
        // Parent doesn't exist, so add it fully selected
        newState[parent.id] = {
          ...createEmptyParent(parent),
          subcategories: [...parent.subcategories || []],
          allBrands: [...(parent.allBrands || [])],
        };
      }
      return newState;
    }

    case 'TOGGLE_SUB': {
        const { parentId, subcategory, parentData } = action.payload;

        // Resolve a unique ID for the subcategory (consistent with your old logic)
        const subId = subcategory.id || subcategory._id?.$oid || subcategory.tempId;
        if (!subId) {
          console.warn("Subcategory missing unique identifier", subcategory);
          return newState;
        }

        // Clone or create parent entry
        let parentEntry = newState[parentId] 
          ? { ...newState[parentId] } 
          : createEmptyParent(parentData);

        const isSelected = parentEntry.subcategories.some(s => s.id === subId);

        if (isSelected) {
          parentEntry.subcategories = parentEntry.subcategories.filter(s => s.id !== subId);
        } else {
          parentEntry.subcategories = [
            ...parentEntry.subcategories,
            {
              id: subId,
              name: subcategory.name,
              slug: subcategory.slug,
              tempId: subcategory.tempId
            }
          ];
        }

        // Remove parent entry if it's empty
        if (parentEntry.subcategories.length === 0 && (parentEntry.allBrands?.length || 0) === 0) {
          delete newState[parentId];
        } else {
          newState[parentId] = parentEntry;
        }

        return newState;
      }

    // case 'TOGGLE_SUB': {
    //   const { parentId, subcategory, parentData } = action.payload;
    //   // Get existing parent or create a new one if it's the first selection
    //   let parentEntry = newState[parentId] ? { ...newState[parentId] } : createEmptyParent(parentData);
      
    //   const isSelected = parentEntry.subcategories.some(s => s.id === subcategory.id);
      
    //   if (isSelected) {
    //     parentEntry.subcategories = parentEntry.subcategories.filter(s => s.id !== subcategory.id);
    //   } else {
    //     parentEntry.subcategories = [...parentEntry.subcategories, subcategory];
    //   }

    //   // If the parent entry becomes empty, remove it from the state object
    //   if (parentEntry.subcategories.length === 0 && (parentEntry.allBrands?.length || 0) === 0) {
    //     delete newState[parentId];
    //   } else {
    //     newState[parentId] = parentEntry;
    //   }
    //   return newState;
    // }

    case 'TOGGLE_BRAND': {
        const { parentId, brand, parentData } = action.payload;
        let parentEntry = newState[parentId] ? { ...newState[parentId] } : createEmptyParent(parentData);
        parentEntry.allBrands = parentEntry.allBrands || [];

        const isSelected = parentEntry.allBrands.includes(brand);

        if (isSelected) {
            parentEntry.allBrands = parentEntry.allBrands.filter(b => b !== brand);
        } else {
            parentEntry.allBrands = [...parentEntry.allBrands, brand];
        }

        if (parentEntry.subcategories.length === 0 && parentEntry.allBrands.length === 0) {
            delete newState[parentId];
        } else {
            newState[parentId] = parentEntry;
        }
        return newState;
    }
    
    case 'BULK_UPDATE': {
        const { ids, availableForContext } = action.payload;
        // First, create a set of category IDs relevant to the current context/tab
        const contextIds = new Set(availableForContext.map(c => c.id));

        // Filter out selections that are NOT in the current context
        const unrelatedSelections: SelectedState = {};
        for (const key in state) {
            if (!contextIds.has(key)) {
                unrelatedSelections[key] = state[key];
            }
        }
        
        // Build the new selections for the current context
        const newContextSelections: SelectedState = {};
        for (const parent of availableForContext) {
            const matchedSubs = parent.subcategories?.filter(sub => ids.has(sub.id));
            const matchedBrands = (parent.allBrands || []).filter(brand => ids.has(brand));

            if (matchedSubs && matchedSubs?.length > 0 || matchedBrands.length > 0) {
                newContextSelections[parent.id] = {
                    ...createEmptyParent(parent),
                    subcategories: matchedSubs || [],
                    allBrands: matchedBrands,
                };
            }
        }
        
        // Combine the unrelated selections with the new context selections
        return { ...unrelatedSelections, ...newContextSelections };
    }

    default:
      return state;
  }
}

// ✅ STEP 3: HOOK IT INTO YOUR COMPONENT
// ======================================

/*
In your main parent component body:

// Assume `availableCategories` is your full list from props/API.
// Assume `form.StoreCategory` is your initial raw selected data.

// 1. Initializer function runs ONLY ONCE to set up the reducer's initial state.
// It normalizes the raw array from the form into our efficient object map.
const initializer = (rawSelected: IStoreCategory[]): SelectedState => {
    const initialState: SelectedState = {};
    for (const selection of rawSelected) {
        const catId = selection.categoryId;
        if (!catId) continue;

        // This handles potential duplicate categoryId entries from raw data by merging them.
        if (initialState[catId]) {
            const existing = initialState[catId];
            const subIds = new Set(existing.subcategories.map(s => s.id));
            selection.subcategories.forEach(sub => {
                if (!subIds.has(sub.id)) {
                    existing.subcategories.push(sub);
                }
            });
            const brandSet = new Set(existing.allBrands || []);
            (selection.allBrands || []).forEach(brand => {
                if (!brandSet.has(brand)) {
                    existing.allBrands.push(brand);
                }
            });
        } else {
            initialState[catId] = selection;
        }
    }
    return initialState;
};

// 2. Initialize the reducer.
const [selectedState, dispatch] = useReducer(categoryReducer, form.StoreCategory, initializer);

// 3. Create the memoized array of selected categories to pass to the child component and for form submission.
const selectedCategoriesArray = useMemo(() => Object.values(selectedState), [selectedState]);

// 4. Pass `availableCategories`, `selectedCategoriesArray`, and `dispatch` as props to CategoryTree.
//    When submitting your form, use `selectedCategoriesArray` as the value for `StoreCategory`.

<CategoryTree
    category={currentCategoryContext} // e.g., 'Groceries'
    availableCategories={availableCategories}
    selectedCategories={selectedCategoriesArray}
    dispatch={dispatch}
    onApply={() => {
        // Logic to update your main form state and close the modal/component
        setForm(prev => ({...prev, StoreCategory: selectedCategoriesArray}));
        // ... any other onApply logic
    }}
/>

*/