import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BriefcaseIcon, ScaleIcon, ChartBarIcon,
  ShieldCheckIcon,
  HandThumbUpIcon,
  ChevronLeftIcon, ChevronRightIcon
  ,ClockIcon,
  UsersIcon,
  CheckBadgeIcon, DocumentTextIcon, CalendarDaysIcon, 
} from '@heroicons/react/24/solid';

// Sample data
const store = {
name: "CapitalEdge Finance",
slug: "capitaledge",
bannerUrl: "/images/finance-hero.jpg",
metrics: [
{ label: "Clients Served", value: "500+" },
{ label: "Assets Managed", value: "\$10M+" },
{ label: "Expert Advisors", value: "20+" },
{ label: "Satisfaction Rate", value: "98%" },
],
services: [
{ id: "sv1", name: "Wealth Planning", imageUrl: "/services/wealth.jpg", slug: "wealth-planning" },
{ id: "sv2", name: "Investment Management", imageUrl: "/services/investment.jpg", slug: "investment-management" },
{ id: "sv3", name: "Retirement Solutions", imageUrl: "/services/retirement.jpg", slug: "retirement-solutions" },
],
testimonials: [
{ quote: "CapitalEdge guided me to financial freedom!", author: "Emily R." },
{ quote: "Professional and trustworthy advisors.", author: "Mark T." },
],
faqs: [
{ question: "How do I get started?", answer: "Schedule a free consultation using our contact form." },
{ question: "What fees do you charge?", answer: "We offer transparent, performance-based fees." },
],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
`${src}?w=${width}&q=${quality || 75}`;

export default function FinancSite() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
  setMetrics(store.metrics);
  setServices(store.services);
  setTestimonials(store.testimonials);
  setFaqs(store.faqs);
  }, []);

  return ( 
    <div className="space-y-24 font-sans">
        {/* Hero  */}
          <section
                className="relative flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white py-20 h-screen overflow-hidden"
                role="banner"
                aria-label="Finance Hero"
              >
                {/* Decorative SVG BG */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid slice"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="75" fill="url(#grad)" opacity="0.3" />
                </svg>

                <motion.div
                  className="relative z-10 text-center px-6 md:px-12 space-y-6 max-w-2xl"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                    Secure Your Financial Future Today
                  </h1>
                  <p className="text-base md:text-lg text-white/90">
                    Expert legal and financial advisory services tailored to your needs. Trust our team to navigate complex regulations and optimize your wealth.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                    <motion.a
                      href="#services"
                      className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl transition"
                      whileHover={{ scale: 1.05 }}
                      aria-label="Our Services"
                    >
                      Our Services
                    </motion.a>
                    <motion.a
                      href="#contact"
                      className="inline-block bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-blue-600 transition"
                      whileHover={{ scale: 1.05 }}
                      aria-label="Contact Us"
                    >
                      Contact Us
                    </motion.a>
                  </div>
                </motion.div>
          </section>

          <PracticeAreasSection />

          {/* Why Choose Us */}
          <WhyChooseUsSection />

          <CaseStudiesTestimonials />

          <ProcessWorkflowSection />

          {/* Metrics */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {metrics.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * i }}
                >
                  <h3 className="text-4xl font-bold text-gray-800">{m.value}</h3>
                  <p className="mt-2 text-gray-600">{m.label}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Services */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
                Our Financial Services
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((svc, i) => (
                  <motion.div
                    key={svc.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                    onClick={() => router.push(`/${store.slug}/service/${svc.slug}`)}
                  >
                    <div className="relative h-48">
                      <Image src={svc.imageUrl} alt={svc.name} fill className="object-cover" loader={loader} />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{svc.name}</h3>
                      <p className="text-green-600 font-medium">View Details</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
            >
              Meet Our Experts
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Ava Richardson",
                  role: "Senior Legal Advisor",
                  img: "/team/ava.jpg",
                  bio: "20+ years in corporate and financial law.",
                },
                {
                  name: "Liam Patel",
                  role: "Tax & Compliance Specialist",
                  img: "/team/liam.jpg",
                  bio: "Expert in international tax regulations.",
                },
                {
                  name: "Sophia Lee",
                  role: "Financial Consultant",
                  img: "/team/sophia.jpg",
                  bio: "Helping clients grow wealth responsibly.",
                },
              ].map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 text-center"
                >
                  <div className="w-28 h-28 mx-auto mb-4">
                    <Image
                      src={member.img}
                      alt={member.name}
                      width={112}
                      height={112}
                      className="rounded-full object-cover"
                      loader={loader}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-indigo-600 font-medium dark:text-indigo-400 mb-2">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
          </section>

          <section className="py-16 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
              >
                Consultation Packages
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Starter",
                    price: "$199",
                    frequency: "per session",
                    features: [
                      "30-minute consultation",
                      "One legal document review",
                      "Basic financial advice",
                    ],
                    featured: false,
                  },
                  {
                    title: "Professional",
                    price: "$499",
                    frequency: "per month",
                    features: [
                      "2 consultations/month",
                      "Document drafting support",
                      "Tax & compliance guidance",
                      "Priority email support",
                    ],
                    featured: true,
                  },
                  {
                    title: "Enterprise",
                    price: "Contact Us",
                    frequency: "",
                    features: [
                      "Unlimited consultations",
                      "Dedicated legal advisor",
                      "Custom compliance packages",
                      "Full access to tools & insights",
                    ],
                    featured: false,
                  },
                ].map((plan, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className={`rounded-2xl p-6 shadow-md transition ${
                      plan.featured
                        ? "bg-indigo-600 text-white border-2 border-indigo-500"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                    <p className="text-4xl font-semibold mb-1">{plan.price}</p>
                    <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">{plan.frequency}</p>
                    <ul className="space-y-2 mb-6 text-sm">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2 text-green-500">✔️</span> {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 px-4 rounded-full font-medium transition ${
                        plan.featured
                          ? "bg-white text-indigo-600 hover:bg-gray-100"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {plan.price === "Contact Us" ? "Request Quote" : "Get Started"}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-6 max-w-4xl">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
              >
                Frequently Asked Questions
              </motion.h2>

              <div className="space-y-4">
                {[
                  {
                    question: "What services do you offer for small businesses?",
                    answer:
                      "We provide tailored legal and financial consultations, including tax structuring, compliance, and business formation advice.",
                  },
                  {
                    question: "Can I schedule a free initial consultation?",
                    answer:
                      "Yes, we offer a complimentary 15-minute call to discuss your needs and how we can help.",
                  },
                  {
                    question: "Are your services available remotely?",
                    answer:
                      "Absolutely! Our consultations and document reviews are conducted online for your convenience.",
                  },
                  {
                    question: "How do you ensure client confidentiality?",
                    answer:
                      "We follow strict legal standards and use encrypted platforms to keep all client data secure.",
                  },
                ].map((faq, i) => (
                  <motion.details
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 cursor-pointer group"
                  >
                    <summary className="font-semibold text-gray-800 dark:text-white flex justify-between items-center">
                      <span>{faq.question}</span>
                      <span className="transform transition-transform group-open:rotate-45 text-indigo-600 text-2xl">+</span>
                    </summary>
                    <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                  </motion.details>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-indigo-600 text-white">
            <div className="container mx-auto px-6 max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
                <p className="text-white/90">
                  Have a legal or financial question? Reach out and our experts will respond shortly.
                </p>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full p-3 rounded-xl text-gray-900"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full p-3 rounded-xl text-gray-900"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Subject"
                    className="w-full p-3 rounded-xl text-gray-900"
                    required
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full p-3 rounded-xl text-gray-900"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition"
                  >
                    Send Message
                  </button>
                </form>
              </motion.div>

              {/* Embedded Map */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="w-full h-96 rounded-2xl overflow-hidden shadow-lg"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.106327684502!2d-122.40158458497722!3d37.78735997975782!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064d6b89e67%3A0xa1816cc2625a7a99!2sFinancial%20District%2C%20San%20Francisco%2C%20CA%2094105%2C%20USA!5e0!3m2!1sen!2s!4v1616622280870!5m2!1sen!2s"
                  loading="lazy"
                  allowFullScreen
                  className="w-full h-full border-none"
                ></iframe>
              </motion.div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-6 text-center">
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-12 text-gray-800">
                Client Testimonials
              </motion.h2>
              <div className="max-w-3xl mx-auto space-y-8">
                {testimonials.map((t, i) => (
                  <motion.blockquote
                    key={i}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 * i }}
                    className="italic text-gray-700 text-lg"
                  >
                    “{t.quote}”<br /><span className="mt-2 block font-semibold text-gray-900">— {t.author}</span>
                  </motion.blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6 max-w-2xl">
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-10 text-gray-800">
                Frequently Asked Questions
              </motion.h2>
              <div className="space-y-6">
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

const services = [
  {
    id: 1,
    icon: BriefcaseIcon,
    title: 'Corporate Law',
    description: 'Mergers, acquisitions, and governance advice to keep your business compliant.',
  },
  {
    id: 2,
    icon: ScaleIcon,
    title: 'Litigation',
    description: 'Aggressive representation in civil and commercial disputes.',
  },
  {
    id: 3,
    icon: ChartBarIcon,
    title: 'Financial Planning',
    description: 'Strategic tax planning, wealth management, and retirement solutions.',
  },
];

function PracticeAreasSection() {
  return (
    <section id="services" className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-12">
          Our Practice Areas
        </h2>

        {/* Grid 2–3 columns */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <motion.div
              key={s.id}
              className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <s.icon className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {s.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


const features = [
  {
    id: 1,
    icon: ShieldCheckIcon,
    title: 'Trusted Expertise',
    description: 'Over 20 years of combined legal and financial experience.',
  },
  {
    id: 2,
    icon: HandThumbUpIcon,
    title: 'Personalized Service',
    description: 'Tailored solutions designed around your unique goals.',
  },
  {
    id: 3,
    icon: ClockIcon,
    title: 'Timely Communication',
    description: 'We respect your time—fast responses & clear updates.',
  },
  {
    id: 4,
    icon: UsersIcon,
    title: 'Client-Focused',
    description: 'Your satisfaction is our top priority, every step of the way.',
  },
];

function WhyChooseUsSection() {
  return (
    <section id="usps" className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-12">
          Why Choose Us
        </h2>

        {/* Feature List Grid */}
        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.2 * i, duration: 0.6 }}
            >
              <f.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


// Mock data
const testimonials = [
  {
    id: 1,
    quote: 'Their team delivered exceptional results, increasing my ROI by 150%!',
    author: 'John Doe, CEO of Acme Corp',
    avatarUrl: '/avatars/john.jpg',
  },
  {
    id: 2,
    quote: 'Highly professional and detail-oriented—our go-to advisors.',
    author: 'Jane Smith, Founder of FinEdge',
    avatarUrl: '/avatars/jane.jpg',
  },
  {
    id: 3,
    quote: 'Impressive legal expertise that saved us thousands in litigation.',
    author: 'Mark Lee, CTO of TechFlow',
    avatarUrl: '/avatars/mark.jpg',
  },
];

function CaseStudiesTestimonials() {
  const [index, setIndex] = React.useState(0);
  const length = testimonials.length;

  const prev = () => setIndex((index - 1 + length) % length);
  const next = () => setIndex((index + 1) % length);

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8">
          What Our Clients Say
        </h2>

        <div className="relative max-w-2xl mx-auto">
          <AnimatePresence initial={false}>
            {testimonials.map((t, i) =>
              i === index && (
                <motion.div
                  key={t.id}
                  className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-lg"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col items-center">
                    <Image
                      src={t.avatarUrl}
                      alt={t.author}
                      width={80}
                      height={80}
                      className="rounded-full mb-4"
                      loader={loader}
                    />
                    <p className="italic text-gray-700 dark:text-gray-200 mb-4">“{t.quote}”</p>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      — {t.author}
                    </span>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>

          {/* Controls */}
          <button
            onClick={prev}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400"
            aria-label="Next"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </button>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    id: 1,
    icon: DocumentTextIcon,
    title: 'Consultation',
    description: 'Discuss your needs and goals with our experts to create a tailored plan.',
  },
  {
    id: 2,
    icon: CalendarDaysIcon,
    title: 'Planning',
    description: 'Receive a clear roadmap and timeline for your legal or financial project.',
  },
  {
    id: 3,
    icon: CheckBadgeIcon,
    title: 'Execution',
    description: 'Our team implements the strategy with attention to detail and compliance.',
  },
  {
    id: 4,
    icon: HandThumbUpIcon,
    title: 'Delivery',
    description: 'Review results and ongoing support to ensure lasting success.',
  },
];

function ProcessWorkflowSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-12">
          Our Process
        </h2>

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between">
          {/* Vertical line for desktop */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full border-l-2 border-gray-200 dark:border-gray-700" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLeft = idx % 2 === 0;
            return (
              <motion.div
                key={step.id}
                className={`relative flex-1 mb-12 md:mb-0 md:w-1/4 flex flex-col items-center text-center px-4 ${isLeft ? 'md:pr-8 md:items-end md:text-right' : 'md:pl-8 md:items-start md:text-left'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
              >
                {/* Step Icon */}
                <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                {/* Connector dot */}
                <div className="hidden md:block absolute top-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-full w-4 h-4" />

                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


