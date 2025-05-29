import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ArrowRightIcon from "@heroicons/react/24/outline/ArrowRightIcon";
import { BellIcon, CalendarIcon, CheckCircleIcon, ChevronDownIcon, FaceSmileIcon, MagnifyingGlassIcon, MapPinIcon, TagIcon, TicketIcon } from "@heroicons/react/24/outline";
import { ToastIcon } from "react-hot-toast";

// Sample data
const store = {
name: "VibrantEvents",
slug: "vibrantevents",
description: "Join the most exciting events around you.",
bannerUrl: "/images/events-hero.jpg",
categories: [
{ id: 1, name: "Music", slug: "music", icon: "/icons/music.svg" },
{ id: 2, name: "Art", slug: "art", icon: "/icons/art.svg" },
{ id: 3, name: "Tech", slug: "tech", icon: "/icons/tech.svg" },
{ id: 4, name: "Wellness", slug: "wellness", icon: "/icons/wellness.svg" },
],
upcoming: [
{ id: "e1", name: "Summer Beats Festival", date: "2025-06-15", subtitle: "Live music under the stars.", imageUrl: "/events/beatfest.jpg", slug: "summer-beats" },
{ id: "e2", name: "Art & Wine Night", date: "2025-07-05", subtitle: "Sip and create masterpieces.", imageUrl: "/events/artwine.jpg", slug: "art-wine" },
{ id: "e3", name: "Tech Innovators Summit", date: "2025-08-20", subtitle: "Where ideas meet reality.", imageUrl: "/events/techsummit.jpg", slug: "tech-summit" },
],
testimonials: [
{ quote: "Best event experience ever!", author: "Alex P." },
{ quote: "Unforgettable memories.", author: "Jamie L." },
],
faqs: [
{ question: "Can I get a refund?", answer: "Full refunds available up to 48 hours before the event." },
{ question: "Are events kid-friendly?", answer: "Family-friendly sections available in select events." },
],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
`${src}?w=${width}&q=${quality || 75}`;

export default function EventsSite() {
const router = useRouter();
const [categories, setCategories] = useState<any[]>([]);
const [upcoming, setUpcoming] = useState<any[]>([]);
const [testimonials, setTestimonials] = useState<any[]>([]);
const [faqs, setFaqs] = useState<any[]>([]);

useEffect(() => {
setCategories(store.categories);
setUpcoming(store.upcoming);
setTestimonials(store.testimonials);
setFaqs(store.faqs);
}, []);

return ( <div className="space-y-24 font-sans">
{/* Hero */}
<section className="relative h-[70vh] bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600 flex items-center justify-center text-white overflow-hidden"> <Image
       src={store.bannerUrl}
       alt="Events Hero"
       fill
       className="object-cover opacity-30"
       loader={loader}
     /> <div className="relative z-10 text-center px-6 max-w-xl">
<motion.h1
initial={{ y: -40, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.8 }}
className="text-5xl md\:text-7xl font-bold mb-4 leading-tight"
>
{store.name} Events
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
onClick={() => router.push(`/${store.slug}/events`)}
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ delay: 0.6 }}
className="bg-white text-indigo-700 font-semibold py-3 px-8 rounded-full shadow-lg hover\:shadow-2xl transition"
>
Explore Events
</motion.button> </div> </section>


  {/* Categories */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
        Event Categories
      </motion.h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            whileHover={{ scale: 1.1 }}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => router.push(`/${store.slug}/category/${cat.slug}`)}
          >
            <div className="w-16 h-16 mb-3">
              <Image src={cat.icon} alt={cat.name} width={64} height={64} loader={loader} />
            </div>
            <p className="text-lg font-medium text-gray-800">{cat.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Upcoming Events */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
        Upcoming Events
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {upcoming.map((ev) => (
          <motion.div
            key={ev.id}
            whileHover={{ y: -10 }}
            className="bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer"
            onClick={() => router.push(`/${store.slug}/event/${ev.slug}`)}
          >
            <div className="relative h-56">
              <Image src={ev.imageUrl} alt={ev.name} fill className="object-cover" loader={loader} />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">{ev.name}</h3>
              <p className="text-indigo-600 font-medium">{new Date(ev.date).toLocaleDateString()}</p>
              <p className="mt-2 text-gray-700">{ev.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Attendee Reviews */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6 text-center">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-12 text-gray-800">
        Attendee Reviews
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

  {/* FAQs */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6 max-w-3xl">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-10 text-gray-800">
        FAQs
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

  <EventsLandingPage />

  {/* Footer */}  
</div>



);
}


function EventsLandingPage() {
  return (
    <div className="font-sans">

      {/* Hero Section */}
      <HeroComponent />

      {/* About Section */}
      <AboutSection />

      <FeaturesSection />

      <HowItWorksSection />

      <LiveEventsSection />

      {/* Upcoming Events */}
      <section id="upcoming" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Upcoming Highlights</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white shadow-md rounded-2xl overflow-hidden">
                <Image src={`/images/event${i}.jpg`} alt={`Event ${i}`} width={400} height={300} className="w-full object-cover" loader={loader}/>
                <div className="p-6 text-left">
                  <h3 className="text-2xl font-semibold mb-2">Event Name {i}</h3>
                  <p className="text-sm text-gray-600">Date: June {10 + i}, 2025</p>
                  <p className="text-sm text-gray-600">Location: City Hall</p>
                  <p className="text-indigo-600 font-bold mt-2">From $49</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <PricingSection />

      {/* Testimonials */}
      <section className="py-20 bg-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12">What Attendees Say</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2].map((i) => (
              <blockquote key={i} className="p-6 border-l-4 border-indigo-600 bg-gray-50 rounded-md">
                <p className="italic mb-2">“Absolutely loved the atmosphere and organization. Can’t wait for the next one!”</p>
                <footer className="text-sm font-semibold">— Attendee {i}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <FAQSection />

      {/* Call To Action */}
      <section className="bg-indigo-600 text-white py-16 text-center relative">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Host With Us</h3>
        <p className="text-lg mb-6">Planning an event? Let us help you make it extraordinary.</p>
        <Link href="/host" className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-indigo-100 transition">
          Get Started
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 px-6 text-center">
        <p className="text-lg">Contact: info@eventsco.com</p>
        <p className="mt-2">Follow us on social media for updates</p>
        <div className="mt-4 flex justify-center space-x-6">
          <Link href="#">Facebook</Link>
          <Link href="#">Instagram</Link>
          <Link href="#">Twitter</Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">© 2025 Events Co.</p>
      </footer>
    </div>
  );
}

function HeroComponent() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
            Welcome to <span className="text-yellow-300">Your Future</span>
          </h1>
          <p className="text-lg sm:text-xl mb-8 text-white/90">
            Discover the tools you need to level up your life and business. Intuitive, powerful, and beautifully designed for your success.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button  className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300">
              Get Started
            </button>
            <button 
              className="border-white text-white hover:bg-white hover:text-indigo-700 font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300"
              onClick={() => window.open("https://example.com/learn-more", "_blank")}
            >
              Learn More <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="relative"
        >
          <img
            src="/images/hero-image.png"
            alt="Hero"
            className="w-full max-w-md mx-auto md:mx-0 animate-float drop-shadow-xl"
          />
        </motion.div>
      </div>

      {/* Floating Decorative Element */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-pink-500/20 rounded-full filter blur-3xl z-0"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-yellow-400/10 rounded-full filter blur-2xl z-0"></div>
    </section>
  );
}


function AboutSection() {
  return (
    <section className="bg-white dark:bg-gray-900 py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Image */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <img
            src="/images/about-us.png"
            alt="About"
            className="w-full rounded-3xl shadow-lg"
          />
        </motion.div>

        {/* Right Text */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Who <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">We Are</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            We're a passionate team dedicated to building modern digital solutions that are fast, elegant, and efficient. With a focus on user experience and performance, we empower individuals and businesses to unlock their full potential.
          </p>
          <ul className="space-y-3 text-gray-700 dark:text-gray-200">
            <li className="flex items-start">
              <span className="mr-3 text-indigo-500">✔</span> Innovative and user-focused approach
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-indigo-500">✔</span> Driven by quality and results
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-indigo-500">✔</span> Global reach with a local touch
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: <CalendarIcon className="w-8 h-8 text-indigo-600" />,
    title: "Easy Event Booking",
    description: "Find and reserve your spot at events in just a few clicks. No hassle, no confusion.",
  },
  {
    icon: <MapPinIcon className="w-8 h-8 text-indigo-600" />,
    title: "Local & Global Listings",
    description: "Browse events near you or explore happenings around the world—instantly.",
  },
  {
    icon: <TicketIcon className="w-8 h-8 text-indigo-600" />,
    title: "Secure Ticketing",
    description: "Buy, store, and scan your tickets with confidence using our secure platform.",
  },
  {
    icon: <BellIcon className="w-8 h-8 text-indigo-600" />,
    title: "Real-Time Reminders",
    description: "Get notified before events start so you never miss out on the action.",
  },
];

function FeaturesSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4"
        >
          Why Choose Our Platform?
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Whether you're an attendee or an organizer, we’ve built tools to make your events smooth, exciting, and unforgettable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow hover:shadow-lg transition-all duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    icon: <MagnifyingGlassIcon className="w-8 h-8 text-purple-600" />,
    title: "Find Events",
    description:
      "Browse trending, upcoming, and local events tailored to your interests. Filter by category, date, or location.",
  },
  {
    icon: <CalendarIcon className="w-8 h-8 text-purple-600" />,
    title: "Book or Create",
    description:
      "Easily book your spot or create your own event in minutes using our intuitive dashboard.",
  },
  {
    icon: <FaceSmileIcon className="w-8 h-8 text-purple-600" />,
    title: "Enjoy the Experience",
    description:
      "Attend, network, or host—our tools make every step of the event journey seamless and fun.",
  },
];

function HowItWorksSection() {
  return (
    <section className="bg-white dark:bg-gray-950 py-20 px-4 sm:px-10">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6"
        >
          How It Works
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
          Getting started is easy. Whether you're here to discover or organize, we’ve got you covered in three simple steps.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-300"
            >
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const events = [
  {
    title: "Nairobi Tech Festival 2025",
    date: "June 15, 2025",
    location: "KICC, Nairobi",
    image:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4d90?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Afrobeats Music Carnival",
    date: "July 3, 2025",
    location: "Uhuru Gardens, Nairobi",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Creative Design Expo",
    date: "August 22, 2025",
    location: "Sarit Expo Centre, Nairobi",
    image:
      "https://images.unsplash.com/photo-1585128792020-9662878b4ad2?auto=format&fit=crop&w=800&q=80",
  },
];

function LiveEventsSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-white mb-10"
        >
          Featured Live Events
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <img
                src={event.image}
                alt={event.title}
                className="h-52 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  📅 {event.date}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  📍 {event.location}
                </p>
                <a
                  href="#"
                  className="inline-block mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  View Event
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    name: "Linda Mwangi",
    role: "Event Organizer",
    quote:
      "The platform made it so easy to manage my event. From ticketing to attendee check-ins, everything was seamless!",
    image:
      "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Brian Otieno",
    role: "Attendee",
    quote:
      "I discovered amazing local events I wouldn't have found otherwise. Booking was fast and simple!",
    image:
      "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    name: "Amina Said",
    role: "Sponsor Partner",
    quote:
      "We reached thousands of new customers through sponsored events. The exposure and analytics were impressive.",
    image:
      "https://randomuser.me/api/portraits/women/43.jpg",
  },
];

function TestimonialsSection() {
  return (
    <section className="bg-white dark:bg-gray-950 py-20 px-4 sm:px-10">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6"
        >
          What People Are Saying
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-xl mx-auto">
          Real stories from organizers, attendees, and partners who’ve used our platform to create memorable experiences.
        </p>

        <div className="grid gap-10 md:grid-cols-3 text-left">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl shadow hover:shadow-md transition"
            >
              <TagIcon className="text-purple-600 w-6 h-6 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                “{testimonial.quote}”
              </p>
              <div className="flex items-center gap-4 mt-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                />
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    title: "Starter",
    price: "Free",
    description: "Perfect for new organizers testing the platform.",
    features: [
      "Host up to 1 event/month",
      "100 RSVPs",
      "Basic analytics",
      "Email support",
    ],
    highlighted: false,
  },
  {
    title: "Pro",
    price: "$29/mo",
    description: "For active organizers hosting multiple events.",
    features: [
      "Unlimited events",
      "Up to 5,000 RSVPs/month",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
    highlighted: true,
  },
  {
    title: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for agencies or enterprises.",
    features: [
      "Unlimited everything",
      "Dedicated account manager",
      "API access",
      "White-label solution",
    ],
    highlighted: false,
  },
];

function PricingSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6"
        >
          Flexible Plans for Every Organizer
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-300 mb-14 max-w-2xl mx-auto">
          Whether you're just starting out or managing major festivals, our pricing is built to scale with you.
        </p>

        <div className="grid gap-10 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`rounded-2xl p-8 shadow-lg border ${
                plan.highlighted
                  ? "bg-indigo-600 text-white border-indigo-700"
                  : "bg-white dark:bg-gray-900 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800"
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
              <p className="text-3xl font-semibold mb-4">{plan.price}</p>
              <p className="text-sm mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`inline-block w-full py-2 px-4 rounded-md text-center font-medium transition ${
                  plan.highlighted
                    ? "bg-white text-indigo-600 hover:bg-gray-100"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {plan.title === "Enterprise" ? "Contact Us" : "Get Started"}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


const faqs = [
  {
    question: "How do I create an event?",
    answer:
      "Sign up as an organizer, click on 'Create Event', and fill in your event details. Once published, attendees can start registering instantly.",
  },
  {
    question: "Is there a free plan for event hosting?",
    answer:
      "Yes! Our Starter plan lets you host 1 free event per month with up to 100 RSVPs. Upgrade any time for more features.",
  },
  {
    question: "Can I customize my event page?",
    answer:
      "Absolutely! You can add custom images, descriptions, ticket types, and even use your brand colors with the Pro plan.",
  },
  {
    question: "How are payments handled?",
    answer:
      "We support secure payments via Stripe and M-Pesa. Funds are transferred to your account after ticket sales are processed.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index:any) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white dark:bg-gray-950 py-20 px-4 sm:px-10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12">
          Everything you need to know about using our platform.
        </p>

        <div className="space-y-6 text-left">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-gray-200 dark:border-gray-800 pb-4"
            >
              <button
                onClick={() => toggle(index)}
                className="flex items-center justify-between w-full text-left text-lg font-medium text-gray-800 dark:text-white focus:outline-none"
              >
                {faq.question}
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="mt-3 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
