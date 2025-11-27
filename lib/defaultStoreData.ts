import { PolicyType, SocialChannel, StoreForm } from "@/types/typings";

const now = new Date();
const in3Days = new Date(now.getTime() + 3 * 24 * 3600 * 1000);
const in1Day  = new Date(now.getTime() +   1 * 24 * 3600 * 1000);

// NOTE: Placeholder URLs are used for images as actual assets are not available here.
const getSampleImageUrl = (category: string) => `https://placehold.co/600x400?text=${encodeURIComponent(category)}&font=roboto`;

// 1) Define your master baseData (keeping this as-is)
const baseData: Partial<StoreForm> = {
  tagline: "",
  description: "",
  currency: "USD",
  locale: "en-US",
  companyCategoryId: undefined,
  socialLinks: [],
  policies: [],
  faqs: [],
  testimonials: [],
  heroSlides: [],
  promotions: [],
  pageSections: [],
  StoreCategory: [],
  appPromos: [],
  Collection: [],
  events: [],
  Announcement: [],
  awards: [],
  metrics: [],
  stats: [],
  pricingTiers: [],
  themeSettings: {},
  seo: {
    id: "",
    description: null,
    title: null,
    keywords: []
  },
  analyticsConfig: {
    id: "",
    googleTag: null,
    facebookTag: null,
    hotjarSiteId: null,
    isActive: false
  },
  paymentSettings: {
    id: "",
    mpesaShortcode: null,
    mpesaConsumerKey: null,
    mpesaConsumerSecret: null,
    mpesaCallbackUrl: null,
    isStripeEnabled: false,
    isPaypalEnabled: false,
    isMpesaEnabled: false,
    isPaystackEnabled: false,
    isGhubaEnabled: false,
    paystackPublicKey: null,
    paystackSecretKey: null,
    ghubaMerchantId: null,
    ghubaApiKey: null,
    mpesaPasskey: null,
    mpesaSecret_encrypted: null,
    mpesaSecret_iv: null,
    mpesaSecret_tag: null,
    stripePublishableKey: null,
    stripeSecretKey: null,
    paypalClientId: null,
    paypalClientSecret: null,
    stripeSecret_encrypted: null,
    stripeSecret_iv: null,
    stripeSecret_tag: null,
    paypalSecret_encrypted: null,
    paypalSecret_iv: null,
    paypalSecret_tag: null,
    paystackSecret_encrypted: null,
    paystackSecret_iv: null,
    paystackSecret_tag: null,
    ghubaSecret_encrypted: null,
    ghubaSecret_iv: null,
    ghubaSecret_tag: null
  },
  shippingSettings: {
    id: "",
    carrierName: null,
    trackingUrl: null,
    regions: null,
    enablePickup: null,
    pickupInstructions: null
  },
};

// 2) Helper to merge category-specific overrides
function withOverrides(overrides: Partial<StoreForm>): Partial<StoreForm> {
  return {
    ...baseData,
    ...overrides,
    // Ensure date fields in promotions are Date objects
    promotions: (overrides.promotions || []).map(promo => ({
      ...promo,
      startsAt: promo.startsAt ? new Date(promo.startsAt as any) : now,
      endsAt:   promo.endsAt   ? new Date(promo.endsAt as any)   : in3Days,
    })),
  };
}

// 3) All your categories in one map:
export function getCategoryDefaultData(category: string): Partial<StoreForm> {
  const samples: Record<string, Partial<StoreForm>> = {
    "E-commerce": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description: "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        { channel: SocialChannel.INSTAGRAM, url: "https://insta.com/onlinestore" },
        { channel: SocialChannel.TWITTER, url: "https://twitter.com/onlinestore" }
      ],
      policies: [
        { type: PolicyType.SHIPPING, content: "Free standard shipping on all orders over $50. Express options available." },
        { type: PolicyType.RETURNS,  content: "30-day money-back guarantee. Item must be unworn/unused." },
        { type: PolicyType.PRIVACY, content: "We respect your privacy and protect your data with industry-standard security." }
      ],
      awards: [
        { name: "Best Online Retailer 2023", iconUrl: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000" },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
      ],
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
      ],
      faqs: [
        { question: "What payment methods do you accept?", answer: "Visa, Mastercard, PayPal, and Apple Pay.", order: 1 },
        { question: "How long does shipping take?", answer: "Standard shipping takes 5-7 business days.", order: 2 },
        { question: "Can I track my order?", answer: "Yes, tracking information is emailed once your order ships.", order: 3 },
      ],
      testimonials: [
        { authorName: "Alex R.", quote: "The quality exceeded my expectations. Fast delivery too!", rating: 5 },
        { authorName: "Mia K.", quote: "I found the perfect gift here. Great customer service.", rating: 5 },
        { authorName: "Liam S.", quote: "Easy to navigate site and hassle-free returns.", rating: 4 }
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl('ecommerce'), headline: "Summer Collection: Up to 50% Off", subline: "Limited time offer on all apparel.", ctaText: "Shop Sale", ctaLink: "/shop/sale",
          id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Best Deals", endsAt: in3Days, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal", description: "Get an extra 10% off using code WKND10.", ctaText: "Activate Code", ctaLink: "/deals", bannerUrl: getSampleImageUrl('flash-deal'),
          companyId: "", perks: [{id:"",label:"Free Gift",icon:"StarIcon"}, {id:"",label:"10% off",icon:""}], trustLogos: []
        },
      ],
      Collection: [{ name: "Best Sellers", description: "Our top selling products this month." } as any],
      pricingTiers: [{ name: "Standard", price: 0, duration: "monthly", features: ["Access to shop", "Email updates"] }],
    }),

    "Consultant & Coach": withOverrides({
      tagline: "**Transform Your Career.** Unlock Your Potential.",
      description: "High-performance coaching and **strategic consulting** for executives and leaders seeking rapid growth.",
      socialLinks: [{ channel: SocialChannel.LINKEDIN, url: "https://linkedin.com/in/coach" }],
      policies:    [{ type: PolicyType.TERMS, content: "Confidentiality and payment terms apply to all coaching packages." }],
      faqs:        [{ question: "What packages do you offer?", answer: "We offer 1:1, group, and corporate coaching programs.", order: 1 }],
      testimonials:[{ authorName: "Emily W.", quote: "My revenue doubled after 6 months of executive coaching. Highly recommend!", rating: 5 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('coach'), headline: "Ready for the Next Step?", subline: "Schedule your free 15-minute intro call today.", ctaText: "Book Free Call", ctaLink: "/book",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "New Clients", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      metrics:      [{ label: "Clients Mentored", value: 350 }],
      stats:        [{ label: "Average Growth", value: "35% YOY" }],
      pricingTiers: [
        { name: "Intro Session", price: 199, duration: "one-time", features: ["60-min strategy session"] },
        { name: "VIP Program", price: 2999, duration: "monthly", features: ["Weekly 1:1 calls", "Unlimited email access"] }
      ],
    }),

    "Public Speaking": withOverrides({
      tagline: "**Inspire Audiences.** Book Your Next Keynote.",
      description: "An experienced speaker delivering **impactful presentations** on technology, leadership, and future trends.",
      socialLinks: [{ channel: SocialChannel.YOUTUBE, url: "https://youtube.com/speaker" }],
      faqs:        [{ question: "What are your popular speaking topics?", answer: "AI in business, Future of Work, and High-Performance Teams.", order: 1 }],
      testimonials:[{ authorName: "Jane D.", quote: "Incredible energy and insight. A true professional!", rating: 5 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('public-speaking'), headline: "Book Me for Your Event", subline: "Delivering memorable keynotes globally.", ctaText: "View Topics", ctaLink: "/topics",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Keynote Speaker", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      events:       [{ title: "Tech Summit Keynote", date: in1Day, location: "Online" } as any],
      awards:       [{ name: "Top 10 Speaker 2024", iconUrl: "/icons/award.svg" }],
    }),

    "Shoes Store": withOverrides({
      tagline: "**Step into Style.** Premium Footwear.",
      description: "Discover the perfect pair for any occasion with our curated selection of **comfort, performance, and fashion**.",
      socialLinks: [{ channel: SocialChannel.INSTAGRAM, url: "https://insta.com/shoes" }],
      policies:    [{ type: PolicyType.SHIPPING, content: "Free returns on all footwear orders." }],
      faqs:        [{ question: "What is your sizing guide?", answer: "Check our detailed chart on the product page, or contact support for help.", order: 1 }],
      testimonials:[{ authorName: "Sara L.", quote: "The most comfortable running shoes I've ever owned!", rating: 5 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('shoes-store'), headline: "New Arrivals: The Glide 5000", subline: "Engineered for speed and comfort.", ctaText: "Shop Running", ctaLink: "/shop/running",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Performance", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      Collection: [{ name: "Best Sellers Sneakers", description: "Our most popular everyday shoes." } as any],
    }),

    "Service Provider": withOverrides({
      tagline: "Trusted and **Vetted Home Services**",
      description: "Connect with certified professionals quickly and reliably for plumbing, electrical, and maintenance needs.",
      socialLinks: [{ channel: SocialChannel.LINKEDIN, url: "https://linkedin.com/company/services" }],
      policies:    [{ type: PolicyType.TERMS, content: "All service work is covered by a 90-day guarantee." }],
      faqs:        [{ question: "Are your providers insured?", answer: "Yes, all our professionals are fully licensed and insured.", order: 1 }],
      testimonials:[{ authorName: "Mia K.", quote: "Excellent service! Fixed my leak within an hour of booking.", rating: 5 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('service-provider'), headline: "Need a Repair? Get a Quote.", subline: "Local experts ready to help, 24/7.", ctaText: "Get Free Quote", ctaLink: "/quote",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "24/7 Support", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      metrics:      [{ label: "Jobs Completed", value: 5000 }],
      stats:        [{ label: "Avg. Customer Rating", value: "4.8/5" }],
      pricingTiers: [{ name: "Standard Callout", price: 50, duration: "hourly", features: ["Quality guarantee", "Vetted professionals"] }],
    }),

    "Booking & Appointments": withOverrides({
      tagline: "Schedule Your Service in Minutes",
      description: "Find available slots and **book appointments** online seamlessly for our premium services.",
      socialLinks: [{ channel: SocialChannel.FACEBOOK, url: "https://fb.com/bookinghub" }],
      policies:    [{ type: PolicyType.PRIVACY, content: "Your booking data is secured and never shared." }],
      faqs:        [{ question: "Can I reschedule my appointment?", answer: "Yes, up to 24 hours before your scheduled time via the confirmation link.", order: 1 }],
      testimonials:[{ authorName: "John D.", quote: "The booking process was incredibly smooth and fast.", rating: 4 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('booking-appointments'), headline: "See What's Open", subline: "Instant confirmation for all bookings.", ctaText: "Book Now", ctaLink: "/scheduler",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Fast & Easy", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      metrics:      [{ label: "Monthly Bookings", value: 1200 }],
      stats:        [{ label: "Client Retention", value: "95%" }],
      pricingTiers: [{ name: "Initial Consult", price: 20, duration: "per appointment", features: ["Online confirmation"] }],
    }),

    "Portfolio & Personal Branding": withOverrides({
      tagline: "**Design. Code. Create.** See My Latest Projects.",
      description: "Showcasing a blend of **creative design**, technical development skills, and professional experience.",
      socialLinks: [{ channel: SocialChannel.LINKEDIN, url: "https://linkedin.com/in/designer" }],
      faqs:        [{ question: "What are your core skills?", answer: "React, Node.js, and UX/UI Design.", order: 1 }],
      testimonials:[{ authorName: "Client XYZ", quote: "Highly recommended for challenging projects and creative solutions.", rating: 5 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('portfolio'), headline: "Let's Build Something Great", subline: "Available for freelance and full-time opportunities.", ctaText: "View CV", ctaLink: "/cv",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Creative Pro", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
    }),

    "Blog & Content": withOverrides({
      tagline: "**Deep Dive** into Modern Technology & Culture.",
      description: "Daily articles, reviews, and tutorials covering **AI, software development, and futurism.** Join the discussion!",
      socialLinks: [{ channel: SocialChannel.TWITTER, url: "https://twitter.com/techblog" }],
      faqs:        [{ question: "How often do you post?", answer: "We publish new articles every Monday, Wednesday, and Friday.", order: 1 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('blog'), headline: "The Future of AI is Here", subline: "Read the latest post on machine learning ethics.", ctaText: "Read Now", ctaLink: "/article/ai-ethics",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Trending", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      Collection: [{ name: "Popular Articles", description: "The most read posts this month." } as any],
    }),

    "Nonprofit & Community": withOverrides({
      tagline: "**Making a Difference**, One Donation at a Time.",
      description: "Our mission is to support **local education initiatives**. See how your contribution helps.",
      socialLinks: [{ channel: SocialChannel.INSTAGRAM, url: "https://insta.com/nonprofit" }],
      faqs:        [{ question: "Where does my donation go?", answer: "95% of all donations directly fund student scholarships.", order: 1 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('nonprofit'), headline: "Help Us Reach Our Goal", subline: "Every dollar provides a child with educational resources.", ctaText: "Donate Now", ctaLink: "/donate",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Support Us", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      metrics:      [{ label: "Funds Raised", value: 50000 }],
      awards:       [{ name: "Community Impact 2024", iconUrl: "/icons/award.svg" }],
    }),

    "Healthcare & Clinics": withOverrides({
      tagline: "**Compassionate Care** You Can Trust",
      description: "Providing comprehensive **health and wellness services** with patient-first technology and experienced staff.",
      socialLinks: [{ channel: SocialChannel.FACEBOOK, url: "https://fb.com/clinic" }],
      faqs:        [{ question: "Do you accept my insurance?", answer: "We accept most major PPO and HMO plans. Call us to verify.", order: 1 }],
      testimonials:[{ authorName: "Maria G.", quote: "The staff was kind and helpful, and the facility was very clean.", rating: 5 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('healthcare'), headline: "Prioritize Your Health", subline: "Book your annual checkup online today.", ctaText: "Book Appointment", ctaLink: "/booking",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Patient Care", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      services: [ { title: "Pediatrics", description: "Care for children 0-18" } as any],
    }),

    "Media & Entertainment": withOverrides({
      tagline: "Your Source of **Original Entertainment**",
      description: "Showcasing the latest trailers, exclusive behind-the-scenes content, and upcoming film/series releases.",
      socialLinks: [{ channel: SocialChannel.YOUTUBE, url: "https://youtube.com/studio" }],
      faqs:        [{ question: "How can I audition?", answer: "Please submit your portfolio via our talent contact page.", order: 1 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('media'), headline: "New Series Launching This Fall", subline: "Watch the thrilling trailer now.", ctaText: "Watch Trailer", ctaLink: "/trailer",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Exclusive", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
    }),

    "Finance & Legal": withOverrides({
      tagline: "**Expert Financial & Legal Services**",
      description: "Trusted advisors providing strategic financial planning and comprehensive legal counsel for businesses and individuals.",
      socialLinks: [{ channel: SocialChannel.LINKEDIN, url: "https://linkedin.com/company/financelegal" }],
      faqs:        [{ question: "How much is an initial consultation?", answer: "The first 30 minutes are complimentary.", order: 1 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('finance-legal'), headline: "Plan Your Future Today", subline: "Schedule a secure consultation with our certified experts.", ctaText: "Get Started", ctaLink: "/contact",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Confidential", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      stats:        [{ label: "Client Satisfaction", value: "98%" }],
    }),

    "Automotive": withOverrides({
      tagline: "**Drive Your Dream Car.** Best Deals Guaranteed.",
      description: "The premier car dealership in the region, offering new and used vehicles, servicing, and financing options.",
      socialLinks: [{ channel: SocialChannel.FACEBOOK, url: "https://fb.com/cardealer" }],
      faqs:        [{ question: "Can I schedule a test drive online?", answer: "Yes, use our booking tool to select a vehicle and time slot.", order: 1 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('automotive'), headline: "0% APR Financing", subline: "On select new models for a limited time.", ctaText: "View Inventory", ctaLink: "/inventory",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Special Offer", endsAt: in3Days, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      Collection: [{ name: "Sedans", description: "Economical and reliable models." } as any],
    }),

    "Travel & Tourism": withOverrides({
      tagline: "**Explore the World.** Book Your Adventure.",
      description: "Promote travel packages, custom itineraries, and services for unforgettable global destinations.",
      socialLinks: [{ channel: SocialChannel.INSTAGRAM, url: "https://insta.com/travelagency" }],
      faqs:        [{ question: "Do you offer travel insurance?", answer: "Yes, we recommend our comprehensive insurance package with all bookings.", order: 1 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('travel'), headline: "Bali Beach Retreat: 7 Days", subline: "All-inclusive package starts at $1,200.", ctaText: "View Details", ctaLink: "/packages/bali",
        id: "", companyId: "", productImageUrl: null, badgeText: "Top Rated", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image',
        price: "1200", 
      }],
      events:       [{ title: "Travel Info Webinar", date: in1Day } as any],
    }),

    "Fitness & Wellness": withOverrides({
      tagline: "Your Health, Our Priority. **Start Your Journey.**",
      description: "A comprehensive gym and fitness center offering classes, personal training, and wellness consultations.",
      socialLinks: [{ channel: SocialChannel.INSTAGRAM, url: "https://insta.com/gym" }],
      faqs:        [{ question: "Do you have a free trial?", answer: "Yes, enjoy a free 7-day pass!", order: 1 }],
      testimonials:[{ authorName: "Mark C.", quote: "Great equipment and highly motivating trainers.", rating: 5 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('fitness'), headline: "New Year, New Goals", subline: "Get 3 months free when you sign up annually.", ctaText: "Join Now", ctaLink: "/membership",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "New Offer", endsAt: in3Days, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      pricingTiers: [
        { name: "Monthly Pass", price: 49, duration: "monthly", features: ["Access to all equipment"] },
        { name: "Premium Pass", price: 99, duration: "monthly", features: ["All-access", "5 personal training sessions"] }
      ],
    }),

    "Directory & Listings": withOverrides({
      tagline: "**Find What You Need** in Your City",
      description: "The ultimate local resource to **list and discover businesses**, services, and community events.",
      faqs:        [{ question: "How do I list my business?", answer: "Click 'Add Listing' and choose your plan.", order: 1 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('directory'), headline: "Search 5,000+ Local Businesses", subline: "Restaurants, repair shops, and more.", ctaText: "Start Search", ctaLink: "/listings",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Local", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      pricingTiers: [{ name: "Standard Listing", price: 9, duration: "monthly", features: ["Name & contact info"] }],
    }),

    "Educational & Online Courses": withOverrides({
      tagline: "**Learn New Skills.** Advance Your Career.",
      description: "High-quality, self-paced online courses taught by industry leaders in technology and business.",
      socialLinks: [{ channel: SocialChannel.YOUTUBE, url: "https://youtube.com/onlinelearning" }],
      faqs:        [{ question: "Are courses certified?", answer: "Yes, receive a certificate of completion for all paid courses.", order: 1 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('education'), headline: "Enroll in the Data Science Bootcamp", subline: "Master Python and machine learning in 12 weeks.", ctaText: "View Course", ctaLink: "/course/data-science",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "New Course", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      pricingTiers: [
        { name: "Single Course", price: 199, duration: "one-time", features: ["Lifetime access", "Certificate"] },
      ],
    }),

    "Restaurant & Food Delivery": withOverrides({
      tagline: "**Delicious Food Delivered** Hot & Fresh",
      description: "Browse our menu of gourmet dishes, order online, and get fast delivery right to your door.",
      socialLinks: [{ channel: SocialChannel.INSTAGRAM, url: "https://insta.com/restaurant" }],
      faqs:        [{ question: "What are your delivery zones?", answer: "We deliver within a 5-mile radius of the restaurant.", order: 1 }],
      heroSlides: [{
        imageUrl: getSampleImageUrl('restaurant'), headline: "Today's Special: Authentic Italian Pizza", subline: "Order now for 10% off your first online order.", ctaText: "View Menu", ctaLink: "/menu",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "New Offer", endsAt: in3Days, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      Collection: [{ name: "Signature Dishes", description: "Our chef's recommended plates." } as any],
    }),

    "Event & Ticketing": withOverrides({
      tagline: "**Discover Events** and Get Your Tickets.",
      description: "The easiest way to find and book tickets for concerts, conferences, and local events.",
      faqs:        [{ question: "Can I transfer my ticket?", answer: "Yes, tickets can be transferred up to 1 hour before the event start time.", order: 1 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('event'), headline: "Future Fest: Music & Tech", subline: "Tickets on sale now for the biggest event of the year.", ctaText: "Buy Tickets", ctaLink: "/tickets",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Limited Seats", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      events:       [{ title: "Opening Night Gala", date: in1Day, location: "City Auditorium" } as any],
    }),

    "Real Estate": withOverrides({
      tagline: "Your Key to a **New Home** Today",
      description: "The leading resource for **property listings**, sales, and rental management in the city.",
      socialLinks: [{ channel: SocialChannel.FACEBOOK, url: "https://fb.com/realestate" }],
      faqs:        [{ question: "What are the agent fees?", answer: "Our standard commission rate is 5% for sellers.", order: 1 }],
      testimonials:[{ authorName: "The Smith Family", quote: "Found our perfect apartment quickly and smoothly. Great agents!", rating: 5 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('real-estate'), headline: "Luxury Listings: Up to 50% Off", subline: "Explore exclusive properties in downtown.", ctaText: "Search Listings", ctaLink: "/properties",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Hot Market", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
    }),

    "SaaS & Web Apps": withOverrides({
      tagline: "**Automate Your Workflow.** Simplify Everything.",
      description: "Powerful cloud-based software designed to **streamline team collaboration** and boost productivity for remote teams.",
      socialLinks: [{ channel: SocialChannel.TWITTER, url: "https://twitter.com/saasapp" }],
      faqs:        [{ question: "Is there a free trial?", answer: "Yes, we offer a 14-day risk-free trial on all plans.", order: 1 }],
      testimonials:[{ authorName: "CEO, TechCorp", quote: "Essential tool for our startup. Saved us 10 hours a week.", rating: 5 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('saas'), headline: "Launch Your Free Trial Today", subline: "No credit card required. Cancel anytime.", ctaText: "Start Now", ctaLink: "/signup",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Cloud Powered", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      pricingTiers: [
        { name: "Basic", price: 9, duration: "monthly", features: ["5 Users", "Standard Support"] },
        { name: "Pro", price: 29, duration: "monthly", features: ["Unlimited Users", "Priority Support", "Advanced Analytics"] }
      ],
    }),

    "Marketplace": withOverrides({
      tagline: "Buy & Sell Locally, **The Easy Way**.",
      description: "The largest online **product marketplace** for connecting local buyers and sellers across all categories.",
      faqs:        [{ question: "How safe is the payment process?", answer: "We use secure escrow and verified payment gateways for all transactions.", order: 1 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('marketplace'), headline: "List Your Items for Free!", subline: "Start selling to thousands of local buyers today.", ctaText: "Start Selling", ctaLink: "/sell",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: "Local Deals", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
    }),

    'Security Services': withOverrides({
      tagline: "**Protect What Matters Most** with Expert Security Services",
      description: "Offering comprehensive security solutions including surveillance systems, alarm installations, and 24/7 monitoring to safeguard your home and business.",
      socialLinks: [{ channel: SocialChannel.LINKEDIN, url: "https://linkedin.com/company/securityservices" }],
      faqs:        [{ question: "What types of security systems do you offer?", answer: "We provide CCTV, alarm systems, access control, and more tailored to your needs.", order: 1 }],
      testimonials:[{ authorName: "David P.", quote: "Their team installed a top-notch security system for my business. Highly recommend!", rating: 5 }],
      heroSlides:  [{
        imageUrl: getSampleImageUrl('security-services'), 
        headline: "Secure Your Property Today", 
        subline: "Get a free consultation and quote for your security needs.", 
        ctaText: "Get Quote", ctaLink: "/contact",
        id: "", companyId: "", price: null, productImageUrl: null, badgeText: 
        "Trusted Security", endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: 'image'
      }],
      pricingTiers: [
        { name: "Basic Monitoring", price: 29, duration: "monthly", features: ["24/7 monitoring", "Mobile alerts"] },
        { name: "Premium Package", price: 59, duration: "monthly", features: ["All Basic features", "Advanced surveillance", "Priority support"] }
      ],
    }),

    // "Security Consulting" : withOverrides({ tagline:})
    
    // --- Remaining Stubbed Categories ---
    "Other":                            withOverrides({ tagline: "Tailored Solutions for Your Unique Idea", description: "A flexible starting point for any business or personal project not covered by other categories." }),
    "Tutors":                           withOverrides({ tagline: "**Expert Tutors**, Anytime, Anywhere", description: "Personalized online tutoring in Math, Science, and Languages for all grade levels." }),
    "Lecturer":                         withOverrides({ tagline: "Inspiring University Lectures Online", description: "Access thought-provoking lectures and research from leading academic professionals." }),
    "Teacher":                          withOverrides({ tagline: "Empowering Educators and Classrooms", description: "Resources and professional development for K-12 educators." }),
    "Students":                         withOverrides({ tagline: "Your Learning Hub: Resources & Tools", description: "Essential tools and study guides to help students succeed in university." }),
    "Pupils":                           withOverrides({ tagline: "Young Learners Welcome! Fun Education.", description: "Interactive learning materials and games for elementary school children." }),
    "Principal":                        withOverrides({ tagline: "Leadership in Education, Community Focus", description: "Information and updates from the School Principal on vision and policies." }),
    "School Head":                      withOverrides({ tagline: "Guiding Academic Excellence & Vision", description: "The Head of School's message, strategic plan, and news." }),
        
  };

  return samples[category] || baseData;
}