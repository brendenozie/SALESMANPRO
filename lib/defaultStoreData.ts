import { PolicyType, SocialChannel, StoreForm } from "@/types/typings";

const now = new Date();
const in3Days = new Date(now.getTime() + 3 * 24 * 3600 * 1000);
const in1Day = new Date(now.getTime() + 1 * 24 * 3600 * 1000);

// NOTE: Placeholder URLs are used for images as actual assets are not available here.
const getSampleImageUrl = (category: string) =>
  `https://placehold.co/600x400?text=${encodeURIComponent(category)}&font=roboto`;

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
    keywords: [],
  },
  analyticsConfig: {
    id: "",
    googleTag: null,
    facebookTag: null,
    hotjarSiteId: null,
    isActive: false,
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
    ghubaSecret_tag: null,
  },
  shippingSettings: {
    id: "",
    carrierName: null,
    trackingUrl: null,
    regions: null,
    enablePickup: null,
    pickupInstructions: null,
    standardRate: null,
    expressRate: null,
  },

  sectionSubtitle: null,
  sectionTitle: null,
  sectionDescription: null,
  partnerLogos: null,

  founderName: null,
  founderQuote: null,
  founderImage: null,

  CoreValues: [
    {
      id: "",
      title: "Customer Centricity",
      description:
        "We put our customers at the heart of everything we do, striving to exceed their expectations and deliver exceptional value.",
      icon: "CustomerIcon",
    },
    {
      id: "",
      title: "Integrity",
      description:
        "We conduct our business with honesty, transparency, and accountability, building trust with our customers, partners, and employees.",
      icon: "IntegrityIcon",
    },
    {
      id: "",
      title: "Innovation",
      description:
        "We embrace creativity and continuously seek new ways to improve our products, services, and customer experience.",
      icon: "InnovationIcon",
    },
    {
      id: "",
      title: "Sustainability",
      description:
        "We are committed to minimizing our environmental impact and promoting sustainable practices throughout our operations.",
      icon: "SustainabilityIcon",
    },
  ],
};

// 2) Helper to merge category-specific overrides
function withOverrides(overrides: Partial<StoreForm>): Partial<StoreForm> {
  return {
    ...baseData,
    ...overrides,
    // Ensure date fields in promotions are Date objects
    promotions: (overrides.promotions || []).map((promo) => ({
      ...promo,
      startsAt: promo.startsAt ? new Date(promo.startsAt as any) : now,
      endsAt: promo.endsAt ? new Date(promo.endsAt as any) : in3Days,
    })),
  };
}

// 3) All your categories in one map:
export function getCategoryDefaultData(category: string): Partial<StoreForm> {
  const samples: Record<string, Partial<StoreForm>> = {
    "E-commerce": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Agrovet Store": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Gaming Store": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Earphones Store": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Glasses Store": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Flowers Store": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Honey Store": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Peanuts Store": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Watch Store": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Baby Store": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Cake Store": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Pets Store": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Groceries Store": withOverrides({
      tagline: "Shop the **Latest Trends** Online",
      description:
        "From gadgets to fashion, find everything you need with **fast shipping** and easy returns.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/onlinestore" },
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/onlinestore",
        },
        {
          channel: SocialChannel.TWITTER,
          url: "https://twitter.com/onlinestore",
        },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content:
            "Free standard shipping on all orders over $50. Express options available.",
        },
        {
          type: PolicyType.RETURNS,
          content: "30-day money-back guarantee. Item must be unworn/unused.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      awards: [
        {
          name: "Best Online Retailer 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Top 100 E-commerce Sites 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
        {
          name: "Customer Choice Award 2023",
          iconUrl:
            "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
        },
      ],
      seo: {
        id: "",
        title: "Shop the Latest Trends Online | Your One-Stop E-commerce Store",
        description:
          "Discover the latest trends in fashion, electronics, and more at our online store. Enjoy fast shipping and easy returns on all orders.",
        keywords: [
          "online shopping",
          "latest trends",
          "fast shipping",
          "easy returns",
          "fashion",
          "electronics",
        ],
      },
      metrics: [
        { label: "Products Sold", value: 15000 },
        { label: "5-Star Reviews", value: 3200 },
        { label: "Countries Shipped To", value: 50 },
      ],
      stats: [
        { label: "Customer Satisfaction", value: "98%" },
        { label: "Repeat Customers", value: "75%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "Visa, Mastercard, PayPal, and Apple Pay.",
          order: 1,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 5-7 business days.",
          order: 2,
        },
        {
          question: "Can I track my order?",
          answer: "Yes, tracking information is emailed once your order ships.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Alex R.",
          quote: "The quality exceeded my expectations. Fast delivery too!",
          rating: 5,
        },
        {
          authorName: "Mia K.",
          quote: "I found the perfect gift here. Great customer service.",
          rating: 5,
        },
        {
          authorName: "Liam S.",
          quote: "Easy to navigate site and hassle-free returns.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("ecommerce"),
          headline: "Summer Collection: Up to 50% Off",
          subline: "Limited time offer on all apparel.",
          ctaText: "Shop Sale",
          ctaLink: "/shop/sale",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Best Deals",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      promotions: [
        {
          title: "Flash Weekend Deal",
          description: "Get an extra 10% off using code WKND10.",
          ctaText: "Activate Code",
          ctaLink: "/deals",
          bannerUrl: getSampleImageUrl("flash-deal"),
          companyId: "",
          perks: [
            { id: "", label: "Free Gift", icon: "StarIcon" },
            { id: "", label: "10% off", icon: "" },
          ],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers",
          description: "Our top selling products this month.",
        } as any,
      ],
      pricingTiers: [
        {
          name: "Standard",
          price: 0,
          duration: "monthly",
          features: ["Access to shop", "Email updates"],
        },
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of products across various categories, curated to meet all your needs.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Consultant & Coach": withOverrides({
      tagline: "**Transform Your Career.** Unlock Your Potential.",
      description:
        "High-performance coaching and **strategic consulting** for executives and leaders seeking rapid growth.",
      socialLinks: [
        {
          channel: SocialChannel.LINKEDIN,
          url: "https://linkedin.com/in/coach",
        },
        { channel: SocialChannel.TWITTER, url: "https://twitter.com/coach" },
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/coach" },
      ],
      policies: [
        {
          type: PolicyType.TERMS,
          content:
            "Confidentiality and payment terms apply to all coaching packages.",
        },
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
        {
          type: PolicyType.CANCELLATION,
          content:
            "Cancellations must be made at least 24 hours in advance for a full refund.",
        },
      ],
      faqs: [
        {
          question: "What packages do you offer?",
          answer: "We offer 1:1, group, and corporate coaching programs.",
          order: 1,
        },
        {
          question: "What is your coaching philosophy?",
          answer:
            "We focus on actionable strategies and mindset shifts for sustainable growth.",
          order: 2,
        },
        {
          question: "How do I get started?",
          answer:
            "Schedule a free 15-minute intro call to discuss your goals and how we can help.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Emily W.",
          quote:
            "My revenue doubled after 6 months of executive coaching. Highly recommend!",
          rating: 5,
        },
        {
          authorName: "David T.",
          quote:
            "The insights I gained were invaluable for my leadership development.",
          rating: 5,
        },
        {
          authorName: "Michael B.",
          quote:
            "The insights and accountability provided were game-changers for my business.",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("coach"),
          headline: "Ready for the Next Step?",
          subline: "Schedule your free 15-minute intro call today.",
          ctaText: "Book Free Call",
          ctaLink: "/book",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "New Clients",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Clients Mentored", value: 350 },
        { label: "Average Revenue Growth", value: "35% YOY" },
        { label: "Client Retention", value: "80%" },
      ],
      seo: {
        id: "",
        title:
          "Executive Coaching & Strategic Consulting | Unlock Your Potential",
        description:
          "Transform your career with high-performance coaching and strategic consulting for executives and leaders. Schedule your free intro call today.",
        keywords: [
          "executive coaching",
          "strategic consulting",
          "leadership development",
          "career growth",
          "business coaching",
        ],
      },
      stats: [
        { label: "Average Growth", value: "35% YOY" },
        { label: "Client Retention", value: "80%" },
        { label: "Repeat Clients", value: "60%" },
      ],
      pricingTiers: [
        {
          name: "Intro Session",
          price: 199,
          duration: "one-time",
          features: ["60-min strategy session"],
        },
        {
          name: "VIP Program",
          price: 2999,
          duration: "monthly",
          features: ["Weekly 1:1 calls", "Unlimited email access"],
        },
        {
          name: "Corporate Coaching",
          price: 10000,
          duration: "monthly",
          features: ["Custom programs for teams", "On-site workshops"],
        },
      ],
      promotions: [
        {
          title: "Spring Coaching Special",
          description: "Sign up for a 3-month package and get 1 month free!",
          ctaText: "Claim Offer",
          ctaLink: "/coaching",
          companyId: "",
          perks: [{ id: "", label: "1 Month Free", icon: "StarIcon" }],
          trustLogos: [],
        },
        {
          title: "Refer a Friend",
          description:
            "Refer a friend and you both get 20% off your next coaching package.",
          ctaText: "Refer Now",
          ctaLink: "/refer",
          companyId: "",
          perks: [{ id: "", label: "20% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Unlock Your Potential",
      sectionTitle: "Coaching & Consulting Services",
      sectionDescription:
        "Whether you're an executive looking to level up your leadership skills or a team seeking strategic guidance, our tailored coaching programs are designed to drive real results and lasting transformation.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Public Speaking": withOverrides({
      tagline: "**Inspire Audiences.** Book Your Next Keynote.",
      description:
        "An experienced speaker delivering **impactful presentations** on technology, leadership, and future trends.",
      socialLinks: [
        { channel: SocialChannel.YOUTUBE, url: "https://youtube.com/speaker" },
      ],
      faqs: [
        {
          question: "What are your popular speaking topics?",
          answer: "AI in business, Future of Work, and High-Performance Teams.",
          order: 1,
        },
        {
          question: "Do you offer virtual keynotes?",
          answer:
            "Yes, we have experience delivering engaging virtual presentations worldwide.",
          order: 2,
        },
        {
          question: "What is your booking process?",
          answer:
            "Contact us with your event details, and we'll provide a custom proposal within 48 hours.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Jane D.",
          quote: "Incredible energy and insight. A true professional!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("public-speaking"),
          headline: "Book Me for Your Event",
          subline: "Delivering memorable keynotes globally.",
          ctaText: "View Topics",
          ctaLink: "/topics",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Keynote Speaker",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      events: [
        {
          title: "Tech Summit Keynote",
          date: in1Day,
          location: "Online",
        } as any,
      ],
      awards: [{ name: "Top 10 Speaker 2024", iconUrl: "/icons/award.svg" }],
      pricingTiers: [
        {
          name: "Keynote",
          price: 5000,
          duration: "per event",
          features: ["60-90 min presentation", "Q&A session"],
        },
        {
          name: "Workshop",
          price: 10000,
          duration: "per event",
          features: ["Half-day workshop", "Custom content"],
        },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Cancellations must be made at least 30 days in advance for a full refund.",
        },
      ],
      metrics: [
        { label: "Events Spoken At", value: 100 },
        { label: "Audience Reached", value: 50000 },
        { label: "Repeat Bookings", value: 40 },
      ],
      seo: {
        id: "",
        title:
          "Book a Keynote Speaker | Inspiring Presentations on Technology & Leadership",
        description:
          "Book an experienced keynote speaker for your next event. Delivering impactful presentations on technology, leadership, and future trends worldwide.",
        keywords: [
          "keynote speaker",
          "book a speaker",
          "technology presentations",
          "leadership talks",
          "future trends",
        ],
      },
      stats: [
        { label: "Average Rating", value: "4.9/5" },
        { label: "Referral Rate", value: "60%" },
        { label: "International Events", value: "30%" },
      ],
      promotions: [
        {
          title: "Limited Time Offer",
          description:
            "Book a keynote before the end of the month and receive a free virtual workshop for your team!",
          ctaText: "Claim Offer",
          ctaLink: "/contact",
          companyId: "",
          perks: [{ id: "", label: "Free Workshop", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Unlock Your Potential",
      sectionTitle: "Coaching & Consulting Services",
      sectionDescription:
        "Whether you're an executive looking to level up your leadership skills or a team seeking strategic guidance, our tailored coaching programs are designed to drive real results and lasting transformation.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Shoes Store": withOverrides({
      tagline: "**Step into Style.** Premium Footwear.",
      description:
        "Discover the perfect pair for any occasion with our curated selection of **comfort, performance, and fashion**.",
      socialLinks: [
        { channel: SocialChannel.INSTAGRAM, url: "https://insta.com/shoes" },
      ],
      policies: [
        {
          type: PolicyType.SHIPPING,
          content: "Free returns on all footwear orders.",
        },
        {
          type: PolicyType.RETURNS,
          content:
            "30-day return policy. Shoes must be unworn and in original packaging.",
        },
        {
          type: PolicyType.CANCELLATION,
          content:
            "Orders can be canceled within 1 hour of purchase for a full refund.",
        },
      ],
      faqs: [
        {
          question: "What is your sizing guide?",
          answer:
            "Check our detailed chart on the product page, or contact support for help.",
          order: 1,
        },
        {
          question: "Do you offer international shipping?",
          answer:
            "Yes, we ship worldwide. Shipping costs and times vary by location.",
          order: 2,
        },
        {
          question: "How do I care for my shoes?",
          answer:
            "Each product page includes specific care instructions to keep your shoes looking great.",
          order: 3,
        },
      ],
      testimonials: [
        {
          authorName: "Sara L.",
          quote: "The most comfortable running shoes I've ever owned!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("shoes-store"),
          headline: "New Arrivals: The Glide 5000",
          subline: "Engineered for speed and comfort.",
          ctaText: "Shop Running",
          ctaLink: "/shop/running",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Performance",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
      seo: {
        id: "",
        title:
          "Shop Premium Footwear | Step into Style with Our Curated Shoe Collection",
        description:
          "Discover the perfect pair for any occasion with our curated selection of comfort, performance, and fashion footwear. Shop now for free returns and fast shipping.",
        keywords: [
          "premium footwear",
          "comfortable shoes",
          "fashion shoes",
          "running shoes",
          "shoe store",
        ],
      },
      stats: [
        { label: "Customer Satisfaction", value: "97%" },
        { label: "Repeat Buyers", value: "80%" },
        { label: "Average Delivery Time", value: "3 days" },
      ],
      awards: [
        { name: "Best Footwear Store 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 100 Retailers 2024", iconUrl: "/icons/award.svg" },
      ],
      metrics: [
        { label: "Pairs Sold", value: 20000 },
        { label: "5-Star Reviews", value: 5000 },
        { label: "Countries Shipped To", value: 50 },
        { label: "New Customers", value: 5000 },
      ],
      promotions: [
        {
          title: "Summer Shoe Sale",
          description:
            "Get 20% off all sandals and sneakers with code SUMMER20.",
          ctaText: "Shop Now",
          ctaLink: "/shop/sale",
          bannerUrl: getSampleImageUrl("shoe-sale"),
          companyId: "",
          perks: [{ id: "", label: "20% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
        {
          title: "Buy One, Get One 50% Off",
          description:
            "Mix and match any two pairs of shoes. Discount applied at checkout.",
          ctaText: "Start Shopping",
          ctaLink: "/shop",
          companyId: "",
          perks: [{ id: "", label: "BOGO 50% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],
      Collection: [
        {
          name: "Best Sellers Sneakers",
          description: "Our most popular everyday shoes.",
        } as any,
      ],

      sectionSubtitle: "Discover Our Collections",
      sectionTitle: "Shop by Category",
      sectionDescription:
        "Explore our wide range of footwear across various styles and brands, curated to meet all your needs for comfort, performance, and fashion.",
    }),

    "Service Provider": withOverrides({
      tagline: "Trusted and **Vetted Home Services**",
      description:
        "Connect with certified professionals quickly and reliably for plumbing, electrical, and maintenance needs.",
      socialLinks: [
        {
          channel: SocialChannel.LINKEDIN,
          url: "https://linkedin.com/company/services",
        },
      ],
      policies: [
        {
          type: PolicyType.TERMS,
          content: "All service work is covered by a 90-day guarantee.",
        },
      ],
      faqs: [
        {
          question: "Are your providers insured?",
          answer: "Yes, all our professionals are fully licensed and insured.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Mia K.",
          quote: "Excellent service! Fixed my leak within an hour of booking.",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("service-provider"),
          headline: "Need a Repair? Get a Quote.",
          subline: "Local experts ready to help, 24/7.",
          ctaText: "Get Free Quote",
          ctaLink: "/quote",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "24/7 Support",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Jobs Completed", value: 5000 },
        { label: "Average Response Time", value: 30 },
        { label: "Customer Satisfaction", value: 95 },
      ],
      seo: {
        id: "",
        title:
          "Trusted Home Service Providers | Fast, Reliable, and Vetted Professionals",
        description:
          "Connect with certified professionals quickly and reliably for plumbing, electrical, and maintenance needs. All services covered by a 90-day guarantee.",
        keywords: [
          "home services",
          "trusted service providers",
          "vetted professionals",
          "plumbing",
          "electrical",
          "maintenance",
        ],
      },
      stats: [
        { label: "Avg. Customer Rating", value: "4.8/5" },
        { label: "Repeat Customers", value: "70%" },
        { label: "Service Areas", value: 100 },
        { label: "Average Job Value", value: "$150" },
      ],
      pricingTiers: [
        {
          name: "Standard Callout",
          price: 50,
          duration: "hourly",
          features: ["Quality guarantee", "Vetted professionals"],
        },
        {
          name: "Premium Service",
          price: 100,
          duration: "hourly",
          features: ["Priority scheduling", "Extended warranty"],
        },
        {
          name: "Emergency Service",
          price: 150,
          duration: "hourly",
          features: ["Immediate dispatch", "24/7 availability"],
        },
      ],
      awards: [
        {
          name: "Best Home Service Platform 2024",
          iconUrl: "/icons/award.svg",
        },
        { name: "Top 50 Startups 2024", iconUrl: "/icons/award.svg" },
      ],

      sectionSubtitle: "Expert Solutions for Your Home",
      sectionTitle: "Service Providers You Can Trust",
      sectionDescription:
        "Our network of certified professionals is here to provide fast, reliable, and high-quality service for all your home repair and maintenance needs. Whether it's a leaky faucet or a major electrical issue, we've got you covered with vetted experts and a satisfaction guarantee.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Booking & Appointments": withOverrides({
      tagline: "Schedule Your Service in Minutes",
      description:
        "Find available slots and **book appointments** online seamlessly for our premium services.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/bookinghub" },
      ],
      policies: [
        {
          type: PolicyType.PRIVACY,
          content: "Your booking data is secured and never shared.",
        },
      ],
      faqs: [
        {
          question: "Can I reschedule my appointment?",
          answer:
            "Yes, up to 24 hours before your scheduled time via the confirmation link.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "John D.",
          quote: "The booking process was incredibly smooth and fast.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("booking-appointments"),
          headline: "See What's Open",
          subline: "Instant confirmation for all bookings.",
          ctaText: "Book Now",
          ctaLink: "/scheduler",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Fast & Easy",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Monthly Bookings", value: 1200 },
        { label: "Average Booking Value", value: 75 },
        { label: "Customer Retention", value: 95 },
      ],
      seo: {
        id: "",
        title:
          "Online Booking & Appointment Scheduling | Fast, Easy, and Secure",
        description:
          "Schedule your service in minutes with our seamless online booking system. Find available slots and get instant confirmation for all appointments.",
        keywords: [
          "online booking",
          "appointment scheduling",
          "fast booking",
          "easy scheduling",
          "secure appointments",
        ],
      },
      stats: [
        { label: "Client Retention", value: "95%" },
        { label: "Average Booking Value", value: "$75" },
        { label: "Monthly Bookings", value: 1200 },
      ],
      pricingTiers: [
        {
          name: "Initial Consult",
          price: 20,
          duration: "per appointment",
          features: ["Online confirmation"],
        },
      ],
      awards: [
        { name: "Best Booking Experience 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 10 Apps 2024", iconUrl: "/icons/award.svg" },
      ],
      promotions: [
        {
          title: "Early Bird Discount",
          description: "Book your appointment before 10 AM and get 10% off.",
          ctaText: "Book Early",
          ctaLink: "/scheduler",
          companyId: "",
          perks: [{ id: "", label: "10% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
        {
          title: "Weekend Special",
          description:
            "Book a weekend appointment and receive a complimentary follow-up consultation.",
          ctaText: "Book Weekend",
          ctaLink: "/scheduler",
          companyId: "",
          perks: [{ id: "", label: "Free Follow-Up", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Effortless Scheduling",
      sectionTitle: "Book Your Appointment Online",
      sectionDescription:
        "Whether you're an executive looking to level up your leadership skills or a team seeking strategic guidance, our tailored coaching programs are designed to drive real results and lasting transformation.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    Barbershop: withOverrides({
      tagline: "Schedule Your Service in Minutes",
      description:
        "Find available slots and **book appointments** online seamlessly for our premium services.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/bookinghub" },
      ],
      policies: [
        {
          type: PolicyType.PRIVACY,
          content: "Your booking data is secured and never shared.",
        },
      ],
      faqs: [
        {
          question: "Can I reschedule my appointment?",
          answer:
            "Yes, up to 24 hours before your scheduled time via the confirmation link.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "John D.",
          quote: "The booking process was incredibly smooth and fast.",
          rating: 4,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("booking-appointments"),
          headline: "See What's Open",
          subline: "Instant confirmation for all bookings.",
          ctaText: "Book Now",
          ctaLink: "/scheduler",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Fast & Easy",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Monthly Bookings", value: 1200 },
        { label: "Average Booking Value", value: 75 },
        { label: "Customer Retention", value: 95 },
      ],
      seo: {
        id: "",
        title:
          "Online Booking & Appointment Scheduling | Fast, Easy, and Secure",
        description:
          "Schedule your service in minutes with our seamless online booking system. Find available slots and get instant confirmation for all appointments.",
        keywords: [
          "online booking",
          "appointment scheduling",
          "fast booking",
          "easy scheduling",
          "secure appointments",
        ],
      },
      stats: [
        { label: "Client Retention", value: "95%" },
        { label: "Average Booking Value", value: "$75" },
        { label: "Monthly Bookings", value: 1200 },
      ],
      pricingTiers: [
        {
          name: "Initial Consult",
          price: 20,
          duration: "per appointment",
          features: ["Online confirmation"],
        },
      ],
      awards: [
        { name: "Best Booking Experience 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 10 Apps 2024", iconUrl: "/icons/award.svg" },
      ],
      promotions: [
        {
          title: "Early Bird Discount",
          description: "Book your appointment before 10 AM and get 10% off.",
          ctaText: "Book Early",
          ctaLink: "/scheduler",
          companyId: "",
          perks: [{ id: "", label: "10% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
        {
          title: "Weekend Special",
          description:
            "Book a weekend appointment and receive a complimentary follow-up consultation.",
          ctaText: "Book Weekend",
          ctaLink: "/scheduler",
          companyId: "",
          perks: [{ id: "", label: "Free Follow-Up", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Effortless Scheduling",
      sectionTitle: "Book Your Appointment Online",
      sectionDescription:
        "Whether you're an executive looking to level up your leadership skills or a team seeking strategic guidance, our tailored coaching programs are designed to drive real results and lasting transformation.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Portfolio & Personal Branding": withOverrides({
      tagline: "**Design. Code. Create.** See My Latest Projects.",
      description:
        "Showcasing a blend of **creative design**, technical development skills, and professional experience.",
      socialLinks: [
        {
          channel: SocialChannel.LINKEDIN,
          url: "https://linkedin.com/in/designer",
        },
      ],
      faqs: [
        {
          question: "What are your core skills?",
          answer: "React, Node.js, and UX/UI Design.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Client XYZ",
          quote:
            "Highly recommended for challenging projects and creative solutions.",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("portfolio"),
          headline: "Let's Build Something Great",
          subline: "Available for freelance and full-time opportunities.",
          ctaText: "View CV",
          ctaLink: "/cv",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Creative Pro",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Projects Completed", value: 50 },
        { label: "Happy Clients", value: 20 },
        { label: "Years of Experience", value: 5 },
      ],
      seo: {
        id: "",
        title:
          "Portfolio & Personal Branding | Showcasing Creative Design & Development",
        description:
          "Explore my portfolio showcasing a blend of creative design, technical development skills, and professional experience. Available for freelance and full-time opportunities.",
        keywords: [
          "portfolio",
          "personal branding",
          "creative design",
          "technical development",
          "freelance designer",
        ],
      },
      stats: [
        { label: "Client Satisfaction", value: "98%" },
        { label: "Repeat Clients", value: "60%" },
        { label: "Average Project Value", value: "$10,000" },
      ],
      awards: [
        { name: "Best Portfolio 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 10 Designers 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.TERMS,
          content:
            "All project work is subject to a signed agreement outlining scope, timelines, and payment terms.",
        },
      ],
      pricingTiers: [
        {
          name: "Freelance Project",
          price: 5000,
          duration: "per project",
          features: ["Custom design and development"],
        },
        {
          name: "Full-Time Role",
          price: 0,
          duration: "per year",
          features: ["Available for hire"],
        },
      ],
      promotions: [
        {
          title: "New Year Special",
          description:
            "Kickstart your project with a 15% discount for bookings made in January.",
          ctaText: "Book Now",
          ctaLink: "/contact",
          companyId: "",
          perks: [{ id: "", label: "15% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Showcasing My Work",
      sectionTitle: "Portfolio & Personal Branding",
      sectionDescription:
        "Showcasing a blend of creative design, technical development skills, and professional experience.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Blog & Content": withOverrides({
      tagline: "**Deep Dive** into Modern Technology & Culture.",
      description:
        "Daily articles, reviews, and tutorials covering **AI, software development, and futurism.** Join the discussion!",
      socialLinks: [
        { channel: SocialChannel.TWITTER, url: "https://twitter.com/techblog" },
      ],
      faqs: [
        {
          question: "How often do you post?",
          answer:
            "We publish new articles every Monday, Wednesday, and Friday.",
          order: 1,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("blog"),
          headline: "The Future of AI is Here",
          subline: "Read the latest post on machine learning ethics.",
          ctaText: "Read Now",
          ctaLink: "/article/ai-ethics",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Trending",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      Collection: [
        {
          name: "Popular Articles",
          description: "The most read posts this month.",
        } as any,
      ],
      awards: [
        { name: "Best Tech Blog 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 50 Blogs 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and do not share your data with third parties.",
        },
      ],
      seo: {
        id: "",
        title:
          "Tech Blog & Content | Deep Dive into AI, Software Development & Futurism",
        description:
          "Explore our tech blog for daily articles, reviews, and tutorials covering AI, software development, and futurism. Join the discussion and stay ahead of the curve.",
        keywords: [
          "tech blog",
          "AI articles",
          "software development tutorials",
          "futurism insights",
          "technology news",
        ],
      },
      stats: [
        { label: "Monthly Readers", value: 100000 },
        { label: "Average Time on Page", value: "5 minutes" },
        { label: "Newsletter Subscribers", value: 20000 },
      ],
      metrics: [
        { label: "Articles Published", value: 500 },
        { label: "5-Star Reviews", value: 3000 },
        { label: "Social Shares", value: 15000 },
      ],
      promotions: [
        {
          title: "Subscribe to Our Newsletter",
          description:
            "Get the latest articles delivered to your inbox. Sign up today!",
          ctaText: "Subscribe Now",
          ctaLink: "/subscribe",
          companyId: "",
          perks: [{ id: "", label: "Exclusive Content", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Insights & Analysis",
      sectionTitle: "Blog & Content",
      sectionDescription:
        "Daily articles, reviews, and tutorials covering AI, software development, and futurism. Join the discussion!",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Nonprofit & Community": withOverrides({
      tagline: "**Making a Difference**, One Donation at a Time.",
      description:
        "Our mission is to support **local education initiatives**. See how your contribution helps.",
      socialLinks: [
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/nonprofit",
        },
      ],
      faqs: [
        {
          question: "Where does my donation go?",
          answer: "95% of all donations directly fund student scholarships.",
          order: 1,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("nonprofit"),
          headline: "Help Us Reach Our Goal",
          subline: "Every dollar provides a child with educational resources.",
          ctaText: "Donate Now",
          ctaLink: "/donate",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Support Us",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [{ label: "Funds Raised", value: 50000 }],
      awards: [{ name: "Community Impact 2024", iconUrl: "/icons/award.svg" }],
      seo: {
        id: "",
        title:
          "Nonprofit & Community Support | Make a Difference with Your Donation",
        description:
          "Join our mission to support local education initiatives. Every dollar provides a child with educational resources. See how your contribution helps make a difference.",
        keywords: [
          "nonprofit",
          "community support",
          "donate for education",
          "charity",
          "make a difference",
        ],
      },
      stats: [
        { label: "Students Supported", value: 200 },
        { label: "Volunteers", value: 50 },
        { label: "Events Hosted", value: 10 },
      ],
      policies: [
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      pricingTiers: [
        {
          name: "One-Time Donation",
          price: 0,
          duration: "one-time",
          features: ["Support our cause"],
        },
        {
          name: "Monthly Supporter",
          price: 20,
          duration: "monthly",
          features: ["Ongoing impact"],
        },
      ],
      promotions: [
        {
          title: "Matching Gift Challenge",
          description:
            "All donations made this month will be matched by a generous donor!",
          ctaText: "Donate Now",
          ctaLink: "/donate",
          companyId: "",
          perks: [{ id: "", label: "Double Your Impact", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Join Our Mission",
      sectionTitle: "Nonprofit & Community",
      sectionDescription:
        "you're an executive looking to level up your leadership skills or a team seeking strategic guidance, our tailored coaching programs are designed to drive real results and lasting transformation.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Healthcare & Clinics": withOverrides({
      tagline: "**Compassionate Care** You Can Trust",
      description:
        "Providing comprehensive **health and wellness services** with patient-first technology and experienced staff.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/clinic" },
      ],
      faqs: [
        {
          question: "Do you accept my insurance?",
          answer: "We accept most major PPO and HMO plans. Call us to verify.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Maria G.",
          quote:
            "The staff was kind and helpful, and the facility was very clean.",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("healthcare"),
          headline: "Prioritize Your Health",
          subline: "Book your annual checkup online today.",
          ctaText: "Book Appointment",
          ctaLink: "/booking",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Patient Care",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      services: [
        { title: "Pediatrics", description: "Care for children 0-18" } as any,
      ],
      metrics: [
        { label: "Patients Served", value: 10000 },
        { label: "Average Wait Time", value: 15 },
        { label: "Patient Satisfaction", value: 95 },
      ],
      seo: {
        id: "",
        title: "Healthcare & Clinics | Compassionate Care You Can Trust",
        description:
          "Providing comprehensive health and wellness services with patient-first technology and experienced staff. Book your appointment online today.",
        keywords: [
          "healthcare",
          "clinics",
          "compassionate care",
          "patient-first",
          "health and wellness",
        ],
      },
      stats: [
        { label: "Patient Satisfaction", value: "95%" },
        { label: "Average Wait Time", value: "15 minutes" },
        { label: "Patients Served", value: 10000 },
      ],
      awards: [
        { name: "Best Clinic 2024", iconUrl: "/icons/award.svg" },
        { name: "Top Healthcare Provider 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      promotions: [
        {
          title: "Free Flu Shots",
          description:
            "Get your flu shot for free this season. No appointment necessary!",
          ctaText: "Learn More",
          ctaLink: "/services",
          companyId: "",
          perks: [{ id: "", label: "Free Flu Shot", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Your Health, Our Priority",
      sectionTitle: "Healthcare & Clinics",
      sectionDescription:
        "Providing comprehensive health and wellness services with patient-first technology and experienced staff.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Media & Entertainment": withOverrides({
      tagline: "Your Source of **Original Entertainment**",
      description:
        "Showcasing the latest trailers, exclusive behind-the-scenes content, and upcoming film/series releases.",
      socialLinks: [
        { channel: SocialChannel.YOUTUBE, url: "https://youtube.com/studio" },
      ],
      faqs: [
        {
          question: "How can I audition?",
          answer: "Please submit your portfolio via our talent contact page.",
          order: 1,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("media"),
          headline: "New Series Launching This Fall",
          subline: "Watch the thrilling trailer now.",
          ctaText: "Watch Trailer",
          ctaLink: "/trailer",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Exclusive",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Subscribers", value: 500000 },
        { label: "Average View Time", value: 10 },
        { label: "Social Engagement", value: 20000 },
      ],
      seo: {
        id: "",
        title:
          "Media & Entertainment | Original Content, Trailers & Exclusive Access",
        description:
          "Discover the latest trailers, exclusive behind-the-scenes content, and upcoming film and series releases. Your source for original entertainment.",
        keywords: [
          "media",
          "entertainment",
          "trailers",
          "exclusive content",
          "film releases",
        ],
      },
      stats: [
        { label: "Subscribers", value: 500000 },
        { label: "Average View Time", value: "10 minutes" },
        { label: "Social Engagement", value: 20000 },
      ],
      awards: [
        { name: "Best New Series 2024", iconUrl: "/icons/award.svg" },
        { name: "Top Entertainment Channel 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.PRIVACY,
          content:
            "We respect your privacy and protect your data with industry-standard security.",
        },
      ],
      promotions: [
        {
          title: "Exclusive Behind-the-Scenes Access",
          description:
            "Subscribe now to get exclusive content and early access to trailers.",
          ctaText: "Subscribe Now",
          ctaLink: "/subscribe",
          companyId: "",
          perks: [{ id: "", label: "Exclusive Content", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Experience the Magic of Storytelling",
      sectionTitle: "Media & Entertainment",
      sectionDescription:
        "Showcasing the latest trailers, exclusive behind-the-scenes content, and upcoming film/series releases.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Finance & Legal": withOverrides({
      tagline: "**Expert Financial & Legal Services**",
      description:
        "Trusted advisors providing strategic financial planning and comprehensive legal counsel for businesses and individuals.",
      socialLinks: [
        {
          channel: SocialChannel.LINKEDIN,
          url: "https://linkedin.com/company/financelegal",
        },
      ],
      faqs: [
        {
          question: "How much is an initial consultation?",
          answer: "The first 30 minutes are complimentary.",
          order: 1,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("finance-legal"),
          headline: "Plan Your Future Today",
          subline: "Schedule a secure consultation with our certified experts.",
          ctaText: "Get Started",
          ctaLink: "/contact",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Confidential",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      seo: {
        id: "",
        title:
          "Finance & Legal Services | Expert Financial Planning & Legal Counsel",
        description:
          "Trusted advisors providing strategic financial planning and comprehensive legal counsel for businesses and individuals. Schedule a secure consultation today.",
        keywords: [
          "finance services",
          "legal services",
          "financial planning",
          "legal counsel",
          "expert advisors",
        ],
      },
      stats: [
        { label: "Client Satisfaction", value: "98%" },
        { label: "Repeat Clients", value: "85%" },
        { label: "Average Consultation Value", value: "$500" },
      ],
      metrics: [
        { label: "Clients Served", value: 200 },
        { label: "5-Star Reviews", value: 150 },
        { label: "Years of Experience", value: 20 },
      ],
      awards: [
        { name: "Best Financial Advisor 2024", iconUrl: "/icons/award.svg" },
        { name: "Top Legal Firm 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CONFIDENTIALITY,
          content:
            "All consultations are confidential and protected by attorney-client privilege.",
        },
      ],
      promotions: [
        {
          title: "Free Legal Consultation",
          description:
            "Get a free 30-minute consultation with our expert attorneys.",
          ctaText: "Book Now",
          ctaLink: "/consultation",
          companyId: "",
          perks: [{ id: "", label: "Free Consultation", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Your Trusted Advisors",
      sectionTitle: "Finance & Legal",
      sectionDescription:
        "Trusted advisors providing strategic financial planning and comprehensive legal counsel for businesses and individuals.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    Automotive: withOverrides({
      tagline: "**Drive Your Dream Car.** Best Deals Guaranteed.",
      description:
        "The premier car dealership in the region, offering new and used vehicles, servicing, and financing options.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/cardealer" },
      ],
      faqs: [
        {
          question: "Can I schedule a test drive online?",
          answer:
            "Yes, use our booking tool to select a vehicle and time slot.",
          order: 1,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("automotive"),
          headline: "0% APR Financing",
          subline: "On select new models for a limited time.",
          ctaText: "View Inventory",
          ctaLink: "/inventory",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Special Offer",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      Collection: [
        {
          name: "Sedans",
          description: "Economical and reliable models.",
        } as any,
      ],
      metrics: [
        { label: "Cars Sold", value: 500 },
        { label: "Customer Satisfaction", value: 95 },
        { label: "Average Financing Rate", value: 3.5 },
      ],
      seo: {
        id: "",
        title: "Automotive Dealership | New & Used Cars, Service & Financing",
        description:
          "Discover your dream car at our premier dealership. We offer new and used vehicles, expert servicing, and competitive financing options. Visit us today!",
        keywords: [
          "automotive dealership",
          "new cars",
          "used cars",
          "car service",
          "car financing",
        ],
      },
      stats: [
        { label: "Cars Sold", value: 500 },
        { label: "Customer Satisfaction", value: "95%" },
        { label: "Average Financing Rate", value: "3.5%" },
      ],
      awards: [
        { name: "Best Dealership 2024", iconUrl: "/icons/award.svg" },
        { name: "Top Customer Service 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.RETURNS,
          content:
            "7-day return policy on all used vehicles. Terms and conditions apply.",
        },
      ],

      promotions: [
        {
          title: "Holiday Sales Event",
          description:
            "Celebrate the season with exclusive discounts and offers on select models.",
          ctaText: "Shop Now",
          ctaLink: "/inventory",
          companyId: "",
          perks: [{ id: "", label: "Exclusive Discounts", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Find Your Perfect Ride",
      sectionTitle: "Automotive",
      sectionDescription:
        "The premier car dealership in the region, offering new and used vehicles, servicing, and financing options.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Travel & Tourism": withOverrides({
      tagline: "**Explore the World.** Book Your Adventure.",
      description:
        "Promote travel packages, custom itineraries, and services for unforgettable global destinations.",
      socialLinks: [
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/travelagency",
        },
      ],
      faqs: [
        {
          question: "Do you offer travel insurance?",
          answer:
            "Yes, we recommend our comprehensive insurance package with all bookings.",
          order: 1,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("travel"),
          headline: "Bali Beach Retreat: 7 Days",
          subline: "All-inclusive package starts at $1,200.",
          ctaText: "View Details",
          ctaLink: "/packages/bali",
          id: "",
          companyId: "",
          productImageUrl: null,
          badgeText: "Top Rated",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
          price: "1200",
        },
      ],
      events: [{ title: "Travel Info Webinar", date: in1Day } as any],
      awards: [
        { name: "Best Travel Agency 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 10 Tour Operators 2024", iconUrl: "/icons/award.svg" },
      ],
      metrics: [
        { label: "Trips Booked", value: 300 },
        { label: "Customer Satisfaction", value: 97 },
        { label: "Repeat Travelers", value: 80 },
      ],
      seo: {
        id: "",
        title:
          "Travel & Tourism | Explore the World with Unforgettable Packages",
        description:
          "Discover unforgettable global destinations with our travel packages and custom itineraries. Book your adventure today and explore the world with us.",
        keywords: [
          "travel agency",
          "tour packages",
          "custom itineraries",
          "global destinations",
          "book travel",
        ],
      },
      stats: [
        { label: "Trips Booked", value: 300 },
        { label: "Customer Satisfaction", value: "97%" },
        { label: "Repeat Travelers", value: "80%" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Cancellations must be made at least 30 days before departure for a full refund.",
        },
      ],

      promotions: [
        {
          title: "Summer Getaway Sale",
          description:
            "Book your summer vacation by the end of June and save 15% on select packages.",
          ctaText: "Book Now",
          ctaLink: "/packages",
          companyId: "",
          perks: [{ id: "", label: "15% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Your Adventure Awaits",
      sectionTitle: "Travel & Tourism",
      sectionDescription:
        "Promote travel packages, custom itineraries, and services for unforgettable global destinations.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Fitness & Wellness": withOverrides({
      tagline: "Your Health, Our Priority. **Start Your Journey.**",
      description:
        "A comprehensive gym and fitness center offering classes, personal training, and wellness consultations.",
      socialLinks: [
        { channel: SocialChannel.INSTAGRAM, url: "https://insta.com/gym" },
      ],
      faqs: [
        {
          question: "Do you have a free trial?",
          answer: "Yes, enjoy a free 7-day pass!",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Mark C.",
          quote: "Great equipment and highly motivating trainers.",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("fitness"),
          headline: "New Year, New Goals",
          subline: "Get 3 months free when you sign up annually.",
          ctaText: "Join Now",
          ctaLink: "/membership",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "New Offer",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      pricingTiers: [
        {
          name: "Monthly Pass",
          price: 49,
          duration: "monthly",
          features: ["Access to all equipment"],
        },
        {
          name: "Premium Pass",
          price: 99,
          duration: "monthly",
          features: ["All-access", "5 personal training sessions"],
        },
      ],
      events: [
        { title: "Yoga Workshop", date: in1Day, location: "Studio A" } as any,
      ],
      awards: [
        { name: "Best Gym 2024", iconUrl: "/icons/award.svg" },
        { name: "Top Fitness Center 2024", iconUrl: "/icons/award.svg" },
      ],
      metrics: [
        { label: "Active Members", value: 500 },
        { label: "Average Class Attendance", value: 30 },
        { label: "Member Retention", value: 90 },
      ],
      seo: {
        id: "",
        title: "Fitness & Wellness Center | Achieve Your Health Goals",
        description:
          "Join our comprehensive gym and fitness center offering classes, personal training, and wellness consultations. Start your fitness journey with us today.",
        keywords: [
          "fitness center",
          "gym",
          "personal training",
          "wellness consultations",
          "health and fitness",
        ],
      },
      stats: [
        { label: "Active Members", value: 500 },
        { label: "Average Class Attendance", value: 30 },
        { label: "Member Retention", value: "90%" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Memberships can be canceled with 30 days' notice. No refunds for partial months.",
        },
      ],
      promotions: [
        {
          title: "New Year Special",
          description:
            "Sign up for an annual membership in January and get 3 months free!",
          ctaText: "Join Now",
          ctaLink: "/membership",
          companyId: "",
          perks: [{ id: "", label: "3 Months Free", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Achieve Your Fitness Goals",
      sectionTitle: "Fitness & Wellness",
      sectionDescription:
        "A comprehensive gym and fitness center offering classes, personal training, and wellness consultations.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Directory & Listings": withOverrides({
      tagline: "**Find What You Need** in Your City",
      description:
        "The ultimate local resource to **list and discover businesses**, services, and community events.",
      faqs: [
        {
          question: "How do I list my business?",
          answer: "Click 'Add Listing' and choose your plan.",
          order: 1,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("directory"),
          headline: "Search 5,000+ Local Businesses",
          subline: "Restaurants, repair shops, and more.",
          ctaText: "Start Search",
          ctaLink: "/listings",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Local",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      pricingTiers: [
        {
          name: "Standard Listing",
          price: 9,
          duration: "monthly",
          features: ["Name & contact info"],
        },
      ],
      Collection: [
        {
          name: "Top Rated",
          description: "Businesses with the best reviews.",
        } as any,
      ],
      events: [
        {
          title: "Local Business Expo",
          date: in1Day,
          location: "City Convention Center",
        } as any,
      ],
      Announcement: [
        {
          title: "New Feature: User Reviews",
          content: "Customers can now leave reviews on business listings.",
          date: in1Day,
        } as any,
      ],
      awards: [
        { name: "Best Local Directory 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 50 Startups 2024", iconUrl: "/icons/award.svg" },
        { name: "Best User Experience 2024", iconUrl: "/icons/award.svg" },
      ],
      metrics: [
        { label: "Businesses Listed", value: 2000 },
        { label: "Monthly Visitors", value: 50000 },
        { label: "User Reviews", value: 10000 },
        { label: "Events Listed", value: 500 },
      ],
      seo: {
        id: "",
        title: "Directory & Listings | Discover Local Businesses & Services",
        description:
          "Find what you need in your city with our comprehensive directory of local businesses, services, and community events. Start your search today!",
        keywords: [
          "local directory",
          "business listings",
          "community events",
          "discover local",
          "list your business",
        ],
      },
      stats: [
        { label: "Monthly Visitors", value: 50000 },
        { label: "Businesses Listed", value: 2000 },
        { label: "User Reviews", value: 10000 },
        { label: "Events Listed", value: 500 },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Listings can be canceled with 30 days' notice. No refunds for partial months.",
        },
      ],
      promotions: [
        {
          title: "Free Legal Consultation",
          description:
            "Get a free 30-minute consultation with our expert attorneys.",
          ctaText: "Book Now",
          ctaLink: "/consultation",
          companyId: "",
          perks: [{ id: "", label: "Free Consultation", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Discover Local Gems",
      sectionTitle: "Directory & Listings",
      sectionDescription:
        "The ultimate local resource to list and discover businesses, services, and community events.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Educational & Online Courses": withOverrides({
      tagline: "**Learn New Skills.** Advance Your Career.",
      description:
        "High-quality, self-paced online courses taught by industry leaders in technology and business.",
      socialLinks: [
        {
          channel: SocialChannel.YOUTUBE,
          url: "https://youtube.com/onlinelearning",
        },
      ],
      faqs: [
        {
          question: "Are courses certified?",
          answer:
            "Yes, receive a certificate of completion for all paid courses.",
          order: 1,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("education"),
          headline: "Enroll in the Data Science Bootcamp",
          subline: "Master Python and machine learning in 12 weeks.",
          ctaText: "View Course",
          ctaLink: "/course/data-science",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "New Course",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      pricingTiers: [
        {
          name: "Single Course",
          price: 199,
          duration: "one-time",
          features: ["Lifetime access", "Certificate"],
        },
      ],
      Collection: [
        {
          name: "Most Popular Courses",
          description: "Our students' top picks.",
        } as any,
      ],
      events: [
        {
          title: "Live Q&A with Instructors",
          date: in1Day,
          location: "Online",
        } as any,
      ],
      awards: [
        {
          name: "Best Online Learning Platform 2024",
          iconUrl: "/icons/award.svg",
        },
        { name: "Top 10 EdTech Companies 2024", iconUrl: "/icons/award.svg" },
        { name: "Best User Experience 2024", iconUrl: "/icons/award.svg" },
        { name: "Most Courses Available 2024", iconUrl: "/icons/award.svg" },
      ],
      metrics: [
        { label: "Students Enrolled", value: 10000 },
        { label: "Average Course Rating", value: 4.8 },
        { label: "Courses Offered", value: 50 },
        { label: "Live Events Hosted", value: 20 },
        { label: "Certificates Issued", value: 8000 },
      ],
      seo: {
        id: "",
        title:
          "Educational & Online Courses | Learn New Skills, Advance Your Career",
        description:
          "Discover high-quality, self-paced online courses taught by industry leaders in technology and business. Enroll today and advance your career with new skills.",
        keywords: [
          "online courses",
          "educational platform",
          "learn new skills",
          "advance your career",
          "certified courses",
        ],
      },
      stats: [
        { label: "Students Enrolled", value: 10000 },
        { label: "Average Course Rating", value: "4.8/5" },
        { label: "Courses Offered", value: 50 },
        { label: "Live Events Hosted", value: 20 },
        { label: "Certificates Issued", value: 8000 },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Courses can be canceled within 14 days of purchase for a full refund.",
        },
      ],
      promotions: [
        {
          title: "New Year Sale",
          description:
            "Get 20% off all courses with code NEWYEAR20. Limited time offer!",
          ctaText: "Shop Now",
          ctaLink: "/courses",
          companyId: "",
          perks: [{ id: "", label: "20% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Expand Your Knowledge",
      sectionTitle: "Educational & Online Courses",
      sectionDescription:
        "High-quality, self-paced online courses taught by industry leaders in technology and business.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Restaurant & Food Delivery": withOverrides({
      tagline: "**Delicious Food Delivered** Hot & Fresh",
      description:
        "Browse our menu of gourmet dishes, order online, and get fast delivery right to your door.",
      socialLinks: [
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/restaurant",
        },
      ],
      faqs: [
        {
          question: "What are your delivery zones?",
          answer: "We deliver within a 5-mile radius of the restaurant.",
          order: 1,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("restaurant"),
          headline: "Today's Special: Authentic Italian Pizza",
          subline: "Order now for 10% off your first online order.",
          ctaText: "View Menu",
          ctaLink: "/menu",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "New Offer",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      Collection: [
        {
          name: "Signature Dishes",
          description: "Our chef's recommended plates.",
        } as any,
      ],
      metrics: [
        { label: "Orders Delivered", value: 5000 },
        { label: "Average Delivery Time", value: 30 },
        { label: "Customer Satisfaction", value: 95 },
      ],
      seo: {
        id: "",
        title:
          "Restaurant & Food Delivery | Delicious Food Delivered Hot & Fresh",
        description:
          "Browse our menu of gourmet dishes, order online, and get fast delivery right to your door. Experience delicious food delivered hot and fresh.",
        keywords: [
          "restaurant",
          "food delivery",
          "gourmet dishes",
          "order online",
          "fast delivery",
        ],
      },
      stats: [
        { label: "Orders Delivered", value: 5000 },
        { label: "Average Delivery Time", value: "30 minutes" },
        { label: "Customer Satisfaction", value: "95%" },
      ],
      awards: [
        { name: "Best Local Restaurant 2024", iconUrl: "/icons/award.svg" },
        { name: "Top Food Delivery Service 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Orders can be canceled within 5 minutes of placement for a full refund.",
        },
      ],
      promotions: [
        {
          title: "Free Dessert",
          description:
            "Get a free dessert with any main course ordered online.",
          ctaText: "Order Now",
          ctaLink: "/menu",
          companyId: "",
          perks: [{ id: "", label: "Free Dessert", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Savor Every Bite",
      sectionTitle: "Restaurant & Food Delivery",
      sectionDescription:
        "Browse our menu of gourmet dishes, order online, and get fast delivery right to your door.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Event & Ticketing": withOverrides({
      tagline: "**Discover Events** and Get Your Tickets.",
      description:
        "The easiest way to find and book tickets for concerts, conferences, and local events.",
      faqs: [
        {
          question: "Can I transfer my ticket?",
          answer:
            "Yes, tickets can be transferred up to 1 hour before the event start time.",
          order: 1,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("event"),
          headline: "Future Fest: Music & Tech",
          subline: "Tickets on sale now for the biggest event of the year.",
          ctaText: "Buy Tickets",
          ctaLink: "/tickets",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Limited Seats",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      events: [
        {
          title: "Opening Night Gala",
          date: in1Day,
          location: "City Auditorium",
        } as any,
      ],
      Announcement: [
        {
          title: "Early Bird Discounts",
          content: "Get 20% off if you book before next month.",
          date: in3Days,
        } as any,
      ],
      awards: [
        { name: "Top Event Organizer 2024", iconUrl: "/icons/award.svg" },
        { name: "Best Ticketing Platform 2024", iconUrl: "/icons/award.svg" },
        { name: "Best User Experience 2024", iconUrl: "/icons/award.svg" },
      ],
      metrics: [
        { label: "Events Hosted", value: 150 },
        { label: "Tickets Sold", value: 10000 },
        { label: "Customer Satisfaction", value: 95 },
      ],
      seo: {
        id: "",
        title: "Event & Ticketing | Discover Events and Get Your Tickets",
        description:
          "Find and book tickets for concerts, conferences, and local events with ease. Discover unforgettable moments with our event and ticketing platform.",
        keywords: [
          "event ticketing",
          "buy tickets",
          "concerts",
          "conferences",
          "local events",
        ],
      },
      stats: [
        { label: "Average Attendance", value: 500 },
        { label: "Tickets Sold", value: 10000 },
        { label: "Customer Satisfaction", value: 95 },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Tickets can be canceled up to 24 hours before the event for a full refund.",
        },
      ],
      promotions: [
        {
          title: "Group Discount",
          description: "Buy 4 or more tickets and get 25% off your order.",
          ctaText: "Buy Now",
          ctaLink: "/tickets",
          companyId: "",
          perks: [{ id: "", label: "25% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Experience Unforgettable Moments",
      sectionTitle: "Event & Ticketing",
      sectionDescription:
        "The easiest way to find and book tickets for concerts, conferences, and local events.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Real Estate": withOverrides({
      tagline: "Your Key to a **New Home** Today",
      description:
        "The leading resource for **property listings**, sales, and rental management in the city.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/realestate" },
      ],
      faqs: [
        {
          question: "What are the agent fees?",
          answer: "Our standard commission rate is 5% for sellers.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "The Smith Family",
          quote:
            "Found our perfect apartment quickly and smoothly. Great agents!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("real-estate"),
          headline: "Luxury Listings: Up to 50% Off",
          subline: "Explore exclusive properties in downtown.",
          ctaText: "Search Listings",
          ctaLink: "/properties",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Hot Market",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      Collection: [
        {
          name: "Featured Properties",
          description: "Handpicked homes for you.",
        } as any,
      ],
      metrics: [
        { label: "Properties Sold", value: 100 },
        { label: "Average Days on Market", value: 30 },
        { label: "Customer Satisfaction", value: 95 },
      ],
      seo: {
        id: "",
        title: "Real Estate | Find Your Dream Home with Our Property Listings",
        description:
          "Discover your dream home with our comprehensive real estate platform. Browse property listings, sales, and rental management services in the city.",
        keywords: [
          "real estate",
          "property listings",
          "homes for sale",
          "rental management",
          "find a home",
        ],
      },
      stats: [
        { label: "Properties Sold", value: 100 },
        { label: "Average Days on Market", value: 30 },
        { label: "Customer Satisfaction", value: "95%" },
      ],
      awards: [
        { name: "Best Real Estate Agency 2024", iconUrl: "/icons/award.svg" },
        { name: "Top Property Listings 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Listings can be canceled with 30 days' notice. No refunds for partial months.",
        },
      ],
      promotions: [
        {
          title: "Free Home Valuation",
          description:
            "Get a free market analysis of your home's value. No obligation!",
          ctaText: "Get Valuation",
          ctaLink: "/valuation",
          companyId: "",
          perks: [{ id: "", label: "Free Valuation", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Find Your Dream Home",
      sectionTitle: "Real Estate",
      sectionDescription:
        "The leading resource for property listings, sales, and rental management in the city.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Property Management": withOverrides({
      tagline: "**Effortless Property Management** for Landlords",
      description:
        "Comprehensive property management services including tenant screening, rent collection, and maintenance coordination.",
      socialLinks: [
        {
          channel: SocialChannel.LINKEDIN,
          url: "https://linkedin.com/company/propertymanagement",
        },
      ],
      faqs: [
        {
          question: "What are your management fees?",
          answer: "Our standard fee is 8% of monthly rent collected.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "John D., Landlord",
          quote:
            "Their team handles everything smoothly. My properties have never been easier to manage.",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("property-management"),
          headline: "Stress-Free Property Management",
          subline: "Sign up today and get your first month free.",
          ctaText: "Get Started",
          ctaLink: "/signup",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "New Offer",
          endsAt: in3Days,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      Collection: [
        {
          name: "Our Services",
          description:
            "Explore our full range of property management solutions.",
        } as any,
      ],
      metrics: [
        { label: "Properties Managed", value: 200 },
        { label: "Average Occupancy Rate", value: 95 },
        { label: "Customer Satisfaction", value: 98 },
      ],
      seo: {
        id: "",
        title: "Property Management | Effortless Solutions for Landlords",
        description:
          "Discover comprehensive property management services including tenant screening, rent collection, and maintenance coordination. Make property management effortless with us.",
        keywords: [
          "property management",
          "landlord services",
          "tenant screening",
          "rent collection",
          "maintenance coordination",
        ],
      },
      stats: [
        { label: "Properties Managed", value: 200 },
        { label: "Average Occupancy Rate", value: "95%" },
        { label: "Customer Satisfaction", value: "98%" },
      ],
      awards: [
        {
          name: "Best Property Management Company 2024",
          iconUrl: "/icons/award.svg",
        },
        { name: "Top Landlord Services 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Management contracts can be canceled with 30 days' notice. No refunds for partial months.",
        },
      ],
      promotions: [
        {
          title: "First Month Free",
          description:
            "Sign up for our property management services today and get your first month free!",
          ctaText: "Get Started",
          ctaLink: "/signup",
          companyId: "",
          perks: [{ id: "", label: "First Month Free", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Effortless Solutions for Landlords",
      sectionTitle: "Property Management",
      sectionDescription:
        "Comprehensive property management services including tenant screening, rent collection, and maintenance coordination.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "SaaS & Web Apps": withOverrides({
      tagline: "**Automate Your Workflow.** Simplify Everything.",
      description:
        "Powerful cloud-based software designed to **streamline team collaboration** and boost productivity for remote teams.",
      socialLinks: [
        { channel: SocialChannel.TWITTER, url: "https://twitter.com/saasapp" },
      ],
      faqs: [
        {
          question: "Is there a free trial?",
          answer: "Yes, we offer a 14-day risk-free trial on all plans.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "CEO, TechCorp",
          quote: "Essential tool for our startup. Saved us 10 hours a week.",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("saas"),
          headline: "Launch Your Free Trial Today",
          subline: "No credit card required. Cancel anytime.",
          ctaText: "Start Now",
          ctaLink: "/signup",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Cloud Powered",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      pricingTiers: [
        {
          name: "Basic",
          price: 9,
          duration: "monthly",
          features: ["5 Users", "Standard Support"],
        },
        {
          name: "Pro",
          price: 29,
          duration: "monthly",
          features: [
            "Unlimited Users",
            "Priority Support",
            "Advanced Analytics",
          ],
        },
      ],
      Collection: [
        {
          name: "Integrations",
          description: "Works seamlessly with your favorite tools.",
        } as any,
      ],
      metrics: [
        { label: "Active Users", value: 1000 },
        { label: "Customer Satisfaction", value: 95 },
        { label: "Integrations Available", value: 50 },
      ],
      seo: {
        id: "",
        title: "SaaS & Web Apps | Automate Your Workflow, Simplify Everything",
        description:
          "Discover powerful cloud-based software designed to streamline team collaboration and boost productivity for remote teams. Start your free trial today.",
        keywords: [
          "saas",
          "web apps",
          "team collaboration",
          "productivity tools",
          "cloud software",
        ],
      },
      stats: [
        { label: "Active Users", value: 1000 },
        { label: "Customer Satisfaction", value: 95 },
        { label: "Integrations Available", value: 50 },
      ],
      awards: [
        { name: "Best SaaS Product 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 10 Startups 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Subscriptions can be canceled at any time. No refunds for partial months.",
        },
      ],
      promotions: [
        {
          title: "Limited Time Offer",
          description: "Sign up for an annual plan and get 2 months free!",
          ctaText: "Upgrade Now",
          ctaLink: "/pricing",
          companyId: "",
          perks: [{ id: "", label: "2 Months Free", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Boost Your Team's Productivity",
      sectionTitle: "SaaS & Web Apps",
      sectionDescription:
        "Powerful cloud-based software designed to streamline team collaboration and boost productivity for remote teams.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    Marketplace: withOverrides({
      tagline: "Buy & Sell Locally, **The Easy Way**.",
      description:
        "The largest online **product marketplace** for connecting local buyers and sellers across all categories.",
      socialLinks: [
        { channel: SocialChannel.FACEBOOK, url: "https://fb.com/marketplace" },
      ],
      Collection: [
        {
          name: "Top Categories",
          description: "Explore popular product categories.",
        } as any,
      ],
      faqs: [
        {
          question: "How safe is the payment process?",
          answer:
            "We use secure escrow and verified payment gateways for all transactions.",
          order: 1,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("marketplace"),
          headline: "List Your Items for Free!",
          subline: "Start selling to thousands of local buyers today.",
          ctaText: "Start Selling",
          ctaLink: "/sell",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Local Deals",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Active Listings", value: 5000 },
        { label: "Monthly Buyers", value: 20000 },
        { label: "Successful Transactions", value: 1500 },
      ],
      seo: {
        id: "",
        title: "Marketplace | Buy & Sell Locally with Ease",
        description:
          "Discover the largest online product marketplace for connecting local buyers and sellers across all categories. List your items for free and start selling today!",
        keywords: [
          "marketplace",
          "buy locally",
          "sell locally",
          "product listings",
          "local deals",
        ],
      },
      stats: [
        { label: "Active Listings", value: 5000 },
        { label: "Monthly Buyers", value: 20000 },
        { label: "Successful Transactions", value: 1500 },
      ],
      awards: [
        { name: "Best Local Marketplace 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 50 Startups 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Listings can be canceled at any time. No refunds for listing fees.",
        },
      ],
      promotions: [
        {
          title: "Local Seller Bonus",
          description:
            "List 10 or more items and get a featured spot on the homepage.",
          ctaText: "Learn More",
          ctaLink: "/promotions/local-seller-bonus",
          companyId: "",
          perks: [{ id: "", label: "Featured Listing", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Find Great Deals Near You",
      sectionTitle: "Marketplace",
      sectionDescription:
        "The largest online product marketplace for connecting local buyers and sellers across all categories.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Security Services": withOverrides({
      tagline: "**Protect What Matters Most** with Expert Security Services",
      description:
        "Offering comprehensive security solutions including surveillance systems, alarm installations, and 24/7 monitoring to safeguard your home and business.",
      socialLinks: [
        {
          channel: SocialChannel.LINKEDIN,
          url: "https://linkedin.com/company/securityservices",
        },
      ],
      faqs: [
        {
          question: "What types of security systems do you offer?",
          answer:
            "We provide CCTV, alarm systems, access control, and more tailored to your needs.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "David P.",
          quote:
            "Their team installed a top-notch security system for my business. Highly recommend!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("security-services"),
          headline: "Secure Your Property Today",
          subline: "Get a free consultation and quote for your security needs.",
          ctaText: "Get Quote",
          ctaLink: "/contact",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Trusted Security",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      pricingTiers: [
        {
          name: "Basic Monitoring",
          price: 29,
          duration: "monthly",
          features: ["24/7 monitoring", "Mobile alerts"],
        },
        {
          name: "Premium Package",
          price: 59,
          duration: "monthly",
          features: [
            "All Basic features",
            "Advanced surveillance",
            "Priority support",
          ],
        },
      ],
      metrics: [
        { label: "Systems Installed", value: 200 },
        { label: "24/7 Monitoring", value: 1 },
        { label: "Customer Satisfaction", value: 98 },
      ],
      seo: {
        id: "",
        title:
          "Security Services | Protect Your Home and Business with Expert Solutions",
        description:
          "Discover comprehensive security solutions including surveillance systems, alarm installations, and 24/7 monitoring to safeguard your home and business. Get a free consultation today.",
        keywords: [
          "security services",
          "home security",
          "business security",
          "surveillance systems",
          "alarm installations",
        ],
      },
      stats: [
        { label: "Systems Installed", value: 200 },
        { label: "24/7 Monitoring", value: "Yes" },
        { label: "Customer Satisfaction", value: "98%" },
      ],
      awards: [
        { name: "Best Security Company 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 10 Security Services 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Monitoring services can be canceled with 30 days' notice. No refunds for partial months.",
        },
      ],
      promotions: [
        {
          title: "Free Security Consultation",
          description:
            "Schedule a free consultation to assess your security needs and receive a custom quote.",
          ctaText: "Book Now",
          ctaLink: "/consultation",
          companyId: "",
          perks: [{ id: "", label: "Free Consultation", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Your Safety, Our Priority",
      sectionTitle: "Security Services",
      sectionDescription:
        "Offering comprehensive security solutions including surveillance systems, alarm installations, and 24/7 monitoring to safeguard your home and business.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    Security: withOverrides({
      tagline: "**Protect What Matters Most** with Expert Security Services",
      description:
        "Offering comprehensive security solutions including surveillance systems, alarm installations, and 24/7 monitoring to safeguard your home and business.",
      socialLinks: [
        {
          channel: SocialChannel.LINKEDIN,
          url: "https://linkedin.com/company/securityservices",
        },
      ],
      faqs: [
        {
          question: "What types of security systems do you offer?",
          answer:
            "We provide CCTV, alarm systems, access control, and more tailored to your needs.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "David P.",
          quote:
            "Their team installed a top-notch security system for my business. Highly recommend!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("security-services"),
          headline: "Secure Your Property Today",
          subline: "Get a free consultation and quote for your security needs.",
          ctaText: "Get Quote",
          ctaLink: "/contact",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Trusted Security",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      pricingTiers: [
        {
          name: "Basic Monitoring",
          price: 29,
          duration: "monthly",
          features: ["24/7 monitoring", "Mobile alerts"],
        },
        {
          name: "Premium Package",
          price: 59,
          duration: "monthly",
          features: [
            "All Basic features",
            "Advanced surveillance",
            "Priority support",
          ],
        },
      ],
      metrics: [
        { label: "Systems Installed", value: 200 },
        { label: "24/7 Monitoring", value: 1 },
        { label: "Customer Satisfaction", value: 98 },
      ],
      seo: {
        id: "",
        title:
          "Security Services | Protect Your Home and Business with Expert Solutions",
        description:
          "Discover comprehensive security solutions including surveillance systems, alarm installations, and 24/7 monitoring to safeguard your home and business. Get a free consultation today.",
        keywords: [
          "security services",
          "home security",
          "business security",
          "surveillance systems",
          "alarm installations",
        ],
      },
      stats: [
        { label: "Systems Installed", value: 200 },
        { label: "24/7 Monitoring", value: "Yes" },
        { label: "Customer Satisfaction", value: "98%" },
      ],
      awards: [
        { name: "Best Security Company 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 10 Security Services 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Monitoring services can be canceled with 30 days' notice. No refunds for partial months.",
        },
      ],
      promotions: [
        {
          title: "Free Security Consultation",
          description:
            "Schedule a free consultation to assess your security needs and receive a custom quote.",
          ctaText: "Book Now",
          ctaLink: "/consultation",
          companyId: "",
          perks: [{ id: "", label: "Free Consultation", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Your Safety, Our Priority",
      sectionTitle: "Security Services",
      sectionDescription:
        "Offering comprehensive security solutions including surveillance systems, alarm installations, and 24/7 monitoring to safeguard your home and business.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Fashion Shop": withOverrides({
      tagline: "**Elevate Your Style** with Our Fashion Collection",
      description:
        "Discover the latest trends in fashion with our curated selection of clothing and accessories for every occasion.",
      socialLinks: [
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/fashionshop",
        },
      ],
      faqs: [
        {
          question: "Do you offer international shipping?",
          answer:
            "Yes, we ship worldwide. Shipping fees and times vary by location.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Sophia M.",
          quote:
            "The quality and style of their clothes are amazing. I always get compliments!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("fashion"),
          headline: "New Season, New Styles",
          subline: "Explore our latest collection for the season.",
          ctaText: "Shop Now",
          ctaLink: "/shop",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "New Arrivals",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Styles Available", value: 300 },
        { label: "Happy Customers", value: 1500 },
        { label: "International Shipping", value: 1 },
      ],
      seo: {
        id: "",
        title: "Fashion Shop | Elevate Your Style with Our Latest Collection",
        description:
          "Discover the latest trends in fashion with our curated selection of clothing and accessories for every occasion. Shop now and elevate your style.",
        keywords: [
          "fashion shop",
          "clothing",
          "accessories",
          "latest trends",
          "international shipping",
        ],
      },
      stats: [
        { label: "Styles Available", value: 300 },
        { label: "Happy Customers", value: 1500 },
        { label: "International Shipping", value: "Yes" },
      ],
      awards: [
        { name: "Best Fashion Retailer 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 100 Retailers 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Returns accepted within 30 days. Items must be in original condition.",
        },
      ],
      promotions: [
        {
          title: "Seasonal Sale",
          description:
            "Get up to 50% off select styles during our seasonal sale. Limited time only!",
          ctaText: "Shop Now",
          ctaLink: "/sale",
          companyId: "",
          perks: [{ id: "", label: "Up to 50% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Discover Your Unique Style",
      sectionTitle: "Fashion Shop",
      sectionDescription:
        "Discover the latest trends in fashion with our curated selection of clothing and accessories for every occasion.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Furniture Shop": withOverrides({
      tagline: "**Furnish Your Dream Home** with Style",
      description:
        "Discover our curated collection of modern and classic furniture pieces designed to elevate your living space with comfort and elegance.",
      socialLinks: [
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/furnitureshop",
        },
      ],
      faqs: [
        {
          question: "Do you offer custom furniture?",
          answer:
            "Yes, we provide custom design services to create pieces that fit your unique style and space.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Emily R.",
          quote:
            "The quality and design of their furniture exceeded my expectations. Highly recommend!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("furniture"),
          headline: "New Collection Launching This Season",
          subline: "Explore our latest designs for every room in your home.",
          ctaText: "Shop Now",
          ctaLink: "/shop",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "New Arrivals",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Furniture Styles", value: 200 },
        { label: "Satisfied Customers", value: 1200 },
        { label: "Custom Orders", value: 300 },
      ],
      seo: {
        id: "",
        title: "Furniture Shop | Furnish Your Dream Home with Style",
        description:
          "Discover our curated collection of modern and classic furniture pieces designed to elevate your living space with comfort and elegance. Shop now and furnish your dream home.",
        keywords: [
          "furniture shop",
          "home furnishings",
          "modern furniture",
          "classic furniture",
          "custom furniture",
        ],
      },
      stats: [
        { label: "Furniture Styles", value: 200 },
        { label: "Satisfied Customers", value: 1200 },
        { label: "Custom Orders", value: 300 },
      ],
      awards: [
        { name: "Best Furniture Store 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 100 Retailers 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Returns accepted within 30 days. Custom orders are non-refundable.",
        },
      ],
      promotions: [
        {
          title: "Spring Sale",
          description:
            "Get 20% off all furniture pieces during our Spring Sale. Refresh your home for less!",
          ctaText: "Shop Now",
          ctaLink: "/sale",
          companyId: "",
          perks: [{ id: "", label: "20% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Create Your Perfect Living Space",
      sectionTitle: "Furniture Shop",
      sectionDescription:
        "Discover our curated collection of modern and classic furniture pieces designed to elevate your living space with comfort and elegance.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Security Consulting": withOverrides({
      tagline: "**Expert Security Consulting** for Your Business",
      description:
        "Our security consulting services provide comprehensive risk assessments, strategic planning, and implementation support to protect your business from evolving threats.",
      socialLinks: [
        {
          channel: SocialChannel.LINKEDIN,
          url: "https://linkedin.com/company/securityconsulting",
        },
      ],
      faqs: [
        {
          question: "What industries do you specialize in?",
          answer:
            "We have experience across various sectors including finance, healthcare, and retail.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Michael S.",
          quote:
            "Their consulting services helped us identify vulnerabilities and implement effective security measures. Highly recommend!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("security-consulting"),
          headline: "Protect Your Business Today",
          subline:
            "Schedule a free consultation to assess your security needs.",
          ctaText: "Get Consultation",
          ctaLink: "/contact",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Trusted Advisors",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      pricingTiers: [
        {
          name: "Basic Assessment",
          price: 499,
          duration: "one-time",
          features: ["Comprehensive risk assessment", "Detailed report"],
        },
        {
          name: "Full Consulting Package",
          price: 1999,
          duration: "project-based",
          features: [
            "All Basic features",
            "Strategic planning",
            "Implementation support",
          ],
        },
      ],
      seo: {
        id: "",
        title:
          "Security Consulting | Expert Risk Assessments and Strategic Planning",
        description:
          "Our security consulting services provide comprehensive risk assessments, strategic planning, and implementation support to protect your business from evolving threats. Schedule a free consultation today.",
        keywords: [
          "security consulting",
          "risk assessment",
          "strategic planning",
          "business security",
          "security implementation",
        ],
      },
      stats: [
        { label: "Systems Installed", value: 200 },
        { label: "24/7 Monitoring", value: "Yes" },
        { label: "Customer Satisfaction", value: "98%" },
      ],
      metrics: [
        { label: "Systems Installed", value: 200 },
        { label: "24/7 Monitoring", value: 1 },
        { label: "Customer Satisfaction", value: 98 },
      ],
      awards: [
        { name: "Best Security Company 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 10 Security Services 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Monitoring services can be canceled with 30 days' notice. No refunds for partial months.",
        },
      ],
      promotions: [
        {
          title: "Free Security Consultation",
          description:
            "Schedule a free consultation to assess your security needs and receive a custom quote.",
          ctaText: "Book Now",
          ctaLink: "/consultation",
          companyId: "",
          perks: [{ id: "", label: "Free Consultation", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Your Security, Our Expertise",
      sectionTitle: "Security Consulting",
      sectionDescription:
        "Our security consulting services provide comprehensive risk assessments, strategic planning, and implementation support to protect your business from evolving threats.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Delivery & Logistics": withOverrides({
      tagline: "**Fast & Reliable Delivery** for Your Business",
      description:
        "Our delivery and logistics services provide efficient and secure transportation solutions to meet your business needs, ensuring timely deliveries and customer satisfaction.",
      socialLinks: [
        {
          channel: SocialChannel.FACEBOOK,
          url: "https://fb.com/deliverylogistics",
        },
      ],
      faqs: [
        {
          question: "What areas do you serve?",
          answer:
            "We provide delivery services across the city and surrounding regions. Contact us for specific locations.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Sarah L.",
          quote:
            "Their delivery service is fast and reliable. They helped us meet tight deadlines consistently.",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("delivery-logistics"),
          headline: "Streamline Your Deliveries Today",
          subline: "Get a free quote for our delivery and logistics services.",
          ctaText: "Get Quote",
          ctaLink: "/contact",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Trusted Delivery",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      pricingTiers: [
        {
          name: "Standard Delivery",
          price: 5,
          duration: "per delivery",
          features: ["Delivery within 3-5 business days"],
        },
        {
          name: "Express Delivery",
          price: 15,
          duration: "per delivery",
          features: ["Delivery within 1-2 business days"],
        },
      ],
      metrics: [
        { label: "Deliveries Completed", value: 10000 },
        { label: "Average Delivery Time", value: 3 },
        { label: "Customer Satisfaction", value: 95 },
      ],
      seo: {
        id: "",
        title: "Delivery & Logistics | Fast and Reliable Delivery Solutions",
        description:
          "Our delivery and logistics services provide efficient and secure transportation solutions to meet your business needs, ensuring timely deliveries and customer satisfaction. Get a free quote today.",
        keywords: [
          "delivery services",
          "logistics",
          "fast delivery",
          "reliable delivery",
          "business logistics",
        ],
      },
      stats: [
        { label: "Deliveries Completed", value: 10000 },
        { label: "Average Delivery Time", value: "3 days" },
        { label: "Customer Satisfaction", value: "95%" },
      ],
      awards: [
        { name: "Best Delivery Service 2024", iconUrl: "/icons/award.svg" },
        {
          name: "Top 10 Logistics Companies 2024",
          iconUrl: "/icons/award.svg",
        },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Deliveries can be canceled up to 24 hours before the scheduled delivery time for a full refund.",
        },
      ],
      promotions: [
        {
          title: "Free First Delivery",
          description:
            "Try our delivery service with your first delivery on us. Sign up today!",
          ctaText: "Sign Up Now",
          ctaLink: "/signup",
          companyId: "",
          perks: [{ id: "", label: "Free Delivery", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Efficient & Secure Transportation Solutions",
      sectionTitle: "Delivery & Logistics",
      sectionDescription:
        "Our delivery and logistics services provide efficient and secure transportation solutions to meet your business needs, ensuring timely deliveries and customer satisfaction.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Bike Store": withOverrides({
      tagline: "**Ride in Style** with Our Premium Bikes",
      description:
        "Discover our wide selection of high-quality bikes for all ages and skill levels, designed to provide a smooth and enjoyable riding experience.",
      socialLinks: [
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/bikestore",
        },
      ],
      faqs: [
        {
          question: "Do you offer bike repairs?",
          answer:
            "Yes, we provide repair services for all types of bikes. Contact us for more details.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Tom H.",
          quote:
            "The quality of their bikes is outstanding. I found the perfect bike for my daily commute!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("bike-store"),
          headline: "New Arrivals for Every Rider",
          subline:
            "Explore our latest collection of bikes for all ages and skill levels.",
          ctaText: "Shop Now",
          ctaLink: "/shop",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "New Arrivals",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
        {
          imageUrl: getSampleImageUrl("bike-store-2"),
          headline: "Expert Bike Repairs",
          subline:
            "Keep your bike in top condition with our professional repair services.",
          ctaText: "Learn More",
          ctaLink: "/services/repairs",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Repair Services",
          endsAt: null,
          order: 1,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Bike Models", value: 150 },
        { label: "Satisfied Customers", value: 800 },
        { label: "Repair Services", value: 200 },
      ],
      seo: {
        id: "",
        title: "Bike Store | Ride in Style with Our Premium Bikes",
        description:
          "Discover our wide selection of high-quality bikes for all ages and skill levels, designed to provide a smooth and enjoyable riding experience. Shop now and find your perfect bike.",
        keywords: [
          "bike store",
          "bikes for sale",
          "bike repairs",
          "premium bikes",
          "new bike models",
        ],
      },
      stats: [
        { label: "Bike Models", value: 150 },
        { label: "Satisfied Customers", value: 800 },
        { label: "Repair Services", value: 200 },
      ],
      awards: [
        { name: "Best Bike Store 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 50 Retailers 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Returns accepted within 30 days. Repair services are non-refundable.",
        },
      ],
      promotions: [
        {
          title: "Spring Bike Sale",
          description:
            "Get 15% off all bikes during our Spring Sale. Find your perfect ride for less!",
          ctaText: "Shop Now",
          ctaLink: "/sale",
          companyId: "",
          perks: [{ id: "", label: "15% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
        {
          title: "Free Tune-Up with Every Bike Purchase",
          description:
            "Buy any bike and receive a free tune-up service to keep your ride in top condition.",
          ctaText: "Learn More",
          ctaLink: "/promotions/free-tune-up",
          companyId: "",
          perks: [{ id: "", label: "Free Tune-Up", icon: "StarIcon" }],
          trustLogos: [],
        },
        {
          title: "Refer a Friend, Get $20 Off",
          description:
            "Refer a friend to our bike store and both of you will receive $20 off your next purchase.",
          ctaText: "Refer Now",
          ctaLink: "/promotions/refer-a-friend",
          companyId: "",
          perks: [{ id: "", label: "$20 Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Find Your Perfect Ride",
      sectionTitle: "Bike Store",
      sectionDescription:
        "Discover our wide selection of high-quality bikes for all ages and skill levels, designed to provide a smooth and enjoyable riding experience.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),
  
    "Meat Store": withOverrides({
      tagline: "**Fresh & Quality Meats** for Every Meal",
      description:
        "Discover our wide selection of fresh and high-quality meats, sourced from trusted farms and suppliers to provide you with the best options for your meals.",
      socialLinks: [
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/meatstore",
        },
      ],
      faqs: [
        {
          question: "Do you offer delivery services?",
          answer:
            "Yes, we provide delivery services for our meat products. Contact us for more details.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Lisa K.",
          quote:
            "The quality of their meats is exceptional. I always find the freshest cuts for my family!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("meat-store"),
          headline: "New Arrivals of Fresh Meats",
          subline:
            "Explore our latest selection of fresh and high-quality meats for your meals.",
          ctaText: "Shop Now",
          ctaLink: "/shop",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Fresh Meats",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Meat Varieties", value: 50 },
        { label: "Satisfied Customers", value: 300 },
        { label: "Delivery Services", value: 1 },
      ],
      seo: {
        id: "",
        title:
          "Meat Store | Fresh and Quality Meats for Every Meal",
        description:
          "Discover our wide selection of fresh and high-quality meats, sourced from trusted farms and suppliers to provide you with the best options for your meals. Shop now and enjoy the freshest cuts.",
        keywords: [
          "meat store",
          "fresh meats",
          "quality meats",
          "meat delivery",
          "trusted meat suppliers",
        ],
      },
      stats: [
        { label: "Meat Varieties", value: 50 },
        { label: "Satisfied Customers", value: 300 },
        { label: "Delivery Services", value: "Yes" },
      ],
      awards: [
        { name: "Best Meat Store 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 20 Food Retailers 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Returns accepted within 24 hours of delivery. Perishable items are non-refundable.",
        },
      ],
      promotions: [
        {
          title: "Weekend Meat Sale",
          description:
            "Get 10% off all meat products during our weekend sale. Stock up for your meals!",
          ctaText: "Shop Now",
          ctaLink: "/sale",
          companyId: "",
          perks: [{ id: "", label: "10% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Fresh & Quality Meats for Your Meals",
      sectionTitle: "Meat Store",
      sectionDescription:
        "Discover our wide selection of fresh and high-quality meats, sourced from trusted farms and suppliers to provide you with the best options for your meals.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Hardware Shop": withOverrides({
      tagline: "**Tools & Supplies** for Every Project",
      description:
        "Discover our wide selection of high-quality tools and hardware supplies, designed to help you complete your projects with ease and efficiency.",
      socialLinks: [
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/hardwarestore",
        },
      ],
      faqs: [
        {
          question: "Do you offer tool rentals?",
          answer:
            "Yes, we provide tool rental services for a wide range of equipment. Contact us for more details.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Mark D.",
          quote:
            "The quality of their tools is excellent. I found everything I needed for my home improvement projects!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("hardware-store"),
          headline: "New Arrivals of Tools & Supplies",
          subline:
            "Explore our latest collection of high-quality tools and hardware supplies for your projects.",
          ctaText: "Shop Now",
          ctaLink: "/shop",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "New Arrivals",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Tool Varieties", value: 200 },
        { label: "Satisfied Customers", value: 600 },
        { label: "Tool Rentals", value: 1 },
      ],
      seo: {
        id: "",
        title:
          "Hardware Store | Tools and Supplies for Every Project",
        description:
          "Discover our wide selection of high-quality tools and hardware supplies, designed to help you complete your projects with ease and efficiency. Shop now and find the right tools for your next project.",
        keywords: [
          "hardware store", 
          "tools and supplies",
          "home improvement",
          "construction tools",
        ],
      },
      stats: [
        { label: "Tool Varieties", value: 200 },
        { label: "Satisfied Customers", value: 600 },
        { label: "Tool Rentals", value: "Yes" },
      ],
      awards: [
        { name: "Best Hardware Store 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 50 Retailers 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Returns accepted within 30 days. Tool rentals must be returned on time to avoid additional fees.",
        },
      ],
      promotions: [
        {
          title: "Spring Hardware Sale",
          description:
            "Get 20% off all tools and hardware supplies during our Spring Sale. Stock up for your projects!",
          ctaText: "Shop Now",
          ctaLink: "/sale",
          companyId: "",
          perks: [{ id: "", label: "20% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Tools & Supplies for Your Projects",
      sectionTitle: "Hardware Store",
      sectionDescription:
        "Discover our wide selection of high-quality tools and hardware supplies, designed to help you complete your projects with ease and efficiency.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Book Store": withOverrides({
      tagline: "**Discover Your Next Read** with Our Curated Selection",
      description:
        "Explore our wide range of books across various genres, carefully curated to provide you with the best reading experience for every interest and age group.",
      socialLinks: [
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/bookstore",
        },
      ],
      faqs: [
        {
          question: "Do you offer book recommendations?",
          answer:
            "Yes, our staff is always happy to provide personalized book recommendations based on your interests. Contact us for more details.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Anna M.",
          quote:
            "The selection of books is fantastic. I always find something new and exciting to read!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("book-store"),
          headline: "New Arrivals in Every Genre",
          subline:
            "Discover our latest collection of books for every interest and age group.",
          ctaText: "Shop Now",
          ctaLink: "/shop",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "New Arrivals",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Book Titles", value: 5000 },
        { label: "Satisfied Customers", value: 2000 },
        { label: "Personalized Recommendations", value: 1 },
      ],
      seo: {
        id: "",
        title:
          "Book Store | Discover Your Next Read with Our Curated Selection",
        description:
          "Explore our wide range of books across various genres, carefully curated to provide you with the best reading experience for every interest and age group. Shop now and find your next favorite book.",
        keywords: [
          "book store",
          "books for sale",
          "personalized book recommendations",
          "curated book selection",
          "new book arrivals",
        ],
      },
      stats: [
        { label: "Book Titles", value: 5000 },
        { label: "Satisfied Customers", value: 2000 },
        { label: "Personalized Recommendations", value: "Yes" },
      ],
      awards: [
        { name: "Best Book Store 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 20 Retailers 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Returns accepted within 30 days. Personalized recommendations are non-refundable.",
        },
      ],
      promotions: [
        {
          title: "Summer Reading Sale",
          description:
            "Get 15% off all books during our Summer Reading Sale. Find your next great read for less!",
          ctaText: "Shop Now",
          ctaLink: "/sale",
          companyId: "",
          perks: [{ id: "", label: "15% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Discover Your Next Favorite Book",
      sectionTitle: "Book Store",
      sectionDescription:
        "Explore our wide range of books across various genres, carefully curated to provide you with the best reading experience for every interest and age group.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",  
          alt: "Brand B",
        },
      ],
    }),

    "Motorcycle Store": withOverrides({
      tagline: "**Ride in Style** with Our Premium Motorcycles",
      description:
        "Discover our wide selection of high-quality motorcycles for all ages and skill levels, designed to provide a thrilling and enjoyable riding experience.",
      socialLinks: [
        {
          channel: SocialChannel.INSTAGRAM,
          url: "https://insta.com/motorcyclestore",
        },
      ],
      faqs: [
        {
          question: "Do you offer motorcycle repairs?",
          answer:
            "Yes, we provide repair services for all types of motorcycles. Contact us for more details.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Jake P.",
          quote:
            "The quality of their motorcycles is outstanding. I found the perfect bike for my weekend rides!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("motorcycle-store"),
          headline: "New Arrivals for Every Rider",
          subline:
            "Explore our latest collection of motorcycles for all ages and skill levels.",
          ctaText: "Shop Now",
          ctaLink: "/shop",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "New Arrivals",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
        {
          imageUrl: getSampleImageUrl("motorcycle-store-2"),
          headline: "Expert Motorcycle Repairs",
          subline:
            "Keep your motorcycle in top condition with our professional repair services.",
          ctaText: "Learn More",
          ctaLink: "/services/repairs",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Repair Services",
          endsAt: null,
          order: 1,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Motorcycle Models", value: 100 },
        { label: "Satisfied Customers", value: 500 },
        { label: "Repair Services", value: 150 },
      ],
      seo: {
        id: "",
        title: "Motorcycle Store | Ride in Style with Our Premium Motorcycles",
        description:
          "Discover our wide selection of high-quality motorcycles for all ages and skill levels, designed to provide a thrilling and enjoyable riding experience. Shop now and find your perfect motorcycle.",
        keywords: [
          "motorcycle store",
          "motorcycles for sale",
          "motorcycle repairs",
          "premium motorcycles",
          "new motorcycle models",
        ],
      },
      stats: [
        { label: "Motorcycle Models", value: 100 },
        { label: "Satisfied Customers", value: 500 },
        { label: "Repair Services", value: 150 },
      ],
      awards: [
        { name: "Best Motorcycle Store 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 50 Retailers 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Returns accepted within 30 days. Repair services are non-refundable.",
        },
      ],
      promotions: [
        {
          title: "Spring Motorcycle Sale",
          description:
            "Get 15% off all motorcycles during our Spring Sale. Find your perfect ride for less!",
          ctaText: "Shop Now",
          ctaLink: "/sale",
          companyId: "",
          perks: [{ id: "", label: "15% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
        {
          title: "Free Tune-Up with Every Motorcycle Purchase",
          description:
            "Buy any motorcycle and receive a free tune-up service to keep your ride in top condition.",
          ctaText: "Learn More",
          ctaLink: "/promotions/free-tune-up",
          companyId: "",
          perks: [{ id: "", label: "Free Tune-Up", icon: "StarIcon" }],
          trustLogos: [],
        },
        {
          title: "Refer a Friend, Get $20 Off",
          description:
            "Refer a friend to our motorcycle store and both of you will receive $20 off your next purchase.",
          ctaText: "Refer Now",
          ctaLink: "/promotions/refer-a-friend",
          companyId: "",
          perks: [{ id: "", label: "$20 Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Find Your Perfect Ride",
      sectionTitle: "Motorcycle Store",
      sectionDescription:
        "Discover our wide selection of high-quality motorcycles for all ages and skill levels, designed to provide a thrilling and enjoyable riding experience.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand C",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand D",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand E",
        },
      ],
    }),

    "Drycleaning": {
      tagline: "**Professional Dry Cleaning** for Your Wardrobe",
      description:
        "Our dry cleaning services provide expert care for your garments, ensuring they look their best while maintaining their quality and longevity.",  
      socialLinks: [
        {
          channel: SocialChannel.FACEBOOK,
          url: "https://fb.com/drycleaning",
        },
      ],
      faqs: [
        {
          question: "What types of garments do you clean?",
          answer:
            "We clean a wide range of garments including suits, dresses, coats, and delicate fabrics. Contact us for specific items.",
          order: 1,
        },
      ],
      testimonials: [
        {
          authorName: "Emily R.",
          quote:
            "Their dry cleaning service is exceptional. My clothes always come back looking fresh and well cared for!",
          rating: 5,
        },
      ],
      heroSlides: [
        {
          imageUrl: getSampleImageUrl("drycleaning"),
          headline: "Expert Care for Your Clothes",
          subline:
            "Experience our professional dry cleaning services for your wardrobe.",
          ctaText: "Learn More",
          ctaLink: "/services/dry-cleaning",
          id: "",
          companyId: "",
          price: null,
          productImageUrl: null,
          badgeText: "Professional Care",
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: "image",
        },
      ],
      metrics: [
        { label: "Garments Cleaned", value: 5000 },
        { label: "Satisfied Customers", value: 1500 },
        { label: "Eco-Friendly Cleaning", value: 1 },
      ],
      seo: {
        id: "",
        title:
          "Dry Cleaning Services | Professional Care for Your Wardrobe",
        description:
          "Our dry cleaning services provide expert care for your garments, ensuring they look their best while maintaining their quality and longevity. Experience our professional dry cleaning services today.",
        keywords: [
          "dry cleaning services",
          "professional dry cleaning",
          "garment care",
          "eco-friendly cleaning",
          "clothing maintenance",
        ],
      },
      stats: [
        { label: "Garments Cleaned", value: 5000 },
        { label: "Satisfied Customers", value: 1500 },
        { label: "Eco-Friendly Cleaning", value: "Yes" },
      ],
      awards: [
        { name: "Best Dry Cleaning Service 2024", iconUrl: "/icons/award.svg" },
        { name: "Top 20 Cleaners 2024", iconUrl: "/icons/award.svg" },
      ],
      policies: [
        {
          type: PolicyType.CANCELLATION,
          content:
            "Cancellations accepted up to 24 hours before scheduled pickup. Contact us for rescheduling.",
        },
      ],
      promotions: [
        {
          title: "First-Time Customer Discount",
          description:
            "Get 20% off your first dry cleaning service. Experience our professional care for your wardrobe at a great price!",
          ctaText: "Get Discount",
          ctaLink: "/promotions/first-time-discount",
          companyId: "",
          perks: [{ id: "", label: "20% Off", icon: "StarIcon" }],
          trustLogos: [],
        },
      ],

      sectionSubtitle: "Professional Care for Your Clothes",
      sectionTitle: "Dry Cleaning Services",
      sectionDescription:
        "Our dry cleaning services provide expert care for your garments, ensuring they look their best while maintaining their quality and longevity.",
      partnerLogos: [
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand A",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",
          alt: "Brand B",
        },
        {
          src: "https://img.icons8.com/?size=100&id=118466&format=png&color=000000",  
          alt: "Brand C",
        },
      ],

    },

    // --- Remaining Stubbed Categories ---
    Other: withOverrides({
      tagline: "Tailored Solutions for Your Unique Idea",
      description:
        "A flexible starting point for any business or personal project not covered by other categories.",
    }),
    Tutors: withOverrides({
      tagline: "**Expert Tutors**, Anytime, Anywhere",
      description:
        "Personalized online tutoring in Math, Science, and Languages for all grade levels.",
    }),
    Lecturer: withOverrides({
      tagline: "Inspiring University Lectures Online",
      description:
        "Access thought-provoking lectures and research from leading academic professionals.",
    }),
    Teacher: withOverrides({
      tagline: "Empowering Educators and Classrooms",
      description: "Resources and professional development for K-12 educators.",
    }),
    Students: withOverrides({
      tagline: "Your Learning Hub: Resources & Tools",
      description:
        "Essential tools and study guides to help students succeed in university.",
    }),
    Pupils: withOverrides({
      tagline: "Young Learners Welcome! Fun Education.",
      description:
        "Interactive learning materials and games for elementary school children.",
    }),
    Principal: withOverrides({
      tagline: "Leadership in Education, Community Focus",
      description:
        "Information and updates from the School Principal on vision and policies.",
    }),
    "School Head": withOverrides({
      tagline: "Guiding Academic Excellence & Vision",
      description: "The Head of School's message, strategic plan, and news.",
    }),
  };

  return samples[category] || baseData;
}
