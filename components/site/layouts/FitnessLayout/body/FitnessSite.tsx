"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
// Assuming useStoreContext provides a way to get global data,
// but for this example, we'll use local dummy data.
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

// Import your enhanced components
import TestimonialsSection from "./components/TestimonialsSection"; // Renamed for clarity
import AppPromotionSection from "./components/AppPromotionSection"; // Renamed for clarity
import FaqsSection from "./components/FAQsSection"; // Renamed for clarity
import ExpertsSection from "./components/ExpertsSection";
import FilterBar from "./components/FilterBarSection";
import GallerySection from "./components/GallerySection";
import HeroSection from "./components/heroSection";
import ListingsGrid from "./components/ListingsGridSection";
import LocationsSection from "./components/LocationsSection";
import MarketInsights from "./components/MarketInsightsSection";
import NewsletterSection from "./components/NewsletterSection"; // Renamed for clarity
import VirtualTours from "./components/VirtualToursSection";

// --- Sample Data Definitions (Aligned with enhanced component props) ---

// Testimonial Item Structure (as defined in TestimonialsSection)
interface TestimonialItem {
    id: string;
    quote: string;
    name: string;
    avatar: string;
    title?: string;
    program?: string;
    rating: number;
}

// FAQ Item Structure (as defined in FaqsSection)
interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category?: string;
}

// Expert Item Structure
interface Expert {
    id: string;
    name: string;
    photo: string; // Changed from 'image' to 'photo' for clarity in ExpertsSection
    specialty: string;
    experience: number;
    bio?: string; // Added for more detail in ExpertsSection
    socials?: {
        twitter?: string;
        linkedin?: string;
        instagram?: string;
    };
}

// Listing Item Structure
interface Listing {
    id: string;
    image: string;
    title: string;
    instructor: string;
    price: string;
    badge?: 'New' | 'Popular' | 'On Sale';
    description?: string; // Added for more detail if needed in ListingsGrid
    rating?: number; // Added for more detail if needed in ListingsGrid
}

// Location Item Structure
interface Location {
    id: string;
    name: string;
    image: string;
    programs: number;
    rating: number;
    description?: string; // Added for more detail in LocationsSection
}

// Video Item Structure (for Virtual Tours)
interface Video {
    id: string;
    title: string;
    thumbnail: string;
    src: string;
    instructor: string; // Keeping instructor and price for consistency from listings
    price: string;
    badge?: 'New' | 'Popular' | 'On Sale';
    description?: string; // Added for more detail in VirtualTours
}

// Insight Item Structure (for Market Insights)
interface Insight {
    id: string;
    title: string;
    description: string;
    link: string;
    image?: string; // Added for visual appeal in MarketInsights
    category?: string; // Added for better filtering/categorization
}


// --- Comprehensive Dummy Data ---
const DUMMY_DATA = {
    // Hero Section Data
    gymName: "Zenith Fitness Hub",
    bannerUrl: "/images/fitness-hero.jpg", // Ensure this image exists

    // Filter Bar Data
    programTypes: ['Yoga', 'CrossFit', 'Meditation', 'Personal Training', 'Pilates', 'Zumba'],
    bannerLocations: ['New York', 'London', 'Online', 'Los Angeles', 'Sydney', 'Berlin'],
    goals: ['Weight Loss', 'Flexibility', 'Strength', 'Mindfulness', 'Endurance', 'Recovery'],
    formats: ['In-person', 'Live Online', 'On-demand', 'Hybrid'],
    intensities: ['Low', 'Medium', 'High', 'All Levels'],
    durations: [15, 30, 45, 60, 90],

    // Listings Grid Data
    listings: [
        {
            "id": "1",
            "image": "/images/yoga-listing.jpg", // Ensure images exist
            "title": "Sunrise Yoga Flow",
            "instructor": "Alex Morgan",
            "price": "$20/session",
            "badge": "New",
            "description": "Start your day with a calming and invigorating yoga sequence.",
            "rating": 4.9,
        },
        {
            "id": "2",
            "image": "/images/hiit-listing.jpg",
            "title": "HIIT Blast: Full Body Burn",
            "instructor": "Jordan Smith",
            "price": "$25/session",
            "badge": "Popular",
            "description": "High-intensity interval training designed to push your limits and maximize fat burn.",
            "rating": 4.8,
        },
        {
            "id": "3",
            "image": "/images/spin-listing.jpg",
            "title": "Spin Cycle Express",
            "instructor": "Mia Wong",
            "price": "$18/session",
            "badge": "On Sale",
            "description": "Fast-paced indoor cycling to boost cardio and leg strength. Ride to the beat!",
            "rating": 4.7,
        },
        {
            "id": "4",
            "image": "/images/strength-listing.jpg",
            "title": "Strength Building Fundamentals",
            "instructor": "Liam Patel",
            "price": "$30/session",
            "badge": "New",
            "description": "Learn proper form and build foundational strength for all fitness levels.",
            "rating": 4.9,
        },
        {
            "id": "5",
            "image": "/images/meditation-listing.jpg",
            "title": "Mindful Meditation & Relaxation",
            "instructor": "Sofia Lee",
            "price": "$15/session",
            "badge": "Popular",
            "description": "Find your inner peace with guided meditation techniques for stress relief.",
            "rating": 5.0,
        },
        {
            "id": "6",
            "image": "/images/crossfit-listing.jpg",
            "title": "CrossFit Core Power",
            "instructor": "Alex Carter",
            "price": "$35/session",
            "badge": "On Sale",
            "description": "Dynamic, functional movements to improve overall fitness and agility.",
            "rating": 4.6,
        },
    ],

    // Locations Section Data
    locations: [
        {
            "id": "nyc-studio",
            "name": "NYC Flagship Studio",
            "image": "/images/nyc-studio.jpg", // Ensure images exist
            "programs": 120,
            "rating": 4.8,
            "description": "Our state-of-the-art facility in the heart of New York City.",
        },
        {
            "id": "london-studio",
            "name": "London Riverside Gym",
            "image": "/images/london-studio.jpg",
            "programs": 95,
            "rating": 4.7,
            "description": "Experience world-class training with a view of the Thames.",
        },
        {
            "id": "la-studio",
            "name": "Los Angeles Beachfront",
            "image": "/images/la-studio.jpg",
            "programs": 80,
            "rating": 4.6,
            "description": "Train under the California sun at our vibrant LA location.",
        },
        {
            "id": "online-classes",
            "name": "Global Online Classes",
            "image": "/images/online-classes.jpg",
            "programs": 200,
            "rating": 4.9,
            "description": "Access our full library of classes and coaches from anywhere in the world.",
        },
        {
            "id": "tokyo-studio",
            "name": "Tokyo Zen Studio",
            "image": "/images/tokyo-studio.jpg",
            "programs": 70,
            "rating": 4.5,
            "description": "Find balance and strength in our serene Tokyo studio.",
        },
    ],

    // Virtual Tours Data (re-using listings structure, but src is for video)
    videos: [
        {
            id: "vid1",
            thumbnail: "/images/video-thumbnail-yoga.jpg",
            title: "Virtual Studio Tour: Yoga Zone",
            src: "/videos/yoga-tour.mp4", // Ensure these video files exist
            instructor: "Various Instructors",
            price: "Free Tour",
            badge: "New",
            description: "Explore our tranquil yoga studio and learn about our classes.",
        },
        {
            id: "vid2",
            thumbnail: "/images/video-thumbnail-gym.jpg",
            title: "HIIT & Strength Training Facilities",
            src: "/videos/gym-tour.mp4",
            instructor: "Team Zenith",
            price: "Free Tour",
            badge: "Popular",
            description: "A comprehensive look at our cutting-edge strength and HIIT equipment.",
        },
        {
            id: "vid3",
            thumbnail: "/images/video-thumbnail-pool.jpg",
            title: "Aquatic Center Walkthrough",
            src: "/videos/pool-tour.mp4",
            instructor: "Aquatics Team",
            price: "Free Tour",
            badge: "Exclusive",
            description: "Dive into our Olympic-sized swimming pool and aquatic programs.",
        },
    ],

    // Experts Section Data
    experts: [
        {
            "id": "expert1",
            "name": "Dr. Anya Sharma",
            "photo": "/images/expert-anya.jpg", // Ensure images exist
            "specialty": "Holistic Nutrition & Wellness",
            "experience": 15,
            "bio": "Dr. Sharma is a renowned nutritionist focusing on sustainable dietary practices and overall well-being. She believes in food as medicine.",
            "socials": { twitter: "dr_anya", linkedin: "dranyasharma" },
        },
        {
            "id": "expert2",
            "name": "Coach Marcus 'The Beast' Johnson",
            "photo": "/images/expert-marcus.jpg",
            "specialty": "Strength & Conditioning, Olympic Lifting",
            "experience": 10,
            "bio": "Marcus is a former professional athlete dedicated to helping clients unlock their full physical potential through tailored strength programs.",
            "socials": { instagram: "marcus_strength" },
        },
        {
            "id": "expert3",
            "name": "Elara Vance (Yoga & Mindfulness)",
            "photo": "/images/expert-elara.jpg",
            "specialty": "Vinyasa Yoga, Meditation, Stress Reduction",
            "experience": 12,
            "bio": "Elara guides students through transformative yoga journeys, emphasizing breathwork and mental clarity for a balanced life.",
        },
        {
            "id": "expert4",
            "name": "Dr. Ben Carter (Sports Medicine)",
            "photo": "/images/expert-ben.jpg",
            "specialty": "Injury Prevention & Rehabilitation",
            "experience": 18,
            "bio": "Dr. Carter specializes in helping athletes recover from injuries and optimize performance safely.",
        },
    ],

    // Market Insights Data
    insights: [
        {
            "id": "insight1",
            "title": "Maximizing Your Home Workout Space",
            "description": "Tips and tricks to get the most out of your small home gym.",
            "link": "/blog/home-workout-space",
            "image": "/images/insight-home-gym.jpg", // Ensure images exist
            "category": "Home Fitness",
        },
        {
            "id": "insight2",
            "title": "The Science Behind Effective Recovery",
            "description": "Understanding muscle recovery and optimizing your rest days.",
            "link": "/blog/recovery-science",
            "image": "/images/insight-recovery.jpg",
            "category": "Wellness",
        },
        {
            "id": "insight3",
            "title": "Fueling Your Body: A Nutrition Guide",
            "description": "Comprehensive guide to macro and micronutrients for fitness.",
            "link": "/blog/nutrition-guide",
            "image": "/images/insight-nutrition.jpg",
            "category": "Nutrition",
        },
        {
            "id": "insight4",
            "title": "Setting Achievable Fitness Goals",
            "description": "Strategies to set, track, and crush your fitness objectives.",
            "link": "/blog/fitness-goals",
            "image": "/images/insight-goals.jpg",
            "category": "Motivation",
        },
    ],

    // Testimonials Data (aligned with the enhanced TestimonialsSection)
    testimonials: [
        {
            "id": "t1",
            "name": "Sarah Chen",
            "avatar": "/images/avatar-sarah.jpg", // Ensure these avatar images exist
            "quote": "Joining Zenith Fitness Hub was the best decision for my fitness journey! The trainers are incredibly supportive, and the variety of classes keeps me motivated every day. I've seen amazing results!",
            "title": "Marketing Specialist",
            "program": "Elite Fitness Program",
            "rating": 5,
        },
        {
            "id": "t2",
            "name": "David Kim",
            "avatar": "/images/avatar-david.jpg",
            "quote": "I never thought I'd enjoy working out, but the virtual classes here are a game-changer. The flexibility and expert guidance have helped me stay consistent and feel fantastic.",
            "title": "Software Engineer",
            "program": "Virtual Yoga & Mindfulness",
            "rating": 4,
        },
        {
            "id": "t3",
            "name": "Maria Rodriguez",
            "avatar": "/images/avatar-maria.jpg",
            "quote": "The personalized nutrition advice I received was revolutionary. It wasn't just about weight loss, but about a holistic approach to wellness that truly changed my life for the better.",
            "title": "Small Business Owner",
            "program": "Nutrition Coaching",
            "rating": 5,
        },
        {
            "id": "t4",
            "name": "Omar Hassan",
            "avatar": "/images/avatar-omar.jpg",
            "quote": "The community here is so welcoming and inspiring. It feels like a second family. Every session leaves me energized and ready to tackle anything!",
            "title": "Graphic Designer",
            "program": "Group Strength Classes",
            "rating": 5,
        },
    ],

    // FAQs Data (aligned with the enhanced FaqsSection)
    faqs: [
        {
            id: 'faq1',
            question: "How do I sign up for a new program?",
            answer: "Signing up is easy! Just navigate to our 'Programs' page, choose your desired plan, and follow the simple steps to create an account and enroll. You'll be ready to start your journey in minutes!",
            category: "Getting Started",
        },
        {
            id: 'faq2',
            question: "What types of workouts are available?",
            answer: "We offer a diverse range of workouts including HIIT, yoga, strength training, dance fitness, and specialized recovery sessions. Our library is constantly updated with new content to keep things fresh and engaging.",
            category: "Programs & Workouts",
        },
        {
            id: 'faq3',
            question: "Can I get personalized coaching?",
            answer: "Absolutely! We offer one-on-one coaching sessions with our certified experts. You can schedule a consultation directly from the 'Coaches & Experts' section to discuss your specific goals.",
            category: "Coaching & Support",
        },
        {
            id: 'faq4',
            question: "Is there a mobile app to track my progress?",
            answer: "Yes, we have a fantastic mobile app available on both iOS and Android! You can download it from the App Store or Google Play to track workouts, monitor nutrition, and connect with the community on the go.",
            category: "Technical & App",
        },
        {
            id: 'faq5',
            question: "What is your refund policy?",
            answer: "We offer a 30-day money-back guarantee on all our premium programs. If you're not completely satisfied, simply contact our support team within 30 days of purchase for a full refund. Your satisfaction is our priority!",
            category: "Billing & Subscriptions",
        },
    ],
};


// Updated SearchFilters to include category and subcategory
interface SearchFilters {
  location: string;
  minPrice: string;
  maxPrice: string;
  category?: string; // The ID or slug of the selected category
  subcategory?: string; // The ID or slug of the selected subcategory
}

export default function FitnessSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
    const router = useRouter();
    // Use pageData prop instead of context for content data
    const { storeFormData } = useStoreContext(); // Keep for global theme settings
    // Destructure data using the potentially updated storeData
    const {
        id,
        name,
        slug,
        description,
        bannerUrl,
        StoreCategory, // Renamed for clarity in props
        marketplaceListings,
        salesAgents,
        metrics,
        awards,
        testimonials,
        faqs,
        CompanyLocation,
        blogs,
        contactPhone,
        CoreValues,
    } = pageData || {};

    // Use pageData for all content
    const siteData = pageData || DUMMY_DATA;

      
      const handleSearch = (filters: SearchFilters) => {
        // Implement actual search logic, e.g., navigate to a search results page
        // alert(`Searching in ${filters.location || 'all locations'} between KES ${filters.minPrice || 'any'} and KES ${filters.maxPrice || 'any'}`);
        router.push(`/fitness/programs?location=${filters.location}&minPrice=${filters.minPrice}&maxPrice=${filters.maxPrice}`);
      };
    
      const handleNewsletter = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate newsletter submission
        console.log("Newsletter subscribed!");
        // setShowNewsletter(false); // Hide newsletter after submission for this session
        // In a real app, you'd send this data to a backend
      };
    

    return (
        <div className={'relative w-full overflow-hidden bg-[#050505] text-white'}>
            {/* Hero Section */}
            <HeroSection store={pageData} 
            onSearch={handleSearch}
            trendingLocations={
            CompanyLocation
                ? CompanyLocation.map((loc: any) => ({
                    // Map/transform to Location type as needed
                    name: loc.name,
                    slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
                    metaKeywords: loc.metaKeywords || "",
                    status: loc.status || "active",
                    parentId: loc.parentId || null,
                    // Spread any additional fields if needed
                    ...loc,
                }))
                : []
            } />

            {/* Filter Bar */}
            {/* <FilterBar  storeFormData={siteData || {}}  onSearch={()=>{}}  /> */}

            {/* Listings Grid */}
            <ListingsGrid courses={siteData?.courses}/>

            {/* Trending Locations */}
            <LocationsSection  />

            {/* Virtual Tours */}
            <VirtualTours videos={[]} />
            {/* siteData?.virtualTours */}

            {/* Experts Section */}
            <ExpertsSection educators={siteData?.Educator} />

            {/* Insights Section */}
            <MarketInsights blogs={storeFormData?.blogs} />

            <GallerySection/>

            {/* Testimonials */}
            <TestimonialsSection testimonials={storeFormData?.testimonials} />

            {/* App Promotion (no props needed as it uses internal dummy data or generic content) */}
            <AppPromotionSection />

            {/* Newsletter (no props needed as it manages its own state) */}
            <NewsletterSection />

            {/* FAQs */}
            <FaqsSection faqs={storeFormData?.faqs} />
        </div>
    );
}