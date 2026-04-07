"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckBadgeIcon,
  LockClosedIcon,
  SparklesIcon,
  CalendarDaysIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";

// Local loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const latestNews = [
  { title: 'Global leaders unite to address climate crisis at COP26', date: 'April 21, 2023', img: '/images/cop26.jpg' },
  { title: 'Cybersecurity experts warn of increased threats', date: 'April 20, 2023', img: '/images/cyber.jpg' },
  { title: 'Athlete achieves historic win at world championships', date: 'April 19, 2023', img: '/images/athlete.jpg' },
  { title: 'Chemical currents breaking news in chemistry and materials science', date: 'April 18, 2023', img: '/images/chemistry.jpg' },
];

export default function LatestNewsSection() {
  return (
     <section>
      
     {/* Latest News */}
     <h2 className="text-2xl font-semibold mb-6">Latest News</h2>
     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
       {latestNews.map((item, idx) => (
         <motion.article
           key={idx}
           className="bg-white rounded-2xl overflow-hidden shadow-md"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: idx * 0.1 }}
         >
           <img src={item.img} alt={item.title} className="w-full h-40 object-cover" />
           <div className="p-4">
             <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
             <p className="text-gray-500 text-sm flex items-center">
               <CalendarIcon className="h-5 w-5 mr-1" /> {item.date}
             </p>
           </div>
         </motion.article>
       ))}
     </div>
   </section>
  );
}
