"use client";

import React, { useState, useEffect } from "react";
import { ThemeSectionContainer } from "@/lib/website-builder/createThemeSectionAdapter";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
import { useStoreContext } from "@/contexts/StoreContext";
import { ListingMarketStatus, ListingSystemStatus, ListingTransactionType, StoreForm } from "@/types/typings";
import FeaturedListingsWrapper from "./components/FeaturedListings";


// --- Sample Data Definition ---
// This robust sample data ensures all child components have something beautiful to display
const sampleStoreData : StoreForm = {
  name: "DreamNest Realty",
  slug: "dreamnest", // Unique identifier for the store
  description: "Your journey to the perfect home starts here. Discover properties, connect with expert agents, and find your dream space with ease.",
  bannerUrl: "/banners/main-banner.jpg", // High-quality banner for Hero
  videoUrl: "/videos/intro.mp4", // Introductory video for the store
  StoreCategory: [
    {
      displayName: "Apartments",
      // slug: "apartments", 
      icon: "/categories/apartment.jpg",
      id: "",
      categoryId: null,
      sortOrder: 0,
      visible: false,
      subcategories: [],
      allBrands: []
    },
    // { displayName: "Villas & Houses",
    //    slug: "villas-houses", images: "/categories/villa.jpg", description: "Spacious homes with private amenities." },
    // { displayName: "Commercial Spaces", 
    //   slug: "offices", images: "/categories/office.jpg", description: "Prime locations for your business." },
    // { displayName: "Land Plots", 
    //   slug: "land-plots", images: "/categories/land.jpg", description: "Build your vision from the ground up." },
    // { displayName: "Condos", 
    //   slug: "condos", images: "/categories/condo.jpg", description: "Convenient and amenity-rich living." },
  ],
  marketplaceListings: [
    {
      id: "h1", name: "Luxury Penthouse", finalPrice: 12500000, images: ["/properties/apartment1.jpg"],
      //  address: "123 Sky Tower, Downtown", 
      //  beds: 4, 
      //  baths: 3, 
      //  sqft: 3200, 
      //  badge: "Premium",
      description: "Experience unparalleled luxury with breathtaking city views.",
      duration: undefined,
      productCategoryId: "",
      subCategory: undefined,
      tags: [],
      option: [],
      color: [],
      size: [],
      weight: [],
      material: [],
      quantity: 0,
      buyingPrice: 0,
      sellingPrice: 0,
      pricingTiers: [],
      isAvailable: false,
      isOnOffer: false,
      isFlashDeal: false,
      isNewArrival: false,
      isDiscounted: false,
      isFeatured: false,
      bedrooms: [],
      studios: [],
      features: [],
      bookingSlots: undefined,
      requiredClientInfo: undefined,
      amenities: [],
      delivery: false,
      paymentOption: "",
      status: "DRAFT",
      location: null,
      listingMarketStatus: ListingMarketStatus.AVAILABLE,
      listingSystemStatus: ListingSystemStatus.DRAFT,
      listingTransactionType: ListingTransactionType.SALE
    },
    // { id: "h2", name: "Seaside Grand Villa", finalPrice: 25000000, images: ["/properties/villa1.jpg"], address: "456 Ocean Drive, Coastal Paradise", beds: 6, baths: 5, sqft: 5000, badge: "Exclusive", description: "An exquisite villa offering direct beach access and ultimate privacy." },
    // { id: "h3", name: "Modern Office Suite", finalPrice: 7500000, images: ["/properties/office1.jpg"], address: "789 Business Hub, Tech Park", beds: 0, baths: 2, sqft: 2000, badge: "New Listing", description: "State-of-the-art office space designed for productivity and collaboration." },
    // { id: "h4", name: "Spacious Countryside Plot", finalPrice: 4000000, images: ["/properties/land1.jpg"], address: "101 Green Fields, Rural Haven", beds: 0, baths: 0, sqft: 43560, badge: "Investment", description: "Expansive land perfect for building your custom estate." },
    // { id: "h5", name: "Charming Suburban Home", finalPrice: 9800000, images: ["/properties/loft1.jpg"], address: "234 Elm Street, Quiet Neighborhood", beds: 3, baths: 2, sqft: 2200, badge: "Family Ready", description: "A cozy and inviting home, ideal for growing families." },
    // { id: "h6", name: "Urban Loft Apartment", finalPrice: 6200000, images: ["/properties/home1.jpg"], address: "567 Art District, Urban Core", beds: 2, baths: 2, sqft: 1500, badge: "Trendy", description: "Stylish loft living with vibrant city culture at your doorstep." },
    // { id: "h7", name: "Mountain View Cabin", finalPrice: 8000000, images: ["/properties/cabin.jpg"], address: "890 Pine Ridge, Serene Mountains", beds: 3, baths: 2, sqft: 1600, badge: "Getaway", description: "Escape to nature in this beautifully designed cabin." },
  ],
  testimonials: [
    { quote: "DreamNest Realty exceeded all our expectations! Their agents were incredibly knowledgeable and made our home-buying journey seamless.", authorName: "Alice G.", avatarUrl: "/avatars/avatar1.jpg", rating: 5, authorTitle: "First-Time Homeowner" },
    { quote: "The team at DreamNest is truly professional and transparent. They found us the perfect commercial space much faster than we anticipated.", authorName: "Brenda K.", avatarUrl: "/avatars/avatar2.jpg", rating: 5, authorTitle: "Business Owner" },
    { quote: "Outstanding service! We were guided every step of the way, and their property selection was vast. Highly recommended!", authorName: "Charles L.", avatarUrl: "/avatars/avatar3.jpg", rating: 4.5, authorTitle: "Real Estate Investor" },
    { quote: "Their deep market insights gave us a competitive edge. Selling our property was surprisingly stress-free. Thank you, DreamNest!", authorName: "Diana P.", avatarUrl: "/avatars/avatar4.jpg", rating: 5, authorTitle: "Seller" },
  ],
  faqs: [
    { question: "How does the home buying process work with DreamNest Realty?", answer: "We streamline the entire process, from initial consultation and property search to negotiation and closing. Our agents provide personalized guidance every step of the way to ensure a smooth and enjoyable experience." },
    { question: "Can I get a virtual tour of properties before visiting in person?", answer: "Absolutely! Many of our listings feature high-quality virtual tours and detailed photo galleries. Contact the listing agent to arrange a virtual walkthrough or for more details." },
    { question: "What are the typical closing costs associated with buying a property?", answer: "Closing costs typically range from 2-5% of the purchase finalPrice and can include items like loan origination fees, title insurance, appraisal fees, and legal fees. Our team will provide a detailed breakdown specific to your transaction." },
    { question: "Do you offer property management services after purchase?", answer: "Yes, we provide comprehensive property management services for both residential and commercial properties, ensuring your investment is well-maintained and generates optimal returns. Speak to our team for a tailored quote." },
    { question: "How do I determine the right finalPrice to sell my home?", answer: "Our expert agents conduct a thorough market analysis, evaluating comparable sales, current market trends, and your property's unique features to determine the most competitive and effective listing finalPrice for a quick and profitable sale." },
  ],
  salesAgents: [
    {
      id: "",
      userId: "",
      createdAt: null,
      updatedAt: null,
      companyId: undefined,
      loginCode: null,
      phoneNumber: null,
      isActive: false,
      specialties: [],
      regions: []
    },
    // { id: 2, name: "Marcus Reed", role: "Commercial Real Estate Expert", photoUrl: "/agents/david.jpg", rating: 4.7, isOnline: false, phone: "+254712345679", email: "marcus.r@dreamnest.com" },
    // { id: 3, name: "Olivia Grace", role: "Residential Sales Lead", photoUrl: "/agents/emily.jpg", rating: 4.8, isOnline: true, phone: "+254712345680", email: "olivia.g@dreamnest.com" },
    // { id: 4, name: "Ethan Cole", role: "Land & Development Consultant", photoUrl: "/agents/agent4.jpg", rating: 4.6, isOnline: true, phone: "+254712345681", email: "ethan.c@dreamnest.com" },
  ],
  metrics: [
    {
      label: "Properties Listed", value: 1250,
      // iconName: "BuildingOfficeIcon" 
    },
    {
      label: "Happy Clients", value: 980,
      // iconName: "UsersIcon" 
    },
    {
      label: "Years in Business", value: 15,
      // iconName: "SparklesIcon"
    },
    {
      label: "Average Rating", value: 4.9,
      // iconName: "StarIcon" 
    }, // Custom metric for average rating
  ],
  awards: [
    { name: "Best Real Estate Agency 2024", iconUrl: "/badges/top-rated.png" },
    { name: "Client Satisfaction Award", iconUrl: "/badges/satisfaction.png" }, // Assuming you have an image for this
    { name: "Excellence in Service", iconUrl: "/badges/realtor.png" },
  ],
  // featuredListings: [
  //   { "id": 1, image: "/properties/featured1.jpg", "finalPrice": 350000, "address": "123 Maple Street, Springfield", "beds": 3, "baths": 2, "sqft": 1800, "badge": "New", "description": "A charming family home with a spacious backyard." },
  //   { "id": 2, image: "/properties/featured2.jpg", "finalPrice": 550000, "address": "456 Oak Avenue, Metropolis", "beds": 4, "baths": 3, "sqft": 2500, "badge": "Hot Deal", "description": "Modern design with smart home features and a panoramic view." },
  //   { "id": 3, image: "/properties/featured3.jpg", "finalPrice": 450000, "address": "789 Pine Road, Centerville", "beds": 3, "baths": 2.5, "sqft": 2000, "badge": "Price Reduced", "description": "Recently renovated property in a quiet, friendly neighborhood." },
  //   { "id": 4, image: "/properties/featured4.jpg", "finalPrice": 720000, "address": "101 Lakefront Drive, Lakeside", "beds": 5, "baths": 4, "sqft": 3500, "badge": "Luxury", "description": "Stunning lakefront property with private dock and expansive views." },
  // ],
  // Note: Assuming 'listings' will eventually come from 'marketplaceListings' or a filtered subset
  // listings: [
  //   { "id": 1, image: "/properties/apartment1.jpg", "finalPrice": 350000, "address": "123 Maple Street, Springfield", "beds": 3, "baths": 2, "sqft": 1800, "badge": "New" },
  //   { "id": 2, image: "/properties/villa1.jpg", "finalPrice": 550000, "address": "456 Oak Avenue, Metropolis", "beds": 4, "baths": 3, "sqft": 2500, "badge": "Hot" },
  //   { "id": 3, image: "/properties/office1.jpg", "finalPrice": 450000, "address": "789 Pine Road, Centerville", "beds": 3, "baths": 2.5, "sqft": 2000, "badge": "Price Reduced" },
  //   { "id": 4, image: "/properties/land1.jpg", "finalPrice": 3000000, "address": "101 Green Fields, Rural Haven", beds: 0, baths: 0, sqft: 43560, badge: "Investment" },
  // ],
  // locations: [
  //   { "id": 1, "name": "Downtown", image: "/locations/downtown.jpg", "listings": 120, "avgPrice": 420000, description: "Vibrant city living with access to all amenities." },
  //   { "id": 2, "name": "Uptown Hills", image: "/locations/uptown.jpg", "listings": 80, "avgPrice": 380000, description: "Exclusive residential area with lush greenery." },
  //   { "id": 3, "name": "Riverside Estates", image: "/locations/riverside.jpg", "listings": 60, "avgPrice": 310000, description: "Peaceful waterfront properties, perfect for families." },
  //   { "id": 4, "name": "Tech Hub North", image: "/locations/techhub.jpg", "listings": 45, "avgPrice": 550000, description: "Modern living near innovation centers." }
  // ],
  blogs: [
    {
      "title": "5 Essential Tips for First-Time Home Buyers in 2025", coverImage: "/blog/blog1.jpg", "publishDate": new Date(),
      id: "",
      companyId: "",
      slug: "",
      content: "",
      isFeature: false,
      excerpt: null,
      categories: [],
      tags: [],
      authorName: null,
      status: "DRAFT",
      publishedAt: null,
      views: 0,
      likes: 0,
      description: null,
      contentUrl: null,
      thumbnailUrl: null,
      contentType: "VIDEO",
      category: null,
      duration: null,
      location: null,
      published: false,
      type: null,
      authorId: null,
      photoAlbumId: null,
      videoAlbumId: null,
      createdAt: null,
      updatedAt: null,
      subCategory: null
    },
    {
      "title": "Navigating the Current Real Estate Market: Trends and Forecasts", coverImage: "/blog/blog2.jpg", "publishDate": new Date(),
      id: "",
      companyId: "",
      slug: "",
      content: "",
      isFeature: false,
      excerpt: null,
      categories: [],
      tags: [],
      authorName: null,
      status: "DRAFT",
      publishedAt: null,
      views: 0,
      likes: 0,
      description: null,
      contentUrl: null,
      thumbnailUrl: null,
      contentType: "VIDEO",
      category: null,
      duration: null,
      location: null,
      published: false,
      type: null,
      authorId: null,
      photoAlbumId: null,
      videoAlbumId: null,
      createdAt: null,
      updatedAt: null,
      subCategory: null
    },
    {
      "title": "Maximizing Your Home's Value: Effective Staging Techniques", coverImage: "/blog/blog3.jpg", "publishDate": new Date(),
      id: "",
      companyId: "",
      slug: "",
      content: "",
      isFeature: false,
      excerpt: null,
      categories: [],
      tags: [],
      authorName: null,
      status: "DRAFT",
      publishedAt: null,
      views: 0,
      likes: 0,
      description: null,
      contentUrl: null,
      thumbnailUrl: null,
      contentType: "VIDEO",
      category: null,
      duration: null,
      location: null,
      published: false,
      type: null,
      authorId: null,
      photoAlbumId: null,
      videoAlbumId: null,
      createdAt: null,
      updatedAt: null,
      subCategory: null
    },
    {
      "title": "The Rise of Sustainable Homes: What You Need to Know", coverImage: "/blog/blog4.jpg", "publishDate": new Date()
      // "May 30, 2025", 
      // "author": "Green Living Expert" 
      ,









      id: "",
      companyId: "",
      slug: "",
      content: "",
      isFeature: false,
      excerpt: null,
      categories: [],
      tags: [],
      authorName: null,
      status: "DRAFT",
      publishedAt: null,
      views: 0,
      likes: 0,
      description: null,
      contentUrl: null,
      thumbnailUrl: null,
      contentType: "VIDEO",
      category: null,
      duration: null,
      location: null,
      published: false,
      type: null,
      authorId: null,
      photoAlbumId: null,
      videoAlbumId: null,
      createdAt: null,
      updatedAt: null,
      subCategory: null
    },
  ],
  id: "",
  tagline: null,
  hasWebsite: undefined,
  companyCategoryId: null,
  category: "",
  logoUrl: null,
  contactEmail: "",
  contactPhone: null,
  site: null,
  address: null,
  domain: null,
  currency: "",
  locale: "",
  userId: null,
  createdAt: null,
  updatedAt: null,
  deletedAt: null,
  sEOId: null,
  CoreValues: [],
  geoLocation: null,
  openingHours: null,
  pricingTiers: [],
  themeSettings: null,
  stats: null,
  settings: null,
  socialLinks: [],
  policies: [],
  promotions: [],
  Announcement: [],
  Collection: [],
  pageSections: [],
  heroSlides: [],
  appPromos: [],
  events: [],
  courses: [],
  projects: [],
  seo: null,
  analyticsConfig: null,
  paymentSettings: null,
  shippingSettings: null,
  CompanyLocation: [],
  Writer: [],
  Expert: [],
  Educator: [],
  Doctor: [],
  packages: [],
  Podcast: [],
  services: [],
  destinations: [],
  tourPackages: [],
  galleries: []
};

// Updated SearchFilters to include category and subcategory
interface SearchFilters {
  location: string;
  minPrice: string;
  maxPrice: string;
  category?: string; // The ID or slug of the selected category
  subcategory?: string; // The ID or slug of the selected subcategory
  categoryId?: string; // The ID of the selected category
  subcategoryId?: string; // The ID of the selected subcategory
}

//──────────────────────────────────────────────────────────────────────────────
// Main RealEstateSite Component
//──────────────────────────────────────────────────────────────────────────────
export default function RealEstateSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {

  const router = useRouter();
  const { storeFormData } = useStoreContext(); // Use for global theme settings only

  // Use pageData for all content, fall back to sample data if needed
  const storeData = pageData && Object.keys(pageData).length > 0
    ? pageData
    : sampleStoreData;

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

  
  // Client Component
const handleSearch = (filters: SearchFilters) => {
  const params = new URLSearchParams();

  if (filters.location) {
    params.set("location", filters.location);
  }

  if (filters.minPrice) {
    params.set("minPrice", String(filters.minPrice));
  }

  if (filters.maxPrice) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  // ✅ Product Category (ObjectId)
  if (filters.categoryId) {
    params.set("categoryId", filters.categoryId);
  }

  // ✅ Optional human-readable category
  if (filters.category) {
    params.set("category", filters.category);
  }

  // ✅ Subcategory name (matches subCategoryName)
  if (filters.subcategory) {
    params.set("subcategory", filters.subcategory);
  }

  // Navigate to listings page
  router.push(`/realestate/listings?${params.toString()}`);
};

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate newsletter submission
    console.log("Newsletter subscribed!");
    setShowNewsletter(false); // Hide newsletter after submission for this session
    // In a real app, you'd send this data to a backend
  };


  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
      <HeroSection
        store={storeData}
        onSearch={handleSearch}
        trendingLocations={
          CompanyLocation
            ? CompanyLocation.map((loc: any) => ({
                name: loc.name,
                slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
                metaKeywords: loc.metaKeywords || "",
                status: loc.status || "active",
                parentId: loc.parentId || null,
                ...loc,
              }))
            : []
        }
      />
    ),
    'categories': <CategoriesSection store={storeData} />,
    'featured-listings': <FeaturedListingsWrapper companyId={id} />,
    'trending-locations': (
      <TrendingLocations
        locations={
          CompanyLocation
            ? CompanyLocation.map((loc: any) => ({
                name: loc.name,
                slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
                metaKeywords: loc.metaKeywords || "",
                status: loc.status || "active",
                parentId: loc.parentId || null,
                ...loc,
              }))
            : []
        }
        slug={slug}
      />
    ),
    'listings': <ListingsSection products={marketplaceListings} slug={slug} />,
    'why-choose-us': <WhyChooseUs CoreValues={CoreValues} metrics={metrics} awards={awards} />,
    'agents': <AgentsSection agents={salesAgents} slug={slug} />,
    'testimonials': <TestimonialsSection testimonials={testimonials} />,
    'faq': <FAQSection faqs={faqs} />,
    'blog': <BlogSection posts={blogs} slug={slug} />,
    'newsletter': (
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
    ),
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection
          store={storeData}
          onSearch={handleSearch}
          trendingLocations={
            CompanyLocation
              ? CompanyLocation.map((loc: any) => ({
                  name: loc.name,
                  slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
                  metaKeywords: loc.metaKeywords || "",
                  status: loc.status || "active",
                  parentId: loc.parentId || null,
                  ...loc,
                }))
              : []
          }
        />
      </div>
      <div id="section-categories" data-editor-section="categories" data-editor-component="CategoriesSection">
        <CategoriesSection store={storeData} />
      </div>
      <div id="section-featured-listings" data-editor-section="featured-listings" data-editor-component="FeaturedListingsWrapper">
        <FeaturedListingsWrapper companyId={id} />
      </div>
      <div id="section-trending-locations" data-editor-section="trending-locations" data-editor-component="TrendingLocations">
        <TrendingLocations
          locations={
            CompanyLocation
              ? CompanyLocation.map((loc: any) => ({
                  name: loc.name,
                  slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
                  metaKeywords: loc.metaKeywords || "",
                  status: loc.status || "active",
                  parentId: loc.parentId || null,
                  ...loc,
                }))
              : []
          }
          slug={slug}
        />
      </div>
      <div id="section-listings" data-editor-section="listings" data-editor-component="ListingsSection">
        <ListingsSection products={marketplaceListings} slug={slug} />
      </div>
      <div id="section-why-choose-us" data-editor-section="why-choose-us" data-editor-component="WhyChooseUs">
        <WhyChooseUs CoreValues={CoreValues} metrics={metrics} awards={awards} />
      </div>
      <div id="section-agents" data-editor-section="agents" data-editor-component="AgentsSection">
        <AgentsSection agents={salesAgents} slug={slug} />
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
        <TestimonialsSection testimonials={testimonials} />
      </div>
      <div id="section-faq" data-editor-section="faq" data-editor-component="FAQSection">
        <FAQSection faqs={faqs} />
      </div>
      <div id="section-blog" data-editor-section="blog" data-editor-component="BlogSection">
        <BlogSection posts={blogs} slug={slug} />
      </div>
      <AnimatePresence>
        {showNewsletter && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <div id="section-newsletter" data-editor-section="newsletter" data-editor-component="NewsletterSection">
              <NewsletterSection handleNewsletter={handleNewsletter} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <div className="font-sans text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
