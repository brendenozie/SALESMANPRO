// components/admin/components/ServiceAvailabilityTab.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingSlot } from './ServiceListingForm'; // Import types from parent
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline'; // Specific icons
import { MarketListingForm } from '@/types/typings';

interface ServiceAvailabilityTabProps {
    MarketListingForm: MarketListingForm;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleAddBookingSlot: () => void;
    handleUpdateBookingSlot: (index: number, field: keyof BookingSlot, value: string | number) => void;
    handleRemoveBookingSlot: (index: number) => void;
    errors: Partial<MarketListingForm & { [key: string]: string }>;
    fieldVariants: any;
    tabContentVariants: any;
    primaryColor: string;
}

const ServiceAvailabilityTab: React.FC<ServiceAvailabilityTabProps> = ({
    MarketListingForm,
    handleChange,
    handleAddBookingSlot,
    handleUpdateBookingSlot,
    handleRemoveBookingSlot,
    errors,
    fieldVariants,
    tabContentVariants,
    primaryColor,
}) => {
    return (
        <motion.section
            key="availability"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
        >
            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Availability & Deals</h4>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={fieldVariants}>
                <label className="block">
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Overall Availability Start Date</span>
                    <input
                        type="datetime-local"
                        name="availabilityStart"
                        value={MarketListingForm.availabilityStart || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-lg border ${errors.availabilityStart ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    />
                    {errors.availabilityStart && <p className="text-red-500 text-xs mt-1">{errors.availabilityStart}</p>}
                </label>
                <label className="block">
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Overall Availability End Date</span>
                    <input
                        type="datetime-local"
                        name="availabilityEnd"
                        value={MarketListingForm.availabilityEnd || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-lg border ${errors.availabilityEnd ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    />
                    {errors.availabilityEnd && <p className="text-red-500 text-xs mt-1">{errors.availabilityEnd}</p>}
                </label>
            </motion.div>

            <h5 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 pt-6 border-t border-gray-200 dark:border-gray-700">Specific Booking Slots</h5>
            <AnimatePresence>
                {(MarketListingForm.bookingSlots || []).map((slot, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 relative mb-4"
                    >
                        <button
                            type="button"
                            onClick={() => handleRemoveBookingSlot(index)}
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            aria-label="Remove booking slot"
                        >
                            <MinusIcon className="w-5 h-5" />
                        </button>
                        <label className="block">
                            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Date</span>
                            <input
                                type="date"
                                value={slot.date}
                                onChange={(e) => handleUpdateBookingSlot(index, 'date', e.target.value)}
                                className={`mt-1 block w-full rounded-lg border ${errors[`bookingSlots[${index}].date`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            />
                            {errors[`bookingSlots[${index}].date`] && <p className="text-red-500 text-xs mt-1">{errors[`bookingSlots[${index}].date`]}</p>}
                        </label>
                        <label className="block">
                            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Time</span>
                            <input
                                type="time"
                                value={slot.time}
                                onChange={(e) => handleUpdateBookingSlot(index, 'time', e.target.value)}
                                className={`mt-1 block w-full rounded-lg border ${errors[`bookingSlots[${index}].time`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            />
                            {errors[`bookingSlots[${index}].time`] && <p className="text-red-500 text-xs mt-1">{errors[`bookingSlots[${index}].time`]}</p>}
                        </label>
                        <label className="block">
                            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Capacity</span>
                            <input
                                type="number"
                                value={slot.capacity}
                                onChange={(e) => handleUpdateBookingSlot(index, 'capacity', parseInt(e.target.value))}
                                className={`mt-1 block w-full rounded-lg border ${errors[`bookingSlots[${index}].capacity`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2`}
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                min="1"
                            />
                            {errors[`bookingSlots[${index}].capacity`] && <p className="text-red-500 text-xs mt-1">{errors[`bookingSlots[${index}].capacity`]}</p>}
                        </label>
                    </motion.div>
                ))}
            </AnimatePresence>
            <button
                type="button"
                onClick={handleAddBookingSlot}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor }}
            >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Booking Slot
            </button>

            <h5 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 pt-6 border-t border-gray-200 dark:border-gray-700">Deal & Offer Settings</h5>
            <motion.label className="flex items-center space-x-2 cursor-pointer" variants={fieldVariants}>
                <input
                    type="checkbox"
                    name="isOnOffer"
                    checked={MarketListingForm.isOnOffer}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-current rounded"
                    style={{ color: primaryColor }}
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Is On Offer?</span>
            </motion.label>
            {MarketListingForm.isOnOffer && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Deal Start Date</span>
                        <input
                            type="datetime-local"
                            name="startDealDate"
                            value={MarketListingForm.startDealDate || ''}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-lg border ${errors.startDealDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        />
                        {errors.startDealDate && <p className="text-red-500 text-xs mt-1">{errors.startDealDate}</p>}
                    </label>
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Deal End Date</span>
                        <input
                            type="datetime-local"
                            name="endDealDate"
                            value={MarketListingForm.endDealDate || ''}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-lg border ${errors.endDealDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2`}
                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        />
                        {errors.endDealDate && <p className="text-red-500 text-xs mt-1">{errors.endDealDate}</p>}
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer md:col-span-2">
                        <input
                            type="checkbox"
                            name="isFlashDeal"
                            checked={MarketListingForm.isFlashDeal}
                            onChange={handleChange}
                            className="form-checkbox h-5 w-5 text-current rounded"
                            style={{ color: primaryColor }}
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Is Flash Deal?</span>
                    </label>
                </motion.div>
            )}
            <motion.label className="flex items-center space-x-2 cursor-pointer mt-4" variants={fieldVariants}>
                <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={MarketListingForm.isNewArrival}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-current rounded"
                    style={{ color: primaryColor }}
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Is New Arrival?</span>
            </motion.label>
            <motion.label className="flex items-center space-x-2 cursor-pointer" variants={fieldVariants}>
                <input
                    type="checkbox"
                    name="isDiscounted"
                    checked={MarketListingForm.isDiscounted}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-current rounded"
                    style={{ color: primaryColor }}
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Is Discounted?</span>
            </motion.label>
            <motion.label className="flex items-center space-x-2 cursor-pointer" variants={fieldVariants}>
                <input
                    type="checkbox"
                    name="isFeatured"
                    checked={MarketListingForm.isFeatured}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-current rounded"
                    style={{ color: primaryColor }}
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Is Featured?</span>
            </motion.label>
        </motion.section>
    );
};

export default ServiceAvailabilityTab;
