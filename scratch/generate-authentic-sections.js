const fs = require('fs');
const path = require('path');

const exact = require(path.join(__dirname, 'exact-active-sections.json'));

const TARGET_TEMPLATES = [
  { key: 'ecommerce-agrovet@v1', constName: 'ECOMMERCE_AGROVET_SECTIONS', prefix: 'agrovet', domain: 'Agrovet & Farming' },
  { key: 'ecommerce-meat@v1', constName: 'ECOMMERCE_MEAT_SECTIONS', prefix: 'meat', domain: 'Butchery & Meat' },
  { key: 'ecommerce-hardware@v1', constName: 'ECOMMERCE_HARDWARE_SECTIONS', prefix: 'hardware', domain: 'Hardware & Tools' },
  { key: 'ecommerce-watch@v1', constName: 'ECOMMERCE_WATCH_SECTIONS', prefix: 'watch', domain: 'Luxury Watches' },
  { key: 'ecommerce-flowers@v1', constName: 'ECOMMERCE_FLOWERS_SECTIONS', prefix: 'flowers', domain: 'Floral & Gifts' },
  { key: 'ecommerce-groceries@v1', constName: 'ECOMMERCE_GROCERIES_SECTIONS', prefix: 'groceries', domain: 'Fresh Groceries' },
  { key: 'ecommerce-earphones@v1', constName: 'ECOMMERCE_EARPHONES_SECTIONS', prefix: 'earphones', domain: 'Audio & Earphones' },
  { key: 'ecommerce-glasses@v1', constName: 'ECOMMERCE_GLASSES_SECTIONS', prefix: 'glasses', domain: 'Eyewear & Glasses' },
  { key: 'ecommerce-honey@v1', constName: 'ECOMMERCE_HONEY_SECTIONS', prefix: 'honey', domain: 'Pure Honey & Organic' },
  { key: 'ecommerce-peanuts@v1', constName: 'ECOMMERCE_PEANUTS_SECTIONS', prefix: 'peanuts', domain: 'Nut Butters & Snacks' },
  { key: 'ecommerce-baby@v1', constName: 'ECOMMERCE_BABY_SECTIONS', prefix: 'baby', domain: 'Baby & Kids Essentials' },
  { key: 'ecommerce-cake@v1', constName: 'ECOMMERCE_CAKE_SECTIONS', prefix: 'cake', domain: 'Bakery & Artisan Cakes' },
  { key: 'ecommerce-pets@v1', constName: 'ECOMMERCE_PETS_SECTIONS', prefix: 'pets', domain: 'Pet Supplies & Nutrition' },
  { key: 'ecommerce-bike@v1', constName: 'ECOMMERCE_BIKE_SECTIONS', prefix: 'bike', domain: 'Bicycles & Cycling Gear' },
  { key: 'ecommerce-motorcycle@v1', constName: 'ECOMMERCE_MOTORCYCLE_SECTIONS', prefix: 'motorcycle', domain: 'Motorcycles & Spares' },
  { key: 'ecommerce-book@v1', constName: 'ECOMMERCE_BOOK_SECTIONS', prefix: 'book', domain: 'Books & Publishing' },
  { key: 'ecommerce-accessories@v1', constName: 'ECOMMERCE_ACCESSORIES_SECTIONS', prefix: 'accessories', domain: 'Fashion Accessories' },
  { key: 'fashion@v1', constName: 'FASHION_SECTIONS', prefix: 'fashion', domain: 'Fashion & Apparel' },
  { key: 'furniture@v1', constName: 'FURNITURE_SECTIONS', prefix: 'furniture', domain: 'Furniture & Interior' },
  { key: 'security@v1', constName: 'SECURITY_SECTIONS', prefix: 'security', domain: 'Security Solutions' },
  { key: 'security-2@v1', constName: 'SECURITY2_SECTIONS', prefix: 'security2', domain: 'Enterprise Security' },
  { key: 'consultancy@v1', constName: 'CONSULTANCY_SECTIONS', prefix: 'consultancy', domain: 'Consultancy & Advisory' },
  { key: 'public-speaking@v1', constName: 'PUBLIC_SPEAKING_SECTIONS', prefix: 'public-speaking', domain: 'Keynote & Speaking' },
  { key: 'finance@v1', constName: 'FINANCE_SECTIONS', prefix: 'finance', domain: 'Financial Advisory' },
  { key: 'saas@v1', constName: 'SAAS_SECTIONS', prefix: 'saas', domain: 'SaaS Platform' },
  { key: 'marketplace@v1', constName: 'MARKETPLACE_SECTIONS', prefix: 'marketplace', domain: 'Multi-Vendor Marketplace' },
  { key: 'portfolio@v1', constName: 'PORTFOLIO_SECTIONS', prefix: 'portfolio', domain: 'Creative Portfolio' },
  { key: 'blog@v1', constName: 'BLOG_SECTIONS', prefix: 'blog', domain: 'Editorial & Blog' },
  { key: 'media@v1', constName: 'MEDIA_SECTIONS', prefix: 'media', domain: 'Media & Entertainment' },
  { key: 'nonprofit@v1', constName: 'NONPROFIT_SECTIONS', prefix: 'nonprofit', domain: 'Charity & Non-Profit' },
  { key: 'delivery@v1', constName: 'DELIVERY_SECTIONS', prefix: 'delivery', domain: 'Courier & Food Delivery' },
  { key: 'directory@v1', constName: 'DIRECTORY_SECTIONS', prefix: 'directory', domain: 'Business Directory' },
  { key: 'events@v1', constName: 'EVENTS_SECTIONS', prefix: 'events', domain: 'Live Events & Conferences' },
  { key: 'ghuba@v1', constName: 'GHUBA_SECTIONS', prefix: 'ghuba', domain: 'Ghuba Multi-Store' },
  { key: 'default-site@v1', constName: 'DEFAULT_SECTIONS', prefix: 'default-site', domain: 'Standard Storefront' },
];

const POLISHED_NAMES = {
  HeroSlider: "Hero Banner Slider",
  HeroSection: "Hero Showcase",
  Hero: "Hero Showcase",
  EnhancedHeroSection: "Interactive Hero Showcase",
  MediaHeroSection: "Media Hero Spotlight",
  HeroBanner: "Hero Banner",
  HeroComponent: "Hero Presentation",
  BannerSlider: "Banner Slider",
  AbSection: "About & Brand Story",
  TeamSection: "Our Team",
  ServicesSection: "Our Services",
  GreyServicesSection: "Services & Capabilities",
  BookingSection: "Online Booking",
  BookingFormSection: "Booking & Scheduling Form",
  TestimonialsCarouselSection: "Customer Reviews Carousel",
  TestimonialsSection: "Customer Testimonials",
  EnhancedTestimonialsSection: "Verified Customer Reviews",
  TestimonialsNewsSection: "Client Stories & Updates",
  TestimonialSection: "Client Feedback",
  WorkShowcase: "Our Work & Portfolio",
  ProcessTimeline: "Process & Milestones Timeline",
  ProcessWorkflowSection: "How We Work Workflow",
  SocialProofSection: "Social Proof & Partners",
  NetworkMap: "Coverage Network Map",
  BlogSection: "Articles & Industry Insights",
  PopularBlogsSection: "Popular Articles",
  LatestNewsSection: "Latest News & Releases",
  StaffWritersSection: "Editorial Team & Authors",
  LatestPodcastSection: "Latest Podcasts & Media",
  ContactSection: "Contact & Location",
  CallToActionSection: "Call to Action",
  CtaSection: "Get Started CTA",
  CtaBoldSection: "Action & Support CTA",
  EnhancedPricingSection: "Pricing Plans & Tiers",
  PricingSection: "Packages & Pricing",
  PricingAndStatsSection: "Pricing & Metrics",
  ConsultationPackagesSection: "Consultation Packages",
  EnhancedFAQsSection: "Frequently Asked Questions",
  FAQSection: "Frequently Asked Questions",
  FAQsSection: "Frequently Asked Questions",
  FaqsSection: "Frequently Asked Questions",
  RestaurantFAQs: "Dining FAQs",
  FeaturesSection: "Key Features & Benefits",
  FeaturesBarSection: "Trust & Guarantees Bar",
  StoreFeatures: "Store Highlights & Guarantees",
  CoreHighlightsSection: "Core Highlights",
  AboutUsSpotlight: "About Us Spotlight",
  ProgramsCausesSection: "Programs & Causes",
  ImpactStatsSection: "Impact & Key Statistics",
  EventsUpdatesSection: "Upcoming Events & Updates",
  NewsSection: "Press & Announcements",
  CategoriesSection: "Shop by Category",
  CategorySection: "Featured Categories",
  CategoryCarousel: "Categories Carousel",
  TopCate: "Top Categories",
  EnhancedCategoriesSection: "Curated Categories",
  FeaturedCategoriesSection: "Topic Categories",
  BrowseByCategory: "Browse by Category",
  DynamicPopularProducts: "Popular Products",
  PopularProductsSection: "Popular Products",
  DynamicTrending: "Trending Items",
  DynamicDailyBestSells: "Daily Best Sellers",
  AllProducts: "All Products Showcase",
  StorePageSection: "Marketplace Store Directory",
  WeeklyProducts: "Weekly Featured Items",
  RoomSection: "Shop by Room",
  USPSlider: "Why Choose Us Strip",
  WhyChooseUs: "Why Choose Us",
  WhyChooseUsSection: "Why Clients Choose Us",
  CaseStudiesSection: "Case Studies & Results",
  CaseStudiesTestimonials: "Proven Case Studies",
  DiscoveryCallSection: "Book a Discovery Call",
  GettingStartedSection: "Getting Started Guide",
  MarketplaceListingsSection: "Verified Listings",
  BusinessSection: "Business Solutions",
  PracticeAreasSection: "Practice Areas & Expertise",
  MeetOurExperts: "Meet Our Senior Advisors",
  HowItWorks: "How It Works",
  HowItWorksSection: "How It Works Process",
  FeaturedListings: "Featured Listings",
  FeaturedListingsOverviewSection: "Listings Overview",
  FeaturedListingsWrapper: "Featured Properties",
  ListingsSection: "Active Listings",
  Listings: "Directory Listings",
  ListingsGrid: "Available Listings Grid",
  ClassesGrid: "Class Schedules & Programs",
  LocationsSection: "Studio Locations",
  TrendingLocations: "Trending Locations",
  VirtualTours: "Virtual Tours & Videos",
  VideoShowcaseSection: "Video Showcase",
  ExpertsSection: "Certified Trainers & Experts",
  MarketInsights: "Market Insights & Trends",
  MarketInsightsSection: "Market Trends Analysis",
  GallerySection: "Photo & Facility Gallery",
  AppPromotionSection: "Download Our Mobile App",
  MobileAppPromo: "Mobile App Access",
  NewsletterSignup: "VIP Restock Alerts",
  NewsletterSection: "VIP Newsletter Subscription",
  PromoSection: "Promotional Spotlight Banner",
  SecondPromoSection: "Special Offers Banner",
  FlashDeals: "Flash Deals & Limited Drops",
  Discount: "Exclusive Discount Offers",
  Shop: "Full Catalog Showcase",
  Annocument: "Important Announcements",
  Wrapper: "Storefront Highlights",
  NewArrivals: "New Arrivals",
  NewArrivalsSection: "Latest Arrivals",
  ProductShowcaseGrid: "Product Showcase Grid",
  ProductShowcaseSection: "Signature Showcase",
  NewsletterPromoGrid: "Promotional Deals Grid",
  PromoBannerGridSection: "Special Promotions Grid",
  PromoBanners: "Seasonal Promo Banners",
  FeatureGrid: "Features & Specifications Grid",
  FeatureSection: "Craftsmanship & Features",
  MeetTheWatchmaker: "Master Craftsman Story",
  MissionNewsSection: "Mission & Sustainability News",
  ProductCommunitySection: "Community & Artisan Heritage",
  QualityStandards: "Quality Certification Standards",
  AppointmentSection: "Book a Fitting Appointment",
  LatestUpdates: "News & Industry Updates",
  MetricsSection: "Guarantees & Performance Metrics",
  AwardsSection: "Industry Awards & Honors",
  TopPicksCarousel: "Top Editor Picks",
  LatestReleasesSection: "Latest Content Releases",
  FeaturedArticlesSection: "In-Depth Editorial Features",
  LatestVideosSection: "Video Highlights",
  TestimonialsSlider: "Viewer Reviews Slider",
  PromotionSection: "Special Promotions",
  LiveEventsSection: "Upcoming Live Events",
  ExcellenceSection: "Standards of Excellence",
  CleaningTipsSection: "Helpful Advice & Tips",
  GetStartedSection: "Ready to Get Started",
  MassageFeatures: "Specialized Service Features",
  BenefitsSection: "Member Benefits & Perks",
  StyleGallerySection: "Styles & Portfolio Gallery",
  DefaultSite: "Storefront Main Page"
};

function humanize(compName) {
  if (POLISHED_NAMES[compName]) return POLISHED_NAMES[compName];
  return compName
    .replace(/^Dynamic/, '')
    .replace(/Section$/, '')
    .replace(/Wrapper$/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
}

function getSectionType(comp) {
  const l = comp.toLowerCase();
  if (l.includes('hero') || l.includes('banner') || l.includes('slider')) return 'hero';
  if (l.includes('product') || l.includes('listing') || l.includes('vehicle') || l.includes('deal') || l.includes('dish') || l.includes('shop') || l.includes('arrival') || l.includes('bestsell') || l.includes('topcate') || l.includes('weekly')) return 'productGrid';
  if (l.includes('cate')) return 'categoryGrid';
  if (l.includes('testim') || l.includes('review')) return 'testimonials';
  if (l.includes('faq')) return 'faq';
  if (l.includes('contact') || l.includes('form')) return 'contact';
  if (l.includes('news') && l.includes('letter')) return 'newsletter';
  if (l.includes('pricing') || l.includes('package')) return 'pricing';
  if (l.includes('feature') || l.includes('badge') || l.includes('usp') || l.includes('metric') || l.includes('award') || l.includes('standard') || l.includes('highlight')) return 'featuresBadges';
  if (l.includes('promo') || l.includes('cta') || l.includes('discount') || l.includes('annocu') || l.includes('banner')) return 'ctaBanner';
  if (l.includes('about') || l.includes('team') || l.includes('story') || l.includes('absection') || l.includes('work') || l.includes('timeline') || l.includes('process') || l.includes('map') || l.includes('spotlight') || l.includes('cause') || l.includes('stat') || l.includes('expert') || l.includes('doctor') || l.includes('patient') || l.includes('service') || l.includes('practice') || l.includes('case')) return 'imageWithText';
  return 'custom';
}

function getCategory(comp) {
  const l = comp.toLowerCase();
  if (l.includes('hero') || l.includes('banner') || l.includes('slider')) return 'hero';
  if (l.includes('product') || l.includes('listing') || l.includes('deal') || l.includes('cate') || l.includes('shop') || l.includes('vehicle') || l.includes('arrival') || l.includes('dish') || l.includes('weekly')) return 'commerce';
  if (l.includes('testim') || l.includes('review') || l.includes('social') || l.includes('award') || l.includes('metric')) return 'social';
  if (l.includes('promo') || l.includes('cta') || l.includes('discount') || l.includes('news') || l.includes('pricing') || l.includes('book') || l.includes('start') || l.includes('call') || l.includes('appointment')) return 'conversion';
  return 'content';
}

function getDataSource(comp) {
  const l = comp.toLowerCase();
  if (l.includes('testim') || l.includes('review')) return `{ type: "testimonials" }`;
  if (l.includes('cate')) return `{ type: "categories" }`;
  if (l.includes('promo') || l.includes('discount') || l.includes('deal') || l.includes('offer')) return `{ type: "promotions" }`;
  if (l.includes('product') || l.includes('listing') || l.includes('vehicle') || l.includes('bestsell') || l.includes('trending') || l.includes('popular') || l.includes('arrival') || l.includes('dish') || l.includes('weekly')) {
    const filter = l.includes('trend') ? 'trending' : (l.includes('sell') ? 'bestsellers' : (l.includes('arrival') || l.includes('latest') ? 'latest' : 'featured'));
    return `{ type: "products", filter: "${filter}", limit: 8 }`;
  }
  return null;
}

function getEditableProps(comp) {
  const l = comp.toLowerCase();
  if (l.includes('hero') || l.includes('slider') || l.includes('banner')) {
    return '["headline", "subline", "buttonText", "buttonLink", "imageUrl"]';
  }
  if (l.includes('product') || l.includes('listing') || l.includes('deal') || l.includes('shop') || l.includes('weekly')) {
    return '["title", "subtitle", "limit"]';
  }
  if (l.includes('promo') || l.includes('cta') || l.includes('discount')) {
    return '["title", "subtitle", "buttonText", "buttonLink"]';
  }
  if (l.includes('testim') || l.includes('review') || l.includes('faq')) {
    return '["title", "subtitle"]';
  }
  if (l.includes('news') && l.includes('letter')) {
    return '["title", "subtitle", "buttonText"]';
  }
  if (l.includes('contact') || l.includes('booking') || l.includes('appointment')) {
    return '["title", "subtitle", "buttonText"]';
  }
  return '["title", "subtitle", "description"]';
}

function getDefaultContent(comp, domain) {
  const human = humanize(comp);
  const l = comp.toLowerCase();
  if (l.includes('hero') || l.includes('slider') || l.includes('banner')) {
    return `{
      headline: "Premium ${domain}",
      subline: "Authentic quality, curated selections, and reliable service tailored for you.",
      buttonText: "Explore Collection",
      buttonLink: "/products",
    }`;
  }
  if (l.includes('product') || l.includes('listing') || l.includes('deal') || l.includes('dish') || l.includes('vehicle') || l.includes('arrival')) {
    return `{
      title: "${human}",
      subtitle: "Discover our latest and most popular items in ${domain}",
      limit: 8,
    }`;
  }
  if (l.includes('cate')) {
    return `{
      title: "Explore by Category",
      subtitle: "Browse our curated departments and collections",
    }`;
  }
  if (l.includes('testim') || l.includes('review')) {
    return `{
      title: "What Our Customers Say",
      subtitle: "Real stories from satisfied clients and verified buyers",
    }`;
  }
  if (l.includes('faq')) {
    return `{
      title: "Frequently Asked Questions",
      subtitle: "Find answers to common questions about our ${domain}",
    }`;
  }
  if (l.includes('news') && l.includes('letter')) {
    return `{
      title: "Join Our VIP List",
      subtitle: "Subscribe for exclusive updates, drops and special vouchers.",
      buttonText: "Subscribe",
    }`;
  }
  if (l.includes('promo') || l.includes('cta')) {
    return `{
      title: "Exclusive Limited Offer",
      subtitle: "Save big on selected items while supplies last.",
      buttonText: "Claim Offer",
      buttonLink: "/products",
    }`;
  }
  if (l.includes('contact') || l.includes('booking') || l.includes('appointment')) {
    return `{
      title: "${human}",
      subtitle: "Reach out to our specialist team for inquiries and bookings.",
      buttonText: "Get in Touch",
    }`;
  }
  return `{
    title: "${human}",
    subtitle: "Built with passion and dedication to excellence.",
    description: "Discover how our ${domain} experience delivers the highest standards of quality.",
  }`;
}

const ignoredComponents = new Set([
  'FireIcon', 'HeartIcon', 'StarIconSolid', 'Bars3CenterLeftIcon',
  'MagnifyingGlassCircleIcon', 'ShoppingBagIcon', 'BellIcon', 'UserCircleIcon',
  'StarSolid', 'StarOutline', 'ReviewItem', 'XMarkIcon', 'TrashIcon',
  'MiniCartPreview', 'ArrowUpCircleIcon', 'HomeIcon', 'ArrowPathIcon', 'EnvelopeIcon'
]);

let code = '';

TARGET_TEMPLATES.forEach(t => {
  const data = exact[t.key];
  if (!data) return;
  const validComps = (data.components || []).filter(c => !ignoredComponents.has(c));
  
  code += `\nconst ${t.constName}: AuthenticSectionDefinition[] = [\n`;
  validComps.forEach((comp, idx) => {
    const secId = `${t.prefix}-${comp.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const name = humanize(comp);
    const type = getSectionType(comp);
    const cat = getCategory(comp);
    const props = getEditableProps(comp);
    const defContent = getDefaultContent(comp, t.domain);
    const ds = getDataSource(comp);

    code += `  {\n`;
    code += `    id: "${secId}",\n`;
    code += `    name: "${name}",\n`;
    code += `    component: "${comp}",\n`;
    code += `    type: "${type}",\n`;
    code += `    category: "${cat}",\n`;
    code += `    editableProps: ${props},\n`;
    code += `    defaultContent: ${defContent},\n`;
    if (ds) {
      code += `    dataSource: ${ds},\n`;
    }
    code += `  },\n`;
  });
  code += `];\n`;
});

fs.writeFileSync('scratch/generated-authentic-sections.ts', code);
console.log('Generated authentic section arrays successfully!');
