'use client';

import { motion } from 'framer-motion';
import { DashboardData } from './EcomDashboardClient';

// --- CONFIGURATION ---
const ACTIVITY_COLORS = {
    pendingOrders: { name: 'Pending Orders', color: 'text-indigo-400', stroke: 'stroke-indigo-500' },
    pendingRequests: { name: 'Pending Requests', color: 'text-pink-400', stroke: 'stroke-pink-500' },
    openTasks: { name: 'Open Tasks', color: 'text-cyan-400', stroke: 'stroke-cyan-500' },
};

const STROKE_WIDTH = 12;
const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Helper to calculate the stroke-dashoffset for the SVG circle
const getOffset = (percentage: number) => {
    return CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;
};

export default function ActivityDonutChart({ data }: { data: DashboardData['activityBreakdown'] }) {

    // --- Data Processing ---
    if (!data) {
        return (
            // Updated loading/placeholder style to match the dark theme panel
            <div className="flex items-center justify-center h-52 bg-gray-800 rounded-xl border border-gray-700/50 text-gray-500">
                <div className="text-center">
                    <p className="text-sm font-medium">Loading Activity Data...</p>
                </div>
            </div>
        );
    }

    const { pendingOrders, pendingRequests, openTasks } = data;
    const total = pendingOrders + pendingRequests + openTasks;

    // Convert raw counts to percentages
    const segments = [
        { key: 'pendingOrders', value: pendingOrders, percentage: total > 0 ? (pendingOrders / total) * 100 : 0 },
        { key: 'pendingRequests', value: pendingRequests, percentage: total > 0 ? (pendingRequests / total) * 100 : 0 },
        { key: 'openTasks', value: openTasks, percentage: total > 0 ? (openTasks / total) * 100 : 0 },
    ];

    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-52 bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50 text-gray-500">
                <p className="text-md font-medium">No pending activity. Everything is clear! 🥳</p>
            </div>
        );
    }
    
    // Calculate cumulative offsets for drawing the segments
    let currentOffset = getOffset(0);
    const chartSegments = segments.map(segment => {
        const percentage = segment.percentage;
        const offset = getOffset(percentage);
        const segmentData = {
            ...segment,
            ...ACTIVITY_COLORS[segment.key as keyof typeof ACTIVITY_COLORS], // Merge color info
            offset: currentOffset,
            dasharray: CIRCUMFERENCE,
            // The length of the stroke for this segment is CIRCUMFERENCE - offset
            strokeLength: CIRCUMFERENCE - offset,
        };
        // Update offset for the next segment
        currentOffset = currentOffset - segmentData.strokeLength;
        return segmentData;
    });

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-52">
            
            {/* --- 1. Donut Chart SVG --- */}
            <div className="relative w-[150px] h-[150px] flex items-center justify-center">
                <svg viewBox={`0 0 ${2 * RADIUS} ${2 * RADIUS}`} className="transform -rotate-90">
                    {/* Background Ring (Dark Gray) */}
                    <circle
                        cx={RADIUS}
                        cy={RADIUS}
                        r={RADIUS - STROKE_WIDTH / 2}
                        fill="transparent"
                        stroke="rgb(55, 65, 81)" /* gray-700 */
                        strokeWidth={STROKE_WIDTH}
                    />

                    {/* Chart Segments */}
                    {chartSegments.map((segment, index) => (
                        <motion.circle
                            key={segment.key}
                            cx={RADIUS}
                            cy={RADIUS}
                            r={RADIUS - STROKE_WIDTH / 2}
                            fill="transparent"
                            stroke={segment.stroke.replace('stroke-', 'var(--tw-stroke-')} // Use Tailwind color via CSS variable
                            strokeWidth={STROKE_WIDTH}
                            strokeDasharray={CIRCUMFERENCE}
                            strokeLinecap="round"
                            // Use the calculated offset and strokeLength to draw the segment
                            style={{
                                strokeDashoffset: segment.offset,
                                strokeDasharray: `${segment.strokeLength} ${CIRCUMFERENCE - segment.strokeLength}`,
                            }}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: 'easeInOut', delay: index * 0.2 }}
                        />
                    ))}
                </svg>

                {/* Center Text (Total Count) */}
                <div className="absolute text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="text-3xl font-extrabold text-white"
                    >
                        {total}
                    </motion.div>
                    <p className="text-xs text-gray-400 font-medium">Total Items</p>
                </div>
            </div>

            {/* --- 2. Legend --- */}
            <div className="flex flex-col space-y-2 text-sm">
                {chartSegments.map(segment => (
                    <div key={segment.key} className="flex items-center">
                        {/* Color Dot */}
                        <span className={`w-3 h-3 rounded-full mr-3 shadow-md ${segment.color.replace('text-', 'bg-')}`}></span>
                        
                        {/* Name and Percentage */}
                        <span className="text-gray-300 font-medium">{segment.name}:</span>
                        <span className={`ml-2 font-bold ${segment.color}`}>{Math.round(segment.percentage)}%</span>
                        <span className="ml-1 text-gray-500">({segment.value})</span>
                    </div>
                ))}
            </div>
            
        </div>
    );
}