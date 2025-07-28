"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link"; // Use Next.js Link for client-side navigation
import Image from "next/image"; // Import Image component
import { useRouter } from "next/navigation";
import {
  ChatBubbleBottomCenterTextIcon, // A more modern chat icon for WhatsApp
} from "@heroicons/react/24/solid"; // Changed to solid for consistency

// Import your updated child components
import FAQSection from "./components/FAQSection";
import TestimonialsSection from "./components/TestimonialsSection";
import AgentsSection from "./components/AgentsSection";
import BlogSection from "./components/BlogSection";
import CategoriesSection from "./components/CategoriesSection";
import FeaturedListings from "./components/FeaturedListings";
import HeroSection from "./components/HeroSection";
import ListingsSection from "./components/ListingsSection";
import NewsletterSection from "./components/NewsletterSection";
import TrendingLocations from "./components/TrendingLocations";
import WhyChooseUs from "./components/WhyChooseUs";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import { StoreForm } from "@/types/typings";


// --- Sample Data Definition ---
// This robust sample data ensures all child components have something beautiful to display
const sampleStoreData : StoreForm = {
  name: "DreamNest Realty",
  slug: "dreamnest", // Unique identifier for the store
  description: "Your journey to the perfect home starts here. Discover properties, connect with expert agents, and find your dream space with ease.",
  bannerUrl: "/banners/main-banner.jpg", // High-quality banner for Hero
  storeCategories: [
    { id: 1, name: "Apartments", slug: "apartments", imageUrl: "/categories/apartment.jpg", description: "Modern living spaces in the heart of the city." },
    { id: 2, name: "Villas & Houses", slug: "villas-houses", imageUrl: "/categories/villa.jpg", description: "Spacious homes with private amenities." },
    { id: 3, name: "Commercial Spaces", slug: "offices", imageUrl: "/categories/office.jpg", description: "Prime locations for your business." },
    { id: 4, name: "Land Plots", slug: "land-plots", imageUrl: "/categories/land.jpg", description: "Build your vision from the ground up." },
    { id: 5, name: "Condos", slug: "condos", imageUrl: "/categories/condo.jpg", description: "Convenient and amenity-rich living." },
  ],
  marketplaceListings: [
    { id: "h1", name: "Luxury Penthouse", finalPrice: 12500000, images: ["/properties/apartment1.jpg"], address: "123 Sky Tower, Downtown", beds: 4, baths: 3, sqft: 3200, badge: "Premium", description: "Experience unparalleled luxury with breathtaking city views." },
    { id: "h2", name: "Seaside Grand Villa", finalPrice: 25000000, imageUrl: "/properties/villa1.jpg", address: "456 Ocean Drive, Coastal Paradise", beds: 6, baths: 5, sqft: 5000, badge: "Exclusive", description: "An exquisite villa offering direct beach access and ultimate privacy." },
    { id: "h3", name: "Modern Office Suite", finalPrice: 7500000, imageUrl: "/properties/office1.jpg", address: "789 Business Hub, Tech Park", beds: 0, baths: 2, sqft: 2000, badge: "New Listing", description: "State-of-the-art office space designed for productivity and collaboration." },
    { id: "h4", name: "Spacious Countryside Plot", finalPrice: 4000000, imageUrl: "/properties/land1.jpg", address: "101 Green Fields, Rural Haven", beds: 0, baths: 0, sqft: 43560, badge: "Investment", description: "Expansive land perfect for building your custom estate." },
    { id: "h5", name: "Charming Suburban Home", finalPrice: 9800000, imageUrl: "/properties/loft1.jpg", address: "234 Elm Street, Quiet Neighborhood", beds: 3, baths: 2, sqft: 2200, badge: "Family Ready", description: "A cozy and inviting home, ideal for growing families." },
    { id: "h6", name: "Urban Loft Apartment", finalPrice: 6200000, imageUrl: "/properties/home1.jpg", address: "567 Art District, Urban Core", beds: 2, baths: 2, sqft: 1500, badge: "Trendy", description: "Stylish loft living with vibrant city culture at your doorstep." },
    { id: "h7", name: "Mountain View Cabin", finalPrice: 8000000, imageUrl: "/properties/cabin.jpg", address: "890 Pine Ridge, Serene Mountains", beds: 3, baths: 2, sqft: 1600, badge: "Getaway", description: "Escape to nature in this beautifully designed cabin." },
  ],
  testimonials: [
    { quote: "DreamNest Realty exceeded all our expectations! Their agents were incredibly knowledgeable and made our home-buying journey seamless.", author: "Alice G.", avatarUrl: "/avatars/avatar1.jpg", rating: 5, role: "First-Time Homeowner" },
    { quote: "The team at DreamNest is truly professional and transparent. They found us the perfect commercial space much faster than we anticipated.", author: "Brenda K.", avatarUrl: "/avatars/avatar2.jpg", rating: 5, role: "Business Owner" },
    { quote: "Outstanding service! We were guided every step of the way, and their property selection was vast. Highly recommended!", author: "Charles L.", avatarUrl: "/avatars/avatar3.jpg", rating: 4.5, role: "Real Estate Investor" },
    { quote: "Their deep market insights gave us a competitive edge. Selling our property was surprisingly stress-free. Thank you, DreamNest!", author: "Diana P.", avatarUrl: "/avatars/avatar4.jpg", rating: 5, role: "Seller" },
  ],
  faqs: [
    { question: "How does the home buying process work with DreamNest Realty?", answer: "We streamline the entire process, from initial consultation and property search to negotiation and closing. Our agents provide personalized guidance every step of the way to ensure a smooth and enjoyable experience." },
    { question: "Can I get a virtual tour of properties before visiting in person?", answer: "Absolutely! Many of our listings feature high-quality virtual tours and detailed photo galleries. Contact the listing agent to arrange a virtual walkthrough or for more details." },
    { question: "What are the typical closing costs associated with buying a property?", answer: "Closing costs typically range from 2-5% of the purchase finalPrice and can include items like loan origination fees, title insurance, appraisal fees, and legal fees. Our team will provide a detailed breakdown specific to your transaction." },
    { question: "Do you offer property management services after purchase?", answer: "Yes, we provide comprehensive property management services for both residential and commercial properties, ensuring your investment is well-maintained and generates optimal returns. Speak to our team for a tailored quote." },
    { question: "How do I determine the right finalPrice to sell my home?", answer: "Our expert agents conduct a thorough market analysis, evaluating comparable sales, current market trends, and your property's unique features to determine the most competitive and effective listing finalPrice for a quick and profitable sale." },
  ],
  agents: [
    { id: 1, name: "Sophia Chen", role: "Luxury Property Specialist", photoUrl: "/agents/sarah.jpg", rating: 4.9, isOnline: true, phone: "+254712345678", email: "sophia.c@dreamnest.com" },
    { id: 2, name: "Marcus Reed", role: "Commercial Real Estate Expert", photoUrl: "/agents/david.jpg", rating: 4.7, isOnline: false, phone: "+254712345679", email: "marcus.r@dreamnest.com" },
    { id: 3, name: "Olivia Grace", role: "Residential Sales Lead", photoUrl: "/agents/emily.jpg", rating: 4.8, isOnline: true, phone: "+254712345680", email: "olivia.g@dreamnest.com" },
    { id: 4, name: "Ethan Cole", role: "Land & Development Consultant", photoUrl: "/agents/agent4.jpg", rating: 4.6, isOnline: true, phone: "+254712345681", email: "ethan.c@dreamnest.com" },
  ],
  metrics: [
    { id: 1, label: "Properties Listed", value: 1250, iconName: "BuildingOfficeIcon" },
    { id: 2, label: "Happy Clients", value: 980, iconName: "UsersIcon" },
    { id: 3, label: "Years in Business", value: 15, iconName: "SparklesIcon" },
    { id: 4, label: "Average Rating", value: 4.9, iconName: "StarIcon" }, // Custom metric for average rating
  ],
  awards: [
    { id: 1, name: "Best Real Estate Agency 2024", iconUrl: "/badges/top-rated.png" },
    { id: 2, name: "Client Satisfaction Award", iconUrl: "/badges/satisfaction.png" }, // Assuming you have an image for this
    { id: 3, name: "Excellence in Service", iconUrl: "/badges/realtor.png" },
  ],
  featuredListings: [
    { "id": 1, image: "/properties/featured1.jpg", "finalPrice": 350000, "address": "123 Maple Street, Springfield", "beds": 3, "baths": 2, "sqft": 1800, "badge": "New", "description": "A charming family home with a spacious backyard." },
    { "id": 2, image: "/properties/featured2.jpg", "finalPrice": 550000, "address": "456 Oak Avenue, Metropolis", "beds": 4, "baths": 3, "sqft": 2500, "badge": "Hot Deal", "description": "Modern design with smart home features and a panoramic view." },
    { "id": 3, image: "/properties/featured3.jpg", "finalPrice": 450000, "address": "789 Pine Road, Centerville", "beds": 3, "baths": 2.5, "sqft": 2000, "badge": "Price Reduced", "description": "Recently renovated property in a quiet, friendly neighborhood." },
    { "id": 4, image: "/properties/featured4.jpg", "finalPrice": 720000, "address": "101 Lakefront Drive, Lakeside", "beds": 5, "baths": 4, "sqft": 3500, "badge": "Luxury", "description": "Stunning lakefront property with private dock and expansive views." },
  ],
  // Note: Assuming 'listings' will eventually come from 'marketplaceListings' or a filtered subset
  listings: [
    { "id": 1, image: "/properties/apartment1.jpg", "finalPrice": 350000, "address": "123 Maple Street, Springfield", "beds": 3, "baths": 2, "sqft": 1800, "badge": "New" },
    { "id": 2, image: "/properties/villa1.jpg", "finalPrice": 550000, "address": "456 Oak Avenue, Metropolis", "beds": 4, "baths": 3, "sqft": 2500, "badge": "Hot" },
    { "id": 3, image: "/properties/office1.jpg", "finalPrice": 450000, "address": "789 Pine Road, Centerville", "beds": 3, "baths": 2.5, "sqft": 2000, "badge": "Price Reduced" },
    { "id": 4, image: "/properties/land1.jpg", "finalPrice": 3000000, "address": "101 Green Fields, Rural Haven", beds: 0, baths: 0, sqft: 43560, badge: "Investment" },
  ],
  locations: [
    { "id": 1, "name": "Downtown", image: "/locations/downtown.jpg", "listings": 120, "avgPrice": 420000, description: "Vibrant city living with access to all amenities." },
    { "id": 2, "name": "Uptown Hills", image: "/locations/uptown.jpg", "listings": 80, "avgPrice": 380000, description: "Exclusive residential area with lush greenery." },
    { "id": 3, "name": "Riverside Estates", image: "/locations/riverside.jpg", "listings": 60, "avgPrice": 310000, description: "Peaceful waterfront properties, perfect for families." },
    { "id": 4, "name": "Tech Hub North", image: "/locations/techhub.jpg", "listings": 45, "avgPrice": 550000, description: "Modern living near innovation centers." }
  ],
  blogs: [
    { "id": 1, "title": "5 Essential Tips for First-Time Home Buyers in 2025", "link": "#", imageUrl: "/blog/blog1.jpg", "date": "July 10, 2025", "author": "DreamNest Editorial" },
    { "id": 2, "title": "Navigating the Current Real Estate Market: Trends and Forecasts", "link": "#", imageUrl: "/blog/blog2.jpg", "date": "June 28, 2025", "author": "Market Analyst" },
    { "id": 3, "title": "Maximizing Your Home's Value: Effective Staging Techniques", "link": "#", imageUrl: "/blog/blog3.jpg", "date": "June 15, 2025", "author": "Design Team" },
    { "id": 4, "title": "The Rise of Sustainable Homes: What You Need to Know", "link": "#", imageUrl: "/blog/blog4.jpg", "date": "May 30, 2025", "author": "Green Living Expert" },
  ],
};

//──────────────────────────────────────────────────────────────────────────────
// Main RealEstateSite Component
//──────────────────────────────────────────────────────────────────────────────
export default function RealEstateSite() {

  const router = useRouter();
  const { storeFormData } = useStoreContext(); // Assuming this is where dynamic store data might come from

  // Prioritize dynamic data from context, fall back to sample data
  // const storeData = sampleStoreData;
  const storeData = storeFormData && Object.keys(storeFormData).length > 0
    ? storeFormData
    : sampleStoreData;

  // Destructure data using the potentially updated storeData
  const {
    name,
    slug,
    description,
    bannerUrl,
    storeCategories, // Renamed for clarity in props
    marketplaceListings,
    agents,
    metrics,
    awards,
    testimonials,
    faqs,
    locations,
    blogs,
  } = storeData;

  // Search form state (remains local to parent for now)
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showNewsletter, setShowNewsletter] = useState(true); // Control Newsletter visibility

  useEffect(() => {
    // You can add logic here to fetch real data based on `slug` if needed,
    // and then update `storeFormData` in your context.
    // For now, it defaults to sample data if `storeFormData` is empty.
  }, [slug]);

  const handleSearch = () => {
    // Implement actual search logic, e.g., navigate to a search results page
    alert(`Searching in ${location || 'all locations'} between KES ${minPrice || 'any'} and KES ${maxPrice || 'any'}`);
    router.push(`/site/${slug}/listings?location=${location}&minPrice=${minPrice}&maxPrice=${maxPrice}`);
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate newsletter submission
    console.log("Newsletter subscribed!");
    setShowNewsletter(false); // Hide newsletter after submission for this session
    // In a real app, you'd send this data to a backend
  };

  return (
    <div className="font-sans text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Sticky Contact Agent Button (WhatsApp) */}
      <a
        href={`https://wa.me/254712345678?text=Hi%20DreamNest%20Realty,%20I'd%20like%20to%20inquire%20about%20a%20listing`}
        target="_blank"
        rel="noopener noreferrer" // Added for security best practice
        className="fixed bottom-6 right-6 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                   text-white p-4 rounded-full shadow-lg hover:shadow-xl z-50 transition-all duration-300 transform hover:scale-105
                   flex items-center justify-center group"
        aria-label="Chat with us on WhatsApp"
      >
        {/* Using Heroicon for consistency, if you have a custom SVG keep it */}
        <ChatBubbleBottomCenterTextIcon className="h-7 w-7 transition-transform duration-300 group-hover:rotate-6" />
        <span className="sr-only">Chat on WhatsApp</span> {/* Screen reader only text */}
      </a>

      {/* Hero Section */}
      <HeroSection
        store={storeData}
        onSearch={handleSearch}
      />

      {/* Property Categories Section */}
      <CategoriesSection store={storeData} />

      {/* Featured Listings Section (using marketplaceListings as source) storeData.featuredListings || */}
      <FeaturedListings listings={marketplaceListings} slug={slug} />

      {/* Trending Locations Section */}
      <TrendingLocations locations={locations} slug={slug} />

      {/* All Listings Section (using marketplaceListings as source) */}
      <ListingsSection products={marketplaceListings} slug={slug} />

      {/* Why Choose Us Section */}
      <WhyChooseUs metrics={metrics} awards={awards} />

      {/* Agents Section */}
      <AgentsSection agents={agents} slug={slug} />

      {/* Testimonials Carousel Section */}
      <TestimonialsSection testimonials={testimonials} />

      {/* FAQ Section */}
      <FAQSection faqs={faqs} />

      {/* Blog Posts Section */}
      <BlogSection posts={blogs} slug={slug} />

      {/* Newsletter Signup Section (conditionally rendered) */}
      <AnimatePresence>
        {showNewsletter && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <NewsletterSection handleNewsletter={handleNewsletter} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}