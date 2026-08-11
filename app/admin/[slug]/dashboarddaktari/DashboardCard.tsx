'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface DashboardCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  bgColor: string;
  textColor: string;
  link?: string;
}

export default function DashboardCard({
  icon: Icon,
  title,
  value,
  bgColor,
  textColor,
  link,
}: DashboardCardProps) {
  const router = useRouter();

  return (
    <motion.div
      className="relative p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden group"
      style={{ backgroundColor: bgColor }}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.03, boxShadow: '0px 15px 30px rgba(0,0,0,0.2)' }}
      onClick={() => link && router.push(link)}
    >
      {/* Background Icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <Icon className="w-32 h-32" style={{ color: textColor }} />
      </div>

      <Icon className="w-12 h-12 mb-4 relative z-10" style={{ color: textColor }} />
      <h3 className="text-xl font-semibold mb-2 relative z-10" style={{ color: textColor }}>
        {title}
      </h3>
      <p className="text-4xl font-bold relative z-10" style={{ color: textColor }}>
        {value}
      </p>
      {link && (
        <span
          className="mt-4 text-sm font-medium relative z-10 underline opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          style={{ color: textColor }}
        >
          View Details
        </span>
      )}
    </motion.div>
  );
}