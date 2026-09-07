// File: components/site/layouts/HealthcareLayout/HealthcareSite.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { useStoreContext } from '@/contexts/StoreContext';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import HealthcareHero from './components/HeroSection';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
// Loading skeleton
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

// Dynamically import below-the-fold components
const AboutSection = dynamic(() => import('./components/AboutSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const MedicalServicesSection = dynamic(() => import('./components/MedicalServicesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const HealthTipsSection = dynamic(() => import('./components/HealthTipsSections'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const DoctorsSection = dynamic(() => import('./components/DoctorsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const PatientSection = dynamic(() => import('./components/PatientSections'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const FAQsSection = dynamic(() => import('./components/FAQsSections'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const ContactSection = dynamic(() => import('./components/ContactSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const CTASection = dynamic(() => import('./components/CTASection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });

// --- Sample Data (for when storeFormData is empty or specific fields are missing) ---
const defaultStoreName = "Harmony Health Clinic";
const defaultStoreSlug = "harmony-health-clinic"; // A default slug for routing

const defaultBannerUrl = "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const defaultAboutImageUrl = "https://images.unsplash.com/photo-1581090435165-2767098418f7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const defaultAboutText = "At Harmony Health Clinic, we believe in a holistic approach to wellness. Our dedicated team of healthcare professionals is committed to providing personalized, compassionate care that addresses your unique needs. From preventive care to specialized treatments, we empower you to achieve optimal health and well-being. We combine cutting-edge medical practices with a warm, patient-centered environment, ensuring every visit is comfortable and effective. Your journey to better health starts here, with a team that truly cares.";

const sampleServices = [
  { id: 's1', name: 'General Consultations', description: 'Comprehensive check-ups and primary care.', icon: 'StethoscopeIcon' },
  { id: 's2', name: 'Pediatric Care', description: 'Specialized healthcare for infants, children, and adolescents.', icon: 'ChildCareIcon' },
  { id: 's3', name: 'Dermatology', description: 'Expert care for skin, hair, and nail conditions.', icon: 'SkinIcon' },
  { id: 's4', name: 'Vaccinations', description: 'Essential immunizations for all ages.', icon: 'SyringeIcon' },
  { id: 's5', name: 'Physiotherapy', description: 'Rehabilitation and physical therapy services.', icon: 'PhysioIcon' },
  { id: 's6', name: 'Dental Services', description: 'Routine cleanings, fillings, and oral health.', icon: 'ToothIcon' },
];

const sampleDoctors = [
  { id: 'd1', name: 'Alice Smith', subtitle: 'Pediatrician', imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg', specializations: ['Child Health', 'Immunizations'] },
  { id: 'd2', name: 'Robert Johnson', subtitle: 'General Practitioner', imageUrl: 'https://randomuser.me/api/portraits/men/44.jpg', specializations: ['Family Medicine', 'Preventive Care'] },
  { id: 'd3', name: 'Emily Davis', subtitle: 'Dermatologist', imageUrl: 'https://randomuser.me/api/portraits/women/79.jpg', specializations: ['Acne Treatment', 'Skin Cancer Screening'] },
  { id: 'd4', name: 'Michael Brown', subtitle: 'Orthopedic Surgeon', imageUrl: 'https://randomuser.me/api/portraits/men/33.jpg', specializations: ['Joint Replacement', 'Sports Injuries'] },
];

const sampleTestimonials = [
  { id: 't1', author: 'Jane Doe', quote: 'The care at Harmony Health Clinic is exceptional. The doctors are incredibly knowledgeable and compassionate. I always feel heard and well-cared for.', rating: 5, service: 'General Consultation' },
  { id: 't2', author: 'John P. Smart', quote: 'Booking appointments is so easy, and the staff is always friendly. My kids love Dr. Smith!', rating: 4, service: 'Pediatric Check-up' },
  { id: 't3', author: 'Maria Garcia', quote: 'I suffered from chronic back pain, and their physiotherapy team helped me immensely. Highly recommend!', rating: 5, service: 'Physiotherapy' },
  { id: 't4', author: 'David Lee', quote: 'Professional and efficient service. They made my first visit very comfortable.', rating: 4, service: 'Dental Cleaning' },
];

const sampleFaqs = [
  { id: 'f1', question: 'What are your clinic\'s operating hours?', answer: 'We are open Monday to Friday from 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 1:00 PM. We are closed on Sundays and public holidays.' },
  { id: 'f2', question: 'Do you accept walk-in appointments?', answer: 'While we highly recommend booking an appointment to minimize your wait time, we do accept walk-in patients based on doctor availability. Priority is given to scheduled appointments and emergencies.' },
  { id: 'f3', question: 'What insurance plans do you accept?', answer: 'We accept a wide range of insurance plans. Please contact our reception desk with your insurance details, and they will be happy to verify your coverage. You can also find a list of accepted providers on our "Services" page.' },
  { id: 'f4', question: 'How can I access my medical records?', answer: 'You can request access to your medical records by contacting our administrative office. We will guide you through the process, which typically involves filling out a release form for security and privacy reasons.' },
  { id: 'f5', question: 'Do you offer telehealth services?', answer: 'Yes, we offer convenient telehealth consultations for a variety of conditions. Please call our clinic or use our online booking portal to schedule a virtual appointment.' },
];

const defaultContactInfo = {
  phoneNumber: '+1-800-555-0199',
  email: 'info@harmonyhealth.com',
  address: '123 Healthway, Wellness City, HW 90210',
  openingHours: 'Mon-Fri: 8 AM - 6 PM, Sat: 9 AM - 1 PM',
  mapLink: 'https://www.google.com/maps/place/New+York,+NY' // Example Google Maps link
};

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function HealthCareSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const { storeFormData } = useStoreContext(); // Use for global theme settings only
  const router = useRouter();

  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: faqsData } = useSWR(`${apiBaseUrl}/site/faqs?id=${companyId}`, fetcher);

  // Use pageData for all content
  const siteData = pageData || storeFormData;

  // Extracting data from siteData or using defaults
  const {
    name = defaultStoreName,
    slug = defaultStoreSlug,
    // Use tagline if available, otherwise use a default description
    tagline,
    description: formDescription,
    bannerUrl = defaultBannerUrl,
    aboutImageUrl = defaultAboutImageUrl, // This field is missing from your form data
    aboutText = defaultAboutText, // This field is missing from your form data
    services: svcFromStore,
    Doctor: docFromStore,
    testimonials: tFromStore,
    faqs: faqFromStore,
    contactEmail: contactEmailFromStore,
    contactPhone: contactPhoneFromStore,
    address: addressFromStore,
    openingHours: openingHoursFromStore,
    geoLocation,
  } = siteData as any;

  // Combine tagline and description, prioritizing tagline
  const description = tagline || formDescription || "Your trusted partner in health and wellness. Providing compassionate and comprehensive care for the whole family.";

  // Use state to manage the data passed to components, defaulting to sample data if store data is null/empty
  const servicesData = svcFromStore && svcFromStore.length > 0 ? svcFromStore : sampleServices;
  const doctorsData = docFromStore && docFromStore.length > 0 ? docFromStore : sampleDoctors;
  const [testimonialsDataState, setTestimonialsDataState] = useState<any[]>(tFromStore && tFromStore.length > 0 ? tFromStore : sampleTestimonials);
  const [faqsDataState, setFaqsDataState] = useState<any[]>(faqFromStore && faqFromStore.length > 0 ? faqFromStore : sampleFaqs);

  // Update states when data is fetched
  useEffect(() => {
    if (testimonialsData?.data) {
      setTestimonialsDataState(testimonialsData.data);
    }
    if (faqsData?.data) {
      setFaqsDataState(faqsData.data);
    }
  }, [testimonialsData, faqsData]);

  // Merge default contact info with any provided from storeFormData
  const contactInfoData = {
    ...defaultContactInfo,
    phoneNumber: contactPhoneFromStore || defaultContactInfo.phoneNumber,
    email: contactEmailFromStore || defaultContactInfo.email,
    address: addressFromStore || defaultContactInfo.address,
    openingHours: openingHoursFromStore || defaultContactInfo.openingHours,
    // The mapLink is hardcoded to a default value, as your form doesn't provide it directly
  };


  return (
    <>
    
      <HealthcareHero heroSlides={pageData.heroSlides} slug={pageData.slug} themeSettings={pageData.themeSettings}/>

      <div className="font-sans">
        {/* About Section */}
        <AboutSection />

        {/* Medical Services Section */}
        <MedicalServicesSection services={servicesData} storeSlug={slug} />

        {/* Health Tips Section (if you have one, or repurpose 'services' for tips) */}
        <HealthTipsSection/>

        {/* Doctors Section */}
        <DoctorsSection doctors={doctorsData} storeSlug={slug} />

        {/* Patient Testimonials - Render when data is ready */}
        {testimonialsData?.data && <PatientSection name={name} slug={slug} testimonials={testimonialsDataState} />}

        {/* FAQs Section - Render when data is ready */}
        {faqsData?.data && <FAQsSection name={name} slug={slug} faqs={faqsDataState} />}

        {/* Contact Section */}
        <ContactSection
          storeSlug={slug}
          phoneNumber={contactInfoData.phoneNumber}
          email={contactInfoData.email}
          address={contactInfoData.address}
          openingHours={contactInfoData.openingHours}
          mapLink={contactInfoData.mapLink}
        />

        {/* Final Call to Action Section (Generic CTA at the bottom) */}
        <CTASection
          storeSlug={slug}
        />
      </div>
    </>
  );
}