import React from 'react';
import { getTrainersData, Trainer } from '@/constant/Data'; // Adjust path as needed
import { motion } from 'framer-motion';

interface TrainersProps {
  params: {
    adminSlug: string;
  };
}

const trainerCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function TrainersPage({ params }: TrainersProps) {
  const { adminSlug } = params;
  const trainersData: Trainer[] = getTrainersData(adminSlug);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Trainers & Staff Management</h2>

      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">All Trainers</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-primary-dark text-white rounded-md text-sm hover:bg-primary-hover transition-colors"
        >
          + Add New Trainer
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainersData.map((trainer) => (
          <motion.div
            key={trainer.id}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center"
            variants={trainerCardVariants}
          >
            <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center text-gray-600 text-3xl font-bold">
              {trainer.name.charAt(0)} {/* Placeholder for image */}
              {/* In a real app, you'd use Image component with trainer.photoUrl */}
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-1">{trainer.name}</h4>
            <p className="text-primary-dark font-medium mb-2">{trainer.specialty}</p>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{trainer.bio}</p>
            <div className="w-full text-left text-sm text-gray-700 space-y-1">
                <p><span className="font-semibold">Email:</span> {trainer.email}</p>
                <p><span className="font-semibold">Phone:</span> {trainer.phone}</p>
                <p>
                    <span className="font-semibold">Status:</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        trainer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                        {trainer.status.charAt(0).toUpperCase() + trainer.status.slice(1)}
                    </span>
                </p>
                <p><span className="font-semibold">Certifications:</span> {trainer.certifications.join(', ')}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}