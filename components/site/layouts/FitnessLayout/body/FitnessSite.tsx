import React, { useState, useEffect } from "react";

import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

// Sample data
const store = {
name: "Peak Performance Gym",
slug: "peak-performance",
bannerUrl: "/images/fitness-hero.jpg",
classes: [
{ id: "c1", name: "HIIT Blast", price: 1200, imageUrl: "/classes/hiit.jpg", slug: "hiit-blast" },
{ id: "c2", name: "Yoga Flow", price: 800, imageUrl: "/classes/yoga.jpg", slug: "yoga-flow" },
{ id: "c3", name: "Spin Session", price: 1000, imageUrl: "/classes/spin.jpg", slug: "spin-session" },
],
trainers: [
{ id: "t1", name: "Alex Carter", imageUrl: "/trainers/alex.jpg" },
{ id: "t2", name: "Mia Wong", imageUrl: "/trainers/mia.jpg" },
{ id: "t3", name: "Liam Patel", imageUrl: "/trainers/liam.jpg" },
{ id: "t4", name: "Sofia Lee", imageUrl: "/trainers/sofia.jpg" },
],
testimonials: [
{ quote: "I achieved my best shape ever!", author: "Jordan R." },
{ quote: "Trainers are super motivating.", author: "Taylor S." },
{ quote: "Love the community vibes here.", author: "Casey L." },
],
faqs: [
{ question: "Do you offer monthly memberships?", answer: "Yes, with flexible cancellation policy." },
{ question: "Can I try a class for free?", answer: "First class is complimentary for new members." },
{ question: "Are personal training sessions available?", answer: "Yes, book 1-on-1 sessions with top trainers." },
],
};


const programTypes = ['Yoga', 'CrossFit', 'Meditation', 'Personal Training'];
const Bannerlocations = ['New York', 'London', 'Online', 'Los Angeles'];
const goals = ['Weight Loss', 'Flexibility', 'Strength', 'Mindfulness'];

const formats = ['In-person', 'Live Online', 'On-demand'];
const intensities = ['Low', 'Medium', 'High'];
const durations = [15, 30, 45, 60];

const listings = [
  {
    "id": "1",
    "image": "/images/yoga.jpg",
    "title": "Sunrise Yoga Flow",
    "instructor": "Alex Morgan",
    "price": "$20/session",
    "badge": "New"
  },
  {
    "id": "2",
    "image": "/images/hiit.jpg",
    "title": "HIIT Blast",
    "instructor": "Jordan Smith",
    "price": "$25/session",
    "badge": "Popular"
  },
  {
    "id": "3",
    "image": "/images/spin.jpg",
    "title": "Spin Session",
    "instructor": "Mia Wong",
    "price": "$15/session",
    "badge": "On Sale"  
  },
  {
    "id": "4",
    "image": "/images/strength.jpg",
    "title": "Strength Training Basics",
    "instructor": "Liam Patel",
    "price": "$30/session",
    "badge": "New"
  },
  {
    "id": "5",
    "image": "/images/meditation.jpg",
    "title": "Guided Meditation for Beginners",
    "instructor": "Sofia Lee",
    "price": "$10/session",
    "badge": "Popular"
  },
  {
    "id": "6",
    "image": "/images/crossfit.jpg",
    "title": "CrossFit Fundamentals",
    "instructor": "Alex Carter",
    "price": "$35/session",
    "badge": "On Sale"
  } 
];

const locations = [
  {
    "id": "nyc-studio",
    "name": "NYC Studio",
    "image": "/images/nyc.jpg",
    "programs": 120,
    "rating": 4.8
  },
  {
    "id": "london-studio",
    "name": "London Studio",
    "image": "/images/london.jpg",
    "programs": 95,
    "rating": 4.7
  },
  {
    "id": "la-studio",
    "name": "Los Angeles Studio",
    "image": "/images/la.jpg",
    "programs": 80,
    "rating": 4.6
  },
  {
    "id": "online-classes",
    "name": "Online Classes",
    "image": "/images/online.jpg",
    "programs": 200,
    "rating": 4.9
  },
  {
    "id": "tokyo-studio",
    "name": "Tokyo Studio",
    "image": "/images/tokyo.jpg",
    "programs": 70,
    "rating": 4.5
  }
  
];

const videos = [
  {
    id: "1",
    thumbnail: "/images/yoga.jpg",
    title: "Sunrise Yoga Flow",
    src: "/videos/yoga.mp4",
    instructor: "Alex Morgan",
    price: "$20/session",
    badge: "New"
  },
  {
    id: "2",
    thumbnail: "/images/hiit.jpg",
    title: "HIIT Blast",
    src: "/videos/hiit.mp4",
    instructor: "Jordan Smith",
    price: "$25/session",
    badge: "Popular"
  },
  {
    id: "3",
    thumbnail: "/images/spin.jpg",
    title: "Spin Session",
    src: "/videos/spin.mp4",
    instructor: "Mia Wong",
    price: "$15/session",
    badge: "On Sale"  
  },
  {
    id: "4",
    thumbnail: "/images/strength.jpg",
    title: "Strength Training Basics",
    src: "/videos/strength.mp4",
    instructor: "Liam Patel",
    price: "$30/session",
    badge: "New"
  },
  {
    id: "5",
    thumbnail: "/images/meditation.jpg",
    title: "Guided Meditation for Beginners",
    src: "/videos/meditation.mp4",
    instructor: "Sofia Lee",
    price: "$10/session",
    badge: "Popular"
  },
  {
    id: "6",
    thumbnail: "/images/crossfit.jpg",
    title: "CrossFit Fundamentals",
    src: "/videos/crossfit.mp4",
    instructor: "Alex Carter",
    price: "$35/session",
    badge: "On Sale"
  },
];


const testimonials = [
  {
    "id": "t1",
    "name": "Jane Doe",
    "avatar": "/images/jane.jpg",
    "quote": "I lost 20 lbs in 3 months thanks to these amazing trainers!"
  },
  {
    "id": "t2",
    "name": "John Smith",
    "avatar": "/images/john.jpg",
    "quote": "The community here is so supportive, I love it!"
  },
  {
    "id": "t3",
    "name": "Emily Johnson",
    "avatar": "/images/emily.jpg",
    "quote": "Best fitness classes I've ever attended, highly recommend!"
  },
  {
    "id": "t4",
    "name": "Michael Brown",
    "avatar": "/images/michael.jpg",
    "quote": "The trainers are top-notch, they really know their stuff!"
  }  
];

const experts = [
  // {
  //   "id": "nyc-studio",
  //   "name": "NYC Studio",
  //   "image": "/images/nyc.jpg",
  //   "programs": 120,
  //   "rating": 4.8
  // },
  // {
  //   "id": "london-studio",
  //   "name": "London Studio",
  //   "image": "/images/london.jpg",
  //   "programs": 95,
  //   "rating": 4.7
  // },
  // {
  //   "id": "la-studio",
  //   "name": "Los Angeles Studio",
  //   "image": "/images/la.jpg",
  //   "programs": 80,
  //   "rating": 4.6
  // },
  // {
  //   "id": "online-classes",
  //   "name": "Online Classes",
  //   "image": "/images/online.jpg",
  //   "programs": 200,
  //   "rating": 4.9
  // },
  // {
  //   "id": "tokyo-studio",
  //   "name": "Tokyo Studio",
  //   "image": "/images/tokyo.jpg",
  //   "programs": 70,
  //   "rating": 4.5
  // },
  {
    "id": "expert1",
    "name": "Dr. Sarah Lee",
    "photo": "/images/sarah.jpg",
    "specialty": "Nutrition",
    "experience": 10
  },
  {
    "id": "expert2",
    "name": "Coach Mike Johnson",
    "photo": "/images/mike.jpg",
    "specialty": "Strength Training",
    "experience": 8
  },
  {
    "id": "expert3",
    "name": "Yoga Guru Priya",
    "photo": "/images/priya.jpg",
    "specialty": "Yoga & Mindfulness",
    "experience": 12
  }
  
];



const insights = [
  {
    "id": "calorie-calculator",
    "title": "Calorie Calculator",
    "description": "Estimate your daily calorie needs based on activity.",
    "link": "/tools/calorie-calculator"
  },
  {
    "id": "bmi-tracker",
    "title": "BMI Tracker",
    "description": "Track your Body Mass Index over time.",
    "link": "/tools/bmi-tracker"
  },
  {
    "id": "sleep-tips",
    "title": "5 Tips for Better Sleep",
    "description": "Improve your sleep quality with these expert tips.",
    "link": "/blog/sleep-tips"
  },
  {
    "id": "hydration-guide",
    "title": "Hydration Guide",
    "description": "Learn how much water you should drink daily.",
    "link": "/blog/hydration-guide"
  },
  {
    "id": "stress-management",
    "title": "Stress Management Techniques",
    "description": "Effective ways to manage stress and anxiety.",
    "link": "/blog/stress-management"
  }
];

type Insight = {
  id: string;
  title: string;
  description: string;
  link: string;
};

type Expert = {
  id: string;
  name: string;
  photo: string;
  specialty: string;
  experience: number;
};

type Testimonial = {
  id: string;
  name: string;
  avatar: string;
  quote: string;
};



type Video = {
  id: string;
  title: string;
  thumbnail: string;
  src: string;
};


type Location = {
  id: string;
  name: string;
  image: string;
  programs: number;
  rating: number;
};

type Listing = {
  id: string;
  image: string;
  title: string;
  instructor: string;
  price: string;
  badge?: 'New' | 'Popular' | 'On Sale';
};





const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
`${src}?w=${width}&q=${quality || 75}`;

export default function FitnessSite() {
const router = useRouter();
const [classes, setClasses] = useState<any[]>([]);
const [trainers, setTrainers] = useState<any[]>([]);
const [testimonials, setTestimonials] = useState<any[]>([]);
const [faqs, setFaqs] = useState<any[]>([]);

useEffect(() => {
setClasses(store.classes);
setTrainers(store.trainers);
setTestimonials(store.testimonials);
setFaqs(store.faqs);
}, []);

return ( 

  <div className="space-y-24 font-sans">
    
    {/* Hero Section */}
    <HeroSection />

    {/* Filter Bar */} 
    <FilterBar />

    {/* Listings Grid */}
    <ListingsGrid />

    <LocationsSection />

    <VirtualTours />

    <ExpertsSection />

    {/* Insights Section */}
    <MarketInsights />

    <Testimonials />

    <AppPromotion />

    <Newsletter />

    {/* FAQs */}
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 max-w-2xl">
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-10 text-gray-800">
          FAQs
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

  <Footer />

</div>

);
}

function HeroSection() {
  const [program, setProgram] = useState('Yoga');
  const [location, setLocation] = useState('New York');
  const [goal, setGoal] = useState('Weight Loss');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate search handler
    console.log({ program, location, goal });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/fitness-hero.mp4"
        autoPlay
        muted
        loop
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="mb-6 text-4xl md:text-6xl font-bold">
          Transform Your Body & Mind
        </h1>
        <p className="mb-8 text-lg md:text-2xl">
          Find the perfect fitness & wellness program near you.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mb-6 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4"
        >
          <select
            value={program}
            onChange={e => setProgram(e.target.value)}
            className="w-full md:w-1/4 p-3 rounded-2xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Program Type"
          >
            {programTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full md:w-1/4 p-3 rounded-2xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Location"
          >
            {Bannerlocations.map((loc:any) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            value={goal}
            onChange={e => setGoal(e.target.value)}
            className="w-full md:w-1/4 p-3 rounded-2xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Goal"
          >
            {goals.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-primary rounded-2xl font-semibold hover:bg-primary-dark transition"
          >
            Discover Programs
          </button>
        </form>

        <div className="flex space-x-4">
          <button className="px-5 py-2 bg-white bg-opacity-20 rounded-2xl hover:bg-opacity-30 transition">
            Browse Free Trials
          </button>
          <button className="px-5 py-2 bg-white bg-opacity-20 rounded-2xl hover:bg-opacity-30 transition">
            View Virtual Classes
          </button>
        </div>
      </motion.div>
    </section>
  );
}

function FilterBar() {
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [format, setFormat] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState<number>(42); // Mock count

  // Mock effect: update count when filters change
  useEffect(() => {
    // TODO: replace with real data filtering
    const count = Math.max(0, 100 - duration - priceRange[0] / 2);
    setMatchCount(count);
  }, [duration, priceRange]);

  const toggleSelection = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter(i => i !== value) : [...list, value]);
  };

  return (
    <motion.div
      className="sticky top-0 z-20 bg-white bg-opacity-80 backdrop-blur-md p-4 shadow-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Duration Slider */}
        <div className="flex flex-col">
          <label htmlFor="duration" className="text-sm font-medium text-gray-700">
            Duration (min)
          </label>
          <input
            id="duration"
            type="range"
            min={15}
            max={60}
            step={15}
            value={duration}
            onChange={e => setDuration(parseInt(e.target.value))}
            className="w-40 h-2 accent-primary"
            aria-valuetext={`${duration} minutes`}
          />
          <span className="text-xs text-gray-600">{duration} min</span>
        </div>

        {/* Intensity Toggles */}
        <div className="flex items-center space-x-2">
          {intensities.map(level => (
            <motion.button
              key={level}
              onClick={() => toggleSelection(level, intensity, setIntensity)}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1 rounded-full border transition-all text-sm font-medium
                ${intensity.includes(level)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300'}`}
            >
              {level}
            </motion.button>
          ))}
        </div>

        {/* Price Range Inputs */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Price ($)</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={priceRange[0]}
              onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
              className="w-16 p-1 border rounded-lg"
              aria-label="Min price"
            />
            <span>-</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], +e.target.value])}
              className="w-16 p-1 border rounded-lg"
              aria-label="Max price"
            />
          </div>
        </div>

        {/* Format Checkboxes */}
        <div className="flex items-center space-x-2">
          {formats.map(f => (
            <motion.label
              key={f}
              className="flex items-center space-x-1 text-sm cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <input
                type="checkbox"
                checked={format.includes(f)}
                onChange={() => toggleSelection(f, format, setFormat)}
                className="accent-primary"
              />
              <span className="select-none">{f}</span>
            </motion.label>
          ))}
        </div>

        {/* Match Count & Clear */}
        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            {matchCount} programs found
          </span>
          <button
            onClick={() => {
              setDuration(30);
              setIntensity([]);
              setPriceRange([0, 200]);
              setFormat([]);
            }}
            className="text-sm text-primary hover:underline"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ListingsGrid() {
  return (
    <section className="py-12 px-4 md:px-8 bg-gray-50">
      <h2 className="mb-8 text-3xl font-bold text-center">Featured Programs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((item: any) => (
          <motion.div
            key={item.id}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            whileHover={{ y: -5 }}
          >
            <div className="relative h-56 w-full">
              <Image
                src={item.image}
                alt={item.title}
                layout="fill"
                objectFit="cover"
                className="group-hover:scale-105 transform transition-transform"
                priority={false}
                loader={loader}
              />
              {item.badge && (
                <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full
                  ${item.badge === 'New' ? 'bg-green-500 text-white' : ''}
                  ${item.badge === 'Popular' ? 'bg-blue-500 text-white' : ''}
                  ${item.badge === 'On Sale' ? 'bg-red-500 text-white' : ''}`}
                >
                  {item.badge}
                </span>
              )}
            </div>

            <div className="p-4 flex flex-col space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600">Instructor: {item.instructor}</p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-primary font-bold">{item.price}</span>
                <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition">
                  Book Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function LocationsSection() {
  return (
    <section className="py-12 px-4 md:px-8">
      <h2 className="mb-6 text-3xl font-bold text-center">Trending Studios & Locations</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {locations.map((loc: Location) => (
          <motion.a
            key={loc.id}
            href={`#/locations/${loc.id}`}
            className="relative flex-shrink-0 w-64 h-40 rounded-2xl overflow-hidden shadow-md group"
            whileHover={{ scale: 1.03 }}
          >
            <Image
              src={loc.image}
              alt={loc.name}
              layout="fill"
              objectFit="cover"
              className="group-hover:brightness-75 transition"
              priority={false}
              loader={loader}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-semibold">{loc.name}</h3>
              <p className="text-sm">{loc.programs} programs</p>
              <p className="text-sm">⭐ {loc.rating.toFixed(1)}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

function VirtualTours() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  return (
    <section className="py-12 px-4 md:px-8 bg-gray-50">
      <h2 className="mb-6 text-3xl font-bold text-center">Virtual Classes & On-Demand Videos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((vid: Video) => (
          <motion.div
            key={vid.id}
            className="relative cursor-pointer overflow-hidden rounded-2xl shadow-md group"
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedVideo(vid)}
          >
            <div className="relative h-48 w-full">
              <Image
                src={vid.thumbnail}
                alt={vid.title}
                layout="fill"
                objectFit="cover"
                className="group-hover:brightness-75 transition"
                loader={loader}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="p-4 bg-white bg-opacity-80 rounded-full"
                  whileHover={{ scale: 1.1 }}
                >
                  {/* Play Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-6.386-3.692A1 1 0 007 8.345v7.31a1 1 0 001.366.932l6.386-3.692a1 1 0 000-1.798z" />
                  </svg>
                </motion.div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-md font-medium text-gray-900">{vid.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a href="#/videos" className="text-primary font-semibold hover:underline">
          See All Classes
        </a>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-11/12 max-w-3xl bg-white rounded-2xl overflow-hidden"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-700 hover:text-gray-900"
                onClick={() => setSelectedVideo(null)}
                aria-label="Close video"
              >
                &times;
              </button>
              <video
                src={selectedVideo.src}
                controls
                autoPlay
                className="w-full h-auto rounded-b-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ExpertsSection() {
  return (
    <section className="py-12 px-4 md:px-8">
      <h2 className="mb-6 text-3xl font-bold text-center">Meet the Coaches & Experts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts.map((exp: Expert) => (
          <motion.div
            key={exp.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col items-center text-center p-6"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="relative w-24 h-24 mb-4">
              <Image
                src={exp.photo}
                alt={exp.name}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
                priority={false}
                loader={loader}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{exp.name}</h3>
            <p className="text-sm text-gray-600">{exp.specialty}</p>
            <p className="text-sm text-gray-600">{exp.experience} years experience</p>
            <button className="mt-4 px-5 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition">
              Schedule a Call
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function MarketInsights() {
  return (
    <section className="py-12 px-4 md:px-8 bg-gray-50">
      <h2 className="mb-6 text-3xl font-bold text-center">Health Insights & Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((ins: Insight) => (
          <motion.a
            key={ins.id}
            href={ins.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{ins.title}</h3>
            <p className="text-gray-700 mb-4">{ins.description}</p>
            <span className="text-primary font-medium hover:underline">Learn More →</span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const [current, setCurrent] = useState(0);
  const length = testimonials.length;

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % length);
    }, 5000);
    return () => clearInterval(timer);
  }, [length]);

  const nextSlide = () => setCurrent((current + 1) % length);
  const prevSlide = () => setCurrent((current - 1 + length) % length);

  return (
    <section className="py-12 px-4 md:px-8">
      <h2 className="mb-6 text-3xl font-bold text-center">What Our Members Say</h2>
      <div className="relative max-w-xl mx-auto">
        <AnimatePresence>
          {testimonials.map((t, idx) => (
            idx === current && (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center bg-gray-50 p-8 rounded-2xl shadow-md"
              >
                <div className="relative w-20 h-20 mb-4">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                    loader={loader}
                  />
                </div>
                <p className="text-gray-800 italic mb-4">"{t.quote}"</p>
                <span className="block text-primary font-semibold">- {t.name}</span>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
          aria-label="Previous testimonial"
        >
          ‹
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
          aria-label="Next testimonial"
        >
          ›
        </button>

        {/* Dots */}
        <div className="mt-4 flex justify-center space-x-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full ${idx === current ? 'bg-primary' : 'bg-gray-300'}`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AppPromotion() {
  return (
    <section className="py-12 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-8">
        {/* Text Content */}
        <motion.div
          className="flex-1 text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4">Manage Your Workouts On The Go</h2>
          <p className="text-gray-700 mb-6">
            Download our mobile app to track your programs, join live classes, and
            stay motivated wherever you are.
          </p>
          <div className="flex justify-center lg:justify-start space-x-4">
            <a href="#" aria-label="Download on the App Store">
              <Image
                src="/images/app-store-badge.svg"
                alt="App Store Badge"
                width={150}
                height={50}
                priority={false}
                loader={loader}
              />
            </a>
            <a href="#" aria-label="Get it on Google Play">
              <Image
                src="/images/play-store-badge.svg"
                alt="Google Play Badge"
                width={150}
                height={50}
                priority={false}
                loader={loader}
              />
            </a>
          </div>
        </motion.div>

        {/* Mockup Images */}
        <motion.div
          className="flex-1 flex justify-center lg:justify-end space-x-4"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-40 h-80">
            <Image
              src="/images/app-mockup1.png"
              alt="App Mockup 1"
              layout="fill"
              objectFit="contain"
              loader={loader}
            />
          </div>
          <div className="relative w-40 h-80 hidden md:block">
            <Image
              src="/images/app-mockup2.png"
              alt="App Mockup 2"
              layout="fill"
              objectFit="contain"
              loader={loader}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate subscription API
    setSubscribed(true);
  };

  return (
    <section className="py-12 px-4 md:px-8 bg-primary text-white rounded-2xl mx-4 md:mx-8 lg:mx-16 mt-12">
      <div className="max-w-md mx-auto text-center">
        <motion.h2
          className="text-2xl font-bold mb-2"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Stay Updated
        </motion.h2>
        <p className="mb-6">Get weekly tips, deals, and new program alerts.</p>

        {subscribed ? (
          <p className="text-lg font-semibold">Thank you for subscribing!</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <motion.input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 p-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              aria-label="Email address"
            />
            <motion.button
              type="submit"
              className="px-6 py-3 bg-white text-primary rounded-full font-semibold hover:bg-gray-100 transition"
              whileHover={{ scale: 1.05 }}
            >
              Subscribe
            </motion.button>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <footer className="mt-12 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="space-y-2">
          <h4 className="font-semibold">Programs</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Yoga</a></li>
            <li><a href="#" className="hover:underline">CrossFit</a></li>
            <li><a href="#" className="hover:underline">Meditation</a></li>
            <li><a href="#" className="hover:underline">Personal Training</a></li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Resources</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Blog</a></li>
            <li><a href="#" className="hover:underline">FAQs</a></li>
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Legal</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Terms of Service</a></li>
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <a href="#" aria-label="Facebook" className="hover:text-blue-600">FB</a>
            <a href="#" aria-label="Instagram" className="hover:text-pink-500">IG</a>
            <a href="#" aria-label="Twitter" className="hover:text-blue-400">TW</a>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center space-x-2 text-sm p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
          >
            {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5 " />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm">
        &copy; {new Date().getFullYear()} Fitness & Wellness. All rights reserved.
      </div>
    </footer>
  );
}