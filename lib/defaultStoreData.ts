import {
  StoreForm,
  Policy,
  FAQ,
  Testimonial,
  HeroSlide,
  Promotion,
  PageSection,
  SectionType,
  SocialLink,
  SocialChannel,
  PolicyType,
} from "@/types/typings"; // Adjust path as needed

// This function returns a PARTIAL form object with sample data
// tailored to the selected category.
export function getCategoryDefaultData(category: string): Partial<StoreForm> {
  const baseData: Partial<StoreForm> = {
    tagline: "",
    description: "",
    policies: [],
    faqs: [],
    testimonials: [],
    heroSlides: [],
    pageSections: [],
    socialLinks: [],
  };

  switch (category) {
    case "Restaurant & Food Delivery":
      return {
        ...baseData,
        tagline: "Delicious food, delivered to your door.",
        description:
          "Explore our menu of mouth-watering dishes crafted with the freshest ingredients. Order online for quick delivery or pickup.",
        heroSlides: [
          {
            imageUrl: "/images/samples/restaurant-hero.jpg",
            headline: "Hot & Fresh Pizza, 50% Off!",
            subline: "Limited time offer for all online orders.",
            ctaText: "Order Now",
            ctaLink: "/menu",
            badgeText: "Best Seller",
          },
        ],
        promotions: [
          {
            title: "Taco Tuesday",
            description: "Get 3 tacos for the price of 2 every Tuesday.",
            bannerUrl: "/images/samples/taco-promo.jpg",
          },
        ],
        faqs: [
          {
            question: "Do you offer vegetarian options?",
            answer: "Yes, we have a wide range of vegetarian and vegan dishes available. Please check our menu for details.",
          },
          {
            question: "What are your delivery hours?",
            answer: "We deliver from 11:00 AM to 10:00 PM, Monday through Sunday.",
          },
        ],
        pageSections: [
          {
            type: SectionType.FeatureGrid,
            order: 1,
            settings: { background: "light", padding: "xl" },
            content: {
              headline: "Our Specialties",
              blocks: [
                { title: "Gourmet Burgers", description: "Juicy, handcrafted burgers made with premium beef." },
                { title: "Artisanal Pasta", description: "Freshly made pasta with authentic Italian sauces." },
                { title: "Wood-Fired Pizza", description: "Crispy crust and generous toppings, baked to perfection." },
              ]
            },
          },
        ],
      };

    case "Real Estate":
      return {
        ...baseData,
        tagline: "Your Key to a New Home.",
        description:
          "Find your dream property with our expert real estate agents. We specialize in residential and commercial properties in the city's best neighborhoods.",
        heroSlides: [
          {
            imageUrl: "/images/samples/real-estate-hero.jpg",
            headline: "Find Your Dream Home Today",
            subline:
              "Explore stunning properties in the most sought-after locations.",
            ctaText: "Browse Listings",
            ctaLink: "/listings",
            badgeText: "Featured Property",
          },
        ],
        faqs: [
          {
            question: "How do I schedule a viewing?",
            answer:
              "You can schedule a viewing by clicking the 'Schedule Viewing' button on any property listing or by contacting the listed agent directly.",
          },
          {
            question: "What are your commission rates?",
            answer:
              "Our commission rates are competitive and vary based on the property type and sale price. Please contact us for a detailed consultation.",
          },
        ],
        testimonials: [
          {
            author: "The Johnson Family",
            quote:
              "They helped us find the perfect family home in just a few weeks. The entire process was seamless and professional. Highly recommended!",
            rating: 5,
          },
        ],
      };

    case "Portfolio & Personal Branding":
      return {
        ...baseData,
        tagline: "Creative Solutions, Professional Results.",
        description:
          "Welcome to my portfolio. I am a Graphic Designer specializing in creating compelling visuals and brand identities that resonate with audiences. Let's create something amazing together.",
        heroSlides: [
          {
            imageUrl: "/images/samples/portfolio-hero.jpg",
            headline: "John Doe - Brand & UI/UX Designer",
            subline: "Transforming ideas into beautiful and functional designs.",
            ctaText: "View My Work",
            ctaLink: "#portfolio",
          },
        ],
        pageSections: [
          {
            type: SectionType.About,
            order: 1,
            settings: {},
            content: { headline: "About Me", text: "I have over 10 years of experience...", imageUrl: "/images/samples/profile-pic.jpg" }
          },
          {
            type: SectionType.Services,
            order: 2,
            settings: {},
            content: { headline: "What I Offer", services: ["Brand Identity", "Web Design", "Mobile App UI/UX"] }
          }
        ],
        socialLinks: [
          { channel: SocialChannel.LINKEDIN, url: "" },
          { channel: SocialChannel.TWITTER, url: "" },
        ]
      };

    case "Healthcare & Clinics":
        return {
            ...baseData,
            tagline: "Compassionate Care You Can Trust.",
            description: "Our clinic offers a wide range of medical services with a focus on patient well-being. Book an appointment with one of our experienced doctors today.",
            heroSlides: [{
                imageUrl: "/images/samples/clinic-hero.jpg",
                headline: "Schedule Your Appointment Today",
                subline: "Easy online booking with our certified medical professionals.",
                ctaText: "Book Now",
                ctaLink: "/appointments"
            }],
            faqs: [
                { question: "Do you accept my insurance?", answer: "We accept a wide variety of insurance plans. Please call our front desk to verify your coverage." },
                { question: "What are your opening hours?", answer: "We are open from 8 AM to 6 PM on weekdays, and 9 AM to 1 PM on Saturdays." }
            ],
            policies: [{
                type: PolicyType.PRIVACY,
                title: "Patient Privacy Policy",
                content: "We are committed to protecting your personal health information in compliance with all regulations..."
            }],
            pageSections: [{
                type: SectionType.Services,
                order: 1,
                settings: {},
                content: {
                    headline: "Our Medical Services",
                    blocks: [
                        { title: "General Practice", description: "Comprehensive primary care for all ages." },
                        { title: "Pediatrics", description: "Specialized care for infants, children, and adolescents." },
                        { title: "Dentistry", description: "Complete dental care, from cleanings to cosmetic procedures." }
                    ]
                }
            }]
        }
        
    default:
      // Return the empty baseData for categories without specific samples
      return baseData;
  }
}