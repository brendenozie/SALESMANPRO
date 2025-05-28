import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample data
const store = {
name: "WellSpring Clinic",
slug: "wellspring",
description: "Your health, our priority. Comprehensive care with a personal touch.",
bannerUrl: "/images/healthcare-hero.jpg",
services: [
{ id: "s1", name: "General Checkup", imageUrl: "/services/checkup.jpg", slug: "general-checkup" },
{ id: "s2", name: "Pediatric Care", imageUrl: "/services/pediatric.jpg", slug: "pediatric-care" },
{ id: "s3", name: "Dental Services", imageUrl: "/services/dental.jpg", slug: "dental-services" },
],
doctors: [
{ id: "d1", name: "Dr. Sarah Lee", subtitle: "General Physician", imageUrl: "/doctors/sarah.jpg" },
{ id: "d2", name: "Dr. Mark Chen", subtitle: "Pediatrician", imageUrl: "/doctors/mark.jpg" },
{ id: "d3", name: "Dr. Aisha Patel", subtitle: "Dentist", imageUrl: "/doctors/aisha.jpg" },
{ id: "d4", name: "Dr. James Kim", subtitle: "Cardiologist", imageUrl: "/doctors/james.jpg" },
],
testimonials: [
{ quote: "Exceptional care and friendly staff!", author: "Emily R." },
{ quote: "My family feels safe here.", author: "John D." },
],
faqs: [
{ question: "Do you accept insurance?", answer: "Yes, we work with most major providers." },
{ question: "Can I book appointments online?", answer: "Absolutely, use our online booking portal." },
],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
`${src}?w=${width}&q=${quality || 75}`;

export default function HealthCareSite() {
const router = useRouter();
const [services, setServices] = useState<any[]>([]);
const [doctors, setDoctors] = useState<any[]>([]);
const [testimonials, setTestimonials] = useState<any[]>([]);
const [faqs, setFaqs] = useState<any[]>([]);

useEffect(() => {
setServices(store.services);
setDoctors(store.doctors);
setTestimonials(store.testimonials);
setFaqs(store.faqs);
}, []);

return ( <div className="space-y-24 font-sans">
 {/* Hero Section  */}
<section className="relative h-[70vh] bg-gradient-to-br from-teal-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white overflow-hidden"> <Image
       src={store.bannerUrl}
       alt="Healthcare Hero"
       fill
       className="object-cover opacity-30"
       loader={loader}
     /> <div className="relative z-10 text-center px-6 max-w-lg">
<motion.h1
initial={{ y: -50, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.8 }}
className="text-5xl md\:text-7xl font-bold mb-4 leading-tight"
>
{store.name}
</motion.h1>
<motion.p
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.4 }}
className="text-lg md\:text-xl mb-8"
>
{store.description}
</motion.p>
<motion.button
onClick={() => router.push(`/${store.slug}/services`)}
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ delay: 0.6 }}
className="bg-white text-teal-700 font-semibold py-3 px-8 rounded-full shadow-lg hover\:shadow-2xl transition"
>
View Services
</motion.button> </div> </section>


  {/* Medical Services */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
        Our Medical Services
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((svc) => (
          <motion.div
            key={svc.id}
            whileHover={{ scale: 1.05 }}
            className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
            onClick={() => router.push(`/${store.slug}/service/${svc.slug}`)}
          >
            <div className="relative h-48">
              <Image src={svc.imageUrl} alt={svc.name} fill className="object-cover" loader={loader} />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{svc.name}</h3>
              <p className="text-teal-600 font-medium">Learn More</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Meet Our Doctors */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
        Meet Our Doctors
      </motion.h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {doctors.map((doc) => (
          <motion.div
            key={doc.id}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-lg text-center cursor-pointer"
          >
            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
              <Image src={doc.imageUrl} alt={doc.name} fill className="object-cover" loader={loader} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{doc.name}</h3>
            <p className="text-gray-600">{doc.subtitle}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Patient Testimonials */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6 text-center">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-12 text-gray-800">
        Patient Testimonials
      </motion.h2>
      <div className="max-w-2xl mx-auto space-y-8">
        {testimonials.map((t, i) => (
          <motion.blockquote
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 * i }}
            className="italic text-gray-700 text-lg"
          >
            “{t.quote}”<br />
            <span className="mt-2 block font-semibold text-gray-900">— {t.author}</span>
          </motion.blockquote>
        ))}
      </div>
    </div>
  </section>

  {/* Health FAQs */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6 max-w-3xl">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-10 text-gray-800">
        Health FAQs
      </motion.h2>
      <div className="space-y-4">
        {faqs.map((q, i) => (
          <motion.details key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + 0.1 * i }} className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer">
            <summary className="font-semibold text-gray-800">{q.question}</summary>
            <p className="mt-2 text-gray-600">{q.answer}</p>
          </motion.details>
        ))}
      </div>
    </div>
  </section>
</div>


);
}
