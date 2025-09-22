"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'; // Icons for fields
import { useStoreContext } from '@/contexts/StoreContext'; // For dynamic theme colors

// Define form state interface for better type safety
interface BookingFormState {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  message: string;
}

export default function BookingFormSection() {
  const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; // teal-600 fallback
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316'; // orange-500 fallback

  const [form, setForm] = useState<BookingFormState>({
    name: '',
    email: '',
    phone: '',
    serviceType: '', // Added service type
    preferredDate: '', // Added date picker
    preferredTime: '', // Added time picker
    address: '', // Added address
    message: '',
  });

  const [errors, setErrors] = useState<Partial<BookingFormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for the field being changed
    if (errors[name as keyof BookingFormState]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const validateForm = () => {
    let newErrors: Partial<BookingFormState> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid.';
    }
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!form.serviceType) newErrors.serviceType = 'Please select a service type.';
    if (!form.preferredDate) newErrors.preferredDate = 'Preferred date is required.';
    if (!form.preferredTime) newErrors.preferredTime = 'Preferred time is required.';
    if (!form.address.trim()) newErrors.address = 'Address is required.';
    if (!form.message.trim()) newErrors.message = 'Message is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(null); // Reset submission status

    if (!validateForm()) {
      // Form is invalid, scroll to first error or shake form
      alert('Please fill in all required fields correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form Submitted:', form);
      setSubmitSuccess(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        preferredDate: '',
        preferredTime: '',
        address: '',
        message: '',
      });
      setErrors({}); // Clear any previous errors
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  return (
    <section id="booking" className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-16 lg:py-24 px-4 relative overflow-hidden">
      {/* Background blobs for visual interest */}
      <div
        className="absolute top-0 left-0 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-alt animation-delay-0"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-alt animation-delay-2000"
        style={{ backgroundColor: secondaryColor }}
      />

      <motion.div
        className="max-w-4xl mx-auto text-center relative z-10 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700"
        initial="hidden"
        whileInView="visible"
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold mb-4 text-gray-900 dark:text-gray-100" variants={inputVariants}>
          Book Your <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>Cleaning</span> Service
        </motion.h2>
        <motion.p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-xl mx-auto" variants={inputVariants}>
          Tell us about your cleaning needs, and we'll get back to you with a personalized quote and schedule.
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {/* Name */}
          <motion.div variants={inputVariants}>
            <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-5 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2`}
              // style={{ focusRingColor: primaryColor }}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </motion.div>

          {/* Email */}
          <motion.div variants={inputVariants}>
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-5 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2`}
              // style={{ focusRingColor: primaryColor }}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </motion.div>

          {/* Phone */}
          <motion.div variants={inputVariants}>
            <label htmlFor="phone" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel" // Use tel type for phone numbers
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="+1 (555) 123-4567"
              className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-5 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2`}
              // style={{ focusRingColor: primaryColor }}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </motion.div>

          {/* Service Type Dropdown */}
          <motion.div variants={inputVariants}>
            <label htmlFor="serviceType" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Type of Service</label>
            <select
              id="serviceType"
              name="serviceType"
              value={form.serviceType}
              onChange={handleChange}
              required
              className={`w-full border ${errors.serviceType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-5 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 appearance-none pr-8`} // appearance-none for custom arrow
              // style={{ focusRingColor: primaryColor }}
            >
              <option value="" disabled>Select a service</option>
              {/* Populate with dynamic services from storeFormData.storeCategories or specific service list */}
              {storeFormData?.StoreCategory && storeFormData.StoreCategory.length > 0 ? (
                storeFormData.StoreCategory.map((category) => (
                  <option key={category.id} value={category.displayName || ''}>
                    {category.displayName}
                  </option>
                ))
              ) : (
                <>
                  <option value="Residential Cleaning">Residential Cleaning</option>
                  <option value="Commercial Cleaning">Commercial Cleaning</option>
                  <option value="Deep Cleaning">Deep Cleaning</option>
                  <option value="Move-in/out Cleaning">Move-in/out Cleaning</option>
                  <option value="Post-Construction Cleaning">Post-Construction Cleaning</option>
                </>
              )}
            </select>
            {errors.serviceType && <p className="text-red-500 text-xs mt-1">{errors.serviceType}</p>}
          </motion.div>

          {/* Preferred Date & Time - using grid for layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={inputVariants}>
              <label htmlFor="preferredDate" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Preferred Date
                <CalendarDaysIcon className="inline-block w-5 h-5 ml-2 text-gray-500 dark:text-gray-400" />
              </label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                value={form.preferredDate}
                onChange={handleChange}
                required
                className={`w-full border ${errors.preferredDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-5 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2`}
                // style={{ focusRingColor: primaryColor }}
              />
              {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate}</p>}
            </motion.div>

            <motion.div variants={inputVariants}>
              <label htmlFor="preferredTime" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Preferred Time
                <ClockIcon className="inline-block w-5 h-5 ml-2 text-gray-500 dark:text-gray-400" />
              </label>
              <input
                type="time"
                id="preferredTime"
                name="preferredTime"
                value={form.preferredTime}
                onChange={handleChange}
                required
                className={`w-full border ${errors.preferredTime ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-5 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2`}
                // style={{ focusRingColor: primaryColor }}
              />
              {errors.preferredTime && <p className="text-red-500 text-xs mt-1">{errors.preferredTime}</p>}
            </motion.div>
          </div>

          {/* Address */}
          <motion.div variants={inputVariants}>
            <label htmlFor="address" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Service Address
                <MapPinIcon className="inline-block w-5 h-5 ml-2 text-gray-500 dark:text-gray-400" />
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="123 Main St, Anytown, USA"
              className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-5 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2`}
              // style={{ focusRingColor: primaryColor }}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </motion.div>

          {/* Message */}
          <motion.div variants={inputVariants}>
            <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Additional Details</label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              placeholder="E.g., Number of rooms, specific cleaning instructions, preferred contact method, etc."
              rows={5}
              className={`w-full border ${errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-5 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2`}
              // style={{ focusRingColor: primaryColor }}
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full py-3 rounded-lg text-lg font-semibold shadow-md transition-all duration-300 flex items-center justify-center"
            style={{ backgroundColor: primaryColor, color: 'white' }}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Submit Booking Request'
            )}
          </motion.button>

          {/* Submission Feedback */}
          {submitSuccess === true && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-4 text-green-600 dark:text-green-400 font-medium"
            >
              Thank you for your request! We've received your booking and will contact you within 24 hours.
            </motion.p>
          )}
          {submitSuccess === false && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-4 text-red-600 dark:text-red-400 font-medium"
            >
              There was an error submitting your request. Please try again later.
            </motion.p>
          )}
        </form>
      </motion.div>
    </section>
  );
}