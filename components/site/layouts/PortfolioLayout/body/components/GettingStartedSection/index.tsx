'use client';

import React from 'react';
import {
  CalendarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// Map iconKey to actual icon component (extendable)
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CalendarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowRightIcon,
};

// Default steps tailored for a portfolio/personal-branding context
const defaultSteps = [
  {
    iconKey: 'BriefcaseIcon',
    title: 'Explore My Work',
    description:
      'Browse my portfolio to see projects, case studies, and creative solutions I have delivered.',
    ctaText: 'View Portfolio',
    ctaLink: '#portfolio',
  },
  {
    iconKey: 'UserGroupIcon',
    title: 'Hear From Clients',
    description:
      'Read testimonials and success stories from clients and collaborators I’ve worked with.',
    ctaText: 'Read Testimonials',
    ctaLink: '#testimonials',
  },
  {
    iconKey: 'CalendarIcon',
    title: 'Book a Consultation',
    description:
      'Schedule a free consultation to discuss how we can work together and bring your ideas to life.',
    ctaText: 'Schedule Now',
    ctaLink: '#contact',
  },
];

export default function GettingStartedSection() {
  const { storeFormData } = useStoreContext();
  
  let dynamicSteps:any[] = [];

  const { themeSettings = {} } = storeFormData;

  // Theme colors
  const primaryColor = themeSettings.primaryColor || '#0d675c';
  const secondaryColor = themeSettings.secondaryColor || '#10b981';

  // Determine steps data: dynamic if provided, else defaultSteps
  type Step = {
    iconKey?: string;
    title: string;
    description: string;
    ctaText?: string;
    ctaLink?: string;
  };
  const stepsData: Step[] =
    Array.isArray(dynamicSteps) && dynamicSteps.length > 0
      ? dynamicSteps.map((step: any) => ({
          iconKey: step.iconKey || 'BriefcaseIcon',
          title: step.title || 'Step',
          description: step.description || '',
          ctaText: step.ctaText,
          ctaLink: step.ctaLink,
        }))
      : defaultSteps;

  return (
    <section
      className="relative py-24 px-6 lg:px-16 overflow-hidden"
      style={{ backgroundColor: primaryColor }}
    >
      {/* Decorative blurred circles */}
      <div
        className="absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: secondaryColor }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: secondaryColor }}
      />

      <div className="relative max-w-7xl mx-auto text-center z-10">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          How to Get Started
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stepsData.map(({ iconKey, title, description, ctaText, ctaLink }, index) => {
            const IconComponent = iconMap[iconKey ?? 'BriefcaseIcon'] || BriefcaseIcon;
            return (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div
                  className="p-4 rounded-full mb-4"
                  style={{ backgroundColor: primaryColor, color: '#fff' }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 flex-grow mb-4">{description}</p>
                {ctaText && ctaLink && (
                  <a
                    href={ctaLink}
                    className="inline-flex items-center gap-2 text-sm font-medium text-white py-2 px-4 rounded-full"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    {ctaText}
                    <ArrowRightIcon className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
