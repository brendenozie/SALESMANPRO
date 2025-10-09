'use client';

import { motion } from 'framer-motion';

interface ChartData {
  name: string;
  total: number;
}

interface Props {
  data: ChartData[];
  currency?: string;
}

const formatCurrency = (amount: number, currency: string) => {
    // Ensure formatting is consistent with the dashboard's needs (no decimals)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
};

export default function SimpleBarChart({ data, currency = 'USD' }: Props) {
  
  // --- Guard Clause (Cleaned up for Dark Mode) ---
  if (!data || data.length === 0) {
    return (
      // Redesigned empty state for dark mode panel
      <div className="w-full h-52 flex items-center justify-center p-4 bg-gray-700/50 rounded-lg border border-gray-700">
        <span className="text-sm font-semibold text-gray-500">
          No sales data available for this period.
        </span>
      </div>
    );
  }

  // Calculate Max Value (safe guard)
  const maxValue = Math.max(...data.map(item => item.total), 1);

  // --- Animation Variants (Optimized for sharp, dark aesthetics) ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    // Start from 0 height
    hidden: { height: 0, opacity: 0, y: 10 },
    // Animate to full height/opacity
    visible: {
      opacity: 1,
      height: '100%', // Framer Motion handles the height transition based on the percentage style
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  return (
    // --- Chart Container (High-Contrast Dark Mode) ---
    // Removed backdrop-blur/light backgrounds, using dark background to match the chart panel
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-52 flex items-end justify-around gap-4 p-2 relative bg-gray-800"
    >
      
      {/* --- Overlay Grid Lines for Data-Ink Style --- */}
      <div className="absolute inset-x-0 bottom-0 top-0 opacity-20 pointer-events-none">
        {/* Horizontal reference lines */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gray-600"></div>
        <div className="absolute inset-x-0 top-1/4 h-[1px] bg-gray-600"></div>
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-gray-600"></div>
        <div className="absolute inset-x-0 top-3/4 h-[1px] bg-gray-600"></div>
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gray-600"></div>
      </div>


      {data.map((item) => {
        const heightPercentage = (item.total / maxValue) * 100;
        
        return (
          <div key={item.name} className="flex flex-col items-center h-full w-full max-w-[40px] z-10">
            
            {/* --- Bar and Value Tooltip --- */}
            <div className="flex-grow w-full flex items-end">
              <motion.div
                variants={itemVariants}
                style={{ height: `${heightPercentage}%` }}
                // Redesigned Bar: Sharp, solid gradient for a technical look
                className="w-full bg-gradient-to-t from-cyan-500 to-indigo-600 shadow-lg rounded-t-sm group relative"
              >
                {/* Tooltip: Minimal, high-contrast display */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-gray-900 text-xs font-bold rounded-sm whitespace-nowrap shadow-xl">
                  {formatCurrency(item.total, currency)}
                </div>
              </motion.div>
            </div>
            
            {/* --- Label --- */}
            <span className="text-xs font-semibold text-gray-400 mt-2">
              {item.name}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}