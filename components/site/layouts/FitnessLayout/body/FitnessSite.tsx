"use client";

import React, { useState, useEffect, } from "react";
import { useRouter } from "next/navigation";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import Testimonials from "./components/TestimonialsSection";
import AppPromotion from "./components/AppPromotionSection";
import ExpertsSection from "./components/ExpertsSection";
import FaqsSection from "./components/FAQsSection";
import FilterBar from "./components/FilterBarSection";
import HeroSection from "./components/heroSection";
import ListingsGrid from "./components/ListingsGridSection";
import LocationsSection from "./components/LocationsSection";
import MarketInsights from "./components/MarketInsightsSection";
import Newsletter from "./components/NewsletterSection";
import VirtualTours from "./components/VirtualToursSection";

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
  
  
  
// Filter definitions (these remain static)
// const programTypes = ["Yoga", "CrossFit", "Meditation", "Personal Training"];
const bannerLocations = ["New York", "London", "Online", "Los Angeles"];
// const goals = ["Weight Loss", "Flexibility", "Strength", "Mindfulness"];
// const formats = ["In-person", "Live Online", "On-demand"];
// const intensities = ["Low", "Medium", "High"];
// const durations = [15, 30, 45, 60];

// Generic image loader
const loader = ({ src, width, quality }:any) => `${src}?w=${width}&q=${quality || 75}`;

export default function FitnessSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();

  // Local state arrays (populated from storeFormData on mount)
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [listings, setListings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [videos, setVideos] = useState([]);
  const [experts, setExperts] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (!storeFormData) return;

    // Pull everything out of storeFormData (assuming it has these fields)
    setClasses(classes || []);
    setTrainers(trainers || []);
    setTestimonials(testimonials || []);
    setFaqs(faqs || []);
    setListings(listings || []);
    setLocations(locations || []);
    setVideos(videos || []);
    setExperts(experts || []);
    setInsights(insights || []);
  }, [storeFormData]);

  if (!storeFormData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-24 font-sans">
      {/* Hero Section */}
      <HeroSection bannerUrl={storeFormData.bannerUrl} gymName={storeFormData.name} />

      {/* Filter Bar */}
      <FilterBar />

      {/* Listings Grid */}
      <ListingsGrid listings={listings} />

      {/* Trending Locations */}
      <LocationsSection locations={locations} />

      {/* Virtual Tours */}
      <VirtualTours videos={videos} />

      {/* Experts Section */}
      <ExpertsSection experts={experts} />

      {/* Insights Section */}
      <MarketInsights insights={insights} />

      {/* Testimonials */}
      <Testimonials testimonials={testimonials} />

      {/* App Promotion */}
      <AppPromotion />

      {/* Newsletter */}
      <Newsletter />

      {/* FAQs */}
      <FaqsSection />
    </div>
  );
}

















