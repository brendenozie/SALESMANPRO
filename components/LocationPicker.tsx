// components/locations/LocationPicker.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  GlobeAltIcon,
  MapPinIcon,
  BuildingLibraryIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { ILocation } from '@/types/typings';

// --- Types (matching your Prisma Location model) ---
// export interface Location {
//   id: string;
//   name: string;
//   slug: string;
//   description?: string;
//   addressLine1?: string;
//   addressLine2?: string;
//   city?: string;
//   state?: string;
//   postalCode?: string;
//   country?: string;
//   latitude?: number;
//   longitude?: number;
//   seoTitle?: string;
//   seoDescription?: string;
//   metaKeywords: string[];
//   sortOrder: number;
//   visible: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
//   createdBy?: string;
//   updatedBy?: string;
//   status: 'active' | 'inactive' | 'draft';
//   parentId: string | null;
//   children?: Location[]; // For client-side tree building
//   localization?: any;
//   attributes?: any;
// }

// Type for the selected location in the form data
export interface SelectedLocationPath {
  id: string;
  name: string;
  path: { id: string; name: string; type: 'country' | 'city' | 'venue' | 'other' }[];
}

interface LocationPickerProps {
  // The currently selected location ID (from form data)
  selectedLocationId: string | null;
  // All available locations (flat list from API)
  availableLocations: ILocation[];
  // Callback when a location is selected/deselected
  onLocationSelect: (locationId: string | null, locationDetails?: ILocation | null) => void;
}

// --- Helper Functions ---

// Builds a hierarchical tree from a flat list of locations
const buildLocationTree = (locations: ILocation[] = []): ILocation[] => {
  if (!Array.isArray(locations)) {
    console.error("Expected locations to be an array:", locations);
    return [];
  }

  const locationMap: Record<string, ILocation> = {};
  const tree: ILocation[] = [];

  locations.forEach((location) => {
    locationMap[location.id] = {
      ...location,
      children: [],
    };
  });

  locations.forEach((location) => {
    if (location.parentId && locationMap[location.parentId]) {
      locationMap[location.parentId].children?.push(
        locationMap[location.id]
      );

      locationMap[location.parentId].children?.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    } else {
      tree.push(locationMap[location.id]);
    }
  });

  tree.sort((a, b) => a.name.localeCompare(b.name));

  return tree;
};

// Finds a location by ID in a flat list
const findLocationById = (id: string, locations: ILocation[]): ILocation | undefined => {
  return locations.find(loc => loc.id === id);
};

// Builds the path from root to a specific location
const buildPathToLocation = (
  locationId: string,
  allLocations: ILocation[]
): { id: string; name: string; type: 'country' | 'city' | 'venue' | 'other' }[] => {
  const path: { id: string; name: string; type: 'country' | 'city' | 'venue' | 'other' }[] = [];
  let currentLoc = findLocationById(locationId, allLocations);

  while (currentLoc) {
    let type: 'country' | 'city' | 'venue' | 'other' = 'other';
    if (!currentLoc.parentId && currentLoc.country) type = 'country';
    else if (currentLoc.city) type = 'city';
    else if (currentLoc.addressLine1) type = 'venue';

    path.unshift({ id: currentLoc.id, name: currentLoc.name, type });
    currentLoc = currentLoc.parentId ? findLocationById(currentLoc.parentId, allLocations) : undefined;
  }
  return path;
};

// --- Pill Component for Selected Path ---
const PathPill: React.FC<{
  label: string;
  type: 'country' | 'city' | 'venue' | 'other';
  onClear?: () => void; // Optional for the last pill
}> = ({ label, type, onClear }) => {
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-800';
  let icon = <MapPinIcon className="h-4 w-4 mr-1" />;

  switch (type) {
    case 'country':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = <GlobeAltIcon className="h-4 w-4 mr-1" />;
      break;
    case 'city':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = <MapPinIcon className="h-4 w-4 mr-1" />;
      break;
    case 'venue':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      icon = <BuildingLibraryIcon className="h-4 w-4 mr-1" />;
      break;
    default:
      // default is fine
      break;
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor} shadow-sm`}>
      {icon}
      {label}
      {onClear && (
        <button onClick={onClear} className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-opacity-75 transition-opacity" aria-label="Clear selection">
          <XMarkIcon className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

// --- LocationNode Component (for recursive tree rendering) ---
interface LocationNodeProps {
  node: ILocation;
  level: number;
  selectedLocationId: string | null;
  onLocationSelect: (locationId: string, locationDetails: ILocation) => void;
  isInitiallyExpanded: boolean;
  filterTerm: string;
}

const LocationNode: React.FC<LocationNodeProps> = ({
  node,
  level,
  selectedLocationId,
  onLocationSelect,
  isInitiallyExpanded,
  filterTerm,
}) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const isSelected = selectedLocationId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  useEffect(() => {
    // If filter term changes and this node matches, expand it
    if (filterTerm && (
      node.name.toLowerCase().includes(filterTerm) ||
      node.city?.toLowerCase().includes(filterTerm) ||
      node.country?.toLowerCase().includes(filterTerm)
    )) {
      setIsExpanded(true);
    } else if (!filterTerm && !isInitiallyExpanded) {
      // Collapse if filter is cleared and it wasn't initially expanded
      setIsExpanded(false);
    }
  }, [filterTerm, isInitiallyExpanded, node.name, node.city, node.country]);


  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent accordion from toggling
    onLocationSelect(node.id, node);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getIcon = (lvl: number) => {
    if (lvl === 0) return <GlobeAltIcon className='w-5 h-5 text-blue-500' />; // Continent/Country
    if (lvl === 1) return <MapPinIcon className="w-5 h-5 text-green-500" />; // State/City
    return <BuildingLibraryIcon className="w-5 h-5 text-purple-500" />; // Specific building/venue
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div
        className={`flex items-center py-3 px-4 transition-colors duration-150 cursor-pointer
          ${isSelected ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50'}
          ${level > 0 ? 'pl-8' : ''}`} // Base padding for level 0
        style={{ paddingLeft: `${16 + level * 24}px` }} // Dynamic indentation
      >
        {hasChildren ? (
          <button onClick={toggleExpand} className="mr-2 p-1 rounded-full hover:bg-gray-200">
            {isExpanded ? <ChevronDownIcon className="h-5 w-5 text-gray-500" /> : <ChevronRightIcon className="h-5 w-5 text-gray-500" />}
          </button>
        ) : (
          <span className="w-7 h-5 mr-2"></span> // Placeholder for alignment
        )}

        {getIcon(level)}
        <span className={`ml-2 font-medium ${isSelected ? 'text-indigo-800' : 'text-gray-800'}`}>
          {node.name}
          {node.city && <span className="text-sm text-gray-500 ml-2">({node.city})</span>}
        </span>

        <button
          onClick={handleSelect}
          className={`ml-auto px-3 py-1 rounded-md text-sm font-semibold transition-colors
            ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
          {isSelected ? <CheckCircleIcon className="h-5 w-5 inline-block mr-1" /> : ''}
          {isSelected ? 'Selected' : 'Select'}
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-4">
          {node.children?.map(child => (
            <LocationNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedLocationId={selectedLocationId}
              onLocationSelect={onLocationSelect}
              isInitiallyExpanded={isInitiallyExpanded}
              filterTerm={filterTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};


// --- Main LocationPicker Component ---
const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedLocationId,
  availableLocations,
  onLocationSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const locationListRef = useRef<HTMLDivElement>(null);

  // Memoize the location tree for efficiency
  const locationTree = useMemo(() => buildLocationTree(availableLocations), [availableLocations]);

  // Derive the path for the currently selected location
  const selectedLocationPath = useMemo(() => {
    if (!selectedLocationId) return [];
    return buildPathToLocation(selectedLocationId, availableLocations);
  }, [selectedLocationId, availableLocations]);

  // Filter the tree based on search term
  const filteredTree = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return locationTree;

    const filterNodes = (nodes: ILocation[]): ILocation[] => {
      return nodes.reduce((acc: ILocation[], node) => {
        const matches =
          node.name.toLowerCase().includes(q) ||
          node.city?.toLowerCase().includes(q) ||
          node.country?.toLowerCase().includes(q) ||
          node.slug.toLowerCase().includes(q);

        const filteredChildren = node.children ? filterNodes(node.children) : [];

        if (matches || filteredChildren.length > 0) {
          // If a parent matches or has matching children, include it and its filtered children
          acc.push({ ...node, children: filteredChildren });
        }
        return acc;
      }, []);
    };
    return filterNodes(locationTree);
  }, [searchTerm, locationTree]);


  const handleClearSelection = () => {
    onLocationSelect(null); // Clear the selected location
  };

  return (
    <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100">
      {/* Header & Step Indicator */}
      <div className="pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <MapPinIcon className="h-6 w-6 mr-2 text-indigo-600" /> Select Product Location
        </h2>
        <p className="text-sm text-gray-500 mt-1">Choose the most specific location for your listing.</p>
      </div>

      {/* Selected Location Pills */}
      {selectedLocationPath.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 shadow-inner">
          <span className="text-sm font-medium text-blue-800 mr-1">Selected:</span>
          {selectedLocationPath.map((pathItem, index) => (
            <React.Fragment key={pathItem.id}>
              <PathPill
                label={pathItem.name}
                type={pathItem.type}
                onClear={index === selectedLocationPath.length - 1 ? handleClearSelection : undefined} // Only last pill clears
              />
              {index < selectedLocationPath.length - 1 && (
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for a location (e.g., Nairobi, Kenya, Westlands)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Location List */}
      <div ref={locationListRef} className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 shadow-inner">
        {filteredTree.length === 0 ? (
          <div className="text-center py-8 text-gray-500 italic">No locations found matching your search.</div>
        ) : (
          filteredTree.map(node => (
            <LocationNode
              key={node.id}
              node={node}
              level={0}
              selectedLocationId={selectedLocationId}
              onLocationSelect={onLocationSelect}
              isInitiallyExpanded={!!searchTerm} // Expand all if searching
              filterTerm={searchTerm}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
