import React from 'react';
import { getProgramsData, Program } from '@/constant/Data'; // Adjust path as needed
import { motion } from 'framer-motion';

interface ProgramsProps {
  params: {
    adminSlug: string;
  };
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function ProgramsPage({ params }: ProgramsProps) {
  const { adminSlug } = params;
  const programsData: Program[] = getProgramsData(adminSlug);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Programs & Classes Management</h2>

      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">All Programs & Classes</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-primary-dark text-white rounded-md text-sm hover:bg-primary-hover transition-colors"
        >
          + Add New Program
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programsData.map((program) => (
          <motion.div
            key={program.id}
            className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between"
            variants={cardVariants}
          >
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{program.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{program.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  program.type === 'class' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {program.type === 'class' ? 'Class' : 'Program'}
                </span>
                <span className="ml-3">Duration: {program.duration}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Instructor: {program.instructor}</p>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-lg font-bold text-primary-dark">${program.price.toFixed(2)}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                program.status === 'active' ? 'bg-green-100 text-green-800' :
                program.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}