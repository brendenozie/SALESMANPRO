import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";

export const GET = withApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  // const companyId = searchParams.get("companyId");

  // if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const cacheKey = buildTenantCacheKey(companyId, "companycategory", {});
  
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const categories = await prisma.companyCategory.findMany({
    include: {
      variants: {
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  try {
    await cacheSet(cacheKey, categories, 60);
  } catch (e) {}

  return formatResponse(true, categories, "Fetched", 200);
});

// Inside your existing POST handler
export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const { name, icon, variants, status = "active" } = body;

  const category = await prisma.companyCategory.create({
    data: {
      name,
      icon,
      status,
      variants: {
        create: variants.map((v: any) => ({
          name: v.name,
          link: v.link,
          description: v.description,
          tag: v.tag || "Standard",
          desktopPreviewImage: v.desktopPreviewImage,
          mobilePreviewImage: v.mobilePreviewImage,
        }))
      }
    },
    include: { variants: true }
  });

  // Purge the cache
  await cacheDel(`tenant:${'unscoped'}:companycategory:*`);
  await cacheDel(`admin:companycategory:*`);
  
  return formatResponse(true, category, "Category Created", 201);
});

// const SITE_CATEGORIES: any[] = [
//   { 
//     name: "E-commerce", 
//     icon: "🛒", 
//     variants: [
//       { name: "Modern Shop (v1)", link: "https://duka-yangu.salesmanpro.site", description: "Sleek design for apparel and accessories.", tag: 'Popular',desktopPreviewImage: 'https://example.com/modern-shop-v1.jpg' },
//       { name: "Modern Furniture Store", link: "https://furniture.salesmanpro.site", description: "Contemporary furniture designs.", tag: 'Standard',desktopPreviewImage: 'https://example.com/modern-furniture-store.jpg' },
//       { name: "Modern Fashion Store", link: "https://fashion.salesmanpro.site", description: "Trendy and stylish clothing designs.", tag: 'Standard',desktopPreviewImage: 'https://example.com/modern-fashion-store.jpg' },
//       { name: "Business Directory", link: "https://directory-listings.salesmanpro.site", description: "List businesses and services.", tag: 'Standard',desktopPreviewImage: 'https://example.com/business-directory.jpg' },
//       { name: "Food Delivery", link: "https://restaurant-food-delivery.salesmanpro.site", description: "Showcase restaurant menus and delivery options.", tag: 'Standard',desktopPreviewImage: 'https://example.com/food-delivery.jpg' },
//       { name: "Product Marketplace", link: "https://marketplace.salesmanpro.site", description: "Create a marketplace for products.", tag: 'Standard',desktopPreviewImage: 'https://example.com/product-marketplace.jpg' },
//       { name: "Agrovet Store", link: "https://agrovet.salesmanpro.site", description: "Optimized for agricultural products and supplies.", tag: 'New', desktopPreviewImage: 'https://example.com/agrovet-store.jpg' },
//       { name: "Gaming Store", link: "https://gaming-store.salesmanpro.site", description: "Designed for gaming products and accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/gaming-store.jpg' },
//       { name: "Earphones Store", link: "https://earphones-store.salesmanpro.site", description: "Showcase earphones and audio accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/earphones-store.jpg' },
//       { name: "Bike Store", link: "https://bike-store.salesmanpro.site", description: "Showcase bikes and cycling accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/bike-store.jpg' },
//       { name: "Motorcycle Store", link: "https://motorcycle-store.salesmanpro.site", description: "Showcase motorcycles and accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/motorcycle-store.jpg' },
//       { name: "Glasses Store", link: "https://glasses-store.salesmanpro.site", description: "Showcase eyewear and accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/glasses-store.jpg' },
//       { name: "Flowers Store", link: "https://flowers-store.salesmanpro.site", description: "Showcase floral arrangements and gifts.", tag: 'New', desktopPreviewImage: 'https://example.com/flowers-store.jpg' },
//       { name: "Honey Store", link: "https://honey-store.salesmanpro.site", description: "Showcase honey and related products.", tag: 'New', desktopPreviewImage: 'https://example.com/honey-store.jpg' },
//       { name: "Peanuts Store", link: "https://peanuts-store.salesmanpro.site", description: "Showcase peanuts and related snacks.", tag: 'New', desktopPreviewImage: 'https://example.com/peanuts-store.jpg' },
//       { name: "Watch Store", link: "https://watch-store.salesmanpro.site", description: "Showcase watches and timepieces.", tag: 'New', desktopPreviewImage: 'https://example.com/watch-store.jpg' },
//       { name: "Baby Store", link: "https://baby-store.salesmanpro.site", description: "Showcase baby products and essentials.", tag: 'New', desktopPreviewImage: 'https://example.com/baby-store.jpg' },
//       { name: "Cake Store", link: "https://cake-store.salesmanpro.site", description: "Showcase cakes and baked goods.", tag: 'New', desktopPreviewImage: 'https://example.com/cake-store.jpg' },
//       { name: "Pets Store", link: "https://pets-store.salesmanpro.site", description: "Showcase pet products and supplies.", tag: 'New', desktopPreviewImage: 'https://example.com/pets-store.jpg' },
//       { name: "Groceries Store", link: "https://groceries-store.salesmanpro.site", description: "Showcase groceries and household items.", tag: 'New', desktopPreviewImage: 'https://example.com/groceries-store.jpg' },
//       // { name: "Digital Goods Store (v2)", link: "https://digital-shop.salesmanpro.site", description: "Optimized for selling software and courses.", tag: 'New' },
//       // { name: "Artisan Marketplace (v3)", link: "https://artisan-shop.salesmanpro.site", description: "Focuses on handcrafted and unique items.", tag: 'Standard' },
//     ]
//   },
//   {
//     name: "Furniture Shop",
//     icon: "🛋️",
//     variants: [
//       { name: "Modern Furniture Store", link: "https://furniture.salesmanpro.site", description: "Contemporary furniture designs.", tag: 'Standard', desktopPreviewImage: 'https://example.com/modern-furniture-store.jpg' }
//     ]
//   },
//   {
//     name: "Fashion Shop",
//     icon: "👗",
//     variants: [
//       { name: "Modern Fashion Store", link: "https://fashion.salesmanpro.site", description: "Trendy and stylish clothing designs.", tag: 'Standard', desktopPreviewImage: 'https://example.com/modern-fashion-store.jpg' }
//     ]
//   },
//   { 
//     name: "Consultant & Coach", 
//     icon: "💡", 
//     variants: [
//       { name: "Executive Coach (v1)", link: "https://flourishhub.salesmanpro.site", description: "Professional, high-conversion landing page.", tag: 'Popular', desktopPreviewImage: 'https://example.com/executive-coach-v1.jpg' },
//       // { name: "Wellness Retreat (v2)", link: "https://wellness-coach.salesmanpro.site", description: "Calm and inviting design for wellness services.", tag: 'Standard' },
//     ]
//   },
//   {
//     name : "Agrovet Store",
//     icon: "🌾",
//     variants: [
//       { name: "Agrovet Store", link: "https://agrovet.salesmanpro.site", description: "Optimized for agricultural products and supplies.", tag: 'New', desktopPreviewImage: 'https://example.com/agrovet-store.jpg' }
//     ]
//   },  
//   {
//     name: "Gaming Store",
//     icon: "🎮",
//     variants: [
//       { name: "Gaming Store", link: "https://gaming-store.salesmanpro.site", description: "Designed for gaming products and accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/gaming-store.jpg' }
//     ]
//   },
//   {
//     name: "Earphones Store",
//     icon: "🎧",
//     variants: [
//       { name: "Earphones Store", link: "https://earphones-store.salesmanpro.site", description: "Showcase earphones and audio accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/earphones-store.jpg' }
//     ]
//   },
//   {
//     name: "Bike Store",
//     icon: "🚲",
//     variants: [
//       { name: "Bike Store", link: "https://bike-store.salesmanpro.site", description: "Showcase bikes and cycling accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/bike-store.jpg' }
//     ]
//   },
//   {
//     name: "Motorcycle Store",
//     icon: "🏍️",
//     variants: [
//       { name: "Motorcycle Store", link: "https://motorcycle-store.salesmanpro.site", description: "Showcase motorcycles and accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/motorcycle-store.jpg' }
//     ]
//   },
//   {
//   name: "Glasses Store",
//   icon: "👓",
//   variants: [   
//         { name: "Glasses Store", link: "https://glasses-store.salesmanpro.site", description: "Showcase eyewear and accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/glasses-store.jpg' },
//       ]
//   },
//   { 
//     name: "Flowers Store",
//     icon: "🌸",
//     variants: [
//       { name: "Flowers Store", link: "https://flowers-store.salesmanpro.site", description: "Showcase floral arrangements and gifts.", tag: 'New', desktopPreviewImage: 'https://example.com/flowers-store.jpg' }
//     ]
//   },
//   {
//     name: "Honey Store",
//     icon: "🍯",
//     variants: [{ name: "Honey Store", link: "https://honey-store.salesmanpro.site", description: "Showcase honey and related products.", tag: 'New', desktopPreviewImage: 'https://example.com/honey-store.jpg' }]
//   },
//   {
//     name: "Peanuts Store",
//     icon: "🥜",
//     variants: [{ name: "Peanuts Store", link: "https://peanuts-store.salesmanpro.site", description: "Showcase peanuts and related snacks.", tag: 'New', desktopPreviewImage: 'https://example.com/peanuts-store.jpg' }],
//   },
//   { 
//     name: "Watch Store", 
//     icon: "⌚", 
//     variants: [
//       { name: "Watch Store", link: "https://watch-store.salesmanpro.site", description: "Showcase watches and timepieces.", tag: 'New', desktopPreviewImage: 'https://example.com/watch-store.jpg' }
//     ]
//   },
//   {
//     name: "Baby Store",
//     icon: "👶",
//     variants: [{ name: "Baby Store", link: "https://baby-store.salesmanpro.site", description: "Showcase baby products and essentials.", tag: 'New', desktopPreviewImage: 'https://example.com/baby-store.jpg' }],
//   },
//   { 
//     name: "Cake Store",
//     icon: "🎂",
//     variants: [
//       { name: "Cake Store", link: "https://cake-store.salesmanpro.site", description: "Showcase cakes and baked goods.", tag: 'New', desktopPreviewImage: 'https://example.com/cake-store.jpg' }
//     ]
//   },
//   {
//     name: "Pets Store",
//     icon: "🐶",
//     variants: [{ name: "Pets Store", link: "https://pets-store.salesmanpro.site", description: "Showcase pet products and supplies.", tag: 'New', desktopPreviewImage: 'https://example.com/pets-store.jpg' }],
//   },
//   { 
//     name: "Groceries Store",
//     icon: "🛒",
//     variants: [
//       { name: "Groceries Store", link: "https://groceries-store.salesmanpro.site", description: "Showcase groceries and household items.", tag: 'New', desktopPreviewImage: 'https://example.com/groceries-store.jpg' }
//     ]
//   },
//  { name: "Public Speaking", 
//     icon: "🎙️", 
//     variants: [
//       { name: "Standard Speaker Site", link: "https://flourishhub-2.salesmanpro.site", description: "Bookings and media focus.", tag: 'Standard', desktopPreviewImage: 'https://example.com/standard-speaker-site.jpg' }
//     ] 
//   },
//   { 
//       name: "Shoes Store", icon: "👟", variants: [
//       { name: "Shoes Store Classic", link: "https://shoes-store.salesmanpro.site", description: "Grid-based product layout.", tag: 'Standard', desktopPreviewImage: 'https://example.com/shoes-store-classic.jpg' }
//     ] 
//   },
//   { name: "Service Provider", 
//     icon: "🔧", variants: [
//       { 
//         name: "Agency Portfolio", link: "https://service-provider.salesmanpro.site", description: "Showcase services and case studies.", tag: 'Popular', desktopPreviewImage: 'https://example.com/agency-portfolio.jpg' 
//       }
//     ] 
//   },
//   { name: "Booking & Appointments", 
//     icon: "📅", 
//     variants: [
//       { name: "Scheduler Hub", link: "https://booking.salesmanpro.site", description: "Integrated calendar for easy booking.", tag: 'Standard', desktopPreviewImage: 'https://example.com/scheduler-hub.jpg' },
//       { name: "Barbershop Store", link:"https://barbershop.salesmanpro.site", description: "Booking-focused design for barbershops.", tag: 'New', desktopPreviewImage: 'https://example.com/barbershop-store.jpg' }   ] 
//   },
//   { name: "Portfolio & Personal Branding", 
//     icon: "👤", 
//     variants: [
//       { name: "Creative CV", link: "https://portfolio-personal-branding.salesmanpro.site", description: "Minimalist design for designers/writers.", tag: 'New', desktopPreviewImage: 'https://example.com/creative-cv.jpg' }
//     ] 
//   },
//   { 
//     name: "Blog & Content", 
//     icon: "✍️", variants: 
//     [{ name: "Modern Magazine", link: "https://blog-content.salesmanpro.site", description: "High-readability blog layout.", tag: 'Popular', desktopPreviewImage: 'https://example.com/modern-magazine.jpg' }

//     ] 
//   },
//     { name: "Nonprofit & Community",
//       icon: "🤝",
//       variants: [
//         { name: "Charity Connect", link: "https://nonprofit-community.salesmanpro.site", description: "Donation-focused design.", tag: 'Standard', desktopPreviewImage: 'https://example.com/charity-connect.jpg' }
//       ]
//     },
//     { name: "Healthcare & Clinics",
//       icon: "🏥",
//       variants: [
//         { name: "Clinic Pro", link: "https://healthcare-clinics.salesmanpro.site", description: "Patient-focused design.", tag: 'Standard', desktopPreviewImage: 'https://example.com/clinic-pro.jpg' }
//       ]
//     },
//     { name: "Media & Entertainment",
//       icon: "🎬",
//       variants: [
//         { name: "Film Studio", link: "https://media-entertainment.salesmanpro.site", description: "Showcase your films and projects.", tag: 'Standard', desktopPreviewImage: 'https://example.com/film-studio.jpg' }
//       ]
//     },
//     { name: "Finance & Legal",
//       icon: "💼",
//       variants: [
//         { name: "Financial Advisor", link: "https://finance-legal.salesmanpro.site", description: "Professional services for finance experts.", tag: 'Standard', desktopPreviewImage: 'https://example.com/financial-advisor.jpg' }
//       ]
//     },
//     { name: "Automotive",
//       icon: "🚗",
//       variants: [
//         { name: "Car Dealership", link: "https://automotive.salesmanpro.site", description: "Showcase your vehicles and services.", tag: 'Standard', desktopPreviewImage: 'https://example.com/car-dealership.jpg' }
//       ]
//     },
//     { name: "Travel & Tourism",
//       icon: "✈️",
//       variants: [
//         { name: "Travel Agency", link: "https://travel-tourism.salesmanpro.site", description: "Promote travel packages and services.", tag: 'Standard', desktopPreviewImage: 'https://example.com/travel-agency.jpg' }
//       ]
//     },
//     { name: "Fitness & Wellness",
//       icon: "🏋️‍♂️",
//       variants: [
//         { name: "Gym & Fitness", link: "https://fitness-wellness.salesmanpro.site", description: "Showcase fitness programs and classes.", tag: 'Standard', desktopPreviewImage: 'https://example.com/gym-fitness.jpg' }
//       ]
//     },
//     { name: "Directory & Listings",
//       icon: "📂",
//       variants: [
//         { name: "Business Directory", link: "https://directory-listings.salesmanpro.site", description: "List businesses and services.", tag: 'Standard', desktopPreviewImage: 'https://example.com/business-directory.jpg' }
//       ]
//     },
//     { name: "Educational & Online Courses",
//       icon: "📚",
//       variants: [
//         { name: "Online Learning", link: "https://educational-online-courses.salesmanpro.site", description: "Promote online courses and resources.", tag: 'Standard', desktopPreviewImage: 'https://example.com/online-learning.jpg' },
//         { name: "Courses Layout 2", link: "https://courses-layout-2.salesmanpro.site", description: "Alternate design for online courses.", tag: 'Standard', desktopPreviewImage: 'https://example.com/courses-layout-2.jpg' },
//         { name: "Courses Layout 3", link: "https://courses-layout-3.salesmanpro.site", description: "Another design for online courses.", tag: 'Standard', desktopPreviewImage: 'https://example.com/courses-layout-3.jpg' },
//       ]
//     },
//     { name: "Restaurant & Food Delivery",
//       icon: "🍔",
//       variants: [
//         { name: "Food Delivery", link: "https://restaurant-food-delivery.salesmanpro.site", description: "Showcase restaurant menus and delivery options.", tag: 'Standard', desktopPreviewImage: 'https://example.com/food-delivery.jpg' }
//       ]
//     },
//     { name: "Event & Ticketing",
//       icon: "🎟️",
//       variants: [
//         { name: "Event Booking", link: "https://event-ticketing.salesmanpro.site", description: "Manage events and ticket sales.", tag: 'Standard', desktopPreviewImage: 'https://example.com/event-booking.jpg' }
//       ]
//     },
//     { name: "Real Estate",
//       icon: "🏠",
//       variants: [
//         { name: "Property Listings", link: "https://real-estate.salesmanpro.site", description: "Showcase real estate properties.", tag: 'Standard', desktopPreviewImage: 'https://example.com/property-listings.jpg' }
//       ]
//     },
//     {
//       name: "Property Management",
//       icon: "🏥",
//       variants: [
//         { name: "Property Manager", link: "https://property-management.salesmanpro.site", description: "Manage properties and tenants.", tag: 'Standard', desktopPreviewImage: 'https://example.com/property-manager.jpg' }
//       ]
//      },
//     // { name: "SaaS & Web Apps",
//     //   icon: "💻",
//     //   variants: [
//     //     { name: "App Landing Page", link: "https://saas.salesmanpro.site", description: "Promote your SaaS application.", tag: 'Standard' }
//     //   ]
//     // },
//     { name: "Marketplace",
//       icon: "🛍️",
//       variants: [
//         { name: "Product Marketplace", link: "https://marketplace.salesmanpro.site", description: "Create a marketplace for products.", tag: 'Standard', desktopPreviewImage: 'https://example.com/product-marketplace.jpg' }
//       ]
//     },
//     {
//       name: "Security",
//       icon: "🔒",
//       variants: [
//         { name: "Security Services", link: "https://security-services.salesmanpro.site", description: "Protect your assets and data.", tag: 'Standard', desktopPreviewImage: 'https://example.com/security-services.jpg' },
//         { name: "Security Consulting", link: "https://security-services-2.salesmanpro.site", description: "Security Consulting site.", tag: 'Standard', desktopPreviewImage: 'https://example.com/security-consulting.jpg'},
//       ]
//     },
//     {
//       name: "Delivery & Logistics",
//       icon: "🚚",
//       variants: [
//         { name: "Delivery Service", link: "https://delivery-logistics.salesmanpro.site", description: "Manage deliveries and logistics.", tag: 'Standard', desktopPreviewImage: 'https://example.com/delivery-service.jpg' },
//       ]
//     }
//     // { name: "Other",
//     //   icon: "🌐",
//     //   variants: [
//     //     { name: "General Purpose Site", link: "https://other.salesmanpro.site", description: "A flexible starting point.", tag: 'Standard', desktopPreviewImage: 'https://example.com/general-purpose.jpg' }
//     //   ]
//     // },
// ];

// export const POST = withApiHandler(async (request) => {

//   for (const category of SITE_CATEGORIES) {
//     await prisma.companyCategory.create({
//       data: {
//         name: category.name,
//         icon: category.icon,
//         status: "active", // Required by your model
//         variants: {
//           create: category.variants.map((v: any) => ({
//             name: v.name,
//             link: v.link,
//             description: v.description,
//             tag: v.tag || "Standard",
//             desktopPreviewImage: v.desktopPreviewImage,
//           })),
//         },
//       },
//     });
//   }

//   await cacheDel(`admin:companycategory:*`);
//   return formatResponse(true, null, "Site categories seeded", 201);
// });

// export const POST = withApiHandler(async (request) => {
//   const body = await request.json();
//   const { name, icon, variants } = body;

//   const category = await prisma.companyCategory.create({
//     data: {
//       name,
//       icon,
//       status: "active",
//       variants: {
//         create: variants.map((v: any) => ({
//           name: v.name,
//           link: v.link,
//           description: v.description,
//           tag: v.tag,
//           desktopPreviewImage: v.desktopPreviewImage,
//           mobilePreviewImage: v.mobilePreviewImage,
//         }))
//       }
//     }
//   });

//   await cacheDel(`admin:companycategory:*`);
//   return formatResponse(true, category, "Category Created", 201);
// });