"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useMemo,
  useCallback,
  useReducer,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  StoreForm,
  Handlers,
  StepConfig,
  GeoLocation,
  HeroSlide,
  IStoreCategory,
  ILocation,
  IProductCategory,
  IPromotion
} from "@/types/typings";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import {
  storeSteps,
  pricingSteps,
  websiteSteps,
  locationsSteps,
  paymentSteps,
} from "@/constant/STORE_SITE_STEPS";
import { useSession } from 'next-auth/react';
import { getCategoryDefaultData } from "@/lib/defaultStoreData";
import { CompanyLocation } from "@prisma/client";
import { categoryReducer } from "@/hooks/categoryReducer";
import toast from "react-hot-toast";
import { PaymentSettings } from "../PaymentAccordion/PaymentAccordion";

const SITE_CATEGORIES_WITH_PRICING = [
  "service provider",
  "booking & appointments",
  "portfolio & personal branding",
];

const SITE_CATEGORIES_WITH_LOCATIONS = [
  "real estate",
  "automotive",
  "travel & tourism",
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface SelectedLocation {
  id: string;
  name: string;
  children: SelectedLocation[];
}

type Props = {  
  availableCategories: IProductCategory[];
  availableLocations: ILocation[];
  initialData?: Partial<StoreForm> & { id: string };
};


// Helper to build a selected tree from CompanyLocation[] and all Locations
const buildSelectedLocationTree = (
  selectedCompanyLocations: CompanyLocation[], // Use CompanyLocation type
  allLocationsMap: Map<string, ILocation>,
  parentId: string | null = null
): SelectedLocation[] => {
  const children: SelectedLocation[] = [];
  const directChildrenLocations = Array.from(allLocationsMap.values()).filter(
    (loc) => loc.parentId === parentId
  );

  const selectedLocMap = new Map(
    selectedCompanyLocations.map((cl) => [cl.locationId, cl]) // Use locationId
  );

  for (const loc of directChildrenLocations) {
    const isLocSelected = selectedLocMap.has(loc.id);
    const childSelectedNodes = buildSelectedLocationTree(
      selectedCompanyLocations,
      allLocationsMap,
      loc.id
    );

    if (isLocSelected || childSelectedNodes.length > 0) {
      children.push({
        id: loc.id,
        name: loc.name,
        children: childSelectedNodes,
      });
    }
  }
  return children;
};

// Helper to flatten CompanyLocation[] into a Set of location IDs
const flattenCompanyLocationsToIds = (
  companyLocations: CompanyLocation[]
): Set<string> => {
  const ids = new Set<string>();
  if (!companyLocations) return ids;
  companyLocations.forEach((cl) => ids.add(cl.locationId)); // Use locationId
  return ids;
};

// Helper to get all descendant IDs of a given location
const getAllDescendantIds = (
  location: ILocation,
  allLocationsMap: Map<string, ILocation>
): string[] => {
  const ids: string[] = [location.id];
  const queue: string[] = [location.id];
  let head = 0;

  while (head < queue.length) {
    const currentId = queue[head++];
    const children = Array.from(allLocationsMap.values()).filter(
      (loc) => loc.parentId === currentId
    );
    children.forEach((child) => {
      ids.push(child.id);
      queue.push(child.id);
    });
  }
  return ids;
};


// --- END MOCK DATA AND HELPER FUNCTIONS ---


export default function CreateStoreForm({
  availableCategories,
  availableLocations,
  initialData,
  // session
}: Props) {
  
  const router = useRouter();
  
  const { data: session, status } = useSession();  

  const [stepIndex, setStepIndex] = useState(0);
  
  // UPDATE: The defaultForm object is now initialized with all the fields
  // from the new, expanded StoreForm interface.
  const defaultForm: StoreForm = {
    id: "",
    name: "",
    slug: "",
    domain: "",
    hasWebsite: false,
    tagline: "",
    description: "",
    category: "E-commerce",
    variant:"Standard",
    logoUrl: "",
    bannerUrl: "",
    videoUrl: "",
    contactEmail: session?.user?.email || "",
    contactPhone: "",
    address: "",
    geoLocation: { lat: 0, lng: 0 },
    openingHours: {
      mon: { open: "09:00", close: "17:00" },
      tue: { open: "09:00", close: "17:00" },
      wed: { open: "09:00", close: "17:00" },
      thu: { open: "09:00", close: "17:00" },
      fri: { open: "09:00", close: "17:00" },
      sat: { open: "", close: "" },
      sun: { open: "", close: "" },
    },

    // --- Core Relational Data ---
    socialLinks: [],
    policies: [],
    faqs: [],
    testimonials: [],
    heroSlides: [],
    promotions: [],
    projects: [],
    StoreCategory: [],

    // --- NEW: Added missing core fields ---
    currency: 'USD',
    locale: 'en-US',

    // --- NEW: Added missing relational arrays ---
    pageSections: [], // For modular page content
    appPromos: [], // For the app promotion section

    events: [], // For company/school events
    Announcement: [], // For site announcements

    // --- JSON fields ---
    awards: [],
    metrics: [],
    stats: [],
    pricingTiers: [
      {
        name: "Basic",
        price: 0,
        features: [],
        description: "A great starting point.",
        duration: "monthly"
      }
    ],

    // --- Settings Objects ---
    // themeSettings: {},
    seo: {
      id: "",
      description: null,
      title: null,
      keywords: [],
      // companyId: null
    },
    analyticsConfig: {
      id: "",
      // companyId: "",
      googleTag: null,
      facebookTag: null,
      hotjarSiteId: null,
      isActive: false
    },
    paymentSettings: {
      id: "",
      // companyId: "", // Keep this commented or include if you use it in your component
      // --- New Enablement Flags ---
      isStripeEnabled: false, // New: Default to false
      isPaypalEnabled: false, // New: Default to false
      isMpesaEnabled: false, // New: Default to false
      isPaystackEnabled: false, // New: Default to false
      isGhubaEnabled: false, // New: Default to false




      // --- Configuration Keys ---
      // Stripe
      stripePublishableKey: null,
      stripeSecretKey: null,

      paypalClientId: null,
      paypalClientSecret: null,

      // M-Pesa
      mpesaShortcode: null,
      mpesaConsumerKey: null,
      mpesaConsumerSecret: null,
      mpesaCallbackUrl: null,

      // --- Paystack Keys ---
      paystackPublicKey: null, // New: Paystack Public Key
      paystackSecretKey: null, // New: Paystack Secret Key


      // Ghuba (NEW FIELDS)
      ghubaMerchantId: null,
      ghubaApiKey: null,
      mpesaPasskey: null,
      mpesaSecret_encrypted: null,
      mpesaSecret_iv: null,
      mpesaSecret_tag: null,
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
      // companyId: "",
      carrierName: null,
      trackingUrl: null,
      regions: null,
      enablePickup: null,
      pickupInstructions: null,
      
      standardRate: 0.00,
      expressRate: 0.00,
    },
    blogs: [],
    companyCategoryId: "",

    // This would be populated in a different form, but needs to be in the type
    marketplaceListings: [],
    Writer: [],
    salesAgents: [],
    Doctor: [],
    Podcast: [],
    CompanyLocation: [],
    courses: [],

    services: [],
    site: null,
    userId: null,
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    sEOId: null,
    settings: null,
    Collection: [],
    CoreValues: [],
    Expert: [],
    packages: [],
    Educator: [],
    destinations: [],
    tourPackages: [],
    
  partnerLogos: [],
  founderName: "",
  founderQuote: "",
  founderImage: "",

  // --- Theme / Design Settings ---
  themeSettings: {
    primaryColor: "#EA580C",
    secondaryColor: "#FB923C",
    fontFamily: "Inter, sans-serif",
    layoutStyle: "default",
  },
};


  const [form, setForm] = useState<StoreForm>(() => {
    const initialForm = initialData ? { ...defaultForm, ...initialData } : defaultForm;
    // FIX: Ensure companyLocations is always an array, even if initialData provides null/undefined
    initialForm.CompanyLocation = initialData?.CompanyLocation || [];
    return initialForm;
  });

    // NEW: State for all available locations
  // const [allAvailableLocations, setAllAvailableLocations] = useState<Location[]>([]);
  // NEW: State for selected location IDs (flat set for efficient lookup)
  const [currentSelectedLocationIds, setCurrentSelectedLocationIds] = useState<Set<string>>(() =>
    initialData?.CompanyLocation ? flattenCompanyLocationsToIds(initialData.CompanyLocation) : new Set()
  );

  // ADD THIS useEffect hook to handle category changes
  const [categoryChanged, setCategoryChanged] = useState(false);

  // useEffect(() => {
  //   // Don't run on initial load or in edit mode
  //   if (!categoryChanged || initialData) return;

  //   // Get the sample data for the newly selected category
  //   const sampleData = getCategoryDefaultData(form.category);

  //   // Merge the sample data into the form state
  //   // This preserves basic info like 'name' and 'slug' while updating
  //   // content arrays like 'faqs', 'heroSlides', etc.
  //   setForm(prevForm => ({
  //     ...prevForm,
  //     ...sampleData,
  //   }));

  //   // Reset the flag
  //   setCategoryChanged(false);

  // }, [form.category, categoryChanged, initialData,stepIndex]);

  // ----------------------------------------------------------------
  // REFACTORED HOOK: This now works without the 'categoryChanged' flag
  // ----------------------------------------------------------------
  // Use a ref to track the previous category to detect a *real* change
  const prevCategoryRef = useRef<string | undefined>(form.category);

  useEffect(() => {
    // 1. Don't run this logic if we are editing (initialData is present)
    if (initialData) return;

    // 2. Check if the category has *actually* changed from the previous render.
    //    This prevents it from running on the initial load.
    const prevCategory = prevCategoryRef.current;
    if (prevCategory === form.category) return;
    
    // 3. Update the ref for the next render
    prevCategoryRef.current = form.category;

    console.log(`Loading sample data for new category: ${form.category}`);
    
    // 4. Get the sample data
    const sampleData = getCategoryDefaultData(form.category);

    // 5. Merge the sample data into the form state
    setForm(prevForm => ({
      ...prevForm,
      ...sampleData,
      // CRITICAL: Preserve key fields the user already entered
      // The sample data should not overwrite these.
      name: prevForm.name,
      slug: prevForm.slug,
      category: form.category, // Ensure we keep the one just selected
      contactEmail: prevForm.contactEmail, // Already set by session
    }));

  }, [form.category, initialData]); // Only depends on these!
  // ----------------------------------------------------------------
  // END OF REFACTORED HOOK
  // ----------------------------------------------------------------



  // ─────────────────────────────────────────────────────────────────────
  // 1) File state (logo, banner, hero slides, promotion slides)
  // ─────────────────────────────────────────────────────────────────────

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [productImageFiles, setProductImageFiles] = useState<(File | null)[]>(
    () => form.heroSlides.map(() => null)
  );

    // Memoize the selected locations in the hierarchical structure for display

  const selectedLocationsForDisplay: SelectedLocation[] = useMemo(() => {
      const allLocationsMap = new Map(availableLocations.map(loc => [loc.id, loc]));
      return buildSelectedLocationTree(form.CompanyLocation, allLocationsMap);
  }, [form.CompanyLocation, availableLocations]);
  

  // Track one File per hero slide. Initialize from existing heroSlides length
  const [heroSlideFiles, setHeroSlideFiles] = useState<(File | null)[]>(() =>
    form.heroSlides.map(() => null)
  );

  // Track one File per promotion. Initialize from existing promotions length
  type PromotionFiles = {
  bannerUrl?: File;
  featureImage1?: File;
  featureImage2?: File;
  featureImage3?: File;
};

const [promotionSlideFiles, setPromotionSlideFiles] = useState<PromotionFiles[]>(
  () => form.promotions.map(() => ({}))
);


  // When initialData changes (edit mode), clear out these File states
  useEffect(() => {
    if (!initialData) return;
    setLogoFile(null);
    setBannerFile(null);
    setVideoFile(null);
    setHeroSlideFiles(initialData.heroSlides?.map(() => null) || []);
    setPromotionSlideFiles(initialData.promotions?.map(() => ({})) || [] );
  }, [initialData]);

  // Whenever form.heroSlides grows/shrinks, sync heroSlideFiles length
  useEffect(() => {
    if (form.heroSlides.length > heroSlideFiles.length) {
      setHeroSlideFiles((prev) => [
        ...prev,
        ...Array(form.heroSlides.length - prev.length).fill(null),
      ]);
    }
    if (form.heroSlides.length < heroSlideFiles.length) {
      setHeroSlideFiles((prev) => prev.slice(0, form.heroSlides.length));
    }
  }, [form.heroSlides.length]);

  useEffect(() => {
    if (form.heroSlides.length > productImageFiles.length) {
      setProductImageFiles((prev) => [
        ...prev,
        ...Array(form.heroSlides.length - prev.length).fill(null),
      ]);
    }
    if (form.heroSlides.length < productImageFiles.length) {
      setProductImageFiles((prev) => prev.slice(0, form.heroSlides.length));
    }
  }, [form.heroSlides.length]);

  const allSteps = useMemo<StepConfig[]>(() => {
    // 1) always start with your store steps
    const list = [...storeSteps];

    // 2) if they've opted for a website, add payment steps...
    if (form.hasWebsite) {
      // 3) ...and, for certain categories, add pricing
      const cat = form.category?.toLowerCase().trim() || "";

      if (SITE_CATEGORIES_WITH_PRICING.includes(cat)) {
        list.push(...pricingSteps);
      }

      list.push(...websiteSteps);

      if (SITE_CATEGORIES_WITH_LOCATIONS.includes(cat)) {
        list.push(...locationsSteps);
      }

      list.push(...paymentSteps);
    }

    return list;
  }, [form.hasWebsite, form.category]);

  // Whenever form.promotions grows/shrinks, sync promotionSlideFiles length

  useEffect(() => {
    if (form.promotions.length > promotionSlideFiles.length) {
      setPromotionSlideFiles((prev) => [
        ...prev,
        ...Array(form.promotions.length - prev.length).fill(null),
      ]);
    }
    if (form.promotions.length < promotionSlideFiles.length) {
      setPromotionSlideFiles((prev) => prev.slice(0, form.promotions.length));
    }
  }, [form.promotions.length]);

  // ─────────────────────────────────────────────────────────────────────
  // 2) Handlers for “Logo / Banner” Accordion
  // ─────────────────────────────────────────────────────────────────────

  const handleMediaUpload = (field: "logoUrl" | "bannerUrl" | "videoUrl", file: File) => {
    if (field === "logoUrl") {
      setLogoFile(file);
    } else if (field === "videoUrl") {
      setVideoFile(file);
    } else {
      setBannerFile(file);
    }
    // Immediately generate a preview URL
    const previewURL = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      [field]: previewURL,
    }));
  };

  const handleMediaRemove = (field: "logoUrl" | "bannerUrl" | "videoUrl") => {
    if (field === "logoUrl") {
      setLogoFile(null);
    } else if (field === "videoUrl") {
      setVideoFile(null);
    } else {
      setBannerFile(null);
    }
    setForm((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // ─────────────────────────────────────────────────────────────────────
  // 3) Handlers for “Hero Slides” Accordion
  // ─────────────────────────────────────────────────────────────────────

  
  const onAddHeroSlide = () => {
    setForm((prev) => ({
      ...prev,
      heroSlides: [
        ...prev.heroSlides,
        // Correctly structured Banner object
        {
          id: "", // Will be generated by DB
          companyId: prev.id,
          imageUrl: "",
          productImageUrl: null,
          headline: null,
          subline: null,
          ctaText: null,
          ctaLink: null,
          badgeText: null,
          price: null,
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: 'image'
        },
      ],
    }));
  };

  const onRemoveHeroSlide = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== idx),
    }));
  };

  const onUpdateHeroSlide = (
    index: number,
    field: keyof HeroSlide,
    value: string
  ) => {
    setForm((prev) => {
      const slides = [...prev.heroSlides];
      slides[index] = { ...slides[index], [field]: value };
      return { ...prev, heroSlides: slides };
    });
  };

  const handleSlideImageUpload = (
    index: number,
    file: File,
    field: keyof HeroSlide
  ) => {
    // store the file if needed
    if (field === "imageUrl") {
      setHeroSlideFiles((prev) => {
        const copy = [...prev];
        copy[index] = file;
        return copy;
      });
    } else if (field === "productImageUrl") {
      setProductImageFiles((prev) => {
        const copy = [...prev];
        copy[index] = file;
        return copy;
      });
    }

    // generate preview URL
    const previewURL = URL.createObjectURL(file);

    // update the form state
    setForm((prev) => {
      const slides = [...prev.heroSlides];
      slides[index] = { ...slides[index], [field]: previewURL };
      return { ...prev, heroSlides: slides };
    });
  };

  // ─────────────────────────────────────────────────────────────────────
  // 4) Handlers for “Promotions” Accordion
  // ─────────────────────────────────────────────────────────────────────

  
  useEffect(() => {
    setForm(prev => {
      const normalizedPromotions = prev.promotions.map(promo => {
        const nextPerks = Array.isArray(promo.perks)
          ? promo.perks.map((perk: any) => {
              // handles: string, {icon,label}, or already-correct {id,icon,label}
              if (perk && typeof perk === 'object' && 'id' in perk) return perk;
              return {
                id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
                icon: typeof perk === 'object' ? perk.icon ?? '' : '',
                label: typeof perk === 'object' ? perk.label ?? '' : String(perk ?? ''),
              };
            })
          : [];

        const nextTrustLogos = Array.isArray(promo.trustLogos)
          ? promo.trustLogos.map((logo: any) => {
              // handles: string or already-correct {id,url}
              if (logo && typeof logo === 'object' && 'id' in logo && 'url' in logo) return logo;
              const url = typeof logo === 'string' ? logo : logo?.url ?? '';
              return {
                id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
                url,
              };
            })
          : [];

        return { ...promo, perks: nextPerks, trustLogos: nextTrustLogos };
      });

      return { ...prev, promotions: normalizedPromotions };
    });
  }, []);


  // Factory function: always consistent types
const createEmptyPromotion = (companyId: string): IPromotion => ({
  id: "",
  companyId,
  code: "",

  // Strings
  title: "",
  description: "",
  ctaText: "",
  ctaLink: "",
  bannerUrl: "",
  featureImage1: "",
  featureImage2: "",
  featureImage3: "",

  // Dates always stored as ISO strings (empty string = not set)
  startsAt: "",
  endsAt: "",

  // Arrays
  perks: [] as { id: string; icon: string; label: string }[],
  trustLogos: [] as { id: string; url: string; }[],

  // Colors
  themePrimary: "#0d9488",   // sensible defaults
  themeSecondary: "#f97316",

  // Meta
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Add promotion
const onAddPromotion = () => {
  setForm((prev) => ({
    ...prev,
    promotions: [...prev.promotions, createEmptyPromotion(prev.id)],
  }));
};

// Remove promotion
const onRemovePromotion = (idx: number) => {
  setForm((prev) => ({
    ...prev,
    promotions: prev.promotions.filter((_, i) => i !== idx),
  }));
};

// In your Parent Form Component
const onUpdatePromotion = <K extends keyof IPromotion>(
  index: number,
  field: K,
  value: IPromotion[K]
) => {
  setForm((prev) => {
    // 1. Create a new promotions array using .map()
    const newPromotions = prev.promotions.map((promotion, idx) => {
      // 2. If it's not the promotion we're updating, do nothing
      if (idx !== index) {
        return promotion;
      }
      
      // 3. If it IS the promotion, create a new object,
      //    spreading the old properties and setting the updated field.
      //    This works for 'title', 'description', and 'perks' perfectly.
      return { ...promotion, [field]: value };
    });

    // 4. Return the new top-level state object
    return { ...prev, promotions: newPromotions };
  });
};

// Upload + preview image for any field
const onPromotionImageUpload = (
  index: number,
  file: File,
  field: keyof IPromotion
) => {
  // resize local array to match promotions length
  setPromotionSlideFiles((prev) => {
    const copy = [...prev];
    copy[index] = {
      ...(copy[index] || {}),
      [field]: file,      
    };
    return copy;
  });

  const previewURL = URL.createObjectURL(file);

  setForm((prev) => {
    const promos = [...prev.promotions];
    promos[index] = { ...promos[index], [field]: previewURL };
    return { ...prev, promotions: promos };
  });
};

// const onPromotionImageUpload = (
//   index: number,
//   file: File,
//   field: keyof IPromotion = "bannerUrl"
// ) => {
//   // keep track of raw files if needed
//   setPromotionSlideFiles((prev) => {
//     const copy = [...prev];
//     copy[index] = file;
//     return copy;
//   });

//   // create preview
//   const previewURL = URL.createObjectURL(file);

//   setForm((prev) => {
//     const promos = [...prev.promotions];
//     promos[index] = { ...promos[index], [field]: previewURL };
//     return { ...prev, promotions: promos };
//   });
// };

// Add a new perk to a specific promotion

const onAddPerk = (promoIndex: number) => {
  setForm((prev) => {
    const newPromotions = prev.promotions.map((promo, idx) => {
      if (idx === promoIndex) {
        const currentPerks = promo.perks || [];
        // Generate a unique ID for the new perk
        const newPerk = { id: crypto.randomUUID(), icon: '', label: '' };
        const updatedPerks = [...currentPerks, newPerk];
        return { ...promo, perks: updatedPerks };
      }
      return promo;
    });
    return { ...prev, promotions: newPromotions };
  });
};

// New, more specific handler for updating a perk
const onUpdatePerk = (promoIndex: number, perkIndex: number, field: 'id' | 'icon' | 'label', value: string) => {
  setForm((prev) => {
    // Create a deep copy to ensure we don't mutate state
    const newPromotions = prev.promotions.map((promo, pIdx) => {
      // If it's not the promotion we're interested in, return it as is
      if (pIdx !== promoIndex) {
        return promo;
      }

      // Now, update the specific perk within this promotion
      const updatedPerks = (promo.perks || []).map((perk, perIdx) => {
        // If it's not the perk we're updating, return it as is
        if (perIdx !== perkIndex) {
          return perk;
        }

        // Return a new object for the updated perk, preserving its ID
        return { ...perk, [field]: value };
      });

      // Return the promotion with the updated perks array
      return { ...promo, perks: updatedPerks };
    });

    // Return the new top-level state
    return { ...prev, promotions: newPromotions };
  });
};

// You will also need to add onUpdatePerk to the props passed to PromotionsAccordion

// Also add a dedicated function for removing a perk
const onRemovePerk = (promoIndex: number, perkIndex: number) => {
  setForm((prev) => {
    const newPromotions = prev.promotions.map((promo, idx) => {
      if (idx === promoIndex) {
        const updatedPerks = (promo.perks || []).filter((_, i) => i !== perkIndex);
        return { ...promo, perks: updatedPerks };
      }
      return promo;
    });
    return { ...prev, promotions: newPromotions };
  });
};

const onAddTrustLogo = (promoIndex: number) => {
  setForm((prev) => {
    const newPromotions = prev.promotions.map((promo, idx) => {
      if (idx === promoIndex) {
        const updatedLogos = [...(promo.trustLogos || []), { id: crypto.randomUUID(), url: '' }];
        return { ...promo, trustLogos: updatedLogos };
      }
      return promo;
    });
    return { ...prev, promotions: newPromotions };
  });
};

const onRemoveTrustLogo = (promoIndex: number, logoIndex: number) => {
  setForm((prev) => {
    const newPromotions = prev.promotions.map((promo, idx) => {
      if (idx === promoIndex) {
        const updatedLogos = (promo.trustLogos || []).filter((_, i) => i !== logoIndex);
        return { ...promo, trustLogos: updatedLogos };
      }
      return promo;
    });
    return { ...prev, promotions: newPromotions };
  });
};

// In your Parent Form Component

const onUpdateTrustLogo = (
  promoIndex: number, 
  logoIndex: number, 
  field: 'id' | 'url', // Add the 'field' parameter
  value: string      // The last parameter is the 'value'
) => {
  setForm((prev) => {
    const newPromotions = prev.promotions.map((promo, idx) => {
      if (idx === promoIndex) {
        const updatedLogos = (promo.trustLogos || []).map((logo, i) => {
          if (i === logoIndex) {
            // Use dynamic property keys to update the correct field
            return { ...logo, [field]: value };
          }
          return logo;
        });
        return { ...promo, trustLogos: updatedLogos };
      }
      return promo;
    });
    return { ...prev, promotions: newPromotions };
  });
};

  // ─────────────────────────────────────────────────────────────────────
  // 5) Generic form handlers (arrays, opening hours, etc.)
  // ─────────────────────────────────────────────────────────────────────

  const totalSteps = allSteps.length + 1;

  // Auto-generate slug/domain from name
  useEffect(() => {
    if (initialData) return;
    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const domain = slug ? `${slug}.yourdomain.com` : "";
    setForm((prev) => ({ ...prev, slug, domain }));
  }, [form.name, initialData]);

  // Slug & domain generator
  useEffect(() => {
    if (initialData) return;
    if (!form.name) return;
    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setForm((f) => ({ ...f, slug, domain: `${slug}.salesmanpro.site` }));
  }, [form.name, initialData]);

  // the locations below are for the selection of locations for items like travel and vehicle 
  // the map is for physical location
  // LocalStorage
  useEffect(() => {
    if (initialData) return;
    const saved = localStorage.getItem("storeForm");
    if (saved) {
      try {
        const parsedForm: StoreForm = JSON.parse(saved);
        setForm(parsedForm);
        // Restore selected locations from companyLocations
        if (parsedForm.CompanyLocation) {
            setCurrentSelectedLocationIds(flattenCompanyLocationsToIds(parsedForm.CompanyLocation));
        }
      } catch (e) {
        console.error("Failed to parse stored form data:", e);
        localStorage.removeItem("storeForm");
      }
    }
  }, [initialData]);

    useEffect(() => {
    if (initialData) return;
    // Ensure companyLocations is always updated from selectedLocationsForDisplay
    // We need to convert SelectedLocation[] back to CompanyLocationType[] for storage
    const companyLocationsToSave: CompanyLocation[] = [];
    const collectCompanyLocations = (selectedLocs: SelectedLocation[]) => {
        selectedLocs.forEach(selectedLoc => {
            companyLocationsToSave.push({
              companyId: form.id || 'temp-company-id', // Use actual company ID or a temp one
              locationId: selectedLoc.id,
              visible: true, // Defaulting to true, adjust if you have UI for this
              sortOrder: 0,
              id: "",
              createdAt: null,
              updatedAt: null,
              displayName: null,
              addressLine1Override: null,
              addressLine2Override: null,
              cityOverride: null,
              stateOverride: null,
              postalCodeOverride: null,
              countryOverride: null,
              latitudeOverride: null,
              longitudeOverride: null
            });
            if (selectedLoc.children) {
                collectCompanyLocations(selectedLoc.children);
            }
        });
    };
    collectCompanyLocations(selectedLocationsForDisplay);

    const formToSave = {
        ...form,
        companyLocations: companyLocationsToSave,
    };
    localStorage.setItem("storeForm", JSON.stringify(formToSave));
  }, [form, initialData, selectedLocationsForDisplay]);// Add selectedLocationsForDisplay as dependency


  // Navigation guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Handlers

  // Inside CreateStoreForm.tsx, near other handlers:

const onUpdatePaymentSettings = useCallback(
  (updatedSettings: PaymentSettings) => {
    setForm((prevForm) => ({
      ...prevForm,
      // Merge with existing paymentSettings to preserve required fields (eg. id)
      paymentSettings: {
        ...prevForm.paymentSettings,
        ...updatedSettings,
      } as typeof prevForm.paymentSettings,
    }));
  },
  [] // No dependency needed if only using prevForm
);

  const handleChange = (
  e: ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
) => {
  const { name, type, value } = e.target;

  // when category changes, flag it:
  if (name === "category") {
    setCategoryChanged(true);
  }
  
  if (type === "checkbox") {
    // cast only inside the checkbox branch
    const checked = (e.target as HTMLInputElement).checked;
    setForm(f => ({ ...f, [name]: checked }));
    return;
  }

  if (name.startsWith("openingHours.")) {
    // …handle openingHours logic
     const [, dayKey, field] = name.split(".");
      setForm((f: any) => ({
        ...f,
        openingHours: {
          ...f.openingHours,
          [dayKey]: {
            ...f.openingHours[dayKey],
            [field]: value,
          },
        },
      }));
  } else {
    setForm(f => ({ ...f, [name]: value }));
  }
  };

  const onUpdateArray = <T,>(
    key: keyof StoreForm,
    idx: number,
    field: keyof T,
    value: any
  ) => {
    setForm((f) => {
      const arr = [...(f[key] as any)];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...f, [key]: arr };
    });
  };

  const onAddArray = <T,>(key: keyof StoreForm, item: T) => {
    setForm((f) => {
      const arr = Array.isArray(f[key]) ? (f[key] as T[]) : [];
      return { ...f, [key]: [...arr, item] };
    });
  };

  const onRemoveArray = (key: keyof StoreForm, idx: number) => {
    setForm((f) => {
      const arr = Array.isArray(f[key]) ? (f[key] as any[]) : [];
      return { ...f, [key]: arr.filter((_, i) => i !== idx) };
    });
  };

  const onToggleDay = (key: string) => {
    setForm((f) => {
      const day = (f.openingHours as any)?.[key] || { open: "", close: "" };
      const isClosed = !day.open && !day.close;
      const updated = isClosed
        ? { open: "09:00", close: "17:00" }
        : { open: "", close: "" };
      return {
        ...f,
        openingHours: {
          ...(f.openingHours as any),
          [key]: updated,
        },
      };
    });
  };

  //............................
// State is an object map for O(1) lookups: { [categoryId]: IStoreCategory }
type SelectedState = Record<string, IStoreCategory>;
// Assume `availableCategories` is your full list from props/API.
// Assume `form.StoreCategory` is your initial raw selected data.

// 1. Initializer function runs ONLY ONCE to set up the reducer's initial state.
// It normalizes the raw array from the form into our efficient object map.
const initializer = (rawSelected: IStoreCategory[]): SelectedState => {
    const initialState: SelectedState = {};
    for (const selection of rawSelected) {
        const catId = selection.categoryId;
        if (!catId) continue;

        // This handles potential duplicate categoryId entries from raw data by merging them.
        if (initialState[catId]) {
            const existing = initialState[catId];
            const subIds = new Set(existing.subcategories.map(s => s.id));
            selection.subcategories.forEach(sub => {
                if (!subIds.has(sub.id)) {
                    existing.subcategories.push(sub);
                }
            });
            const brandSet = new Set(existing.allBrands || []);
            (selection.allBrands || []).forEach(brand => {
                if (!brandSet.has(brand)) {
                    existing.allBrands.push(brand);
                }
            });
        } else {
            initialState[catId] = selection;
        }
    }
    return initialState;
};

// 2. Initialize the reducer.
const [selectedState, dispatch] = useReducer(categoryReducer, form.StoreCategory, initializer);

// 3. Create the memoized array of selected categories to pass to the child component and for form submission.
const selectedCategoriesArray = useMemo(() => Object.values(selectedState), [selectedState]);

  //............................
 

  // NEW: Handlers for LocationSelectionAccordion

  const onToggleLocation = useCallback(
  (location: ILocation, isSelected: boolean) => {
    setForm((prevForm) => {
      const newCompanyLocations = [...(prevForm.CompanyLocation || [])];
      const allLocationsMap = new Map(
        availableLocations.map((loc) => [loc.id, loc])
      );
      const idsToToggle = getAllDescendantIds(location, allLocationsMap);

      idsToToggle.forEach((locId) => {
        const existingIndex = newCompanyLocations.findIndex(
          (cl) => cl.locationId === locId
        );
        if (isSelected) {
          if (existingIndex === -1) {
            newCompanyLocations.push({
              companyId:
                prevForm.id || session?.user?.id || "temp-company-id",
              locationId: locId,
              visible: true,
              sortOrder: 0,
              id: "",
              createdAt: null,
              updatedAt: null,
              displayName: null,
              addressLine1Override: null,
              addressLine2Override: null,
              cityOverride: null,
              stateOverride: null,
              postalCodeOverride: null,
              countryOverride: null,
              latitudeOverride: null,
              longitudeOverride: null,
            });
          }
        } else {
          if (existingIndex !== -1) {
            newCompanyLocations.splice(existingIndex, 1);
          }
        }
      });

      return { ...prevForm, CompanyLocation: newCompanyLocations };
    });
  },
  [availableLocations, session?.user?.id]
  );

  const onBulkToggleLocations = useCallback((locationIds: string[]) => {
    setForm((prevForm) => {
      const existingCompanyLocationMap = new Map(
        (prevForm.CompanyLocation || []).map((cl) => [cl.locationId, cl])
      );

      const newCompanyLocations = locationIds.map((locId) => {
        return (
          existingCompanyLocationMap.get(locId) || {
            id: "",
            companyId: prevForm.id || "temp-company-id",
            locationId: locId,
            displayName: null,
            addressLine1Override: null,
            addressLine2Override: null,
            cityOverride: null,
            stateOverride: null,
            postalCodeOverride: null,
            countryOverride: null,
            latitudeOverride: null,
            longitudeOverride: null,
            sortOrder: 0,
            visible: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        );
      });

      return { ...prevForm, CompanyLocation: newCompanyLocations };
    });
  }, []);

  const setAddress = (address: string, geoLocation: GeoLocation) => {
    setForm((f) => ({ ...f, address, geoLocation }));
  };

  const onChangeSettings = (updated: Partial<StoreForm>) => {
    setForm((f) => ({ ...f, ...updated }));
  };

  // ----------------------------
  // Adapters for StoreProfileInfo
  // ----------------------------
  const handleArrayChange = (
    field: "partnerLogos",
    index: number,
    key: string,
    value: string | number
  ) => {
    switch (field) {
      case "partnerLogos":
        onUpdateArray<{ src: string; alt: string }>(
          field,
          index,
          key as keyof { src: string; alt: string },
          value
        );
        break;
    }
  };


  const addItem = (field: 'partnerLogos') => {
    let newItem: any = {};
    if (field === 'partnerLogos') newItem = { src: '', alt: '' };
    onAddArray(field as keyof StoreForm, newItem);
  };

  const removeItem = (field: 'partnerLogos', index: number) => {
    onRemoveArray(field as keyof StoreForm, index);
  };

  const handlers: Handlers = {
    onUpdatePaymentSettings, // You'll need to update your Handlers type definition
    handleChange,
    onUpdateArray,
    onAddArray,
    onRemoveArray,

    setAddress,
    onChangeSettings,
    
    onToggleDay,
    // Add these:
    handleArrayChange,
    addItem,
    removeItem,
    
    categoryDispatch: dispatch,

    onUpdateHeroSlide,
    onAddHeroSlide,

    onRemoveHeroSlide,
    handleSlideImageUpload,

    onUpdatePromotion,
    onAddPromotion,
    onRemovePromotion,

    onPromotionImageUpload,

    onAddPerk,
    onUpdatePerk,
    onRemovePerk,

    onAddTrustLogo,
    onUpdateTrustLogo,
    onRemoveTrustLogo,

    // Media (logo/banner)
    handleMediaUpload,
    handleMediaRemove,

    onToggleLocation,
    onBulkToggleLocations

  };

  // const next = () => setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  const next = () => setStepIndex((i) => Math.min(i + 1, allSteps.length));
  const prev = () => setStepIndex((i) => Math.max(i - 1, 0));
  

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI-related state
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState("");

  // AI Generation Functions
  const handleAiGenerate = async (section: string) => {
    if (!form.name || !form.category) {
      toast.error("Please fill in store name and category first");
      return;
    }

    setIsAiProcessing(true);
    setAiStatus(`Generating ${section} content...`);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          section,
          currentDescription: form.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "AI generation failed");
      }

      const data = await response.json();

      // Apply the generated content based on section
      if (section === "basic") {
        setForm((prev) => ({
          ...prev,
          tagline: data.tagline || prev.tagline,
          description: data.description || prev.description,
        }));
        toast.success("Basic info generated!");
      } else if (section === "seo") {
        setForm((prev) => ({
          ...prev,
          seo: {
            ...prev.seo,
            title: data.title || prev.seo.title,
            description: data.description || prev.seo.description,
            keywords: data.keywords || prev.seo.keywords,
          },
        }));
        toast.success("SEO metadata generated!");
      } else if (section === "pricing") {
        setForm((prev) => ({
          ...prev,
          pricingTiers: data.pricingTiers || prev.pricingTiers,
        }));
        toast.success("Pricing tiers generated!");
      } else if (section === "marketing") {
        const newHeroSlides = (data.heroSlides || []).map((slide: any) => ({
          id: "",
          companyId: form.id,
          imageUrl: slide.imageUrl || "",
          productImageUrl: null,
          headline: slide.headline || null,
          subline: slide.subline || null,
          ctaText: slide.ctaText || null,
          ctaLink: null,
          badgeText: null,
          price: null,
          endsAt: null,
          order: 0,
          iconKey: null,
          backgroundColor: null,
          textColor: null,
          videoLink: null,
          type: 'image' as const,
        }));

        const newPromotions = (data.promotions || []).map((promo: any) => ({
          id: "",
          title: promo.title || "",
          description: promo.description || "",
          companyId: form.id,
          startDate: null,
          endDate: null,
          isActive: false,
          featureDescription1: null,
          featureDescription2: null,
          featureDescription3: null,
          featureImage1: null,
          featureImage2: null,
          featureImage3: null,
          bannerUrl: null,
          ctaText: null,
          ctaLink: null,
          discount: null,
          perks: [],
          trustLogos: [],
        }));

        setForm((prev) => ({
          ...prev,
          heroSlides: [...prev.heroSlides, ...newHeroSlides],
          promotions: [...prev.promotions, ...newPromotions],
        }));
        toast.success("Marketing content generated!");
      } else if (section === "faqs") {
        const newFaqs = (data.faqs || []).map((faq: any) => ({
          question: faq.question || "",
          answer: faq.answer || "",
        }));
        setForm((prev) => ({
          ...prev,
          faqs: [...prev.faqs, ...newFaqs],
        }));
        toast.success("FAQs generated!");
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error(error.message || "Failed to generate AI content");
    } finally {
      setIsAiProcessing(false);
      setAiStatus("");
    }
  };

  const handleFullStoreAutopilot = async () => {
    if (!form.name || !form.category) {
      toast.error("Please fill in store name and category first");
      return;
    }

    setIsAiProcessing(true);

    try {
      // Generate basic info
      setAiStatus("✨ Crafting your store's personality...");
      await handleAiGenerate("basic");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate SEO
      setAiStatus("🔍 Optimizing for search engines...");
      await handleAiGenerate("seo");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate pricing if applicable
      const cat = form.category?.toLowerCase().trim() || "";
      if (SITE_CATEGORIES_WITH_PRICING.includes(cat)) {
        setAiStatus("💰 Setting your prices...");
        await handleAiGenerate("pricing");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Generate marketing
      setAiStatus("🎨 Designing your banner...");
      await handleAiGenerate("marketing");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate FAQs
      setAiStatus("❓ Creating helpful FAQs...");
      await handleAiGenerate("faqs");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("🎉 Store autopilot complete! Review your content.");
      
      // Jump to review step
      setStepIndex(allSteps.length);
    } catch (error: any) {
      console.error("Autopilot error:", error);
      toast.error("Autopilot encountered an error");
    } finally {
      setIsAiProcessing(false);
      setAiStatus("");
    }
  };

////////////////////////////////////////////////////////////////////////////////
// Upload helper for getting signed URLs and uploading files
////////////////////////////////////////////////////////////////////////////////
async function uploadFile(files: File[], type: "image" | "video" | "book") {
  console.log("Uploading files:", files);
  
  console.log("Starting upload for : ", type);

  if (!files?.length) return [];
  console.log("Starting upload for : ", type);

  const uploads = files.map(async (file, index) => {
    // 1. Request signed URL from your backend
    // const res = await fetch(
    //   `${API_URL}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}`
    // );

    const res = await fetch(
      `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
    );

    if (!res.ok) throw new Error("Failed to get signed URL");
    const { uploadUrl, publicUrl } = await res.json();

    // 2. Upload directly to S3 via PUT request
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
    });
    if (!uploadRes.ok) throw new Error("Upload failed");

    // 3. Return the public CloudFront/S3 URL
    return {
      // The original index is not needed here as we will re-index later
      url: publicUrl,
    };
  });

  return Promise.all(uploads);
}


const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (isSubmitting || !session?.user?.id) return;
  setIsSubmitting(true);

  const payload = { ...form };
  const uploadPromises: Promise<void>[] = [];

  console.log("🟢 Starting store upload sequence...");

  // --- Logo Upload ---
  if (logoFile) {
    uploadPromises.push(
      (async () => {
        const [{ url }] = await uploadFile([logoFile], "image");
        payload.logoUrl = url;
        setForm((prev) => ({ ...prev, logoUrl: url }));
        console.log("✅ Logo uploaded:", url);
      })()
    );
  }

  // --- Banner Upload ---
  if (bannerFile) {
    uploadPromises.push(
      (async () => {
        const [{ url }] = await uploadFile([bannerFile], "image");
        payload.bannerUrl = url;
        setForm((prev) => ({ ...prev, bannerUrl: url }));
        console.log("✅ Banner uploaded:", url);
      })()
    );
  }

  // --- Video Upload ---
  if (videoFile) {
    uploadPromises.push(
      (async () => {
        const [{ url }] = await uploadFile([videoFile], "video");
        payload.videoUrl = url;
        setForm((prev) => ({ ...prev, videoUrl: url }));
        console.log("✅ Video uploaded:", url);
      })()
    );
  }

  // --- Hero Slides ---
  heroSlideFiles.forEach((file, idx) => {
    if (file) {
      uploadPromises.push(
        (async () => {
          const [{ url }] = await uploadFile([file], "image");
          if (!payload.heroSlides) payload.heroSlides = [];

          const existing = payload.heroSlides[idx] || {};
          payload.heroSlides[idx] = { ...existing, imageUrl: url };

          setForm((prev) => {
            const slides = [...prev.heroSlides];
            slides[idx] = { ...slides[idx], imageUrl: url };
            return { ...prev, heroSlides: slides };
          });

          console.log(`✅ Hero slide ${idx + 1} image uploaded:`, url);
        })()
      );
    }
  });

  // --- Product Images for Hero Slides ---
  productImageFiles.forEach((file, idx) => {
    if (file) {
      uploadPromises.push(
        (async () => {
          const [{ url }] = await uploadFile([file], "image");
          if (!payload.heroSlides) payload.heroSlides = [];

          const existing = payload.heroSlides[idx] || {};
          payload.heroSlides[idx] = { ...existing, productImageUrl: url };

          setForm((prev) => {
            const slides = [...prev.heroSlides];
            slides[idx] = { ...slides[idx], productImageUrl: url };
            return { ...prev, heroSlides: slides };
          });

          console.log(`✅ Hero slide ${idx + 1} product image uploaded:`, url);
        })()
      );
    }
  });

  // --- Promotion Slides ---
  promotionSlideFiles.forEach((promoFiles: PromotionFiles, idx) => {
    if (!promoFiles) return;

    for (const field of ["bannerUrl","featureImage1","featureImage2","featureImage3"]) {
      const file = promoFiles[field as keyof PromotionFiles];
      if (file) {
        uploadPromises.push(
          (async () => {
            const [{ url }] = await uploadFile([file], "image");

            if (!payload.promotions) payload.promotions = [];
            const existing = payload.promotions[idx] || {};
            payload.promotions[idx] = { ...existing, [field]: url };

            setForm((prev) => {
              const promos = [...prev.promotions];
              promos[idx] = { ...promos[idx], [field]: url };
              return { ...prev, promotions: promos };
            });

            console.log(`✅ Promotion ${idx} field "${field}" uploaded:`, url);
          })()
        );
      }
    }
  });

  // promotionSlideFiles.forEach((file, idx) => {
  //   if (file) {
  //     uploadPromises.push(
  //       (async () => {
  //         const [{ url }] = await uploadFile([file], "image");
  //         if (!payload.promotions) payload.promotions = [];

  //         const existing = payload.promotions[idx] || {};
  //         payload.promotions[idx] = { ...existing, bannerUrl: url };

  //         setForm((prev) => {
  //           const promos = [...prev.promotions];
  //           promos[idx] = { ...promos[idx], bannerUrl: url };
  //           return { ...prev, promotions: promos };
  //         });

  //         console.log(`✅ Promotion slide ${idx + 1} uploaded:`, url);
  //       })()
  //     );
  //   }
  // });

  try {
    // Wait for uploads to complete
    await Promise.all(uploadPromises);
    console.log("🟢 All uploads complete. Saving store data...");

    const isEdit = Boolean(initialData?.id);
    const method = isEdit ? "PUT" : "POST";
    const apiStoresUrl = isEdit
      ? `${apiBaseUrl}/stores/${initialData!.id}`
      : `${apiBaseUrl}/stores`;

    const toSend = {
      ...payload,
      StoreCategory: selectedCategoriesArray,
      userId: session.user.id,
    };

    const res = await fetch(apiStoresUrl, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSend),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Save failed:", text);
      toast.error(`Error saving store: ${text}`);
      return;
    }

    let data = await res.json();
    console.log("🟢 Store data saved successfully:", data);

    console.log("✅ Store saved successfully!");
    toast.success(isEdit ? "Store updated successfully!" : "Store created!");
    router.push("/stores");
  } catch (err: any) {
    console.error("❌ Error uploading or saving store:", err);
    toast.error(`Error: ${err.message}`);
  } finally {
    setIsSubmitting(false);
    console.log("🟡 Submit finished.");
  }
};


  // Render step or review
  const StepContent = useMemo(() => {
    if (stepIndex < allSteps.length) {
      const currentStep = allSteps[stepIndex];
      const stepKey = currentStep.key;
      const stepContent = currentStep.render(
        form,
        handlers,
        availableCategories,
        availableLocations,
        selectedLocationsForDisplay,
        selectedCategoriesArray,
        dispatch
      );

      // Wrap content with AI buttons for specific steps
      const shouldShowAutopilot = stepKey === "basic";
      const shouldShowEnhance =
        stepKey === "seo" || stepKey === "pricingtiers" || stepKey === "marketing";

      if (shouldShowAutopilot || shouldShowEnhance) {
        return (
          <div className="relative">
            {stepContent}
            {/* AI Action Buttons */}
            <div className="mt-6 pt-6 border-t flex gap-3 flex-wrap">
              {shouldShowAutopilot && (
                <button
                  type="button"
                  onClick={handleFullStoreAutopilot}
                  disabled={isAiProcessing || !form.name || !form.category}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Magic Wand Autopilot
                </button>
              )}
              {shouldShowEnhance && (
                <button
                  type="button"
                  onClick={() => {
                    const sectionMap: Record<string, string> = {
                      seo: "seo",
                      pricingtiers: "pricing",
                      marketing: "marketing",
                    };
                    handleAiGenerate(sectionMap[stepKey] || stepKey);
                  }}
                  disabled={isAiProcessing || !form.name || !form.category}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Enhance with AI
                </button>
              )}
            </div>
          </div>
        );
      }

      return stepContent;
    }
  
    // Review screen
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Review Your Store</h2>
        {allSteps.map((s: any, i: number) => (
          <div
            key={s.key}
            className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => setStepIndex(i)}
          >
            <h3 className="font-medium mb-2 flex justify-between items-center">
              <span>{s.title}</span>
              <span className="text-xs text-indigo-500">Edit ➔</span>
            </h3>
            <div className="text-gray-700">{renderReviewContent(s.key, form)}</div>
          </div>
        ))}
      </div>
    );
  }, [
    stepIndex,
    allSteps,
    form,
    handlers,
    availableCategories,
    availableLocations,
    selectedLocationsForDisplay,
    selectedCategoriesArray,
    dispatch,
    isAiProcessing,
    handleAiGenerate,
    handleFullStoreAutopilot,
  ]);
  
  const currentTitle =
    stepIndex < allSteps.length ? allSteps[stepIndex].title : "Review & Submit";
  const percent = Math.min(((stepIndex + 1) / totalSteps) * 100, 100);
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
    {/* Full-Page Submitting Overlay - Enhanced Version */}
    {isSubmitting && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-700 to-purple-800 bg-opacity-95 backdrop-blur-md"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.5,
            type: "spring",
            stiffness: 100,
          }}
          className="bg-white p-10 rounded-xl shadow-2xl flex flex-col items-center max-w-sm text-center transform scale-105"
        >
          {/* Advanced Spinner: Concentric Circles */}
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-t-4 border-indigo-200 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-2 border-4 border-r-4 border-indigo-400 rounded-full animate-spin-medium"></div>
            <div className="absolute inset-4 border-4 border-b-4 border-indigo-600 rounded-full animate-spin-fast"></div>
          </div>

          <p className="text-2xl font-bold text-gray-900 mb-2 leading-snug">
            Just a moment, we're uploading...
          </p>
          <p className="text-md text-gray-600 font-medium">
            Please hold tight! We're preparing everything for you.
          </p>
          <p className="text-sm text-gray-400 mt-4 animate-pulse">
            This might take a moment, grab a coffee!
          </p>
        </motion.div>
      </motion.div>
    )}

    {/* AI Processing Overlay */}
    {isAiProcessing && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 bg-opacity-95 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.4,
            type: "spring",
            stiffness: 120,
          }}
          className="bg-white p-10 rounded-2xl shadow-2xl flex flex-col items-center max-w-md text-center"
        >
          {/* AI Sparkles Icon */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          >
            <SparklesIcon className="w-12 h-12 text-white" />
          </motion.div>

          <p className="text-2xl font-bold text-gray-900 mb-3 leading-snug">
            AI Magic in Progress...
          </p>
          <motion.p
            key={aiStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-gray-700 font-medium mb-2"
          >
            {aiStatus}
          </motion.p>
          <p className="text-sm text-gray-500 mt-2">
            Sit back and relax while AI creates amazing content for you
          </p>

          {/* Progress dots */}
          <div className="flex gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-3 h-3 bg-purple-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    )}

    {/* Mobile Top Bar with Step Info - REMAINS FOR MOBILE CONTEXT */}
    <div className="md:hidden bg-indigo-600 text-white py-2 px-4 flex justify-between items-center shadow-sm sticky top-0 z-30">
      <span className="font-medium text-sm">
        Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
      </span>
      <span className="text-xs truncate max-w-[60%]">{currentTitle}</span>
    </div>

    {/* Sidebar - ANIMATED */}
    <motion.aside
      className="hidden md:flex w-64 flex-col bg-white shadow-lg p-4 sticky top-0 h-screen z-10 overflow-hidden" // Added overflow-hidden
      initial={false} // Prevents animation on initial load
      animate={{
        width: stepIndex > 0 ? "16rem" : "0rem", // 16rem = w-64
        padding: stepIndex > 0 ? "1rem" : "0rem", // 1rem = p-4
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <h2 className="text-xl font-semibold mb-6 text-indigo-700">
        Setup Wizard
      </h2>
      <nav className="flex flex-col gap-4 overflow-y-auto">
        {allSteps.map((s, i) => {
          const completed = i < stepIndex;
          const active = i === stepIndex;
          return (
            <button
              key={s.key}
              onClick={() => setStepIndex(i)}
              className={`flex items-center gap-3 p-3 rounded-lg transition
                ${completed ? "bg-green-100 text-green-800" : ""}
                ${
                  active
                    ? "bg-indigo-100 text-indigo-800 font-medium shadow-inner"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm
                    ${
                      completed
                        ? "bg-green-600 text-white"
                        : active
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-200 text-indigo-700"
                    }`}
              >
                {completed ? <CheckCircleIcon className="w-4 h-4" /> : i + 1}
              </span>
              <span className="text-sm">{s.title}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setStepIndex(allSteps.length)}
          className={`flex items-center gap-3 p-3 rounded-lg transition
              ${
                stepIndex === allSteps.length
                  ? "bg-green-100 text-green-800"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-full text-sm bg-green-200 text-green-700">
            ✔
          </span>
          <span className="text-sm">Review</span>
        </button>
      </nav>
    </motion.aside>

    {/* Main Content - CLASS ADJUSTMENT MADE */}
    <main className="flex-1 flex flex-col py-6 relative">
      
      {/* Progress Bar & Step Info - ANIMATED WRAPPER */}
      <motion.div
        className="overflow-hidden" // Clips content while height is 0
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: stepIndex > 0 ? "auto" : 0,
          opacity: stepIndex > 0 ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Progress Bar */}
        <div className="relative mb-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="absolute inset-0 flex justify-between items-center px-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => setStepIndex(i)}
                className={`w-3 h-3 rounded-full focus:outline-none
                      ${
                        i <= stepIndex
                          ? "bg-indigo-600"
                          : "bg-white border border-gray-300"
                      }`}
              />
            ))}
          </div>
        </div>

        {/* Step Info (Desktop only) */}
        <div className="hidden md:flex justify-between mb-2 text-sm text-gray-500">
          <span>
            Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
          </span>
          <span>{currentTitle}</span>
        </div>
      </motion.div>

      {/* Step Content */}
      <div className="bg-white flex-1 overflow-auto min-h-[60vh]">
        {StepContent}
      </div>

      {/* Navigation Buttons (Sticky on Mobile) */}
      <div className="sticky bottom-0 bg-white border-t pt-3 mt-6 flex justify-between px-4 sm:px-6 py-3 md:static md:bg-transparent md:border-0 md:pt-6">
        <button
          type="button"
          disabled={stepIndex === 0}
          onClick={prev}
          className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 text-sm"
        >
          ← Back
        </button>

        {stepIndex < allSteps.length ? (
          <button
            type="button"
            onClick={next}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
          >
            {isSubmitting ? "Uploading..." : "Submit Store"}
          </button>
        )}
      </div>
    </main>
  </div>
  );
}

// Helper to render review info for each step

const ReviewSection = ({ title, children }: any) => (
  <div className="bg-white shadow-sm rounded-lg p-4 space-y-2">
    <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
      {title}
    </h3>
    <div>{children}</div>
  </div>
);

const EmptyState = ({ message }: any) => (
  <em className="text-gray-400 italic">{message}</em>
);

const renderList = (items: any, renderItem: any, emptyMessage = "No items") =>
  items && items.length > 0 ? (
    <ul className="list-disc list-inside space-y-1">{items.map(renderItem)}</ul>
  ) : (
    <EmptyState message={emptyMessage} />
  );

const renderJSON = (data: any, emptyMessage = "No data") =>
  data && Object.keys(data).length > 0 ? (
    <pre className="bg-gray-50 text-xs p-3 rounded overflow-x-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  ) : (
    <EmptyState message={emptyMessage} />
  );

const renderReviewContent = (stepKey: any, form: any) => {
  switch (stepKey) {
    case "businesscategory":
      return (
        <ReviewSection title="Business Category">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Name:</strong>{" "}
              {form.category || <EmptyState message="Not set" />}
            </div>
          </div>
        </ReviewSection>
      );

      
    case 'storeLocations': return <p>{form.CompanyLocation?.map((l:any) => l.name).join(', ')}</p>; // New review content

    case "basic":
      return (
        <ReviewSection title="Basic Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Name:</strong>{" "}
              {form.name || <EmptyState message="Not set" />}
            </div>
            <div>
              <strong>Slug:</strong>{" "}
              {form.slug || <EmptyState message="Not set" />}
            </div>
            <div>
              <strong>Domain:</strong>{" "}
              {form.domain || <EmptyState message="Not set" />}
            </div>
            <div>
              <strong>Tagline:</strong>{" "}
              {form.tagline || <EmptyState message="Not set" />}
            </div>
            <div className="sm:col-span-2">
              <strong>Description:</strong>{" "}
              {form.description || <EmptyState message="Not set" />}
            </div>
          </div>
        </ReviewSection>
      );

    case "categories":
      return (
        <ReviewSection title="Categories">
          {renderList(
            form.storeCategories,
            (cat: any) => (
              <li key={cat.id}>{cat.displayName}</li>
            ),
            "No categories"
          )}
        </ReviewSection>
      );

    case "branding":
      return (
        <ReviewSection title="Branding">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex-shrink-0">
              <p className="font-medium mb-1">Logo</p>
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt="Logo"
                  className="h-16 w-16 object-cover rounded-md shadow"
                />
              ) : (
                <EmptyState message="Not uploaded" />
              )}
            </div>
            <div className="flex-shrink-0">
              <p className="font-medium mb-1">Banner</p>
              {form.bannerUrl ? (
                <img
                  src={form.bannerUrl}
                  alt="Banner"
                  className="h-16 w-32 object-cover rounded-md shadow"
                />
              ) : (
                <EmptyState message="Not uploaded" />
              )}
            </div>
          </div>
        </ReviewSection>
      );

    case "touchpoints":
      return (
        <ReviewSection title="Contact & Hours">
          <div className="space-y-2 text-sm">
            <div>
              <strong>Email:</strong>{" "}
              {form.contactEmail || <EmptyState message="Not set" />}
            </div>
            <div>
              <strong>Phone:</strong>{" "}
              {form.contactPhone || <EmptyState message="Not set" />}
            </div>
            <div>
              <strong>Opening Hours:</strong>
              {Object.keys(form.openingHours || {}).length > 0 ? (
                <ul className="list-disc list-inside ml-4 mt-1">
                  {Object.entries(form.openingHours).map(([day, hrs]) => {
                    const { open, close } = hrs as {
                      open: string;
                      close: string;
                    };
                    const display =
                      open && close ? `${open} – ${close}` : "Closed";
                    // Capitalize day label (Monday, Tuesday, etc.)
                    const label = day.charAt(0).toUpperCase() + day.slice(1);
                    return (
                      <li key={day}>
                        <span className="font-medium">{label}:</span> {display}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState message="Not set" />
              )}
            </div>
          </div>
        </ReviewSection>
      );

    case "location":
      return (
        <ReviewSection title="Location">
          <div className="space-y-1 text-sm">
            <div>
              <strong>Address:</strong>{" "}
              {form.address || <EmptyState message="Not set" />}
            </div>
            {form.geoLocation ? (
              <div>
                <strong>Coordinates:</strong> {form.geoLocation.lat},{" "}
                {form.geoLocation.lng}
              </div>
            ) : null}
          </div>
        </ReviewSection>
      );

    case "social":
      return (
        <ReviewSection title="Social Links">
          {renderList(
            form.socialLinks,
            (link: any, i: any) => (
              <li key={i}>
                <strong>{link.channel}:</strong>{" "}
                <a
                  href={link.url}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.url}
                </a>
              </li>
            ),
            "No social links"
          )}
        </ReviewSection>
      );

    case "content":
      return (
        <ReviewSection title="Policies & Content">
          {renderList(
            form.policies,
            (policy: any, i: any) => (
              <li key={i}>
                <strong>{policy.type}:</strong> {policy.content}
              </li>
            ),
            "No policies"
          )}
        </ReviewSection>
      );

    case "awards":
      return (
        <ReviewSection title="Awards">
          {renderList(
            form.awards,
            (award: any, i: any) => (
              <li key={i}>{award.name}</li>
            ),
            "No awards"
          )}
        </ReviewSection>
      );

    case "metrics":
      return (
        <ReviewSection title="Metrics">
          {renderList(
            form.metrics,
            (m: any, i: any) => (
              <li key={i}>
                <strong>{m.label}:</strong> {m.value}
              </li>
            ),
            "No metrics"
          )}
        </ReviewSection>
      );

    case "stats":
      return (
        <ReviewSection title="Statistics">
          {renderList(
            form.stats,
            (s: any, i: any) => (
              <li key={i}>
                <strong>{s.label}:</strong> {s.value}
              </li>
            ),
            "No statistics"
          )}
        </ReviewSection>
      );

    case "faqs":
      return (
        <ReviewSection title="FAQs">
          {form.faqs && form.faqs.length > 0 ? (
            form.faqs.map((faq: any, i: any) => (
              <div key={i} className="space-y-1 text-sm">
                <p className="font-semibold">Q: {faq.question}</p>
                <p className="ml-4">A: {faq.answer}</p>
              </div>
            ))
          ) : (
            <EmptyState message="No FAQs" />
          )}
        </ReviewSection>
      );

    case "testimonials":
      return (
        <ReviewSection title="Testimonials">
          {form.testimonials && form.testimonials.length > 0 ? (
            form.testimonials.map((t: any, i: any) => (
              <blockquote
                key={i}
                className="border-l-2 pl-4 italic text-gray-600"
              >
                “{t.quote}” — {t.author}
              </blockquote>
            ))
          ) : (
            <EmptyState message="No testimonials" />
          )}
        </ReviewSection>
      );

    case "marketing":
      return (
        <ReviewSection title="Hero Slides">
          {renderList(
            form.heroSlides,
            (slide: any, i: any) => (
              <li key={i}>{slide.headline || "Untitled slide"}</li>
            ),
            "No slides"
          )}
        </ReviewSection>
      );

    case "promotions":
      return (
        <ReviewSection title="Promotions">
          {renderList(
            form.promotions,
            (promo: any, i: any) => (
              <li key={i}>{promo.title}</li>
            ),
            "No promotions"
          )}
        </ReviewSection>
      );

    case "seo":
      return (
        <ReviewSection title="SEO Settings">
          {renderJSON(form.seo, "No SEO settings")}
        </ReviewSection>
      );

    case "theme":
      return (
        <ReviewSection title="Theme Settings">
          {renderJSON(form.themeSettings, "No theme settings")}
        </ReviewSection>
      );

    case "analytics":
      return (
        <ReviewSection title="Analytics Config">
          {renderJSON(form.analyticsConfig, "No analytics config")}
        </ReviewSection>
      );

    case "payment":
      return (
        <ReviewSection title="Payment Settings">
          {renderJSON(form.paymentSettings, "No payment settings")}
        </ReviewSection>
      );

    case "shipping":
      return (
        <ReviewSection title="Shipping Settings">
          {renderJSON(form.shippingSettings, "No shipping settings")}
        </ReviewSection>
      );

    default:
      return (
        <p className="text-sm text-gray-500">
          No data available for this section.
        </p>
      );
  }
};
