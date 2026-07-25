import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, 
  PlusIcon, 
  UserIcon, 
  PhoneIcon,
  ChevronDownIcon,
  XMarkIcon,
  EnvelopeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import LocationPicker from '@/components/LocationPicker';
import { CompanyAddress } from '@/types/typings';

// Updated to match the new Prisma CompanyAddress model
// export interface CompanyAddress {
//   id?: string;
//   companyId?: string;
//   isMain?: boolean;
//   address: string | null;
//   lat: number;
//   lng: number;
//   contactName?: string | null;
//   contactPhone?: string | null;
//   contactEmail?: string | null;
//   label?: string | null;
//   instructions?: string | null;
// }

export interface LocationAccordionProps {
  savedLocations?: CompanyAddress[];
  onLocationSelect: (location: CompanyAddress) => void;
  onLocationSave: (newLocation: CompanyAddress) => void;
}

export default function LocationAccordion({
  savedLocations = [],
  onLocationSelect,
  onLocationSave,
}: LocationAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(savedLocations.length === 0);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Automatically switch to add mode if no locations exist
  useEffect(() => {
    if (savedLocations.length === 0) {
      setIsAddingNew(true);
    }
  }, [savedLocations]);

  // set selected location from saved locations  is main check 
  useEffect(() => {
    const mainLocation = savedLocations.find(loc => loc.isMain);
    if (mainLocation) {
      setSelectedLocationId(mainLocation.id || null);
    }
  }, [savedLocations]);

  const handleAddNewSuccess = (newLocation: CompanyAddress) => {
    onLocationSave(newLocation);
    onLocationSelect(newLocation);
    setIsAddingNew(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all">
        {/* Accordion Header */}
        <div
          onClick={() => setIsOpen(prev => !prev)}
          className="flex justify-between items-center p-5 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors border-b border-transparent data-[open=true]:border-gray-200"
          data-open={isOpen}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <MapPinIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Delivery Location</h2>
              {/* Show brief preview of selected address when collapsed */}
              {!isOpen && selectedLocationId && (
                <p className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-xs mt-0.5">
                  {savedLocations.find(l => l.id === selectedLocationId)?.address || 'Custom Pinned Location'}
                </p>
              )}
            </div>
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>

        {/* Accordion Body */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-5 sm:p-6">
                
                {/* View 1: Saved Locations Grid (ALWAYS VISIBLE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedLocations.map((loc, idx) => {
                    const isSelected = loc.id === selectedLocationId;
                    return (
                      <div
                        key={loc.id || idx}
                        onClick={() => onLocationSelect(loc)}
                        className={`relative flex flex-col justify-between p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 min-h-[140px]
                          ${isSelected 
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                            : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm bg-white'
                          }`}
                      >
                        {isSelected && (
                          <CheckCircleIcon className="absolute top-4 right-4 h-6 w-6 text-indigo-600 drop-shadow-sm" />
                        )}
                        
                        <div className="pr-8 mb-4">
                          {/* Label & Main Badge */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`font-semibold text-sm ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                              {loc.label || 'Saved Address'}
                            </span>
                            {loc.isMain && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700 rounded-full">
                                Main
                              </span>
                            )}
                          </div>
                          
                          <p className={`text-sm leading-snug ${isSelected ? 'text-indigo-800' : 'text-gray-600'}`}>
                            {loc.address ? loc.address : 'Custom Pinned Location'}
                          </p>
                          
                          {/* Show coordinates only if address is purely null */}
                          {!loc.address && (
                            <p className="text-xs text-gray-400 mt-1">
                              {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                            </p>
                          )}

                          {/* Delivery Instructions */}
                          {loc.instructions && (
                            <div className="flex items-start mt-2 text-xs text-gray-500">
                              <InformationCircleIcon className="h-4 w-4 mr-1.5 mt-0.5 shrink-0" />
                              <span className="line-clamp-2 italic">"{loc.instructions}"</span>
                            </div>
                          )}
                        </div>

                        {/* Contact Information */}
                        {(loc.contactName || loc.contactPhone || loc.contactEmail) && (
                          <div className="mt-auto pt-4 border-t border-gray-200/60 space-y-1.5">
                            {loc.contactName && (
                              <div className="flex items-center text-sm text-gray-600">
                                <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="truncate">{loc.contactName}</span>
                              </div>
                            )}
                            {loc.contactPhone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                                {loc.contactPhone}
                              </div>
                            )}
                            {loc.contactEmail && (
                              <div className="flex items-center text-sm text-gray-600">
                                <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="truncate">{loc.contactEmail}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add New Location Card Button - Always Visible */}
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className={`flex flex-col items-center justify-center min-h-[140px] p-5 rounded-xl border-2 border-dashed transition-all group outline-none
                      ${isAddingNew 
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-600 shadow-inner' 
                        : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30 text-gray-500 hover:text-indigo-600'
                      }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-3 transition-colors
                      ${isAddingNew ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 group-hover:bg-indigo-100'}`}>
                      <PlusIcon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Add New Address</span>
                  </button>
                </div>

                {/* View 2: Add New Location Picker (Slides down below the grid) */}
                <AnimatePresence>
                  {isAddingNew && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-gray-200 space-y-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Add Delivery Detail</h3>
                            <p className="text-sm text-gray-500">Pinpoint your location and add contact info.</p>
                          </div>
                          {savedLocations.length > 0 && (
                            <button 
                              onClick={() => setIsAddingNew(false)}
                              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                              title="Close map form"
                            >
                              <XMarkIcon className="h-6 w-6" />
                            </button>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 rounded-2xl p-1 border border-gray-100">
                          <LocationPicker onAddressSave={handleAddNewSuccess} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}