// File: components/site/layouts/HealthcareLayout/HealthcareSite.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HeartIcon, ClipboardDocumentListIcon, CogIcon, BellIcon, Bars2Icon } from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../../../contexts/StoreContext';


// Dynamic loader for optimized images
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Fade-in variants for motion
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HealthCareSite() {
  const { storeFormData } = useStoreContext();
  const router = useRouter();

  // Pull data from storeFormData
  const {
    name,
    slug,
    description,
    bannerUrl,
    aboutImageUrl,
    aboutText,
    services: svcFromStore,
    doctors: docFromStore,
    testimonials: tFromStore,
    faqs: faqFromStore,
  } = storeFormData as any; // assume these fields exist on storeFormData

  const [services, setServices] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setServices(svcFromStore || []);
    setDoctors(docFromStore || []);
    setTestimonials(tFromStore || []);
    setFaqs(faqFromStore || []);
  }, [svcFromStore, docFromStore, tFromStore, faqFromStore]);

  return (
    <>
      {/* Hero Section  */}
      <HealthcareHero
          name={name}
          slug={slug}
          description={description}
          bannerUrl={bannerUrl}
        />
      <div className="space-y-24 font-sans">
        
        {/* About Section */}
        <AboutSection aboutImageUrl={aboutImageUrl} aboutText={aboutText} />

        {/* CTA Section */}
        <CTASection name={name} slug={slug} />

        {/* Services Section */}
        <MedicalServicesSection services={services} storeSlug={slug} />

        {/* Health Tips Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6 max-w-5xl">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-4xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100"
            >
              Health Tips & Resources
            </motion.h2>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto"
            >
              Stay informed with practical tips and trusted health insights for you and your loved ones.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Healthy Eating',
                  description: 'Discover balanced diets and nutrition tips to fuel your body.',
                  icon: <CogIcon className="w-10 h-10 text-teal-600" />,
                },
                {
                  title: 'Exercise Tips',
                  description: 'Incorporate practical workouts to match your lifestyle and goals.',
                  icon: <BellIcon className="w-10 h-10 text-teal-600" />,
                },
                {
                  title: 'Mental Wellness',
                  description: 'Support your emotional well-being with expert-backed strategies.',
                  icon: <Bars2Icon className="w-10 h-10 text-teal-600" />,
                },
              ].map((tip, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ delay: 0.2 * i }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center"
                >
                  <div className="flex justify-center mb-4">{tip.icon}</div>
                  <h3 className="text-xl font-semibold text-teal-700 mb-2">{tip.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{tip.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Doctors Section */}
        <DoctorsSection doctors={doctors} storeSlug={slug} />

        {/* Call to Action Banner */}
        <CTASection name={name} slug={slug} />

        {/* Patient Testimonials */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-4xl font-bold text-center mb-14 text-gray-800 dark:text-gray-100"
            >
              What Our Patients Say
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ delay: i * 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl">
                      {t.author[0]}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{t.author}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Verified Patient</p>
                    </div>
                  </div>

                  <p className="italic text-gray-700 dark:text-gray-300 text-md leading-relaxed">
                    “{t.quote}”
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Health FAQs */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100"
            >
              Frequently Asked Questions
            </motion.h2>

            <div className="space-y-6">
              {faqs.map((q, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ delay: 0.2 * i, duration: 0.4 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden"
                >
                  <details className="group p-6 cursor-pointer">
                    <summary className="flex items-center justify-between text-lg font-semibold text-teal-700 dark:text-teal-400">
                      {q.question}
                      <svg
                        className="w-5 h-5 text-teal-500 dark:text-teal-300 transform group-open:rotate-180 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">{q.answer}</p>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

interface HealthcareHeroProps {
  name: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
}

function HealthcareHero({ name, slug, description, bannerUrl }: HealthcareHeroProps) {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden bg-gradient-to-br from-teal-700 via-blue-600 to-indigo-600">
      {/* Backdrop Image + Dark Overlay */}
      {bannerUrl && (
        <Image
          src={bannerUrl}
          alt="Healthcare background"
          fill
          className="object-cover opacity-30"
          loader={loader}
          priority
        />
      )}
      <div className="absolute inset-0 bg-black opacity-20" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 px-6 text-center">
        <motion.span
          className="inline-block bg-white/20 text-white uppercase text-sm tracking-widest rounded-full px-3 py-1 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Compassionate Care
        </motion.span>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {name}
        </motion.h1>

        {description && (
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-100/90 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {description}
          </motion.p>
        )}

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${slug}/services`)}
            className="flex items-center justify-center bg-white text-teal-700 font-semibold px-6 py-3 rounded-full shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="View Services"
          >
            <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
            View Services
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${slug}/book`)}
            className="flex items-center justify-center border border-white text-white font-semibold px-6 py-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Book Appointment"
          >
            <HeartIcon className="w-5 h-5 mr-2" />
            Book Appointment
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

interface AboutSectionProps {
  aboutImageUrl?: string;
  aboutText?: string;
}

function AboutSection({ aboutImageUrl, aboutText }: AboutSectionProps) {
  return (
    <section className="bg-white dark:bg-gray-900 py-20">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Image */}
        {aboutImageUrl && (
          <motion.div
            className="w-full h-64 md:h-80 lg:h-96 relative overflow-hidden rounded-2xl shadow-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={aboutImageUrl}
              alt="About our clinic"
              loader={loader}
              fill
              className="object-cover"
            />
          </motion.div>
        )}

        {/* Text */}
        {aboutText && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block bg-emerald-500/20 text-emerald-600 uppercase text-sm tracking-widest rounded-full px-3 py-1 mb-4">
              Our Mission
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
              Compassionate Care, Expert Team
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{aboutText}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

interface CTASectionProps {
  name: string;
  slug: string;
}

function CTASection({ name, slug }: CTASectionProps) {
  const router = useRouter();
  return (
    <section className="relative min-h-[40vh] bg-gradient-to-r from-teal-600 to-blue-500 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" aria-hidden="true" />
      <div className="relative z-10 text-center px-6">
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.8 }}
        >
          Ready to Take the Next Step?
        </motion.h2>
        <motion.p
          className="text-lg text-white/90 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Book your appointment or explore our comprehensive services today.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${slug}/book`)}
            className="flex items-center justify-center bg-white text-teal-700 font-semibold px-6 py-3 rounded-full shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Book Appointment"
          >
            <HeartIcon className="w-5 h-5 mr-2" />
            Book Appointment
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${slug}/services`)}
            className="flex items-center justify-center border-2 border-white text-white font-medium px-6 py-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="View Services"
          >
            <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
            Our Services
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

interface MedicalServicesSectionProps {
  services: Array<{ id: string; name: string; imageUrl: string; slug: string }>;
  storeSlug: string;
}

function MedicalServicesSection({ services, storeSlug }: MedicalServicesSectionProps) {
  const router = useRouter();

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.8 }}
        >
          Our Medical Services
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc, idx) => (
            <motion.div
              key={svc.id}
              role="button"
              tabIndex={0}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.03, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
              onClick={() => router.push(`/${storeSlug}/service/${svc.slug}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') router.push(`/${storeSlug}/service/${svc.slug}`);
              }}
              aria-label={`Learn more about ${svc.name}`}
            >
              <div className="relative h-56 md:h-64 w-full overflow-hidden">
                <Image
                  src={svc.imageUrl}
                  alt={svc.name}
                  loader={loader}
                  fill
                  className="object-cover transform transition-transform duration-500 hover:scale-110"
                />
              </div>

              <div className="p-6 text-center">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {svc.name}
                </h3>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium px-4 py-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/${storeSlug}/service/${svc.slug}`);
                  }}
                  aria-label={`Learn more about ${svc.name}`}
                >
                  Learn More
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface DoctorsSectionProps {
  doctors: Array<{ id: string; name: string; subtitle: string; imageUrl: string }>;
  storeSlug: string;
}

function DoctorsSection({ doctors, storeSlug }: DoctorsSectionProps) {
  const router = useRouter();

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.8 }}
        >
          Meet Our Doctors
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {doctors.map((doc, idx) => (
            <motion.div
              key={doc.id}
              role="button"
              tabIndex={0}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
              onClick={() => router.push(`/${storeSlug}/doctor/${doc.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') router.push(`/${storeSlug}/doctor/${doc.id}`);
              }}
              aria-label={`View profile of Dr. ${doc.name}`}
            >
              <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-emerald-500 mb-4">
                <Image
                  src={doc.imageUrl}
                  alt={doc.name}
                  loader={loader}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Dr. {doc.name}
              </h3>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {doc.subtitle}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
