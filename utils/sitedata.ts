interface CategoryVariant {
  name: string;
  link: string;
  description: string;
  tag: "New" | "Popular" | "Standard";
}

interface Category {
  name: string;
  icon?: string;
  variants: CategoryVariant[];
}

export const SITE_CATEGORIES: Category[] = [
  { 
    name: "E-commerce", 
    icon: "🛒", 
    variants: [
      { name: "Modern Shop (v1)", link: "https://my-duka.salesmanpro.site", description: "Sleek design for apparel and accessories.", tag: 'Popular' },
      { name: "Digital Goods Store (v2)", link: "https://digital-shop.salesmanpro.site", description: "Optimized for selling software and courses.", tag: 'New' },
      { name: "Artisan Marketplace (v3)", link: "https://artisan-shop.salesmanpro.site", description: "Focuses on handcrafted and unique items.", tag: 'Standard' },
    ]
  },
  // {
  //   name: "Photography Portfolio",
  //   icon: "📸",
  //   variants: [
  //     { name: "Photo Gallery", link: "https://photography.salesmanpro.site", description: "Showcase your photography work.", tag: 'Popular' }
  //   ]
  // },
  {
    name: "Furniture Store",
    icon: "🛋️",
    variants: [
      { name: "Furniture Shop", link: "https://furniture.salesmanpro.site", description: "Elegant design for furniture products.", tag: 'Standard' }
    ]
  },
  {
    name: "Bike Store",
    icon: "🚲",
    variants: [
      { name: "Bike Store", link: "https://bike-store.salesmanpro.site", description: "Dynamic layout for bike products.", tag: 'Standard' }
    ]
  },
  {
    name: "Motorcycle Store",
    icon: "🏍️",
    variants: [
      { name: "Motorcycle Store", link: "https://motorcycle-store.salesmanpro.site", description: "Bold design for motorcycle products.", tag: 'Standard' }
    ]
  },
  {
    name: "Barbershop",
    icon: "💈",
    variants: [
      { name: "Barbershop", link: "https://barbershop.salesmanpro.site", description: "Classic design for barbershop services.", tag: 'Standard' }
    ]
  },
  {
    name: "Fashion Boutique",
    icon: "👗",
    variants: [
      { name: "Fashion Shop", link: "https://fashion.salesmanpro.site", description: "Trendy and stylish fashion products.", tag: 'Standard' }
    ]
  },
  { 
    name: "Consultant & Coach", 
    icon: "💡", 
    variants: [
      { name: "Executive Coach (v1)", link: "https://flourishhub.salesmanpro.site", description: "Professional, high-conversion landing page.", tag: 'Popular' },
      { name: "Wellness Retreat (v2)", link: "https://wellness-coach.salesmanpro.site", description: "Calm and inviting design for wellness services.", tag: 'Standard' },
    ]
  },
  { name: "Public Speaking", 
    icon: "🎙️", 
    variants: [
      { name: "Standard Speaker Site", link: "https://pflourishub.salesmanpro.site", description: "Bookings and media focus.", tag: 'Standard' }
    ] 
  },
  { name: "Shoes Store", icon: "👟", variants: [
    { name: "Shoes Store Classic", link: "https://shoesstore.salesmanpro.site", description: "Grid-based product layout.", tag: 'Standard' }
  ] 
},
  { name: "Service Provider", 
    icon: "🔧", variants: [
      { 
        name: "Agency Portfolio", link: "https://serviceprovider.salesmanpro.site", description: "Showcase services and case studies.", tag: 'Popular' 
      }
    ] 
  },
  { name: "Booking & Appointments", 
    icon: "📅", 
    variants: [
      { name: "Scheduler Hub", link: "https://bookings.salesmanpro.site", description: "Integrated calendar for easy booking.", tag: 'Standard' }
    ] 
  },
  { name: "Portfolio & Personal Branding", 
    icon: "👤", 
    variants: [
      { name: "Creative CV", link: "https://portfolio.salesmanpro.site", description: "Minimalist design for designers/writers.", tag: 'New' }
    ] 
  },
  { 
    name: "Blog & Content", 
    icon: "✍️", variants: 
    [{ name: "Modern Magazine", link: "https://blogs.salesmanpro.site", description: "High-readability blog layout.", tag: 'Popular' }

    ] 
  },
    { name: "Nonprofit & Community",
      icon: "🤝",
      variants: [
        { name: "Charity Connect", link: "https://nonprofit.salesmanpro.site", description: "Donation-focused design.", tag: 'Standard' }
      ]
    },
    { name: "Healthcare & Clinics",
      icon: "🏥",
      variants: [
        { name: "Clinic Pro", link: "https://healthcare.salesmanpro.site", description: "Patient-focused design.", tag: 'Standard' }
      ]
    },
    { name: "Media & Entertainment",
      icon: "🎬",
      variants: [
        { name: "Film Studio", link: "https://media.salesmanpro.site", description: "Showcase your films and projects.", tag: 'Standard' }
      ]
    },
    { name: "Finance & Legal",
      icon: "💼",
      variants: [
        { name: "Financial Advisor", link: "https://finance.salesmanpro.site", description: "Professional services for finance experts.", tag: 'Standard' }
      ]
    },
    { name: "Automotive",
      icon: "🚗",
      variants: [
        { name: "Car Dealership", link: "https://automotive.salesmanpro.site", description: "Showcase your vehicles and services.", tag: 'Standard' }
      ]
    },
    { name: "Travel & Tourism",
      icon: "✈️",
      variants: [
        { name: "Travel Agency", link: "https://travel.salesmanpro.site", description: "Promote travel packages and services.", tag: 'Standard' }
      ]
    },
    { name: "Fitness & Wellness",
      icon: "🏋️‍♂️",
      variants: [
        { name: "Gym & Fitness", link: "https://fitness.salesmanpro.site", description: "Showcase fitness programs and classes.", tag: 'Standard' }
      ]
    },
    { name: "Directory & Listings",
      icon: "📂",
      variants: [
        { name: "Business Directory", link: "https://directory.salesmanpro.site", description: "List businesses and services.", tag: 'Standard' }
      ]
    },
    { name: "Educational & Online Courses",
      icon: "📚",
      variants: [
        { name: "Online Learning", link: "https://education.salesmanpro.site", description: "Promote online courses and resources.", tag: 'Standard' }
      ]
    },
    { name: "Restaurant & Food Delivery",
      icon: "🍔",
      variants: [
        { name: "Food Delivery", link: "https://restaurant.salesmanpro.site", description: "Showcase restaurant menus and delivery options.", tag: 'Standard' }
      ]
    },
    { name: "Event & Ticketing",
      icon: "🎟️",
      variants: [
        { name: "Event Booking", link: "https://event.salesmanpro.site", description: "Manage events and ticket sales.", tag: 'Standard' }
      ]
    },
    { name: "Real Estate",
      icon: "🏠",
      variants: [
        { name: "Property Listings", link: "https://realestate.salesmanpro.site", description: "Showcase real estate properties.", tag: 'Standard' }
      ]
    },
    {
      name: "Property Management",
      icon: "🏢",
      variants: [
        { name: "Property Management", link: "https://propertymanagement.salesmanpro.site", description: "Manage rental properties and tenants.", tag: 'Standard' }
      ]
    },
    { name: "SaaS & Web Apps",
      icon: "💻",
      variants: [
        { name: "App Landing Page", link: "https://saas.salesmanpro.site", description: "Promote your SaaS application.", tag: 'Standard' }
      ]
    },
    { name: "Marketplace",
      icon: "🛍️",
      variants: [
        { name: "Product Marketplace", link: "https://marketplace.salesmanpro.site", description: "Create a marketplace for products.", tag: 'Standard' }
      ]
    },
    {
      name: "Security Services",
      icon: "🛡️",
      variants: [
        { name: "Security Services", link: "https://security.salesmanpro.site", description: "Showcase security services and solutions.", tag: 'Standard' },
        { name: "Security Consulting", link: "https://securityconsulting.salesmanpro.site", description: "Promote security consulting services and expertise.", tag: 'Standard' },
        // { name: "Cybersecurity Firm", link: "https://cybersecurity.salesmanpro.site", description: "Promote cybersecurity services and expertise.", tag: 'Standard' },
        // { name: "Home Security", link: "https://homesecurity.salesmanpro.site", description: "Highlight home security products and services.", tag: 'Standard' },
        // { name: "Event Security", link: "https://eventsecurity.salesmanpro.site", description: "Showcase event security services and solutions.", tag: 'Standard' },
        // { name: "Surveillance Systems", link: "https://surveillance.salesmanpro.site", description: "Highlight surveillance products and services.", tag: 'Standard' },
        // { name: "Access Control", link: "https://accesscontrol.salesmanpro.site", description: "Showcase access control solutions and services.", tag: 'Standard' },
        // { name: "Security Training", link: "https://securitytraining.salesmanpro.site", description: "Promote security training programs and courses.", tag: 'Standard' },
        // { name: "Alarm Systems", link: "https://alarmsystems.salesmanpro.site", description: "Highlight alarm system products and services.", tag: 'Standard' },
      ]
    },
    {
      name: "Delivery & Logistics",
      icon: "🚚",
      variants: [
        { name: "Delivery & Logistics", link: "https://delivery.salesmanpro.site", description: "Manage delivery and logistics services.", tag: 'Standard' }
      ]
    },
    { name: "Other",
      icon: "🌐",
      variants: [
        { name: "General Purpose Site", link: "https://other.salesmanpro.site", description: "A flexible starting point.", tag: 'Standard' }
      ]
    },
];