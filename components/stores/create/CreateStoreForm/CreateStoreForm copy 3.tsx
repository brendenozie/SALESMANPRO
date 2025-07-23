"use client";

import React, {
  useState,
  useEffect,
  //... other imports
} from "react";
// ...
// Import the new utility function
import { getCategoryDefaultData } from "@/lib/defaultStoreData"; 

// ... (rest of imports)

export default function CreateStoreForm({
  availableCategories,
  initialData,
}: Props) {
  // ... (defaultForm, useState, and other hooks remain the same)
  const { data: session } = useSession();
  const router = useRouter();

  const defaultForm: StoreForm = {
    // ... your full defaultForm object
    id: "",
    name: "",
    slug: "",
    domain: "",
    hasWebsite: false,
    tagline: "",
    description: "",
    category: "E-commerce",
    logoUrl: "",
    bannerUrl: "",
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
    socialLinks: [],
    policies: [],
    faqs: [],
    testimonials: [],
    heroSlides: [],
    promotions: [],
    storeCategories: [],
    currency: 'USD',
    locale: 'en-US',
    companyCategoryId: undefined,
    pageSections: [],
    appPromos: [],
    collections: [],

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

    themeSettings: {},
    seo: {},
    analyticsConfig: {},
    paymentSettings: {},
    shippingSettings: {},
    marketplaceListings: [], 
    events: [],
    announcements: []
  };

  const [form, setForm] = useState<StoreForm>(
    initialData ? { ...defaultForm, ...initialData } : defaultForm
  );
  
  // ADD THIS useEffect hook to handle category changes
  const [categoryChanged, setCategoryChanged] = useState(false);

  useEffect(() => {
    // Don't run on initial load or in edit mode
    if (!categoryChanged || initialData) return;

    // Get the sample data for the newly selected category
    const sampleData = getCategoryDefaultData(form.category);

    // Merge the sample data into the form state
    // This preserves basic info like 'name' and 'slug' while updating
    // content arrays like 'faqs', 'heroSlides', etc.
    setForm(prevForm => ({
      ...prevForm,
      ...sampleData,
    }));

    // Reset the flag
    setCategoryChanged(false);

  }, [form.category, categoryChanged, initialData]);

  // UPDATE your existing handleChange function to track category changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { // Allow HTMLSelectElement
    const { name, type, value } = e.target;
    
    // Check if the element is a checkbox
    const isCheckbox = type === 'checkbox' && e.target instanceof HTMLInputElement;
    const checked = isCheckbox ? e.target.checked : false;

    // If the category is changing, set the flag
    if (name === "category") {
      setCategoryChanged(true);
    }
    
    if (name.startsWith("openingHours.")) {
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
      setForm((f: any) => ({
        ...f,
        [name]: isCheckbox ? checked : value,
      }));
    }
  };

  // ... (the rest of your component logic)
  const handlers: Handlers = {
    handleChange, // Ensure the new handleChange is passed down
    // ... other handlers
  };
}