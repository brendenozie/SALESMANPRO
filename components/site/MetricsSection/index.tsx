import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  PhoneIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

// MetricCard component to display a single feature
const MetricCard = ({ title, description, Icon }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center space-y-2 p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
    >
      <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full mb-4">
        <Icon className="w-12 h-12 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
        {description}
      </p>
    </motion.div>
  );
};

// Main App component containing the updated section
export default function App() {
  const features = [
    {
      title: 'Secure Payment',
      description: 'Secure on every order',
      Icon: ShieldCheckIcon,
    },
    {
      title: '24/7 Support',
      description: 'Contact us 24 hrs a day',
      Icon: PhoneIcon,
    },
    {
      title: 'Fast Delivery',
      description: 'Fast delivery on your doorstep',
      Icon: TruckIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-sans p-8 flex items-center justify-center">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Why Choose Us?
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-16 max-w-2xl mx-auto">
          We're committed to providing the best experience with our top-tier service.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <MetricCard
              key={index}
              title={feature.title}
              description={feature.description}
              Icon={feature.Icon}
            />
          ))}
        </div>
      </section>
    </div>
  );
}


// 'use client';

// import React from 'react';
// import { motion } from 'framer-motion';
// import {
//   CubeIcon,
//   UserGroupIcon,
//   TrophyIcon,
//   LifebuoyIcon,
// } from '@heroicons/react/24/outline';
// import { useStoreContext } from '@/contexts/StoreContext';

// interface MetricsSectionProps {
//   products: number;
//   customers: number;
//   awardsCount: number;
//   support: string | number;
// }

// const MetricCard = ({
//   label,
//   value,
//   Icon,
//   primary,
//   secondary,
// }: {
//   label: string;
//   value: number | string;
//   Icon: any;
//   primary: string;
//   secondary: string;
// }) => {
//   return (   
//     <motion.div
//       whileHover={{ scale: 1.05 }}
//       initial={{ opacity: 0, y: 40 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.7, ease: 'easeOut' }}
//       viewport={{ once: true }}
//       className="flex flex-col items-center text-center space-y-4 p-4"
//     >
//       <Icon className="w-12 h-12 text-green-600" style={{color:`${primary}`}}/>
//       <h3 className="text-lg font-semibold text-gray-800">
//         {value}
//       </h3>
//       <p className="text-gray-600 text-sm">{label}</p>
//     </motion.div>
//   );
// };

// export default function MetricsSection({
//   products,
//   customers,
//   awardsCount,
//   support,
// }: MetricsSectionProps) {
//   const { storeFormData } = useStoreContext();
//   const { themeSettings = {} } = storeFormData || {};
//   const primary = themeSettings.primaryColor || '#6366f1';
//   const secondary = themeSettings.secondaryColor || '#14b8a6';

//   const metrics = [
//     { label: 'Products Available', value: products, Icon: CubeIcon },
//     { label: 'Happy Customers', value: customers, Icon: UserGroupIcon },
//     { label: 'Awards Achieved', value: awardsCount, Icon: TrophyIcon },
//     { label: '24/7 Support Hours', value: support, Icon: LifebuoyIcon },
//   ];

//   return (
//     <section
//       className="py-24 bg-gradient-to-b from-white to-gray-100 dark:from-zinc-950 dark:to-zinc-900"
//     >
//       <div className="max-w-7xl mx-auto px-6 text-center">
//         <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-12">
//           Powered by Impact
//         </h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
//           {metrics.map((metric, index) => (            
//             <MetricCard
//               key={metric.label}
//               label={metric.label}
//               value={metric.value}
//               Icon={metric.Icon}
//               primary={primary}
//               secondary={secondary}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
