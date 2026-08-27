"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- Icon components for the timeline steps ---
// Using inline SVG for a consistent, self-contained component.
const Step1Icon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h3m-6 4h3" />
    </svg>
);

const Step2Icon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const Step3Icon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13l3-3m0 0l3 3m-3-3v8m0 0l-3 3m3-3l3 3m-3-3v8" />
    </svg>
);

const Step4Icon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Define the steps and their corresponding icon components
const timelineSteps = [
    { label: 'Order Placed', icon: <Step1Icon /> },
    { label: 'Shipped', icon: <Step2Icon /> },
    { label: 'Out for Delivery', icon: <Step3Icon /> },
    { label: 'Delivered', icon: <Step4Icon /> },
];

// Mock data for demonstration purposes
const orderData = {
    '12345': {
        orderNumber: '12345',
        status: 'Out for Delivery',
        deliveryDate: 'August 30, 2025',
        lastUpdated: 'August 27, 2025, 4:00 PM',
    },
    '67890': {
        orderNumber: '67890',
        status: 'Shipped',
        deliveryDate: 'September 2, 2025',
        lastUpdated: 'August 26, 2025, 10:30 AM',
    },
};

const TrackOrderPage: React.FC = () => {
    // State to manage the tracking number input
    const [trackingNumber, setTrackingNumber] = useState<string>('');
    // State to store the tracking data
    const [trackingData, setTrackingData] = useState<any | null>(null);
    // State to handle loading and errors
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Handles the form submission
    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setTrackingData(null);

        if (!trackingNumber.trim()) {
            setError('Please enter a tracking number.');
            return;
        }

        setIsLoading(true);
        // Simulate a network request with a delay
        setTimeout(() => {
            const data = orderData[trackingNumber as keyof typeof orderData];
            if (data) {
                setTrackingData(data);
            } else {
                setError('Tracking number not found. Please check your number and try again.');
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen"
        >
            <div className="container mx-auto px-4 py-16 max-w-6xl">
                {/* Hero Section & Tracking Form */}
                <header className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-orange-600 dark:text-orange-400">
                        Where's My Order?
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Enter your order number to get real-time status updates on your delivery.
                    </p>
                    <div className="mt-8">
                        <form onSubmit={handleTrack} className="max-w-xl mx-auto flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                            <input
                                type="text"
                                placeholder="Enter your tracking number"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="flex-1 px-6 py-4 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Tracking...' : 'Track Order'}
                            </button>
                        </form>
                        {error && (
                            <div className="mt-4 text-red-500 font-medium">
                                {error}
                            </div>
                        )}
                    </div>
                </header>

                {/* Tracking Results */}
                {trackingData && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-16"
                    >
                        <div className="card rounded-xl p-8">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Order #{trackingData.orderNumber}</h2>
                                    <p className="text-gray-600 dark:text-gray-400">Estimated Delivery: {trackingData.deliveryDate}</p>
                                </div>
                                <a href="#" className="text-orange-600 dark:text-orange-400 hover:underline mt-4 md:mt-0">View Order Details</a>
                            </div>
                            
                            {/* Timeline */}
                            <div className="flex justify-between items-center relative py-8 px-4 md:px-0">
                                {timelineSteps.map((step, index) => (
                                    <div key={index} className="timeline-step flex-1 text-center">
                                        <div className={`timeline-icon w-12 h-12 rounded-full mx-auto flex items-center justify-center transition-colors duration-300 ${
                                            timelineSteps.findIndex(s => s.label === trackingData.status) >= index
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-400 dark:bg-gray-600 text-white'
                                        }`}>
                                            {step.icon}
                                        </div>
                                        <p className={`timeline-label font-semibold mt-4 ${
                                            timelineSteps.findIndex(s => s.label === trackingData.status) >= index
                                                ? 'text-orange-600 dark:text-orange-400'
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {step.label}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Status Update */}
                            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                                <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400">Current Status: {trackingData.status}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Last updated: {trackingData.lastUpdated}</p>
                            </div>
                        </div>
                    </motion.section>
                )}
                
                {/* FAQ Section */}
                <section>
                    <h2 className="text-3xl font-bold text-center mb-8">Common Tracking Questions</h2>
                    <div className="space-y-4 max-w-3xl mx-auto">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-1">How can I find my tracking number?</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Your tracking number is included in the shipping confirmation email we sent you. Please check your inbox and spam folder.
                            </p>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-1">My tracking number isn't working. What should I do?</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                It can sometimes take up to 24 hours for tracking information to appear after your order has shipped. If it still doesn't work after a day, please contact our support team with your order number.
                            </p>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-1">What if my package says "delivered" but I haven't received it?</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We recommend checking with neighbors or your building's front desk. Occasionally, packages are marked as delivered prematurely. If it still doesn't show up after 24 hours, contact us immediately.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </motion.div>
    );
};

export default TrackOrderPage;
